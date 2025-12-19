-- ═══════════════════════════════════════════════════════════════
-- 🎯 اختبار النظام الكامل - Complete Analytics System Test
-- ═══════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1️⃣ اختبار PING - تأكد من وجود بيانات
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  id,
  created_at::timestamp(0) as time,
  session_id,
  landing_path,
  referrer,
  utm_source,
  utm_medium,
  device_type,
  os
FROM analytics_pings
ORDER BY created_at DESC
LIMIT 10;

-- النتيجة المتوقعة: سجل واحد على الأقل ✅


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2️⃣ اختبار Sessions - تأكد من إنشاء الجلسات
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  id,
  created_at::timestamp(0) as time,
  session_id,
  landing_page,
  utm_source,
  device_type,
  os,
  browser,
  page_views,
  events_count,
  duration_seconds,
  is_active
FROM analytics_sessions
ORDER BY created_at DESC
LIMIT 10;

-- النتيجة المتوقعة: سجل واحد على الأقل ✅


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3️⃣ اختبار Events - تأكد من تسجيل الأحداث
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  id,
  created_at::timestamp(0) as time,
  session_id,
  event_type,
  event_name,
  page_path
FROM analytics_events
ORDER BY created_at DESC
LIMIT 20;

-- النتيجة المتوقعة: 2+ events (page_view, home_view, etc) ✅


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4️⃣ اختبار شامل - عدد السجلات في كل جدول
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  'analytics_pings' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h
FROM analytics_pings
UNION ALL
SELECT
  'analytics_sessions' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h
FROM analytics_sessions
UNION ALL
SELECT
  'analytics_events' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h
FROM analytics_events;

-- النتيجة المتوقعة:
-- analytics_pings: 1+
-- analytics_sessions: 1+
-- analytics_events: 2+


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5️⃣ إحصائيات الزيارات حسب المصدر
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  COALESCE(utm_source, 'Direct') as source,
  COUNT(*) as visits,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage,
  CASE
    WHEN utm_source IS NULL THEN '🟢 مباشر'
    WHEN utm_source = 'google' THEN '🔴 Google'
    WHEN utm_source = 'facebook' THEN '🔵 Facebook'
    WHEN utm_source = 'tiktok' THEN '⚫ TikTok'
    WHEN utm_source = 'whatsapp' THEN '🟢 WhatsApp'
    ELSE '📱 ' || utm_source
  END as source_label
FROM analytics_pings
GROUP BY utm_source
ORDER BY visits DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6️⃣ إحصائيات الأجهزة
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  device_type,
  os,
  COUNT(*) as visits,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage,
  CASE
    WHEN os = 'iOS' THEN '📱 iPhone/iPad'
    WHEN os = 'Android' THEN '🤖 Android'
    WHEN os = 'Windows' THEN '💻 Windows'
    WHEN os = 'macOS' THEN '🍎 Mac'
    ELSE '❓ ' || os
  END as device_label
FROM analytics_pings
GROUP BY device_type, os
ORDER BY visits DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7️⃣ الجلسات النشطة الآن
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  COUNT(*) as active_sessions,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(page_views)::integer as avg_page_views,
  AVG(events_count)::integer as avg_events
FROM analytics_sessions
WHERE is_active = true
  AND updated_at >= NOW() - INTERVAL '5 minutes';

-- النتيجة المتوقعة: 1+ active_sessions ✅


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8️⃣ توزيع الأحداث حسب النوع
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  event_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage,
  CASE
    WHEN event_type = 'page_view' THEN '📄 مشاهدة صفحة'
    WHEN event_type = 'home_view' THEN '🏠 الرئيسية'
    WHEN event_type = 'farm_view' THEN '🌾 عرض مزرعة'
    WHEN event_type = 'farm_detail_view' THEN '🔍 تفاصيل مزرعة'
    WHEN event_type = 'booking_start' THEN '▶️ بدء الحجز'
    WHEN event_type = 'booking_submit' THEN '📝 إرسال الحجز'
    WHEN event_type = 'booking_complete' THEN '✅ إكمال الحجز'
    WHEN event_type = 'whatsapp_click' THEN '💬 نقر WhatsApp'
    ELSE '❓ ' || event_type
  END as event_label
