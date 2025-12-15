/*
  # إصلاح تحديث الأشجار المتاحة عند حذف الحجوزات

  ## المشكلة
  عند حذف مستثمر، يتم حذف حجوزاته (soft delete) لكن عدد الأشجار المتاحة
  في المزرعة لا يتحدث، مما يؤدي إلى بقاء الأشجار محجوزة رغم حذف الحجز.

  ## الحل
  1. إنشاء دالة لتحديث available_trees في المزرعة عند تغيير حالة الحجز
  2. إنشاء trigger يتم تفعيله عند UPDATE على reservations
  3. عند تغيير deleted_at من NULL إلى قيمة (حذف) → زيادة available_trees
  4. عند تغيير deleted_at من قيمة إلى NULL (استرجاع) → تقليل available_trees

  ## الفوائد
  - تحديث تلقائي للأشجار المتاحة
  - تناسق البيانات بين الحجوزات والمزارع
  - دعم الحذف والاسترجاع بشكل صحيح
*/

-- دالة لتحديث الأشجار المتاحة في المزرعة
CREATE OR REPLACE FUNCTION update_farm_available_trees_on_reservation_change()
RETURNS TRIGGER AS $$
DECLARE
  v_trees_count INTEGER;
  v_farm_id UUID;
BEGIN
  -- تحديد farm_id والعدد المناسب
  IF TG_OP = 'DELETE' THEN
    v_farm_id := OLD.farm_id;
    v_trees_count := COALESCE(OLD.number_of_trees, 0);
  ELSIF TG_OP = 'INSERT' THEN
    v_farm_id := NEW.farm_id;
    v_trees_count := COALESCE(NEW.number_of_trees, 0);
  ELSE -- UPDATE
    v_farm_id := COALESCE(NEW.farm_id, OLD.farm_id);

    -- حالة 1: تم حذف الحجز (soft delete) - استرجاع الأشجار
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      v_trees_count := COALESCE(OLD.number_of_trees, 0);

      -- زيادة الأشجار المتاحة
      UPDATE farms
      SET
        available_trees = available_trees + v_trees_count,
        updated_at = NOW()
      WHERE id = v_farm_id
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
        'farms',
        v_farm_id,
        'TREES_FREED',
        NEW.deleted_by,
        jsonb_build_object(
          'reason', 'Reservation soft deleted',
          'reservation_id', OLD.id,
          'trees_count', v_trees_count,
          'customer_phone', OLD.customer_phone
        ),
        NOW()
      );

      RETURN NEW;
    END IF;

    -- حالة 2: تم استرجاع الحجز (restore) - حجز الأشجار مرة أخرى
    IF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      v_trees_count := COALESCE(NEW.number_of_trees, 0);

      -- تقليل الأشجار المتاحة
      UPDATE farms
      SET
        available_trees = GREATEST(0, available_trees - v_trees_count),
        updated_at = NOW()
      WHERE id = v_farm_id
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
        'farms',
        v_farm_id,
        'TREES_RESERVED',
        auth.uid(),
        jsonb_build_object(
          'reason', 'Reservation restored',
          'reservation_id', NEW.id,
          'trees_count', v_trees_count,
          'customer_phone', NEW.customer_phone
        ),
        NOW()
      );

      RETURN NEW;
    END IF;

    -- حالة 3: تغيير عدد الأشجار في حجز نشط
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NULL
       AND OLD.number_of_trees != NEW.number_of_trees THEN

      DECLARE
        v_trees_diff INTEGER;
      BEGIN
        v_trees_diff := COALESCE(NEW.number_of_trees, 0) - COALESCE(OLD.number_of_trees, 0);

        -- تحديث الأشجار المتاحة
        UPDATE farms
        SET
          available_trees = GREATEST(0, available_trees - v_trees_diff),
          updated_at = NOW()
        WHERE id = v_farm_id
          AND deleted_at IS NULL;
      END;

      RETURN NEW;
    END IF;
  END IF;

  -- في حالات أخرى، إرجاع القيمة الافتراضية
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- حذف الـ triggers القديمة إن وجدت
DROP TRIGGER IF EXISTS update_farm_on_reservation_delete ON reservations;
DROP TRIGGER IF EXISTS update_farm_on_reservation_insert ON reservations;
DROP TRIGGER IF EXISTS update_farm_on_reservation_update ON reservations;

-- إنشاء trigger جديد لتحديث الأشجار المتاحة
CREATE TRIGGER trigger_update_farm_available_trees
  AFTER UPDATE ON reservations
  FOR EACH ROW
  WHEN (
    -- عند تغيير حالة الحذف
    (OLD.deleted_at IS DISTINCT FROM NEW.deleted_at)
    OR
    -- أو عند تغيير عدد الأشجار في حجز نشط
    (OLD.deleted_at IS NULL AND NEW.deleted_at IS NULL
     AND OLD.number_of_trees IS DISTINCT FROM NEW.number_of_trees)
  )
  EXECUTE FUNCTION update_farm_available_trees_on_reservation_change();

-- إضافة تعليق توضيحي
COMMENT ON FUNCTION update_farm_available_trees_on_reservation_change() IS
  'تحديث الأشجار المتاحة في المزرعة عند حذف أو استرجاع أو تعديل الحجوزات';

COMMENT ON TRIGGER trigger_update_farm_available_trees ON reservations IS
  'تحديث تلقائي للأشجار المتاحة عند تغيير حالة الحجز أو عدد الأشجار';
