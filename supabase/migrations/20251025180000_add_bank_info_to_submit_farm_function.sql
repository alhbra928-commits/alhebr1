/*
  # تحديث دالة إرسال طلب المراجعة لإضافة المعلومات البنكية

  1. تحديث دالة submit_farm_for_review
     - إضافة معاملات البنك
     - تخزين البيانات البنكية في الطلب

  2. الحقول المضافة:
     - p_bank_name
     - p_bank_account_number
     - p_bank_iban
     - p_bank_account_holder_name
     - p_bank_branch
*/

-- تحديث دالة إرسال طلب المراجعة
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
  p_location_lat decimal DEFAULT NULL,
  p_location_lng decimal DEFAULT NULL,
  p_additional_notes text DEFAULT NULL,
  p_varieties jsonb DEFAULT '[]'::jsonb,
  p_bank_name text DEFAULT NULL,
  p_bank_account_number text DEFAULT NULL,
  p_bank_iban text DEFAULT NULL,
  p_bank_account_holder_name text DEFAULT NULL,
  p_bank_branch text DEFAULT NULL
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_submission_id uuid;
  v_mobile_number text;
  v_variety jsonb;
  v_variety_count integer;
  v_total_trees integer := 0;
BEGIN
  -- الحصول على رقم الجوال
  SELECT mobile_number INTO v_mobile_number
  FROM farm_owner_profiles
  WHERE id = p_profile_id AND deleted_at IS NULL;

  IF v_mobile_number IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'الملف الشخصي غير موجود'
    );
  END IF;

  -- حساب إجمالي الأشجار
  FOR v_variety IN SELECT * FROM jsonb_array_elements(p_varieties)
  LOOP
    v_variety_count := (v_variety->>'count')::integer;
    v_total_trees := v_total_trees + v_variety_count;
  END LOOP;

  -- تحديث ملف صاحب المزرعة
  UPDATE farm_owner_profiles
  SET
    full_name = p_full_name,
    national_id = p_national_id,
    region = p_region,
    city = p_city,
    deed_number = p_deed_number,
    total_farm_area = p_total_farm_area,
    farm_area_unit = p_farm_area_unit,
    farm_type = p_farm_type,
    actual_total_price = p_actual_total_price,
    price_per_tree = p_price_per_tree,
    payment_grace_period = p_payment_grace_period,
    location_lat = p_location_lat,
    location_lng = p_location_lng,
    additional_notes = p_additional_notes,
    bank_name = p_bank_name,
    bank_account_number = p_bank_account_number,
    bank_iban = p_bank_iban,
    bank_account_holder_name = p_bank_account_holder_name,
    bank_branch = p_bank_branch,
    updated_at = now()
  WHERE id = p_profile_id;

  -- إنشاء طلب المراجعة
  INSERT INTO farm_submission_requests (
    profile_id,
    mobile_number,
    submitted_data,
    varieties_data,
    total_trees_count,
    status
  ) VALUES (
    p_profile_id,
    v_mobile_number,
    jsonb_build_object(
      'full_name', p_full_name,
      'national_id', p_national_id,
      'mobile_number', v_mobile_number,
      'region', p_region,
      'city', p_city,
      'deed_number', p_deed_number,
      'farm_area', p_total_farm_area,
      'farm_area_unit', p_farm_area_unit,
      'farm_type', p_farm_type,
      'actual_price', p_actual_total_price,
      'price_per_tree', p_price_per_tree,
      'payment_grace_period', p_payment_grace_period,
      'location_lat', p_location_lat,
      'location_lng', p_location_lng,
      'additional_notes', p_additional_notes,
      'bank_name', p_bank_name,
      'bank_account_number', p_bank_account_number,
      'bank_iban', p_bank_iban,
      'bank_account_holder_name', p_bank_account_holder_name,
      'bank_branch', p_bank_branch
    ),
    p_varieties,
    v_total_trees,
    'pending'
  ) RETURNING id INTO v_submission_id;

  -- حذف الأصناف القديمة وإضافة الجديدة
  DELETE FROM farm_owner_varieties WHERE profile_id = p_profile_id;

  FOR v_variety IN SELECT * FROM jsonb_array_elements(p_varieties)
  LOOP
    INSERT INTO farm_owner_varieties (
      profile_id,
      variety_type,
      variety_name,
      variety_count
    ) VALUES (
      p_profile_id,
      v_variety->>'type',
      v_variety->>'name',
      (v_variety->>'count')::integer
    );
  END LOOP;

  -- إنشاء إشعار
  INSERT INTO farm_owner_notifications (
    profile_id,
    title_ar,
    message_ar,
    notification_type,
    priority,
    metadata
  ) VALUES (
    p_profile_id,
    'تم إرسال طلبك بنجاح',
    'تم استلام طلبك وسيتم مراجعته من قبل الإدارة قريباً.',
    'submission_received',
    'high',
    jsonb_build_object(
      'submission_id', v_submission_id,
      'total_trees', v_total_trees
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'submission_id', v_submission_id,
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
