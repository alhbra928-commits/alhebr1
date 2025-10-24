/*
  # تحسين جدول قوالب رسائل الواتساب للنظام الذكي

  ## التحسينات الجديدة
  
  ### 1. حقول جديدة
    - `template_icon` - أيقونة رمزية للقالب
    - `priority` - أولوية الترتيب (للسحب والإفلات)
    - `event_trigger` - الحدث المرتبط بالقالب (للربط التلقائي)
    - `has_image` - هل يحتوي القالب على صورة
    - `has_cta_button` - هل يحتوي على زر CTA
    - `cta_button_text` - نص زر CTA
    - `cta_button_url` - رابط زر CTA
    - `last_used_at` - آخر استخدام
    - `status` - حالة القالب (active, inactive, draft, review)
  
  ### 2. تحديثات
    - إضافة قيم افتراضية محسّنة
    - فهرسة للبحث السريع
    - دعم الربط التلقائي بالأحداث

  ## الأمان
  - RLS يبقى كما هو (فقط المشرفون)
*/

-- إضافة الحقول الجديدة
DO $$
BEGIN
  -- أيقونة القالب
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_message_templates' AND column_name = 'template_icon'
  ) THEN
    ALTER TABLE whatsapp_message_templates ADD COLUMN template_icon text DEFAULT 'MessageCircle';
  END IF;

  -- أولوية الترتيب
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_message_templates' AND column_name = 'priority'
  ) THEN
    ALTER TABLE whatsapp_message_templates ADD COLUMN priority integer DEFAULT 0;
  END IF;

  -- الحدث المرتبط
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_message_templates' AND column_name = 'event_trigger'
  ) THEN
    ALTER TABLE whatsapp_message_templates ADD COLUMN event_trigger text;
  END IF;

  -- هل يحتوي صورة
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_message_templates' AND column_name = 'has_image'
  ) THEN
    ALTER TABLE whatsapp_message_templates ADD COLUMN has_image boolean DEFAULT false;
  END IF;

  -- هل يحتوي زر CTA
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_message_templates' AND column_name = 'has_cta_button'
  ) THEN
    ALTER TABLE whatsapp_message_templates ADD COLUMN has_cta_button boolean DEFAULT false;
  END IF;

  -- نص زر CTA
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_message_templates' AND column_name = 'cta_button_text'
  ) THEN
    ALTER TABLE whatsapp_message_templates ADD COLUMN cta_button_text text;
  END IF;

  -- رابط زر CTA
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_message_templates' AND column_name = 'cta_button_url'
  ) THEN
    ALTER TABLE whatsapp_message_templates ADD COLUMN cta_button_url text;
  END IF;

  -- آخر استخدام
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_message_templates' AND column_name = 'last_used_at'
  ) THEN
    ALTER TABLE whatsapp_message_templates ADD COLUMN last_used_at timestamptz;
  END IF;

  -- حالة القالب
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_message_templates' AND column_name = 'status'
  ) THEN
    ALTER TABLE whatsapp_message_templates ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'review'));
  END IF;
