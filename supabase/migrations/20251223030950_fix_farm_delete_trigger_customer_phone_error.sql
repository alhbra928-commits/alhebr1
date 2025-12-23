/*
  # إصلاح خطأ customer_phone في دالة حذف المزرعة

  ## المشكلة
  - دالة trigger_cleanup_finances_on_farm_delete تحاول الوصول لعمود customer_phone في جدول investors
  - جدول investors يحتوي على عمود phone وليس customer_phone
  - هذا يسبب خطأ: column "customer_phone" does not exist

  ## الحل
  - تعديل الدالة لاستخدام investors.phone بدلاً من investors.customer_phone
  - المطابقة مع reservations.customer_phone تبقى كما هي
*/

-- إعادة إنشاء الدالة بشكل صحيح
CREATE OR REPLACE FUNCTION trigger_cleanup_finances_on_farm_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- عند حذف مزرعة (soft delete)
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    
    -- 1. حذف البطاقات المالية من farm_finance
    UPDATE farm_finance
    SET 
      deleted_at = NEW.deleted_at,
      updated_at = NOW()
    WHERE farm_id = NEW.id
      AND deleted_at IS NULL;
    
    -- 2. حذف البطاقات المالية من smart_farm_finances
    UPDATE smart_farm_finances
    SET 
      deleted_at = NEW.deleted_at,
      deleted_by = NEW.deleted_by,
      updated_at = NOW()
    WHERE farm_id = NEW.id
      AND deleted_at IS NULL;
    
    -- 3. حذف جميع الحجوزات للمزرعة
    UPDATE reservations
    SET 
      deleted_at = NEW.deleted_at,
      updated_at = NOW()
    WHERE farm_id = NEW.id
      AND deleted_at IS NULL;
    
    -- 4. حذف المستثمرين المرتبطين بالحجوزات المحذوفة
    -- ✅ تم إصلاح: استخدام investors.phone بدلاً من investors.customer_phone
    UPDATE investors
    SET 
      deleted_at = NEW.deleted_at,
      updated_at = NOW()
    WHERE phone IN (
      SELECT customer_phone 
      FROM reservations 
      WHERE farm_id = NEW.id 
        AND deleted_at = NEW.deleted_at
    )
    AND deleted_at IS NULL;
      
    RAISE NOTICE '✅ تم حذف المزرعة وجميع بياناتها: % (ID: %)', NEW.name_ar, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- التحقق من أن الـ trigger موجود (لا حاجة لإعادة إنشائه)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_cleanup_finances_on_farm_delete'
  ) THEN
    CREATE TRIGGER trigger_cleanup_finances_on_farm_delete
    AFTER UPDATE ON farms
    FOR EACH ROW
    WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
    EXECUTE FUNCTION trigger_cleanup_finances_on_farm_delete();
  END IF;
END $$;
