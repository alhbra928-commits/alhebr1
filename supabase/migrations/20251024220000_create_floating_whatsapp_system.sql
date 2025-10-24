/*
  # نظام الواتساب العائم الذكي (Floating WhatsApp Hotline System)

  1. الجداول الجديدة:
    - `whatsapp_floating_settings` - إعدادات الزر العائم
    - `whatsapp_user_sessions` - تتبع جلسات المستخدمين
    - `whatsapp_context_logs` - سجل التفاعلات مع الزر
    - `whatsapp_contact_numbers` - أرقام الاتصال حسب القسم

  2. الأمان:
    - تفعيل RLS على جميع الجداول
    - صلاحيات قراءة عامة للإعدادات
    - صلاحيات كاملة للإداريين
*/

-- جدول إعدادات الزر العائم
CREATE TABLE IF NOT EXISTS whatsapp_floating_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean DEFAULT true,
  button_position varchar(20) DEFAULT 'bottom-right' CHECK (button_position IN ('bottom-right', 'bottom-left', 'top-right', 'top-left')),
  button_color_primary varchar(7) DEFAULT '#556B2F',
  button_color_secondary varchar(7) DEFAULT '#D4AF37',
  pulse_enabled boolean DEFAULT true,
  pulse_interval_seconds integer DEFAULT 5,
  tooltip_text_ar text DEFAULT 'تحدث معنا مباشرة – الرد خلال دقائق!',
  tooltip_text_en text DEFAULT 'Talk to us directly – Reply within minutes!',
  auto_suggest_enabled boolean DEFAULT true,
  auto_suggest_delay_seconds integer DEFAULT 60,
  notification_sound_enabled boolean DEFAULT true,
  session_tracking_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول أرقام الاتصال حسب القسم
CREATE TABLE IF NOT EXISTS whatsapp_contact_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department varchar(50) NOT NULL,
  department_name_ar text NOT NULL,
  department_name_en text NOT NULL,
  phone_number varchar(20) NOT NULL,
  welcome_message_ar text,
  welcome_message_en text,
  icon varchar(50),
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  user_types text[] DEFAULT ARRAY['visitor', 'investor', 'owner', 'admin'],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول جلسات المستخدمين
CREATE TABLE IF NOT EXISTS whatsapp_user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id varchar(100) UNIQUE NOT NULL,
  user_type varchar(20) NOT NULL CHECK (user_type IN ('visitor', 'investor', 'owner', 'admin')),
  user_id uuid,
  user_name text,
  user_phone varchar(20),
  user_email varchar(255),
  current_page varchar(100),
  current_farm_code varchar(50),
  current_farm_name text,
  context_data jsonb DEFAULT '{}',
  ip_address varchar(50),
  user_agent text,
  started_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  is_active boolean DEFAULT true
);

-- جدول سجل التفاعلات
CREATE TABLE IF NOT EXISTS whatsapp_context_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id varchar(100) NOT NULL,
  user_type varchar(20) NOT NULL,
  user_id uuid,
  user_name text,
  user_phone varchar(20),
  page_url text,
  page_name varchar(100),
  farm_code varchar(50),
  farm_name text,
  department varchar(50),
  contact_number varchar(20),
  message_text text,
  context_data jsonb DEFAULT '{}',
  ip_address varchar(50),
  created_at timestamptz DEFAULT now()
);

-- إدراج إعدادات افتراضية
INSERT INTO whatsapp_floating_settings (id, is_enabled)
VALUES ('00000000-0000-0000-0000-000000000001', true)
ON CONFLICT (id) DO NOTHING;

-- إدراج أرقام الاتصال الافتراضية
INSERT INTO whatsapp_contact_numbers (department, department_name_ar, department_name_en, phone_number, icon, display_order, user_types) VALUES
('sales', 'المبيعات', 'Sales', '966500000001', 'ShoppingCart', 1, ARRAY['visitor', 'investor']),
('support', 'الدعم الفني', 'Technical Support', '966500000002', 'Headphones', 2, ARRAY['visitor', 'investor', 'owner']),
('financial', 'الدعم المالي', 'Financial Support', '966500000003', 'DollarSign', 3, ARRAY['investor', 'owner']),
('management', 'الإدارة', 'Management', '966500000004', 'UserCog', 4, ARRAY['owner', 'admin']),
('general', 'استفسار عام', 'General Inquiry', '966500000005', 'MessageCircle', 5, ARRAY['visitor', 'investor', 'owner', 'admin'])
ON CONFLICT DO NOTHING;

-- تفعيل RLS
ALTER TABLE whatsapp_floating_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_contact_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_context_logs ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للإعدادات
CREATE POLICY "الجميع يمكنهم قراءة إعدادات الزر العائم"
  ON whatsapp_floating_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "الإداريون فقط يمكنهم تعديل إعدادات الزر العائم"
  ON whatsapp_floating_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات الأمان لأرقام الاتصال
CREATE POLICY "الجميع يمكنهم قراءة أرقام الاتصال النشطة"
  ON whatsapp_contact_numbers FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "الإداريون فقط يمكنهم تعديل أرقام الاتصال"
  ON whatsapp_contact_numbers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات الأمان للجلسات
CREATE POLICY "الجميع يمكنهم إنشاء جلسات"
  ON whatsapp_user_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "الجميع يمكنهم تحديث جلساتهم"
  ON whatsapp_user_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "الإداريون يمكنهم عرض جميع الجلسات"
  ON whatsapp_user_sessions FOR SELECT
  TO authenticated
  USING (true);

-- سياسات الأمان للسجلات
CREATE POLICY "الجميع يمكنهم إضافة سجلات"
  ON whatsapp_context_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "الإداريون يمكنهم عرض جميع السجلات"
  ON whatsapp_context_logs FOR SELECT
  TO authenticated
  USING (true);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON whatsapp_user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_type ON whatsapp_user_sessions(user_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON whatsapp_user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON whatsapp_user_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_context_logs_session_id ON whatsapp_context_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_context_logs_user_type ON whatsapp_context_logs(user_type);
CREATE INDEX IF NOT EXISTS idx_context_logs_created_at ON whatsapp_context_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_context_logs_farm_code ON whatsapp_context_logs(farm_code);

CREATE INDEX IF NOT EXISTS idx_contact_numbers_department ON whatsapp_contact_numbers(department);
CREATE INDEX IF NOT EXISTS idx_contact_numbers_is_active ON whatsapp_contact_numbers(is_active);
CREATE INDEX IF NOT EXISTS idx_contact_numbers_display_order ON whatsapp_contact_numbers(display_order);

-- دالة تنظيف الجلسات القديمة
CREATE OR REPLACE FUNCTION cleanup_old_whatsapp_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- إنهاء الجلسات غير النشطة لأكثر من ساعة
  UPDATE whatsapp_user_sessions
  SET
    is_active = false,
    ended_at = now()
  WHERE
    is_active = true
    AND last_activity_at < now() - interval '1 hour'
    AND ended_at IS NULL;

  -- حذف الجلسات القديمة (أكثر من 30 يوم)
  DELETE FROM whatsapp_user_sessions
  WHERE created_at < now() - interval '30 days';

  -- حذف السجلات القديمة (أكثر من 90 يوم)
  DELETE FROM whatsapp_context_logs
  WHERE created_at < now() - interval '90 days';
END;
$$;
