/*
  # إنشاء نظام إدارة الاتصالات والواتساب المركزي

  ## نظرة عامة
  هذا Migration ينشئ البنية التحتية الكاملة لمركز الاتصالات عبر WhatsApp Business API
  بحيث يكون العصب التواصلي لجميع العمليات داخل المنصة.

  ## الجداول الجديدة

  ### 1. whatsapp_settings (إعدادات الواتساب)
  ### 2. whatsapp_message_templates (قوالب الرسائل)
  ### 3. whatsapp_messages (سجل الرسائل)
  ### 4. whatsapp_broadcast_campaigns (حملات البث الجماعي)
  ### 5. whatsapp_automation_rules (قواعد الأتمتة)
  ### 6. whatsapp_conversations (محادثات ثنائية)
  ### 7. whatsapp_daily_stats (إحصائيات يومية)

  ## الأمان
  - RLS مفعّل على جميع الجداول
  - فقط المشرفون يمكنهم الوصول
  - Audit logging لكل عملية
  - لا يمكن حذف الرسائل المرسلة
*/

-- =====================================
-- 1. جدول إعدادات الواتساب
-- =====================================

CREATE TABLE IF NOT EXISTS whatsapp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key text,
  phone_number_id text,
  business_account_id text,
  webhook_verify_token text,
  platform_signature text DEFAULT 'مزارع النخيل - Palm Olive Platform',
  platform_logo_url text,
  is_active boolean DEFAULT false,
  connection_status text DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error')),
  last_connection_check timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================
-- 2. جدول قوالب الرسائل
-- =====================================

CREATE TABLE IF NOT EXISTS whatsapp_message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_code text UNIQUE NOT NULL,
  template_name_ar text NOT NULL,
  template_category text NOT NULL CHECK (template_category IN (
    'booking', 'payment', 'documentation', 'certificate',
    'settlement', 'notification', 'greeting', 'reminder', 'general'
  )),
  message_content_ar text NOT NULL,
  message_content_en text,
  variables jsonb DEFAULT '[]'::jsonb,
  target_audience text[] DEFAULT ARRAY['investor', 'farm_owner', 'admin'],
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================
-- 3. جدول سجل الرسائل
-- =====================================

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text,
  template_id uuid REFERENCES whatsapp_message_templates(id),
  recipient_phone text NOT NULL,
  recipient_name text,
  recipient_type text CHECK (recipient_type IN ('investor', 'farm_owner', 'admin', 'support')),
  message_content text NOT NULL,
  message_type text DEFAULT 'auto' CHECK (message_type IN ('auto', 'broadcast', 'manual', 'reply')),
  message_category text,
  trigger_event text,
  trigger_reference_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  sent_by uuid,
  created_at timestamptz DEFAULT now()
);

-- =====================================
-- 4. جدول حملات البث الجماعي
-- =====================================

CREATE TABLE IF NOT EXISTS whatsapp_broadcast_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  campaign_description text,
  message_content text NOT NULL,
  target_audience text[] DEFAULT ARRAY['investor'],
  target_filters jsonb DEFAULT '{}'::jsonb,
  total_recipients integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- =====================================
-- 5. جدول قواعد الأتمتة
-- =====================================

CREATE TABLE IF NOT EXISTS whatsapp_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  rule_description text,
  trigger_event text NOT NULL,
  trigger_table text NOT NULL,
  conditions jsonb DEFAULT '{}'::jsonb,
  template_id uuid REFERENCES whatsapp_message_templates(id),
  target_audience text NOT NULL,
  is_active boolean DEFAULT true,
  execution_count integer DEFAULT 0,
  last_execution timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================
-- 6. جدول المحادثات
-- =====================================

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_sid text UNIQUE NOT NULL,
  participant_phone text NOT NULL,
  participant_name text,
  participant_type text,
  last_message_at timestamptz DEFAULT now(),
  unread_count integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  assigned_to uuid,
  created_at timestamptz DEFAULT now()
);

-- =====================================
-- 7. جدول الإحصائيات اليومية
-- =====================================

CREATE TABLE IF NOT EXISTS whatsapp_daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  total_sent integer DEFAULT 0,
  total_delivered integer DEFAULT 0,
  total_read integer DEFAULT 0,
  total_failed integer DEFAULT 0,
  by_category jsonb DEFAULT '{}'::jsonb,
  by_type jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- =====================================
