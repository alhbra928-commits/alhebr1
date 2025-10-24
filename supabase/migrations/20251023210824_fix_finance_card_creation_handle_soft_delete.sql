/*
  # إصلاح إنشاء البطاقات المالية مع معالجة الـ soft delete
  
  ## المشكلة
  - عند حذف مزرعة (soft delete)، تُحذف البطاقة المالية
  - عند إعادة إضافة نفس المزرعة، يحاول إنشاء بطاقة جديدة
  - الـ unique constraint يمنع ذلك لأن البطاقة القديمة (المحذوفة) موجودة
  
  ## الحل
  1. البحث عن البطاقات المحذوفة أيضاً
  2. إعادة تفعيل (restore) البطاقة المحذوفة بدلاً من إنشاء جديدة
  3. إذا لم توجد بطاقة (محذوفة أو نشطة)، إنشاء بطاقة جديدة
  
  ## التغييرات
  1. تحديث الـ function لمعالجة البطاقات المحذوفة
  2. إزالة البطاقات المحذوفة القديمة (cleanup)
*/

-- ═══════════════════════════════════════════════════════════
-- الخطوة 1: تنظيف البطاقات المالية المحذوفة نهائياً
-- ═══════════════════════════════════════════════════════════

-- حذف البطاقات المالية للمزارع المحذوفة نهائياً
DELETE FROM smart_farm_finances
WHERE farm_id IN (
  SELECT sff.farm_id 
  FROM smart_farm_finances sff
  LEFT JOIN farms f ON sff.farm_id = f.id
  WHERE f.deleted_at IS NOT NULL
);

-- ═══════════════════════════════════════════════════════════
-- الخطوة 2: تحديث الـ function لمعالجة الـ soft delete
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION auto_create_farm_finance_card()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_actual_amount NUMERIC;
  v_owner_name TEXT;
  v_barcode TEXT;
  v_existing_id UUID;
  v_is_deleted BOOLEAN;
BEGIN
  -- الحصول على المبلغ الفعلي من صاحب المزرعة
  IF NEW.owner_id IS NOT NULL THEN
    SELECT actual_price, full_name 
    INTO v_actual_amount, v_owner_name
    FROM farm_owners
    WHERE id = NEW.owner_id;
  ELSE
    v_actual_amount := 0;
    v_owner_name := NULL;
  END IF;

  -- البحث عن بطاقة مالية (نشطة أو محذوفة)
  SELECT id, (deleted_at IS NOT NULL) 
  INTO v_existing_id, v_is_deleted
  FROM smart_farm_finances
  WHERE farm_id = NEW.id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    IF v_is_deleted THEN
      -- إعادة تفعيل البطاقة المحذوفة
      UPDATE smart_farm_finances
      SET 
        farm_code = NEW.farm_code,
        farm_name = NEW.name_ar,
        owner_id = NEW.owner_id,
        owner_name = v_owner_name,
        actual_amount = COALESCE(v_actual_amount, 0),
        deleted_at = NULL,
        deleted_by = NULL,
        updated_at = NOW()
      WHERE id = v_existing_id;
    ELSE
      -- تحديث البطاقة النشطة
      UPDATE smart_farm_finances
      SET 
        farm_code = NEW.farm_code,
        farm_name = NEW.name_ar,
        owner_id = NEW.owner_id,
        owner_name = v_owner_name,
        actual_amount = COALESCE(v_actual_amount, 0),
        updated_at = NOW()
      WHERE id = v_existing_id;
    END IF;
  ELSE
    -- إنشاء بطاقة مالية جديدة
    v_barcode := 'FIN-' || NEW.farm_code || '-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT || RANDOM()::TEXT) FROM 1 FOR 6));
    
    INSERT INTO smart_farm_finances (
      farm_id,
      farm_code,
      farm_name,
      owner_id,
      owner_name,
      marketing_amount,
      actual_amount,
      financial_barcode,
      status,
      completion_stage
    ) 
    VALUES (
      NEW.id,
      NEW.farm_code,
      NEW.name_ar,
      NEW.owner_id,
      v_owner_name,
      0,
      COALESCE(v_actual_amount, 0),
      v_barcode,
      'active',
      'collecting'
    );
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION auto_create_farm_finance_card() IS 'إنشاء أو تحديث أو إعادة تفعيل البطاقة المالية (مع معالجة soft delete)';
