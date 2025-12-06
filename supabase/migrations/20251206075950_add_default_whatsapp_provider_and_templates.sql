/*
  # إضافة مزود واتساب افتراضي وقوالب للتطوير

  ## الهدف
  إضافة مزود واتساب وهمي وقوالب تجريبية للسماح بتجربة وظائف الواتساب دون الحاجة لإعداد مزود حقيقي.

  ## التغييرات
  1. إضافة مزود واتساب افتراضي
  2. إضافة قوالب تجريبية للإشعارات والتسويق والدعم والمعاملات
  3. تفعيل جميع الإعدادات

  ## الأمان
  - البيانات وهمية للتطوير فقط
  - لن يتم إرسال رسائل حقيقية
  - يمكن استبدالها ببيانات حقيقية لاحقاً
*/

-- إضافة مزود واتساب افتراضي للتطوير
INSERT INTO whatsapp_providers (
  name,
  type,
  base_url,
  api_key,
  webhook_secret,
  phone_number,
  is_active,
  is_default,
  test_status,
  test_message
)
VALUES (
  'مزود واتساب تجريبي',
  'other',
  'https://test.whatsapp.api/v1',
  'test_api_key_for_development',
  'test_webhook_secret',
  '+966500000000',
  true,
  true,
  'pending',
  'مزود تجريبي للتطوير - لن يتم إرسال رسائل حقيقية'
)
ON CONFLICT DO NOTHING;

-- إضافة قوالب تجريبية
INSERT INTO whatsapp_templates (
  name,
  category,
  content_ar,
  content_en,
  variables,
  is_active,
  usage_count
)
VALUES 
-- قالب للإشعارات
(
  'رسالة ترحيبية',
  'notification',
  'مرحباً {{name}}، نشكرك على تواصلك معنا في منصة مزاد النخيل!',
  'Hello {{name}}, thank you for contacting Palm Auction Platform!',
  '["name"]'::jsonb,
  true,
  0
),
-- قالب للمعاملات
(
  'تأكيد الحجز',
  'transaction',
  'عزيزي {{name}}، تم تأكيد حجزك رقم {{booking_id}} بنجاح! المبلغ: {{amount}} ريال',
  'Dear {{name}}, your booking #{{booking_id}} has been confirmed! Amount: {{amount}} SAR',
  '["name", "booking_id", "amount"]'::jsonb,
  true,
  0
),
-- قالب للدعم
(
  'رد تلقائي',
  'support',
  'شكراً لتواصلك معنا! سيتم الرد عليك في أقرب وقت ممكن.',
  'Thank you for contacting us! We will reply to you as soon as possible.',
  '[]'::jsonb,
  true,
  0
),
-- قالب للتسويق
(
  'عرض خاص',
  'marketing',
  'عزيزي {{name}}، لدينا عرض خاص لك! احجز الآن واحصل على خصم {{discount}}%',
  'Dear {{name}}, we have a special offer for you! Book now and get {{discount}}% discount',
  '["name", "discount"]'::jsonb,
  true,
  0
),
-- قالب OTP
(
  'رمز التحقق',
  'otp',
  'رمز التحقق الخاص بك هو: {{code}} - صالح لمدة 5 دقائق',
  'Your verification code is: {{code}} - valid for 5 minutes',
  '["code"]'::jsonb,
  true,
  0
)
ON CONFLICT DO NOTHING;
