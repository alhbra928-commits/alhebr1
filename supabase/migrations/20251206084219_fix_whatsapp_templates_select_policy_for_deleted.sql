/*
  # إصلاح SELECT policy لرؤية الصفوف المحذوفة
  
  1. المشكلة:
    - عند حذف قالب (soft delete)، PostgREST يحاول إرجاع الصف المحدث
    - SELECT policy الحالية تمنع رؤية الصفوف التي `deleted_at IS NOT NULL`
    - هذا يسبب خطأ 401 لأن الصف "اختفى" بعد التحديث
    
  2. الحل:
    - السماح برؤية جميع الصفوف (محذوفة وغير محذوفة)
    - التطبيق سيفلتر الصفوف المحذوفة في الكود
    
  3. Security:
    - لا توجد مشكلة أمنية - القوالب ليست سرية
    - الصفوف المحذوفة soft delete فقط
*/

-- حذف policy القديمة المقيدة
DROP POLICY IF EXISTS "Anyone can read active whatsapp templates" ON whatsapp_templates;

-- إنشاء policy جديدة تسمح برؤية جميع الصفوف
CREATE POLICY "Anyone can read all whatsapp templates"
  ON whatsapp_templates
  FOR SELECT
  TO anon, authenticated
  USING (true);
