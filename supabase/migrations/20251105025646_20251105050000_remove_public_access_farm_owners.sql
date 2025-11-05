/*
  # إزالة الوصول العام لبيانات أصحاب المزارع

  ## المشكلة الأمنية
  - بيانات أصحاب المزارع كانت متاحة للعامة (anon)
  - هذا يعرض معلومات خاصة (أسماء، أرقام جوال، حسابات بنكية)
  
  ## الحل
  - حذف جميع policies التي تسمح بالوصول العام
  - السماح فقط للإدارة بالوصول
  
  ## الجداول المتأثرة
  - farm_owners
  - farm_owner_profiles
  
  ## الأمان
  - ✅ فقط الإدارة (authenticated) يمكنها رؤية أصحاب المزارع
  - ❌ العامة (anon) لا يمكنهم رؤية أي بيانات
*/

-- ===================================
-- حذف policies الوصول العام لـ farm_owners
-- ===================================
DROP POLICY IF EXISTS "Anon can view farm owners" ON farm_owners;
DROP POLICY IF EXISTS "anon_read_farm_owners" ON farm_owners;
DROP POLICY IF EXISTS "Public read access to farm_owners" ON farm_owners;

-- ===================================
-- حذف policies الوصول العام لـ farm_owner_profiles
-- ===================================
DROP POLICY IF EXISTS "Anon can view farm owner profiles" ON farm_owner_profiles;
DROP POLICY IF EXISTS "anon_read_farm_owner_profiles" ON farm_owner_profiles;
DROP POLICY IF EXISTS "Public read access to farm_owner_profiles" ON farm_owner_profiles;

-- ===================================
-- التأكد من وجود policy للإدارة فقط
-- ===================================

-- farm_owners: للإدارة فقط
DROP POLICY IF EXISTS "Admin full access to farm owners" ON farm_owners;
CREATE POLICY "Admin full access to farm owners"
  ON farm_owners
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- farm_owner_profiles: للإدارة فقط + صاحب المزرعة نفسه
DROP POLICY IF EXISTS "Admin full access to farm owner profiles" ON farm_owner_profiles;
CREATE POLICY "Admin full access to farm owner profiles"
  ON farm_owner_profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- السماح لصاحب المزرعة برؤية بياناته فقط
DROP POLICY IF EXISTS "Farm owners can view own profile" ON farm_owner_profiles;
CREATE POLICY "Farm owners can view own profile"
  ON farm_owner_profiles
  FOR SELECT
  TO anon
  USING (
    mobile_number IN (
      SELECT mobile_number 
      FROM farm_owner_profiles 
      WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- السماح لصاحب المزرعة بتحديث بياناته فقط
DROP POLICY IF EXISTS "Farm owners can update own profile" ON farm_owner_profiles;
CREATE POLICY "Farm owners can update own profile"
  ON farm_owner_profiles
  FOR UPDATE
  TO anon
  USING (
    mobile_number IN (
      SELECT mobile_number 
      FROM farm_owner_profiles 
      WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
  WITH CHECK (
    mobile_number IN (
      SELECT mobile_number 
      FROM farm_owner_profiles 
      WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ===================================
-- إضافة تعليق توضيحي
-- ===================================
COMMENT ON TABLE farm_owners IS 'بيانات أصحاب المزارع - للإدارة فقط - ممنوع الوصول العام';
COMMENT ON TABLE farm_owner_profiles IS 'ملفات أصحاب المزارع - للإدارة وصاحب المزرعة نفسه فقط';
