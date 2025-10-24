/*
  # إصلاح دالة log_farm_owner_activity - معالجة الحقول المفقودة

  1. المشكلة
    - الدالة تحاول الوصول إلى NEW.approved_by حتى عند عدم تحديثه
    - يجب استخدام OLD للحقول التي لم تتغير

  2. الحل
    - استخدام exception handling
    - استخدام COALESCE مع OLD و NEW
*/

CREATE OR REPLACE FUNCTION log_farm_owner_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_changed_by uuid := NULL;
BEGIN
  -- تحديد من قام بالتغيير بناءً على نوع العملية
  BEGIN
    IF TG_OP = 'INSERT' THEN
      v_changed_by := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
      -- محاولة الحصول على approved_by أو rejected_by من NEW
      -- إذا لم يكونا موجودين، نستخدم القيم من OLD
      BEGIN
        v_changed_by := COALESCE(
          (NEW.approved_by),
          (NEW.rejected_by),
          (OLD.approved_by),
          (OLD.rejected_by)
        );
      EXCEPTION WHEN OTHERS THEN
        v_changed_by := NULL;
      END;
    ELSIF TG_OP = 'DELETE' THEN
      BEGIN
        v_changed_by := OLD.deleted_by;
      EXCEPTION WHEN OTHERS THEN
        v_changed_by := NULL;
      END;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_changed_by := NULL;
  END;

  -- تسجيل في audit_log
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
    v_changed_by
  );

  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  -- في حالة حدوث خطأ، نكمل العملية بدون تسجيل
  RAISE WARNING 'Failed to log farm owner activity: %', SQLERRM;
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION log_farm_owner_activity() IS 'دالة لتسجيل نشاطات أصحاب المزارع مع معالجة أخطاء الحقول المفقودة';
