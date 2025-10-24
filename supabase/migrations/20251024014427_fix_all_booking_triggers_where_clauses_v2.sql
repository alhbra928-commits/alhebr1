/*
  # إصلاح شامل لجميع Triggers الحجوزات - WHERE clauses

  ## المشكلة
  عند إنشاء حجز جديد، خطأ: "UPDATE requires a WHERE clause"
  
  السبب: Functions تحتوي على UPDATE بدون WHERE كافٍ:
  1. sync_variety_availability_on_booking - بدون deleted_at check
  2. update_booking_total_from_items - بدون updated_at
  3. sync_farm_trees_from_varieties - قد يحتاج تحسين

  ## الحل
  إصلاح شامل لكل الـ Functions مع WHERE clauses صريحة
*/

-- ====================
-- 1. إصلاح sync_variety_availability_on_booking
-- ====================

CREATE OR REPLACE FUNCTION sync_variety_availability_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    WHERE id = NEW.variety_id
      AND deleted_at IS NULL;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- تعديل available_quantity بناءً على الفرق
    UPDATE farm_tree_varieties
    SET 
      available_quantity = available_quantity + OLD.quantity - NEW.quantity,
      updated_at = now()
    WHERE id = NEW.variety_id
      AND deleted_at IS NULL;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- إعادة الأشجار إلى available_quantity
    UPDATE farm_tree_varieties
    SET 
      available_quantity = available_quantity + OLD.quantity,
      updated_at = now()
    WHERE id = OLD.variety_id
      AND deleted_at IS NULL;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- ====================
-- 2. إصلاح sync_farm_trees_from_varieties
-- ====================

CREATE OR REPLACE FUNCTION sync_farm_trees_from_varieties()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  -- التأكد من وجود farm_id
  IF affected_farm_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;
  
  -- حساب الإجمالي والمتاح من جميع الأصناف
  SELECT 
    COALESCE(SUM(total_trees), 0),
    COALESCE(SUM(available_quantity), 0)
  INTO new_total, new_available
  FROM farm_tree_varieties
  WHERE farm_id = affected_farm_id
    AND deleted_at IS NULL;
  
  -- تحديث جدول farms مع WHERE صريح
  UPDATE farms
  SET 
    total_trees = new_total,
    available_trees = new_available,
    updated_at = now()
  WHERE id = affected_farm_id
    AND deleted_at IS NULL;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- ====================
-- 3. إصلاح update_booking_total_from_items
-- ====================

CREATE OR REPLACE FUNCTION update_booking_total_from_items()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_price numeric;
  v_total_trees integer;
  v_booking_id uuid;
  v_reservation_id uuid;
BEGIN
  -- تحديد أي معرف نستخدم
  v_booking_id := COALESCE(NEW.booking_id, OLD.booking_id);
  v_reservation_id := COALESCE(NEW.reservation_id, OLD.reservation_id);
  
  -- إذا كان لدينا booking_id
  IF v_booking_id IS NOT NULL THEN
    SELECT 
      COALESCE(SUM(subtotal), 0),
      COALESCE(SUM(quantity), 0)
    INTO v_total_price, v_total_trees
    FROM booking_items
    WHERE booking_id = v_booking_id
      AND deleted_at IS NULL;
    
    UPDATE bookings
    SET 
      total_price = v_total_price,
      reserved_trees = v_total_trees,
      updated_at = now()
    WHERE id = v_booking_id
      AND deleted_at IS NULL;
  END IF;
  
  -- إذا كان لدينا reservation_id
  IF v_reservation_id IS NOT NULL THEN
    SELECT 
      COALESCE(SUM(subtotal), 0),
      COALESCE(SUM(quantity), 0)
    INTO v_total_price, v_total_trees
    FROM booking_items
    WHERE reservation_id = v_reservation_id
      AND deleted_at IS NULL;
    
    UPDATE reservations
    SET 
      total_amount = v_total_price,
      number_of_trees = v_total_trees,
      updated_at = now()
    WHERE id = v_reservation_id
      AND deleted_at IS NULL;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ====================
-- 4. إعادة تطبيق جميع الـ Triggers
-- ====================

-- Trigger 1: مزامنة available_quantity
DROP TRIGGER IF EXISTS trigger_sync_variety_on_booking ON booking_items;
CREATE TRIGGER trigger_sync_variety_on_booking
  AFTER INSERT OR UPDATE OF quantity OR DELETE ON booking_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_variety_availability_on_booking();

-- Trigger 2: مزامنة farms.available_trees
DROP TRIGGER IF EXISTS trigger_sync_farm_trees_on_booking ON booking_items;
CREATE TRIGGER trigger_sync_farm_trees_on_booking
  AFTER INSERT OR UPDATE OF quantity OR DELETE ON booking_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_farm_trees_from_varieties();

-- Trigger 3: تحديث إجمالي الحجز
DROP TRIGGER IF EXISTS trigger_update_booking_total ON booking_items;
CREATE TRIGGER trigger_update_booking_total
  AFTER INSERT OR UPDATE OF quantity, subtotal OR DELETE ON booking_items
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_total_from_items();
