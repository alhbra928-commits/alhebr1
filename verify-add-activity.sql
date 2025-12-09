-- ═══════════════════════════════════════════════════════════
-- 🔍 التحقق من نظام إضافة الأنشطة اليدوية
-- ═══════════════════════════════════════════════════════════

-- 1. التحقق من وجود الدالة
-- ══════════════════════════════════════════════════════════
SELECT
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_name = 'create_manual_activity';

-- يجب أن ترى:
-- routine_name: create_manual_activity
-- routine_type: FUNCTION
-- security_type: DEFINER


-- 2. التحقق من RLS Policies
-- ══════════════════════════════════════════════════════════
SELECT
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'platform_activities'
ORDER BY cmd;

-- يجب أن ترى:
-- "Anyone can insert activities" | INSERT | {anon,authenticated}
-- "Admins can update activities" | UPDATE | {authenticated}
-- "Anyone can view visible activities" | SELECT | {anon,authenticated}


-- 3. عرض جميع الأنشطة الحالية
-- ══════════════════════════════════════════════════════════
SELECT
    activity_title_ar,
    icon,
    priority,
    is_visible,
    activity_type,
    to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as created
FROM platform_activities
WHERE is_visible = true
ORDER BY created_at DESC
LIMIT 20;


-- 4. إحصائيات الأنشطة
-- ══════════════════════════════════════════════════════════
SELECT
    activity_type,
    COUNT(*) as total,
    COUNT(CASE WHEN is_visible THEN 1 END) as visible
FROM platform_activities
GROUP BY activity_type
ORDER BY total DESC;


-- 5. اختبار إضافة نشاط يدوي (اختياري)
-- ══════════════════════════════════════════════════════════
-- SELECT create_manual_activity(
--     'test',
--     'اختبار من SQL',
--     'Test from SQL',
--     '🧪',
--     5
-- );


-- 6. التحقق من آخر 10 أنشطة
-- ══════════════════════════════════════════════════════════
SELECT
    id,
    activity_title_ar,
    icon,
    priority,
    is_visible,
    to_char(timestamp, 'YYYY-MM-DD HH24:MI:SS') as time,
    to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as created
FROM platform_activities
ORDER BY created_at DESC
LIMIT 10;


-- 7. التحقق من أعمدة الجدول
-- ══════════════════════════════════════════════════════════
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'platform_activities'
ORDER BY ordinal_position;


-- 8. حذف نشاط تجريبي (اختياري)
-- ══════════════════════════════════════════════════════════
-- DELETE FROM platform_activities
-- WHERE activity_title_ar LIKE '%اختبار%'
-- OR activity_title_ar LIKE '%test%';


-- ═══════════════════════════════════════════════════════════
-- 📊 تقرير سريع
-- ═══════════════════════════════════════════════════════════
SELECT
    'Total Activities' as metric,
    COUNT(*)::text as value
FROM platform_activities

UNION ALL

SELECT
    'Visible Activities',
    COUNT(*)::text
FROM platform_activities
WHERE is_visible = true

UNION ALL

SELECT
    'Hidden Activities',
    COUNT(*)::text
FROM platform_activities
WHERE is_visible = false

UNION ALL

SELECT
    'Latest Activity',
    activity_title_ar
FROM platform_activities
ORDER BY created_at DESC
LIMIT 1;
