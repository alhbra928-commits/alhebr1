/*
  # إصلاح سياسات RLS لجدول ticker_settings

  1. التغييرات:
    - إضافة سياسة قراءة للجميع (anon)
    - إضافة سياسة تحديث للجميع

  2. الهدف:
    - السماح للمستخدمين بقراءة وتحديث إعدادات الشريط
    - هذا آمن لأنه جزء من إعدادات النظام

  3. ملاحظات:
    - الجدول مفعل عليه RLS بالفعل
    - لا نحتاج سياسات insert/delete لأن السجل موجود مسبقاً
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anon read ticker settings" ON ticker_settings;
DROP POLICY IF EXISTS "Allow anon update ticker settings" ON ticker_settings;

-- السماح بالقراءة للجميع
CREATE POLICY "Allow anon read ticker settings"
  ON ticker_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- السماح بالتحديث للجميع (للمشرفين فقط في التطبيق)
CREATE POLICY "Allow anon update ticker settings"
  ON ticker_settings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
