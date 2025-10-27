/*
  # تحسين نظام الردود التلقائية مع الرد الافتراضي
  
  1. التغييرات
    - تحديث دالة find_matching_auto_response لترجع الرد الافتراضي عندما لا تجد رد
    - الرد الافتراضي هو أول رد نشط مع is_default_fallback = true
    - يتضمن الرابط وجميع الحقول (response_ar, whatsapp_business_link)
  
  2. المنطق
    - البحث عن رد مطابق أولاً (is_default_fallback = false)
    - إذا لم يجد، يبحث عن الرد الافتراضي (is_default_fallback = true)
    - يعيد كل التفاصيل بما فيها الرابط
*/

-- تحديث دالة البحث عن الردود التلقائية لدعم الرد الافتراضي
CREATE OR REPLACE FUNCTION find_matching_auto_response(
  p_message text,
  p_language text DEFAULT 'ar'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_lower text;
  v_best_match RECORD;
  v_default_fallback RECORD;
  v_response_text text;
BEGIN
  v_message_lower := LOWER(TRIM(p_message));
  
  -- Validate input
  IF v_message_lower = '' OR v_message_lower IS NULL THEN
    RETURN jsonb_build_object(
      'found', false,
      'message', 'رسالة فارغة'
    );
  END IF;
  
  -- البحث عن أفضل رد مطابق (استبعاد الردود الافتراضية)
  SELECT *
  INTO v_best_match
  FROM whatsapp_auto_responses
  WHERE deleted_at IS NULL
    AND status = 'active'
    AND COALESCE(is_default_fallback, false) = false  -- استبعاد الردود الافتراضية
    AND keyword IS NOT NULL 
    AND TRIM(keyword) != ''
    AND response_ar IS NOT NULL 
    AND TRIM(response_ar) != ''
    AND (
      -- Exact keyword match
      v_message_lower = LOWER(keyword)
      OR
      -- Message contains keyword
      v_message_lower LIKE '%' || LOWER(keyword) || '%'
    )
  ORDER BY
    -- أولوية للمطابقة الدقيقة
    CASE WHEN v_message_lower = LOWER(keyword) THEN 1 ELSE 2 END,
    -- ثم حسب الأولوية
    priority DESC,
    -- ثم حسب عدد الاستخدام
    usage_count DESC,
    -- أخيراً حسب تاريخ الإنشاء
    created_at DESC
  LIMIT 1;
  
  -- إذا وُجد رد مطابق
  IF v_best_match.id IS NOT NULL THEN
    -- تحديث إحصاءات الاستخدام
    UPDATE whatsapp_auto_responses
    SET 
      usage_count = usage_count + 1,
      last_used_at = NOW(),
      updated_at = NOW()
    WHERE id = v_best_match.id;
    
    -- Get response text based on language
    v_response_text := CASE 
      WHEN p_language = 'en' AND v_best_match.response_en IS NOT NULL AND TRIM(v_best_match.response_en) != ''
        THEN v_best_match.response_en
      ELSE v_best_match.response_ar
    END;
    
    -- إرجاع الرد المطابق
    RETURN jsonb_build_object(
      'found', true,
      'response', v_response_text,
      'intent', v_best_match.intent,
      'priority', v_best_match.priority,
      'keyword', v_best_match.keyword,
      'response_id', v_best_match.id,
      'ai_generated', v_best_match.ai_generated,
      'whatsapp_business_link', v_best_match.whatsapp_business_link,
      'is_default_fallback', false
    );
  END IF;
  
  -- لم يُعثر على رد مطابق، البحث عن الرد الافتراضي
  SELECT *
  INTO v_default_fallback
  FROM whatsapp_auto_responses
  WHERE deleted_at IS NULL
    AND status = 'active'
    AND is_default_fallback = true
    AND response_ar IS NOT NULL 
    AND TRIM(response_ar) != ''
  ORDER BY
    priority DESC,  -- أعلى أولوية
    created_at DESC -- الأحدث
  LIMIT 1;
  
  -- إذا وُجد رد افتراضي
  IF v_default_fallback.id IS NOT NULL THEN
    -- تحديث إحصاءات الاستخدام
    UPDATE whatsapp_auto_responses
    SET 
      usage_count = usage_count + 1,
      last_used_at = NOW(),
      updated_at = NOW()
    WHERE id = v_default_fallback.id;
    
    -- Get response text based on language
    v_response_text := CASE 
      WHEN p_language = 'en' AND v_default_fallback.response_en IS NOT NULL AND TRIM(v_default_fallback.response_en) != ''
        THEN v_default_fallback.response_en
      ELSE v_default_fallback.response_ar
    END;
    
    -- إرجاع الرد الافتراضي مع كل التفاصيل
    RETURN jsonb_build_object(
      'found', true,
      'response', v_response_text,
      'intent', v_default_fallback.intent,
      'priority', v_default_fallback.priority,
      'keyword', v_default_fallback.keyword,
      'response_id', v_default_fallback.id,
      'ai_generated', v_default_fallback.ai_generated,
      'whatsapp_business_link', v_default_fallback.whatsapp_business_link,
      'is_default_fallback', true
    );
  END IF;
  
  -- لا يوجد رد مطابق ولا رد افتراضي
  RETURN jsonb_build_object(
    'found', false,
    'message', 'لم يتم العثور على رد مطابق أو رد افتراضي'
  );
END;
$$;
