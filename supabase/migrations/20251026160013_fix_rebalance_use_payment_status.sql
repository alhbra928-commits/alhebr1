/*
  # إصلاح: استخدام payment_status بدلاً من booking_status

  المشكلة: كنا نحسب الأرباح بناءً على booking_status = 'verified'
  الحل: نحسب بناءً على payment_status = 'completed'
*/

CREATE OR REPLACE FUNCTION calculate_real_financial_data(p_farm_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_farm_id UUID;
  v_farm_name TEXT;
  v_total_marketing NUMERIC := 0;
  v_total_actual NUMERIC := 0;
  v_total_collected NUMERIC := 0;
  v_total_verified NUMERIC := 0;
  v_total_pending NUMERIC := 0;
  v_total_investors INTEGER := 0;
  v_total_trees INTEGER := 0;
  v_platform_profit NUMERIC := 0;
  v_charity_amount NUMERIC := 0;
  v_net_profit NUMERIC := 0;
  v_marketing_price NUMERIC := 0;
  v_actual_price NUMERIC := 0;
BEGIN
  -- الحصول على بيانات المزرعة
  SELECT 
    id, 
    name_ar,
    COALESCE(total_marketing_price, 0),
    COALESCE(total_actual_price, 0)
  INTO v_farm_id, v_farm_name, v_marketing_price, v_actual_price
  FROM farms
  WHERE farm_code = p_farm_code
    AND deleted_at IS NULL;
  
  IF v_farm_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Farm not found');
  END IF;
  
  -- حساب البيانات الحقيقية من الحجوزات
  -- نستخدم payment_status = 'completed' لأن هذا هو المبلغ المُحصّل فعلياً
  SELECT 
    COALESCE(SUM(r.total_amount), 0),
    COALESCE(SUM(CASE WHEN r.payment_status = 'completed' THEN r.total_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN r.booking_status IN ('verified', 'approved') THEN r.total_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN r.payment_status = 'pending' THEN r.total_amount ELSE 0 END), 0),
    COUNT(DISTINCT r.investor_id),
    COALESCE(SUM(r.number_of_trees), 0)
  INTO 
    v_total_marketing,
    v_total_collected,
    v_total_verified,
    v_total_pending,
    v_total_investors,
    v_total_trees
  FROM reservations r
  WHERE r.farm_id = v_farm_id
    AND r.deleted_at IS NULL;
  
  -- حساب الأرباح بناءً على المدفوعات المُحصّلة
  -- ربح المنصة = (السعر التسويقي - السعر الفعلي) × عدد الأشجار المباعة
  v_platform_profit := GREATEST(
    (v_marketing_price - v_actual_price) * v_total_trees / NULLIF((SELECT total_trees FROM farms WHERE id = v_farm_id), 0),
    0
  );
  
  v_charity_amount := v_platform_profit * 0.25;
  v_net_profit := v_platform_profit - v_charity_amount;
  
  -- بناء النتيجة
  v_result := jsonb_build_object(
    'farm_code', p_farm_code,
    'farm_name', v_farm_name,
    'total_marketing_price', v_marketing_price,
    'total_actual_price', v_actual_price,
    'total_revenue_collected', v_total_collected,
    'total_verified', v_total_verified,
    'total_pending', v_total_pending,
    'platform_profit', v_platform_profit,
    'charity_amount', v_charity_amount,
    'net_platform_profit', v_net_profit,
    'total_investors', v_total_investors,
    'total_trees_sold', v_total_trees,
    'financial_completion_percentage', 
      CASE 
        WHEN v_marketing_price > 0 THEN (v_total_collected / v_marketing_price * 100)
        ELSE 0
      END
  );
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION calculate_real_financial_data IS 'حساب البيانات المالية الحقيقية بناءً على payment_status = completed';
