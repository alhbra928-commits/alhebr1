/*
  # نظام الأرشفة المالية

  1. الحقول الجديدة في farm_finance
    - `is_archived` - حالة الأرشفة
    - `archived_at` - تاريخ الأرشفة
    - `archived_by` - رقم هاتف المستخدم الذي قام بالأرشفة
    - `archive_notes` - ملاحظات الأرشفة

  2. الصلاحيات
    - إضافة صلاحية financial_archiving في admin_module_permissions
    - فقط المستخدمين المصرح لهم يمكنهم الأرشفة

  3. الدوال
    - archive_farm_finance() - دالة أرشفة المزرعة مالياً
    - get_archived_farms() - جلب المزارع المؤرشفة
*/

-- إضافة حقول الأرشفة
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false NOT NULL;
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS archived_by text; -- رقم الهاتف
ALTER TABLE farm_finance ADD COLUMN IF NOT EXISTS archive_notes text;

-- إنشاء index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_farm_finance_archived ON farm_finance(is_archived, archived_at) WHERE is_archived = true;

-- دالة الأرشفة المالية
CREATE OR REPLACE FUNCTION archive_farm_finance(
  p_farm_id uuid,
  p_admin_phone text,
  p_notes text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_farm RECORD;
  v_has_permission boolean;
BEGIN
  -- التحقق من الصلاحيات (financial_archiving في module finance)
  SELECT EXISTS (
    SELECT 1 
    FROM admin_module_permissions 
    WHERE admin_phone = p_admin_phone 
    AND module_id = 'finance'
    AND can_delete = true  -- نستخدم can_delete كمؤشر لصلاحية الأرشفة
    AND is_active = true
  ) INTO v_has_permission;

  IF NOT v_has_permission THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'ليس لديك صلاحية الأرشفة المالية'
    );
  END IF;

  -- جلب بيانات المزرعة
  SELECT * INTO v_farm 
  FROM farm_finance 
  WHERE farm_id = p_farm_id 
  AND deleted_at IS NULL
  AND is_archived = false;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'المزرعة غير موجودة أو تم أرشفتها مسبقاً'
    );
  END IF;
  
  -- التحقق من اكتمال التسوية
  IF NOT v_farm.settlement_executed THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'يجب إتمام التسوية المالية أولاً'
    );
  END IF;

  -- التحقق من بيع المزرعة بالكامل
  IF v_farm.collected_from_investors < v_farm.owner_amount_target THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'لم يتم بيع المزرعة بالكامل بعد'
    );
  END IF;
  
  -- تنفيذ الأرشفة
  UPDATE farm_finance
  SET
    is_archived = true,
    archived_at = now(),
    archived_by = p_admin_phone,
    archive_notes = p_notes,
    updated_at = now()
  WHERE farm_id = p_farm_id;
  
  -- تسجيل العملية
  BEGIN
    INSERT INTO logs_finance (
      log_type, 
      reference_type, 
      reference_id, 
      description, 
      data, 
      performed_by
    )
    VALUES (
      'archive', 
      'farm', 
      p_farm_id, 
      'أرشفة المزرعة مالياً', 
      jsonb_build_object(
        'farm_code', v_farm.farm_code,
        'farm_name', v_farm.farm_name,
        'archived_at', now(),
        'archived_by', p_admin_phone,
        'notes', p_notes
      ), 
      NULL -- performed_by كـ UUID
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to log archive operation: %', SQLERRM;
  END;
  
  RETURN jsonb_build_object(
    'success', true,
    'farm_code', v_farm.farm_code,
    'farm_name', v_farm.farm_name,
    'archived_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة استرجاع المزارع المؤرشفة
CREATE OR REPLACE FUNCTION get_archived_farms()
RETURNS TABLE (
  id uuid,
  farm_id uuid,
  farm_code text,
  farm_name text,
  collected_from_investors numeric,
  owner_amount_target numeric,
  owner_amount_transferred numeric,
  platform_amount_received numeric,
  charity_amount_deducted numeric,
  settlement_executed_at timestamptz,
  archived_at timestamptz,
  archived_by text,
  archive_notes text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.farm_id,
    f.farm_code,
    f.farm_name,
    f.collected_from_investors,
    f.owner_amount_target,
    f.owner_amount_transferred,
    f.platform_amount_received,
    f.charity_amount_deducted,
    f.settlement_executed_at,
    f.archived_at,
    f.archived_by,
    f.archive_notes,
    f.created_at
  FROM farm_finance f
  WHERE f.is_archived = true
  AND f.deleted_at IS NULL
  ORDER BY f.archived_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للتحقق من صلاحية الأرشفة
CREATE OR REPLACE FUNCTION check_archiving_permission(p_admin_phone text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_module_permissions 
    WHERE admin_phone = p_admin_phone 
    AND module_id = 'finance'
    AND can_delete = true
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تحديث RLS policies للمزارع المؤرشفة
DROP POLICY IF EXISTS "archived_farms_public_select" ON farm_finance;
CREATE POLICY "archived_farms_public_select" ON farm_finance
  FOR SELECT
  TO anon, authenticated
  USING (is_archived = true OR is_archived = false);

-- إضافة constraint للتأكد من البيانات
ALTER TABLE farm_finance DROP CONSTRAINT IF EXISTS check_archive_logic;
ALTER TABLE farm_finance ADD CONSTRAINT check_archive_logic 
  CHECK (
    (is_archived = false) OR 
    (is_archived = true AND archived_at IS NOT NULL AND archived_by IS NOT NULL)
  );
