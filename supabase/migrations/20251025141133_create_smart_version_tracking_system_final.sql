/*
  # Smart Version Tracking System - Final
  
  نظام ذكي لتتبع الإصدارات وإشعارات التحديثات التلقائية
  
  1. New Tables
    - `system_versions` - تتبع جميع إصدارات المنصة
    - `update_notifications` - إشعارات التحديثات للمستخدمين
      
  2. Security
    - Enable RLS on both tables
    - Admins can manage versions
    - All authenticated users can read notifications
    
  3. Functions
    - `record_new_version()` - تسجيل نسخة جديدة تلقائيًا
    - `create_update_notification()` - إنشاء إشعار تحديث
    - `mark_notification_read()` - تعليم الإشعار كمقروء
    - `get_active_version()` - الحصول على النسخة النشطة
    - `cleanup_old_notifications()` - حذف الإشعارات المنتهية
*/

-- Create system_versions table
CREATE TABLE IF NOT EXISTS system_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  build_number text,
  deployed_at timestamptz DEFAULT now(),
  deployed_by text,
  changelog jsonb DEFAULT '[]'::jsonb,
  environment text DEFAULT 'production',
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create update_notifications table
CREATE TABLE IF NOT EXISTS update_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES system_versions(id) ON DELETE CASCADE,
  title_ar text NOT NULL,
  title_en text,
  message_ar text NOT NULL,
  message_en text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  target_roles text[] DEFAULT ARRAY['admin']::text[],
  is_read boolean DEFAULT false,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE system_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_versions
CREATE POLICY "Admins can manage versions"
  ON system_versions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE phone = (current_setting('request.jwt.claims', true)::json->>'phone')
      AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE phone = (current_setting('request.jwt.claims', true)::json->>'phone')
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "All authenticated can read versions"
  ON system_versions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for update_notifications
CREATE POLICY "Admins can manage update notifications"
  ON update_notifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE phone = (current_setting('request.jwt.claims', true)::json->>'phone')
      AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE phone = (current_setting('request.jwt.claims', true)::json->>'phone')
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "All authenticated can read notifications"
  ON update_notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can mark their notifications as read"
  ON update_notifications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function: Record new version
CREATE OR REPLACE FUNCTION record_new_version(
  p_version text,
  p_build_number text DEFAULT NULL,
  p_deployed_by text DEFAULT NULL,
  p_changelog jsonb DEFAULT '[]'::jsonb,
  p_environment text DEFAULT 'production'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_version_id uuid;
BEGIN
  -- Deactivate all previous versions
  UPDATE system_versions SET is_active = false WHERE is_active = true;
  
  -- Insert new version
  INSERT INTO system_versions (
    version,
    build_number,
    deployed_by,
    changelog,
    environment,
    is_active
  ) VALUES (
    p_version,
    p_build_number,
    p_deployed_by,
    p_changelog,
    p_environment,
    true
  )
  RETURNING id INTO v_version_id;
  
  RETURN v_version_id;
END;
$$;

-- Function: Create update notification
CREATE OR REPLACE FUNCTION create_update_notification(
  p_version_id uuid,
  p_title_ar text,
  p_message_ar text,
  p_title_en text DEFAULT NULL,
  p_message_en text DEFAULT NULL,
  p_priority text DEFAULT 'medium',
  p_target_roles text[] DEFAULT ARRAY['admin']::text[],
  p_expires_hours int DEFAULT 24
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO update_notifications (
    version_id,
    title_ar,
    title_en,
    message_ar,
    message_en,
    priority,
    target_roles,
    expires_at
  ) VALUES (
    p_version_id,
    p_title_ar,
    COALESCE(p_title_en, p_title_ar),
    p_message_ar,
    COALESCE(p_message_en, p_message_ar),
    p_priority,
    p_target_roles,
    now() + (p_expires_hours || ' hours')::interval
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function: Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE update_notifications
  SET is_read = true
  WHERE id = p_notification_id;
  
  RETURN FOUND;
END;
$$;

-- Function: Get active version
CREATE OR REPLACE FUNCTION get_active_version()
RETURNS TABLE (
  version text,
  build_number text,
  deployed_at timestamptz,
  environment text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sv.version,
    sv.build_number,
    sv.deployed_at,
    sv.environment
  FROM system_versions sv
  WHERE sv.is_active = true
  ORDER BY sv.deployed_at DESC
  LIMIT 1;
END;
$$;

-- Function: Cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count int;
BEGIN
  DELETE FROM update_notifications
  WHERE expires_at < now()
  AND is_read = true;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_versions_active ON system_versions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_system_versions_deployed_at ON system_versions(deployed_at DESC);
CREATE INDEX IF NOT EXISTS idx_update_notifications_expires ON update_notifications(expires_at) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_update_notifications_version ON update_notifications(version_id);

-- Insert initial version
DO $$
DECLARE
  v_version_id uuid;
BEGIN
  v_version_id := record_new_version(
    'v20251025_initial',
    'build_001',
    'system',
    '[{"change": "نظام تتبع الإصدارات والكاش التلقائي", "date": "2025-10-25"}]'::jsonb,
    'production'
  );
  
  PERFORM create_update_notification(
    v_version_id,
    'تم تفعيل نظام تتبع الإصدارات الذكي',
    'تم تفعيل نظام ذكي لتتبع إصدارات المنصة وإشعارات التحديثات التلقائية. سيتم إخطارك بأي تحديثات جديدة تلقائيًا، ولن تحتاج لحذف الكاش يدويًا بعد الآن.',
    'Smart Version Tracking System Activated',
    'Smart version tracking and automatic update notifications have been activated. You will be notified of any new updates automatically, and no manual cache clearing will be needed.',
    'high',
    ARRAY['admin', 'owner']::text[],
    72
  );
END $$;
