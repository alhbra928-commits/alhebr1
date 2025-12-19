-- ═══════════════════════════════════════════════════════════════
-- 🔧 اختبار حل خطأ 42501 - Test RLS Fix
-- ═══════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1️⃣ تحقق من RLS Policies الحالية
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'analytics_pings';

-- النتيجة المتوقعة:
-- 1. "Allow anon to insert pings" - FOR INSERT - roles: {anon} - with_check: true
-- 2. "Allow anon to read pings" - FOR SELECT - roles: {anon} - qual: true


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2️⃣ تحقق من RLS مفعّل
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'analytics_pings';

-- النتيجة المتوقعة:
-- rowsecurity: true


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3️⃣ اختبار INSERT كـ anon (محاكاة)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ملاحظة: هذا الاستعلام يعمل فقط إذا كنت admin
-- لو رجع خطأ، معناه RLS لسه فيه مشكلة

SET ROLE anon;

INSERT INTO analytics_pings (
  session_id,
  path,
  landing_path,
  referrer,
  utm_source,
  device_type,
  os,
  user_agent
) VALUES (
  'test_sess_123',
  '/test',
  '/test',
  NULL,
  'test',
  'desktop',
  'Test',
  'Test User Agent'
)
RETURNING id, created_at;

-- إذا رجع id = نجح الاختبار ✅
-- إذا رجع خطأ 42501 = لسه فيه مشكلة ❌

RESET ROLE;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4️⃣ اختبار SELECT كـ anon (محاكاة)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SET ROLE anon;

SELECT * FROM analytics_pings
WHERE session_id = 'test_sess_123'
LIMIT 1;

-- إذا رجعت البيانات = نجح الاختبار ✅
-- إذا رجع خطأ = لسه فيه مشكلة ❌

RESET ROLE;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5️⃣ مسح البيانات التجريبية
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DELETE FROM analytics_pings
WHERE session_id = 'test_sess_123';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6️⃣ الاستعلام الرئيسي - بعد الزيارة الفعلية
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  id,
  created_at,
  session_id,
  landing_path,
  referrer,
  utm_source,
  utm_medium,
  utm_campaign,
  device_type,
  os,
  LEFT(user_agent, 50) as user_agent_short
FROM analytics_pings
ORDER BY created_at DESC
LIMIT 10;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7️⃣ اختبار سريع - هل النظام يشتغل؟
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  CASE
    WHEN COUNT(*) > 0 THEN '✅ نظام PING يشتغل! عدد الزيارات: ' || COUNT(*)
    ELSE '❌ لا توجد زيارات - النظام لا يعمل'
  END as status,
  MAX(created_at)::timestamp(0) as last_ping_time
FROM analytics_pings
WHERE created_at >= NOW() - INTERVAL '10 minutes';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8️⃣ إحصائيات حسب OS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  os,
  COUNT(*) as visits,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage,
  CASE
    WHEN os = 'iOS' THEN '📱 iPhone/iPad'
    WHEN os = 'Android' THEN '🤖 Android'
    WHEN os = 'Windows' THEN '💻 Windows'
    WHEN os = 'macOS' THEN '🍎 Mac'
    WHEN os = 'Linux' THEN '🐧 Linux'
    ELSE '❓ ' || os
  END as os_label
FROM analytics_pings
GROUP BY os
ORDER BY visits DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 9️⃣ عدد الجلسات الفريدة
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(*) as total_pings,
  ROUND(COUNT(*)::numeric / COUNT(DISTINCT session_id), 1) as avg_pings_per_session
FROM analytics_pings
WHERE created_at >= NOW() - INTERVAL '24 hours';


-- ═══════════════════════════════════════════════════════════════
-- 🆘 حل المشكلات
-- ═══════════════════════════════════════════════════════════════

-- إذا لسه فيه خطأ 42501، شغّل هذا:

-- الحل 1: إعادة إنشاء السياسات
/*
DROP POLICY IF EXISTS "Allow anon to insert pings" ON analytics_pings;
DROP POLICY IF EXISTS "Allow anon to read pings" ON analytics_pings;

CREATE POLICY "Allow anon to insert pings"
  ON analytics_pings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to read pings"
  ON analytics_pings
  FOR SELECT
  TO anon
  USING (true);
*/

-- الحل 2: تعطيل RLS مؤقتاً (للاختبار فقط!)
/*
ALTER TABLE analytics_pings DISABLE ROW LEVEL SECURITY;
*/

-- الحل 3: إعادة تفعيل RLS (بعد التأكد من الحل)
/*
ALTER TABLE analytics_pings ENABLE ROW LEVEL SECURITY;
*/
