/*
  # إصلاح RLS Policy لحذف قوالب الواتساب
  
  1. المشكلة:
    - الـ policy الحالية للحذف تتطلب `with_check: (deleted_at IS NOT NULL)`
    - هذا يمنع عملية التحديث من الصف الذي `deleted_at IS NULL` إلى `deleted_at IS NOT NULL`
    
  2. الحل:
    - دمج policies التحديث والحذف في policy واحدة شاملة
    - السماح بجميع عمليات UPDATE بدون قيود معقدة
    
  3. Security:
    - RLS مفعّل
    - يمكن للجميع (anon, authenticated) تحديث القوالب
    - Soft delete آمن
*/

-- حذف الـ policies القديمة المتضاربة
DROP POLICY IF EXISTS "Anyone can update whatsapp templates" ON whatsapp_templates;
DROP POLICY IF EXISTS "Anyone can soft delete whatsapp templates" ON whatsapp_templates;

-- إنشاء policy جديدة شاملة للتحديث والحذف
CREATE POLICY "Anyone can update or delete whatsapp templates"
  ON whatsapp_templates
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
