/*
  # قفل كامل لبيانات أصحاب المزارع

  ## المشكلة
  - لا تزال هناك policies تسمح للعامة (anon) بالوصول
  - يجب منع الوصول العام نهائياً
  
  ## الحل
  - حذف جميع policies للعامة (anon)
  - الإبقاء فقط على policies الإدارة (authenticated)
  - صاحب المزرعة يدخل عبر نظام OTP الخاص (ليس anon)
*/

-- ===================================
-- حذف جميع policies الوصول العام
-- ===================================

-- farm_owner_profiles
DROP POLICY IF EXISTS "Farm owners can update own profile" ON farm_owner_profiles;
DROP POLICY IF EXISTS "Farm owners can view own profile" ON farm_owner_profiles;
DROP POLICY IF EXISTS "Owners can update own profile" ON farm_owner_profiles;
DROP POLICY IF EXISTS "Owners can view own profile" ON farm_owner_profiles;
DROP POLICY IF EXISTS "Public can create profile with mobile" ON farm_owner_profiles;
DROP POLICY IF EXISTS "Anon can insert profiles" ON farm_owner_profiles;
DROP POLICY IF EXISTS "Anon can read profiles" ON farm_owner_profiles;
DROP POLICY IF EXISTS "Anon can update profiles" ON farm_owner_profiles;

-- farm_owners - لا يوجد policies إضافية لكن للتأكد
DROP POLICY IF EXISTS "Anon can view farm owners" ON farm_owners;
DROP POLICY IF EXISTS "Anon can read farm owners" ON farm_owners;
DROP POLICY IF EXISTS "Public read farm owners" ON farm_owners;

-- ===================================
-- الإبقاء على policies الإدارة فقط
-- ===================================

-- التأكد من وجود policy واحدة فقط للإدارة على farm_owners
DO $$
BEGIN
  -- حذف جميع policies ثم إنشاء واحدة نظيفة
  DROP POLICY IF EXISTS "Admins can manage farm owners" ON farm_owners;
  DROP POLICY IF EXISTS "Admin full access to farm owners" ON farm_owners;
  
  CREATE POLICY "admin_only_farm_owners"
    ON farm_owners
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
END $$;

-- التأكد من وجود policy واحدة فقط للإدارة على farm_owner_profiles
DO $$
BEGIN
  -- حذف جميع policies ثم إنشاء واحدة نظيفة
  DROP POLICY IF EXISTS "Admins can manage all profiles" ON farm_owner_profiles;
  DROP POLICY IF EXISTS "Admin full access to farm owner profiles" ON farm_owner_profiles;
  
  CREATE POLICY "admin_only_farm_owner_profiles"
    ON farm_owner_profiles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
END $$;

-- ===================================
-- تعليقات توضيحية
-- ===================================
COMMENT ON POLICY "admin_only_farm_owners" ON farm_owners IS 
  'للإدارة فقط - ممنوع الوصول العام - أصحاب المزارع يدخلون عبر نظام OTP منفصل';

COMMENT ON POLICY "admin_only_farm_owner_profiles" ON farm_owner_profiles IS 
  'للإدارة فقط - ممنوع الوصول العام - أصحاب المزارع يدخلون عبر نظام OTP منفصل';
