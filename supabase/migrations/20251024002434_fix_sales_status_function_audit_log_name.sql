/*
  # إصلاح وظيفة تحديث حالة المبيعات - اسم جدول audit

  ## المشكلة
  الوظيفة كانت تستخدم `audit_log` لكن الجدول الصحيح هو `audit_logs`

  ## الإصلاح
  - تحديث اسم الجدول في كلا الوظيفتين:
    1. auto_update_farm_sales_status()
    2. update_farm_sales_status_manual()
*/

-- ====================
-- 1. إصلاح Trigger التلقائي
-- ====================

CREATE OR REPLACE FUNCTION auto_update_farm_sales_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_farm_id uuid;
  new_status text;
  old_status text;
BEGIN
  -- تحديد المزرعة المتأثرة
  IF TG_OP = 'DELETE' THEN
    affected_farm_id := OLD.farm_id;
  ELSE
    affected_farm_id := NEW.farm_id;
  END IF;

  -- جلب الحالة القديمة
  SELECT sales_status INTO old_status
  FROM farms
  WHERE id = affected_farm_id;

  -- حساب الحالة الجديدة
  new_status := calculate_farm_sales_status(affected_farm_id);

  -- تحديث فقط إذا تغيرت الحالة
  IF old_status IS DISTINCT FROM new_status THEN
    UPDATE farms
    SET 
      sales_status = new_status,
      updated_at = now()
    WHERE id = affected_farm_id;

    -- تسجيل في audit_logs (الاسم الصحيح)
    INSERT INTO audit_logs (
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      performed_by
    ) VALUES (
      'AUTO_UPDATE_SALES_STATUS',
      'farms',
      affected_farm_id,
      jsonb_build_object('sales_status', old_status),
      jsonb_build_object('sales_status', new_status),
      'SYSTEM'
    );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- ====================
-- 2. إصلاح الوظيفة اليدوية
-- ====================

CREATE OR REPLACE FUNCTION update_farm_sales_status_manual(
  farm_id_param uuid,
  new_status text,
  admin_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_status text;
  result jsonb;
BEGIN
  -- التحقق من القيمة الصحيحة
  IF new_status NOT IN ('open', 'closed') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid status. Use: open, closed'
    );
  END IF;

  -- جلب الحالة القديمة
  SELECT sales_status INTO old_status
  FROM farms
  WHERE id = farm_id_param
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Farm not found'
    );
  END IF;

  -- تحديث الحالة
  UPDATE farms
  SET 
    sales_status = new_status,
    updated_at = now()
  WHERE id = farm_id_param;

  -- تسجيل في audit_logs (الاسم الصحيح)
  INSERT INTO audit_logs (
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    performed_by
  ) VALUES (
    'MANUAL_UPDATE_SALES_STATUS',
    'farms',
    farm_id_param,
    jsonb_build_object('sales_status', old_status),
    jsonb_build_object('sales_status', new_status),
    COALESCE(admin_id, 'ADMIN')
  );

  RETURN jsonb_build_object(
    'success', true,
    'old_status', old_status,
    'new_status', new_status,
    'message', 'Sales status updated successfully'
  );
END;
$$;
