/*
  # نظام مزامنة الحجوزات مع الأصناف المتاحة

  ## المشكلة
  عند حجز أشجار عبر booking_items، لا يتم تحديث:
  1. available_quantity في farm_tree_varieties
  2. available_trees و total_trees في farms

  ## الحل
  إنشاء triggers لمزامنة تلقائية عند:
  - إضافة booking_item جديد → خصم من available_quantity
  - حذف booking_item → إعادة إلى available_quantity
  - تحديث quantity في booking_item → تعديل available_quantity

  ## التأثير
  - تحديث فوري للأشجار المتاحة
  - حساب دقيق للنسبة المئوية
  - تحديث تلقائي لحالة المبيعات
*/

-- ====================
-- 1. وظيفة تحديث available_quantity عند الحجز
-- ====================

CREATE OR REPLACE FUNCTION sync_variety_availability_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  variety_trees_count integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- خصم الأشجار المحجوزة من available_quantity
    UPDATE farm_tree_varieties
    SET 
      available_quantity = available_quantity - NEW.quantity,
      updated_at = now()
    WHERE id = NEW.variety_id;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- تعديل available_quantity بناءً على الفرق
    UPDATE farm_tree_varieties
    SET 
      available_quantity = available_quantity + OLD.quantity - NEW.quantity,
      updated_at = now()
    WHERE id = NEW.variety_id;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- إعادة الأشجار إلى available_quantity
    UPDATE farm_tree_varieties
    SET 
      available_quantity = available_quantity + OLD.quantity,
      updated_at = now()
    WHERE id = OLD.variety_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- تطبيق الـ Trigger على booking_items
DROP TRIGGER IF EXISTS trigger_sync_variety_on_booking ON booking_items;
CREATE TRIGGER trigger_sync_variety_on_booking
  AFTER INSERT OR UPDATE OF quantity OR DELETE ON booking_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_variety_availability_on_booking();

-- ====================
-- 2. وظيفة تحديث available_trees و total_trees في farms
-- ====================

CREATE OR REPLACE FUNCTION sync_farm_trees_from_varieties()
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
    SELECT farm_id INTO affected_farm_id
    FROM farm_tree_varieties
    WHERE id = OLD.variety_id;
  ELSE
    SELECT farm_id INTO affected_farm_id
    FROM farm_tree_varieties
    WHERE id = NEW.variety_id;
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

-- تطبيق الـ Trigger على booking_items
DROP TRIGGER IF EXISTS trigger_sync_farm_trees_on_booking ON booking_items;
CREATE TRIGGER trigger_sync_farm_trees_on_booking
  AFTER INSERT OR UPDATE OF quantity OR DELETE ON booking_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_farm_trees_from_varieties();

-- ====================
-- 3. إصلاح البيانات الحالية
-- ====================

-- مزامنة available_quantity بناءً على الحجوزات الموجودة
DO $$
DECLARE
  variety_record RECORD;
  booked_count integer;
BEGIN
  FOR variety_record IN 
    SELECT id, total_trees, farm_id FROM farm_tree_varieties WHERE deleted_at IS NULL
  LOOP
    -- حساب الأشجار المحجوزة
    SELECT COALESCE(SUM(quantity), 0)
    INTO booked_count
    FROM booking_items
    WHERE variety_id = variety_record.id
      AND deleted_at IS NULL;
    
    -- تحديث available_quantity
    UPDATE farm_tree_varieties
    SET available_quantity = variety_record.total_trees - booked_count
    WHERE id = variety_record.id;
  END LOOP;
END $$;

-- مزامنة farms.available_trees و farms.total_trees
DO $$
DECLARE
  farm_record RECORD;
  new_total integer;
  new_available integer;
BEGIN
  FOR farm_record IN 
    SELECT id FROM farms WHERE deleted_at IS NULL
  LOOP
    SELECT 
      COALESCE(SUM(total_trees), 0),
      COALESCE(SUM(available_quantity), 0)
    INTO new_total, new_available
    FROM farm_tree_varieties
    WHERE farm_id = farm_record.id
      AND deleted_at IS NULL;
    
    UPDATE farms
    SET 
      total_trees = new_total,
      available_trees = new_available
    WHERE id = farm_record.id;
  END LOOP;
END $$;
