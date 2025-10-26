/*
  # إصلاح submit_farm_for_review - أسماء الأعمدة الصحيحة
  
  المشكلة:
  - الدالة تستخدم region_ar, city_ar, tree_type_ar
  - الجدول يستخدم region, city, tree_type
  
  الحل:
  - تحديث الدالة لاستخدام أسماء الأعمدة الصحيحة
*/

DROP FUNCTION IF EXISTS submit_farm_for_review(uuid, text, text, text, text, text, numeric, text, text, numeric, numeric, integer, numeric, numeric, text, jsonb, text, text, text, text, text, uuid);

CREATE OR REPLACE FUNCTION submit_farm_for_review(
  p_profile_id uuid,
  p_full_name text,
  p_national_id text,
  p_region text,
  p_city text,
  p_deed_number text,
  p_total_farm_area numeric,
  p_farm_area_unit text,
  p_farm_type text,
  p_actual_total_price numeric,
  p_price_per_tree numeric,
  p_payment_grace_period integer,
  p_location_lat numeric DEFAULT NULL,
  p_location_lng numeric DEFAULT NULL,
  p_additional_notes text DEFAULT NULL,
  p_varieties jsonb DEFAULT '[]'::jsonb,
  p_bank_name text DEFAULT NULL,
  p_bank_account_number text DEFAULT NULL,
  p_bank_iban text DEFAULT NULL,
  p_bank_account_holder_name text DEFAULT NULL,
  p_bank_branch text DEFAULT NULL,
  p_farm_id uuid DEFAULT NULL
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_farm_id uuid;
  v_farm_code text;
  v_total_trees integer := 0;
  v_variety jsonb;
BEGIN
  -- حساب إجمالي الأشجار
  FOR v_variety IN SELECT * FROM jsonb_array_elements(p_varieties)
  LOOP
    v_total_trees := v_total_trees + COALESCE((v_variety->>'count')::integer, 0);
  END LOOP;

  -- تحديث معلومات الملف الشخصي
  UPDATE farm_owner_profiles
  SET
    full_name = p_full_name,
    national_id = p_national_id,
    bank_name = p_bank_name,
    bank_account_number = p_bank_account_number,
    bank_iban = p_bank_iban,
    updated_at = now()
  WHERE id = p_profile_id;

  -- إنشاء كود المزرعة
  v_farm_code := 'FM-' || LPAD(floor(random() * 1000000)::text, 6, '0');
  
  -- إنشاء المزرعة (استخدام أسماء الأعمدة الصحيحة)
  INSERT INTO farms (
    owner_id,
    farm_code,
    region,           -- ✅ بدون _ar
    city,             -- ✅ بدون _ar
    deed_number,
    total_farm_area,
    farm_area_unit,
    tree_type,        -- ✅ بدون _ar
    total_trees,
    reserved_trees,
    available_trees,
    actual_total_price,
    price_per_tree,
    payment_grace_period_days,
    additional_notes,
    status,
    submission_status
  )
  VALUES (
    p_profile_id,
    v_farm_code,
    p_region,
    p_city,
    p_deed_number,
    p_total_farm_area,
    p_farm_area_unit,
    p_farm_type,
    v_total_trees,
    0,
    v_total_trees,
    p_actual_total_price,
    p_price_per_tree,
    p_payment_grace_period,
    p_additional_notes,
    'متاح',
    'pending'
  )
  RETURNING id, farm_code INTO v_farm_id, v_farm_code;

  -- إضافة الأصناف
  FOR v_variety IN SELECT * FROM jsonb_array_elements(p_varieties)
  LOOP
    INSERT INTO farm_owner_varieties (
      profile_id,
      farm_id,
      variety_type,
      variety_name,
      variety_count
    )
    VALUES (
      p_profile_id,
      v_farm_id,
      (v_variety->>'type')::text,
      (v_variety->>'name')::text,
      (v_variety->>'count')::integer
    );
  END LOOP;

  -- إرجاع النتيجة
  RETURN jsonb_build_object(
    'success', true,
    'farm_id', v_farm_id,
    'farm_code', v_farm_code,
    'total_trees', v_total_trees,
    'message', 'تم إرسال الطلب بنجاح'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION submit_farm_for_review TO anon;
GRANT EXECUTE ON FUNCTION submit_farm_for_review TO authenticated;
