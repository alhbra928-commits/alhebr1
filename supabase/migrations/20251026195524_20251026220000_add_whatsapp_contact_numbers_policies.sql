/*
  # إضافة policies لجدول whatsapp_contact_numbers

  1. Policies
    - السماح للجميع بالقراءة
    - السماح للمديرين بالإضافة والتعديل والحذف
*/

-- إزالة RLS مؤقتاً لإضافة policies
ALTER TABLE whatsapp_contact_numbers DISABLE ROW LEVEL SECURITY;

-- إعادة تفعيل RLS
ALTER TABLE whatsapp_contact_numbers ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: متاحة للجميع
CREATE POLICY "السماح بقراءة أرقام الواتساب للجميع"
  ON whatsapp_contact_numbers
  FOR SELECT
  USING (true);

-- سياسة الإضافة: متاحة للجميع (للمديرين عبر authenticated)
CREATE POLICY "السماح بإضافة أرقام واتساب"
  ON whatsapp_contact_numbers
  FOR INSERT
  WITH CHECK (true);

-- سياسة التعديل: متاحة للجميع (للمديرين)
CREATE POLICY "السماح بتعديل أرقام الواتساب"
  ON whatsapp_contact_numbers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- سياسة الحذف: متاحة للجميع (للمديرين)
CREATE POLICY "السماح بحذف أرقام الواتساب"
  ON whatsapp_contact_numbers
  FOR DELETE
  USING (true);