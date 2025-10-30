/*
  # إضافة جميع الأعمدة المفقودة لجدول البوابة الملكية

  1. الأعمدة الجديدة
    - theme_style: نمط السمة (green, gold, elegant)
    - particle_speed: سرعة الجزيئات
    - particle_size: حجم الجزيئات
    - blur_amount: درجة الضبابية
    - animation_duration: مدة الحركة
    - show_logo: عرض الشعار
    - main_title: العنوان الرئيسي
    - subtitle: العنوان الفرعي
    - button_text: نص زر الدخول
*/

-- إضافة جميع الأعمدة
DO $$
BEGIN
  -- theme_style
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'theme_style'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN theme_style text DEFAULT 'green' NOT NULL;
  END IF;

  -- particle_speed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'particle_speed'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN particle_speed integer DEFAULT 2 NOT NULL;
  END IF;

  -- particle_size
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'particle_size'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN particle_size integer DEFAULT 3 NOT NULL;
  END IF;

  -- blur_amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'blur_amount'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN blur_amount integer DEFAULT 10 NOT NULL;
  END IF;

  -- animation_duration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'animation_duration'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN animation_duration integer DEFAULT 3 NOT NULL;
  END IF;

  -- show_logo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'show_logo'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN show_logo boolean DEFAULT true NOT NULL;
  END IF;

  -- main_title
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'main_title'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN main_title text DEFAULT 'منصة النخيل والزيتون' NOT NULL;
  END IF;

  -- subtitle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN subtitle text DEFAULT 'استثمار زراعي مستدام' NOT NULL;
  END IF;

  -- button_text
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' AND column_name = 'button_text'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN button_text text DEFAULT 'ادخل إلى المنصة' NOT NULL;
  END IF;

END $$;

-- إضافة CHECK constraints بعد إنشاء الأعمدة
DO $$
BEGIN
  ALTER TABLE royal_gateway_settings
  ADD CONSTRAINT check_theme_style
  CHECK (theme_style IN ('green', 'gold', 'elegant'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE royal_gateway_settings
  ADD CONSTRAINT check_particle_speed
  CHECK (particle_speed BETWEEN 1 AND 10);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE royal_gateway_settings
  ADD CONSTRAINT check_particle_size
  CHECK (particle_size BETWEEN 1 AND 10);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE royal_gateway_settings
  ADD CONSTRAINT check_blur_amount
  CHECK (blur_amount BETWEEN 0 AND 30);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE royal_gateway_settings
  ADD CONSTRAINT check_animation_duration
  CHECK (animation_duration BETWEEN 1 AND 10);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- تحديث البيانات الموجودة
UPDATE royal_gateway_settings
SET
  theme_style = 'green',
  particle_speed = 2,
  particle_size = 3,
  blur_amount = 10,
  animation_duration = 3,
  show_logo = true,
  main_title = COALESCE(welcome_text_ar, 'منصة النخيل والزيتون'),
  subtitle = COALESCE(subtitle_text_ar, 'استثمار زراعي مستدام'),
  button_text = COALESCE(description_text_ar, 'ادخل إلى المنصة'),
  updated_at = now()
WHERE id IS NOT NULL;
