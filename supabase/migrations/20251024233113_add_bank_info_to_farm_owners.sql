/*
  # إضافة معلومات البنك لأصحاب المزارع
  # Add Bank Information to Farm Owners

  ## التغييرات:
  1. إضافة حقول البنك إلى farm_owner_profiles
    - bank_name (اسم البنك)
    - bank_account_number (رقم الحساب البنكي)
    - bank_iban (رقم الآيبان)
    - bank_account_holder_name (اسم صاحب الحساب)
    - bank_branch (فرع البنك)
    - bank_swift_code (رمز السويفت - اختياري)

  ## الأمان:
  - الحقول اختيارية (nullable)
  - يمكن تحديثها من صاحب المزرعة أو الإدارة
*/

-- ========================================
-- إضافة حقول البنك إلى farm_owner_profiles
-- ========================================

DO $$
BEGIN
  -- اسم البنك
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owner_profiles' AND column_name = 'bank_name'
  ) THEN
    ALTER TABLE farm_owner_profiles ADD COLUMN bank_name text;
  END IF;

  -- رقم الحساب البنكي
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owner_profiles' AND column_name = 'bank_account_number'
  ) THEN
    ALTER TABLE farm_owner_profiles ADD COLUMN bank_account_number text;
  END IF;

  -- رقم الآيبان
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owner_profiles' AND column_name = 'bank_iban'
  ) THEN
    ALTER TABLE farm_owner_profiles ADD COLUMN bank_iban text;
  END IF;

  -- اسم صاحب الحساب
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owner_profiles' AND column_name = 'bank_account_holder_name'
  ) THEN
    ALTER TABLE farm_owner_profiles ADD COLUMN bank_account_holder_name text;
  END IF;

  -- فرع البنك
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owner_profiles' AND column_name = 'bank_branch'
  ) THEN
    ALTER TABLE farm_owner_profiles ADD COLUMN bank_branch text;
  END IF;

  -- رمز السويفت (اختياري - للتحويلات الدولية)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owner_profiles' AND column_name = 'bank_swift_code'
  ) THEN
    ALTER TABLE farm_owner_profiles ADD COLUMN bank_swift_code text;
  END IF;
END $$;

-- ========================================
-- إضافة نفس الحقول إلى farm_owners (جدول الإدارة)
-- ========================================

DO $$
BEGIN
  -- اسم البنك
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owners' AND column_name = 'bank_name'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN bank_name text;
  END IF;

  -- رقم الحساب البنكي
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owners' AND column_name = 'bank_account_number'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN bank_account_number text;
  END IF;

  -- رقم الآيبان
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owners' AND column_name = 'bank_iban'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN bank_iban text;
  END IF;

  -- اسم صاحب الحساب
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owners' AND column_name = 'bank_account_holder_name'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN bank_account_holder_name text;
  END IF;

  -- فرع البنك
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owners' AND column_name = 'bank_branch'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN bank_branch text;
  END IF;

  -- رمز السويفت
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owners' AND column_name = 'bank_swift_code'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN bank_swift_code text;
  END IF;
END $$;

-- ========================================
-- تسجيل في سجل الأنشطة
-- ========================================

DO $$
BEGIN
  INSERT INTO admin_activity_log (
    action,
    details,
    status
  ) VALUES (
    'migration_applied',
    'Added bank information fields to farm_owner_profiles and farm_owners tables',
    'completed'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- تجاهل الخطأ إذا كان الجدول غير موجود
    NULL;
END $$;
