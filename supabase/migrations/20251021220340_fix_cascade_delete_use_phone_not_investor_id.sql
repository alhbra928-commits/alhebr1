/*
  # إصلاح الحذف التتابعي للحجوزات باستخدام رقم الجوال
  
  ## المشكلة
  الـ trigger الحالي يعتمد على `investor_id` في جدول reservations، لكن جميع الحجوزات تستخدم 
  `customer_phone` وليس `investor_id` (جميع القيم NULL).
  
  ## الحل
  تحديث الـ trigger ليعتمد على `customer_phone` بدلاً من `investor_id` عند حذف المستثمر.
  
  ## التغييرات
  1. تحديث دالة cascade_soft_delete_investor_reservations لاستخدام customer_phone
  2. حذف الحجوزات المرتبطة برقم جوال المستثمر المحذوف
  3. الحفاظ على إمكانية الاسترجاع
*/

-- تحديث الدالة لاستخدام customer_phone
CREATE OR REPLACE FUNCTION cascade_soft_delete_investor_reservations()
RETURNS TRIGGER AS $$
BEGIN
  -- عند حذف المستثمر (soft delete)
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- حذف جميع الحجوزات المرتبطة بهذا المستثمر عبر رقم الجوال
    UPDATE reservations
    SET 
      deleted_at = NEW.deleted_at,
      deleted_by = NEW.deleted_by,
      updated_at = now()
    WHERE customer_phone = NEW.phone
      AND deleted_at IS NULL;
    
    -- تسجيل في audit log
    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      user_id,
      metadata,
      operation_timestamp
    ) VALUES (
      'reservations',
      NEW.id,
      'CASCADE_DELETE',
      NEW.deleted_by,
      jsonb_build_object(
        'reason', 'Investor deleted',
        'investor_id', NEW.id,
        'investor_phone', NEW.phone,
        'deleted_via', 'customer_phone'
      ),
      now()
    );
  END IF;
  
  -- عند استرجاع المستثمر (restore)
  IF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
    -- استرجاع جميع الحجوزات المرتبطة عبر رقم الجوال
    UPDATE reservations
    SET 
      deleted_at = NULL,
      deleted_by = NULL,
      updated_at = now()
    WHERE customer_phone = NEW.phone
      AND deleted_at IS NOT NULL
      AND deleted_by = OLD.deleted_by;
    
    -- تسجيل في audit log
    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      user_id,
      metadata,
      operation_timestamp
    ) VALUES (
      'reservations',
      NEW.id,
      'CASCADE_RESTORE',
      auth.uid(),
      jsonb_build_object(
        'reason', 'Investor restored',
        'investor_id', NEW.id,
        'investor_phone', NEW.phone,
        'restored_via', 'customer_phone'
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إعادة إنشاء الـ trigger (للتأكد من تطبيق التحديث)
DROP TRIGGER IF EXISTS cascade_delete_investor_reservations ON investors;
CREATE TRIGGER cascade_delete_investor_reservations
  AFTER UPDATE ON investors
  FOR EACH ROW
  WHEN (OLD.deleted_at IS DISTINCT FROM NEW.deleted_at)
  EXECUTE FUNCTION cascade_soft_delete_investor_reservations();

-- تحديث تعليق الدالة
COMMENT ON FUNCTION cascade_soft_delete_investor_reservations() IS 
  'عند حذف مستثمر، يتم حذف جميع حجوزاته تلقائياً عبر customer_phone. عند استرجاع المستثمر، يتم استرجاع الحجوزات.';
