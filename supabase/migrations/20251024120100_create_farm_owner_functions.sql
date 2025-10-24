/*
  # وظائف لوحة صاحب المزرعة
  # Farm Owner Dashboard Functions

  ## الوظائف:
  1. إنشاء/تسجيل دخول صاحب المزرعة
  2. إرسال طلب المراجعة
  3. اعتماد/رفض الطلب من الإدارة
  4. إنشاء إشعار جديد
  5. الحصول على حالة المزرعة
  6. الربط التلقائي مع farm_owners
*/

-- ========================================
-- 1️⃣ دالة تسجيل/دخول صاحب المزرعة
-- ========================================
CREATE OR REPLACE FUNCTION farm_owner_login_or_create(
  p_mobile_number text
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_id uuid;
  v_profile_status text;
  v_session_token text;
  v_farm_owner_id uuid;
BEGIN
  -- تنظيف رقم الجوال
  p_mobile_number := trim(p_mobile_number);

  -- التحقق من وجود الملف
  SELECT id, status, farm_owner_id
  INTO v_profile_id, v_profile_status, v_farm_owner_id
  FROM farm_owner_profiles
  WHERE mobile_number = p_mobile_number
    AND deleted_at IS NULL;

  -- إذا لم يوجد، إنشاء ملف جديد
  IF v_profile_id IS NULL THEN
    INSERT INTO farm_owner_profiles (
      mobile_number,
      status
    ) VALUES (
      p_mobile_number,
      'pending'
    ) RETURNING id, status INTO v_profile_id, v_profile_status;

    -- إنشاء إشعار ترحيبي
    INSERT INTO farm_owner_notifications (
      profile_id,
      title_ar,
      message_ar,
      notification_type,
      priority
    ) VALUES (
      v_profile_id,
      'مرحباً بك في منصة الحبر الزراعية',
      'نرحب بك في منصتنا. يمكنك الآن إدخال بيانات مزرعتك لعرضها على المستثمرين.',
      'system_alert',
      'normal'
    );
  END IF;

  -- إنشاء session token
  v_session_token := encode(gen_random_bytes(32), 'base64');

  -- إنشاء جلسة جديدة
  INSERT INTO farm_owner_sessions (
    profile_id,
    mobile_number,
    session_token,
    is_active,
    expires_at
  ) VALUES (
    v_profile_id,
    p_mobile_number,
    v_session_token,
    true,
    now() + interval '7 days'
  );

  -- إنهاء الجلسات القديمة
  UPDATE farm_owner_sessions
  SET is_active = false,
      ended_at = now()
  WHERE profile_id = v_profile_id
    AND session_token != v_session_token
    AND is_active = true;

  -- إرجاع البيانات
  RETURN jsonb_build_object(
    'success', true,
    'profile_id', v_profile_id,
    'status', v_profile_status,
    'session_token', v_session_token,
    'farm_owner_id', v_farm_owner_id,
    'is_new_profile', (v_farm_owner_id IS NULL)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- ========================================
-- 2️⃣ دالة إرسال طلب المراجعة
-- ========================================
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
  p_varieties jsonb DEFAULT '[]'::jsonb
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

  -- حساب إجمالي الأشجار من الأصناف
  FOR v_variety IN SELECT * FROM jsonb_array_elements(p_varieties)
  LOOP
    v_variety_count := (v_variety->>'count')::integer;
    v_total_trees := v_total_trees + v_variety_count;
  END LOOP;

  -- تحديث الملف الشخصي
  UPDATE farm_owner_profiles
  SET
    full_name = p_full_name,
    national_id = p_national_id,
    region = p_region,
    city = p_city,
    location_lat = p_location_lat,
    location_lng = p_location_lng,
    deed_number = p_deed_number,
    total_farm_area = p_total_farm_area,
    farm_area_unit = p_farm_area_unit,
    farm_type = p_farm_type,
    actual_total_price = p_actual_total_price,
    price_per_tree = p_price_per_tree,
    payment_grace_period = p_payment_grace_period,
    additional_notes = p_additional_notes,
    updated_at = now()
  WHERE id = p_profile_id;

  -- حذف الأصناف القديمة
  DELETE FROM farm_varieties_data WHERE profile_id = p_profile_id;

  -- إضافة الأصناف الجديدة
  FOR v_variety IN SELECT * FROM jsonb_array_elements(p_varieties)
  LOOP
    INSERT INTO farm_varieties_data (
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

  -- إنشاء طلب المراجعة
  INSERT INTO farm_submission_requests (
    profile_id,
    submitted_data,
    varieties_data,
    status
  ) VALUES (
    p_profile_id,
    jsonb_build_object(
      'full_name', p_full_name,
      'national_id', p_national_id,
      'mobile_number', v_mobile_number,
      'region', p_region,
      'city', p_city,
      'location_lat', p_location_lat,
      'location_lng', p_location_lng,
      'deed_number', p_deed_number,
      'total_farm_area', p_total_farm_area,
      'farm_area_unit', p_farm_area_unit,
      'farm_type', p_farm_type,
      'actual_total_price', p_actual_total_price,
      'price_per_tree', p_price_per_tree,
      'payment_grace_period', p_payment_grace_period,
      'additional_notes', p_additional_notes,
      'total_trees', v_total_trees
    ),
    p_varieties,
    'pending'
  ) RETURNING id INTO v_submission_id;

  -- إنشاء إشعار
  INSERT INTO farm_owner_notifications (
    profile_id,
    title_ar,
    message_ar,
    notification_type,
    priority,
    whatsapp_sent,
    metadata
  ) VALUES (
    p_profile_id,
    '🟡 تم استلام بيانات مزرعتك',
    'تم استلام بيانات مزرعتك بنجاح، وسيتم مراجعتها من قبل الإدارة قريباً. سنبقيك على اطلاع بأي تحديثات.',
    'submission_received',
    'high',
    true,
    jsonb_build_object(
      'submission_id', v_submission_id,
      'total_trees', v_total_trees
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'submission_id', v_submission_id,
    'total_trees', v_total_trees,
    'message', 'تم إرسال طلبك بنجاح'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- ========================================
-- 3️⃣ دالة اعتماد طلب المراجعة
-- ========================================
CREATE OR REPLACE FUNCTION approve_farm_submission(
  p_submission_id uuid,
  p_admin_id uuid,
  p_admin_notes text DEFAULT NULL
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_id uuid;
  v_farm_owner_id uuid;
  v_submission_data jsonb;
  v_varieties_data jsonb;
  v_mobile_number text;
BEGIN
  -- الحصول على بيانات الطلب
  SELECT profile_id, submitted_data, varieties_data
  INTO v_profile_id, v_submission_data, v_varieties_data
  FROM farm_submission_requests
  WHERE id = p_submission_id AND deleted_at IS NULL;

  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'الطلب غير موجود');
  END IF;

  -- الحصول على رقم الجوال
  SELECT mobile_number INTO v_mobile_number
  FROM farm_owner_profiles
  WHERE id = v_profile_id;

  -- إنشاء/تحديث في farm_owners
  INSERT INTO farm_owners (
    full_name,
    mobile_number,
    email,
    region,
    city,
    farm_area,
    farm_area_unit,
    farm_type,
    actual_price,
    deed_number,
    farm_location_region,
    farm_location_city,
    payment_grace_period,
    admin_notes,
    status
  ) VALUES (
    v_submission_data->>'full_name',
    v_mobile_number,
    NULL,
    v_submission_data->>'region',
    v_submission_data->>'city',
    (v_submission_data->>'total_farm_area')::numeric,
    v_submission_data->>'farm_area_unit',
    v_submission_data->>'farm_type',
    (v_submission_data->>'actual_total_price')::numeric,
    v_submission_data->>'deed_number',
    v_submission_data->>'region',
    v_submission_data->>'city',
    (v_submission_data->>'payment_grace_period')::integer,
    p_admin_notes,
    'active'
  )
  ON CONFLICT (mobile_number)
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    region = EXCLUDED.region,
    city = EXCLUDED.city,
    farm_area = EXCLUDED.farm_area,
    farm_type = EXCLUDED.farm_type,
    actual_price = EXCLUDED.actual_price,
    deed_number = EXCLUDED.deed_number,
    payment_grace_period = EXCLUDED.payment_grace_period,
    admin_notes = EXCLUDED.admin_notes,
    updated_at = now()
  RETURNING id INTO v_farm_owner_id;

  -- تحديث الملف الشخصي
  UPDATE farm_owner_profiles
  SET
    farm_owner_id = v_farm_owner_id,
    status = 'approved',
    approved_at = now(),
    approved_by = p_admin_id,
    admin_notes = p_admin_notes
  WHERE id = v_profile_id;

  -- تحديث الطلب
  UPDATE farm_submission_requests
  SET
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = p_admin_id,
    admin_notes = p_admin_notes
  WHERE id = p_submission_id;

  -- إنشاء إشعار
  INSERT INTO farm_owner_notifications (
    profile_id,
    title_ar,
    message_ar,
    notification_type,
    priority,
    whatsapp_sent,
    metadata
  ) VALUES (
    v_profile_id,
    '🟢 تم اعتماد مزرعتك',
    'مبروك! تم اعتماد مزرعتك من قبل الإدارة وأصبحت جاهزة للعرض على المستثمرين.',
    'submission_approved',
    'high',
    true,
    jsonb_build_object(
      'submission_id', p_submission_id,
      'farm_owner_id', v_farm_owner_id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'farm_owner_id', v_farm_owner_id,
    'message', 'تم اعتماد المزرعة بنجاح'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- ========================================
-- 4️⃣ دالة رفض طلب المراجعة
-- ========================================
CREATE OR REPLACE FUNCTION reject_farm_submission(
  p_submission_id uuid,
  p_admin_id uuid,
  p_rejection_reason text,
  p_admin_notes text DEFAULT NULL
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  -- الحصول على profile_id
  SELECT profile_id INTO v_profile_id
  FROM farm_submission_requests
  WHERE id = p_submission_id AND deleted_at IS NULL;

  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'الطلب غير موجود');
  END IF;

  -- تحديث الملف الشخصي
  UPDATE farm_owner_profiles
  SET
    status = 'rejected',
    rejected_at = now(),
    rejected_by = p_admin_id,
    rejection_reason = p_rejection_reason,
    admin_notes = p_admin_notes
  WHERE id = v_profile_id;

  -- تحديث الطلب
  UPDATE farm_submission_requests
  SET
    status = 'rejected',
    reviewed_at = now(),
    reviewed_by = p_admin_id,
    rejection_reason = p_rejection_reason,
    admin_notes = p_admin_notes
  WHERE id = p_submission_id;

  -- إنشاء إشعار
  INSERT INTO farm_owner_notifications (
    profile_id,
    title_ar,
    message_ar,
    notification_type,
    priority,
    whatsapp_sent,
    metadata
  ) VALUES (
    v_profile_id,
    '🔴 تم رفض طلب المزرعة',
    format('عذراً، تم رفض طلب مزرعتك. السبب: %s. يمكنك تعديل البيانات وإعادة الإرسال.', p_rejection_reason),
    'submission_rejected',
    'high',
    true,
    jsonb_build_object(
      'submission_id', p_submission_id,
      'rejection_reason', p_rejection_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم رفض الطلب وإرسال إشعار للمالك'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- ========================================
-- 5️⃣ دالة الحصول على حالة المزرعة
-- ========================================
CREATE OR REPLACE FUNCTION get_farm_status(
  p_profile_id uuid
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_status text;
  v_farm_owner_id uuid;
  v_farm_id uuid;
  v_total_trees integer;
  v_reserved_trees integer;
  v_available_trees integer;
  v_progress_percentage numeric;
  v_sales_status text;
  v_result jsonb;
BEGIN
  -- الحصول على بيانات الملف
  SELECT status, farm_owner_id
  INTO v_profile_status, v_farm_owner_id
  FROM farm_owner_profiles
  WHERE id = p_profile_id AND deleted_at IS NULL;

  IF v_profile_status IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'الملف الشخصي غير موجود'
    );
  END IF;

  v_result := jsonb_build_object(
    'profile_status', v_profile_status,
    'farm_owner_id', v_farm_owner_id
  );

  -- إذا كان معتمد، البحث عن المزرعة
  IF v_farm_owner_id IS NOT NULL THEN
    SELECT
      f.id,
      f.total_trees,
      f.sales_status
    INTO v_farm_id, v_total_trees, v_sales_status
    FROM farms f
    WHERE f.owner_id = v_farm_owner_id
      AND f.deleted_at IS NULL
    LIMIT 1;

    IF v_farm_id IS NOT NULL THEN
      -- حساب نسبة التقدم
      SELECT
        COALESCE(SUM(r.reserved_trees), 0)
      INTO v_reserved_trees
      FROM reservations r
      WHERE r.farm_id = v_farm_id
        AND r.booking_status IN ('pending', 'confirmed', 'completed')
        AND r.deleted_at IS NULL;

      v_available_trees := v_total_trees - v_reserved_trees;
      v_progress_percentage := ROUND((v_reserved_trees::numeric / NULLIF(v_total_trees, 0)) * 100, 2);

      v_result := v_result || jsonb_build_object(
        'farm_id', v_farm_id,
        'total_trees', v_total_trees,
        'reserved_trees', v_reserved_trees,
        'available_trees', v_available_trees,
        'progress_percentage', v_progress_percentage,
        'sales_status', v_sales_status,
        'is_published', true
      );
    ELSE
      v_result := v_result || jsonb_build_object(
        'is_published', false,
        'message', 'المزرعة معتمدة ولكن لم يتم نشرها بعد'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_result
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- ========================================
-- 6️⃣ دالة إنشاء إشعار يدوي
-- ========================================
CREATE OR REPLACE FUNCTION create_farm_owner_notification(
  p_profile_id uuid,
  p_title_ar text,
  p_message_ar text,
  p_notification_type text,
  p_priority text DEFAULT 'normal',
  p_send_whatsapp boolean DEFAULT false,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO farm_owner_notifications (
    profile_id,
    title_ar,
    message_ar,
    notification_type,
    priority,
    whatsapp_sent,
    metadata
  ) VALUES (
    p_profile_id,
    p_title_ar,
    p_message_ar,
    p_notification_type,
    p_priority,
    p_send_whatsapp,
    p_metadata
  ) RETURNING id INTO v_notification_id;

  RETURN jsonb_build_object(
    'success', true,
    'notification_id', v_notification_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
