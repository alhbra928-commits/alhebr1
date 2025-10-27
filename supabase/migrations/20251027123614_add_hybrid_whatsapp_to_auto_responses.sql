/*
  # إضافة دعم الرسالة الهجينة للردود التلقائية

  ## التحديثات:
  1. دالة get_auto_response_with_hybrid_link:
     - تبحث عن رد تلقائي بناءً على كلمة مفتاحية
     - تعيد الرد + رابط واتساب الهجين إذا كان مفعلاً
     - تدعم الرسالة الهجينة (يدوية + تلقائية)

  2. النتيجة:
     - response_text: نص الرد
     - whatsapp_link: رابط واتساب (بسيط أو هجين)
     - is_hybrid: هل الرابط هجين؟
     - intent: نية الرد
*/

-- دالة للحصول على رد تلقائي مع رابط واتساب هجين
CREATE OR REPLACE FUNCTION get_auto_response_with_hybrid_link(
  p_user_message text,
  p_user_type text DEFAULT 'visitor',
  p_context text DEFAULT 'محادثة الزر الذكي'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response record;
  v_base_message text;
  v_auto_data text;
  v_final_message text;
  v_encoded_message text;
  v_hybrid_link text;
  v_result jsonb;
  v_formatted_date text;
  v_formatted_time text;
  v_user_type_label text;
BEGIN
  -- البحث عن رد تلقائي مطابق
  SELECT *
  INTO v_response
  FROM whatsapp_auto_responses
  WHERE status = 'active'
    AND deleted_at IS NULL
    AND LOWER(p_user_message) LIKE '%' || LOWER(keyword) || '%'
  ORDER BY priority DESC, usage_count DESC
  LIMIT 1;

  -- إذا لم يتم العثور على رد
  IF v_response IS NULL THEN
    RETURN jsonb_build_object(
      'found', false,
      'message', 'لم يتم العثور على رد مطابق'
    );
  END IF;

  -- تحديث عداد الاستخدام
  UPDATE whatsapp_auto_responses
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = v_response.id;

  -- إذا كان هناك رابط واتساب وكانت الرسالة الهجينة مفعلة
  IF v_response.whatsapp_business_link IS NOT NULL 
     AND v_response.whatsapp_business_link != '' 
     AND v_response.use_hybrid_message = true THEN
    
    -- جلب الرسالة الأساسية من الإعدادات
    SELECT setting_value INTO v_base_message
    FROM system_settings
    WHERE setting_key = 'business_whatsapp_message';
    
    IF v_base_message IS NULL THEN
      v_base_message := E'مرحبًا 👋\nتم تحويلك من منصة تملك النخيل والزيتون 🌴\nسعداء بخدمتك، يرجى توضيح استفسارك أدناه 👇';
    END IF;

    -- تنسيق التاريخ والوقت
    v_formatted_date := TO_CHAR(NOW(), 'DD/MM/YYYY');
    v_formatted_time := TO_CHAR(NOW(), 'HH12:MI PM');

    -- ترجمة نوع المستخدم
    v_user_type_label := CASE p_user_type
      WHEN 'investor' THEN 'مستثمر 💰'
      WHEN 'farm_owner' THEN 'صاحب مزرعة 🌾'
      WHEN 'admin' THEN 'مدير 👨‍💼'
      ELSE 'زائر 👤'
    END;

    -- بناء البيانات التلقائية
    v_auto_data := E'———————————————\n' ||
                   'نوع العميل: ' || v_user_type_label || E'\n' ||
                   'المصدر: ' || p_context || E'\n' ||
                   'التاريخ: ' || v_formatted_date || ' – ' || v_formatted_time;

    -- دمج الرسالة الكاملة
    v_final_message := v_base_message || E'\n\n' || v_auto_data;

    -- ترميز الرسالة للرابط (URL encoding بسيط)
    v_encoded_message := regexp_replace(v_final_message, E'\n', '%0A', 'g');
    v_encoded_message := regexp_replace(v_encoded_message, ' ', '%20', 'g');
    v_encoded_message := regexp_replace(v_encoded_message, ':', '%3A', 'g');
    v_encoded_message := regexp_replace(v_encoded_message, '—', '%E2%80%94', 'g');
    v_encoded_message := regexp_replace(v_encoded_message, '👋', '%F0%9F%91%8B', 'g');
    v_encoded_message := regexp_replace(v_encoded_message, '🌴', '%F0%9F%8C%B4', 'g');
    v_encoded_message := regexp_replace(v_encoded_message, '👇', '%F0%9F%91%87', 'g');
    v_encoded_message := regexp_replace(v_encoded_message, '💰', '%F0%9F%92%B0', 'g');
    v_encoded_message := regexp_replace(v_encoded_message, '🌾', '%F0%9F%8C%BE', 'g');
    v_encoded_message := regexp_replace(v_encoded_message, '👨‍💼', '%F0%9F%91%A8%E2%80%8D%F0%9F%92%BC', 'g');
    v_encoded_message := regexp_replace(v_encoded_message, '👤', '%F0%9F%91%A4', 'g');

    -- بناء الرابط الهجين
    v_hybrid_link := v_response.whatsapp_business_link || '?text=' || v_encoded_message;

    -- إرجاع النتيجة
    RETURN jsonb_build_object(
      'found', true,
      'response_text', v_response.response_ar,
      'whatsapp_link', v_hybrid_link,
      'is_hybrid', true,
      'intent', v_response.intent,
      'keyword', v_response.keyword,
      'preview_message', v_final_message
    );

  -- إذا كان هناك رابط بسيط بدون رسالة هجينة
  ELSIF v_response.whatsapp_business_link IS NOT NULL 
        AND v_response.whatsapp_business_link != '' THEN
    
    RETURN jsonb_build_object(
      'found', true,
      'response_text', v_response.response_ar,
      'whatsapp_link', v_response.whatsapp_business_link,
      'is_hybrid', false,
      'intent', v_response.intent,
      'keyword', v_response.keyword
    );

  -- رد نصي فقط بدون رابط
  ELSE
    RETURN jsonb_build_object(
      'found', true,
      'response_text', v_response.response_ar,
      'whatsapp_link', NULL,
      'is_hybrid', false,
      'intent', v_response.intent,
      'keyword', v_response.keyword
    );
  END IF;

END;
$$;

-- إضافة تعليق على الدالة
COMMENT ON FUNCTION get_auto_response_with_hybrid_link IS 
'دالة للحصول على رد تلقائي مع رابط واتساب هجين - تدعم الرسالة المرافقة (يدوية + تلقائية)';
