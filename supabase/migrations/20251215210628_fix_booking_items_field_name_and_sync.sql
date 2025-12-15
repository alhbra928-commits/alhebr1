/*
  # إصلاح حقل booking_items وإعادة المزامنة

  ## المشكلة
  1. كان الكود يستخدم tree_count بدلاً من quantity
  2. بعض الحجوزات لم تُخصم من available_quantity بشكل صحيح
  3. البطاقات لا تعرض الحجوزات المحدثة

  ## الحل
  1. التأكد من أن جميع triggers تعمل بشكل صحيح
  2. إعادة حساب available_quantity لجميع farm_tree_varieties
  3. تحديث البيانات المعروضة في البطاقات

  ## التأثير
  - عرض دقيق للحجوزات على بطاقات المزارع
  - تحديث فوري عند إنشاء حجز جديد
  - حسابات صحيحة لنسبة الحجز
*/

-- ===========================
-- 1. التأكد من تفعيل جميع الـ triggers
-- ===========================

-- تفعيل trigger مزامنة available_quantity
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_sync_variety_on_booking'
    AND tgenabled = 'D'
  ) THEN
    ALTER TABLE booking_items ENABLE TRIGGER trigger_sync_variety_on_booking;
    RAISE NOTICE 'Trigger trigger_sync_variety_on_booking enabled';
  END IF;
END $$;

-- ===========================
-- 2. إعادة حساب available_quantity لجميع الـ varieties
-- ===========================

DO $$
DECLARE
  variety_record RECORD;
  total_booked integer;
BEGIN
  -- لكل variety في farm_tree_varieties
  FOR variety_record IN 
    SELECT 
      ftv.id as variety_id,
      ftv.farm_id,
      ftv.total_trees,
      ftv.variety_name
    FROM farm_tree_varieties ftv
    WHERE ftv.deleted_at IS NULL
  LOOP
    -- حساب إجمالي الحجوزات المُعتمدة لهذا الصنف
    SELECT COALESCE(SUM(bi.quantity), 0)
    INTO total_booked
    FROM booking_items bi
    JOIN reservations r ON r.id = bi.reservation_id
    WHERE bi.variety_id = variety_record.variety_id
      AND bi.deleted_at IS NULL
      AND r.deleted_at IS NULL
      AND r.booking_status IN ('temporary', 'pending', 'approved', 'documented');
      
    -- تحديث available_quantity
    UPDATE farm_tree_varieties
    SET 
      available_quantity = variety_record.total_trees - total_booked,
      updated_at = now()
    WHERE id = variety_record.variety_id;
    
    RAISE NOTICE 'Updated variety %: total=%, booked=%, available=%', 
      variety_record.variety_name,
      variety_record.total_trees, 
      total_booked,
      variety_record.total_trees - total_booked;
  END LOOP;
END $$;

-- ===========================
-- 3. التحقق من النتائج
-- ===========================

DO $$
DECLARE
  result_record RECORD;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Current farm_tree_varieties status:';
  RAISE NOTICE '========================================';
  
  FOR result_record IN
    SELECT 
      f.name_ar,
      ftv.variety_name,
      ftv.total_trees,
      ftv.available_quantity,
      (ftv.total_trees - ftv.available_quantity) as booked,
      CASE 
        WHEN ftv.total_trees > 0 
        THEN ROUND(((ftv.total_trees - ftv.available_quantity)::numeric / ftv.total_trees::numeric) * 100, 0)
        ELSE 0 
      END as booking_percentage
    FROM farm_tree_varieties ftv
    JOIN farms f ON f.id = ftv.farm_id
    WHERE ftv.deleted_at IS NULL
      AND f.deleted_at IS NULL
    ORDER BY f.created_at DESC
    LIMIT 5
  LOOP
    RAISE NOTICE '% - %: Total=%, Available=%, Booked=%, Progress=%%%',
      result_record.name_ar,
      result_record.variety_name,
      result_record.total_trees,
      result_record.available_quantity,
      result_record.booked,
      result_record.booking_percentage;
  END LOOP;
END $$;
