/*
  # إصلاح حذف البطاقة المالية عند حذف المزرعة
  
  1. تصحيح الـ Trigger ليحذف من farm_finance بدلاً من smart_farm_finances
  2. ضمان الحذف الفوري للبطاقة المالية عند حذف المزرعة
  3. تفعيل realtime على جدول farm_finance
*/

-- ==========================================
-- 1️⃣ تصحيح Trigger عند حذف مزرعة
-- ==========================================

CREATE OR REPLACE FUNCTION trigger_cleanup_finances_on_farm_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- عند حذف مزرعة (soft delete)، نحذف البطاقة المالية المرتبطة
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    
    -- حذف من farm_finance (الجدول الصحيح)
    UPDATE farm_finance
    SET 
      deleted_at = NEW.deleted_at,
      deleted_by = NEW.deleted_by,
      updated_at = NOW()
    WHERE farm_id = NEW.id
      AND deleted_at IS NULL;
      
    RAISE NOTICE '✅ تم حذف البطاقة المالية للمزرعة: % (ID: %)', NEW.name_ar, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- حذف وإعادة إنشاء الـ trigger
DROP TRIGGER IF EXISTS trigger_cleanup_finances_on_farm_delete ON farms;

CREATE TRIGGER trigger_cleanup_finances_on_farm_delete
AFTER UPDATE ON farms
FOR EACH ROW
WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION trigger_cleanup_finances_on_farm_delete();

-- ==========================================
-- 2️⃣ التأكد من تفعيل Realtime
-- ==========================================

-- تفعيل realtime على farm_finance
DO $$ 
BEGIN
  -- محاولة إضافة farm_finance للـ publication
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE farm_finance;
  EXCEPTION 
    WHEN duplicate_object THEN
      RAISE NOTICE 'farm_finance already in supabase_realtime publication';
  END;
END $$;

-- رسالة نجاح
DO $$
BEGIN
  RAISE NOTICE '✅ اكتمل تطبيق: حذف البطاقة المالية مع حذف المزرعة';
  RAISE NOTICE '🔗 الآن عند حذف مزرعة → تحذف بطاقتها المالية فوراً';
  RAISE NOTICE '📊 الجدول المستخدم: farm_finance';
  RAISE NOTICE '⚡ Realtime مفعل على farm_finance';
END $$;
