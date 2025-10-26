/*
  # Smart WhatsApp Management System - Phase 1: Foundation

  ## Overview
  Complete foundation for Smart WhatsApp Management System with all core tables
  to manage providers, templates, messages, threads, events, and OTP authentication.

  ## New Tables

  1. `whatsapp_providers`
     - Stores WhatsApp service provider configurations (Meta, Twilio, 360Dialog, etc.)
     - Fields: id, name, type, base_url, api_key, webhook_secret, phone_number, is_active, is_default
     - Security: Admin-only access with RLS

  2. `whatsapp_templates`
     - Message templates for different notification types
     - Fields: id, name, category, content_ar, content_en, variables, provider_id, is_active
     - Security: Admin read/write, system functions can read

  3. `whatsapp_events_connector`
     - Maps system events to WhatsApp templates
     - Fields: id, event_type, template_id, is_active, priority
     - Security: Admin-only access

  4. `whatsapp_messages`
     - Log of all sent and received messages
     - Fields: id, provider_id, template_id, recipient_phone, content, status, sent_at, delivered_at, read_at
     - Security: Admin read access

  5. `whatsapp_inbox_threads`
     - Active conversation threads with users
     - Fields: id, user_phone, user_name, last_message, unread_count, status, assigned_to, created_at, updated_at
     - Security: Admin read/write access

  6. `whatsapp_logs`
     - System operation logs for debugging and monitoring
     - Fields: id, operation, provider_id, status, request_data, response_data, error_message, created_at
     - Security: Admin read-only access

  7. `login_otps`
     - OTP codes for WhatsApp-based authentication
     - Fields: id, phone_number, otp_code, expires_at, is_used, user_type, created_at
     - Security: Public insert, system functions can read/update

  ## Security
  - All tables have RLS enabled
  - Admin users have full access through admin_users table check
  - Public can only insert OTP requests
  - System functions run as SECURITY DEFINER for automated operations
*/

-- 1. WhatsApp Providers Table
CREATE TABLE IF NOT EXISTS whatsapp_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('meta', 'twilio', '360dialog', 'other')),
  base_url text NOT NULL,
  api_key text NOT NULL,
  webhook_secret text,
  phone_number text NOT NULL,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  test_status text DEFAULT 'pending' CHECK (test_status IN ('pending', 'success', 'failed')),
  test_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id),
  deleted_at timestamptz,
  deleted_by uuid
);

ALTER TABLE whatsapp_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read whatsapp_providers"
  ON whatsapp_providers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can insert whatsapp_providers"
  ON whatsapp_providers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can update whatsapp_providers"
  ON whatsapp_providers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can soft delete whatsapp_providers"
  ON whatsapp_providers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
  );

-- 2. WhatsApp Templates Table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('notification', 'otp', 'marketing', 'support', 'transaction')),
  content_ar text NOT NULL,
  content_en text,
  variables jsonb DEFAULT '[]'::jsonb,
  provider_id uuid REFERENCES whatsapp_providers(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id),
  deleted_at timestamptz,
  deleted_by uuid
);

ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read whatsapp_templates"
  ON whatsapp_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can insert whatsapp_templates"
  ON whatsapp_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can update whatsapp_templates"
  ON whatsapp_templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
  );

-- 3. WhatsApp Events Connector Table
CREATE TABLE IF NOT EXISTS whatsapp_events_connector (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN (
    'booking_created',
    'booking_confirmed',
    'certificate_issued',
    'payment_received',
    'payment_rejected',
    'settlement_completed',
    'farm_approved',
    'farm_rejected',
    'investor_welcome',
    'owner_welcome',
    'login_otp'
  )),
  template_id uuid REFERENCES whatsapp_templates(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_type, template_id)
);

ALTER TABLE whatsapp_events_connector ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whatsapp_events_connector"
  ON whatsapp_events_connector FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
  );

-- 4. WhatsApp Messages Table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES whatsapp_providers(id) ON DELETE SET NULL,
  template_id uuid REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
  event_type text,
  recipient_phone text NOT NULL,
  recipient_name text,
  content text NOT NULL,
  direction text DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  external_message_id text,
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_recipient ON whatsapp_messages(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON whatsapp_messages(created_at DESC);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read whatsapp_messages"
  ON whatsapp_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
  );

-- 5. WhatsApp Inbox Threads Table
CREATE TABLE IF NOT EXISTS whatsapp_inbox_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone text NOT NULL UNIQUE,
  user_name text,
  user_type text CHECK (user_type IN ('investor', 'owner', 'visitor', 'unknown')),
  last_message text,
  last_message_at timestamptz,
  unread_count integer DEFAULT 0,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  assigned_to uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_inbox_status ON whatsapp_inbox_threads(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_inbox_updated ON whatsapp_inbox_threads(updated_at DESC);

ALTER TABLE whatsapp_inbox_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whatsapp_inbox_threads"
  ON whatsapp_inbox_threads FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
  );

-- 6. WhatsApp Logs Table
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation text NOT NULL,
  provider_id uuid REFERENCES whatsapp_providers(id) ON DELETE SET NULL,
  message_id uuid REFERENCES whatsapp_messages(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  request_data jsonb,
  response_data jsonb,
  error_message text,
  execution_time_ms integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON whatsapp_logs(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created_at ON whatsapp_logs(created_at DESC);

ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read whatsapp_logs"
  ON whatsapp_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
  );

-- 7. Login OTPs Table
CREATE TABLE IF NOT EXISTS login_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  is_used boolean DEFAULT false,
  used_at timestamptz,
  user_type text NOT NULL CHECK (user_type IN ('investor', 'owner')),
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_otps_phone ON login_otps(phone_number);
CREATE INDEX IF NOT EXISTS idx_login_otps_expires ON login_otps(expires_at);

ALTER TABLE login_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can request OTP"
  ON login_otps FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can view OTPs"
  ON login_otps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.deleted_at IS NULL
    )
  );

-- Auto-update timestamps trigger
CREATE OR REPLACE FUNCTION update_whatsapp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_providers_updated_at
  BEFORE UPDATE ON whatsapp_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_updated_at();

CREATE TRIGGER update_whatsapp_templates_updated_at
  BEFORE UPDATE ON whatsapp_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_updated_at();

CREATE TRIGGER update_whatsapp_inbox_threads_updated_at
  BEFORE UPDATE ON whatsapp_inbox_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_updated_at();

-- Ensure only one default provider
CREATE OR REPLACE FUNCTION ensure_single_default_provider()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE whatsapp_providers
    SET is_default = false
    WHERE id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_provider_trigger
  BEFORE INSERT OR UPDATE ON whatsapp_providers
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_provider();
