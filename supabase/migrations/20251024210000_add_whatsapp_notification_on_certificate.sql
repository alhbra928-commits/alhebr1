/*
  # إضافة إشعار واتساب تلقائي عند إصدار الشهادة

  ## التغييرات
  1. إنشاء Function لإرسال إشعار واتساب عند إصدار شهادة
  2. إضافة Trigger على جدول documentation

  ## الأمان
  - يعمل فقط عند إنشاء شهادة جديدة
  - لا يفشل العملية إذا فشل إرسال الواتساب
*/

-- Function لإرسال إشعار واتساب عند إصدار شهادة
CREATE OR REPLACE FUNCTION notify_whatsapp_certificate_issued()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_settings RECORD;
  v_template RECORD;
  v_message_content TEXT;
BEGIN
  -- التحقق من تفعيل نظام الواتساب
  SELECT * INTO v_settings
  FROM whatsapp_settings
  WHERE is_active = true
  LIMIT 1;

  IF v_settings IS NULL THEN
    RETURN NEW;
  END IF;

  -- الحصول على قالب شهادة الملكية
  SELECT * INTO v_template
  FROM whatsapp_templates
  WHERE template_code = 'CERTIFICATE_ISSUED'
    AND is_active = true
  LIMIT 1;

  IF v_template IS NULL THEN
    RETURN NEW;
  END IF;

  -- بناء محتوى الرسالة
  v_message_content := v_template.message_content_ar;
  v_message_content := REPLACE(v_message_content, '{customer_name}', COALESCE(NEW.customer_name, 'عزيزي العميل'));
  v_message_content := REPLACE(v_message_content, '{certificate_number}', COALESCE(NEW.verification_token, ''));
  v_message_content := REPLACE(v_message_content, '{tree_count}', COALESCE(NEW.reserved_trees::TEXT, '0'));

  -- إدراج رسالة في جدول الرسائل
  BEGIN
    INSERT INTO whatsapp_messages (
      recipient_phone,
      recipient_name,
      recipient_type,
      message_content,
      template_code,
      message_type,
      status,
      trigger_event
    ) VALUES (
      NEW.customer_phone,
      NEW.customer_name,
      'investor',
      v_message_content,
      'CERTIFICATE_ISSUED',
      'auto',
      'pending',
      'certificate_issued'
    );
  EXCEPTION WHEN OTHERS THEN
    -- لا نفشل العملية إذا فشل إدراج الرسالة
    RAISE WARNING 'Failed to insert WhatsApp message: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Trigger على جدول documentation
DROP TRIGGER IF EXISTS trigger_whatsapp_certificate_issued ON documentation;

CREATE TRIGGER trigger_whatsapp_certificate_issued
  AFTER INSERT ON documentation
  FOR EACH ROW
  WHEN (NEW.customer_phone IS NOT NULL AND NEW.customer_phone != '')
  EXECUTE FUNCTION notify_whatsapp_certificate_issued();

-- تحديث الإحصائيات
COMMENT ON FUNCTION notify_whatsapp_certificate_issued IS 'إرسال إشعار واتساب تلقائي عند إصدار شهادة ملكية';
