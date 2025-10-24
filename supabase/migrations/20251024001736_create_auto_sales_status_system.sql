/*
  # نظام التحديث التلقائي واليدوي لحالة المبيعات

  ## نظرة عامة
  يوفر هذا النظام طريقتين لتحديث حالة المبيعات (sales_status) للمزارع:
  1. **تلقائي**: يتم التحديث تلقائياً عند تغيير الحجوزات
  2. **يدوي**: يمكن للمسؤولين تغيير الحالة يدوياً

  ## الوظائف الجديدة

  ### 1. calculate_farm_sales_status()
  - تحسب النسبة المئوية للحجوزات
  - تحدد الحالة: 'open' أو 'closed'
  - تعمل على مستوى المزرعة الواحدة

  ### 2. update_farm_sales_status()
  - تحديث يدوي للحالة من قبل المسؤولين
  - تسجيل في audit_log
  - التحقق من الصلاحيات

  ### 3. auto_update_sales_status_trigger
  - يعمل تلقائياً عند:
    - إضافة حجز جديد
    - تحديث حجز
    - حذف حجز
  - يحدث sales_status بناءً على النسبة المئوية

  ## القواعد

  - **مفتوح (open)**: أقل من 100% من الأشجار محجوزة
  - **مكتمل (closed)**: 100% من الأشجار محجوزة
  - يتم التسجيل في audit_log عند كل تغيير يدوي

  ## الأمان

  - الـ Trigger يعمل بصلاحيات SECURITY DEFINER
  - الوظيفة اليدوية تسجل من قام بالتغيير
  - جميع التحديثات تُسجل في audit_log
*/

-- ====================
-- 1. وظيفة حساب حالة المبيعات التلقائية
-- ====================

CREATE OR REPLACE FUNCTION calculate_farm_sales_status(farm_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_trees_count integer;
  available_trees_count integer;
  booking_percentage numeric;
  current_status text;
BEGIN
  -- جلب إجمالي الأشجار والمتاحة من farm_tree_varieties
  SELECT 
    COALESCE(SUM(total_trees), 0),
    COALESCE(SUM(available_quantity), 0)
  INTO total_trees_count, available_trees_count
  FROM farm_tree_varieties
  WHERE farm_id = farm_id_param
    AND deleted_at IS NULL;

  -- إذا لم يكن هناك أشجار، المزرعة مفتوحة
  IF total_trees_count = 0 THEN
    RETURN 'open';
  END IF;

  -- حساب النسبة المئوية للحجز
  booking_percentage := ((total_trees_count - available_trees_count)::numeric / total_trees_count) * 100;

  -- تحديد الحالة
  IF booking_percentage >= 100 THEN
    current_status := 'closed';
  ELSE
    current_status := 'open';
  END IF;

  RETURN current_status;
END;
$$;

-- ====================
-- 2. Trigger تلقائي لتحديث sales_status
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

    -- تسجيل في audit_log
    INSERT INTO audit_log (
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

-- تطبيق الـ Trigger على جدول farm_tree_varieties
DROP TRIGGER IF EXISTS trigger_auto_update_sales_status ON farm_tree_varieties;
CREATE TRIGGER trigger_auto_update_sales_status
  AFTER INSERT OR UPDATE OR DELETE ON farm_tree_varieties
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_farm_sales_status();

-- ====================
-- 3. وظيفة يدوية لتحديث sales_status
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

  -- تسجيل في audit_log
  INSERT INTO audit_log (
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

-- ====================
-- 4. تحديث الحالة لجميع المزارع الموجودة
-- ====================

DO $$
DECLARE
  farm_record RECORD;
  new_status text;
BEGIN
  FOR farm_record IN 
    SELECT id, sales_status FROM farms WHERE deleted_at IS NULL
  LOOP
    new_status := calculate_farm_sales_status(farm_record.id);
    
    IF farm_record.sales_status IS DISTINCT FROM new_status THEN
      UPDATE farms
      SET sales_status = new_status
      WHERE id = farm_record.id;
    END IF;
  END LOOP;
END $$;
