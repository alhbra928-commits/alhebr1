/*
  # إضافة حقل booking_status لتتبع مراحل التملك

  ## الهدف
  إضافة حقل booking_status منفصل عن payment_status لتتبع المراحل الأربعة:
  1. processing - الحجز قيد المعالجة
  2. confirmed - تم اعتماد الحجز
  3. pending_verification - قيد التحقق المالي (بعد رفع الإيصال)
  4. certificate_issued - تم إصدار الشهادة

  ## التغييرات
  1. إضافة عمود booking_status إلى جدول reservations
  2. تحديث الحجوزات الحالية بناءً على حالاتها
  3. إضافة فهرس للأداء
  4. إضافة trigger لتحديث booking_status تلقائياً

  ## الأمان
  - لا تغيير في سياسات RLS
  - الحقل الجديد يعمل جنباً إلى جنب مع الحقول الحالية
*/

-- إضافة عمود booking_status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' 
    AND column_name = 'booking_status'
  ) THEN
    ALTER TABLE reservations 
    ADD COLUMN booking_status text NOT NULL DEFAULT 'processing' 
    CHECK (booking_status IN (
      'processing',           -- قيد المعالجة
      'confirmed',            -- تم اعتماد الحجز
      'pending_verification', -- قيد التحقق المالي
      'certificate_issued'    -- تم إصدار الشهادة
    ));
  END IF;
END $$;

-- تحديث الحجوزات الحالية بناءً على status و payment_status
UPDATE reservations
SET booking_status = CASE
  WHEN status = 'pending' THEN 'processing'
  WHEN status = 'confirmed' AND payment_status = 'pending' THEN 'confirmed'
  WHEN status = 'confirmed' AND payment_status = 'completed' THEN 'certificate_issued'
  WHEN status = 'active' THEN 'certificate_issued'
  ELSE 'processing'
END
WHERE booking_status = 'processing';

-- إنشاء فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_reservations_booking_status 
  ON reservations(booking_status) 
  WHERE deleted_at IS NULL;

-- دالة لتحديث booking_status تلقائياً عند تغيير payment_status
CREATE OR REPLACE FUNCTION update_booking_status_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- عند تغيير payment_status إلى completed
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    NEW.booking_status := 'certificate_issued';
  END IF;
  
  -- عند تأكيد الحجز
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- إذا لم يكن هناك إيصال، يبقى في حالة confirmed
    IF NEW.booking_status = 'processing' THEN
      NEW.booking_status := 'confirmed';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تفعيل trigger
DROP TRIGGER IF EXISTS booking_status_auto_update ON reservations;
CREATE TRIGGER booking_status_auto_update
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_status_on_payment();

-- إضافة تعليق توضيحي
COMMENT ON COLUMN reservations.booking_status IS 
  'حالة التملك: processing = قيد المعالجة | confirmed = معتمد | pending_verification = قيد التحقق المالي | certificate_issued = تم إصدار الشهادة';
