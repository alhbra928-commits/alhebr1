-- ═══════════════════════════════════════════════════════════════════
-- 🔧 إصلاح شريط النشاط المباشر - حل شامل وفوري
-- ═══════════════════════════════════════════════════════════════════
--
-- هذا الملف يصلح كل المشاكل المحتملة في شريط النشاط
-- نفذه في Supabase SQL Editor
--
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════════════
-- 📊 الخطوة 1: التحقق من الوضع الحالي
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '🔍 بدء التشخيص...';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;

-- عرض حالة الإعدادات
DO $$
DECLARE
    v_settings_count INT;
    v_mode TEXT;
    v_sim_enabled BOOLEAN;
    v_real_enabled BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO v_settings_count FROM activity_ticker_settings;

    IF v_settings_count > 0 THEN
        SELECT mode, simulation_enabled, real_enabled
        INTO v_mode, v_sim_enabled, v_real_enabled
        FROM activity_ticker_settings
        LIMIT 1;

        RAISE NOTICE '✅ الإعدادات: موجودة';
        RAISE NOTICE '   - الوضع: %', v_mode;
        RAISE NOTICE '   - المحاكاة: %', CASE WHEN v_sim_enabled THEN 'مفعلة' ELSE 'معطلة' END;
        RAISE NOTICE '   - الحقيقي: %', CASE WHEN v_real_enabled THEN 'مفعل' ELSE 'معطل' END;
    ELSE
        RAISE NOTICE '❌ الإعدادات: مفقودة';
    END IF;
END $$;

-- عرض حالة الأنشطة
DO $$
DECLARE
    v_real_count INT;
    v_sim_count INT;
BEGIN
    SELECT COUNT(*) INTO v_real_count FROM platform_activities WHERE is_visible = true;
    SELECT COUNT(*) INTO v_sim_count FROM simulated_activities WHERE is_active = true;

    RAISE NOTICE '';
    RAISE NOTICE '📊 الأنشطة:';
    RAISE NOTICE '   - حقيقية (مرئية): %', v_real_count;
    RAISE NOTICE '   - محاكاة (نشطة): %', v_sim_count;
    RAISE NOTICE '';
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- 🔧 الخطوة 2: إصلاح الإعدادات
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '🔧 إصلاح الإعدادات...';
END $$;

-- حذف الإعدادات القديمة وإنشاء جديدة
DELETE FROM activity_ticker_settings;

INSERT INTO activity_ticker_settings (
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
) VALUES (
    'hybrid',           -- الوضع الهجين (حقيقي + محاكاة)
    true,               -- المحاكاة مفعلة
    true,               -- الحقيقي مفعل
    'medium',           -- سرعة متوسطة
    10,                 -- 10 عناصر في الدورة
    15,                 -- تحديث كل 15 ثانية
    true,               -- عرض الأوقات
    '#1a4d2e',          -- لون الخلفية (أخضر غامق)
    '#f4e5c2',          -- لون النص (ذهبي فاتح)
    '#d4af37'           -- لون الأيقونة (ذهبي)
);

DO $$
BEGIN
    RAISE NOTICE '✅ تم إصلاح الإعدادات';
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- 🎭 الخطوة 3: إضافة أنشطة محاكاة (إذا كانت قليلة)
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
    v_sim_count INT;
BEGIN
    SELECT COUNT(*) INTO v_sim_count FROM simulated_activities WHERE is_active = true;

    RAISE NOTICE '';
    RAISE NOTICE '🎭 التحقق من الأنشطة المحاكاة...';
    RAISE NOTICE '   - العدد الحالي: %', v_sim_count;

    IF v_sim_count < 10 THEN
        RAISE NOTICE '   - إضافة أنشطة جديدة...';

        -- حذف القديمة
        DELETE FROM simulated_activities WHERE is_active = true;

        -- إضافة أنشطة جديدة
        INSERT INTO simulated_activities (template_ar, icon, weight, is_active)
        VALUES
            ('تم حجز 3 أشجار نخيل في منطقة الأحساء', '🌴', 20, true),
            ('انضم مستثمر جديد من الرياض للمنصة', '👤', 15, true),
            ('ارتفاع الطلب على أشجار الزيتون بنسبة 25%', '📈', 25, true),
            ('تم إصدار 5 شهادات تملك اليوم', '📜', 18, true),
            ('مزرعة جديدة تمت إضافتها في الخرج', '🏡', 12, true),
            ('تم توزيع أرباح بقيمة 50,000 ريال', '💰', 22, true),
            ('تسجيل 10 حجوزات جديدة خلال الساعة الأخيرة', '🎯', 16, true),
            ('افتتاح مزرعة جديدة للاستثمار', '🌟', 19, true),
            ('نجاح موسم الحصاد لمزرعة الرياض', '🎉', 14, true),
            ('تحديث أسعار الأشجار حسب السوق', '📊', 13, true),
            ('عملية شراء ناجحة لـ 20 شجرة زيتون', '🫒', 17, true),
            ('مستثمر من جدة انضم إلى منصة النخيل والزيتون', '🏙️', 11, true),
            ('تم تحديث معلومات مزرعة القصيم', '📝', 10, true),
            ('إنجاز 50 عملية تداول اليوم', '💼', 15, true),
            ('مزرعة الدمام تفتح أبوابها للحجز', '🌳', 14, true),
            ('تم التحقق من هوية 3 مستثمرين جدد', '✅', 12, true),
            ('مراجعة تقييمات المزارع المتاحة', '⭐', 11, true),
            ('إضافة مزرعة جديدة في منطقة عسير', '⛰️', 13, true),
            ('تحديث صور مزرعة الطائف', '📸', 10, true),
            ('إعلان عن عرض خاص على أشجار النخيل', '🎁', 20, true);

        RAISE NOTICE '✅ تمت إضافة 20 نشاطاً محاكاً';
    ELSE
        RAISE NOTICE '✅ الأنشطة المحاكاة كافية (%)' , v_sim_count;
    END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- 📝 الخطوة 4: إضافة نشاط يدوي للاختبار
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
    v_activity_id UUID;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📝 إضافة نشاط يدوي للاختبار...';

    -- استخدام الدالة الآمنة
    SELECT create_manual_activity(
        'system_test',
        '✅ النظام يعمل الآن بنجاح - تم الإصلاح',
        '✅ System working - Fixed',
        '✅',
        10
    ) INTO v_activity_id;

    RAISE NOTICE '✅ تم إضافة نشاط الاختبار: %', v_activity_id;
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- 📊 الخطوة 5: عرض النتائج النهائية
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '📊 النتائج النهائية:';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;

