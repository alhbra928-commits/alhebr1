/*
  # إصلاح نظام الإشعارات للمستثمرين
  
  ## المشكلة:
  - عند اعتماد الحجز، لا يصل الإشعار للمستثمر
  - السبب: investor_id في reservations قد يكون NULL
  - الـ trigger يبحث عن investor في جدول investors لكن قد لا يجده
  
  ## الحل:
  1. إنشاء/تحديث investor تلقائياً عند الحجز
  2. ربط investor_id في reservations
  3. تحسين الـ trigger ليُنشئ المستثمر إذا لم يكن موجوداً
*/

-- Function: إنشاء أو جلب investor_id بناءً على رقم الهاتف
CREATE OR REPLACE FUNCTION get_or_create_investor(
  p_phone text,
  p_name text,
  p_email text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_investor_id uuid;
BEGIN
  -- البحث عن المستثمر بناءً على رقم الهاتف
  SELECT id INTO v_investor_id
  FROM investors
  WHERE phone = p_phone
    AND deleted_at IS NULL
  LIMIT 1;
  
  -- إذا لم يوجد، إنشاء مستثمر جديد
  IF v_investor_id IS NULL THEN
    INSERT INTO investors (
      full_name,
      phone,
      email,
      status,
      created_at,
      updated_at
    ) VALUES (
      p_name,
      p_phone,
      p_email,
      'active',
      now(),
      now()
    )
    RETURNING id INTO v_investor_id;
    
    RAISE NOTICE 'Created new investor: % (ID: %)', p_name, v_investor_id;
  END IF;
  
  RETURN v_investor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: تحديث investor_id في reservations تلقائياً
CREATE OR REPLACE FUNCTION auto_set_investor_id_on_reservation()
RETURNS TRIGGER AS $$
DECLARE
  v_investor_id uuid;
BEGIN
  -- إذا investor_id فارغ، جلب أو إنشاء المستثمر
  IF NEW.investor_id IS NULL AND NEW.customer_phone IS NOT NULL THEN
    v_investor_id := get_or_create_investor(
      NEW.customer_phone,
      COALESCE(NEW.customer_name, 'مستثمر'),
      NEW.customer_email
    );
    
    NEW.investor_id := v_investor_id;
    
    RAISE NOTICE 'Set investor_id for reservation %: %', NEW.id, v_investor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء الـ Trigger
DROP TRIGGER IF EXISTS trigger_auto_set_investor_id ON reservations;

CREATE TRIGGER trigger_auto_set_investor_id
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_investor_id_on_reservation();

-- تحديث generate_booking_notification لاستخدام investor_id مباشرة
CREATE OR REPLACE FUNCTION generate_booking_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_investor_id uuid;
  v_title text;
  v_message text;
  v_type text;
  v_priority text := 'normal';
BEGIN
  -- الحصول على investor_id من الحجز مباشرة
  v_investor_id := NEW.investor_id;
  
  -- إذا كان فارغاً، محاولة الحصول عليه من رقم الهاتف
  IF v_investor_id IS NULL AND NEW.customer_phone IS NOT NULL THEN
    v_investor_id := get_or_create_investor(
      NEW.customer_phone,
      COALESCE(NEW.customer_name, 'مستثمر'),
      NEW.customer_email
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إعادة إنشاء الـ Trigger
DROP TRIGGER IF EXISTS trigger_generate_booking_notification ON reservations;

CREATE TRIGGER trigger_generate_booking_notification
  AFTER UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_notification();

-- تحديث investor_id للحجوزات الموجودة
UPDATE reservations r
SET investor_id = i.id,
    updated_at = now()
FROM investors i
WHERE r.customer_phone = i.phone
  AND r.investor_id IS NULL
  AND r.deleted_at IS NULL
  AND i.deleted_at IS NULL;

-- تعليقات
COMMENT ON FUNCTION get_or_create_investor IS 'جلب أو إنشاء مستثمر بناءً على رقم الهاتف';
COMMENT ON FUNCTION auto_set_investor_id_on_reservation IS 'تحديث investor_id تلقائياً في الحجوزات';
COMMENT ON TRIGGER trigger_auto_set_investor_id ON reservations IS 'يضمن وجود investor_id لكل حجز';
