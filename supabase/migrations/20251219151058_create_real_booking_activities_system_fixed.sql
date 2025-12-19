/*
  # نظام الأنشطة الحقيقية للحجوزات - محدث
  
  1. Changes:
    - إنشاء trigger لإضافة نشاط عند إنشاء حجز جديد
    - إنشاء trigger لتحديث النشاط عند تحديث حالة الحجز
    - إضافة الحجوزات الحالية كأنشطة
    - trigger لإضافة نشاط عند إضافة مزرعة جديدة
    - استخدام أنواع الأنشطة المعتمدة فقط
  
  2. Security:
    - يعمل بصلاحيات SECURITY DEFINER
*/

-- ==================================================
-- 1. دالة لإضافة نشاط حجز جديد
-- ==================================================

CREATE OR REPLACE FUNCTION add_booking_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_farm_name text;
  v_customer_first_name text;
BEGIN
  -- جلب اسم المزرعة
  SELECT name_ar INTO v_farm_name
  FROM farms
  WHERE id = NEW.farm_id
  LIMIT 1;
  
  -- استخراج الاسم الأول فقط للخصوصية
  v_customer_first_name := split_part(NEW.customer_name, ' ', 1);
  
  -- إضافة النشاط
  INSERT INTO platform_activities (
    activity_type,
    activity_data,
    priority,
    is_active
  ) VALUES (
    'booking',
    jsonb_build_object(
      'icon', '🌴',
      'title_ar', v_customer_first_name || ' حجز ' || NEW.number_of_trees || ' شجرة في ' || COALESCE(v_farm_name, 'المزرعة'),
      'title_en', v_customer_first_name || ' booked ' || NEW.number_of_trees || ' trees',
      'farm_name', v_farm_name,
      'tree_count', NEW.number_of_trees,
      'booking_id', NEW.id::text
    ),
    CASE 
      WHEN NEW.number_of_trees >= 10000 THEN 10
      WHEN NEW.number_of_trees >= 1000 THEN 9
      WHEN NEW.number_of_trees >= 100 THEN 7
      ELSE 6
    END,
    true
  );
  
  RETURN NEW;
END;
$$;

-- ==================================================
-- 2. Trigger للحجوزات الجديدة
-- ==================================================

DROP TRIGGER IF EXISTS trigger_add_booking_activity ON reservations;

CREATE TRIGGER trigger_add_booking_activity
AFTER INSERT ON reservations
FOR EACH ROW
WHEN (NEW.deleted_at IS NULL)
EXECUTE FUNCTION add_booking_activity();

-- ==================================================
-- 3. دالة لإضافة نشاط مزرعة جديدة
-- ==================================================

CREATE OR REPLACE FUNCTION add_farm_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- إضافة النشاط
  INSERT INTO platform_activities (
    activity_type,
    activity_data,
    priority,
    is_active
  ) VALUES (
    'farm_added',
    jsonb_build_object(
      'icon', '🏡',
      'title_ar', 'مزرعة جديدة: ' || NEW.name_ar || ' - ' || NEW.total_trees || ' شجرة',
      'title_en', 'New Farm: ' || COALESCE(NEW.name_en, NEW.name_ar),
      'farm_name', NEW.name_ar,
      'total_trees', NEW.total_trees,
      'farm_id', NEW.id::text
    ),
    8,
    true
  );
  
  RETURN NEW;
END;
$$;

-- ==================================================
-- 4. Trigger للمزارع الجديدة
-- ==================================================

DROP TRIGGER IF EXISTS trigger_add_farm_activity ON farms;

CREATE TRIGGER trigger_add_farm_activity
AFTER INSERT ON farms
FOR EACH ROW
WHEN (NEW.deleted_at IS NULL AND NEW.status = 'active')
EXECUTE FUNCTION add_farm_activity();

-- ==================================================
-- 5. دالة لإضافة نشاط موافقة على حجز
-- ==================================================

CREATE OR REPLACE FUNCTION add_booking_approval_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_farm_name text;
  v_customer_first_name text;
