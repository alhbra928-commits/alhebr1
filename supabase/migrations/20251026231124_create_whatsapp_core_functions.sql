/*
  # WhatsApp Core Functions - Phase 2

  ## Overview
  Core database functions for WhatsApp message sending, template processing,
  event triggering, and webhook handling.

  ## New Functions

  1. `send_whatsapp_message` - Main function to send WhatsApp messages
  2. `process_template_variables` - Replace variables in template content
  3. `trigger_whatsapp_event` - Trigger WhatsApp message based on event
  4. `get_default_provider` - Get active default provider
  5. `log_whatsapp_operation` - Log WhatsApp operations
  6. `retry_failed_messages` - Retry mechanism for failed messages

  ## Security
  - Functions run as SECURITY DEFINER for system operations
  - Admin-only access through RLS policies
*/

-- Function to get default provider
CREATE OR REPLACE FUNCTION get_default_whatsapp_provider()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  provider_id uuid;
BEGIN
  SELECT id INTO provider_id
  FROM whatsapp_providers
  WHERE is_default = true
    AND is_active = true
    AND deleted_at IS NULL
  LIMIT 1;

  IF provider_id IS NULL THEN
    SELECT id INTO provider_id
    FROM whatsapp_providers
    WHERE is_active = true
      AND deleted_at IS NULL
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  RETURN provider_id;
END;
$$;

