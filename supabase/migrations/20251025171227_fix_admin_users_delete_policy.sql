/*
  # إصلاح سياسة الحذف لجدول admin_users

  1. المشكلة:
    - لا توجد سياسة واضحة للسماح بحذف المستخدمين
    - المستخدمون المحذوفون يظهرون مرة أخرى عند إعادة التحميل

  2. الحل:
    - إضافة سياسة صريحة للسماح بالحذف للمستخدمين العامين (anon)
    - إضافة سياسة صريحة للسماح بالتحديث للمستخدمين العامين (anon)
*/

-- حذف السياسات القديمة المتضاربة
DROP POLICY IF EXISTS "Allow public to insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Allow public to read admin users" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can view admin users" ON admin_users;

-- إنشاء سياسات واضحة وشاملة
-- سياسة القراءة (SELECT)
CREATE POLICY "Public can view admin users"
  ON admin_users
  FOR SELECT
  TO public
  USING (true);

-- سياسة الإضافة (INSERT)
CREATE POLICY "Public can insert admin users"
  ON admin_users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- سياسة التحديث (UPDATE)
CREATE POLICY "Public can update admin users"
  ON admin_users
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- سياسة الحذف (DELETE) - هذه هي الأهم
CREATE POLICY "Public can delete admin users"
  ON admin_users
  FOR DELETE
  TO public
  USING (true);
