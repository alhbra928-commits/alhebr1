/*
  # تحديثات فورية للبطاقات المالية عند الحذف
  
  1. إضافة triggers لإعادة حساب المالية عند:
    - حذف مزرعة
    - حذف مستثمر
    - حذف توثيق
    - حذف حجز
  
  2. تفعيل realtime على الجداول المهمة
    - farms
    - investors  
    - reservations
    - documentation
    - smart_farm_finances
*/

-- ==========================================
-- 1️⃣ Trigger عند حذف التوثيق
-- ==========================================

CREATE OR REPLACE FUNCTION trigger_recalc_finances_on_documentation_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- إعادة حساب المالية للمزرعة عند حذف توثيق
  IF OLD.farm_id IS NOT NULL THEN
    PERFORM recalculate_farm_finances_excluding_deleted(OLD.farm_id);
  END IF;
  
  RETURN OLD;
END;
$$;

-- حذف trigger القديم إن وجد
DROP TRIGGER IF EXISTS trigger_update_finances_on_documentation_delete ON documentation;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_update_finances_on_documentation_delete
AFTER DELETE ON documentation
FOR EACH ROW
EXECUTE FUNCTION trigger_recalc_finances_on_documentation_delete();

-- ==========================================
-- 2️⃣ Trigger عند حذف حجز
-- ==========================================

CREATE OR REPLACE FUNCTION trigger_recalc_finances_on_reservation_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- إعادة حساب المالية عند حذف حجز موثق
  IF OLD.booking_status = 'documented' AND OLD.farm_id IS NOT NULL THEN
    PERFORM recalculate_farm_finances_excluding_deleted(OLD.farm_id);
  END IF;
  
  RETURN OLD;
END;
$$;

-- حذف trigger القديم إن وجد
DROP TRIGGER IF EXISTS trigger_update_finances_on_reservation_delete ON reservations;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_update_finances_on_reservation_delete
AFTER DELETE ON reservations
FOR EACH ROW
EXECUTE FUNCTION trigger_recalc_finances_on_reservation_delete();

-- ==========================================
-- 3️⃣ Trigger عند حذف مزرعة (إعادة حساب شامل)
-- ==========================================

CREATE OR REPLACE FUNCTION trigger_cleanup_finances_on_farm_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- عند حذف مزرعة، نحذف البطاقة المالية المرتبطة soft delete
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE smart_farm_finances
    SET 
      deleted_at = NEW.deleted_at,
      deleted_by = NEW.deleted_by,
      updated_at = NOW()
    WHERE farm_id = NEW.id
      AND deleted_at IS NULL;
      
    RAISE NOTICE 'تم حذف البطاقة المالية للمزرعة %', NEW.farm_code;
  END IF;
  
  RETURN NEW;
END;
$$;

-- حذف trigger القديم إن وجد
DROP TRIGGER IF EXISTS trigger_cleanup_finances_on_farm_delete ON farms;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_cleanup_finances_on_farm_delete
AFTER UPDATE ON farms
FOR EACH ROW
WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION trigger_cleanup_finances_on_farm_delete();

-- ==========================================
-- 4️⃣ تفعيل Realtime على الجداول المهمة
-- ==========================================

-- تفعيل realtime publication على الجداول
DO $$ 
BEGIN
  -- التحقق من وجود الجداول في publication قبل إضافتها
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE farms;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table farms already in publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE investors;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table investors already in publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table reservations already in publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE documentation;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table documentation already in publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE smart_farm_finances;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table smart_farm_finances already in publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE farm_owners;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table farm_owners already in publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE farm_wallets;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table farm_wallets already in publication';
  END;
END $$;
