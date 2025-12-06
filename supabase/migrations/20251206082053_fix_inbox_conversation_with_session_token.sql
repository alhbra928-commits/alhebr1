/*
  # إصلاح مشكلة ظهور ردود الموظف في المحادثات

  ## المشكلة
  عندما يرسل الموظف رد للزائر، كانت رسالة الموظف لا تظهر في المحادثة.

  ## الحل
  1. إضافة session_token لربط جميع رسائل المحادثة الواحدة
  2. تحديث دالة send_whatsapp_message لإضافة session_token
  3. إضافة triggers للتحديث التلقائي لـ inbox_threads
  4. تحديث الرسائل القديمة

  ## التغييرات
  1. إضافة حقل session_token إلى whatsapp_messages
  2. إضافة indexes للأداء
  3. تحديث دالة send_whatsapp_message
  4. إضافة triggers للتحديث التلقائي
  5. تحديث البيانات القديمة
*/

-- 1. إضافة عمود session_token
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_messages'
    AND column_name = 'session_token'
  ) THEN
    ALTER TABLE whatsapp_messages
    ADD COLUMN session_token text;
  END IF;
END $$;

-- 2. إضافة indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session_token
ON whatsapp_messages(session_token);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session_source
ON whatsapp_messages(session_token, source_type, created_at DESC);

-- 3. تحديث دالة send_whatsapp_message لإضافة session_token
CREATE OR REPLACE FUNCTION public.send_whatsapp_message(
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
AS $function$
DECLARE
  v_provider_id uuid;
  v_template_record RECORD;
  v_final_content text;
  v_message_id uuid;
BEGIN
  v_provider_id := get_default_whatsapp_provider();

  IF v_provider_id IS NULL THEN
    RAISE EXCEPTION 'No active WhatsApp provider configured';
  END IF;

  IF p_template_id IS NOT NULL THEN
    SELECT * INTO v_template_record
    FROM whatsapp_templates
    WHERE id = p_template_id
    AND is_active = true
    AND deleted_at IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Template not found or inactive';
    END IF;

    v_final_content := process_template_variables(
      v_template_record.content_ar,
      p_variables
    );

    UPDATE whatsapp_templates
    SET usage_count = usage_count + 1
    WHERE id = p_template_id;
  ELSE
    v_final_content := p_content;
  END IF;

  IF v_final_content IS NULL OR v_final_content = '' THEN
    RAISE EXCEPTION 'Message content is empty';
  END IF;

  INSERT INTO whatsapp_messages (
    provider_id,
    template_id,
    event_type,
    recipient_phone,
    recipient_name,
    content,
    status,
    session_token
  )
  VALUES (
    v_provider_id,
    p_template_id,
    p_event_type,
    p_recipient_phone,
    p_recipient_name,
    v_final_content,
    'pending',
    p_recipient_phone
  )
  RETURNING id INTO v_message_id;

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
      'event_type', p_event_type,
      'session_token', p_recipient_phone
    )
  );

  RETURN v_message_id;
END;
$function$;

-- 4. إنشاء trigger لتحديث inbox_threads عند رد الموظف
CREATE OR REPLACE FUNCTION update_inbox_thread_on_staff_reply()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.direction = 'outbound' AND NEW.session_token IS NOT NULL THEN
    UPDATE whatsapp_inbox_threads
    SET
      has_staff_reply = true,
      last_staff_reply_at = NEW.created_at,
      awaiting_staff_reply = false,
      staff_reply_count = COALESCE(staff_reply_count, 0) + 1,
      last_message = NEW.content,
      last_message_at = NEW.created_at,
      updated_at = NOW()
    WHERE user_phone = NEW.session_token;

    IF NOT FOUND THEN
      INSERT INTO whatsapp_inbox_threads (
        user_phone,
        user_name,
        last_message,
        last_message_at,
        unread_count,
        status,
        has_staff_reply,
        last_staff_reply_at,
        awaiting_staff_reply,
        staff_reply_count
      ) VALUES (
        NEW.session_token,
        NEW.recipient_name,
        NEW.content,
        NEW.created_at,
        0,
        'open',
        true,
        NEW.created_at,
        false,
        1
      )
      ON CONFLICT (user_phone) DO UPDATE
      SET
        has_staff_reply = true,
        last_staff_reply_at = NEW.created_at,
        awaiting_staff_reply = false,
        staff_reply_count = COALESCE(whatsapp_inbox_threads.staff_reply_count, 0) + 1,
        last_message = NEW.content,
        last_message_at = NEW.created_at,
        updated_at = NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_inbox_on_staff_reply ON whatsapp_messages;
CREATE TRIGGER trigger_update_inbox_on_staff_reply
  AFTER INSERT ON whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_inbox_thread_on_staff_reply();

-- 5. إنشاء trigger للرسائل الواردة
CREATE OR REPLACE FUNCTION update_inbox_thread_on_inbound_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.direction = 'inbound' AND NEW.session_token IS NOT NULL THEN
    UPDATE whatsapp_inbox_threads
    SET
      awaiting_staff_reply = true,
      last_message = NEW.content,
      last_message_at = NEW.created_at,
      unread_count = COALESCE(unread_count, 0) + 1,
      updated_at = NOW()
    WHERE user_phone = NEW.session_token;

    IF NOT FOUND THEN
      INSERT INTO whatsapp_inbox_threads (
        user_phone,
        user_name,
        last_message,
        last_message_at,
        unread_count,
        status,
        has_staff_reply,
        awaiting_staff_reply,
        staff_reply_count
      ) VALUES (
        NEW.session_token,
        NEW.recipient_name,
        NEW.content,
        NEW.created_at,
        1,
        'open',
        false,
        true,
        0
      )
      ON CONFLICT (user_phone) DO UPDATE
      SET
        awaiting_staff_reply = true,
        last_message = NEW.content,
        last_message_at = NEW.created_at,
        unread_count = COALESCE(whatsapp_inbox_threads.unread_count, 0) + 1,
        updated_at = NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_inbox_on_inbound ON whatsapp_messages;
CREATE TRIGGER trigger_update_inbox_on_inbound
  AFTER INSERT ON whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_inbox_thread_on_inbound_message();

-- 6. تحديث الرسائل القديمة لإضافة session_token
UPDATE whatsapp_messages
SET session_token = recipient_phone
WHERE session_token IS NULL
  AND direction = 'outbound'
  AND recipient_phone != 'system';

UPDATE whatsapp_messages
SET session_token = 'system'
WHERE session_token IS NULL
  AND (direction = 'inbound' OR recipient_phone = 'system');

-- إضافة تعليق توضيحي
COMMENT ON COLUMN whatsapp_messages.session_token IS 'Session token لربط جميع رسائل المحادثة الواحدة معاً';
