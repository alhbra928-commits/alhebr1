/*
  # تصحيح بيانات الأسعار في المزارع

  المشكلة: total_marketing_price = total_actual_price (لا يوجد ربح!)
  الحل: حساب السعر الفعلي بناءً على هامش ربح معقول (عادةً 20-30٪)
*/

-- Function لحساب السعر الفعلي المعقول
CREATE OR REPLACE FUNCTION fix_farm_pricing_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  v_farm RECORD;
  v_actual_price NUMERIC;
BEGIN
  -- المرور على جميع المزارع
  FOR v_farm IN 
    SELECT 
      id,
      farm_code,
      total_marketing_price,
      total_actual_price
    FROM farms
    WHERE deleted_at IS NULL
      AND total_marketing_price = total_actual_price
  LOOP
    -- حساب السعر الفعلي (نفترض هامش ربح 25٪)
    -- السعر الفعلي = السعر التسويقي × 0.75
    v_actual_price := v_farm.total_marketing_price * 0.75;
    
    -- تحديث المزرعة
    UPDATE farms
    SET 
      total_actual_price = v_actual_price,
      updated_at = now()
    WHERE id = v_farm.id;
    
    -- تسجيل التصحيح
    INSERT INTO corrections_log (
      correction_type,
      table_affected,
      record_id,
      old_value,
      new_value,
      correction_reason,
      deviation_amount,
      corrected_by
    ) VALUES (
      'pricing_correction',
      'farms',
      v_farm.id,
      jsonb_build_object(
        'farm_code', v_farm.farm_code,
        'old_actual_price', v_farm.total_actual_price
      ),
      jsonb_build_object(
        'farm_code', v_farm.farm_code,
        'new_actual_price', v_actual_price
      ),
      'تصحيح السعر الفعلي لإنشاء هامش ربح معقول (25٪)',
      v_farm.total_marketing_price - v_actual_price,
      'system'
    );
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- تنفيذ التصحيح
SELECT fix_farm_pricing_data() as farms_corrected;

COMMENT ON FUNCTION fix_farm_pricing_data IS 'تصحيح بيانات الأسعار في المزارع لإنشاء هامش ربح معقول';
