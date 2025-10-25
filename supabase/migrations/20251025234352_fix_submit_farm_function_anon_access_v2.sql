/*
  # إصلاح دالة إضافة المزرعة للمستخدم غير المسجل
  
  1. المشكلة:
     - الدالة لا تعمل للمستخدم غير المسجل (anon)
     - RLS يمنع الوصول
     
  2. الحل:
     - استخدام SECURITY DEFINER
     - منح صلاحيات للمستخدم غير المسجل
*/

-- حذف الدالة القديمة إن وجدت
DROP FUNCTION IF EXISTS submit_farm_for_review(uuid, text, text, text, text, text, numeric, text, text, numeric, numeric, integer, numeric, numeric, text, jsonb, text, text, text, text, text, uuid);

-- إنشاء الدالة الجديدة
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
  v_submission_id uuid;
  v_farm_id uuid;
  v_mobile_number text;
  v_variety jsonb;
  v_variety_count integer;
  v_total_trees integer := 0;
  v_farm_code text;
BEGIN
  -- التحقق من وجود الملف الشخصي
  SELECT mobile_number INTO v_mobile_number
  FROM farm_owner_profiles
  WHERE id = p_profile_id AND deleted_at IS NULL;

  IF v_mobile_number IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'الملف الشخصي غير موجود'
    );
  END IF;

  -- تحديث المعلومات الشخصية
  UPDATE farm_owner_profiles
  SET
    full_name = p_full_name,
    national_id = p_national_id,
    bank_name = p_bank_name,
    bank_account_number = p_bank_account_number,
    bank_iban = p_bank_iban,
    bank_account_holder_name = p_bank_account_holder_name,
    bank_branch = p_bank_branch,
    updated_at = now()
  WHERE id = p_profile_id;

  -- حساب إجمالي الأشجار
  FOR v_variety IN SELECT * FROM jsonb_array_elements(p_varieties)
  LOOP
    v_variety_count := (v_variety->>'count')::integer;
    v_total_trees := v_total_trees + v_variety_count;
  END LOOP;

  IF v_total_trees = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'يجب إضافة أصناف وأشجار'
    );
  END IF;

  -- إنشاء أو تحديث المزرعة
  IF p_farm_id IS NOT NULL THEN
    -- تحديث مزرعة موجودة
    UPDATE farms
    SET
      region_ar = p_region,
      city_ar = p_city,
      location_lat = p_location_lat,
      location_lng = p_location_lng,
      deed_number = p_deed_number,
      total_farm_area = p_total_farm_area,
      farm_area_unit = p_farm_area_unit,
      tree_type_ar = p_farm_type,
      total_trees = v_total_trees,
      available_trees = v_total_trees,
      actual_total_price = p_actual_total_price,
      price_per_tree = p_price_per_tree,
      payment_grace_period_days = p_payment_grace_period,
      additional_notes = p_additional_notes,
      submission_status = 'pending',
      updated_at = now()
    WHERE id = p_farm_id AND owner_id = p_profile_id
    RETURNING id, farm_code INTO v_farm_id, v_farm_code;
    
  ELSE
    -- إنشاء مزرعة جديدة
    INSERT INTO farms (
      owner_id,
      farm_code,
      region_ar,
      city_ar,
      location_lat,
      location_lng,
      deed_number,
      total_farm_area,
      farm_area_unit,
      tree_type_ar,
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
      'FM-' || LPAD(floor(random() * 1000000)::text, 6, '0'),
      p_region,
      p_city,
      p_location_lat,
      p_location_lng,
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
  END IF;

  IF v_farm_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'فشل في حفظ بيانات المزرعة'
    );
  END IF;

  -- حذف الأصناف القديمة وإضافة الجديدة
  DELETE FROM farm_owner_varieties
  WHERE farm_id = v_farm_id;

  -- إضافة الأصناف الجديدة
  FOR v_variety IN SELECT * FROM jsonb_array_elements(p_varieties)
  LOOP
    INSERT INTO farm_owner_varieties (
      profile_id,
      farm_id,
      variety_type,
      variety_name,
      variety_count,
      notes
    )
    VALUES (
      p_profile_id,
      v_farm_id,
      (v_variety->>'type')::text,
      (v_variety->>'name')::text,
      (v_variety->>'count')::integer,
      (v_variety->>'notes')::text
    );
  END LOOP;

  -- إنشاء سجل الطلب
  INSERT INTO farm_submission_requests (
    profile_id,
    farm_id,
    submitted_data,
    varieties_data,
    status
  )
  VALUES (
    p_profile_id,
    v_farm_id,
    jsonb_build_object(
      'full_name', p_full_name,
      'national_id', p_national_id,
      'region', p_region,
      'city', p_city,
      'deed_number', p_deed_number,
      'total_farm_area', p_total_farm_area,
      'farm_area_unit', p_farm_area_unit,
      'farm_type', p_farm_type,
      'actual_total_price', p_actual_total_price,
      'price_per_tree', p_price_per_tree,
      'payment_grace_period', p_payment_grace_period,
      'additional_notes', p_additional_notes,
      'bank_name', p_bank_name,
      'bank_account_number', p_bank_account_number,
      'bank_iban', p_bank_iban
    ),
    p_varieties,
    'pending'
  )
  RETURNING id INTO v_submission_id;

  -- إنشاء إشعار
  INSERT INTO farm_owner_notifications (
    profile_id,
    title_ar,
    message_ar,
    notification_type,
    priority
  )
  VALUES (
    p_profile_id,
    'تم إرسال طلبك بنجاح',
    'تم استلام طلب إضافة المزرعة ' || v_farm_code || ' وسيتم مراجعته من قبل الإدارة',
    'submission_received',
    'normal'
  );

  RETURN jsonb_build_object(
    'success', true,
    'submission_id', v_submission_id,
    'farm_id', v_farm_id,
    'farm_code', v_farm_code,
    'total_trees', v_total_trees,
    'message', 'تم إرسال طلبك بنجاح وسيتم مراجعته من قبل الإدارة'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION submit_farm_for_review TO anon, authenticated;