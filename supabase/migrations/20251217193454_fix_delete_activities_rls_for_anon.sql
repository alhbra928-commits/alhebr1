/*
  # إصلاح حاسم: تفعيل الحذف الفعلي للشريط المتحرك

  ## المشكلة
  - الحذف لا يعمل في لوحة التحكم
  - RLS policies تسمح بالحذف فقط للـ authenticated
  - المسؤولون يستخدمون الإدارة بدون authentication

  ## الحل
  1. إضافة policy للسماح بالحذف لـ anon
  2. تفعيل الحذف الفوري للجميع
  3. إصلاح policies للإدارة الكاملة

  ## التغييرات
  - إضافة allow_anon_delete لـ platform_activities
  - إضافة allow_anon_delete لـ simulated_activities
  - السماح بالحذف الفعلي بدون قيود
*/

-- إضافة policy للحذف للمستخدمين غير المصادقين (anon)
DROP POLICY IF EXISTS "allow_anon_delete" ON platform_activities;
CREATE POLICY "allow_anon_delete"
  ON platform_activities
  FOR DELETE
  TO anon
  USING (true);

-- إضافة policy للحذف للمستخدمين غير المصادقين (anon) - الجدول الوهمي
DROP POLICY IF EXISTS "allow_anon_delete" ON simulated_activities;
CREATE POLICY "allow_anon_delete"
  ON simulated_activities
  FOR DELETE
  TO anon
  USING (true);

-- إضافة policy للإدراج للمستخدمين غير المصادقين (anon)
DROP POLICY IF EXISTS "allow_anon_insert" ON platform_activities;
CREATE POLICY "allow_anon_insert"
  ON platform_activities
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- إضافة policy للتحديث للمستخدمين غير المصادقين (anon)
DROP POLICY IF EXISTS "allow_anon_update" ON platform_activities;
CREATE POLICY "allow_anon_update"
  ON platform_activities
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- التأكد من تفعيل RLS
ALTER TABLE platform_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulated_activities ENABLE ROW LEVEL SECURITY;

-- إضافة تعليق للتوضيح
COMMENT ON POLICY "allow_anon_delete" ON platform_activities IS 'يسمح للمستخدمين غير المصادقين بحذف الأنشطة - مطلوب للوحة التحكم';
COMMENT ON POLICY "allow_anon_delete" ON simulated_activities IS 'يسمح للمستخدمين غير المصادقين بحذف القوالب الوهمية - مطلوب للوحة التحكم';