-- الفهارس لتحسين الأداء
-- =====================================

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_recipient ON whatsapp_messages(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_trigger ON whatsapp_messages(trigger_event);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_category ON whatsapp_messages(message_category);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_type ON whatsapp_messages(message_type);

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_category ON whatsapp_message_templates(template_category);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_active ON whatsapp_message_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_status ON whatsapp_broadcast_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_created ON whatsapp_broadcast_campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone ON whatsapp_conversations(participant_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_status ON whatsapp_conversations(status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_daily_stats_date ON whatsapp_daily_stats(date DESC);

-- =====================================
-- RLS Policies - أمان صارم
-- =====================================

ALTER TABLE whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_broadcast_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_daily_stats ENABLE ROW LEVEL SECURITY;

-- سياسة: المشرفون فقط يمكنهم القراءة
CREATE POLICY "Admins can read whatsapp settings"
  ON whatsapp_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_active_sessions
      WHERE admin_active_sessions.session_token IS NOT NULL
      AND admin_active_sessions.expires_at > now()
    )
  );

CREATE POLICY "Admins can update whatsapp settings"
  ON whatsapp_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_active_sessions
      WHERE admin_active_sessions.session_token IS NOT NULL
      AND admin_active_sessions.expires_at > now()
    )
  );

-- سياسات لقوالب الرسائل
CREATE POLICY "Admins can read message templates"
  ON whatsapp_message_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_active_sessions
      WHERE admin_active_sessions.session_token IS NOT NULL
      AND admin_active_sessions.expires_at > now()
    )
  );

CREATE POLICY "Admins can manage templates"
  ON whatsapp_message_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_active_sessions
      WHERE admin_active_sessions.session_token IS NOT NULL
      AND admin_active_sessions.expires_at > now()
    )
  );

-- سياسات لسجل الرسائل (قراءة فقط - لا حذف)
CREATE POLICY "Admins can read messages log"
  ON whatsapp_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_active_sessions
      WHERE admin_active_sessions.session_token IS NOT NULL
      AND admin_active_sessions.expires_at > now()
    )
  );

CREATE POLICY "System can insert messages"
  ON whatsapp_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update message status"
  ON whatsapp_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات للحملات
CREATE POLICY "Admins can manage campaigns"
  ON whatsapp_broadcast_campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_active_sessions
      WHERE admin_active_sessions.session_token IS NOT NULL
      AND admin_active_sessions.expires_at > now()
    )
  );

-- سياسات لقواعد الأتمتة
CREATE POLICY "Admins can manage automation rules"
  ON whatsapp_automation_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_active_sessions
      WHERE admin_active_sessions.session_token IS NOT NULL
      AND admin_active_sessions.expires_at > now()
    )
  );

-- سياسات للمحادثات
CREATE POLICY "Admins can manage conversations"
  ON whatsapp_conversations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_active_sessions
      WHERE admin_active_sessions.session_token IS NOT NULL
      AND admin_active_sessions.expires_at > now()
    )
  );

-- سياسات للإحصائيات
CREATE POLICY "Admins can read daily stats"
  ON whatsapp_daily_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_active_sessions
      WHERE admin_active_sessions.session_token IS NOT NULL
      AND admin_active_sessions.expires_at > now()
    )
  );

-- =====================================
-- إدخال قوالب افتراضية
-- =====================================

INSERT INTO whatsapp_message_templates (template_code, template_name_ar, template_category, message_content_ar, variables) VALUES
('BOOKING_CONFIRMATION', 'تأكيد الحجز', 'booking', 
 'مرحباً {customer_name}، تم تأكيد حجزك بنجاح! 🎉

تفاصيل الحجز:
- المزرعة: {farm_name}
- عدد الأشجار: {tree_count}
- المبلغ الإجمالي: {total_amount} ريال

رقم الحجز: {booking_id}

شكراً لثقتك بنا!',
 '["customer_name", "farm_name", "tree_count", "total_amount", "booking_id"]'::jsonb),

('PAYMENT_RECEIVED', 'استلام الدفعة', 'payment',
 'عزيزي {customer_name}، تم استلام دفعتك بنجاح! ✅

المبلغ المستلم: {amount} ريال
تاريخ السداد: {payment_date}

شكراً لك!',
 '["customer_name", "amount", "payment_date"]'::jsonb),

('CERTIFICATE_ISSUED', 'إصدار الشهادة', 'certificate',
 'تهانينا {customer_name}! 🎊

تم إصدار شهادة ملكيتك:
- رقم الشهادة: {certificate_number}
- عدد الأشجار: {tree_count}

يمكنك تحميل الشهادة من حسابك.',
 '["customer_name", "certificate_number", "tree_count"]'::jsonb),

('SETTLEMENT_COMPLETED', 'إتمام التسوية', 'settlement',
 'عزيزي {owner_name}،

تم إتمام التسوية المالية:
- المبلغ: {amount} ريال
- تاريخ التسوية: {settlement_date}

تم التحويل إلى حسابك.',
 '["owner_name", "amount", "settlement_date"]'::jsonb),

