/*
  # إضافة حقول مالك المزرعة الكاملة
  
  ## التغييرات
  
  1. إضافة أعمدة جديدة:
     - owner_full_name (text) - الاسم الكامل
     - owner_phone (text) - رقم الجوال
     - farm_location (text) - موقع المزرعة (نص بسيط)
     - farm_price (numeric) - سعر المزرعة
     - payment_duration_days (integer) - مدة السداد بالأيام
     - farm_image_url (text) - رابط صورة المزرعة
     - manual_entry (boolean) - تسجيل يدوي
     - farm_type_other (text) - نوع المزرعة الأخرى
  
  2. تحديث الأعمدة الموجودة:
     - جعل بعض الأعمدة nullable للتوافق
  
  ## الملاحظات
  - الأعمدة الجديدة nullable للسماح بالبيانات الموجودة
  - يمكن استخدام owner_full_name أو full_name
  - يمكن استخدام owner_phone أو mobile_number
*/

-- إضافة الأعمدة الجديدة إذا لم تكن موجودة
DO $$ 
BEGIN
  -- owner_full_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'owner_full_name'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN owner_full_name text;
  END IF;

  -- owner_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'owner_phone'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN owner_phone text;
  END IF;

  -- farm_location (موقع مبسط)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'farm_location'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN farm_location text;
  END IF;

  -- farm_price
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'farm_price'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN farm_price numeric;
  END IF;

  -- payment_duration_days
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'payment_duration_days'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN payment_duration_days integer DEFAULT 180;
  END IF;

  -- farm_image_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'farm_image_url'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN farm_image_url text;
  END IF;

  -- manual_entry
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'manual_entry'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN manual_entry boolean DEFAULT false;
  END IF;

  -- farm_type_other
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'farm_type_other'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN farm_type_other text;
  END IF;
END $$;

-- إنشاء view للتوافق بين الأعمدة القديمة والجديدة
CREATE OR REPLACE VIEW farm_owners_unified AS
SELECT 
  id,
  COALESCE(owner_full_name, full_name) as owner_full_name,
  COALESCE(owner_phone, mobile_number) as owner_phone,
  COALESCE(farm_location, farm_address, city || ', ' || region) as farm_location,
  farm_area,
  farm_area_unit,
  farm_type,
  farm_type_other,
  COALESCE(farm_price, actual_price) as farm_price,
  bank_iban,
  COALESCE(payment_duration_days, payment_grace_period) as payment_duration_days,
  farm_image_url,
  manual_entry,
  approval_status,
  status,
  created_at,
  updated_at,
  deleted_at,
  deleted_by
FROM farm_owners;

-- إضافة تعليق للتوثيق
COMMENT ON TABLE farm_owners IS 'جدول أصحاب المزارع - يدعم النظام القديم والجديد';
COMMENT ON COLUMN farm_owners.owner_full_name IS 'الاسم الكامل للمالك (النظام الجديد)';
COMMENT ON COLUMN farm_owners.owner_phone IS 'رقم جوال المالك (النظام الجديد)';
COMMENT ON COLUMN farm_owners.farm_location IS 'موقع المزرعة نصي مبسط (النظام الجديد)';
COMMENT ON COLUMN farm_owners.farm_price IS 'سعر المزرعة الإجمالي (النظام الجديد)';
COMMENT ON COLUMN farm_owners.payment_duration_days IS 'مدة السداد بالأيام (النظام الجديد)';
COMMENT ON COLUMN farm_owners.farm_image_url IS 'رابط صورة المزرعة (base64 أو URL)';
COMMENT ON COLUMN farm_owners.manual_entry IS 'تم التسجيل يدوياً من قبل الإدارة';
