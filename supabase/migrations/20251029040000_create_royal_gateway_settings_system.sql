/*
  # إنشاء نظام إعدادات البوابة الملكية

  1. الجداول الجديدة
    - `royal_gateway_settings`
      - `id` (uuid, primary key)
      - `enabled` (boolean) - تفعيل/تعطيل البوابة
      - `auto_enter_enabled` (boolean) - الدخول التلقائي
      - `auto_enter_delay` (integer) - وقت الانتظار بالثواني (1-10)
      - `show_progress_bar` (boolean) - عرض شريط التقدم
      - `particle_density` (text) - كثافة الجزيئات: low, medium, high
      - `animation_speed` (text) - سرعة الحركات: slow, medium, fast
      - `welcome_text_ar` (text) - النص الترحيبي بالعربي
      - `subtitle_text_ar` (text) - النص الثانوي بالعربي
      - `theme_color` (text) - اللون الرئيسي: amber, gold, bronze
      - `show_crown` (boolean) - عرض التاج
      - `show_sparkles` (boolean) - عرض النجوم
      - `show_particles` (boolean) - عرض الجزيئات
      - `show_rings` (boolean) - عرض الحلقات الدوارة
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. الأمان
    - تفعيل RLS
    - سياسات القراءة للجميع
    - سياسات التعديل للمسؤولين فقط

  3. البيانات الافتراضية
    - إضافة إعدادات افتراضية
*/

-- إنشاء الجدول
CREATE TABLE IF NOT EXISTS royal_gateway_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- الإعدادات العامة
  enabled boolean DEFAULT true NOT NULL,
  auto_enter_enabled boolean DEFAULT true NOT NULL,
  auto_enter_delay integer DEFAULT 3 NOT NULL CHECK (auto_enter_delay BETWEEN 1 AND 10),
  show_progress_bar boolean DEFAULT true NOT NULL,

  -- إعدادات التأثيرات
  particle_density text DEFAULT 'medium' NOT NULL CHECK (particle_density IN ('low', 'medium', 'high')),
  animation_speed text DEFAULT 'medium' NOT NULL CHECK (animation_speed IN ('slow', 'medium', 'fast')),

  -- النصوص القابلة للتخصيص
  welcome_text_ar text DEFAULT 'مرحباً بك في عالم الاستثمار الزراعي' NOT NULL,
  subtitle_text_ar text DEFAULT 'تملك أشجار النخيل والزيتون' NOT NULL,
  description_text_ar text DEFAULT 'استثمارك الآمن يبدأ الآن' NOT NULL,

  -- إعدادات المظهر
  theme_color text DEFAULT 'amber' NOT NULL CHECK (theme_color IN ('amber', 'gold', 'bronze')),

  -- عناصر التصميم
  show_crown boolean DEFAULT true NOT NULL,
  show_sparkles boolean DEFAULT true NOT NULL,
  show_particles boolean DEFAULT true NOT NULL,
  show_rings boolean DEFAULT true NOT NULL,
  show_geometric_pattern boolean DEFAULT true NOT NULL,
  show_shimmer_effect boolean DEFAULT true NOT NULL,

  -- التواريخ
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- تفعيل RLS
ALTER TABLE royal_gateway_settings ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: الجميع يمكنهم القراءة (للزوار والمستخدمين)
CREATE POLICY "Anyone can read gateway settings"
  ON royal_gateway_settings
  FOR SELECT
  TO public
  USING (true);

-- سياسة التعديل: المسؤولون فقط
CREATE POLICY "Admins can update gateway settings"
  ON royal_gateway_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE username = current_user
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE username = current_user
    )
  );

-- سياسة الإدراج: المسؤولون فقط
CREATE POLICY "Admins can insert gateway settings"
  ON royal_gateway_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE username = current_user
    )
  );

-- إضافة البيانات الافتراضية
INSERT INTO royal_gateway_settings (
  enabled,
  auto_enter_enabled,
  auto_enter_delay,
  show_progress_bar,
  particle_density,
  animation_speed,
  welcome_text_ar,
  subtitle_text_ar,
  description_text_ar,
  theme_color,
  show_crown,
  show_sparkles,
  show_particles,
  show_rings,
  show_geometric_pattern,
  show_shimmer_effect
) VALUES (
  true,
  true,
  3,
  true,
  'medium',
  'medium',
  'مرحباً بك في عالم الاستثمار الزراعي',
  'تملك أشجار النخيل والزيتون',
  'استثمارك الآمن يبدأ الآن',
  'amber',
  true,
  true,
  true,
  true,
  true,
  true
)
ON CONFLICT DO NOTHING;

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_royal_gateway_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تفعيل الدالة
DROP TRIGGER IF EXISTS update_royal_gateway_settings_updated_at ON royal_gateway_settings;
CREATE TRIGGER update_royal_gateway_settings_updated_at
  BEFORE UPDATE ON royal_gateway_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_royal_gateway_settings_updated_at();

-- إنشاء فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_royal_gateway_settings_enabled
  ON royal_gateway_settings(enabled);
