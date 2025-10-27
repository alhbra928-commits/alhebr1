/*
  # إصلاح مطابقة الردود الافتراضية
  
  المشكلة:
  - الدالة تبحث عن الكلمة المفتاحية حتى لو كانت __fallback_default__
  - يجب استبعاد الكلمات التي تبدأ بـ __ من المطابقة العادية
  
  الحل:
  - إضافة شرط لاستبعاد الكلمات التي تبدأ بـ __
  - هذه الكلمات للاستخدام الداخلي فقط
*/

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
    AND COALESCE(is_default_fallback, false) = false
    AND keyword IS NOT NULL 
    AND TRIM(keyword) != ''
    AND keyword NOT LIKE '\\_\\_%'  -- استبعاد الكلمات الخاصة التي تبدأ بـ __
    AND response_ar IS NOT NULL 
    AND TRIM(response_ar) != ''
    AND (
      v_message_lower = LOWER(keyword)
      OR
      v_message_lower LIKE '%' || LOWER(keyword) || '%'
    )
  ORDER BY
    CASE WHEN v_message_lower = LOWER(keyword) THEN 1 ELSE 2 END,
    priority DESC,
    usage_count DESC,
    created_at DESC
  LIMIT 1;
  
  -- إذا وُجد رد مطابق
  IF v_best_match.id IS NOT NULL THEN
    UPDATE whatsapp_auto_responses
    SET 
      usage_count = usage_count + 1,
      last_used_at = NOW(),
      updated_at = NOW()
    WHERE id = v_best_match.id;
    
    v_response_text := CASE 
      WHEN p_language = 'en' AND v_best_match.response_en IS NOT NULL AND TRIM(v_best_match.response_en) != ''
        THEN v_best_match.response_en
      ELSE v_best_match.response_ar
    END;
    
    RETURN jsonb_build_object(
      'found', true,
      'auto_response', true,
      'response', v_response_text,
      'intent', v_best_match.intent,
      'priority', v_best_match.priority,
      'keyword', v_best_match.keyword,
      'response_id', v_best_match.id,
      'ai_generated', v_best_match.ai_generated,
      'whatsapp_business_link', v_best_match.whatsapp_business_link,
      'whatsapp_link', v_best_match.whatsapp_business_link,
      'hybrid_link', v_best_match.whatsapp_business_link,
      'use_hybrid_message', COALESCE(v_best_match.use_hybrid_message, false),
      'is_default_fallback', false
    );
  END IF;
  
  -- لم يُعثر على رد مطابق، البحث عن الرد الافتراضي المفعّل
  SELECT *
  INTO v_default_fallback
  FROM whatsapp_auto_responses
  WHERE deleted_at IS NULL
    AND status = 'active'
    AND is_default_fallback = true
    AND fallback_enabled = true
    AND response_ar IS NOT NULL 
    AND TRIM(response_ar) != ''
  ORDER BY
    priority DESC,
    created_at DESC
  LIMIT 1;
  
  -- إذا وُجد رد افتراضي مفعّل
  IF v_default_fallback.id IS NOT NULL THEN
    UPDATE whatsapp_auto_responses
    SET 
      usage_count = usage_count + 1,
      last_used_at = NOW(),
      updated_at = NOW()
    WHERE id = v_default_fallback.id;
    
    v_response_text := CASE 
      WHEN p_language = 'en' AND v_default_fallback.response_en IS NOT NULL AND TRIM(v_default_fallback.response_en) != ''
        THEN v_default_fallback.response_en
      ELSE v_default_fallback.response_ar
    END;
    
    -- إرجاع الرد الافتراضي مع كل التفاصيل بما فيها الرابط
    RETURN jsonb_build_object(
      'found', true,
      'auto_response', true,
      'response', v_response_text,
      'intent', v_default_fallback.intent,
      'priority', v_default_fallback.priority,
      'keyword', v_default_fallback.keyword,
      'response_id', v_default_fallback.id,
      'ai_generated', v_default_fallback.ai_generated,
      'whatsapp_business_link', v_default_fallback.whatsapp_business_link,
      'whatsapp_link', v_default_fallback.whatsapp_business_link,
      'hybrid_link', v_default_fallback.whatsapp_business_link,
      'use_hybrid_message', COALESCE(v_default_fallback.use_hybrid_message, false),
      'is_default_fallback', true,
      'fallback_enabled', true
    );
  END IF;
  
  -- لا يوجد رد مطابق ولا رد افتراضي مفعّل
  RETURN jsonb_build_object(
    'found', false,
    'message', 'لم يتم العثور على رد مطابق أو رد افتراضي مفعّل'
  );
END;
$$;

COMMENT ON FUNCTION find_matching_auto_response IS 
'دالة البحث عن رد تلقائي - تستبعد الكلمات الخاصة (تبدأ بـ __) من المطابقة العادية وترجع الرد الافتراضي المفعّل فقط';