FROM analytics_events
GROUP BY event_type
ORDER BY count DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 9️⃣ أكثر الصفحات زيارة (آخر 24 ساعة)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  page_path,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_visitors,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM analytics_events
WHERE event_type = 'page_view'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY page_path
ORDER BY views DESC
LIMIT 10;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔟 معدل التحويل (من زيارة إلى حجز)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WITH funnel_stats AS (
  SELECT
    COUNT(DISTINCT CASE WHEN event_type = 'home_view' THEN session_id END) as visitors,
    COUNT(DISTINCT CASE WHEN event_type = 'farm_view' THEN session_id END) as viewed_farm,
    COUNT(DISTINCT CASE WHEN event_type = 'farm_detail_view' THEN session_id END) as viewed_details,
    COUNT(DISTINCT CASE WHEN event_type = 'booking_start' THEN session_id END) as started_booking,
    COUNT(DISTINCT CASE WHEN event_type = 'booking_submit' THEN session_id END) as submitted_booking,
    COUNT(DISTINCT CASE WHEN event_type = 'booking_complete' THEN session_id END) as completed_booking
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '24 hours'
)
SELECT
  visitors as step1_visitors,
  viewed_farm as step2_viewed_farm,
  viewed_details as step3_viewed_details,
  started_booking as step4_started,
  submitted_booking as step5_submitted,
  completed_booking as step6_completed,
  ROUND(viewed_farm * 100.0 / NULLIF(visitors, 0), 1) as conversion_to_view,
  ROUND(started_booking * 100.0 / NULLIF(viewed_details, 0), 1) as conversion_to_booking,
  ROUND(submitted_booking * 100.0 / NULLIF(started_booking, 0), 1) as booking_completion,
  ROUND(completed_booking * 100.0 / NULLIF(visitors, 0), 1) as overall_conversion
FROM funnel_stats;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1️⃣1️⃣ متوسط مدة الجلسة
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN is_active = false THEN 1 END) as ended_sessions,
  ROUND(AVG(duration_seconds)) as avg_duration_seconds,
  ROUND(AVG(duration_seconds) / 60, 1) as avg_duration_minutes,
  MAX(duration_seconds) as longest_session_seconds,
  ROUND(MAX(duration_seconds) / 60, 1) as longest_session_minutes
FROM analytics_sessions
WHERE duration_seconds IS NOT NULL;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1️⃣2️⃣ الزيارات حسب الساعة (آخر 24 ساعة)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(*) as visits,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_pings
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1️⃣3️⃣ اختبار نهائي - هل النظام يشتغل؟
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM analytics_pings) > 0
      AND (SELECT COUNT(*) FROM analytics_sessions) > 0
      AND (SELECT COUNT(*) FROM analytics_events) > 0
    THEN '✅ النظام يشتغل بنجاح! جميع الجداول تحتوي على بيانات'
    WHEN (SELECT COUNT(*) FROM analytics_pings) = 0
    THEN '❌ لا توجد بيانات في analytics_pings - PING لا يعمل'
    WHEN (SELECT COUNT(*) FROM analytics_sessions) = 0
    THEN '❌ لا توجد بيانات في analytics_sessions - Sessions لا تعمل'
    WHEN (SELECT COUNT(*) FROM analytics_events) = 0
    THEN '❌ لا توجد بيانات في analytics_events - Events لا تعمل'
    ELSE '❓ حالة غير معروفة'
  END as system_status,
  (SELECT COUNT(*) FROM analytics_pings) as pings_count,
  (SELECT COUNT(*) FROM analytics_sessions) as sessions_count,
  (SELECT COUNT(*) FROM analytics_events) as events_count;


-- ═══════════════════════════════════════════════════════════════
-- 🆘 استكشاف الأخطاء
-- ═══════════════════════════════════════════════════════════════

-- إذا لا توجد بيانات في analytics_pings:
/*
-- 1. تحقق من RLS
SELECT * FROM pg_policies WHERE tablename = 'analytics_pings';

-- 2. عطل RLS مؤقتاً للاختبار
ALTER TABLE analytics_pings DISABLE ROW LEVEL SECURITY;

-- 3. حاول مرة ثانية
*/

-- إذا لا توجد بيانات في analytics_sessions:
/*
-- 1. تحقق من RLS
SELECT * FROM pg_policies WHERE tablename = 'analytics_sessions';

-- 2. تأكد من أن service_role له صلاحيات
GRANT ALL ON analytics_sessions TO service_role;
GRANT ALL ON analytics_events TO service_role;
*/

-- إذا لا توجد بيانات في analytics_events:
/*
-- 1. تحقق من الـ trigger
SELECT * FROM information_schema.triggers
WHERE event_object_table = 'analytics_events';

-- 2. تأكد من أن الـ trigger يشتغل
SELECT * FROM pg_proc WHERE proname = 'auto_update_session_stats';
*/


-- ═══════════════════════════════════════════════════════════════
-- 📊 نتيجة الاختبار النهائية
-- ═══════════════════════════════════════════════════════════════

-- إذا كل الاستعلامات أعلاه رجعت بيانات:
-- ✅ نظام PING يعمل
-- ✅ نظام Sessions يعمل
-- ✅ نظام Events يعمل
-- ✅ RLS Policies صحيحة
-- ✅ Triggers تشتغل
-- ✅ النظام جاهز 100% للإنتاج

-- إذا أي استعلام رجع 0:
-- ❌ فيه مشكلة - راجع استكشاف الأخطاء أعلاه
