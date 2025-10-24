/*
  # مزامنة فورية بين farm_owners و smart_farm_finances
  
  ## المشكلة
  - عند تحديث actual_price في farm_owners، لا يتم تحديث smart_farm_finances
  - البطاقة المالية تعرض أرقاماً قديمة
  - لا يوجد اتصال لحظي بين الجدولين
  
  ## الحل
  - إنشاء trigger يراقب التحديثات على farm_owners
  - مزامنة فورية مع smart_farm_finances عند أي تغيير
  - تحديث marketing_amount و actual_amount تلقائياً
*/

-- ═══════════════════════════════════════════════════════════
-- Function: مزامنة لحظية من farm_owners إلى smart_farm_finances
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION sync_owner_changes_to_finances()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_farm_record RECORD;
  v_total_actual NUMERIC;
  v_total_marketing NUMERIC;
BEGIN
  -- جلب جميع المزارع التابعة للمالك
  FOR v_farm_record IN 
    SELECT 
      f.id as farm_id,
      f.farm_code,
      f.total_actual_price,
      f.total_marketing_price
    FROM farms f
    WHERE f.owner_id = NEW.id
    AND f.deleted_at IS NULL
  LOOP
    -- حساب المبالغ الجديدة
    v_total_actual := COALESCE(v_farm_record.total_actual_price, 0);
    v_total_marketing := COALESCE(v_farm_record.total_marketing_price, 0);
    
    -- تحديث البطاقة المالية
    UPDATE smart_farm_finances
    SET 
      actual_amount = v_total_actual,
      marketing_amount = v_total_marketing,
      owner_name = NEW.full_name,
      
      -- إعادة حساب النسب
      coverage_percentage = CASE 
        WHEN v_total_actual > 0 THEN 
          (COALESCE(collected_from_investors, 0) / v_total_actual * 100)
        ELSE 0
      END,
      
      completion_percentage_visual = CASE 
        WHEN v_total_actual > 0 THEN 
          (COALESCE(collected_from_investors, 0) / v_total_actual * 100)
        ELSE 0
      END,
      
      -- إعادة حساب الأرباح
      platform_profit = GREATEST(v_total_marketing - v_total_actual, 0),
      net_platform_profit = GREATEST((v_total_marketing - v_total_actual) * 0.75, 0),
      charity_amount = GREATEST((v_total_marketing - v_total_actual) * 0.25, 0),
      
      -- إعادة حساب المبلغ المتبقي للمالك
      remaining_for_owner = GREATEST(v_total_actual - COALESCE(collected_from_investors, 0), 0),
      
      updated_at = NOW()
    WHERE farm_id = v_farm_record.farm_id
    AND deleted_at IS NULL;
    
    IF FOUND THEN
      RAISE NOTICE '✅ تم تحديث البطاقة المالية للمزرعة % - المبلغ الفعلي الجديد: %', 
        v_farm_record.farm_code, v_total_actual;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION sync_owner_changes_to_finances() IS 
'مزامنة فورية للبطاقات المالية عند تحديث بيانات المالك - خاصة actual_price';

-- ═══════════════════════════════════════════════════════════
-- Trigger: تطبيق المزامنة اللحظية
-- ═══════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trigger_sync_owner_to_finances ON farm_owners;

CREATE TRIGGER trigger_sync_owner_to_finances
AFTER UPDATE ON farm_owners
FOR EACH ROW
WHEN (
  -- فقط عند تغيير actual_price أو full_name
  OLD.actual_price IS DISTINCT FROM NEW.actual_price
  OR OLD.full_name IS DISTINCT FROM NEW.full_name
)
EXECUTE FUNCTION sync_owner_changes_to_finances();

COMMENT ON TRIGGER trigger_sync_owner_to_finances ON farm_owners IS 
'يُنفّذ عند تحديث actual_price أو full_name - يحدّث البطاقات المالية فوراً';

-- ═══════════════════════════════════════════════════════════
-- إصلاح البيانات الحالية: مزامنة علي العثمان
-- ═══════════════════════════════════════════════════════════

-- تحديث البطاقة المالية لمزرعة علي العثمان
UPDATE smart_farm_finances sff
SET 
  actual_amount = f.total_actual_price,
  marketing_amount = f.total_marketing_price,
  
  -- إعادة حساب النسب
  coverage_percentage = CASE 
    WHEN f.total_actual_price > 0 THEN 
      (COALESCE(sff.collected_from_investors, 0) / f.total_actual_price * 100)
    ELSE 0
  END,
  
  completion_percentage_visual = CASE 
    WHEN f.total_actual_price > 0 THEN 
      (COALESCE(sff.collected_from_investors, 0) / f.total_actual_price * 100)
    ELSE 0
  END,
  
  -- إعادة حساب الأرباح
  platform_profit = GREATEST(f.total_marketing_price - f.total_actual_price, 0),
  net_platform_profit = GREATEST((f.total_marketing_price - f.total_actual_price) * 0.75, 0),
  charity_amount = GREATEST((f.total_marketing_price - f.total_actual_price) * 0.25, 0),
  
  -- إعادة حساب المبلغ المتبقي للمالك
  remaining_for_owner = GREATEST(f.total_actual_price - COALESCE(sff.collected_from_investors, 0), 0),
  
  updated_at = NOW()
FROM farms f
WHERE sff.farm_id = f.id
AND f.deleted_at IS NULL
AND sff.deleted_at IS NULL
AND (
  sff.actual_amount != f.total_actual_price
  OR sff.marketing_amount != f.total_marketing_price
);

-- عرض النتائج
SELECT 
  fo.full_name as "المالك",
  f.farm_code as "كود المزرعة",
  f.name_ar as "اسم المزرعة",
  fo.actual_price as "سعر المالك",
  f.total_actual_price as "المبلغ الفعلي للمزرعة",
  sff.actual_amount as "المبلغ في البطاقة المالية",
  sff.marketing_amount as "المبلغ التسويقي",
  sff.updated_at as "آخر تحديث"
FROM farm_owners fo
JOIN farms f ON f.owner_id = fo.id AND f.deleted_at IS NULL
JOIN smart_farm_finances sff ON sff.farm_id = f.id AND sff.deleted_at IS NULL
WHERE fo.deleted_at IS NULL
ORDER BY sff.updated_at DESC;
