/*
  # إصلاح خطأ UPDATE بدون WHERE في نظام الحجوزات

  ## المشكلة
  عند إنشاء حجز جديد، يظهر خطأ:
  "UPDATE requires a WHERE clause"
  
  السبب: في DO block السطر 153، UPDATE لديه WHERE لكن RLS Policy قد تمنعه

  ## الحل
  1. جعل الـ UPDATE أكثر وضوحاً مع WHERE
  2. إضافة SECURITY DEFINER للسماح بالتحديثات
  3. إعادة كتابة DO blocks بشكل أكثر أماناً
*/

-- ====================
-- 1. إعادة إنشاء وظيفة المزامنة مع تحسينات
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
-- 2. إعادة إنشاء وظيفة مزامنة المزرعة
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
-- 3. إعادة تطبيق الـ Triggers
-- ====================

DROP TRIGGER IF EXISTS trigger_sync_variety_on_booking ON booking_items;
CREATE TRIGGER trigger_sync_variety_on_booking
  AFTER INSERT OR UPDATE OF quantity OR DELETE ON booking_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_variety_availability_on_booking();

DROP TRIGGER IF EXISTS trigger_sync_farm_trees_on_booking ON booking_items;
CREATE TRIGGER trigger_sync_farm_trees_on_booking
  AFTER INSERT OR UPDATE OF quantity OR DELETE ON booking_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_farm_trees_from_varieties();

-- ====================
-- 4. تسجيل في audit_log
-- ====================

INSERT INTO audit_log (
  table_name,
  operation,
  user_id,
  new_data
) VALUES (
  'booking_items_triggers',
  'fix_update_where_clause',
  '00000000-0000-0000-0000-000000000000'::uuid,
  jsonb_build_object(
    'action', 'fixed_update_where_clause',
    'description', 'Added explicit WHERE clauses and SECURITY DEFINER',
    'timestamp', now()
  )
);
