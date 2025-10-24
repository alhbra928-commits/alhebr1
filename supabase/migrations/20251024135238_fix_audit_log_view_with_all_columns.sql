/*
  # تحديث view audit_log لدعم جميع الأعمدة المطلوبة

  1. المشكلة
    - بعض الدوال تحاول إدراج عمود `changed_by` غير موجود
    - بعض الدوال تحاول إدراج `action` و`action_type`

  2. الحل
    - إضافة الأعمدة المفقودة إلى جدول audit_logs
    - تحديث الـ view
*/

-- إضافة الأعمدة المفقودة
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS changed_by uuid,
ADD COLUMN IF NOT EXISTS action text,
ADD COLUMN IF NOT EXISTS action_type text;

-- حذف الـ view القديم والـ rule
DROP RULE IF EXISTS audit_log_insert ON audit_log;
DROP VIEW IF EXISTS audit_log;

-- إعادة إنشاء الـ view
CREATE OR REPLACE VIEW audit_log AS
SELECT 
  id,
  table_name,
  record_id,
  operation,
  old_data,
  new_data,
  user_id,
  user_email,
  ip_address,
  user_agent,
  operation_timestamp,
  metadata,
  created_at,
  changed_by,
  action,
  action_type
FROM audit_logs;

-- إنشاء rule للإدراج
CREATE OR REPLACE RULE audit_log_insert AS
ON INSERT TO audit_log
DO INSTEAD
INSERT INTO audit_logs (
  table_name,
  record_id,
  operation,
  old_data,
  new_data,
  user_id,
  user_email,
  ip_address,
  user_agent,
  operation_timestamp,
  metadata,
  changed_by,
  action,
  action_type
) VALUES (
  NEW.table_name,
  NEW.record_id,
  NEW.operation,
  COALESCE(NEW.old_data, '{}'::jsonb),
  COALESCE(NEW.new_data, '{}'::jsonb),
  NEW.user_id,
  NEW.user_email,
  NEW.ip_address,
  NEW.user_agent,
  COALESCE(NEW.operation_timestamp, now()),
  COALESCE(NEW.metadata, '{}'::jsonb),
  NEW.changed_by,
  NEW.action,
  NEW.action_type
)
RETURNING *;

COMMENT ON VIEW audit_log IS 'View للتوافق مع الدوال القديمة - يعيد التوجيه إلى audit_logs';
