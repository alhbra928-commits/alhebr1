/*
  # إضافة إشعار واتساب تلقائي عند إتمام التسوية المالية

  ## التغييرات
  1. إنشاء Function لإرسال إشعار واتساب لصاحب المزرعة
  2. إضافة Trigger على جدول smart_farm_financial_stats

  ## الأمان
  - يعمل فقط عند تحديث حالة التسوية إلى completed
  - لا يفشل العملية إذا فشل إرسال الواتساب
*/

-- Function لإرسال إشعار واتساب عند إتمام التسوية
CREATE OR REPLACE FUNCTION notify_whatsapp_settlement_completed()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_settings RECORD;
  v_template RECORD;
  v_message_content TEXT;
  v_owner_phone TEXT;
  v_owner_name TEXT;
BEGIN
  -- التحقق من أن حالة التسوية تغيرت إلى completed
  IF NEW.settlement_status != 'completed' OR (OLD.settlement_status = 'completed') THEN
    RETURN NEW;
  END IF;

  -- التحقق من تفعيل نظام الواتساب
  SELECT * INTO v_settings
  FROM whatsapp_settings
  WHERE is_active = true
  LIMIT 1;

  IF v_settings IS NULL THEN
    RETURN NEW;
  END IF;

  -- الحصول على بيانات صاحب المزرعة
  SELECT
    fo.owner_name,
    fo.mobile_number
  INTO v_owner_name, v_owner_phone
  FROM farm_owners fo
  WHERE fo.farm_code = NEW.farm_code
    AND fo.deleted_at IS NULL
  LIMIT 1;

  IF v_owner_phone IS NULL OR v_owner_phone = '' THEN
    RETURN NEW;
  END IF;

  -- الحصول على قالب التسوية
  SELECT * INTO v_template
  FROM whatsapp_templates
  WHERE template_code = 'SETTLEMENT_COMPLETED'
    AND is_active = true
  LIMIT 1;

  IF v_template IS NULL THEN
    RETURN NEW;
  END IF;

  -- بناء محتوى الرسالة
  v_message_content := v_template.message_content_ar;
  v_message_content := REPLACE(v_message_content, '{owner_name}', COALESCE(v_owner_name, 'عزيزي صاحب المزرعة'));
  v_message_content := REPLACE(v_message_content, '{amount}', COALESCE(NEW.owner_share::TEXT, '0'));
  v_message_content := REPLACE(v_message_content, '{settlement_date}', COALESCE(NEW.settlement_date::TEXT, CURRENT_DATE::TEXT));

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
      v_owner_phone,
      v_owner_name,
      'farm_owner',
      v_message_content,
      'SETTLEMENT_COMPLETED',
      'auto',
      'pending',
      'settlement_completed'
    );
  EXCEPTION WHEN OTHERS THEN
    -- لا نفشل العملية إذا فشل إدراج الرسالة
    RAISE WARNING 'Failed to insert WhatsApp settlement message: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Trigger على جدول smart_farm_financial_stats
DROP TRIGGER IF EXISTS trigger_whatsapp_settlement_completed ON smart_farm_financial_stats;

CREATE TRIGGER trigger_whatsapp_settlement_completed
  AFTER UPDATE ON smart_farm_financial_stats
  FOR EACH ROW
  WHEN (NEW.settlement_status = 'completed')
  EXECUTE FUNCTION notify_whatsapp_settlement_completed();

-- تحديث الإحصائيات
COMMENT ON FUNCTION notify_whatsapp_settlement_completed IS 'إرسال إشعار واتساب تلقائي لصاحب المزرعة عند إتمام التسوية المالية';