END $$;

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_status ON whatsapp_message_templates(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_category ON whatsapp_message_templates(template_category);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_event ON whatsapp_message_templates(event_trigger);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_priority ON whatsapp_message_templates(priority);

-- وظيفة لتحديث last_used_at تلقائياً عند استخدام القالب
CREATE OR REPLACE FUNCTION update_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE whatsapp_message_templates
    SET 
      usage_count = usage_count + 1,
      last_used_at = now(),
      updated_at = now()
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء Trigger لتحديث الاستخدام
DROP TRIGGER IF EXISTS trigger_update_template_usage ON whatsapp_messages;
CREATE TRIGGER trigger_update_template_usage
  AFTER INSERT ON whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_template_usage();

-- إضافة قوالب افتراضية محسّنة (إن لم تكن موجودة)
INSERT INTO whatsapp_message_templates (
  template_code,
  template_name_ar,
  template_category,
  template_icon,
  message_content_ar,
  variables,
  target_audience,
  event_trigger,
  priority,
  status,
  is_active
) VALUES
  (
    'BOOKING_CONFIRMED',
    'تأكيد الحجز',
    'booking',
    'CheckCircle',
    'مرحباً {{اسم_العميل}}،

تم تأكيد حجزكم بنجاح! 

🎯 تفاصيل الحجز:
🌾 المزرعة: {{اسم_المزرعة}}
🌳 عدد الأشجار: {{عدد_الاشجار}}
💰 المبلغ الإجمالي: {{المبلغ}} ريال

رقم الحجز: {{رقم_الحجز}}

نشكركم على ثقتكم بنا 🙏',
    '["اسم_العميل", "اسم_المزرعة", "عدد_الاشجار", "المبلغ", "رقم_الحجز"]',
    ARRAY['investor'],
    'booking_confirmed',
    100,
    'active',
    true
  ),
  (
    'CERTIFICATE_ISSUED',
    'إصدار شهادة الملكية',
    'certificate',
    'Award',
    'تهانينا {{اسم_العميل}}! 🎉

تم إصدار شهادة ملكيتكم بنجاح ✅

📜 بيانات الشهادة:
🌾 المزرعة: {{اسم_المزرعة}}
🌳 عدد الأشجار: {{عدد_الاشجار}}
🔢 رقم الشهادة: {{رقم_الشهادة}}

يمكنكم الآن تحميل الشهادة من حسابكم.

مبروك الملكية! 🌳✨',
    '["اسم_العميل", "اسم_المزرعة", "عدد_الاشجار", "رقم_الشهادة"]',
    ARRAY['investor'],
    'certificate_issued',
    90,
    'active',
    true
  ),
  (
    'PAYMENT_RECEIVED',
    'استلام الدفعة',
    'payment',
    'DollarSign',
    'عزيزنا {{اسم_العميل}}،

تم استلام دفعتكم بنجاح 💰✅

💳 تفاصيل الدفعة:
💵 المبلغ: {{المبلغ}} ريال
📅 التاريخ: {{التاريخ}}
🔢 رقم العملية: {{رقم_العملية}}

شكراً لكم 🙏',
    '["اسم_العميل", "المبلغ", "التاريخ", "رقم_العملية"]',
    ARRAY['investor'],
    'payment_received',
    80,
    'active',
    true
  ),
  (
    'SETTLEMENT_COMPLETED',
    'اكتمال التسوية',
    'settlement',
    'TrendingUp',
    'السلام عليكم {{اسم_المالك}}،

تم إتمام تسوية مزرعتكم {{اسم_المزرعة}} بنجاح! 🎉

💰 ملخص التسوية:
📊 الإيرادات: {{الايرادات}} ريال
💳 حصة المالك: {{حصة_المالك}} ريال
👥 حصة المستثمرين: {{حصة_المستثمرين}} ريال

تم توزيع المبالغ على المستثمرين تلقائياً ✅

شكراً لشراكتكم معنا 🙏',
    '["اسم_المالك", "اسم_المزرعة", "الايرادات", "حصة_المالك", "حصة_المستثمرين"]',
    ARRAY['farm_owner'],
    'settlement_completed',
    70,
    'active',
    true
  ),
  (
    'WELCOME_MESSAGE',
    'رسالة ترحيب',
    'greeting',
    'Sparkles',
    'مرحباً بك في منصة مزارع النخيل! 🌴

نحن سعداء بانضمامك إلى عائلتنا {{اسم_العميل}} 🎉

معنا ستتمكن من:
🌳 امتلاك أشجار نخيل
📊 متابعة استثماراتك
💰 الحصول على عوائد دورية
📜 شهادات ملكية موثقة

فريق الدعم جاهز لمساعدتك دائماً 💚

مع تحيات فريق مزارع النخيل 🌴',
    '["اسم_العميل"]',
    ARRAY['investor', 'farm_owner'],
    'user_registered',
    60,
    'active',
    true
  )
ON CONFLICT (template_code) DO NOTHING;
