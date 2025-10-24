/*
  # تحديث دالة إنشاء البطاقة المالية بدون ON CONFLICT
  
  ## المشكلة
  - تم حذف unique constraint من farm_code
  - الـ function لا زال يستخدم ON CONFLICT (farm_code)
  - هذا يسبب خطأ: "no unique or exclusion constraint matching"
  
  ## الحل
  - إزالة ON CONFLICT تماماً
  - استخدام INSERT عادي فقط
  - إذا كانت البطاقة موجودة، تحديثها يدوياً
  
  ## التغييرات
  1. إزالة ON CONFLICT من الـ INSERT
  2. إضافة check للتحقق من وجود البطاقة
  3. استخدام UPDATE إذا كانت موجودة، INSERT إذا لم تكن موجودة
*/

-- ═══════════════════════════════════════════════════════════
-- تحديث function إنشاء البطاقة المالية
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

  -- التحقق من وجود بطاقة مالية للمزرعة
  SELECT id INTO v_existing_id
  FROM smart_farm_finances
  WHERE farm_id = NEW.id
  AND deleted_at IS NULL
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- تحديث البطاقة الموجودة
    UPDATE smart_farm_finances
    SET 
      farm_code = NEW.farm_code,
      farm_name = NEW.name_ar,
      owner_id = NEW.owner_id,
      owner_name = v_owner_name,
      actual_amount = COALESCE(v_actual_amount, 0),
      updated_at = NOW()
    WHERE id = v_existing_id;
  ELSE
    -- إنشاء بطاقة مالية جديدة
    v_barcode := 'FIN-' || NEW.farm_code || '-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 6));
    
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
    ) VALUES (
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

COMMENT ON FUNCTION auto_create_farm_finance_card() IS 'إنشاء أو تحديث البطاقة المالية تلقائياً عند إضافة مزرعة (بدون ON CONFLICT)';
