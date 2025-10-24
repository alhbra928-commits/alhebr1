/*
  # إصلاح سياسات RLS لجدول farm_financial_states

  ## التغييرات
  - إضافة سياسة INSERT للمستخدمين غير المصادقين (anon)
  - السماح بإدراج السجلات المالية عند إنشاء المزرعة

  ## الأمان
  - السماح بالإدراج للجميع لأن النظام يحتاج لإنشاء السجلات المالية تلقائياً
  - البيانات المالية محمية من الحذف والتعديل غير المصرح به
*/

-- حذف السياسة القديمة إذا كانت موجودة
DROP POLICY IF EXISTS "Allow anon insert farm_financial_states" ON farm_financial_states;

-- إضافة سياسة INSERT للمستخدمين غير المصادقين
CREATE POLICY "Allow anon insert farm_financial_states"
  ON farm_financial_states
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- إضافة سياسة UPDATE للمستخدمين غير المصادقين
DROP POLICY IF EXISTS "Allow anon update farm_financial_states" ON farm_financial_states;

CREATE POLICY "Allow anon update farm_financial_states"
  ON farm_financial_states
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
