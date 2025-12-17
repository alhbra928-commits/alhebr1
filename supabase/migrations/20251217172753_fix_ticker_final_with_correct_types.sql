/*
  # إصلاح نظام الشريط المتحرك النهائي

  ## البنية الفعلية:
  - activity_type: محدد بـ constraint
  - activity_data: jsonb
  - is_active: boolean (ليس is_visible)

  ## الإصلاح:
  1. تحديث constraint ليسمح بأنواع جديدة
  2. إصلاح RLS policies مع الحذف
  3. إنشاء triggers للأحداث الحقيقية
*/

-- ==========================================
-- 1. تحديث Constraint للسماح بأنواع جديدة
-- ==========================================

ALTER TABLE platform_activities 
DROP CONSTRAINT IF EXISTS platform_activities_activity_type_check;

ALTER TABLE platform_activities
ADD CONSTRAINT platform_activities_activity_type_check
CHECK (activity_type IN (
  'new_booking',
  'booking',
  'new_investor',
  'investor_join',
  'payment_completed',
  'payment',
  'farm_approved',
  'farm_added',
  'milestone_reached',
  'milestone',
  'certificate',
  'trending',
  'stats'
));

-- ==========================================
-- 2. إصلاح RLS Policies مع إضافة الحذف
-- ==========================================

DROP POLICY IF EXISTS "Allow public read active activities" ON platform_activities;
DROP POLICY IF EXISTS "Allow admin insert activities" ON platform_activities;
DROP POLICY IF EXISTS "Allow admin update activities" ON platform_activities;
DROP POLICY IF EXISTS "Public can view active activities" ON platform_activities;
DROP POLICY IF EXISTS "Authenticated can view all activities" ON platform_activities;
DROP POLICY IF EXISTS "Anyone can insert activities" ON platform_activities;
DROP POLICY IF EXISTS "Authenticated can update activities" ON platform_activities;
DROP POLICY IF EXISTS "Authenticated can delete activities" ON platform_activities;

-- القراءة للعامة (النشطة فقط)
CREATE POLICY "anon_view_active"
  ON platform_activities FOR SELECT
  TO anon
  USING (is_active = true AND deleted_at IS NULL);

-- القراءة للمسؤولين (الكل)
CREATE POLICY "auth_view_all"
  ON platform_activities FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- الإدراج (للـ triggers والمسؤولين)
CREATE POLICY "auth_insert"
  ON platform_activities FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- التعديل (للمسؤولين)
CREATE POLICY "auth_update"
  ON platform_activities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- الحذف (للمسؤولين) - هذه المشكلة الأساسية!
CREATE POLICY "auth_delete"
  ON platform_activities FOR DELETE
  TO authenticated
  USING (true);

-- ==========================================
-- 3. RLS للقوالب الوهمية
-- ==========================================

DROP POLICY IF EXISTS "Public can view active templates" ON simulated_activities;
DROP POLICY IF EXISTS "Authenticated can view all templates" ON simulated_activities;
DROP POLICY IF EXISTS "Authenticated can insert templates" ON simulated_activities;
DROP POLICY IF EXISTS "Authenticated can update templates" ON simulated_activities;
DROP POLICY IF EXISTS "Authenticated can delete templates" ON simulated_activities;
DROP POLICY IF EXISTS "Public view active templates" ON simulated_activities;
DROP POLICY IF EXISTS "Authenticated view all templates" ON simulated_activities;
DROP POLICY IF EXISTS "Authenticated insert templates" ON simulated_activities;
DROP POLICY IF EXISTS "Authenticated update templates" ON simulated_activities;
DROP POLICY IF EXISTS "Authenticated delete templates" ON simulated_activities;

CREATE POLICY "sim_anon_view_active"
  ON simulated_activities FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "sim_auth_view_all"
  ON simulated_activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "sim_auth_insert"
  ON simulated_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "sim_auth_update"
  ON simulated_activities FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "sim_auth_delete"
  ON simulated_activities FOR DELETE
  TO authenticated
  USING (true);

-- ==========================================
-- 4. Triggers للأحداث الحقيقية
-- ==========================================

-- Trigger للحجوزات
CREATE OR REPLACE FUNCTION trigger_booking_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_farm_name text;
  v_tree_count integer;
