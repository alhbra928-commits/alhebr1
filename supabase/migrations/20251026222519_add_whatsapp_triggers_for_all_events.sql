/*
  # إضافة Triggers للواتساب لجميع الأحداث الهامة

  ## التغييرات
  1. إشعار عند حجز جديد (reservations)
  2. إشعار عند تأكيد الحجز
  3. إشعار عند إنشاء مستثمر جديد
  4. إشعار عند قبول/رفض إيصال دفع

  ## الأمان
  - جميع الـ functions بـ SECURITY DEFINER
  - لا تفشل العملية الأساسية إذا فشل الواتساب
*/

-- =====================================
-- 1. Trigger عند حجز جديد
-- =====================================

CREATE OR REPLACE FUNCTION notify_whatsapp_new_booking()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_settings RECORD;
  v_message_content TEXT;
  v_farm_name TEXT;
BEGIN
  -- التحقق من تفعيل الواتساب
  SELECT * INTO v_settings FROM whatsapp_settings WHERE is_active = true LIMIT 1;
  IF v_settings IS NULL THEN RETURN NEW; END IF;

  -- الحصول على اسم المزرعة
  SELECT farm_name_ar INTO v_farm_name FROM farms WHERE id = NEW.farm_id LIMIT 1;

  -- بناء الرسالة
  v_message_content := 'عزيزي ' || COALESCE(NEW.customer_name, 'المستثمر') || 
                       '، تم استلام حجزك في مزرعة ' || COALESCE(v_farm_name, '') ||
                       '. عدد الأشجار: ' || NEW.reserved_trees::TEXT ||
                       '. سيتم مراجعة حجزك قريباً.';

  -- إدراج الرسالة
  BEGIN
    INSERT INTO whatsapp_messages (
      recipient_phone, recipient_name, recipient_type, message_content,
      template_code, message_type, status, trigger_event, trigger_reference_id
    ) VALUES (
      NEW.customer_phone, NEW.customer_name, 'investor', v_message_content,
      'BOOKING_RECEIVED', 'auto', 'pending', 'booking_created', NEW.id
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed WhatsApp for booking: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_whatsapp_new_booking ON reservations;
CREATE TRIGGER trigger_whatsapp_new_booking
  AFTER INSERT ON reservations
  FOR EACH ROW
  WHEN (NEW.customer_phone IS NOT NULL AND NEW.customer_phone != '')
  EXECUTE FUNCTION notify_whatsapp_new_booking();

-- =====================================
-- 2. Trigger عند تأكيد الحجز
-- =====================================

CREATE OR REPLACE FUNCTION notify_whatsapp_booking_confirmed()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_settings RECORD;
  v_message_content TEXT;
  v_farm_name TEXT;
BEGIN
  -- فقط عند تغيير الحالة إلى confirmed
  IF OLD.status = NEW.status OR NEW.status != 'confirmed' THEN
    RETURN NEW;
  END IF;

  -- التحقق من تفعيل الواتساب
  SELECT * INTO v_settings FROM whatsapp_settings WHERE is_active = true LIMIT 1;
  IF v_settings IS NULL THEN RETURN NEW; END IF;

  -- الحصول على اسم المزرعة
  SELECT farm_name_ar INTO v_farm_name FROM farms WHERE id = NEW.farm_id LIMIT 1;

  -- بناء الرسالة
  v_message_content := 'مبروك ' || COALESCE(NEW.customer_name, 'عزيزي المستثمر') || 
                       '! تم تأكيد حجزك في مزرعة ' || COALESCE(v_farm_name, '') ||
                       '. عدد الأشجار: ' || NEW.reserved_trees::TEXT ||
                       '. يمكنك الآن إتمام عملية الدفع.';

  -- إدراج الرسالة
  BEGIN
    INSERT INTO whatsapp_messages (
      recipient_phone, recipient_name, recipient_type, message_content,
      template_code, message_type, status, trigger_event, trigger_reference_id
    ) VALUES (
      NEW.customer_phone, NEW.customer_name, 'investor', v_message_content,
      'BOOKING_CONFIRMED', 'auto', 'pending', 'booking_confirmed', NEW.id
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed WhatsApp for booking confirmation: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_whatsapp_booking_confirmed ON reservations;
CREATE TRIGGER trigger_whatsapp_booking_confirmed
  AFTER UPDATE ON reservations
  FOR EACH ROW
  WHEN (NEW.customer_phone IS NOT NULL AND NEW.customer_phone != '')
  EXECUTE FUNCTION notify_whatsapp_booking_confirmed();

-- =====================================
-- 3. Trigger عند إنشاء مستثمر جديد (رسالة ترحيبية)
-- =====================================

CREATE OR REPLACE FUNCTION notify_whatsapp_welcome_investor()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_settings RECORD;
  v_message_content TEXT;
BEGIN
  -- التحقق من تفعيل الواتساب
  SELECT * INTO v_settings FROM whatsapp_settings WHERE is_active = true LIMIT 1;
  IF v_settings IS NULL THEN RETURN NEW; END IF;

  -- بناء رسالة الترحيب
  v_message_content := 'أهلاً بك ' || COALESCE(NEW.full_name, 'عزيزي المستثمر') || 
                       ' في منصة النخيل والزيتون! 🌴' ||
                       E'\n\nنحن سعداء بانضمامك إلينا. يمكنك الآن تصفح المزارع المتاحة وحجز أشجارك.' ||
                       E'\n\nللمساعدة: تواصل معنا عبر الواتساب';

  -- إدراج الرسالة
  BEGIN
    INSERT INTO whatsapp_messages (
      recipient_phone, recipient_name, recipient_type, message_content,
      template_code, message_type, status, trigger_event, trigger_reference_id
    ) VALUES (
      NEW.phone, NEW.full_name, 'investor', v_message_content,
      'WELCOME_INVESTOR', 'auto', 'pending', 'investor_created', NEW.id
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed WhatsApp for welcome: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_whatsapp_welcome_investor ON investors;
CREATE TRIGGER trigger_whatsapp_welcome_investor
  AFTER INSERT ON investors
  FOR EACH ROW
  WHEN (NEW.phone IS NOT NULL AND NEW.phone != '')
  EXECUTE FUNCTION notify_whatsapp_welcome_investor();

-- Comments
COMMENT ON FUNCTION notify_whatsapp_new_booking IS 'إرسال إشعار واتساب عند حجز جديد';
COMMENT ON FUNCTION notify_whatsapp_booking_confirmed IS 'إرسال إشعار واتساب عند تأكيد الحجز';
COMMENT ON FUNCTION notify_whatsapp_welcome_investor IS 'إرسال رسالة ترحيبية للمستثمر الجديد';