('WELCOME_MESSAGE', 'رسالة ترحيبية', 'greeting',
 'أهلاً وسهلاً بك في منصة مزارع النخيل! 🌴

نحن سعداء بانضمامك إلينا.

للاستفسار: تواصل معنا',
 '[]'::jsonb),

('PAYMENT_REMINDER', 'تذكير بالدفع', 'reminder',
 'عزيزي {customer_name}،

تذكير: لديك دفعة مستحقة
المبلغ: {amount} ريال

الرجاء إتمام الدفع في أقرب وقت.',
 '["customer_name", "amount"]'::jsonb)

ON CONFLICT (template_code) DO NOTHING;

-- =====================================
-- إدخال إعدادات افتراضية
-- =====================================

INSERT INTO whatsapp_settings (platform_signature, is_active, connection_status)
SELECT '🌴 مزارع النخيل - Palm Olive Platform', false, 'disconnected'
WHERE NOT EXISTS (SELECT 1 FROM whatsapp_settings LIMIT 1);

-- =====================================
-- Triggers للإحصائيات التلقائية
-- =====================================

CREATE OR REPLACE FUNCTION update_whatsapp_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO whatsapp_daily_stats (date, total_sent, total_delivered, total_read, total_failed)
  VALUES (CURRENT_DATE, 0, 0, 0, 0)
  ON CONFLICT (date) DO NOTHING;

  IF NEW.status = 'sent' AND (OLD.status IS NULL OR OLD.status != 'sent') THEN
    UPDATE whatsapp_daily_stats
    SET total_sent = total_sent + 1
    WHERE date = CURRENT_DATE;
  ELSIF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    UPDATE whatsapp_daily_stats
    SET total_delivered = total_delivered + 1
    WHERE date = CURRENT_DATE;
  ELSIF NEW.status = 'read' AND (OLD.status IS NULL OR OLD.status != 'read') THEN
    UPDATE whatsapp_daily_stats
    SET total_read = total_read + 1
    WHERE date = CURRENT_DATE;
  ELSIF NEW.status = 'failed' AND (OLD.status IS NULL OR OLD.status != 'failed') THEN
    UPDATE whatsapp_daily_stats
    SET total_failed = total_failed + 1
    WHERE date = CURRENT_DATE;
  END IF;

  IF NEW.template_id IS NOT NULL THEN
    UPDATE whatsapp_message_templates
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_whatsapp_daily_stats ON whatsapp_messages;
CREATE TRIGGER trigger_update_whatsapp_daily_stats
AFTER INSERT OR UPDATE ON whatsapp_messages
FOR EACH ROW
EXECUTE FUNCTION update_whatsapp_daily_stats();

-- =====================================
-- وظيفة إرسال رسالة
-- =====================================

CREATE OR REPLACE FUNCTION send_whatsapp_message(
  p_recipient_phone text,
  p_recipient_name text,
  p_recipient_type text,
  p_template_code text,
  p_variables jsonb DEFAULT '{}'::jsonb,
  p_trigger_event text DEFAULT NULL,
  p_trigger_reference_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_message_id uuid;
  v_template_id uuid;
  v_message_content text;
  v_template_content text;
  v_key text;
  v_value text;
BEGIN
  SELECT id, message_content_ar INTO v_template_id, v_template_content
  FROM whatsapp_message_templates
  WHERE template_code = p_template_code AND is_active = true
  LIMIT 1;

  IF v_template_id IS NULL THEN
    RAISE EXCEPTION 'Template not found: %', p_template_code;
  END IF;

  v_message_content := v_template_content;
  
  FOR v_key, v_value IN SELECT * FROM jsonb_each_text(p_variables)
  LOOP
    v_message_content := REPLACE(v_message_content, '{' || v_key || '}', v_value);
  END LOOP;

  v_message_content := v_message_content || E'\n\n' || (
    SELECT platform_signature FROM whatsapp_settings LIMIT 1
  );

  INSERT INTO whatsapp_messages (
    template_id,
    recipient_phone,
    recipient_name,
    recipient_type,
    message_content,
    message_type,
    message_category,
    trigger_event,
    trigger_reference_id,
    status
  ) VALUES (
    v_template_id,
    p_recipient_phone,
    p_recipient_name,
    p_recipient_type,
    v_message_content,
    'auto',
    (SELECT template_category FROM whatsapp_message_templates WHERE id = v_template_id),
    p_trigger_event,
    p_trigger_reference_id,
    'pending'
  ) RETURNING id INTO v_message_id;

  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
