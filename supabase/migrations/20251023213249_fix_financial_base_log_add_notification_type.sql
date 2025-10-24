/*
  # إضافة notification إلى القيم المسموحة في financial_base_log
  
  ## المشكلة
  - الـ trigger يحاول تسجيل إنشاء notification في financial_base_log
  - لكن entity_type لا يقبل 'notification'
  - القيم المسموحة: farm, owner, investor, reservation, finance
  
  ## الحل
  - إضافة 'notification' إلى القيم المسموحة
*/

-- حذف الـ constraint القديم
ALTER TABLE financial_base_log 
DROP CONSTRAINT IF EXISTS financial_base_log_entity_type_check;

-- إضافة constraint جديد مع notification
ALTER TABLE financial_base_log
ADD CONSTRAINT financial_base_log_entity_type_check
CHECK (entity_type = ANY (ARRAY[
  'farm'::text, 
  'owner'::text, 
  'investor'::text, 
  'reservation'::text, 
  'finance'::text,
  'notification'::text
]));

COMMENT ON CONSTRAINT financial_base_log_entity_type_check ON financial_base_log IS 
'القيم المسموحة: farm, owner, investor, reservation, finance, notification';
