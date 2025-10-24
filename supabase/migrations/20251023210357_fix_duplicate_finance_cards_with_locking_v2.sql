/*
  # إصلاح مشكلة البطاقات المالية المكررة
  
  ## المشكلة
  - عند إنشاء مزرعة واحدة، يتم إنشاء بطاقتين ماليتين
  - السبب: الـ trigger ينفذ مرتين بسبب race condition
  
  ## الحل
  1. حذف البطاقات المكررة (deleted_by = NULL لأنه uuid)
  2. استخدام row-level locking في الـ function
  3. إضافة unique constraint على farm_id
  
  ## التغييرات
  1. حذف البطاقات المكررة (الاحتفاظ بالأقدم)
  2. تحديث الـ function مع locking
  3. إضافة unique index على farm_id
*/

-- ═══════════════════════════════════════════════════════════
-- الخطوة 1: حذف البطاقات المكررة (الاحتفاظ بالأقدم)
-- ═══════════════════════════════════════════════════════════

WITH duplicates AS (
  SELECT 
    farm_id,
    ARRAY_AGG(id ORDER BY created_at ASC) as ids,
    COUNT(*) as count
  FROM smart_farm_finances
  WHERE deleted_at IS NULL
  GROUP BY farm_id
  HAVING COUNT(*) > 1
),
to_delete AS (
  SELECT 
    UNNEST(ids[2:]) as id_to_delete
  FROM duplicates
)
UPDATE smart_farm_finances
SET 
  deleted_at = NOW(),
  deleted_by = NULL  -- NULL لأن deleted_by هو uuid
WHERE id IN (SELECT id_to_delete FROM to_delete);

-- ═══════════════════════════════════════════════════════════
-- الخطوة 2: إضافة unique constraint على farm_id
-- ═══════════════════════════════════════════════════════════

-- إنشاء unique index جزئي (فقط للصفوف غير المحذوفة)
DROP INDEX IF EXISTS idx_smart_farm_finances_farm_id_unique;
CREATE UNIQUE INDEX idx_smart_farm_finances_farm_id_unique 
ON smart_farm_finances(farm_id)
WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_smart_farm_finances_farm_id_unique IS 'منع إنشاء أكثر من بطاقة مالية لنفس المزرعة';

-- ═══════════════════════════════════════════════════════════
-- الخطوة 3: تحديث الـ function مع row-level locking
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

  -- التحقق من وجود بطاقة مالية مع row-level lock
  SELECT id INTO v_existing_id
  FROM smart_farm_finances
  WHERE farm_id = NEW.id
  AND deleted_at IS NULL
  FOR UPDATE SKIP LOCKED
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
    -- توليد باركود فريد
    v_barcode := 'FIN-' || NEW.farm_code || '-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT || RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- إنشاء بطاقة مالية جديدة
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
    )
    ON CONFLICT (farm_id) WHERE deleted_at IS NULL
    DO UPDATE SET
      farm_code = EXCLUDED.farm_code,
      farm_name = EXCLUDED.farm_name,
      owner_id = EXCLUDED.owner_id,
      owner_name = EXCLUDED.owner_name,
      actual_amount = EXCLUDED.actual_amount,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION auto_create_farm_finance_card() IS 'إنشاء أو تحديث البطاقة المالية مع منع التكرار (unique constraint + locking)';
