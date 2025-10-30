/*
  # تطوير جدول إعدادات البوابة الملكية الخضراء

  1. التغييرات
    - إضافة أعمدة جديدة للبوابة الخضراء المتقدمة
    - دعم إعدادات متقدمة للتفاعل والحركة
    - دعم badges وfeature pills
    - دعم CSS مخصص

  2. الأعمدة الجديدة
    - button_text_ar: نص زر الدخول
    - theme_style: نمط السمة (gold, green, blue, purple)
    - background_style: نمط الخلفية (gradient, pattern, solid)
    - glass_intensity: شدة التأثير الزجاجي
    - particle_count: عدد الجزيئات
    - particle_color: لون الجزيئات
    - show_floating_icons: عرض الأيقونات العائمة
    - show_orbiting_icons: عرض الأيقونات المدارية
    - show_decorative_shapes: عرض الأشكال الزخرفية
    - enable_mouse_tracking: تفعيل تتبع الماوس
    - enable_parallax: تفعيل تأثير Parallax
    - enable_sound_effects: تفعيل المؤثرات الصوتية
    - show_feature_pills: عرض بطاقات المميزات
    - feature_pill_1 to 4: نصوص المميزات
    - show_top_badge: عرض Badge العلوي
    - top_badge_text: نص Badge العلوي
    - show_bottom_badge: عرض Badge السفلي
    - bottom_badge_text: نص Badge السفلي
    - blur_background: تفعيل ضبابية الخلفية
    - blur_intensity: شدة الضبابية
    - border_glow: تفعيل توهج الحدود
    - custom_css: CSS مخصص
    - mobile_optimized: تحسين الموبايل
    - tablet_optimized: تحسين التابلت
    - desktop_optimized: تحسين الديسكتوب
    - show_countdown: عرض العد التنازلي
*/

-- إضافة أعمدة جديدة بشكل آمن
DO $$
BEGIN
  -- نص زر الدخول
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'button_text_ar'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN button_text_ar text DEFAULT 'ادخل إلى المنصة' NOT NULL;
  END IF;

  -- نمط السمة
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'theme_style'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN theme_style text DEFAULT 'green' NOT NULL
    CHECK (theme_style IN ('gold', 'green', 'blue', 'purple'));
  END IF;

  -- نمط الخلفية
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'background_style'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN background_style text DEFAULT 'gradient' NOT NULL
    CHECK (background_style IN ('gradient', 'pattern', 'solid'));
  END IF;

  -- شدة التأثير الزجاجي
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'glass_intensity'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN glass_intensity text DEFAULT 'medium' NOT NULL
    CHECK (glass_intensity IN ('light', 'medium', 'strong'));
  END IF;

  -- عدد الجزيئات
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'particle_count'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN particle_count integer DEFAULT 30 NOT NULL
    CHECK (particle_count BETWEEN 10 AND 50);
  END IF;

  -- لون الجزيئات
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'particle_color'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN particle_color text DEFAULT 'emerald' NOT NULL;
  END IF;

  -- الأيقونات العائمة
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'show_floating_icons'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN show_floating_icons boolean DEFAULT true NOT NULL;
  END IF;

  -- الأيقونات المدارية
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'show_orbiting_icons'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN show_orbiting_icons boolean DEFAULT true NOT NULL;
  END IF;

  -- الأشكال الزخرفية
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'show_decorative_shapes'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN show_decorative_shapes boolean DEFAULT true NOT NULL;
  END IF;

  -- تتبع حركة الماوس
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'enable_mouse_tracking'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN enable_mouse_tracking boolean DEFAULT true NOT NULL;
  END IF;

  -- تأثير Parallax
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'enable_parallax'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN enable_parallax boolean DEFAULT true NOT NULL;
  END IF;

  -- المؤثرات الصوتية
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'enable_sound_effects'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN enable_sound_effects boolean DEFAULT false NOT NULL;
  END IF;

  -- بطاقات المميزات
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'show_feature_pills'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN show_feature_pills boolean DEFAULT true NOT NULL;
  END IF;

  -- نصوص المميزات
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'feature_pill_1'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN feature_pill_1 text DEFAULT 'تكنولوجيا متقدمة' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'feature_pill_2'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN feature_pill_2 text DEFAULT 'استثمار مستدام' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'feature_pill_3'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN feature_pill_3 text DEFAULT 'بيئة صحية' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'feature_pill_4'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN feature_pill_4 text DEFAULT 'ري ذكي' NOT NULL;
  END IF;

  -- Badge العلوي
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'show_top_badge'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN show_top_badge boolean DEFAULT true NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'top_badge_text'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN top_badge_text text DEFAULT 'تصميم ثوري' NOT NULL;
  END IF;

  -- Badge السفلي
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'show_bottom_badge'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN show_bottom_badge boolean DEFAULT true NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'bottom_badge_text'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN bottom_badge_text text DEFAULT 'صديق للبيئة' NOT NULL;
  END IF;

  -- ضبابية الخلفية
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'blur_background'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN blur_background boolean DEFAULT true NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'blur_intensity'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN blur_intensity integer DEFAULT 20 NOT NULL
    CHECK (blur_intensity BETWEEN 5 AND 40);
  END IF;

  -- توهج الحدود
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'border_glow'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN border_glow boolean DEFAULT true NOT NULL;
  END IF;

  -- CSS مخصص
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'custom_css'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN custom_css text DEFAULT '';
  END IF;

  -- تحسين الأجهزة
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'mobile_optimized'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN mobile_optimized boolean DEFAULT true NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'tablet_optimized'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN tablet_optimized boolean DEFAULT true NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'desktop_optimized'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN desktop_optimized boolean DEFAULT true NOT NULL;
  END IF;

  -- العد التنازلي
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'show_countdown'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN show_countdown boolean DEFAULT true NOT NULL;
  END IF;

END $$;

-- تحديث البيانات الموجودة للبوابة الخضراء
UPDATE royal_gateway_settings
SET
  theme_style = 'green',
  welcome_text_ar = 'مرحباً بكم في عالم الاستثمار الأخضر',
  subtitle_text_ar = 'منصة التطوير الزراعي المتقدمة',
  description_text_ar = 'تكنولوجيا زراعية حديثة لمستقبل مستدام',
  button_text_ar = 'ادخل إلى المنصة',
  particle_color = 'emerald',
  auto_enter_delay = 5,
  updated_at = now()
WHERE id IS NOT NULL;

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_royal_gateway_settings_theme_style
  ON royal_gateway_settings(theme_style);

CREATE INDEX IF NOT EXISTS idx_royal_gateway_settings_updated_at
  ON royal_gateway_settings(updated_at DESC);
