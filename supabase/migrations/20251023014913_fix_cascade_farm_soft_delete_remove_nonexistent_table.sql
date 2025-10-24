/*
  # إصلاح Cascade Farm Soft Delete
  
  المشكلة:
  - الـ trigger يحاول تحديث جدول owner_payment_tracking الذي لا يوجد
  - هذا يمنع حذف المزارع من لوحة التحكم
  
  الحل:
  - إزالة كل الإشارات لجدول owner_payment_tracking
  - الإبقاء على حذف smart_farm_finances و farm_financial_transactions فقط
*/

-- ==========================================
-- 1️⃣ إعادة بناء دالة Cascade Soft Delete بدون owner_payment_tracking
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
    
    RAISE NOTICE 'تم استعادة البطاقات المالية للمزرعة %', NEW.farm_code;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ==========================================
-- 2️⃣ تسجيل في سجل الأحداث
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ تم إصلاح Cascade Soft Delete (إزالة owner_payment_tracking)';
  RAISE NOTICE '   - عند حذف مزرعة: تُحذف smart_farm_finances و farm_financial_transactions';
  RAISE NOTICE '   - عند استعادة مزرعة: تُستعاد البطاقات المالية تلقائياً';
END $$;
