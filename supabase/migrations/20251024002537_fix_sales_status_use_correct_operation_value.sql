/*
  # إصلاح قيمة operation في تحديث حالة المبيعات

  ## المشكلة
  constraint يسمح فقط بـ: INSERT, UPDATE, DELETE, SOFT_DELETE, RESTORE

  ## الإصلاح
  استخدام 'UPDATE' بدلاً من النصوص المخصصة
*/

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
  IF TG_OP = 'DELETE' THEN
    affected_farm_id := OLD.farm_id;
  ELSE
    affected_farm_id := NEW.farm_id;
  END IF;

  SELECT sales_status INTO old_status
  FROM farms
  WHERE id = affected_farm_id;

  new_status := calculate_farm_sales_status(affected_farm_id);

  IF old_status IS DISTINCT FROM new_status THEN
    UPDATE farms
    SET 
      sales_status = new_status,
      updated_at = now()
    WHERE id = affected_farm_id;

    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      old_data,
      new_data,
      user_email,
      operation_timestamp,
      metadata
    ) VALUES (
      'farms',
      affected_farm_id,
      'UPDATE',
      jsonb_build_object('sales_status', old_status),
      jsonb_build_object('sales_status', new_status),
      'SYSTEM',
      now(),
      jsonb_build_object('type', 'auto_sales_status_update')
    );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

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
BEGIN
  IF new_status NOT IN ('open', 'closed') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid status. Use: open, closed'
    );
  END IF;

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

  UPDATE farms
  SET 
    sales_status = new_status,
    updated_at = now()
  WHERE id = farm_id_param;

  INSERT INTO audit_logs (
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    user_email,
    operation_timestamp,
    metadata
  ) VALUES (
    'farms',
    farm_id_param,
    'UPDATE',
    jsonb_build_object('sales_status', old_status),
    jsonb_build_object('sales_status', new_status),
    COALESCE(admin_id, 'ADMIN'),
    now(),
    jsonb_build_object('type', 'manual_sales_status_update', 'admin', COALESCE(admin_id, 'ADMIN'))
  );

  RETURN jsonb_build_object(
    'success', true,
    'old_status', old_status,
    'new_status', new_status,
    'message', 'Sales status updated successfully'
  );
END;
$$;
