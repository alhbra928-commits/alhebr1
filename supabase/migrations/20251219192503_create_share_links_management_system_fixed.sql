/*
  # نظام إدارة الروابط المشاركة الشامل

  1. جدول جديد
    - `share_settings` - إعدادات المشاركة الشاملة
      - `id` (uuid, primary key)
      - `page_type` (text) - نوع الصفحة (home, farm, about, etc)
      - `og_title_ar` (text) - العنوان العربي
      - `og_title_en` (text) - العنوان الإنجليزي
      - `og_description_ar` (text) - الوصف العربي
      - `og_description_en` (text) - الوصف الإنجليزي
      - `og_image_url` (text) - رابط الصورة
      - `share_text_template` (text) - قالب النص (مع متغيرات)
      - `emojis` (jsonb) - الرموز المستخدمة
      - `is_active` (boolean) - مفعّل أم لا
      - `created_at`, `updated_at`

  2. Security
    - Enable RLS
    - Policies للقراءة العامة والتعديل للإداريين فقط
*/

-- Create share_settings table
CREATE TABLE IF NOT EXISTS share_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text UNIQUE NOT NULL,
  og_title_ar text NOT NULL,
  og_title_en text,
  og_description_ar text NOT NULL,
  og_description_en text,
  og_image_url text NOT NULL,
  share_text_template text NOT NULL,
  emojis jsonb DEFAULT '{
    "tree": "🌳",
    "location": "📍",
    "money": "💰",
    "check": "✅",
    "fire": "🔥",
    "target": "🎯",
    "down": "👇"
  }'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_page_type CHECK (page_type IN (
    'home',
    'farm_detail',
    'farms_list',
    'about',
    'contact',
    'concept'
  ))
);

-- Enable RLS
ALTER TABLE share_settings ENABLE ROW LEVEL SECURITY;

-- Policy: anon can read active share settings
CREATE POLICY "Anon can read active share settings"
  ON share_settings
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Policy: authenticated can read
CREATE POLICY "Authenticated can read share settings"
  ON share_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: admins can insert
CREATE POLICY "Admins can insert share settings"
  ON share_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND deleted_at IS NULL
      AND is_active = true
    )
  );

-- Policy: admins can update
CREATE POLICY "Admins can update share settings"
  ON share_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND deleted_at IS NULL
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND deleted_at IS NULL
      AND is_active = true
    )
  );

-- Policy: admins can delete
CREATE POLICY "Admins can delete share settings"
  ON share_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND deleted_at IS NULL
      AND is_active = true
    )
  );

-- Insert default settings
INSERT INTO share_settings (page_type, og_title_ar, og_title_en, og_description_ar, og_description_en, og_image_url, share_text_template) VALUES
(
  'home',
  'منصة النخيل والزيتون - استثمر في مزارع الزيتون',
  'Palm & Olive Platform - Invest in Olive Farms',
  'استثمر في مزارع الزيتون المميزة | عوائد مضمونة | ملكية موثقة | فرصة استثمارية مثالية',
  'Invest in premium olive farms | Guaranteed returns | Documented ownership | Perfect investment opportunity',
  'https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?q=80&w=1200',
  '{{emoji_tree}} منصة النخيل والزيتون

{{emoji_target}} استثمر في مزارع الزيتون المميزة
{{emoji_check}} عوائد مضمونة | ملكية موثقة | إدارة احترافية

{{emoji_down}} اكتشف الفرص الاستثمارية الآن'
),
(
  'farm_detail',
  'منصة النخيل والزيتون - {{farm_name}}',
  'Palm & Olive Platform - {{farm_name}}',
  'استثمر في {{farm_name}} | السعر من {{price}} ريال | متوفر {{available_trees}} شجرة',
  'Invest in {{farm_name}} | Price from {{price}} SAR | {{available_trees}} trees available',
  'https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?q=80&w=1200',
  '{{emoji_tree}} {{farm_name}}
{{emoji_location}} {{location}}

{{emoji_money}} الاستثمار يبدأ من {{price}} ريال للشجرة
{{emoji_status}} {{availability_text}}

{{emoji_target}} عوائد مضمونة | ملكية موثقة | إدارة احترافية

{{emoji_down}} اكتشف التفاصيل الآن'
),
(
  'farms_list',
  'منصة النخيل والزيتون - مزارع متاحة للاستثمار',
  'Palm & Olive Platform - Available Farms',
  'تصفح أفضل مزارع الزيتون المتاحة للاستثمار | أسعار مناسبة | عوائد مضمونة',
  'Browse the best olive farms available for investment | Affordable prices | Guaranteed returns',
  'https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?q=80&w=1200',
  '{{emoji_tree}} مزارع متاحة للاستثمار

{{emoji_check}} أفضل المزارع المختارة بعناية
{{emoji_target}} عوائد مضمونة وإدارة احترافية

{{emoji_down}} تصفح المزارع المتاحة الآن'
),
(
  'about',
  'عن منصة النخيل والزيتون',
  'About Palm & Olive Platform',
  'منصة استثمارية رائدة في مجال الاستثمار الزراعي | شفافية | مصداقية | عوائد مضمونة',
  'Leading investment platform in agricultural investment | Transparency | Credibility | Guaranteed returns',
  'https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?q=80&w=1200',
  '{{emoji_tree}} منصة النخيل والزيتون

{{emoji_target}} منصة استثمارية رائدة
{{emoji_check}} شفافية ومصداقية عالية

{{emoji_down}} اكتشف المزيد عنا'
),
(
  'concept',
  'فكرة المنصة - النخيل والزيتون',
  'Platform Concept - Palm & Olive',
  'تعرف على فكرة الاستثمار الزراعي المبتكرة | نموذج عمل ناجح | عوائد مضمونة',
  'Learn about innovative agricultural investment | Successful business model | Guaranteed returns',
  'https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?q=80&w=1200',
  '{{emoji_tree}} فكرة استثمارية مبتكرة

{{emoji_target}} نموذج عمل ناجح ومجرّب
{{emoji_check}} استثمر بذكاء في الزراعة

{{emoji_down}} تعرف على الفكرة'
),
(
  'contact',
  'تواصل معنا - منصة النخيل والزيتون',
  'Contact Us - Palm & Olive Platform',
  'تواصل معنا الآن | فريق متخصص | استشارات مجانية | دعم على مدار الساعة',
  'Contact us now | Specialized team | Free consultations | 24/7 support',
  'https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?q=80&w=1200',
  '{{emoji_target}} تواصل معنا

{{emoji_check}} فريق متخصص لخدمتك
{{emoji_check}} استشارات مجانية

{{emoji_down}} ابدأ المحادثة الآن'
)
ON CONFLICT (page_type) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_share_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS share_settings_updated_at ON share_settings;
CREATE TRIGGER share_settings_updated_at
  BEFORE UPDATE ON share_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_share_settings_updated_at();

-- Create helper function to get share settings
CREATE OR REPLACE FUNCTION get_share_settings(p_page_type text)
RETURNS TABLE (
  og_title_ar text,
  og_title_en text,
  og_description_ar text,
  og_description_en text,
  og_image_url text,
  share_text_template text,
  emojis jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.og_title_ar,
    s.og_title_en,
    s.og_description_ar,
    s.og_description_en,
    s.og_image_url,
    s.share_text_template,
    s.emojis
  FROM share_settings s
  WHERE s.page_type = p_page_type
    AND s.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
