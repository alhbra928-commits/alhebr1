/*
  # تحديث جدول booking_items لدعم كل من bookings و reservations

  ## الملخص
  تحديث جدول booking_items ليدعم الربط مع جدول reservations بالإضافة إلى bookings
  
  ## التغييرات
  1. إضافة عمود `reservation_id` اختياري للربط مع جدول reservations
  2. إضافة قيد للتأكد من وجود إما booking_id أو reservation_id (ليس كلاهما)
  3. تحديث المحفزات والدوال لدعم النظامين
  
  ## ملاحظات
  - يمكن للـ booking_item الآن أن يرتبط بـ booking أو reservation
  - التحفظ على البيانات الموجودة في booking_id
  - النظام الجديد سيستخدم reservation_id للحجوزات القادمة من المنصة العامة
*/

-- 1. إضافة عمود reservation_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'booking_items' AND column_name = 'reservation_id'
  ) THEN
    ALTER TABLE booking_items ADD COLUMN reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. جعل booking_id اختياري (nullable)
ALTER TABLE booking_items ALTER COLUMN booking_id DROP NOT NULL;

-- 3. إضافة قيد للتأكد من وجود واحد فقط
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'booking_items_single_reference_check'
  ) THEN
    ALTER TABLE booking_items ADD CONSTRAINT booking_items_single_reference_check
      CHECK (
        (booking_id IS NOT NULL AND reservation_id IS NULL) OR
        (booking_id IS NULL AND reservation_id IS NOT NULL)
      );
  END IF;
END $$;

-- 4. إضافة فهرس على reservation_id
CREATE INDEX IF NOT EXISTS idx_booking_items_reservation_id ON booking_items(reservation_id);

-- 5. تحديث دالة تحديث الإجمالي لدعم كلا النظامين
CREATE OR REPLACE FUNCTION update_booking_total_from_items()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_price numeric;
  v_total_trees integer;
  v_booking_id uuid;
  v_reservation_id uuid;
BEGIN
  -- تحديد أي معرف نستخدم
  v_booking_id := COALESCE(NEW.booking_id, OLD.booking_id);
  v_reservation_id := COALESCE(NEW.reservation_id, OLD.reservation_id);
  
  -- إذا كان لدينا booking_id
  IF v_booking_id IS NOT NULL THEN
    SELECT 
      COALESCE(SUM(subtotal), 0),
      COALESCE(SUM(quantity), 0)
    INTO v_total_price, v_total_trees
    FROM booking_items
    WHERE booking_id = v_booking_id
      AND deleted_at IS NULL;
    
    UPDATE bookings
    SET 
      total_price = v_total_price,
      reserved_trees = v_total_trees,
      updated_at = now()
    WHERE id = v_booking_id;
  END IF;
  
  -- إذا كان لدينا reservation_id
  IF v_reservation_id IS NOT NULL THEN
    SELECT 
      COALESCE(SUM(subtotal), 0),
      COALESCE(SUM(quantity), 0)
    INTO v_total_price, v_total_trees
    FROM booking_items
    WHERE reservation_id = v_reservation_id
      AND deleted_at IS NULL;
    
    UPDATE reservations
    SET 
      total_amount = v_total_price,
      number_of_trees = v_total_trees
    WHERE id = v_reservation_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. إعادة إنشاء المحفز
DROP TRIGGER IF EXISTS trigger_update_booking_total ON booking_items;
CREATE TRIGGER trigger_update_booking_total
  AFTER INSERT OR UPDATE OR DELETE ON booking_items
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_total_from_items();

-- 7. تحديث سياسات RLS لتشمل reservation_id
DROP POLICY IF EXISTS "Allow anon read booking items" ON booking_items;
CREATE POLICY "Allow anon read booking items"
  ON booking_items FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert booking items" ON booking_items;
CREATE POLICY "Allow anon insert booking items"
  ON booking_items FOR INSERT
  TO anon
  WITH CHECK (
    (booking_id IS NOT NULL OR reservation_id IS NOT NULL)
  );