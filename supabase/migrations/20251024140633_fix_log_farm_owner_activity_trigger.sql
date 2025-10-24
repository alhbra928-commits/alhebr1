/*
  # إصلاح دالة log_farm_owner_activity

  1. المشكلة
    - الدالة تحاول الوصول إلى NEW.approved_by في عمليات DELETE
    - وتحاول الوصول إلى OLD.deleted_by في عمليات INSERT
    - هذا يسبب خطأ لأن السجلات غير موجودة

  2. الحل
    - استخدام CASE للتحقق من نوع العملية
    - الوصول للحقول المناسبة حسب نوع العملية
*/

CREATE OR REPLACE FUNCTION log_farm_owner_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    record_id,
    old_data,
    new_data,
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    CASE 
      WHEN TG_OP = 'INSERT' THEN NULL
      WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.approved_by, NEW.rejected_by)
      WHEN TG_OP = 'DELETE' THEN OLD.deleted_by
      ELSE NULL
    END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION log_farm_owner_activity() IS 'دالة محدثة لتسجيل نشاطات أصحاب المزارع في audit_log';
