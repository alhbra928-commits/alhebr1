-- ✅ التحقق من جداول شريط النشاط المباشر

-- 1. التحقق من وجود الجداول
SELECT 'activity_ticker_settings' as table_name, COUNT(*) as rows_count
FROM activity_ticker_settings
UNION ALL
SELECT 'platform_activities' as table_name, COUNT(*) as rows_count
FROM platform_activities
UNION ALL
SELECT 'simulated_activities' as table_name, COUNT(*) as rows_count
FROM simulated_activities;

-- 2. عرض الإعدادات الحالية
SELECT
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
FROM activity_ticker_settings
LIMIT 1;

-- 3. عرض 10 قوالب وهمية
SELECT
    template_ar,
    icon,
    category,
    weight,
    is_active
FROM simulated_activities
WHERE is_active = true
ORDER BY weight DESC
LIMIT 10;

-- 4. عرض آخر 10 أنشطة حقيقية
SELECT
    activity_title_ar,
    icon,
    activity_type,
    priority,
    is_visible,
    timestamp
FROM platform_activities
WHERE is_visible = true
ORDER BY timestamp DESC
LIMIT 10;

-- 5. التحقق من سياسات RLS
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('activity_ticker_settings', 'platform_activities', 'simulated_activities')
ORDER BY tablename, policyname;
