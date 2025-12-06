/*
  # إصلاح booking_items وإضافة farm_id + إصلاح login_attempts
  
  1. التعديلات
    - إضافة farm_id إلى booking_items
    - إصلاح login_attempts constraint بالترتيب الصحيح
*/

-- =====================================================
-- 1. إضافة farm_id إلى booking_items
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'booking_items' AND column_name = 'farm_id'
  ) THEN
    ALTER TABLE booking_items 
    ADD COLUMN farm_id uuid REFERENCES farms(id) ON DELETE RESTRICT;
    
    CREATE INDEX IF NOT EXISTS idx_booking_items_farm_id ON booking_items(farm_id);
    
    RAISE NOTICE '✅ Added farm_id column to booking_items';
  ELSE
    RAISE NOTICE '⏭️ farm_id column already exists in booking_items';
  END IF;
END $$;

-- =====================================================
-- 2. إصلاح investor_login_attempts بالترتيب الصحيح
-- =====================================================

-- خطوة 1: حذف constraint القديم أولاً
ALTER TABLE investor_login_attempts 
DROP CONSTRAINT IF EXISTS investor_login_attempts_login_type_check;

-- خطوة 2: تحديث البيانات الخاطئة
UPDATE investor_login_attempts 
SET login_type = 'otp' 
WHERE login_type = 'with_otp';

UPDATE investor_login_attempts 
SET login_type = 'normal' 
WHERE login_type NOT IN (
  'otp', 'first_time', 'auto_first_time', 
  'session_resume', 'normal', 'auto', 'manual'
);

-- خطوة 3: إضافة constraint جديد
ALTER TABLE investor_login_attempts
ADD CONSTRAINT investor_login_attempts_login_type_check 
CHECK (login_type IN (
  'otp', 'first_time', 'auto_first_time', 
  'session_resume', 'normal', 'auto', 'manual'
));
