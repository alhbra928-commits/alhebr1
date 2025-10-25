/*
  # إصلاح سياسة الحذف لجدول admin_active_sessions

  1. المشكلة:
    - قد لا تكون هناك سياسة واضحة للسماح بحذف الجلسات

  2. الحل:
    - إضافة سياسة صريحة للسماح بالحذف للمستخدمين العامين (anon)
*/

-- حذف السياسات القديمة إذا كانت موجودة
DROP POLICY IF EXISTS "Public can view sessions" ON admin_active_sessions;
DROP POLICY IF EXISTS "Public can insert sessions" ON admin_active_sessions;
DROP POLICY IF EXISTS "Public can update sessions" ON admin_active_sessions;
DROP POLICY IF EXISTS "Public can delete sessions" ON admin_active_sessions;

-- إنشاء سياسات واضحة وشاملة
-- سياسة القراءة
CREATE POLICY "Public can view sessions"
  ON admin_active_sessions
  FOR SELECT
  TO public
  USING (true);

-- سياسة الإضافة
CREATE POLICY "Public can insert sessions"
  ON admin_active_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- سياسة التحديث
CREATE POLICY "Public can update sessions"
  ON admin_active_sessions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- سياسة الحذف
CREATE POLICY "Public can delete sessions"
  ON admin_active_sessions
  FOR DELETE
  TO public
  USING (true);
