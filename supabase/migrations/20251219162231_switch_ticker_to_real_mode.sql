/*
  # تفعيل الشريط المتحرك ليعرض بيانات حقيقية فقط

  1. Changes:
    - تحديث إعدادات الشريط لتكون في وضع 'real' فقط
    - تحديث السرعة إلى 'fast' لعرض أسرع
    - زيادة عدد العناصر لكل دورة
    - تفعيل البيانات الحقيقية وتعطيل المحاكاة

  2. Security:
    - لا يوجد تغييرات أمنية
*/

-- ==================================================
-- 1. تحديث إعدادات الشريط للوضع الحقيقي
-- ==================================================

UPDATE activity_ticker_settings
SET
  mode = 'real',
  real_enabled = true,
  simulation_enabled = false,
  scroll_speed = 'fast',
  items_per_cycle = 15,
  updated_at = now()
WHERE id IS NOT NULL;

-- ==================================================
-- 2. إذا لم يكن هناك إعدادات، أنشئها
-- ==================================================

INSERT INTO activity_ticker_settings (
  mode,
  real_enabled,
  simulation_enabled,
  scroll_speed,
  items_per_cycle,
  show_timestamps
)
SELECT
  'real',
  true,
  false,
  'fast',
  15,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM activity_ticker_settings LIMIT 1
);

-- ==================================================
-- 3. تعطيل الأنشطة التجريبية
-- ==================================================

UPDATE simulated_activities
SET is_active = false
WHERE is_active = true;

-- ==================================================
-- 4. التحقق والإحصائيات
-- ==================================================

DO $$
DECLARE
  v_count integer;
  v_booking_count integer;
  v_farm_count integer;
BEGIN
  -- عد الأنشطة الحقيقية
  SELECT COUNT(*) INTO v_count
  FROM platform_activities
  WHERE deleted_at IS NULL;

  -- عد الحجوزات
  SELECT COUNT(*) INTO v_booking_count
  FROM reservations
  WHERE deleted_at IS NULL;

  -- عد المزارع النشطة
  SELECT COUNT(*) INTO v_farm_count
  FROM farms
  WHERE deleted_at IS NULL AND status = 'active';

  RAISE NOTICE '✅ إحصائيات النظام:';
  RAISE NOTICE '📊 عدد الأنشطة الحقيقية: %', v_count;
  RAISE NOTICE '📋 عدد الحجوزات: %', v_booking_count;
  RAISE NOTICE '🏡 عدد المزارع النشطة: %', v_farm_count;

  IF v_count = 0 THEN
    RAISE NOTICE '⚠️  لا توجد أنشطة حقيقية حالياً';
    RAISE NOTICE '💡 عند إضافة حجز جديد، سيظهر تلقائياً في الشريط';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ تم تفعيل الشريط المتحرك للبيانات الحقيقية بنجاح!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 الوضع: real (بيانات حقيقية فقط)';
  RAISE NOTICE '⚡ السرعة: fast (12 ثانية)';
  RAISE NOTICE '🔢 العناصر لكل دورة: 15';
  RAISE NOTICE '🎯 المصادر: حجوزات + مزارع جديدة + موافقات';
  RAISE NOTICE '🔄 التحديث: فوري عند أي نشاط جديد';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
