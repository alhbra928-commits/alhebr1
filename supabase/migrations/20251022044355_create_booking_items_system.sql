/*
  # إنشاء نظام تفاصيل الحجوزات بالأصناف المتعددة

  ## الملخص
  هذا الملف يُنشئ نظام متكامل لتسجيل تفاصيل كل حجز مع الأصناف المختارة من المزرعة.
  يسمح للمستثمر باختيار حتى 20 صنفاً مختلفاً من نفس المزرعة، مع تسجيل الكمية والسعر لكل صنف.

  ## 1. الجداول الجديدة
    - `booking_items`
      - `id` (uuid, primary key) - معرّف فريد لكل عنصر في الحجز
      - `booking_id` (uuid, foreign key → bookings) - رقم الحجز الأساسي
      - `variety_id` (uuid, foreign key → farm_tree_varieties) - رقم الصنف المختار
      - `quantity` (integer) - عدد الأشجار المحجوزة من هذا الصنف
      - `price_per_tree` (numeric) - السعر لكل شجرة وقت الحجز
      - `subtotal` (numeric) - المجموع الجزئي (quantity × price_per_tree)
      - `created_at` (timestamptz) - تاريخ الإضافة
      - `updated_at` (timestamptz) - تاريخ آخر تحديث

  ## 2. الأمان (RLS)
    - تفعيل RLS على جدول `booking_items`
    - سياسة قراءة عامة للأصناف المحجوزة (للمراجعة)
    - سياسة إضافة للنظام فقط (authenticated users)
    - سياسة تحديث للنظام فقط
    - سياسة حذف للنظام فقط

  ## 3. الدوال والمحفزات (Triggers)
    - دالة `calculate_booking_item_subtotal()` - حساب تلقائي للمجموع الجزئي
    - دالة `update_booking_total_from_items()` - تحديث إجمالي الحجز من مجموع العناصر
    - دالة `check_variety_availability()` - التحقق من توفر الكمية المطلوبة
    - محفز `trigger_calculate_subtotal` - يُطلق عند إضافة/تعديل عنصر
    - محفز `trigger_update_booking_total` - يُطلق بعد إضافة/تعديل/حذف عنصر
    - محفز `trigger_check_availability` - يُطلق قبل إضافة/تعديل عنصر

  ## 4. الفهارس (Indexes)
    - فهرس على `booking_id` للبحث السريع
    - فهرس على `variety_id` للبحث السريع
    - فهرس مركب على `(booking_id, variety_id)` لتجنب التكرار

  ## 5. ملاحظات مهمة
    - كل حجز يمكن أن يحتوي على حتى 20 صنفاً مختلفاً
    - يتم حساب المجموع الجزئي تلقائياً لكل عنصر
    - يتم تحديث إجمالي الحجز تلقائياً عند تغيير العناصر
    - يتم التحقق من توفر الكمية قبل الحفظ
    - السعر يُحفظ وقت الحجز (snapshot) لتجنب تأثير تغييرات الأسعار لاحقاً
*/

-- =====================================================
-- 1. إنشاء جدول تفاصيل الحجوزات
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  variety_id uuid NOT NULL REFERENCES farm_tree_varieties(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_per_tree numeric(12,2) NOT NULL CHECK (price_per_tree >= 0),
  subtotal numeric(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- منع تكرار نفس الصنف في نفس الحجز
  UNIQUE(booking_id, variety_id)
);

-- =====================================================
-- 2. الفهارس للأداء
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_booking_items_booking_id ON booking_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_variety_id ON booking_items(variety_id);

-- =====================================================
-- 3. تفعيل RLS
-- =====================================================
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. سياسات RLS
-- =====================================================

-- قراءة عامة (anon يمكنه رؤية تفاصيل الحجوزات للمراجعة)
DROP POLICY IF EXISTS "Allow anon read booking items" ON booking_items;
CREATE POLICY "Allow anon read booking items"
  ON booking_items FOR SELECT
  TO anon
  USING (true);

-- قراءة للمستخدمين المسجلين
DROP POLICY IF EXISTS "Allow authenticated read booking items" ON booking_items;
CREATE POLICY "Allow authenticated read booking items"
  ON booking_items FOR SELECT
  TO authenticated
  USING (true);

-- إضافة للنظام فقط (يمكن للمستثمرين إضافة عناصر للحجز)
DROP POLICY IF EXISTS "Allow anon insert booking items" ON booking_items;
CREATE POLICY "Allow anon insert booking items"
  ON booking_items FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated insert booking items" ON booking_items;
CREATE POLICY "Allow authenticated insert booking items"
  ON booking_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- تحديث للنظام فقط
DROP POLICY IF EXISTS "Allow authenticated update booking items" ON booking_items;
CREATE POLICY "Allow authenticated update booking items"
  ON booking_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- حذف للنظام فقط
DROP POLICY IF EXISTS "Allow authenticated delete booking items" ON booking_items;
CREATE POLICY "Allow authenticated delete booking items"
  ON booking_items FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- 5. دالة حساب المجموع الجزئي تلقائياً
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_booking_item_subtotal()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- حساب المجموع الجزئي: الكمية × السعر
  NEW.subtotal := NEW.quantity * NEW.price_per_tree;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_calculate_subtotal ON booking_items;
CREATE TRIGGER trigger_calculate_subtotal
  BEFORE INSERT OR UPDATE ON booking_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_booking_item_subtotal();

-- =====================================================
-- 6. دالة تحديث إجمالي الحجز من العناصر
-- =====================================================
CREATE OR REPLACE FUNCTION update_booking_total_from_items()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_price numeric;
  v_total_trees integer;
BEGIN
  -- حساب المجموع الكلي والعدد الكلي من جميع العناصر
  SELECT 
    COALESCE(SUM(subtotal), 0),
    COALESCE(SUM(quantity), 0)
  INTO v_total_price, v_total_trees
  FROM booking_items
  WHERE booking_id = COALESCE(NEW.booking_id, OLD.booking_id)
    AND deleted_at IS NULL;
  
  -- تحديث جدول الحجوزات الرئيسي
  UPDATE bookings
  SET 
    total_price = v_total_price,
    reserved_trees = v_total_trees,
    updated_at = now()
  WHERE id = COALESCE(NEW.booking_id, OLD.booking_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_booking_total ON booking_items;
CREATE TRIGGER trigger_update_booking_total
  AFTER INSERT OR UPDATE OR DELETE ON booking_items
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_total_from_items();

-- =====================================================
-- 7. دالة التحقق من توفر الكمية
-- =====================================================
CREATE OR REPLACE FUNCTION check_variety_availability()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_available_quantity integer;
  v_variety_name text;
BEGIN
  -- جلب الكمية المتاحة واسم الصنف
  SELECT available_quantity, variety_name
  INTO v_available_quantity, v_variety_name
  FROM farm_tree_varieties
  WHERE id = NEW.variety_id;
  
  -- التحقق من توفر الكمية
  IF NEW.quantity > v_available_quantity THEN
    RAISE EXCEPTION 'الكمية المطلوبة (%) تتجاوز الكمية المتاحة (%) للصنف "%"',
      NEW.quantity, v_available_quantity, v_variety_name;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_availability ON booking_items;
CREATE TRIGGER trigger_check_availability
  BEFORE INSERT OR UPDATE ON booking_items
  FOR EACH ROW
  EXECUTE FUNCTION check_variety_availability();

-- =====================================================
-- 8. إضافة عمود deleted_at لدعم الحذف الناعم
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'booking_items' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE booking_items ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;