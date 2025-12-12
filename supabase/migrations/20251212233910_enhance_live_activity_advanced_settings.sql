/*
  # تطوير نظام شريط النشاط المباشر - إعدادات متقدمة

  1. إضافة حقول جديدة
    - `background_style` (text) - نمط الخلفية
    - `text_color` (text) - لون النص
    - `icon_color` (text) - لون الأيقونات
    - `border_style` (text) - نمط الحدود
    - `height` (integer) - ارتفاع الشريط
    - `pause_on_hover` (boolean) - التوقف عند المرور
    - `show_separator` (boolean) - عرض الفواصل
    - `enable_sound` (boolean) - تفعيل الصوت
    - `refresh_interval` (integer) - فترة التحديث بالثواني

  2. Notes
    - إعدادات متقدمة للتحكم الكامل
    - معاينة مباشرة
    - تحديث لحظي
*/

-- إضافة حقول جديدة
ALTER TABLE live_activity_settings
ADD COLUMN IF NOT EXISTS background_style text DEFAULT 'gradient' CHECK (background_style IN ('gradient', 'solid', 'glass')),
ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#F5F5DC',
ADD COLUMN IF NOT EXISTS icon_color text DEFAULT '#D4AF37',
ADD COLUMN IF NOT EXISTS border_style text DEFAULT 'bottom' CHECK (border_style IN ('none', 'bottom', 'top', 'both')),
ADD COLUMN IF NOT EXISTS height integer DEFAULT 50 CHECK (height BETWEEN 40 AND 80),
ADD COLUMN IF NOT EXISTS pause_on_hover boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_separator boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_sound boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS refresh_interval integer DEFAULT 30 CHECK (refresh_interval BETWEEN 10 AND 120);

-- تحديث الصف الموجود بالقيم الافتراضية
UPDATE live_activity_settings
SET 
  background_style = COALESCE(background_style, 'gradient'),
  text_color = COALESCE(text_color, '#F5F5DC'),
  icon_color = COALESCE(icon_color, '#D4AF37'),
  border_style = COALESCE(border_style, 'bottom'),
  height = COALESCE(height, 50),
  pause_on_hover = COALESCE(pause_on_hover, true),
  show_separator = COALESCE(show_separator, true),
  enable_sound = COALESCE(enable_sound, false),
  refresh_interval = COALESCE(refresh_interval, 30);

-- Index للأداء
CREATE INDEX IF NOT EXISTS idx_live_activity_refresh 
  ON live_activity_settings(refresh_interval) 
  WHERE is_enabled = true;
