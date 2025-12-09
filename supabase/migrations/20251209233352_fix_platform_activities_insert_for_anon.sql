/*
  # إصلاح إضافة الأنشطة اليدوية
  
  1. السماح لـ anon بإدراج الأنشطة
  2. إنشاء دالة آمنة للإدراج
*/

-- إضافة سياسة للسماح لـ anon بالإدراج
DROP POLICY IF EXISTS "Admins can insert activities" ON platform_activities;

CREATE POLICY "Anyone can insert activities"
  ON platform_activities
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- إنشاء دالة آمنة لإضافة نشاط يدوي
CREATE OR REPLACE FUNCTION create_manual_activity(
  p_activity_type text,
  p_activity_title_ar text,
  p_activity_title_en text,
  p_icon text DEFAULT '⭐',
  p_priority integer DEFAULT 5
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activity_id uuid;
BEGIN
  -- إدراج النشاط
  INSERT INTO platform_activities (
    activity_type,
    activity_title_ar,
    activity_title_en,
    icon,
    priority,
    is_visible,
    timestamp
  ) VALUES (
    p_activity_type,
    p_activity_title_ar,
    p_activity_title_en,
    p_icon,
    p_priority,
    true,
    now()
  )
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$;
