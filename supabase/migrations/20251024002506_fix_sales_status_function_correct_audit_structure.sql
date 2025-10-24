/*
  # إصلاح وظيفة تحديث حالة المبيعات - البنية الصحيحة لـ audit_logs

  ## المشكلة
  بنية جدول audit_logs مختلفة عن المتوقع:
  - operation بدلاً من action
  - old_data بدلاً من old_values
  - new_data بدلاً من new_values
  - user_email بدلاً من performed_by

  ## الإصلاح
  تحديث كلا الوظيفتين لتتناسب مع البنية الصحيحة
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

    -- تسجيل في audit_logs بالبنية الصحيحة
    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      old_data,
      new_data,
      user_email,
      operation_timestamp
    ) VALUES (
      'farms',
      affected_farm_id,
      'AUTO_UPDATE_SALES_STATUS',
      jsonb_build_object('sales_status', old_status),
      jsonb_build_object('sales_status', new_status),
      'SYSTEM',
      now()
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

  -- تسجيل في audit_logs بالبنية الصحيحة
  INSERT INTO audit_logs (
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    user_email,
    operation_timestamp
  ) VALUES (
    'farms',
    farm_id_param,
    'MANUAL_UPDATE_SALES_STATUS',
    jsonb_build_object('sales_status', old_status),
    jsonb_build_object('sales_status', new_status),
    COALESCE(admin_id, 'ADMIN'),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'old_status', old_status,
    'new_status', new_status,
    'message', 'Sales status updated successfully'
  );
END;
$$;
