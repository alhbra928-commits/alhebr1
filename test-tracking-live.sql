-- ═══════════════════════════════════════════════════════════════
-- 🔍 اختبار نظام التتبع اللحظي - Live Tracking Verification
-- ═══════════════════════════════════════════════════════════════
-- شغّل هذه الاستعلامات بعد ما تزور الموقع من جوالك
-- Run these queries after visiting the website from your mobile
-- ═══════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1️⃣ آخر 10 جلسات (Last 10 Sessions)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- يفترض تشوف جلستك الجديدة هنا ✅
SELECT
  session_id,
  created_at::timestamp(0) as visit_time,
  COALESCE(utm_source, 'Direct') as source,
  device_type,
  os,
  browser,
  landing_path,
  CASE
    WHEN metadata->>'is_test' = 'true' THEN '🧪 TEST'
    ELSE '✅ LIVE'
  END as mode
FROM analytics_sessions
ORDER BY created_at DESC
LIMIT 10;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2️⃣ آخر 20 حدث (Last 20 Events)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- يفترض تلاقي على الأقل home_view ✅
SELECT
  event_name,
  created_at::timestamp(0) as event_time,
  path,
  CASE
    WHEN event_name = 'home_view' THEN '🏠 مشاهدة الرئيسية'
    WHEN event_name = 'farm_view' THEN '🌾 مشاهدة مزرعة'
    WHEN event_name = 'qty_change' THEN '🔢 تغيير الكمية'
    WHEN event_name = 'booking_start' THEN '🎫 بدء الحجز'
    WHEN event_name = 'booking_submit' THEN '✅ إرسال الحجز'
    WHEN event_name = 'payment_upload' THEN '💳 رفع الإيصال'
    WHEN event_name = 'whatsapp_click' THEN '💬 فتح واتساب'
    ELSE '⚡ ' || event_name
  END as event_label,
  event_value->>'farm_name' as farm_name
FROM analytics_events
ORDER BY created_at DESC
LIMIT 20;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3️⃣ إحصائيات آخر ساعة (Last Hour Stats)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT CASE WHEN device_type = 'mobile' THEN session_id END) as mobile_sessions,
  COUNT(DISTINCT CASE WHEN device_type = 'desktop' THEN session_id END) as desktop_sessions,
  COUNT(DISTINCT CASE WHEN metadata->>'is_test' = 'true' THEN session_id END) as test_sessions,
  COUNT(DISTINCT CASE WHEN metadata->>'is_test' IS NULL OR metadata->>'is_test' != 'true' THEN session_id END) as real_sessions
FROM analytics_sessions
WHERE created_at >= NOW() - INTERVAL '1 hour';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4️⃣ المصادر (Sources Breakdown)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  COALESCE(utm_source, 'Direct') as source,
  COUNT(*) as sessions_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM analytics_sessions
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY utm_source
ORDER BY sessions_count DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5️⃣ الأحداث حسب النوع (Events by Type)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  event_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  CASE
    WHEN event_name = 'home_view' THEN '🏠 مشاهدة الرئيسية'
    WHEN event_name = 'farm_view' THEN '🌾 مشاهدة مزرعة'
    WHEN event_name = 'qty_change' THEN '🔢 تغيير الكمية'
    WHEN event_name = 'booking_start' THEN '🎫 بدء الحجز'
    WHEN event_name = 'booking_submit' THEN '✅ إرسال الحجز'
    WHEN event_name = 'payment_upload' THEN '💳 رفع الإيصال'
    WHEN event_name = 'whatsapp_click' THEN '💬 فتح واتساب'
    ELSE '⚡ ' || event_name
  END as event_label
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY event_name
ORDER BY event_count DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6️⃣ أجهزة ونظام التشغيل (Devices & OS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  device_type,
  os,
  browser,
  COUNT(*) as sessions_count,
  CASE
    WHEN device_type = 'mobile' AND os = 'ios' THEN '📱 iPhone'
    WHEN device_type = 'mobile' AND os = 'android' THEN '🤖 Android'
    WHEN device_type = 'desktop' AND os = 'windows' THEN '💻 Windows PC'
    WHEN device_type = 'desktop' AND os = 'mac' THEN '🍎 Mac'
    ELSE '🖥️ ' || device_type || ' - ' || os
  END as device_label
FROM analytics_sessions
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY device_type, os, browser
ORDER BY sessions_count DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7️⃣ جلسة واحدة كاملة (Full Session Details)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- شوف تفاصيل أحدث جلسة بالكامل
WITH latest_session AS (
  SELECT session_id
  FROM analytics_sessions
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  'SESSION' as type,
  s.session_id::text as id,
  s.created_at::timestamp(0) as time,
  COALESCE(s.utm_source, 'Direct') as source,
  s.device_type || ' - ' || s.os as device,
  s.landing_path as detail
FROM analytics_sessions s, latest_session ls
WHERE s.session_id = ls.session_id

UNION ALL

SELECT
  'EVENT' as type,
  event_name as id,
  e.created_at::timestamp(0) as time,
  path as source,
  '' as device,
  COALESCE(e.event_value->>'farm_name', '') as detail
FROM analytics_events e, latest_session ls
WHERE e.session_id = ls.session_id
ORDER BY time;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8️⃣ اختبار سريع (Quick Test)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- لو النتيجة > 0 يعني النظام يشتغل ✅
SELECT
  CASE
    WHEN COUNT(*) > 0 THEN '✅ نظام التتبع يشتغل! عدد الجلسات: ' || COUNT(*)
    ELSE '❌ لا توجد جلسات - التتبع لا يعمل'
  END as status
FROM analytics_sessions
WHERE created_at >= NOW() - INTERVAL '10 minutes';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ✅ النتائج المتوقعة (Expected Results)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--
-- إذا اشتغل النظام صح، يفترض تشوف:
--
-- 1. آخر 10 جلسات: جلستك الجديدة تظهر في الأعلى
--    - session_id: قيمة UUID
--    - visit_time: الوقت الحالي
--    - source: Direct (أو المصدر اللي دخلت منه)
--    - device_type: mobile أو desktop
--    - os: ios, android, windows, mac, etc.
--
-- 2. آخر 20 حدث: على الأقل حدث home_view
--    - event_name: home_view
--    - event_time: وقت الزيارة
--    - path: /
--
-- 3. إحصائيات آخر ساعة: أرقام > 0
--    - total_sessions: 1 أو أكثر
--    - mobile/desktop: حسب جهازك
--
-- 4. اختبار سريع:
--    ✅ نظام التتبع يشتغل! عدد الجلسات: 1
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ❌ إذا ما اشتغل (Troubleshooting)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--
-- لو كل الاستعلامات ترجع 0 نتائج:
--
-- 1. تأكد إنك رفعت الإصدار الجديد (v20251219_1766176447573)
-- 2. امسح كاش المتصفح (Ctrl+Shift+R)
-- 3. افتح Console (F12) وشوف الأخطاء
-- 4. شوف الشارة في أسفل اليسار (Debug Badge)
-- 5. افتح Network Tab وشوف requests لـ Supabase
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
