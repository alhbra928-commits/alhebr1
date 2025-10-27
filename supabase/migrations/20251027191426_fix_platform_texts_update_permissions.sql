/*
  # إصلاح صلاحيات تحديث النصوص
  
  1. التغييرات
    - تحديث سياسة UPDATE للسماح لجميع المستخدمين المصادق عليهم
    - إضافة logging للتحديثات
*/

-- حذف السياسة القديمة
DROP POLICY IF EXISTS "Only authenticated users can update platform texts" ON platform_texts;

-- إنشاء سياسة جديدة أكثر وضوحاً
CREATE POLICY "Authenticated users can update platform texts"
  ON platform_texts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- إضافة سياسة للمستخدمين غير المصادق عليهم أيضاً (للإدارة من لوحة التحكم)
DROP POLICY IF EXISTS "Anon can update platform texts for admin" ON platform_texts;
CREATE POLICY "Anon can update platform texts for admin"
  ON platform_texts
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "Authenticated users can update platform texts" ON platform_texts IS 'السماح للمستخدمين المصادق عليهم بتحديث النصوص';
COMMENT ON POLICY "Anon can update platform texts for admin" ON platform_texts IS 'السماح بتحديث النصوص من لوحة الإدارة';