DO $$
DECLARE
    v_settings_count INT;
    v_real_count INT;
    v_sim_count INT;
    v_mode TEXT;
    v_sim_enabled BOOLEAN;
    v_real_enabled BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO v_settings_count FROM activity_ticker_settings;
    SELECT COUNT(*) INTO v_real_count FROM platform_activities WHERE is_visible = true;
    SELECT COUNT(*) INTO v_sim_count FROM simulated_activities WHERE is_active = true;

    SELECT mode, simulation_enabled, real_enabled
    INTO v_mode, v_sim_enabled, v_real_enabled
    FROM activity_ticker_settings
    LIMIT 1;

    RAISE NOTICE '';
    RAISE NOTICE '✅ الإعدادات: % صف', v_settings_count;
    RAISE NOTICE '   - الوضع: %', v_mode;
    RAISE NOTICE '   - المحاكاة: %', CASE WHEN v_sim_enabled THEN 'مفعلة ✅' ELSE 'معطلة ❌' END;
    RAISE NOTICE '   - الحقيقي: %', CASE WHEN v_real_enabled THEN 'مفعل ✅' ELSE 'معطل ❌' END;
    RAISE NOTICE '';
    RAISE NOTICE '✅ الأنشطة الحقيقية (المرئية): %', v_real_count;
    RAISE NOTICE '✅ الأنشطة المحاكاة (النشطة): %', v_sim_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 المجموع المتوقع: % نشاط في الشريط', LEAST(10, v_real_count + LEAST(v_sim_count, 5));
    RAISE NOTICE '';
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- ✅ الخطوة 6: عرض بعض الأنشطة كمثال
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '📋 أمثلة على الأنشطة:';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'الأنشطة الحقيقية:';
END $$;

DO $$
DECLARE
    activity RECORD;
    counter INT := 1;
BEGIN
    FOR activity IN
        SELECT activity_title_ar, icon
        FROM platform_activities
        WHERE is_visible = true
        ORDER BY priority DESC, created_at DESC
        LIMIT 5
    LOOP
        RAISE NOTICE '   %. % %', counter, activity.icon, activity.activity_title_ar;
        counter := counter + 1;
    END LOOP;

    IF counter = 1 THEN
        RAISE NOTICE '   (لا توجد أنشطة حقيقية)';
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'الأنشطة المحاكاة:';
END $$;

DO $$
DECLARE
    activity RECORD;
    counter INT := 1;
BEGIN
    FOR activity IN
        SELECT template_ar, icon
        FROM simulated_activities
        WHERE is_active = true
        ORDER BY weight DESC
        LIMIT 5
    LOOP
        RAISE NOTICE '   %. % %', counter, activity.icon, activity.template_ar;
        counter := counter + 1;
    END LOOP;
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- 🎉 الخطوة النهائية: رسالة النجاح
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '🎉 تم الإصلاح بنجاح!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📋 الخطوات التالية:';
    RAISE NOTICE '   1. أعد تحميل المنصة: Ctrl + Shift + R';
    RAISE NOTICE '   2. افتح Console: F12';
    RAISE NOTICE '   3. راقب الرسائل التفصيلية';
    RAISE NOTICE '   4. يجب أن ترى: "🎉 SUCCESS: Activities ready to display!"';
    RAISE NOTICE '   5. يجب أن ترى الشريط يتحرك في الأعلى';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ إذا لم يعمل:';
    RAISE NOTICE '   1. احذف Cache: Ctrl + Shift + Delete';
    RAISE NOTICE '   2. Hard Reload: Ctrl + Shift + R';
    RAISE NOTICE '   3. راجع Console لمعرفة الخطأ';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;

COMMIT;


-- ═══════════════════════════════════════════════════════════════════
-- 📊 استعلام تحقق نهائي (اختياري)
-- ═══════════════════════════════════════════════════════════════════

-- يمكنك تشغيل هذا بشكل منفصل للتحقق
/*
SELECT
    'Settings' as check_type,
    'OK' as status,
    mode as detail
FROM activity_ticker_settings
LIMIT 1

UNION ALL

SELECT
    'Real Activities',
    CASE
        WHEN COUNT(*) >= 1 THEN 'OK'
        ELSE 'NONE'
    END,
    COUNT(*)::text
FROM platform_activities
WHERE is_visible = true

UNION ALL

SELECT
    'Simulated Activities',
    CASE
        WHEN COUNT(*) >= 10 THEN 'OK'
        WHEN COUNT(*) >= 5 THEN 'LOW'
        ELSE 'NONE'
    END,
    COUNT(*)::text
FROM simulated_activities
WHERE is_active = true;
*/
