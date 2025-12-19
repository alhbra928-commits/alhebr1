/*
  # إضافة حقول session_id و os و landing_path لجدول analytics_pings
  
  1. New Columns
    - `session_id` - معرف فريد للجلسة (localStorage)
    - `landing_path` - أول صفحة تم زيارتها (نفس path لكن اسم أوضح)
    - `os` - نظام التشغيل
*/

-- إضافة session_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_pings' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE analytics_pings ADD COLUMN session_id text;
    CREATE INDEX IF NOT EXISTS idx_analytics_pings_session_id ON analytics_pings(session_id);
  END IF;
END $$;

-- إضافة landing_path (نفس path لكن اسم أوضح)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_pings' AND column_name = 'landing_path'
  ) THEN
    ALTER TABLE analytics_pings ADD COLUMN landing_path text;
  END IF;
END $$;

-- إضافة os
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_pings' AND column_name = 'os'
  ) THEN
    ALTER TABLE analytics_pings ADD COLUMN os text;
  END IF;
END $$;

COMMENT ON COLUMN analytics_pings.session_id IS 'Unique session identifier from localStorage';
COMMENT ON COLUMN analytics_pings.landing_path IS 'First page visited (same as path)';
COMMENT ON COLUMN analytics_pings.os IS 'Operating system detected from user agent';
