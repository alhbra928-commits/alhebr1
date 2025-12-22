/*
  # تفعيل إشعارات الواتساب للحجوزات

  ## الوصف
  تفعيل الـ triggers لإرسال رسائل واتساب تلقائية للمستثمرين عند:
  1. إنشاء حجز جديد
  2. إصدار شهادة ملكية
  3. التحقق من السداد
  4. رفض السداد

  ## الـ Triggers
  - trigger_whatsapp_booking_created: عند إنشاء حجز جديد
  - trigger_whatsapp_certificate_issued: عند إصدار شهادة
  - trigger_whatsapp_payment_verified: عند التحقق من السداد
  - trigger_whatsapp_payment_rejected: عند رفض السداد

  ## الأمان
  - الدوال تستخدم SECURITY DEFINER
  - التحقق من البيانات قبل الإرسال
  - ON CONFLICT للتعامل مع التكرار
*/

-- =========================================
-- 1. Trigger للحجز الجديد
-- =========================================

-- حذف الـ trigger القديم إن وُجد
DROP TRIGGER IF EXISTS trigger_whatsapp_booking_created ON reservations;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_whatsapp_booking_created
AFTER INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION notify_whatsapp_booking_created();

COMMENT ON TRIGGER trigger_whatsapp_booking_created ON reservations IS
'يُرسل رسالة واتساب للمستثمر عند إنشاء حجز جديد';

-- =========================================
-- 2. Trigger لإصدار الشهادة
-- =========================================

-- حذف الـ trigger القديم إن وُجد
DROP TRIGGER IF EXISTS trigger_whatsapp_certificate_issued ON documentation;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_whatsapp_certificate_issued
AFTER INSERT ON documentation
FOR EACH ROW
EXECUTE FUNCTION notify_whatsapp_certificate_issued();

COMMENT ON TRIGGER trigger_whatsapp_certificate_issued ON documentation IS
'يُرسل رسالة واتساب للمستثمر عند إصدار شهادة ملكية';

-- =========================================
-- 3. Trigger للتحقق من السداد
-- =========================================

-- حذف الـ trigger القديم إن وُجد
DROP TRIGGER IF EXISTS trigger_whatsapp_payment_verified ON payment_receipts;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_whatsapp_payment_verified
AFTER UPDATE ON payment_receipts
FOR EACH ROW
WHEN (NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified'))
EXECUTE FUNCTION notify_whatsapp_payment_received();

COMMENT ON TRIGGER trigger_whatsapp_payment_verified ON payment_receipts IS
'يُرسل رسالة واتساب للمستثمر عند التحقق من سداده';

-- =========================================
-- 4. Trigger لرفض السداد
-- =========================================

-- حذف الـ trigger القديم إن وُجد
DROP TRIGGER IF EXISTS trigger_whatsapp_payment_rejected ON payment_receipts;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_whatsapp_payment_rejected
AFTER UPDATE ON payment_receipts
FOR EACH ROW
WHEN (NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected'))
EXECUTE FUNCTION notify_whatsapp_payment_rejected();

COMMENT ON TRIGGER trigger_whatsapp_payment_rejected ON payment_receipts IS
'يُرسل رسالة واتساب للمستثمر عند رفض إيصال سداده';

-- =========================================
-- التحقق من تفعيل الـ Triggers
-- =========================================

-- عرض الـ triggers المُفعّلة
DO $$
DECLARE
  v_trigger_count int;
BEGIN
  SELECT COUNT(*) INTO v_trigger_count
  FROM pg_trigger
  WHERE tgname LIKE 'trigger_whatsapp%'
    AND tgenabled = 'O';

  RAISE NOTICE '✅ تم تفعيل % triggers للواتساب', v_trigger_count;
END $$;