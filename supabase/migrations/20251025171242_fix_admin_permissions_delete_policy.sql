/*
  # إصلاح سياسة الحذف لجدول admin_module_permissions

  1. المشكلة:
    - قد لا تكون هناك سياسة واضحة للسماح بحذف الصلاحيات

  2. الحل:
    - إضافة سياسة صريحة للسماح بالحذف للمستخدمين العامين (anon)
*/

-- حذف السياسات القديمة إذا كانت موجودة
DROP POLICY IF EXISTS "Public can view permissions" ON admin_module_permissions;
DROP POLICY IF EXISTS "Public can insert permissions" ON admin_module_permissions;
DROP POLICY IF EXISTS "Public can update permissions" ON admin_module_permissions;
DROP POLICY IF EXISTS "Public can delete permissions" ON admin_module_permissions;

-- إنشاء سياسات واضحة وشاملة
-- سياسة القراءة
CREATE POLICY "Public can view permissions"
  ON admin_module_permissions
  FOR SELECT
  TO public
  USING (true);

-- سياسة الإضافة
CREATE POLICY "Public can insert permissions"
  ON admin_module_permissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- سياسة التحديث
CREATE POLICY "Public can update permissions"
  ON admin_module_permissions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- سياسة الحذف
CREATE POLICY "Public can delete permissions"
  ON admin_module_permissions
  FOR DELETE
  TO public
  USING (true);
