/*
  # نظام شريط النشاط الحي المتحرك (Live Activity Ticker System)

  ## الوصف
  نظام شامل لعرض أنشطة المنصة بشكل حي ومتحرك في شريط علوي ثابت
  يدعم ثلاثة أوضاع: وهمي، حقيقي، وهجين

  ## 1. جدول الأنشطة الحقيقية (platform_activities)
    - `id` (uuid, primary key)
    - `activity_type` (text) - نوع النشاط: booking, investor_join, farm_added, etc
    - `activity_title_ar` (text) - عنوان النشاط بالعربية
    - `activity_title_en` (text) - عنوان النشاط بالإنجليزية
    - `icon` (text) - أيقونة النشاط (emoji أو lucide icon name)
    - `farm_name` (text, nullable) - اسم المزرعة إن وجد
    - `location` (text, nullable) - الموقع إن وجد
    - `investor_name` (text, nullable) - اسم المستثمر (مخفي جزئياً)
    - `timestamp` (timestamptz) - وقت النشاط
    - `is_visible` (boolean) - هل يظهر في الشريط
    - `priority` (integer) - أولوية الظهور (أعلى رقم = أهم)

  ## 2. جدول الأنشطة الوهمية المبرمجة (simulated_activities)
    - `id` (uuid, primary key)
    - `template_ar` (text) - قالب النص بالعربية
    - `template_en` (text) - قالب النص بالإنجليزية
    - `icon` (text) - الأيقونة
    - `activity_category` (text) - تصنيف: booking, trending, stats, etc
    - `weight` (integer) - وزن الظهور (احتمالية)
    - `is_active` (boolean) - هل القالب مفعّل

  ## 3. جدول إعدادات الشريط (activity_ticker_settings)
    - `id` (uuid, primary key)
    - `mode` (text) - simulation, real, hybrid
    - `simulation_enabled` (boolean) - تفعيل الوضع الوهمي
    - `real_enabled` (boolean) - تفعيل الوضع الحقيقي
    - `scroll_speed` (text) - slow, medium, fast
    - `items_per_cycle` (integer) - عدد العناصر في كل دورة
    - `simulation_interval_seconds` (integer) - فترة توليد نشاط وهمي جديد
    - `show_timestamps` (boolean) - إظهار الأوقات
    - `background_color` (text) - لون الخلفية
    - `text_color` (text) - لون النص
    - `icon_color` (text) - لون الأيقونة

  ## 4. Security
    - RLS enabled على جميع الجداول
    - القراءة متاحة للجميع (anon)
    - التعديل للإداريين فقط
*/

-- ==========================================
-- 1. جدول الأنشطة الحقيقية
-- ==========================================

CREATE TABLE IF NOT EXISTS platform_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type text NOT NULL,
  activity_title_ar text NOT NULL,
  activity_title_en text NOT NULL,
  icon text NOT NULL DEFAULT '🌴',
  farm_name text,
  location text,
  investor_name text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  is_visible boolean DEFAULT true,
  priority integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_activity_type CHECK (
    activity_type IN (
      'booking',           -- حجز جديد
      'investor_join',     -- مستثمر جديد
      'farm_added',        -- مزرعة جديدة
      'certificate',       -- شهادة تملك
      'payment',           -- دفعة مالية
      'trending',          -- رائج الآن
      'milestone',         -- إنجاز
      'stats'              -- إحصائية
    )
  ),
  CONSTRAINT valid_priority CHECK (priority BETWEEN 1 AND 10)
);

CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON platform_activities(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activities_visible ON platform_activities(is_visible) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_activities_priority ON platform_activities(priority DESC);

-- ==========================================
-- 2. جدول الأنشطة الوهمية المبرمجة
-- ==========================================

CREATE TABLE IF NOT EXISTS simulated_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_ar text NOT NULL,
  template_en text NOT NULL,
  icon text NOT NULL DEFAULT '⭐',
  activity_category text NOT NULL,
  weight integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_category CHECK (
    activity_category IN (
      'booking',
      'trending',
      'stats',
      'milestone',
      'interest'
    )
  ),
  CONSTRAINT valid_weight CHECK (weight BETWEEN 1 AND 100)
);

-- ==========================================
-- 3. جدول إعدادات الشريط
-- ==========================================

CREATE TABLE IF NOT EXISTS activity_ticker_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL DEFAULT 'hybrid',
  simulation_enabled boolean DEFAULT true,
  real_enabled boolean DEFAULT true,
  scroll_speed text DEFAULT 'medium',
  items_per_cycle integer DEFAULT 10,
  simulation_interval_seconds integer DEFAULT 15,
  show_timestamps boolean DEFAULT true,
  background_color text DEFAULT '#1a4d2e',
  text_color text DEFAULT '#f4e5c2',
  icon_color text DEFAULT '#d4af37',
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_mode CHECK (mode IN ('simulation', 'real', 'hybrid')),
  CONSTRAINT valid_speed CHECK (scroll_speed IN ('slow', 'medium', 'fast')),
  CONSTRAINT valid_items CHECK (items_per_cycle BETWEEN 5 AND 50),
  CONSTRAINT valid_interval CHECK (simulation_interval_seconds BETWEEN 5 AND 300)
);

-- إدراج إعدادات افتراضية
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
) ON CONFLICT DO NOTHING;

-- ==========================================
-- 4. قوالب وهمية جاهزة
-- ==========================================