BEGIN
  -- فقط عند الموافقة
  IF NEW.booking_status = 'approved' AND OLD.booking_status != 'approved' THEN
    -- جلب اسم المزرعة
    SELECT name_ar INTO v_farm_name
    FROM farms
    WHERE id = NEW.farm_id
    LIMIT 1;
    
    -- استخراج الاسم الأول
    v_customer_first_name := split_part(NEW.customer_name, ' ', 1);
    
    -- إضافة النشاط
    INSERT INTO platform_activities (
      activity_type,
      activity_data,
      priority,
      is_active
    ) VALUES (
      'milestone',
      jsonb_build_object(
        'icon', '✅',
        'title_ar', 'تمت الموافقة على حجز ' || v_customer_first_name || ' - ' || NEW.number_of_trees || ' شجرة',
        'title_en', 'Booking approved for ' || v_customer_first_name,
        'farm_name', v_farm_name,
        'tree_count', NEW.number_of_trees
      ),
      CASE 
        WHEN NEW.number_of_trees >= 10000 THEN 10
        WHEN NEW.number_of_trees >= 1000 THEN 9
        ELSE 7
      END,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- ==================================================
-- 6. Trigger لموافقة الحجوزات
-- ==================================================

DROP TRIGGER IF EXISTS trigger_add_booking_approval_activity ON reservations;

CREATE TRIGGER trigger_add_booking_approval_activity
AFTER UPDATE ON reservations
FOR EACH ROW
WHEN (NEW.deleted_at IS NULL)
EXECUTE FUNCTION add_booking_approval_activity();

-- ==================================================
-- 7. إضافة الحجوزات الحالية كأنشطة
-- ==================================================

DO $$
DECLARE
  v_reservation record;
  v_farm_name text;
  v_customer_first_name text;
BEGIN
  -- حذف الأنشطة القديمة للحجوزات فقط
  DELETE FROM platform_activities 
  WHERE activity_type IN ('booking', 'milestone')
    AND activity_data->>'booking_id' IS NOT NULL;
  
  -- إضافة الحجوزات الحالية
  FOR v_reservation IN 
    SELECT 
      r.id,
      r.customer_name,
      r.number_of_trees,
      r.booking_status,
      r.created_at,
      r.farm_id
    FROM reservations r
    WHERE r.deleted_at IS NULL
    ORDER BY r.created_at DESC
    LIMIT 20
  LOOP
    -- جلب اسم المزرعة
    SELECT name_ar INTO v_farm_name
    FROM farms
    WHERE id = v_reservation.farm_id
    LIMIT 1;
    
    -- استخراج الاسم الأول
    v_customer_first_name := split_part(v_reservation.customer_name, ' ', 1);
    
    -- إضافة نشاط الحجز
    INSERT INTO platform_activities (
      activity_type,
      activity_data,
      priority,
      is_active,
      created_at
    ) VALUES (
      'booking',
      jsonb_build_object(
        'icon', '🌴',
        'title_ar', v_customer_first_name || ' حجز ' || v_reservation.number_of_trees || ' شجرة في ' || COALESCE(v_farm_name, 'المزرعة'),
        'title_en', v_customer_first_name || ' booked ' || v_reservation.number_of_trees || ' trees',
        'farm_name', v_farm_name,
        'tree_count', v_reservation.number_of_trees,
        'booking_id', v_reservation.id::text
      ),
      CASE 
        WHEN v_reservation.number_of_trees >= 10000 THEN 10
        WHEN v_reservation.number_of_trees >= 1000 THEN 9
        WHEN v_reservation.number_of_trees >= 100 THEN 7
        ELSE 6
      END,
      true,
      v_reservation.created_at
    );
    
    -- إضافة نشاط الموافقة إذا كان معتمد
    IF v_reservation.booking_status = 'approved' THEN
      INSERT INTO platform_activities (
        activity_type,
        activity_data,
        priority,
        is_active,
        created_at
      ) VALUES (
        'milestone',
        jsonb_build_object(
          'icon', '✅',
          'title_ar', 'تمت الموافقة على حجز ' || v_customer_first_name || ' - ' || v_reservation.number_of_trees || ' شجرة',
          'title_en', 'Booking approved for ' || v_customer_first_name,
          'farm_name', v_farm_name,
          'tree_count', v_reservation.number_of_trees,
          'booking_id', v_reservation.id::text
        ),
        CASE 
          WHEN v_reservation.number_of_trees >= 10000 THEN 10
          WHEN v_reservation.number_of_trees >= 1000 THEN 9
          ELSE 7
        END,
        true,
        v_reservation.created_at + interval '1 hour'
      );
    END IF;
  END LOOP;
  
  RAISE NOTICE 'تم إضافة الحجوزات الحالية كأنشطة بنجاح';
END $$;
