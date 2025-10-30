/*
  # إصلاح جدول ticker_settings لإضافة الأعمدة المطلوبة

  1. الأعمدة الجديدة
    - ticker_type: نوع الشريط (header/main)
    - animation_speed: سرعة الحركة بالثواني
    - animation_direction: اتجاه الحركة (rtl/ltr)
    - pause_on_hover: إيقاف عند التمرير
    - auto_start: بدء تلقائي
    - loop_seamless: حلقة سلسة
    - text_size: حجم النص
    - icon_size: حجم الأيقونة
    - padding_y: المسافة العمودية
    - border_top: حد علوي
    - border_bottom: حد سفلي
    - gradient_edges: حواف متدرجة
    - edge_width: عرض الحواف
*/

-- إضافة الأعمدة المطلوبة
DO $$
BEGIN
  -- ticker_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'ticker_type'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN ticker_type text DEFAULT 'main' NOT NULL;
  END IF;

  -- animation_speed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'animation_speed'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN animation_speed integer DEFAULT 35 NOT NULL;
  END IF;

  -- animation_direction
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'animation_direction'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN animation_direction text DEFAULT 'rtl' NOT NULL;
  END IF;

  -- pause_on_hover
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'pause_on_hover'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN pause_on_hover boolean DEFAULT true NOT NULL;
  END IF;

  -- auto_start
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'auto_start'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN auto_start boolean DEFAULT true NOT NULL;
  END IF;

  -- loop_seamless
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'loop_seamless'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN loop_seamless boolean DEFAULT true NOT NULL;
  END IF;

  -- text_size
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'text_size'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN text_size text DEFAULT 'base' NOT NULL;
  END IF;

  -- icon_size
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'icon_size'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN icon_size text DEFAULT 'base' NOT NULL;
  END IF;

  -- padding_y
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'padding_y'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN padding_y integer DEFAULT 3 NOT NULL;
  END IF;

  -- border_top
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'border_top'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN border_top boolean DEFAULT true NOT NULL;
  END IF;

  -- border_bottom
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'border_bottom'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN border_bottom boolean DEFAULT true NOT NULL;
  END IF;

  -- gradient_edges
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'gradient_edges'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN gradient_edges boolean DEFAULT true NOT NULL;
  END IF;

  -- edge_width
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_settings' AND column_name = 'edge_width'
  ) THEN
    ALTER TABLE ticker_settings
    ADD COLUMN edge_width integer DEFAULT 150 NOT NULL;
  END IF;

END $$;

-- إضافة CHECK constraints
DO $$
BEGIN
  ALTER TABLE ticker_settings
  ADD CONSTRAINT check_ticker_type
  CHECK (ticker_type IN ('header', 'main'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE ticker_settings
  ADD CONSTRAINT check_animation_direction
  CHECK (animation_direction IN ('rtl', 'ltr'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE ticker_settings
  ADD CONSTRAINT check_text_size
  CHECK (text_size IN ('sm', 'base', 'lg', 'xl'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE ticker_settings
  ADD CONSTRAINT check_icon_size
  CHECK (icon_size IN ('sm', 'base', 'lg'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- إضافة سياسة INSERT
DROP POLICY IF EXISTS "Allow anon insert ticker settings" ON ticker_settings;
CREATE POLICY "Allow anon insert ticker settings"
  ON ticker_settings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- تحديث البيانات الموجودة
UPDATE ticker_settings
SET
  ticker_type = 'main',
  animation_speed = COALESCE(speed, 35),
  animation_direction = 'rtl',
  pause_on_hover = true,
  auto_start = true,
  loop_seamless = true,
  text_size = 'base',
  icon_size = 'base',
  padding_y = 3,
  border_top = true,
  border_bottom = true,
  gradient_edges = true,
  edge_width = 150,
  background_color = COALESCE(background_color, 'emerald-50'),
  updated_at = now()
WHERE id IS NOT NULL;
