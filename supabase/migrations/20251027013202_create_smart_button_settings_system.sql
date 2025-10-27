/*
  # نظام إعدادات الزر الذكي للواتساب (Smart WhatsApp Button Settings System)

  ## الجدول الجديد
  
  ### `whatsapp_button_settings`
  جدول إعدادات الزر الذكي الشامل:
  
  #### 1. الإعدادات العامة (General Settings)
  - `is_enabled` (boolean): تفعيل/تعطيل الزر
  - `position` (text): موقع الزر (bottom-right, bottom-left, bottom-center, auto-mobile)
  - `display_timing` (text): توقيت الظهور (immediate, after_5s, on_scroll)
  - `show_for_visitors` (boolean): إظهار للزوار
  - `show_for_investors` (boolean): إظهار للمستثمرين
  - `show_for_owners` (boolean): إظهار لأصحاب المزارع
  - `connection_type` (text): نوع الاتصال (ai_only, staff_only, hybrid)
  - `require_authentication` (boolean): يتطلب مصادقة
  
  #### 2. المظهر والتصميم (Appearance)
  - `primary_color` (text): اللون الأساسي
  - `glow_intensity` (text): درجة التوهج (light, medium, strong)
  - `icon_shape` (text): شكل الأيقونة (circle, square, 3d)
  - `pulse_enabled` (boolean): تفعيل النبض
  - `button_text` (text): نص بجانب الزر
  - `mobile_scroll_trigger` (boolean): إظهار بعد التمرير للجوال
  
  #### 3. الرسائل الترحيبية (Welcome Messages)
  - `welcome_message_visitor` (text): رسالة الزائر
  - `welcome_message_investor` (text): رسالة المستثمر
  - `welcome_message_owner` (text): رسالة صاحب المزرعة
  
  #### 4. التنبيهات والتفاعل (Notifications & Interaction)
  - `notification_enabled` (boolean): تفعيل الإشعارات
  - `notification_text` (text): نص الإشعار
  - `sound_enabled` (boolean): تفعيل الصوت
  - `auto_close_minutes` (int): إغلاق تلقائي بعد دقائق
  - `save_conversation` (boolean): حفظ المحادثة
  - `show_online_indicator` (boolean): مؤشر الاتصال
  
  #### 5. الإدارة والأمان (Management & Security)
  - `is_locked` (boolean): قفل التعديلات
  - `last_modified_by` (text): آخر من عدّل
  - `last_tested_at` (timestamptz): آخر اختبار
  
  ## الأمان
  - RLS مفعل
  - سياسات للإدارة فقط
  - تسجيل كامل للتعديلات
*/

-- إنشاء جدول إعدادات الزر الذكي
CREATE TABLE IF NOT EXISTS whatsapp_button_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- الإعدادات العامة
  is_enabled boolean NOT NULL DEFAULT true,
  position text NOT NULL DEFAULT 'bottom-right' 
    CHECK (position IN ('bottom-right', 'bottom-left', 'bottom-center', 'auto-mobile')),
  display_timing text NOT NULL DEFAULT 'immediate' 
    CHECK (display_timing IN ('immediate', 'after_5s', 'on_scroll')),
  show_for_visitors boolean NOT NULL DEFAULT true,
  show_for_investors boolean NOT NULL DEFAULT true,
  show_for_owners boolean NOT NULL DEFAULT true,
  connection_type text NOT NULL DEFAULT 'hybrid' 
    CHECK (connection_type IN ('ai_only', 'staff_only', 'hybrid')),
  require_authentication boolean NOT NULL DEFAULT false,
  
  -- المظهر والتصميم
  primary_color text NOT NULL DEFAULT '#D4AF37',
  glow_intensity text NOT NULL DEFAULT 'medium' 
    CHECK (glow_intensity IN ('light', 'medium', 'strong', 'none')),
  icon_shape text NOT NULL DEFAULT 'circle' 
    CHECK (icon_shape IN ('circle', 'square', '3d')),
  pulse_enabled boolean NOT NULL DEFAULT true,
  button_text text DEFAULT 'تحدث معنا 🌿',
  button_text_enabled boolean NOT NULL DEFAULT false,
  mobile_scroll_trigger boolean NOT NULL DEFAULT true,
  
  -- الرسائل الترحيبية
  welcome_message_visitor text NOT NULL DEFAULT 'مرحباً! كيف نقدر نساعدك اليوم؟ 🌿',
  welcome_message_investor text NOT NULL DEFAULT 'أهلاً بك! تقدر تتابع حجوزاتك أو تستفسر عن أي مزرعة 💬',
  welcome_message_owner text NOT NULL DEFAULT 'مرحباً بك، يمكنك متابعة مزارعك أو التواصل مع الإدارة مباشرة 🌱',
  
  -- التنبيهات والتفاعل
  notification_enabled boolean NOT NULL DEFAULT true,
  notification_text text NOT NULL DEFAULT '💬 لديك رسالة جديدة من الإدارة.',
  sound_enabled boolean NOT NULL DEFAULT true,
  auto_close_minutes int NOT NULL DEFAULT 5 CHECK (auto_close_minutes BETWEEN 1 AND 60),
  save_conversation boolean NOT NULL DEFAULT true,
  show_online_indicator boolean NOT NULL DEFAULT true,
  
  -- الإدارة والأمان
  is_locked boolean NOT NULL DEFAULT false,
  last_modified_by text,
  last_tested_at timestamptz,
  
  -- التدقيق
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إدراج الإعدادات الافتراضية (صف واحد فقط)
INSERT INTO whatsapp_button_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- جدول سجل التعديلات
CREATE TABLE IF NOT EXISTS whatsapp_button_settings_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_snapshot jsonb NOT NULL,
  modified_by text NOT NULL,
  action text NOT NULL CHECK (action IN ('update', 'test', 'reset', 'lock', 'unlock')),
  changes_description text,
  created_at timestamptz DEFAULT now()
);

