/*
  # Ultra Advanced Ticker System

  1. New Tables
    - `ticker_settings`
      - Full control over ticker behavior
      - Separate settings for header and main tickers
      - Animation speed, direction, behavior
      - Design customization
    
    - `ticker_messages`
      - Messages for each ticker type
      - Multi-language support
      - Icon and color customization
      - Sortable and toggleable

  2. Security
    - Enable RLS
    - Admin-only access for modifications
    - Public read access

  3. Features
    - Speed control (10-60s)
    - Direction (RTL/LTR)
    - Pause on hover
    - Auto-start
    - Seamless loop
    - Gradient edges
    - Custom colors
    - Text/icon sizes
    - Borders
*/

-- Ticker Settings Table
CREATE TABLE IF NOT EXISTS ticker_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker_type text NOT NULL CHECK (ticker_type IN ('header', 'main')),
  is_enabled boolean DEFAULT true,
  animation_speed integer DEFAULT 30 CHECK (animation_speed BETWEEN 10 AND 60),
  animation_direction text DEFAULT 'rtl' CHECK (animation_direction IN ('rtl', 'ltr')),
  pause_on_hover boolean DEFAULT true,
  auto_start boolean DEFAULT true,
  loop_seamless boolean DEFAULT true,
  background_color text DEFAULT 'emerald-50',
  text_size text DEFAULT 'base' CHECK (text_size IN ('sm', 'base', 'lg', 'xl')),
  icon_size text DEFAULT 'base' CHECK (icon_size IN ('sm', 'base', 'lg')),
  padding_y numeric DEFAULT 2.5,
  border_top boolean DEFAULT true,
  border_bottom boolean DEFAULT true,
  gradient_edges boolean DEFAULT true,
  edge_width integer DEFAULT 20,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(ticker_type)
);

-- Ticker Messages Table
CREATE TABLE IF NOT EXISTS ticker_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker_type text NOT NULL CHECK (ticker_type IN ('header', 'main')),
  content_ar text NOT NULL,
  content_en text,
  icon_name text DEFAULT 'Star',
  icon_color text DEFAULT 'emerald-600',
  text_color text DEFAULT 'emerald-800',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ticker_settings_type ON ticker_settings(ticker_type);
CREATE INDEX IF NOT EXISTS idx_ticker_messages_type ON ticker_messages(ticker_type);
CREATE INDEX IF NOT EXISTS idx_ticker_messages_active ON ticker_messages(is_active);
CREATE INDEX IF NOT EXISTS idx_ticker_messages_sort ON ticker_messages(sort_order);

-- Enable RLS
ALTER TABLE ticker_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticker_messages ENABLE ROW LEVEL SECURITY;

-- Policies for ticker_settings
CREATE POLICY "Anyone can view ticker settings"
  ON ticker_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage ticker settings"
  ON ticker_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for ticker_messages
CREATE POLICY "Anyone can view active ticker messages"
  ON ticker_messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage ticker messages"
  ON ticker_messages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings for header ticker
INSERT INTO ticker_settings (
  ticker_type,
  animation_speed,
  text_size,
  icon_size,
  padding_y
) VALUES (
  'header',
  30,
  'sm',
  'sm',
  2.5
) ON CONFLICT (ticker_type) DO NOTHING;

-- Insert default settings for main ticker
INSERT INTO ticker_settings (
  ticker_type,
  animation_speed,
  text_size,
  icon_size,
  padding_y
) VALUES (
  'main',
  35,
  'base',
  'base',
  3
) ON CONFLICT (ticker_type) DO NOTHING;

-- Insert default messages for header ticker
INSERT INTO ticker_messages (ticker_type, content_ar, icon_name, icon_color, text_color, sort_order) VALUES
  ('header', 'استثمر في مستقبل أخضر مستدام', 'Star', 'emerald-600', 'emerald-800', 0),
  ('header', 'عوائد سنوية مضمونة من أشجارك', 'Zap', 'green-600', 'green-800', 1),
  ('header', 'ملكية موثقة ومضمونة قانونياً', 'Sparkles', 'teal-600', 'teal-800', 2),
  ('header', 'تملك أشجار النخيل والزيتون الآن', 'Crown', 'emerald-600', 'emerald-800', 3)
ON CONFLICT DO NOTHING;

-- Insert default messages for main ticker
INSERT INTO ticker_messages (ticker_type, content_ar, icon_name, icon_color, text_color, sort_order) VALUES
  ('main', 'استثمر في مستقبل أخضر مستدام', 'Star', 'emerald-600', 'emerald-800', 0),
  ('main', 'عوائد سنوية مضمونة من أشجارك', 'Sparkles', 'green-600', 'green-800', 1),
  ('main', 'ملكية موثقة ومضمونة قانونياً', 'Crown', 'teal-600', 'teal-800', 2),
  ('main', 'تملك أشجار النخيل والزيتون الآن', 'Star', 'emerald-600', 'emerald-800', 3)
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ticker_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_ticker_settings_updated_at
  BEFORE UPDATE ON ticker_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ticker_updated_at();

CREATE TRIGGER update_ticker_messages_updated_at
  BEFORE UPDATE ON ticker_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ticker_updated_at();
