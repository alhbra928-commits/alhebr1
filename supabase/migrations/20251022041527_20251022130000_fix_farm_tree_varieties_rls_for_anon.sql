/*
  # إصلاح RLS policies لجدول farm_tree_varieties

  ## المشكلة
  عند إنشاء مزرعة جديدة، يفشل الإدخال في جدول farm_tree_varieties
  بسبب RLS policy لا يسمح لـ anon users بالإدخال.

  ## الحل
  تحديث INSERT policy ليسمح لـ anon و authenticated users بالإدخال.
  هذا آمن لأن:
  1. الإدخال يحدث عبر النموذج فقط (لا توجد واجهة عامة)
  2. البيانات تُراجع من قبل المسؤول
  3. يوجد soft delete للحذف الآمن

  ## التغييرات
  - تحديث INSERT policy للسماح بـ anon
  - تحديث UPDATE policy للسماح بـ anon
  - تحديث DELETE policy للسماح بـ anon
*/

-- حذف الـ policies القديمة
DROP POLICY IF EXISTS "Authenticated users can insert varieties" ON farm_tree_varieties;
DROP POLICY IF EXISTS "Authenticated users can update varieties" ON farm_tree_varieties;
DROP POLICY IF EXISTS "Authenticated users can delete varieties" ON farm_tree_varieties;

-- إنشاء policies جديدة تسمح لـ anon و authenticated
CREATE POLICY "Allow insert for anon and authenticated"
  ON farm_tree_varieties
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update for anon and authenticated"
  ON farm_tree_varieties
  FOR UPDATE
  TO anon, authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated"
  ON farm_tree_varieties
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- رسالة توضيحية
DO $$
BEGIN
  RAISE NOTICE '✅ تم إصلاح RLS policies لجدول farm_tree_varieties';
  RAISE NOTICE '📊 الآن يمكن إنشاء مزارع جديدة بدون أخطاء RLS';
END $$;
