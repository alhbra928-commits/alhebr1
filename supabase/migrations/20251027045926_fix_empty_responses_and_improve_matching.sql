/*
  # إصلاح مشكلة الردود الفارغة وتحسين المطابقة

  1. التغييرات
    - إضافة قيود لمنع الكلمات المفتاحية الفارغة
    - إضافة قيود لمنع الردود الفارغة
    - تحسين دالة المطابقة لتجاهل الردود الفارغة
    - إضافة فلتر لاستثناء الرد الافتراضي من البحث العادي

  2. الأمان
    - منع إضافة ردود غير صالحة
    - تحسين جودة النتائج
*/

-- Add constraints to prevent empty keywords and responses
ALTER TABLE whatsapp_auto_responses
DROP CONSTRAINT IF EXISTS whatsapp_auto_responses_keyword_not_empty;

ALTER TABLE whatsapp_auto_responses
ADD CONSTRAINT whatsapp_auto_responses_keyword_not_empty
CHECK (keyword IS NOT NULL AND TRIM(keyword) != '');

ALTER TABLE whatsapp_auto_responses
DROP CONSTRAINT IF EXISTS whatsapp_auto_responses_response_ar_not_empty;

ALTER TABLE whatsapp_auto_responses
ADD CONSTRAINT whatsapp_auto_responses_response_ar_not_empty
CHECK (response_ar IS NOT NULL AND TRIM(response_ar) != '');

-- Improve find_matching_auto_response to exclude fallback responses and empty values
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
  
  -- Search for best matching auto response
  -- EXCLUDE fallback responses from normal matching
  SELECT *
  INTO v_best_match
  FROM whatsapp_auto_responses
  WHERE deleted_at IS NULL
    AND status = 'active'
    AND COALESCE(is_default_fallback, false) = false  -- Don't match fallback in normal search
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
    -- Prioritize exact matches
    CASE WHEN v_message_lower = LOWER(keyword) THEN 1 ELSE 2 END,
    -- Then by priority
    priority DESC,
    -- Then by usage count (popular responses)
    usage_count DESC,
    -- Finally by creation date
    created_at DESC
  LIMIT 1;
  
  -- If match found
  IF v_best_match.id IS NOT NULL THEN
    -- Update usage statistics
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
    
    -- Return success response
    RETURN jsonb_build_object(
      'found', true,
      'response', v_response_text,
      'intent', v_best_match.intent,
      'priority', v_best_match.priority,
      'keyword', v_best_match.keyword,
      'response_id', v_best_match.id,
      'ai_generated', v_best_match.ai_generated
    );
  END IF;
  
  -- No match found
  RETURN jsonb_build_object(
    'found', false,
    'message', 'لم يتم العثور على رد مطابق'
  );
END;
$$;

-- Add validation function to prevent invalid responses
CREATE OR REPLACE FUNCTION validate_auto_response()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate keyword
  IF NEW.keyword IS NULL OR TRIM(NEW.keyword) = '' THEN
    RAISE EXCEPTION 'الكلمة المفتاحية لا يمكن أن تكون فارغة';
  END IF;
  
  -- Validate response_ar
  IF NEW.response_ar IS NULL OR TRIM(NEW.response_ar) = '' THEN
    RAISE EXCEPTION 'الرد باللغة العربية لا يمكن أن يكون فارغاً';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS validate_auto_response_trigger ON whatsapp_auto_responses;
CREATE TRIGGER validate_auto_response_trigger
  BEFORE INSERT OR UPDATE ON whatsapp_auto_responses
  FOR EACH ROW
  EXECUTE FUNCTION validate_auto_response();
