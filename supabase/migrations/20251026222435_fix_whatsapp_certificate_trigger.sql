/*
  # إعادة إنشاء Trigger إشعار الواتساب عند إصدار الشهادة

  ## التغييرات
  1. حذف الـ trigger القديم إن وُجد
  2. إنشاء Function جديدة لإرسال إشعار واتساب
  3. إضافة Trigger على جدول documentation

  ## الأمان
  - يعمل فقط عند إنشاء شهادة جديدة
  - لا يفشل العملية إذا فشل إرسال الواتساب
*/

-- حذف الـ trigger القديم إن وُجد
DROP TRIGGER IF EXISTS trigger_whatsapp_certificate_issued ON documentation;
DROP FUNCTION IF EXISTS notify_whatsapp_certificate_issued();

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
  v_investor_name TEXT;
BEGIN
  -- التحقق من تفعيل نظام الواتساب
  SELECT * INTO v_settings
  FROM whatsapp_settings
  WHERE is_active = true
  LIMIT 1;

  IF v_settings IS NULL THEN
    RETURN NEW;
  END IF;

  -- الحصول على اسم المستثمر
  SELECT full_name INTO v_investor_name
  FROM investors
  WHERE phone = NEW.investor_phone
  LIMIT 1;

  -- الحصول على قالب شهادة الملكية
  SELECT * INTO v_template
  FROM whatsapp_message_templates
  WHERE template_code = 'CERTIFICATE_ISSUED'
    AND is_active = true
  LIMIT 1;

  -- إذا لم يوجد قالب، استخدم رسالة افتراضية
  IF v_template IS NULL THEN
    v_message_content := 'عزيزي ' || COALESCE(v_investor_name, 'المستثمر') || 
                         '، تم إصدار شهادة ملكية لك. رقم الشهادة: ' || 
                         COALESCE(NEW.verification_token, 'غير متوفر');
  ELSE
    -- بناء محتوى الرسالة من القالب
    v_message_content := v_template.message_content_ar;
    v_message_content := REPLACE(v_message_content, '{customer_name}', COALESCE(v_investor_name, 'عزيزي المستثمر'));
    v_message_content := REPLACE(v_message_content, '{certificate_number}', COALESCE(NEW.verification_token, ''));
    v_message_content := REPLACE(v_message_content, '{tree_count}', COALESCE(NEW.reserved_trees::TEXT, '0'));
  END IF;

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
      trigger_event,
      trigger_reference_id
    ) VALUES (
      NEW.investor_phone,
      v_investor_name,
      'investor',
      v_message_content,
      'CERTIFICATE_ISSUED',
      'auto',
      'pending',
      'certificate_issued',
      NEW.id
    );
  EXCEPTION WHEN OTHERS THEN
    -- لا نفشل العملية إذا فشل إدراج الرسالة
    RAISE WARNING 'Failed to insert WhatsApp message: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Trigger على جدول documentation
CREATE TRIGGER trigger_whatsapp_certificate_issued
  AFTER INSERT ON documentation
  FOR EACH ROW
  WHEN (NEW.investor_phone IS NOT NULL AND NEW.investor_phone != '')
  EXECUTE FUNCTION notify_whatsapp_certificate_issued();

-- تحديث الإحصائيات
COMMENT ON FUNCTION notify_whatsapp_certificate_issued IS 'إرسال إشعار واتساب تلقائي عند إصدار شهادة ملكية';
