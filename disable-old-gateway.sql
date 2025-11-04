-- تعطيل البوابة القديمة لأننا استبدلناها بشاشة تحميل مبتكرة

UPDATE mazad_gateway_settings
SET 
  enabled = false,
  auto_enter_enabled = false
WHERE id = 'd06bd962-d0a4-411a-a510-7deedb987839';

-- رسالة تأكيد
SELECT 
  'البوابة القديمة تم تعطيلها ✅' as status,
  'تم استبدالها بشاشة تحميل مبتكرة' as note;
