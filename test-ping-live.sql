-- ═══════════════════════════════════════════════════════════════
-- 📡 اختبار نظام PING البسيط - Simple PING Test
-- ═══════════════════════════════════════════════════════════════
-- شغّل هذه الاستعلامات بعد ما تزور الموقع من جوالك
-- Run these queries after visiting the website
-- ═══════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1️⃣ اختبار سريع (Quick Test) - هل يشتغل النظام؟
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  CASE
    WHEN COUNT(*) > 0 THEN '✅ نظام PING يشتغل! عدد الزيارات: ' || COUNT(*)
    ELSE '❌ لا توجد زيارات - النظام لا يعمل'
  END as status
FROM analytics_pings
WHERE created_at >= NOW() - INTERVAL '10 minutes';

-- إذا النتيجة: ✅ نظام PING يشتغل!
-- يعني النظام شغال صح - كمّل باقي الاستعلامات


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2️⃣ آخر 20 PING (Last 20 Pings)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  id,
  created_at::timestamp(0) as time,
  path,
  COALESCE(referrer, 'Direct') as referrer,
  COALESCE(utm_source, 'Direct') as source,
  COALESCE(utm_medium, '-') as medium,
  device_type,
  CASE
    WHEN device_type = 'mobile' THEN '📱'
    WHEN device_type = 'tablet' THEN '📱'
    WHEN device_type = 'desktop' THEN '💻'
    ELSE '🖥️'
  END as icon
FROM analytics_pings
ORDER BY created_at DESC
LIMIT 20;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3️⃣ عدد الزيارات حسب المصدر (Sources Breakdown)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  COALESCE(utm_source, 'Direct') as source,
  COUNT(*) as visits_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage,
  CASE
    WHEN utm_source IS NULL THEN '🔗 زيارة مباشرة'
    WHEN utm_source = 'google' THEN '🔍 Google'
    WHEN utm_source = 'whatsapp' THEN '💬 WhatsApp'
    WHEN utm_source = 'tiktok' THEN '🎵 TikTok'
    WHEN utm_source = 'facebook' THEN '👥 Facebook'
    WHEN utm_source = 'instagram' THEN '📸 Instagram'
    WHEN utm_source = 'twitter' THEN '🐦 Twitter'
    ELSE '📢 ' || utm_source
  END as source_label
FROM analytics_pings
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY utm_source
ORDER BY visits_count DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4️⃣ عدد الزيارات حسب الجهاز (Device Breakdown)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  device_type,
  COUNT(*) as visits_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage,
  CASE
    WHEN device_type = 'mobile' THEN '📱 جوال'
    WHEN device_type = 'tablet' THEN '📱 تابلت'
    WHEN device_type = 'desktop' THEN '💻 كمبيوتر'
    ELSE '🖥️ غير معروف'
  END as device_label
FROM analytics_pings
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY device_type
ORDER BY visits_count DESC;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5️⃣ الصفحات الأكثر زيارة (Most Visited Pages)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  path,
  COUNT(*) as visits_count,
  CASE
    WHEN path = '/' THEN '🏠 الصفحة الرئيسية'
    WHEN path LIKE '/farm/%' THEN '🌾 صفحة مزرعة'
    WHEN path LIKE '/booking%' THEN '🎫 صفحة حجز'
    WHEN path LIKE '/investor%' THEN '💼 صفحة مستثمر'
    ELSE '📄 ' || path
  END as page_label
FROM analytics_pings
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY path
ORDER BY visits_count DESC
LIMIT 10;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6️⃣ إحصائيات شاملة (Overall Stats)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  COUNT(*) as total_pings,
  COUNT(DISTINCT DATE(created_at)) as days_active,
  ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/3600), 1) as avg_age_hours,
  MIN(created_at)::timestamp(0) as first_ping,
  MAX(created_at)::timestamp(0) as last_ping,
  COUNT(DISTINCT utm_source) as unique_sources,
  COUNT(DISTINCT device_type) as unique_devices
FROM analytics_pings;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7️⃣ نشاط آخر ساعة (Last Hour Activity)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  EXTRACT(MINUTE FROM created_at) as minute,
  COUNT(*) as pings_count
FROM analytics_pings
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY EXTRACT(MINUTE FROM created_at)
ORDER BY minute DESC
LIMIT 10;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8️⃣ تفاصيل أحدث ping (Latest Ping Details)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT
  id,
  created_at::timestamp(0) as time,
  path,
  referrer,
  utm_source,
  utm_medium,
  utm_campaign,
  device_type,
  LEFT(user_agent, 100) as user_agent_preview
FROM analytics_pings
ORDER BY created_at DESC
LIMIT 1;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 9️⃣ مسح البيانات التجريبية (Clear Test Data) - اختياري
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ⚠️ لا تشغّل هذا إلا إذا تبي تمسح بيانات الاختبار

-- DELETE FROM analytics_pings
-- WHERE created_at >= NOW() - INTERVAL '10 minutes';


-- ═══════════════════════════════════════════════════════════════
-- ✅ النتائج المتوقعة (Expected Results)
-- ═══════════════════════════════════════════════════════════════
--
-- 1. اختبار سريع:
--    ✅ نظام PING يشتغل! عدد الزيارات: 1
--
-- 2. آخر 20 PING:
--    يفترض تلاقي سجل واحد على الأقل مع:
--    - time: الوقت الحالي
--    - path: /
--    - referrer: Direct (أو المصدر اللي جيت منه)
--    - source: Direct (أو utm_source اللي حطيته)
--    - device_type: mobile أو desktop
--
-- 3. عدد الزيارات حسب المصدر:
--    Direct: 1 (100%)
--
-- 4. عدد الزيارات حسب الجهاز:
--    mobile أو desktop: 1 (100%)
--
-- ═══════════════════════════════════════════════════════════════
-- ❌ إذا كل الاستعلامات ترجع 0 نتائج
-- ═══════════════════════════════════════════════════════════════
--
-- يعني النظام ما يشتغل - تحقق من:
--
-- 1. رفعت الإصدار الجديد؟ (v20251219_1766177487687)
-- 2. مسحت كاش المتصفح؟ (Ctrl+Shift+R)
-- 3. شوفت Console - فيه أخطاء؟
-- 4. شوفت الشارة (Debug Badge) - تقول SENT أو FAILED؟
-- 5. شوفت Network Tab - الـ request يوصل لـ Supabase؟
--
-- إذا الشارة تقول SENT ✅ لكن ما في بيانات في DB:
-- - ممكن مشكلة في RLS Policies
-- - شغّل: SELECT * FROM analytics_pings; كـ admin
--
-- ═══════════════════════════════════════════════════════════════
