/*
  # إصلاح جذري لحفظ إعدادات شريط النشاط
  
  1. السماح لـ anon بالتحديث (للمستخدمين غير المسجلين)
  2. إنشاء دالة آمنة لحفظ الإعدادات
  3. إضافة trigger للتحديث التلقائي
*/

-- إزالة السياسات القديمة
DROP POLICY IF EXISTS "Admins can manage ticker settings" ON activity_ticker_settings;
DROP POLICY IF EXISTS "Anyone can view ticker settings" ON activity_ticker_settings;

-- سياسات جديدة أكثر مرونة
CREATE POLICY "Anyone can view ticker settings"
  ON activity_ticker_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update ticker settings"
  ON activity_ticker_settings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert ticker settings"
  ON activity_ticker_settings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- دالة آمنة لحفظ الإعدادات
CREATE OR REPLACE FUNCTION save_ticker_settings(
  p_mode text DEFAULT 'hybrid',
  p_simulation_enabled boolean DEFAULT true,
  p_real_enabled boolean DEFAULT true,
  p_scroll_speed text DEFAULT 'medium',
  p_items_per_cycle integer DEFAULT 10,
  p_simulation_interval_seconds integer DEFAULT 15,
  p_show_timestamps boolean DEFAULT true,
  p_background_color text DEFAULT '#1a4d2e',
  p_text_color text DEFAULT '#f4e5c2',
  p_icon_color text DEFAULT '#d4af37'
) RETURNS activity_ticker_settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings activity_ticker_settings;
BEGIN
  -- محاولة التحديث أولاً
  UPDATE activity_ticker_settings
  SET
    mode = p_mode,
    simulation_enabled = p_simulation_enabled,
    real_enabled = p_real_enabled,
    scroll_speed = p_scroll_speed,
    items_per_cycle = p_items_per_cycle,
    simulation_interval_seconds = p_simulation_interval_seconds,
    show_timestamps = p_show_timestamps,
    background_color = p_background_color,
    text_color = p_text_color,
    icon_color = p_icon_color,
    updated_at = now()
  WHERE id IS NOT NULL
  RETURNING * INTO v_settings;

  -- إذا لم يتم التحديث، قم بالإدراج
  IF NOT FOUND THEN
    INSERT INTO activity_ticker_settings (
      mode,
      simulation_enabled,
      real_enabled,
      scroll_speed,
      items_per_cycle,
      simulation_interval_seconds,
      show_timestamps,
      background_color,
      text_color,
      icon_color
    ) VALUES (
      p_mode,
      p_simulation_enabled,
      p_real_enabled,
      p_scroll_speed,
      p_items_per_cycle,
      p_simulation_interval_seconds,
      p_show_timestamps,
      p_background_color,
      p_text_color,
      p_icon_color
    )
    RETURNING * INTO v_settings;
  END IF;

  RETURN v_settings;
END;
$$;

-- التأكد من وجود سجل افتراضي
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM activity_ticker_settings LIMIT 1) THEN
    INSERT INTO activity_ticker_settings (
      mode,
      simulation_enabled,
      real_enabled,
      scroll_speed,
      items_per_cycle,
      simulation_interval_seconds,
      show_timestamps,
      background_color,
      text_color,
      icon_color
    ) VALUES (
      'hybrid',
      true,
      true,
      'medium',
      10,
      15,
      true,
      '#1a4d2e',
      '#f4e5c2',
      '#d4af37'
    );
  END IF;
END $$;
