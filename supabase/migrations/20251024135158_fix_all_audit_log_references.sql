/*
  # إصلاح جميع المراجع إلى audit_log (بدون s)

  1. المشكلة
    - عدة دوال تستخدم `audit_log` بدون `s`
    - الجدول الصحيح هو `audit_logs`

  2. الحل
    - إنشاء جدول مؤقت `audit_log` يعيد التوجيه إلى `audit_logs`
    - أو: إنشاء view باسم `audit_log` يشير إلى `audit_logs`
*/

-- الحل الأبسط: إنشاء view
CREATE OR REPLACE VIEW audit_log AS
SELECT * FROM audit_logs;

-- السماح بالإدراج من خلال الـ view
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
  metadata
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
  COALESCE(NEW.metadata, '{}'::jsonb)
)
RETURNING *;

-- إنشاء view للقراءة أيضاً
COMMENT ON VIEW audit_log IS 'View مؤقت للتوافق مع الدوال القديمة التي تستخدم audit_log بدون s';
