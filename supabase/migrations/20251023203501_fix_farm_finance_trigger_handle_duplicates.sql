/*
  # إصلاح trigger إنشاء البطاقة المالية للتعامل مع التكرار
  
  ## المشكلة
  - عند إضافة مزرعة، trigger يُنشئ سجل في smart_farm_finances
  - إذا تم إعادة المحاولة (من cache)، يحدث خطأ duplicate key
  
  ## الحل
  - إضافة ON CONFLICT DO NOTHING للـ INSERT
  - أو استخدام ON CONFLICT DO UPDATE إذا أردنا التحديث
  
  ## التغييرات
  1. تعديل auto_create_farm_finance_card() لإضافة ON CONFLICT
  2. التعامل مع حالة التكرار بشكل آمن
*/

-- ═══════════════════════════════════════════════════════════
-- تعديل Function: إنشاء بطاقة مالية مع معالجة التكرار
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION auto_create_farm_finance_card()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_actual_amount NUMERIC;
  v_owner_name TEXT;
  v_barcode TEXT;
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
  
  -- توليد باركود مالي فريد
  v_barcode := 'FIN-' || NEW.farm_code || '-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 6));
  
  -- إنشاء البطاقة المالية مع معالجة التكرار
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
  )
  ON CONFLICT (farm_code) 
  DO UPDATE SET
    farm_name = EXCLUDED.farm_name,
    owner_id = EXCLUDED.owner_id,
    owner_name = EXCLUDED.owner_name,
    actual_amount = EXCLUDED.actual_amount,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION auto_create_farm_finance_card() IS 'ينشئ بطاقة مالية ذكية لكل مزرعة جديدة تلقائياً مع معالجة التكرار';
