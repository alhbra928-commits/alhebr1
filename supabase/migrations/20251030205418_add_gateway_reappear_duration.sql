/*
  # إضافة إعداد مدة إعادة ظهور البوابة الملكية

  1. Changes
    - إضافة حقل gateway_reappear_duration إلى جدول royal_gateway_settings
    - القيم المتاحة:
      - 'always': ظهور متكرر في كل مرة
      - '30min': بعد نصف ساعة
      - '1hour': بعد ساعة واحدة (الافتراضي)
      - '2hours': بعد ساعتين
      - '6hours': بعد 6 ساعات
      - '24hours': بعد 24 ساعة (يوم واحد)

  2. Notes
    - القيمة الافتراضية: '1hour'
    - يمكن للمدير تغيير المدة من الإعدادات
*/

-- إضافة الحقل مع القيمة الافتراضية
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings'
    AND column_name = 'gateway_reappear_duration'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN gateway_reappear_duration text DEFAULT '1hour'
    CHECK (gateway_reappear_duration IN ('always', '30min', '1hour', '2hours', '6hours', '24hours'));
  END IF;
END $$;

-- تحديث الإعداد الافتراضي إذا كان موجوداً
UPDATE royal_gateway_settings
SET gateway_reappear_duration = '1hour'
WHERE gateway_reappear_duration IS NULL;