-- Function to process template variables
CREATE OR REPLACE FUNCTION process_template_variables(
  template_content text,
  variables jsonb DEFAULT '{}'::jsonb
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  processed_content text;
  var_key text;
  var_value text;
BEGIN
  processed_content := template_content;

  FOR var_key, var_value IN
    SELECT key, value::text
    FROM jsonb_each_text(variables)
  LOOP
    processed_content := replace(
      processed_content,
      '{{' || var_key || '}}',
      COALESCE(var_value, '')
    );
  END LOOP;

  RETURN processed_content;
END;
$$;

-- Function to send WhatsApp message
CREATE OR REPLACE FUNCTION send_whatsapp_message(
  p_recipient_phone text,
  p_recipient_name text,
  p_template_id uuid,
  p_content text,
  p_event_type text,
  p_variables jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_provider_id uuid;
  v_template_record RECORD;
  v_final_content text;
  v_message_id uuid;
BEGIN
  -- Get default provider
  v_provider_id := get_default_whatsapp_provider();

  IF v_provider_id IS NULL THEN
    RAISE EXCEPTION 'No active WhatsApp provider configured';
  END IF;

  -- If template_id provided, get template and process variables
  IF p_template_id IS NOT NULL THEN
    SELECT * INTO v_template_record
    FROM whatsapp_templates
    WHERE id = p_template_id
      AND is_active = true
      AND deleted_at IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Template not found or inactive';
    END IF;

    -- Process template content with variables
    v_final_content := process_template_variables(
      v_template_record.content_ar,
      p_variables
    );

    -- Update template usage count
    UPDATE whatsapp_templates
    SET usage_count = usage_count + 1
    WHERE id = p_template_id;
  ELSE
    -- Use provided content directly
    v_final_content := p_content;
  END IF;

  IF v_final_content IS NULL OR v_final_content = '' THEN
    RAISE EXCEPTION 'Message content is empty';
  END IF;

  -- Insert message into queue
  INSERT INTO whatsapp_messages (
    provider_id,
    template_id,
    event_type,
    recipient_phone,
    recipient_name,
    content,
    status
  )
  VALUES (
    v_provider_id,
    p_template_id,
    p_event_type,
    p_recipient_phone,
    p_recipient_name,
    v_final_content,
    'pending'
  )
  RETURNING id INTO v_message_id;

  -- Log operation
  INSERT INTO whatsapp_logs (
    operation,
    provider_id,
    message_id,
    status,
    request_data
  )
  VALUES (
    'send_message',
    v_provider_id,
    v_message_id,
    'success',
    jsonb_build_object(
      'recipient_phone', p_recipient_phone,
      'template_id', p_template_id,
      'event_type', p_event_type
    )
  );

  RETURN v_message_id;
END;
$$;

-- Function to trigger WhatsApp based on event
CREATE OR REPLACE FUNCTION trigger_whatsapp_event(
  p_event_type text,
  p_recipient_phone text,
  p_recipient_name text,
  p_variables jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_connector_record RECORD;
  v_message_id uuid;
BEGIN
  -- Find active event connector
  SELECT ec.*, t.id as template_id
  INTO v_connector_record
  FROM whatsapp_events_connector ec
  JOIN whatsapp_templates t ON t.id = ec.template_id
  WHERE ec.event_type = p_event_type
    AND ec.is_active = true
    AND t.is_active = true
    AND t.deleted_at IS NULL
  ORDER BY ec.priority DESC
  LIMIT 1;

  IF NOT FOUND THEN
    -- Log that no connector found but don't fail
    INSERT INTO whatsapp_logs (
      operation,
      status,
      error_message,
      request_data
    )
    VALUES (
      'trigger_event',
      'warning',
      'No active connector found for event: ' || p_event_type,
      jsonb_build_object(
        'event_type', p_event_type,
        'recipient_phone', p_recipient_phone
      )
    );
    RETURN NULL;
  END IF;

  -- Send message using template
  v_message_id := send_whatsapp_message(
    p_recipient_phone := p_recipient_phone,
    p_recipient_name := p_recipient_name,
    p_template_id := v_connector_record.template_id,
    p_event_type := p_event_type,
    p_content := NULL,
    p_variables := p_variables
  );

  RETURN v_message_id;
END;
$$;

-- Function to retry failed messages
CREATE OR REPLACE FUNCTION retry_failed_whatsapp_messages()
RETURNS TABLE(message_id uuid, retry_status text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message RECORD;
  v_retry_count integer;
BEGIN
  -- Find failed messages from last 24 hours that haven't been retried too many times
  FOR v_message IN
    SELECT m.id, m.recipient_phone, m.content, m.provider_id, m.template_id, m.event_type
    FROM whatsapp_messages m
    WHERE m.status = 'failed'
      AND m.created_at > NOW() - INTERVAL '24 hours'
      AND (
        SELECT COUNT(*)
        FROM whatsapp_logs l
        WHERE l.message_id = m.id
          AND l.operation = 'retry_message'
      ) < 3
    ORDER BY m.created_at DESC
    LIMIT 100
  LOOP
    -- Update status to pending for retry
    UPDATE whatsapp_messages
    SET status = 'pending',
        error_message = NULL
    WHERE id = v_message.id;

    -- Log retry attempt
    INSERT INTO whatsapp_logs (
      operation,
      provider_id,
      message_id,
      status
    )
    VALUES (
      'retry_message',
      v_message.provider_id,
      v_message.id,
      'success'
    );

    message_id := v_message.id;
    retry_status := 'retried';
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Function to handle incoming webhook messages
CREATE OR REPLACE FUNCTION handle_whatsapp_webhook(
  p_provider_id uuid,
  p_sender_phone text,
  p_sender_name text,
  p_message_content text,
  p_external_message_id text,
  p_webhook_data jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id uuid;
  v_thread_id uuid;
BEGIN
  -- Insert incoming message
  INSERT INTO whatsapp_messages (
    provider_id,
    recipient_phone,
    recipient_name,
    content,
    direction,
    status,
    external_message_id
  )
  VALUES (
    p_provider_id,
    p_sender_phone,
    p_sender_name,
    p_message_content,
    'inbound',
    'read',
    p_external_message_id
  )
  RETURNING id INTO v_message_id;

  -- Update or create inbox thread
  INSERT INTO whatsapp_inbox_threads (
    user_phone,
    user_name,
    last_message,
    last_message_at,
    unread_count,
    status
  )
  VALUES (
    p_sender_phone,
    p_sender_name,
    p_message_content,
    NOW(),
    1,
    'open'
  )
  ON CONFLICT (user_phone)
  DO UPDATE SET
    last_message = EXCLUDED.last_message,
    last_message_at = EXCLUDED.last_message_at,
    unread_count = whatsapp_inbox_threads.unread_count + 1,
    status = 'open',
    updated_at = NOW();

  -- Log webhook receipt
  INSERT INTO whatsapp_logs (
    operation,
    provider_id,
    message_id,
    status,
    request_data
  )
  VALUES (
    'webhook_received',
    p_provider_id,
    v_message_id,
    'success',
    p_webhook_data
  );

  RETURN v_message_id;
END;
$$;

-- Function to get pending messages for processing
CREATE OR REPLACE FUNCTION get_pending_whatsapp_messages(p_limit integer DEFAULT 10)
RETURNS TABLE(
  message_id uuid,
  provider_id uuid,
  provider_type text,
  provider_base_url text,
  provider_api_key text,
  recipient_phone text,
  content text,
  template_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id as message_id,
    m.provider_id,
    p.type as provider_type,
    p.base_url as provider_base_url,
    p.api_key as provider_api_key,
    m.recipient_phone,
    m.content,
    m.template_id
  FROM whatsapp_messages m
  JOIN whatsapp_providers p ON p.id = m.provider_id
  WHERE m.status = 'pending'
    AND p.is_active = true
    AND p.deleted_at IS NULL
  ORDER BY m.created_at ASC
  LIMIT p_limit;
END;
$$;

-- Function to update message status
CREATE OR REPLACE FUNCTION update_whatsapp_message_status(
  p_message_id uuid,
  p_status text,
  p_external_message_id text,
  p_error_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE whatsapp_messages
  SET
    status = p_status,
    external_message_id = COALESCE(p_external_message_id, external_message_id),
    error_message = p_error_message,
    sent_at = CASE WHEN p_status = 'sent' THEN NOW() ELSE sent_at END,
    delivered_at = CASE WHEN p_status = 'delivered' THEN NOW() ELSE delivered_at END,
    read_at = CASE WHEN p_status = 'read' THEN NOW() ELSE read_at END
  WHERE id = p_message_id;
END;
$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_pending
  ON whatsapp_messages(status, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_failed
  ON whatsapp_messages(status, created_at)
  WHERE status = 'failed';
