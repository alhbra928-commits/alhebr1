/*
  # مزامنة جذرية لعدادات الحجز وإصلاح البيانات
  
  ## المشكلة
  عند حجز 1,500 شجرة، البيانات صحيحة في:
  - ✅ farm_tree_varieties.available_quantity
  - ✅ booking_items.quantity
  لكن خاطئة في:
  - ❌ farms.available_trees
  
  ## الحل الجذري
  1. تحديث trigger المزامنة ليعمل على farm_tree_varieties مباشرة
  2. إعادة حساب جميع البيانات بشكل صحيح
  3. مزامنة farms من farm_tree_varieties
  
  ## التأثير
  - ✅ عدادات دقيقة في كل الصفحات
  - ✅ مزامنة تلقائية فورية
  - ✅ لا تضارب في البيانات
*/

-- ===========================================
-- 1. تحديث trigger المزامنة على farm_tree_varieties
-- ===========================================

CREATE OR REPLACE FUNCTION sync_farms_from_varieties_direct()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_farm_id uuid;
  new_total integer;
  new_available integer;
BEGIN
  -- تحديد المزرعة المتأثرة
  IF TG_OP = 'DELETE' THEN
    affected_farm_id := OLD.farm_id;
  ELSE
    affected_farm_id := NEW.farm_id;
  END IF;
  
  -- حساب الإجمالي والمتاح من جميع الأصناف
  SELECT 
    COALESCE(SUM(total_trees), 0),
    COALESCE(SUM(available_quantity), 0)
  INTO new_total, new_available
  FROM farm_tree_varieties
  WHERE farm_id = affected_farm_id
    AND deleted_at IS NULL;
  
  -- تحديث جدول farms
  UPDATE farms
  SET 
    total_trees = new_total,
    available_trees = new_available,
    updated_at = now()
  WHERE id = affected_farm_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- تطبيق الـ Trigger على farm_tree_varieties مباشرة
DROP TRIGGER IF EXISTS trigger_sync_farms_from_varieties_direct ON farm_tree_varieties;
CREATE TRIGGER trigger_sync_farms_from_varieties_direct
  AFTER INSERT OR UPDATE OF available_quantity, total_trees OR DELETE ON farm_tree_varieties
  FOR EACH ROW
  EXECUTE FUNCTION sync_farms_from_varieties_direct();

-- ===========================================
-- 2. إعادة حساب جميع البيانات بشكل صحيح
-- ===========================================

-- مزامنة available_quantity بناءً على booking_items الحالية
DO $$
DECLARE
  variety_record RECORD;
  booked_count integer;
BEGIN
  RAISE NOTICE '🔄 بدء مزامنة available_quantity...';
  
  FOR variety_record IN 
    SELECT id, total_trees, farm_id, variety_name 
    FROM farm_tree_varieties 
    WHERE deleted_at IS NULL
  LOOP
    -- حساب الأشجار المحجوزة من booking_items
    SELECT COALESCE(SUM(bi.quantity), 0)
    INTO booked_count
    FROM booking_items bi
    JOIN reservations r ON r.id = bi.reservation_id
    WHERE bi.variety_id = variety_record.id
      AND bi.deleted_at IS NULL
      AND r.deleted_at IS NULL
      AND r.booking_status NOT IN ('rejected', 'cancelled');
    
    -- تحديث available_quantity
    UPDATE farm_tree_varieties
    SET 
      available_quantity = variety_record.total_trees - booked_count,
      updated_at = now()
    WHERE id = variety_record.id;
    
    RAISE NOTICE '✅ %: إجمالي=% محجوز=% متاح=%', 
      variety_record.variety_name,
      variety_record.total_trees,
      booked_count,
      variety_record.total_trees - booked_count;
  END LOOP;
  
  RAISE NOTICE '✅ تم إكمال مزامنة available_quantity';
END $$;

-- مزامنة farms من farm_tree_varieties
DO $$
DECLARE
  farm_record RECORD;
  new_total integer;
  new_available integer;
BEGIN
  RAISE NOTICE '🔄 بدء مزامنة farms...';
  
  FOR farm_record IN 
    SELECT id, name_ar, farm_code FROM farms WHERE deleted_at IS NULL
  LOOP
    -- حساب الإجمالي والمتاح من جميع الأصناف
    SELECT 
      COALESCE(SUM(total_trees), 0),
      COALESCE(SUM(available_quantity), 0)
    INTO new_total, new_available
    FROM farm_tree_varieties
    WHERE farm_id = farm_record.id
      AND deleted_at IS NULL;
    
    -- تحديث جدول farms
    UPDATE farms
    SET 
      total_trees = new_total,
      available_trees = new_available,
      updated_at = now()
    WHERE id = farm_record.id;
    
    RAISE NOTICE '✅ مزرعة %: إجمالي=% متاح=% محجوز=%', 
      farm_record.name_ar,
      new_total,
      new_available,
      new_total - new_available;
  END LOOP;
  
  RAISE NOTICE '✅ تم إكمال مزامنة farms';
END $$;

-- ===========================================
-- 3. التحقق من النتائج
-- ===========================================

DO $$
DECLARE
  verification_record RECORD;
BEGIN
  RAISE NOTICE '📊 ====== نتائج المزامنة ======';
  
  FOR verification_record IN
    SELECT 
      f.name_ar,
      f.total_trees,
      f.available_trees,
      f.total_trees - f.available_trees as reserved,
      (SELECT COALESCE(SUM(quantity), 0)
       FROM booking_items bi
       JOIN reservations r ON r.id = bi.reservation_id
       WHERE bi.farm_id = f.id 
       AND bi.deleted_at IS NULL
       AND r.deleted_at IS NULL
       AND r.booking_status NOT IN ('rejected', 'cancelled')) as actual_booked
    FROM farms f
    WHERE f.deleted_at IS NULL
    ORDER BY f.created_at DESC
  LOOP
    RAISE NOTICE '🏞️ %', verification_record.name_ar;
    RAISE NOTICE '   إجمالي: %', verification_record.total_trees;
    RAISE NOTICE '   متاح: %', verification_record.available_trees;
    RAISE NOTICE '   محجوز: %', verification_record.reserved;
    RAISE NOTICE '   محجوز فعلي: %', verification_record.actual_booked;
    
    IF verification_record.reserved = verification_record.actual_booked THEN
      RAISE NOTICE '   ✅ البيانات متطابقة!';
    ELSE
      RAISE NOTICE '   ⚠️ فرق: %', verification_record.reserved - verification_record.actual_booked;
    END IF;
    RAISE NOTICE '';
  END LOOP;
  
  RAISE NOTICE '============================';
END $$;
