/*
  # إصلاح Functions المتبقية - إزالة customer_email
  
  1. Functions المتأثرة
    - auto_set_investor_id_on_reservation
    - generate_booking_notification
  
  2. الإصلاح
    - استبدال NEW.customer_email بـ NULL
    - البحث عن الإيميل من جدول investors إن وجد
*/

-- 1. إصلاح auto_set_investor_id_on_reservation
CREATE OR REPLACE FUNCTION auto_set_investor_id_on_reservation()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_investor_id uuid;
  v_email text;
BEGIN
  -- إذا investor_id فارغ، جلب أو إنشاء المستثمر
  IF NEW.investor_id IS NULL AND NEW.customer_phone IS NOT NULL THEN
    
    -- محاولة الحصول على الإيميل من جدول investors
    SELECT email INTO v_email
    FROM investors
    WHERE phone = NEW.customer_phone
    LIMIT 1;
    
    v_investor_id := get_or_create_investor(
      NEW.customer_phone,
      COALESCE(NEW.customer_name, 'مستثمر'),
      v_email  -- استخدام الإيميل من investors أو NULL
    );
    
    NEW.investor_id := v_investor_id;
    
    RAISE NOTICE 'Set investor_id for reservation %: %', NEW.id, v_investor_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. إصلاح generate_booking_notification
CREATE OR REPLACE FUNCTION generate_booking_notification()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_investor_id uuid;
  v_email text;
  v_title text;
  v_message text;
  v_type text;
  v_priority text := 'normal';
BEGIN
  -- الحصول على investor_id من الحجز مباشرة
  v_investor_id := NEW.investor_id;
  
  -- إذا كان فارغاً، محاولة الحصول عليه من رقم الهاتف
  IF v_investor_id IS NULL AND NEW.customer_phone IS NOT NULL THEN
    
    -- محاولة الحصول على الإيميل من جدول investors
    SELECT email INTO v_email
    FROM investors
    WHERE phone = NEW.customer_phone
    LIMIT 1;
    
    v_investor_id := get_or_create_investor(
      NEW.customer_phone,
      COALESCE(NEW.customer_name, 'مستثمر'),
      v_email  -- استخدام الإيميل من investors أو NULL
    );
    
    -- تحديث investor_id في الحجز
    UPDATE reservations
    SET investor_id = v_investor_id
    WHERE id = NEW.id;
  END IF;
  
  -- إذا لم نتمكن من الحصول على investor_id، نتوقف
  IF v_investor_id IS NULL THEN
    RAISE NOTICE 'Cannot find or create investor for reservation %', NEW.id;
    RETURN NEW;
  END IF;
  
  -- عند تحديث حالة الحجز
  IF (TG_OP = 'UPDATE' AND OLD.booking_status IS DISTINCT FROM NEW.booking_status) THEN
    
    -- تسجيل التغيير
    PERFORM log_booking_state_change(
      NEW.id,
      OLD.booking_status,
      NEW.booking_status,
      'system',
      'تحديث تلقائي'
    );
    
    -- تحديد نوع الإشعار والرسالة
    CASE NEW.booking_status
      WHEN 'approved' THEN
        v_type := 'booking_approved';
        v_title := '✅ تم اعتماد حجزك';
        v_message := 'مبروك! تم اعتماد حجزك. يمكنك الآن رفع إيصال السداد.';
        v_priority := 'high';
      
      WHEN 'pending_verification' THEN
        v_type := 'booking_pending_verification';
        v_title := '📩 تم استلام إيصال السداد';
        v_message := 'شكراً لإرسال إيصال السداد. سيتم التحقق منه خلال 24 ساعة.';
        v_priority := 'normal';
      
      WHEN 'verified' THEN
        v_type := 'booking_verified';
        v_title := '💰 تم التحقق من السداد';
        v_message := 'تم التحقق من إيصال السداد بنجاح!';
        v_priority := 'high';
      
      WHEN 'confirmed' THEN
        v_type := 'booking_confirmed';
        v_title := '🎉 تم تأكيد الحجز';
        v_message := 'تم تأكيد حجزك. جاري إعداد شهادة الملكية.';
        v_priority := 'high';
      
      WHEN 'documented' THEN
        v_type := 'certificate_issued';
        v_title := '🏆 شهادة ملكيتك جاهزة!';
        v_message := 'مبروك! تم إصدار شهادة ملكيتك. يمكنك تحميلها الآن.';
        v_priority := 'urgent';
      
      ELSE
        RETURN NEW;
    END CASE;
    
    -- إنشاء الإشعار
    PERFORM create_notification(
      v_investor_id,
      NEW.id,
      v_type,
      v_title,
      v_message,
      v_priority,
      NULL
    );
    
    RAISE NOTICE 'Created notification for investor %: %', v_investor_id, v_title;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- التحقق من الإصلاح
COMMENT ON FUNCTION auto_set_investor_id_on_reservation IS 'Auto-set investor_id - Fixed to not use customer_email';
COMMENT ON FUNCTION generate_booking_notification IS 'Generate booking notifications - Fixed to not use customer_email';
