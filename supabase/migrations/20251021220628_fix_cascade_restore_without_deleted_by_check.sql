/*
  # إصلاح استرجاع الحجوزات التتابعي
  
  ## المشكلة
  عند استرجاع المستثمر، الحجوزات لا تُسترجع لأن الشرط `deleted_by = OLD.deleted_by`
  يفشل عندما يكون deleted_by قد تم مسحه مسبقاً.
  
  ## الحل
  إزالة شرط deleted_by واستخدام فقط customer_phone و deleted_at للمطابقة.
  استرجاع جميع الحجوزات المحذوفة للمستثمر بغض النظر عن من حذفها.
*/

-- تحديث دالة حذف/استرجاع الحجوزات المرتبطة بمستثمر
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
      'SOFT_DELETE',
      NEW.deleted_by,
      jsonb_build_object(
        'reason', 'Investor deleted - cascade',
        'investor_id', NEW.id,
        'investor_phone', NEW.phone,
        'cascade_trigger', 'customer_phone_match'
      ),
      now()
    );
  END IF;
  
  -- عند استرجاع المستثمر (restore)
  IF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
    -- استرجاع جميع الحجوزات المحذوفة لهذا المستثمر
    -- بدون شرط deleted_by لأنه قد يكون تم مسحه
    UPDATE reservations
    SET 
      deleted_at = NULL,
      deleted_by = NULL,
      updated_at = now()
    WHERE customer_phone = NEW.phone
      AND deleted_at IS NOT NULL;
    
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
      'RESTORE',
      auth.uid(),
      jsonb_build_object(
        'reason', 'Investor restored - cascade',
        'investor_id', NEW.id,
        'investor_phone', NEW.phone,
        'cascade_trigger', 'customer_phone_match'
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تحديث دالة حذف/استرجاع الحجوزات المرتبطة بمزرعة
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
      'SOFT_DELETE',
      NEW.deleted_by,
      jsonb_build_object(
        'reason', 'Farm deleted - cascade',
        'farm_id', NEW.id,
        'farm_name', NEW.name_ar,
        'cascade_trigger', 'farm_id_match'
      ),
      now()
    );
  END IF;
  
  -- عند استرجاع المزرعة (restore)
  IF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
    -- استرجاع جميع الحجوزات المحذوفة لهذه المزرعة
    UPDATE reservations
    SET 
      deleted_at = NULL,
      deleted_by = NULL,
      updated_at = now()
    WHERE farm_id = NEW.id
      AND deleted_at IS NOT NULL;
    
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
      'RESTORE',
      auth.uid(),
      jsonb_build_object(
        'reason', 'Farm restored - cascade',
        'farm_id', NEW.id,
        'farm_name', NEW.name_ar,
        'cascade_trigger', 'farm_id_match'
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
