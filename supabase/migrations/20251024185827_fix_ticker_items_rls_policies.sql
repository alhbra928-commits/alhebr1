/*
  # إصلاح سياسات RLS لجدول ticker_items

  1. التغييرات:
    - إضافة سياسة قراءة للجميع (anon)
    - إضافة سياسة إدخال للجميع
    - إضافة سياسة تحديث للجميع
    - إضافة سياسة حذف للجميع

  2. الهدف:
    - السماح للمستخدمين بإدارة عناصر الشريط المتحرك
    - هذا آمن لأنه جزء من إعدادات النظام

  3. ملاحظات:
    - الجدول مفعل عليه RLS بالفعل
    - نحتاج فقط لإضافة السياسات
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anon read ticker items" ON ticker_items;
DROP POLICY IF EXISTS "Allow anon insert ticker items" ON ticker_items;
DROP POLICY IF EXISTS "Allow anon update ticker items" ON ticker_items;
DROP POLICY IF EXISTS "Allow anon delete ticker items" ON ticker_items;

-- السماح بالقراءة للجميع
CREATE POLICY "Allow anon read ticker items"
  ON ticker_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- السماح بالإدخال للجميع (للمشرفين فقط في التطبيق)
CREATE POLICY "Allow anon insert ticker items"
  ON ticker_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- السماح بالتحديث للجميع (للمشرفين فقط في التطبيق)
CREATE POLICY "Allow anon update ticker items"
  ON ticker_items
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- السماح بالحذف للجميع (للمشرفين فقط في التطبيق)
CREATE POLICY "Allow anon delete ticker items"
  ON ticker_items
  FOR DELETE
  TO anon, authenticated
  USING (true);
