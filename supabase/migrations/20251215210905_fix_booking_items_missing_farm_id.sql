/*
  # إصلاح farm_id الناقص في booking_items
  
  ## المشكلة
  الـ booking_items القديمة لها farm_id = null
  مما يجعل الحجوزات غير مرتبطة بالمزارع بشكل صحيح
  
  ## الحل
  1. تحديث farm_id من خلال reservation_id
  2. إعادة حساب available_quantity بعد الإصلاح
  
  ## التأثير
  - ربط جميع الحجوزات بمزارعها الصحيحة
  - ظهور الحجوزات على البطاقات
  - حساب دقيق لنسبة الحجز
*/

-- ===========================
-- 1. تحديث farm_id الناقص في booking_items
-- ===========================

UPDATE booking_items bi
SET farm_id = r.farm_id
FROM reservations r
WHERE bi.reservation_id = r.id
  AND bi.farm_id IS NULL
  AND r.farm_id IS NOT NULL;

-- ===========================
-- 2. إعادة حساب available_quantity بعد الإصلاح
-- ===========================

DO $$
DECLARE
  variety_record RECORD;
  total_booked integer;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Re-calculating after farm_id fix...';
  RAISE NOTICE '========================================';
  
  FOR variety_record IN 
    SELECT 
      ftv.id as variety_id,
      ftv.farm_id,
      ftv.total_trees,
      ftv.variety_name,
      f.name_ar as farm_name
    FROM farm_tree_varieties ftv
    JOIN farms f ON f.id = ftv.farm_id
    WHERE ftv.deleted_at IS NULL
      AND f.deleted_at IS NULL
  LOOP
    -- حساب إجمالي الحجوزات المُعتمدة
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
    
    IF total_booked > 0 THEN
      RAISE NOTICE 'Farm: % | Variety: % | Total: % | Booked: % | Available: %', 
        variety_record.farm_name,
        variety_record.variety_name,
        variety_record.total_trees, 
        total_booked,
        variety_record.total_trees - total_booked;
    END IF;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Completed!';
  RAISE NOTICE '========================================';
END $$;
