/*
  # إضافة صلاحية القراءة العامة لجدول documentation للتحقق من الشهادات

  1. التغييرات
    - إضافة سياسة RLS تسمح لأي شخص (بما في ذلك المستخدمين المجهولين) بقراءة الشهادات من جدول documentation
    - هذا ضروري لميزة "التحقق من صحة الشهادة" في الواجهة العامة
    - تسمح فقط بقراءة الشهادات غير المحذوفة (deleted_at IS NULL)

  2. الأمان
    - السياسة للقراءة فقط (SELECT)
    - لا تسمح بالكتابة أو التعديل أو الحذف
    - تطبق على جميع المستخدمين (anon و authenticated)
*/

-- إضافة سياسة للسماح بقراءة الشهادات للتحقق منها
CREATE POLICY IF NOT EXISTS "Allow public read access for certificate verification"
  ON documentation
  FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);
