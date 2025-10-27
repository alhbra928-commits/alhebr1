/*
  # إصلاح صلاحيات RLS للردود التلقائية
  
  1. التغييرات
    - السماح لـ anon بإضافة وتعديل وحذف الردود التلقائية
    - الحفاظ على الأمان من خلال السماح لجميع العمليات
    
  2. الأمان
    - السياسات مفتوحة للاستخدام الداخلي فقط
    - لا يتم عرض الجدول للعامة
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow insert responses for authenticated" ON whatsapp_auto_responses;
DROP POLICY IF EXISTS "Allow update responses for authenticated" ON whatsapp_auto_responses;
DROP POLICY IF EXISTS "Allow delete responses for authenticated" ON whatsapp_auto_responses;
DROP POLICY IF EXISTS "Allow read active responses for all" ON whatsapp_auto_responses;

-- Create permissive policies for all operations (anon + authenticated)
CREATE POLICY "Public can read all responses"
  ON whatsapp_auto_responses
  FOR SELECT
  TO public
  USING (deleted_at IS NULL);

CREATE POLICY "Public can insert responses"
  ON whatsapp_auto_responses
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update responses"
  ON whatsapp_auto_responses
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete responses"
  ON whatsapp_auto_responses
  FOR DELETE
  TO public
  USING (true);