/*
  # Advanced Loader Management System

  1. New Tables
    - `platform_loader_settings` - Main settings for the loader (30+ customization options)
    - `loader_content_phases` - Dynamic loading phases with icons and text
    - `loader_themes` - Pre-built themes for one-click application
    - `loader_background_elements` - Floating background elements configuration
    - `loader_animations` - Custom animation definitions
    - `loader_analytics` - Usage tracking and analytics
  
  2. Security
    - Enable RLS on all tables
    - Public read access for loader display
    - Admin-only write access for management
  
  3. Features
    - Complete loader customization (colors, animations, text, logo)
    - Dynamic phases system
    - Pre-built themes (Agricultural Green, Gold Luxury, Ocean Blue, Minimal Dark)
    - Floating elements with custom animations
    - Analytics tracking for performance monitoring
*/

-- Main loader settings table
CREATE TABLE IF NOT EXISTS platform_loader_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Settings
  enabled boolean DEFAULT true,
  show_always boolean DEFAULT true,
  min_display_time integer DEFAULT 2500,
  fade_duration integer DEFAULT 800,
  
  -- Logo Settings
  logo_type text DEFAULT 'emoji' CHECK (logo_type IN ('emoji', 'image', 'text', 'none')),
  logo_emoji text DEFAULT '🌾',
  logo_image_url text,
  logo_text text DEFAULT 'مزادات',
  logo_animation text DEFAULT 'rotate3d',
  logo_size text DEFAULT 'large',
  
  -- Text Settings
  main_title text DEFAULT 'مزادات',
  main_title_size text DEFAULT 'large',
  subtitle text DEFAULT 'منصة الاستثمار الزراعي الذكية',
  subtitle_size text DEFAULT 'medium',
  show_percentage boolean DEFAULT true,
  show_phase_text boolean DEFAULT true,
  
  -- Progress Bar Settings
  show_progress_bar boolean DEFAULT true,
  progress_bar_style text DEFAULT 'gradient',
  progress_bar_height text DEFAULT 'medium',
  progress_bar_rounded boolean DEFAULT true,
  show_progress_glow boolean DEFAULT true,
  
  -- Background Settings
  background_type text DEFAULT 'gradient',
  background_color_from text DEFAULT '#10b981',
  background_color_to text DEFAULT '#059669',
  background_animation text DEFAULT 'pulse',
  
  -- Floating Elements Settings
  show_floating_elements boolean DEFAULT true,
  floating_elements_count integer DEFAULT 15,
  floating_elements_speed text DEFAULT 'medium',
  
  -- Visual Effects
  show_shimmer_effect boolean DEFAULT true,
  show_sparkles boolean DEFAULT true,
  blur_background boolean DEFAULT false,
  
  -- Colors
  text_color text DEFAULT '#ffffff',
  accent_color text DEFAULT '#10b981',
  secondary_color text DEFAULT 'rgba(255, 255, 255, 0.7)',
  
  -- Advanced
  custom_css text,
  preload_images boolean DEFAULT true,
  gpu_acceleration boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Content phases for dynamic loading text
CREATE TABLE IF NOT EXISTS loader_content_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number integer NOT NULL,
  phase_text text NOT NULL,
  phase_icon text DEFAULT '⏳',
  phase_color text DEFAULT '#10b981',
  start_percentage integer DEFAULT 0,
  end_percentage integer DEFAULT 100,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pre-built themes
CREATE TABLE IF NOT EXISTS loader_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_name text NOT NULL UNIQUE,
  theme_name_ar text NOT NULL,
  description text,
  description_ar text,
  settings jsonb NOT NULL,
  preview_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Floating background elements
CREATE TABLE IF NOT EXISTS loader_background_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_type text DEFAULT 'emoji' CHECK (element_type IN ('emoji', 'icon', 'shape')),
  element_value text NOT NULL,
  size_min integer DEFAULT 20,
  size_max integer DEFAULT 60,
  animation_type text DEFAULT 'float',
  animation_duration_min integer DEFAULT 15000,
  animation_duration_max integer DEFAULT 30000,
  opacity_min numeric DEFAULT 0.3,
  opacity_max numeric DEFAULT 0.7,
  color text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Custom animations
CREATE TABLE IF NOT EXISTS loader_animations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animation_name text NOT NULL UNIQUE,
  animation_css text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Analytics