BEGIN
  SELECT name_ar INTO v_farm_name FROM farms WHERE id = NEW.farm_id;
  v_tree_count := COALESCE(NEW.reserved_trees, 1);

  INSERT INTO platform_activities (activity_type, activity_data, priority, is_active)
  VALUES (
    'booking',
    jsonb_build_object(
      'title_ar', 'حجز ' || v_tree_count || ' شجرة في ' || COALESCE(v_farm_name, 'مزرعة'),
      'title_en', v_tree_count || ' tree(s) booked in ' || COALESCE(v_farm_name, 'farm'),
      'icon', '🌴',
      'farm_name', v_farm_name,
      'tree_count', v_tree_count
    ),
    8,
    true
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_booking_activity ON reservations;
CREATE TRIGGER on_booking_activity
  AFTER INSERT ON reservations
  FOR EACH ROW
  WHEN (NEW.booking_status IN ('confirmed', 'approved', 'pending'))
  EXECUTE FUNCTION trigger_booking_activity();

-- Trigger للمستثمرين
CREATE OR REPLACE FUNCTION trigger_investor_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO platform_activities (activity_type, activity_data, priority, is_active)
  VALUES (
    'investor_join',
    jsonb_build_object(
      'title_ar', 'انضم مستثمر جديد للمنصة',
      'title_en', 'New investor joined',
      'icon', '👤'
    ),
    6,
    true
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_investor_activity ON investors;
CREATE TRIGGER on_investor_activity
  AFTER INSERT ON investors
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION trigger_investor_activity();

-- Trigger للمزارع
CREATE OR REPLACE FUNCTION trigger_farm_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO platform_activities (activity_type, activity_data, priority, is_active)
  VALUES (
    'farm_added',
    jsonb_build_object(
      'title_ar', 'مزرعة جديدة: ' || COALESCE(NEW.name_ar, 'مزرعة'),
      'title_en', 'New farm: ' || COALESCE(NEW.name_en, 'Farm'),
      'icon', '🏡',
      'farm_name', NEW.name_ar
    ),
    9,
    true
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_farm_activity ON farms;
CREATE TRIGGER on_farm_activity
  AFTER INSERT ON farms
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION trigger_farm_activity();

-- Trigger للشهادات
CREATE OR REPLACE FUNCTION trigger_certificate_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_farm_name text;
BEGIN
  SELECT f.name_ar INTO v_farm_name
  FROM farms f
  INNER JOIN reservations r ON r.farm_id = f.id
  WHERE r.id = NEW.booking_id;

  INSERT INTO platform_activities (activity_type, activity_data, priority, is_active)
  VALUES (
    'certificate',
    jsonb_build_object(
      'title_ar', 'شهادة تملك جديدة',
      'title_en', 'New certificate issued',
      'icon', '📜',
      'farm_name', v_farm_name
    ),
    7,
    true
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_certificate_activity ON documentation;
CREATE TRIGGER on_certificate_activity
  AFTER INSERT ON documentation
  FOR EACH ROW
  EXECUTE FUNCTION trigger_certificate_activity();

-- Trigger للدفعات
CREATE OR REPLACE FUNCTION trigger_payment_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status != 'approved' THEN RETURN NEW; END IF;

  INSERT INTO platform_activities (activity_type, activity_data, priority, is_active)
  VALUES (
    'payment',
    jsonb_build_object(
      'title_ar', 'دفعة مالية مؤكدة',
      'title_en', 'Payment confirmed',
      'icon', '💳'
    ),
    6,
    true
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_payment_activity ON payment_receipts;
CREATE TRIGGER on_payment_activity
  AFTER UPDATE ON payment_receipts
  FOR EACH ROW
  WHEN (OLD.status != 'approved' AND NEW.status = 'approved')
  EXECUTE FUNCTION trigger_payment_activity();

-- ==========================================
-- 5. إدراج أنشطة تجريبية
-- ==========================================

INSERT INTO platform_activities (activity_type, activity_data, priority, is_active) VALUES
  ('stats', '{"title_ar": "أكثر من 100 مستثمر نشط", "title_en": "100+ active investors", "icon": "✨"}'::jsonb, 8, true),
  ('milestone', '{"title_ar": "500 شجرة محجوزة هذا الشهر", "title_en": "500 trees booked this month", "icon": "🎯"}'::jsonb, 9, true),
  ('trending', '{"title_ar": "النخيل الأكثر طلباً", "title_en": "Palm trees most demanded", "icon": "🔥"}'::jsonb, 7, true)
ON CONFLICT DO NOTHING;
