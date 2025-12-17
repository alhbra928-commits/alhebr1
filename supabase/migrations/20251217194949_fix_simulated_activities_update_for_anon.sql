/*
  # إصلاح حاسم: تفعيل التحديث للقوالب الوهمية

  ## المشكلة
  - تعطيل/تفعيل القوالب الوهمية لا يعمل في لوحة التحكم
  - يظهر إشعار نجاح لكن لا يتم التحديث فعلياً
  - RLS policies تسمح بالتحديث فقط للـ authenticated
  - المسؤولون يستخدمون الإدارة بـ anon role

  ## الحل
  - إضافة UPDATE policy لـ anon على simulated_activities
  - السماح بالتحديث الكامل بدون قيود

  ## التغييرات
  - إضافة allow_anon_update لـ simulated_activities
*/

-- إضافة policy للتحديث للمستخدمين غير المصادقين (anon)
DROP POLICY IF EXISTS "allow_anon_update" ON simulated_activities;
CREATE POLICY "allow_anon_update"
  ON simulated_activities
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- إضافة policy للإدراج أيضاً (للتأكد)
DROP POLICY IF EXISTS "allow_anon_insert" ON simulated_activities;
CREATE POLICY "allow_anon_insert"
  ON simulated_activities
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- التأكد من تفعيل RLS
ALTER TABLE simulated_activities ENABLE ROW LEVEL SECURITY;

-- إضافة تعليق للتوضيح
COMMENT ON POLICY "allow_anon_update" ON simulated_activities IS 
'يسمح للمستخدمين غير المصادقين بتحديث القوالب الوهمية (تفعيل/تعطيل) - مطلوب للوحة التحكم';
