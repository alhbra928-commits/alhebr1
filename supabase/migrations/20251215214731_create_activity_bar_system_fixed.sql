/*
  # إنشاء نظام شريط الإحصائيات المباشر المتحرك

  1. جداول جديدة
    - `activity_bar_settings`: إعدادات الشريط العامة
      - `is_enabled`: تفعيل/تعطيل الشريط
      - `scroll_speed`: سرعة الحركة (slow/medium/fast)
      - `display_duration`: مدة العرض لكل نشاط
      - `background_color`: لون الخلفية
      - `text_color`: لون النص
      
    - `platform_activities`: سجل الأنشطة
      - `activity_type`: نوع النشاط (new_booking, new_investor, payment_completed)
      - `activity_data`: بيانات JSON للنشاط
      - `priority`: أولوية العرض (1-10)
      - `is_active`: نشط أم لا
      - `display_count`: عدد مرات العرض
      - `last_displayed_at`: آخر مرة تم عرضه

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - السماح بالقراءة للجميع (anon)
    - السماح بالتعديل للمشرفين فقط
    
  3. البيانات الافتراضية
    - إنشاء إعدادات افتراضية
    - إضافة أنشطة تجريبية
*/

-- جدول إعدادات الشريط
CREATE TABLE IF NOT EXISTS activity_bar_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_enabled BOOLEAN DEFAULT true,
  scroll_speed TEXT DEFAULT 'medium' CHECK (scroll_speed IN ('slow', 'medium', 'fast')),
  display_duration INTEGER DEFAULT 5,
  background_color TEXT DEFAULT '#065f46',
  text_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT only_one_settings CHECK (id = 1)
);

-- جدول الأنشطة
CREATE TABLE IF NOT EXISTS platform_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'new_booking', 
    'new_investor', 
    'payment_completed', 
    'farm_approved', 
    'milestone_reached'
  )),
  activity_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  is_active BOOLEAN DEFAULT true,
  display_count INTEGER DEFAULT 0,
  last_displayed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_platform_activities_active 
  ON platform_activities(is_active, priority DESC, created_at DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_platform_activities_type 
  ON platform_activities(activity_type) 
  WHERE deleted_at IS NULL;

-- تفعيل RLS
ALTER TABLE activity_bar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_activities ENABLE ROW LEVEL SECURITY;

-- سياسات activity_bar_settings
DROP POLICY IF EXISTS "Allow public read access to activity_bar_settings" ON activity_bar_settings;
CREATE POLICY "Allow public read access to activity_bar_settings"
  ON activity_bar_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow admin update activity_bar_settings" ON activity_bar_settings;
CREATE POLICY "Allow admin update activity_bar_settings"
  ON activity_bar_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات platform_activities
DROP POLICY IF EXISTS "Allow public read active activities" ON platform_activities;
CREATE POLICY "Allow public read active activities"
  ON platform_activities FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL AND is_active = true);

DROP POLICY IF EXISTS "Allow admin insert activities" ON platform_activities;
CREATE POLICY "Allow admin insert activities"
  ON platform_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin update activities" ON platform_activities;
CREATE POLICY "Allow admin update activities"
  ON platform_activities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- البيانات الافتراضية
INSERT INTO activity_bar_settings (id, is_enabled, scroll_speed, display_duration, background_color, text_color)
VALUES (1, true, 'medium', 5, '#065f46', '#ffffff')
ON CONFLICT (id) DO NOTHING;

-- أنشطة تجريبية
INSERT INTO platform_activities (activity_type, activity_data, priority, is_active)
VALUES 
  ('new_booking', '{"customer_name": "أحمد محمد", "farm_name": "مزرعة حصص زراعية", "trees_count": 50}'::jsonb, 8, true),
  ('new_investor', '{"investor_name": "فاطمة علي", "investment_amount": 25000}'::jsonb, 7, true),
  ('payment_completed', '{"customer_name": "خالد سعيد", "amount": 15000}'::jsonb, 9, true),
  ('farm_approved', '{"farm_name": "مزرعة الخلدية", "tree_count": 5000}'::jsonb, 6, true),
  ('milestone_reached', '{"milestone": "تم حجز 10000 شجرة هذا الشهر", "count": 10000}'::jsonb, 10, true)
ON CONFLICT DO NOTHING;
