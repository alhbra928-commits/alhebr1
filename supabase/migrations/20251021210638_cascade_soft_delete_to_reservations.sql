/*
  # حذف آمن تتابعي للحجوزات عند حذف المزارع أو المستثمرين
  
  ## المشكلة
  عند حذف مزرعة أو مستثمر (soft delete)، الحجوزات المرتبطة بهم لا تُحذف تلقائياً
  مما يؤدي إلى بقاء حجوزات معلقة بمزارع أو مستثمرين محذوفين.
  
  ## الحل
  إنشاء triggers تلقائية لحذف الحجوزات المرتبطة (soft delete) عند:
  1. حذف مزرعة → حذف جميع حجوزات هذه المزرعة
  2. حذف مستثمر → حذف جميع حجوزات هذا المستثمر
  
  ## الآلية
  - عند تحديث farms وتعيين deleted_at → تحديث reservations المرتبطة وتعيين deleted_at
  - عند تحديث investors وتعيين deleted_at → تحديث reservations المرتبطة وتعيين deleted_at
  - الحفاظ على تسجيل من قام بالحذف (deleted_by)
  
  ## الفوائد
  1. نظافة البيانات - عدم وجود حجوزات يتيمة
  2. التناسق - حالة الحجوزات تعكس حالة المزارع والمستثمرين
  3. الأمان - يمكن استرجاع الكل عند استرجاع المزرعة/المستثمر
*/

-- دالة لحذف الحجوزات المرتبطة بمزرعة محذوفة
CREATE OR REPLACE FUNCTION cascade_soft_delete_farm_reservations()
RETURNS TRIGGER AS $$
BEGIN
  -- عند حذف المزرعة (soft delete)
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- حذف جميع الحجوزات المرتبطة بهذه المزرعة
    UPDATE reservations
    SET 
      deleted_at = NEW.deleted_at,
      deleted_by = NEW.deleted_by,
      updated_at = now()
    WHERE farm_id = NEW.id
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
        'reason', 'Farm deleted',
        'farm_id', NEW.id,
        'farm_name', NEW.name_ar
      ),
      now()
    );
  END IF;
  
  -- عند استرجاع المزرعة (restore)
  IF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
    -- استرجاع جميع الحجوزات المرتبطة
    UPDATE reservations
    SET 
      deleted_at = NULL,
      deleted_by = NULL,
      updated_at = now()
    WHERE farm_id = NEW.id
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
        'reason', 'Farm restored',
        'farm_id', NEW.id,
        'farm_name', NEW.name_ar
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- دالة لحذف الحجوزات المرتبطة بمستثمر محذوف
CREATE OR REPLACE FUNCTION cascade_soft_delete_investor_reservations()
RETURNS TRIGGER AS $$
BEGIN
  -- عند حذف المستثمر (soft delete)
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- حذف جميع الحجوزات المرتبطة بهذا المستثمر
    UPDATE reservations
    SET 
      deleted_at = NEW.deleted_at,
      deleted_by = NEW.deleted_by,
      updated_at = now()
    WHERE investor_id = NEW.id
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
        'investor_phone', NEW.phone
      ),
      now()
    );
  END IF;
  
  -- عند استرجاع المستثمر (restore)
  IF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
    -- استرجاع جميع الحجوزات المرتبطة
    UPDATE reservations
    SET 
      deleted_at = NULL,
      deleted_by = NULL,
      updated_at = now()
    WHERE investor_id = NEW.id
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
        'investor_phone', NEW.phone
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تفعيل trigger على المزارع
DROP TRIGGER IF EXISTS cascade_delete_farm_reservations ON farms;
CREATE TRIGGER cascade_delete_farm_reservations
  AFTER UPDATE ON farms
  FOR EACH ROW
  WHEN (OLD.deleted_at IS DISTINCT FROM NEW.deleted_at)
  EXECUTE FUNCTION cascade_soft_delete_farm_reservations();

-- تفعيل trigger على المستثمرين
DROP TRIGGER IF EXISTS cascade_delete_investor_reservations ON investors;
CREATE TRIGGER cascade_delete_investor_reservations
  AFTER UPDATE ON investors
  FOR EACH ROW
  WHEN (OLD.deleted_at IS DISTINCT FROM NEW.deleted_at)
  EXECUTE FUNCTION cascade_soft_delete_investor_reservations();

-- تحديث الحجوزات الحالية المرتبطة بمزارع محذوفة
UPDATE reservations r
SET 
  deleted_at = f.deleted_at,
  deleted_by = f.deleted_by,
  updated_at = now()
FROM farms f
WHERE r.farm_id = f.id
  AND f.deleted_at IS NOT NULL
  AND r.deleted_at IS NULL;

-- تحديث الحجوزات الحالية المرتبطة بمستثمرين محذوفين
UPDATE reservations r
SET 
  deleted_at = i.deleted_at,
  deleted_by = i.deleted_by,
  updated_at = now()
FROM investors i
WHERE r.investor_id = i.id
  AND i.deleted_at IS NOT NULL
  AND r.deleted_at IS NULL;

-- إضافة تعليقات توضيحية
COMMENT ON FUNCTION cascade_soft_delete_farm_reservations() IS 
  'عند حذف مزرعة، يتم حذف جميع حجوزاتها تلقائياً. عند استرجاع المزرعة، يتم استرجاع الحجوزات.';

COMMENT ON FUNCTION cascade_soft_delete_investor_reservations() IS 
  'عند حذف مستثمر، يتم حذف جميع حجوزاته تلقائياً. عند استرجاع المستثمر، يتم استرجاع الحجوزات.';
