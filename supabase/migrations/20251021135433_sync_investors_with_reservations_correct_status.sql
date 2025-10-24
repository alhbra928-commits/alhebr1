/*
  # مزامنة المستثمرين مع الحجوزات (تصحيح النسخة)

  1. محفزات
    - تحديث أو إنشاء مستثمر عند إضافة حجز
    - تحديث total_invested و total_trees_owned تلقائياً

  2. دوال
    - sync_investor_from_reservation - مزامنة بيانات المستثمر
    - recalculate_investor_stats - إعادة حساب الإحصائيات
*/

-- دالة لمزامنة المستثمر من الحجز
CREATE OR REPLACE FUNCTION sync_investor_from_reservation()
RETURNS TRIGGER AS $$
DECLARE
  v_investor_id uuid;
  v_total_invested numeric;
  v_total_trees integer;
BEGIN
  -- البحث عن المستثمر بالجوال
  SELECT id INTO v_investor_id
  FROM investors
  WHERE phone = NEW.customer_phone
  AND deleted_at IS NULL;

  -- حساب الإحصائيات
  SELECT 
    COALESCE(SUM(total_amount), 0),
    COALESCE(SUM(number_of_trees), 0)
  INTO v_total_invested, v_total_trees
  FROM reservations
  WHERE customer_phone = NEW.customer_phone;

  -- إذا كان المستثمر موجوداً، نحدث بياناته
  IF v_investor_id IS NOT NULL THEN
    UPDATE investors
    SET 
      full_name = COALESCE(NEW.customer_name, full_name),
      total_invested = v_total_invested,
      total_trees_owned = v_total_trees,
      status = 'active',
      updated_at = now()
    WHERE id = v_investor_id;
  ELSE
    -- إنشاء مستثمر جديد
    INSERT INTO investors (
      full_name,
      phone,
      email,
      national_id,
      total_invested,
      total_trees_owned,
      status
    ) VALUES (
      NEW.customer_name,
      NEW.customer_phone,
      NEW.customer_phone || '@temp.com',
      'temp_' || NEW.customer_phone,
      v_total_invested,
      v_total_trees,
      'active'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- محفز عند إضافة حجز جديد
DROP TRIGGER IF EXISTS sync_investor_on_reservation_insert ON reservations;
CREATE TRIGGER sync_investor_on_reservation_insert
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION sync_investor_from_reservation();

-- محفز عند تحديث حجز
DROP TRIGGER IF EXISTS sync_investor_on_reservation_update ON reservations;
CREATE TRIGGER sync_investor_on_reservation_update
  AFTER UPDATE ON reservations
  FOR EACH ROW
  WHEN (OLD.customer_phone IS DISTINCT FROM NEW.customer_phone 
    OR OLD.customer_name IS DISTINCT FROM NEW.customer_name
    OR OLD.total_amount IS DISTINCT FROM NEW.total_amount
    OR OLD.number_of_trees IS DISTINCT FROM NEW.number_of_trees)
  EXECUTE FUNCTION sync_investor_from_reservation();

-- دالة لإعادة حساب إحصائيات جميع المستثمرين
CREATE OR REPLACE FUNCTION recalculate_all_investor_stats()
RETURNS void AS $$
BEGIN
  -- تحديث المستثمرين الموجودين
  UPDATE investors i
  SET 
    total_invested = COALESCE((
      SELECT SUM(total_amount)
      FROM reservations r
      WHERE r.customer_phone = i.phone
    ), 0),
    total_trees_owned = COALESCE((
      SELECT SUM(number_of_trees)
      FROM reservations r
      WHERE r.customer_phone = i.phone
    ), 0),
    status = CASE 
      WHEN EXISTS (
        SELECT 1 FROM reservations r
        WHERE r.customer_phone = i.phone
      ) THEN 'active'
      ELSE status
    END,
    updated_at = now()
  WHERE deleted_at IS NULL;

  -- إضافة المستثمرين الجدد من الحجوزات
  INSERT INTO investors (full_name, phone, email, national_id, total_invested, total_trees_owned, status)
  SELECT DISTINCT ON (customer_phone)
    customer_name,
    customer_phone,
    customer_phone || '@temp.com',
    'temp_' || customer_phone,
    COALESCE((
      SELECT SUM(total_amount)
      FROM reservations r2
      WHERE r2.customer_phone = r.customer_phone
    ), 0),
    COALESCE((
      SELECT SUM(number_of_trees)
      FROM reservations r2
      WHERE r2.customer_phone = r.customer_phone
    ), 0),
    'active'
  FROM reservations r
  WHERE customer_phone IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM investors i
    WHERE i.phone = r.customer_phone
    AND i.deleted_at IS NULL
  )
  ORDER BY customer_phone, created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- تنفيذ المزامنة الأولية
SELECT recalculate_all_investor_stats();
