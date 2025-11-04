/*
  # Create Loader Settings Table
  
  1. New Table
    - `loader_settings`
      - `id` (uuid, primary key)
      - `enabled` (boolean) - تفعيل شاشة التحميل
      - `show_logo` (boolean) - عرض الشعار
      - `show_sparkles` (boolean) - عرض sparkles متحركة
      - `show_progress_bar` (boolean) - عرض شريط التقدم
      - `show_percentage` (boolean) - عرض النسبة المئوية
      - `show_dynamic_texts` (boolean) - عرض النصوص الديناميكية
      - `animation_speed` (text) - سرعة الأنيميشن
      - `fade_duration` (integer) - مدة fade out بالملي ثانية
      - `min_display_time` (integer) - الحد الأدنى لعرض الشاشة
      - النصوص العربية والإنجليزية
      - الألوان (hex codes)
      
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

CREATE TABLE IF NOT EXISTS loader_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean DEFAULT true,
  show_logo boolean DEFAULT true,
  show_sparkles boolean DEFAULT true,
  show_progress_bar boolean DEFAULT true,
  show_percentage boolean DEFAULT true,
  show_dynamic_texts boolean DEFAULT true,
  animation_speed text DEFAULT 'normal' CHECK (animation_speed IN ('slow', 'normal', 'fast')),
  fade_duration integer DEFAULT 600,
  min_display_time integer DEFAULT 1500,
  -- النصوص
  main_title text DEFAULT 'منصة الحبر',
  main_title_en text DEFAULT 'Palm & Olive Platform',
  subtitle text DEFAULT 'منصة بيع أشجار النخيل والزيتون',
  subtitle_en text DEFAULT 'Palm & Olive Trees Marketplace',
  loading_text_1 text DEFAULT 'جاري تحضير المنصة...',
  loading_text_2 text DEFAULT 'تحميل المزارع المتاحة...',
  loading_text_3 text DEFAULT 'تجهيز البيانات...',
  loading_text_4 text DEFAULT 'اللمسات الأخيرة...',
  loading_text_5 text DEFAULT 'جاهز!',
  -- الألوان
  background_color_from text DEFAULT '#064E3B',
  background_color_to text DEFAULT '#047857',
  text_color text DEFAULT '#FFFFFF',
  progress_bar_color text DEFAULT '#10B981',
  sparkle_color text DEFAULT '#FCD34D',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE loader_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anon to read (for public access to loader)
CREATE POLICY "Anyone can read loader settings"
  ON loader_settings
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Allow authenticated to read
CREATE POLICY "Authenticated can read loader settings"
  ON loader_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated can update (admins)
CREATE POLICY "Authenticated can update loader settings"
  ON loader_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated can insert
CREATE POLICY "Authenticated can insert loader settings"
  ON loader_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default settings
INSERT INTO loader_settings (
  enabled,
  show_logo,
  show_sparkles,
  show_progress_bar,
  show_percentage,
  show_dynamic_texts,
  animation_speed,
  fade_duration,
  min_display_time,
  main_title,
  main_title_en,
  subtitle,
  subtitle_en,
  loading_text_1,
  loading_text_2,
  loading_text_3,
  loading_text_4,
  loading_text_5,
  background_color_from,
  background_color_to,
  text_color,
  progress_bar_color,
  sparkle_color
) VALUES (
  true,
  true,
  true,
  true,
  true,
  true,
  'normal',
  600,
  1500,
  'منصة الحبر',
  'Palm & Olive Platform',
  'منصة بيع أشجار النخيل والزيتون',
  'Palm & Olive Trees Marketplace',
  'جاري تحضير المنصة...',
  'تحميل المزارع المتاحة...',
  'تجهيز البيانات...',
  'اللمسات الأخيرة...',
  'جاهز!',
  '#064E3B',
  '#047857',
  '#FFFFFF',
  '#10B981',
  '#FCD34D'
) ON CONFLICT DO NOTHING;
