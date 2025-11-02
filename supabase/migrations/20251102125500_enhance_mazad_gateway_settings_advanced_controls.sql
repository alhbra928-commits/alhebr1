/*
  # تحسين إعدادات بوابة مزاد - إضافة تحكم متقدم

  1. أعمدة جديدة
    - `fade_duration` (integer) - مدة ظهور/اختفاء البوابة (ميلي ثانية)
    - `animation_speed` (text) - سرعة الأنيميشن: slow, normal, fast
    - `show_sparkles` (boolean) - عرض sparkles حول التاج
    - `show_particles` (boolean) - عرض الجزيئات المتحركة
    - `button_glow_enabled` (boolean) - تفعيل توهج الزر
    - `show_progress_bar` (boolean) - عرض شريط التقدم
    - `background_pattern_enabled` (boolean) - عرض نمط الخلفية
    - `title_animation_enabled` (boolean) - تفعيل أنيميشن العنوان

  2. تحديث السجل الموجود بالقيم الجديدة
*/

-- إضافة الأعمدة الجديدة
ALTER TABLE mazad_gateway_settings
ADD COLUMN IF NOT EXISTS fade_duration integer DEFAULT 400,
ADD COLUMN IF NOT EXISTS animation_speed text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS show_sparkles boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_particles boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS button_glow_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_progress_bar boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS background_pattern_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS title_animation_enabled boolean DEFAULT true;

-- إضافة قيود للتحقق من صحة البيانات
ALTER TABLE mazad_gateway_settings
DROP CONSTRAINT IF EXISTS mazad_gateway_settings_animation_speed_check;

ALTER TABLE mazad_gateway_settings
ADD CONSTRAINT mazad_gateway_settings_animation_speed_check
CHECK (animation_speed IN ('slow', 'normal', 'fast'));

-- قيد للتحقق من مدة الـ fade
ALTER TABLE mazad_gateway_settings
DROP CONSTRAINT IF EXISTS mazad_gateway_settings_fade_duration_check;

ALTER TABLE mazad_gateway_settings
ADD CONSTRAINT mazad_gateway_settings_fade_duration_check
CHECK (fade_duration >= 100 AND fade_duration <= 2000);

-- قيد لمدة التأخير
ALTER TABLE mazad_gateway_settings
DROP CONSTRAINT IF EXISTS mazad_gateway_settings_delay_check;

ALTER TABLE mazad_gateway_settings
ADD CONSTRAINT mazad_gateway_settings_delay_check
CHECK (auto_enter_delay >= 1 AND auto_enter_delay <= 30);

-- تحديث السجل الموجود
UPDATE mazad_gateway_settings
SET
  fade_duration = 400,
  animation_speed = 'normal',
  show_sparkles = true,
  show_particles = true,
  button_glow_enabled = true,
  show_progress_bar = true,
  background_pattern_enabled = true,
  title_animation_enabled = true
WHERE id IS NOT NULL;