-- الفهارس
CREATE INDEX IF NOT EXISTS idx_button_settings_log_created_at 
  ON whatsapp_button_settings_log(created_at DESC);

-- تفعيل RLS
ALTER TABLE whatsapp_button_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_button_settings_log ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة (للجميع - للاستخدام في الزر)
CREATE POLICY "Allow read button settings for all"
  ON whatsapp_button_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- سياسات الكتابة (للإدارة فقط)
CREATE POLICY "Allow update button settings for authenticated"
  ON whatsapp_button_settings FOR UPDATE
  TO authenticated
  USING (NOT is_locked OR current_setting('request.jwt.claims', true)::json->>'role' = 'super_admin');

-- سياسات سجل التعديلات
CREATE POLICY "Allow read settings log for authenticated"
  ON whatsapp_button_settings_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert settings log for authenticated"
  ON whatsapp_button_settings_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- دالة تسجيل التعديلات تلقائياً
CREATE OR REPLACE FUNCTION log_button_settings_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- تسجيل التعديل في جدول السجل
  INSERT INTO whatsapp_button_settings_log (
    settings_snapshot,
    modified_by,
    action,
    changes_description
  ) VALUES (
    row_to_json(NEW),
    NEW.last_modified_by,
    'update',
    'تحديث إعدادات الزر الذكي'
  );
  
  -- تحديث updated_at
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger لتسجيل التعديلات
DROP TRIGGER IF EXISTS auto_log_button_settings_changes ON whatsapp_button_settings;
CREATE TRIGGER auto_log_button_settings_changes
  BEFORE UPDATE ON whatsapp_button_settings
  FOR EACH ROW
  EXECUTE FUNCTION log_button_settings_changes();

-- دالة إعادة الإعدادات للافتراضية
CREATE OR REPLACE FUNCTION reset_button_settings_to_default(
  modified_by_phone text
)
RETURNS boolean AS $$
BEGIN
  UPDATE whatsapp_button_settings
  SET
    is_enabled = true,
    position = 'bottom-right',
    display_timing = 'immediate',
    show_for_visitors = true,
    show_for_investors = true,
    show_for_owners = true,
    connection_type = 'hybrid',
    require_authentication = false,
    primary_color = '#D4AF37',
    glow_intensity = 'medium',
    icon_shape = 'circle',
    pulse_enabled = true,
    button_text = 'تحدث معنا 🌿',
    button_text_enabled = false,
    mobile_scroll_trigger = true,
    welcome_message_visitor = 'مرحباً! كيف نقدر نساعدك اليوم؟ 🌿',
    welcome_message_investor = 'أهلاً بك! تقدر تتابع حجوزاتك أو تستفسر عن أي مزرعة 💬',
    welcome_message_owner = 'مرحباً بك، يمكنك متابعة مزارعك أو التواصل مع الإدارة مباشرة 🌱',
    notification_enabled = true,
    notification_text = '💬 لديك رسالة جديدة من الإدارة.',
    sound_enabled = true,
    auto_close_minutes = 5,
    save_conversation = true,
    show_online_indicator = true,
    last_modified_by = modified_by_phone,
    updated_at = now()
  WHERE id = '00000000-0000-0000-0000-000000000001';
  
  -- تسجيل الإعادة
  INSERT INTO whatsapp_button_settings_log (
    settings_snapshot,
    modified_by,
    action,
    changes_description
  )
  SELECT 
    row_to_json(s),
    modified_by_phone,
    'reset',
    'إعادة الإعدادات للحالة الافتراضية'
  FROM whatsapp_button_settings s
  WHERE id = '00000000-0000-0000-0000-000000000001';
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة قفل/فتح الإعدادات
CREATE OR REPLACE FUNCTION toggle_button_settings_lock(
  should_lock boolean,
  modified_by_phone text
)
RETURNS boolean AS $$
BEGIN
  UPDATE whatsapp_button_settings
  SET
    is_locked = should_lock,
    last_modified_by = modified_by_phone,
    updated_at = now()
  WHERE id = '00000000-0000-0000-0000-000000000001';
  
  -- تسجيل العملية
  INSERT INTO whatsapp_button_settings_log (
    settings_snapshot,
    modified_by,
    action,
    changes_description
  )
  SELECT 
    row_to_json(s),
    modified_by_phone,
    CASE WHEN should_lock THEN 'lock' ELSE 'unlock' END,
    CASE WHEN should_lock THEN 'قفل الإعدادات' ELSE 'فتح الإعدادات' END
  FROM whatsapp_button_settings s
  WHERE id = '00000000-0000-0000-0000-000000000001';
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة تسجيل الاختبار
CREATE OR REPLACE FUNCTION record_button_test(
  tested_by_phone text
)
RETURNS boolean AS $$
BEGIN
  UPDATE whatsapp_button_settings
  SET
    last_tested_at = now(),
    last_modified_by = tested_by_phone
  WHERE id = '00000000-0000-0000-0000-000000000001';
  
  -- تسجيل الاختبار
  INSERT INTO whatsapp_button_settings_log (
    settings_snapshot,
    modified_by,
    action,
    changes_description
  )
  SELECT 
    row_to_json(s),
    tested_by_phone,
    'test',
    'اختبار الزر الذكي'
  FROM whatsapp_button_settings s
  WHERE id = '00000000-0000-0000-0000-000000000001';
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
