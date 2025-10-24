/*
  # إصلاح trigger التوثيق - إضافة reserved_trees
  
  1. التغييرات
    - إضافة reserved_trees = number_of_trees
    
  2. الأمان
    - الدالة تعمل بشكل كامل الآن
*/

CREATE OR REPLACE FUNCTION auto_create_documentation_on_status_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_certificate_code TEXT;
  v_doc_id UUID;
  v_investor_id UUID;
  v_investor_email TEXT;
BEGIN
  -- فقط عندما يتغير booking_status إلى documented
  IF NEW.booking_status = 'documented' AND (OLD.booking_status IS DISTINCT FROM NEW.booking_status) THEN
    
    -- التحقق من عدم وجود توثيق مسبق لهذا الحجز
    IF EXISTS (
      SELECT 1 FROM documentation 
      WHERE booking_id = NEW.id
    ) THEN
      RAISE NOTICE 'Documentation already exists for booking %', NEW.id;
      RETURN NEW;
    END IF;
    
    -- توليد رقم شهادة فريد
    v_certificate_code := 'CERT-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 8));
    
    -- محاولة الحصول على investor_id من الحجز أو البحث بالهاتف
    v_investor_id := NEW.investor_id;
    
    IF v_investor_id IS NULL AND NEW.customer_phone IS NOT NULL THEN
      SELECT id, email INTO v_investor_id, v_investor_email
      FROM investors
      WHERE phone = NEW.customer_phone
      AND deleted_at IS NULL
      LIMIT 1;
    END IF;
    
    -- إنشاء سجل التوثيق
    INSERT INTO documentation (
      booking_id,
      booking_code,
      certificate_code,
      farm_id,
      farm_code,
      investor_id,
      investor_name,
      investor_phone,
      investor_email,
      number_of_trees,
      reserved_trees,
      total_amount,
      payment_status,
      status,
      issue_date,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE('RES-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8), 'UNKNOWN'),
      v_certificate_code,
      NEW.farm_id,
      (SELECT farm_code FROM farms WHERE id = NEW.farm_id LIMIT 1),
      v_investor_id,
      NEW.customer_name,
      NEW.customer_phone,
      v_investor_email,
      NEW.number_of_trees,
      NEW.number_of_trees,
      NEW.total_amount,
      NEW.payment_status,
      'documented',
      NOW(),
      NOW(),
      NOW()
    ) RETURNING id INTO v_doc_id;
    
    RAISE NOTICE 'Created documentation % for booking %', v_doc_id, NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION auto_create_documentation_on_status_change() IS 'Creates documentation certificate when reservation booking_status becomes documented - with reserved_trees';
