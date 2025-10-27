/*
  # إصلاح triggers الحجوزات - إزالة customer_email
  
  1. المشكلة
    - الـ triggers تحاول قراءة NEW.customer_email
    - الحقل غير موجود في جدول reservations
    - يسبب خطأ 400: record "new" has no field "customer_email"
  
  2. الحل
    - تحديث جميع الـ triggers لاستخدام NULL بدلاً من NEW.customer_email
    - البحث عن الإيميل من جدول investors إن وجد
  
  3. الـ Triggers المتأثرة
    - auto_link_investor_on_reservation_insert
    - auto_link_investor_on_reservation_update
*/

-- حذف الـ triggers القديمة
DROP TRIGGER IF EXISTS auto_link_investor_on_reservation_insert ON reservations;
DROP TRIGGER IF EXISTS auto_link_investor_on_reservation_update ON reservations;

-- إعادة إنشاء دالة ربط المستثمر (بدون customer_email)
CREATE OR REPLACE FUNCTION auto_link_investor_on_reservation_insert()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_investor_id UUID;
  v_email TEXT;
BEGIN
  -- إذا لم يكن هناك رقم جوال، نرجع
  IF NEW.customer_phone IS NULL OR NEW.customer_phone = '' THEN
    RETURN NEW;
  END IF;

  -- محاولة الحصول على الإيميل من جدول investors إن وجد
  SELECT email INTO v_email
  FROM investors
  WHERE phone = NEW.customer_phone
  LIMIT 1;

  -- إنشاء أو الحصول على المستثمر
  v_investor_id := get_or_create_investor(
    NEW.customer_phone,
    COALESCE(NEW.customer_name, 'مستثمر'),
    v_email  -- استخدام الإيميل من investors أو NULL
  );
  
  NEW.investor_id := v_investor_id;
  
  RETURN NEW;
END;
$$;

-- إعادة إنشاء دالة التحديث (بدون customer_email)
CREATE OR REPLACE FUNCTION auto_link_investor_on_reservation_update()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_investor_id UUID;
  v_email TEXT;
BEGIN
  -- التحقق من تغيير رقم الجوال أو الاسم
  IF (OLD.customer_phone IS DISTINCT FROM NEW.customer_phone) OR 
     (OLD.customer_name IS DISTINCT FROM NEW.customer_name) THEN
    
    IF NEW.customer_phone IS NULL OR NEW.customer_phone = '' THEN
      NEW.investor_id := NULL;
      RETURN NEW;
    END IF;

    -- محاولة الحصول على الإيميل من جدول investors
    SELECT email INTO v_email
    FROM investors
    WHERE phone = NEW.customer_phone
    LIMIT 1;

    -- إنشاء أو الحصول على المستثمر
    v_investor_id := get_or_create_investor(
      NEW.customer_phone,
      COALESCE(NEW.customer_name, 'مستثمر'),
      v_email  -- استخدام الإيميل من investors أو NULL
    );
    
    -- تحديث investor_id في الحجز
    NEW.investor_id := v_investor_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إعادة إنشاء الـ triggers
CREATE TRIGGER auto_link_investor_on_reservation_insert
  BEFORE INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_investor_on_reservation_insert();

CREATE TRIGGER auto_link_investor_on_reservation_update
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_investor_on_reservation_update();

-- التحقق من الإصلاح
COMMENT ON FUNCTION auto_link_investor_on_reservation_insert IS 'Auto-link investor on reservation insert - Fixed to not use customer_email';
COMMENT ON FUNCTION auto_link_investor_on_reservation_update IS 'Auto-link investor on reservation update - Fixed to not use customer_email';
