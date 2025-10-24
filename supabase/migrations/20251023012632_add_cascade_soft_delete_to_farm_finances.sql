/*
  # إضافة Cascade Soft Delete للبطاقات المالية
  
  عند حذف مزرعة من إدارة المزارع (soft delete):
  - يتم حذف البطاقة المالية المرتبطة تلقائياً
  - يتم حذف جميع المعاملات المالية المرتبطة
  - يتم حذف سجلات دفع أصحاب المزارع
  - الحذف يكون soft delete (قابل للاستعادة)
*/

-- ==========================================
-- 1️⃣ دالة Cascade Soft Delete
-- ==========================================

CREATE OR REPLACE FUNCTION cascade_farm_soft_delete()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- عند وضع deleted_at للمزرعة، نحذف البطاقات المالية المرتبطة
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    
    -- حذف البطاقة المالية
    UPDATE smart_farm_finances
    SET 
      deleted_at = NEW.deleted_at,
      deleted_by = NEW.deleted_by,
      updated_at = now()
    WHERE farm_id = NEW.id
    AND deleted_at IS NULL;
    
    -- حذف معاملات المنصة المالية
    UPDATE farm_financial_transactions
    SET 
      deleted_at = NEW.deleted_at,
      deleted_by = NEW.deleted_by
    WHERE farm_code = NEW.farm_code
    AND deleted_at IS NULL;
    
    -- حذف سجلات دفع أصحاب المزارع
    UPDATE owner_payment_tracking
    SET 
      deleted_at = NEW.deleted_at,
      deleted_by = NEW.deleted_by
    WHERE farm_code = NEW.farm_code
    AND deleted_at IS NULL;
    
    RAISE NOTICE 'تم حذف البطاقات المالية للمزرعة %', NEW.farm_code;
  END IF;
  
  -- عند استعادة المزرعة، نستعيد البطاقات المالية
  IF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
    
    UPDATE smart_farm_finances
    SET 
      deleted_at = NULL,
      deleted_by = NULL,
      updated_at = now()
    WHERE farm_id = NEW.id
    AND deleted_at IS NOT NULL;
    
    UPDATE farm_financial_transactions
    SET 
      deleted_at = NULL,
      deleted_by = NULL
    WHERE farm_code = NEW.farm_code
    AND deleted_at IS NOT NULL;
    
    UPDATE owner_payment_tracking
    SET 
      deleted_at = NULL,
      deleted_by = NULL
    WHERE farm_code = NEW.farm_code
    AND deleted_at IS NOT NULL;
    
    RAISE NOTICE 'تم استعادة البطاقات المالية للمزرعة %', NEW.farm_code;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ==========================================
-- 2️⃣ Trigger على جدول farms
-- ==========================================

DROP TRIGGER IF EXISTS trigger_cascade_farm_soft_delete ON farms;

CREATE TRIGGER trigger_cascade_farm_soft_delete
  AFTER UPDATE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION cascade_farm_soft_delete();

-- ==========================================
-- 3️⃣ تسجيل في سجل الأحداث
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ تم تفعيل Cascade Soft Delete للبطاقات المالية';
  RAISE NOTICE '   - عند حذف مزرعة، تُحذف بطاقاتها المالية تلقائياً';
  RAISE NOTICE '   - عند استعادة مزرعة، تُستعاد بطاقاتها المالية تلقائياً';
END $$;

-- ==========================================
-- 4️⃣ Comments
-- ==========================================

COMMENT ON FUNCTION cascade_farm_soft_delete() IS 'دالة تقوم بحذف/استعادة البطاقات المالية عند حذف/استعادة المزرعة';
COMMENT ON TRIGGER trigger_cascade_farm_soft_delete ON farms IS 'تفعيل الحذف التلقائي للبطاقات المالية عند حذف المزرعة';