CREATE TABLE IF NOT EXISTS loader_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  duration_ms integer,
  completed_naturally boolean DEFAULT true,
  device_type text,
  browser text,
  screen_width integer,
  screen_height integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_loader_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loader_content_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE loader_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE loader_background_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE loader_animations ENABLE ROW LEVEL SECURITY;
ALTER TABLE loader_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read, admin write
CREATE POLICY "Anyone can view loader settings"
  ON platform_loader_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update loader settings"
  ON platform_loader_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.phone = current_setting('request.jwt.claims', true)::json->>'phone'
      AND admin_users.deleted_at IS NULL
    )
  );

CREATE POLICY "Anyone can view phases"
  ON loader_content_phases FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage phases"
  ON loader_content_phases FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.phone = current_setting('request.jwt.claims', true)::json->>'phone'
      AND admin_users.deleted_at IS NULL
    )
  );

CREATE POLICY "Anyone can view themes"
  ON loader_themes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage themes"
  ON loader_themes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.phone = current_setting('request.jwt.claims', true)::json->>'phone'
      AND admin_users.deleted_at IS NULL
    )
  );

CREATE POLICY "Anyone can view elements"
  ON loader_background_elements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage elements"
  ON loader_background_elements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.phone = current_setting('request.jwt.claims', true)::json->>'phone'
      AND admin_users.deleted_at IS NULL
    )
  );

CREATE POLICY "Anyone can view animations"
  ON loader_animations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage animations"
  ON loader_animations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.phone = current_setting('request.jwt.claims', true)::json->>'phone'
      AND admin_users.deleted_at IS NULL
    )
  );

CREATE POLICY "Anyone can insert analytics"
  ON loader_analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
  ON loader_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.phone = current_setting('request.jwt.claims', true)::json->>'phone'
      AND admin_users.deleted_at IS NULL
    )
  );

-- Insert default settings
INSERT INTO platform_loader_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Insert default phases
INSERT INTO loader_content_phases (phase_number, phase_text, phase_icon, phase_color, start_percentage, end_percentage, display_order) VALUES
  (1, 'جاري التحضير...', '🌱', '#10b981', 0, 25, 1),
  (2, 'تحميل البيانات...', '🌾', '#059669', 25, 50, 2),
  (3, 'إعداد الواجهة...', '🌴', '#047857', 50, 75, 3),
  (4, 'تقريباً انتهى...', '✨', '#065f46', 75, 100, 4)
ON CONFLICT DO NOTHING;

-- Insert default themes
INSERT INTO loader_themes (theme_name, theme_name_ar, description, description_ar, settings) VALUES
  ('agricultural-green', 'الأخضر الزراعي', 'Natural green theme', 'ثيم أخضر طبيعي', '{"background_color_from": "#10b981", "background_color_to": "#059669", "accent_color": "#10b981", "logo_emoji": "🌾"}'),
  ('gold-luxury', 'الذهبي الفاخر', 'Luxury gold theme', 'ثيم ذهبي فاخر', '{"background_color_from": "#f59e0b", "background_color_to": "#d97706", "accent_color": "#f59e0b", "logo_emoji": "👑"}'),
  ('ocean-blue', 'الأزرق المحيطي', 'Ocean blue theme', 'ثيم أزرق محيطي', '{"background_color_from": "#3b82f6", "background_color_to": "#2563eb", "accent_color": "#3b82f6", "logo_emoji": "🌊"}'),
  ('minimal-dark', 'الداكن البسيط', 'Minimal dark theme', 'ثيم داكن بسيط', '{"background_color_from": "#1f2937", "background_color_to": "#111827", "accent_color": "#6b7280", "logo_emoji": "🌙"}')
ON CONFLICT DO NOTHING;

-- Insert default floating elements
INSERT INTO loader_background_elements (element_type, element_value, size_min, size_max, animation_type, display_order) VALUES
  ('emoji', '🌾', 30, 60, 'float', 1),
  ('emoji', '🌴', 40, 70, 'float-slow', 2),
  ('emoji', '🫒', 25, 50, 'float-fast', 3),
  ('emoji', '🌱', 20, 45, 'float', 4),
  ('emoji', '✨', 15, 35, 'sparkle', 5),
  ('emoji', '💚', 30, 55, 'pulse', 6),
  ('emoji', '🍃', 25, 50, 'float-slow', 7)
ON CONFLICT DO NOTHING;