INSERT INTO simulated_activities (template_ar, template_en, icon, activity_category, weight) VALUES
  ('تم حجز 3 أشجار نخيل في منطقة الأحساء قبل دقائق', '3 palm trees booked in Al-Ahsa minutes ago', '🌴', 'booking', 20),
  ('انضم مستثمر جديد من الرياض للمنصة', 'New investor joined from Riyadh', '👤', 'stats', 15),
  ('ارتفاع الطلب على أشجار الزيتون بنسبة 25%', 'Olive tree demand increased by 25%', '📈', 'trending', 25),
  ('تم إصدار 5 شهادات تملك اليوم', '5 ownership certificates issued today', '📜', 'milestone', 18),
  ('مزرعة جديدة تمت إضافتها في الخرج', 'New farm added in Al-Kharj', '🏡', 'stats', 12),
  ('100+ مستثمر نشط على المنصة الآن', '100+ active investors on platform', '✨', 'milestone', 22),
  ('حجز شجرتي نخيل في مزرعة الواحة', '2 palm trees booked in Al-Waha Farm', '🌴', 'booking', 20),
  ('مستثمر من جدة اشترى 5 أشجار زيتون', 'Investor from Jeddah bought 5 olive trees', '🫒', 'booking', 18),
  ('شجرة الزيتون الأكثر طلباً هذا الأسبوع', 'Olive tree is most demanded this week', '🔥', 'trending', 25),
  ('تم تأكيد 12 عملية دفع بنجاح اليوم', '12 payments confirmed successfully today', '💳', 'stats', 15),
  ('مزرعة النخيل الذهبية - حجز 80% من الأشجار', 'Golden Palm Farm - 80% trees booked', '⭐', 'trending', 23),
  ('مستثمر من الدمام انضم قبل قليل', 'Investor from Dammam just joined', '👥', 'stats', 14),
  ('3 مزارع جديدة قيد المراجعة', '3 new farms under review', '🔍', 'stats', 10),
  ('ارتفاع عمليات الحجز بنسبة 40% هذا الشهر', 'Bookings increased 40% this month', '📊', 'milestone', 20),
  ('شجرة نخيل تم حجزها في القصيم', 'Palm tree booked in Al-Qassim', '🌴', 'booking', 17)
ON CONFLICT DO NOTHING;

-- ==========================================
-- 5. RLS Policies
-- ==========================================

ALTER TABLE platform_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulated_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_ticker_settings ENABLE ROW LEVEL SECURITY;

-- القراءة للجميع
CREATE POLICY "Anyone can view visible activities"
  ON platform_activities FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE POLICY "Anyone can view active simulated activities"
  ON simulated_activities FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can view ticker settings"
  ON activity_ticker_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- الإدراج والتعديل للإداريين فقط
CREATE POLICY "Admins can insert activities"
  ON platform_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update activities"
  ON platform_activities FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage simulated activities"
  ON simulated_activities FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage ticker settings"
  ON activity_ticker_settings FOR ALL
  TO authenticated
  USING (true);

-- ==========================================
-- 6. Triggers للأنشطة التلقائية
-- ==========================================

-- عند إنشاء حجز جديد
CREATE OR REPLACE FUNCTION auto_create_booking_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_farm_name text;
  v_investor_name text;
BEGIN
  -- جلب اسم المزرعة
  SELECT name_ar INTO v_farm_name
  FROM farms
  WHERE id = NEW.farm_id;
  
  -- جلب اسم المستثمر (مخفي جزئياً)
  SELECT 
    CASE 
      WHEN full_name IS NOT NULL AND full_name != '' THEN 
        SUBSTRING(full_name, 1, 1) || '***'
      ELSE 
        'مستثمر'
    END
  INTO v_investor_name
  FROM investors
  WHERE id = NEW.investor_id;
  
  -- إنشاء نشاط
  INSERT INTO platform_activities (
    activity_type,
    activity_title_ar,
    activity_title_en,
    icon,
    farm_name,
    investor_name,
    priority,
    timestamp
  ) VALUES (
    'booking',
    'حجز جديد في ' || COALESCE(v_farm_name, 'مزرعة'),
    'New booking in ' || COALESCE(v_farm_name, 'farm'),
    '🌴',
    v_farm_name,
    v_investor_name,
    7,
    now()
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_new_reservation_activity
  AFTER INSERT ON reservations
  FOR EACH ROW
  WHEN (NEW.booking_status = 'confirmed' OR NEW.booking_status = 'approved')
  EXECUTE FUNCTION auto_create_booking_activity();

-- عند إنشاء مستثمر جديد
CREATE OR REPLACE FUNCTION auto_create_investor_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO platform_activities (
    activity_type,
    activity_title_ar,
    activity_title_en,
    icon,
    priority,
    timestamp
  ) VALUES (
    'investor_join',
    'انضم مستثمر جديد للمنصة',
    'New investor joined the platform',
    '👤',
    6,
    now()
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_new_investor_activity
  AFTER INSERT ON investors
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION auto_create_investor_activity();

-- عند إضافة مزرعة جديدة
CREATE OR REPLACE FUNCTION auto_create_farm_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO platform_activities (
    activity_type,
    activity_title_ar,
    activity_title_en,
    icon,
    farm_name,
    location,
    priority,
    timestamp
  ) VALUES (
    'farm_added',
    'مزرعة جديدة: ' || NEW.name_ar,
    'New farm: ' || NEW.name_en,
    '🏡',
    NEW.name_ar,
    NEW.location,
    8,
    now()
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_new_farm_activity
  AFTER INSERT ON farms
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION auto_create_farm_activity();

-- ==========================================
-- 7. تفعيل Realtime
-- ==========================================

ALTER PUBLICATION supabase_realtime ADD TABLE platform_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_ticker_settings;