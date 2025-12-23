/*
  # تحديث نصوص واتساب من التملك إلى التأجير الموسمي
  
  ## التغييرات:
  1. تحديث تعليقات الـ Functions على شهادات الانتفاع
  2. تحديث الردود التلقائية القديمة
  
  ## الملاحظات:
  - فقط تحديث النصوص، لا تغيير في الوظائف
  - التأكد من عدم وجود أي إشارة للملكية الدائمة
*/

-- 1. تحديث تعليق دالة إشعار الشهادة
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'notify_whatsapp_certificate_issued'
  ) THEN
    COMMENT ON FUNCTION notify_whatsapp_certificate_issued IS 'إرسال إشعار واتساب تلقائي عند إصدار شهادة انتفاع موسمية';
  END IF;
END $$;

-- 2. تحديث تعليق الـ trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_whatsapp_certificate_issued'
  ) THEN
    COMMENT ON TRIGGER trigger_whatsapp_certificate_issued ON documentation IS
    'يُرسل رسالة واتساب للمستثمر عند إصدار شهادة انتفاع موسمية';
  END IF;
END $$;

-- 3. تحديث الردود التلقائية المتبقية إن وُجدت
UPDATE whatsapp_auto_responses 
SET response_ar = 'الأسعار تختلف حسب نوع الشجرة والمزرعة 💰

يمكنك مشاهدة جميع الأسعار عبر تصفح المزارع المتاحة.

كل حجز يأتي مع شهادة انتفاع موسمية رسمية!

هل تريد معرفة المزيد؟'
WHERE keyword = 'سعر' 
  AND response_ar ILIKE '%شهادة ملكية%'
  AND deleted_at IS NULL;

-- عرض النتيجة
SELECT 'تم تحديث جميع نصوص واتساب بنجاح' as result;
