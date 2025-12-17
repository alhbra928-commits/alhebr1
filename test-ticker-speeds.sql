-- ========================================
-- اختبار سرعات الشريط المختلفة
-- ========================================

-- عرض الإعدادات الحالية
SELECT
    scroll_speed as "السرعة الحالية",
    items_per_cycle as "عدد العناصر",
    show_timestamps as "إظهار الوقت",
    mode as "الوضع"
FROM activity_ticker_settings
LIMIT 1;

-- ========================================
-- تغيير السرعة
-- ========================================

-- سرعة بطيئة (هادئة)
UPDATE activity_ticker_settings
SET scroll_speed = 'slow'
WHERE id = (SELECT id FROM activity_ticker_settings LIMIT 1);

-- سرعة متوسطة (عادية)
UPDATE activity_ticker_settings
SET scroll_speed = 'medium'
WHERE id = (SELECT id FROM activity_ticker_settings LIMIT 1);

-- سرعة سريعة (نشطة)
UPDATE activity_ticker_settings
SET scroll_speed = 'fast'
WHERE id = (SELECT id FROM activity_ticker_settings LIMIT 1);

-- ========================================
-- تغيير عدد العناصر
-- ========================================

-- عناصر قليلة (5)
UPDATE activity_ticker_settings
SET items_per_cycle = 5
WHERE id = (SELECT id FROM activity_ticker_settings LIMIT 1);

-- عناصر متوسطة (10)
UPDATE activity_ticker_settings
SET items_per_cycle = 10
WHERE id = (SELECT id FROM activity_ticker_settings LIMIT 1);

-- عناصر كثيرة (15)
UPDATE activity_ticker_settings
SET items_per_cycle = 15
WHERE id = (SELECT id FROM activity_ticker_settings LIMIT 1);

-- ========================================
-- تغيير الوضع
-- ========================================

-- وضع المحاكاة فقط
UPDATE activity_ticker_settings
SET mode = 'simulation'
WHERE id = (SELECT id FROM activity_ticker_settings LIMIT 1);

-- وضع البيانات الحقيقية فقط
UPDATE activity_ticker_settings
SET mode = 'real'
WHERE id = (SELECT id FROM activity_ticker_settings LIMIT 1);

-- وضع مختلط (موصى به)
UPDATE activity_ticker_settings
SET mode = 'hybrid'
WHERE id = (SELECT id FROM activity_ticker_settings LIMIT 1);

-- ========================================
-- إعدادات مثالية موصى بها
-- ========================================

UPDATE activity_ticker_settings
SET
    scroll_speed = 'medium',
    items_per_cycle = 10,
    mode = 'hybrid',
    show_timestamps = true
WHERE id = (SELECT id FROM activity_ticker_settings LIMIT 1);

-- ========================================
-- التحقق من عدد الأنشطة
-- ========================================

-- عدد الأنشطة الحقيقية
SELECT COUNT(*) as "الأنشطة الحقيقية"
FROM platform_activities
WHERE is_visible = true;

-- عدد الأنشطة المحاكاة
SELECT COUNT(*) as "الأنشطة المحاكاة"
FROM simulated_activities
WHERE is_active = true;

-- ========================================
-- عرض آخر 10 أنشطة
-- ========================================

SELECT
    icon as "الأيقونة",
    activity_title_ar as "العنوان",
    activity_type as "النوع",
    priority as "الأولوية",
    timestamp as "الوقت"
FROM platform_activities
WHERE is_visible = true
ORDER BY priority DESC, timestamp DESC
LIMIT 10;

-- ========================================
-- إضافة نشاط اختباري (مثال)
-- ========================================

INSERT INTO platform_activities (
    icon,
    activity_title_ar,
    activity_title_en,
    activity_type,
    priority,
    is_visible
) VALUES (
    '🎉',
    'تم اختبار السرعة الجديدة بنجاح!',
    'Speed test successful!',
    'milestone',
    10,
    true
);

-- ========================================
-- حذف الأنشطة القديمة (احتياطي)
-- ========================================

-- حذف الأنشطة الأقدم من 30 يوم
-- DELETE FROM platform_activities
-- WHERE timestamp < NOW() - INTERVAL '30 days'
-- AND is_visible = true;

-- ========================================
-- ملاحظات مهمة
-- ========================================

/*
السرعات الجديدة:
- slow:   80ms interval + 0.5px/frame = هادئ
- medium: 50ms interval + 1.0px/frame = عادي
- fast:   30ms interval + 1.5px/frame = نشط

التجاوب:
- التغيير يحدث فوراً بدون reload
- يعمل في الوقت الفعلي
- لا حاجة لتحديث الصفحة

الأداء:
- 60fps مستقر
- حلقة سلسة بدون فراغات
- تحسين كامل للجوال
*/
