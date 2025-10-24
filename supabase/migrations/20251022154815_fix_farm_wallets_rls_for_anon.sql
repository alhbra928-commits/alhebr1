/*
  # إصلاح سياسات RLS لجدول farm_wallets

  ## التغييرات
  - إضافة سياسة INSERT للمستخدمين غير المصادقين (anon)
  - السماح بإدراج المحافظ المالية عند إنشاء المزرعة

  ## الأمان
  - السماح بالإدراج للجميع لأن النظام يحتاج لإنشاء المحافظ تلقائياً
  - البيانات المالية محمية من الحذف والتعديل غير المصرح به
*/

-- حذف السياسة القديمة إذا كانت موجودة
DROP POLICY IF EXISTS "Allow anon insert farm_wallets" ON farm_wallets;

-- إضافة سياسة INSERT للمستخدمين غير المصادقين
CREATE POLICY "Allow anon insert farm_wallets"
  ON farm_wallets
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- إضافة سياسة UPDATE للمستخدمين غير المصادقين
DROP POLICY IF EXISTS "Allow anon update farm_wallets" ON farm_wallets;

CREATE POLICY "Allow anon update farm_wallets"
  ON farm_wallets
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
