/*
  # نظام أصناف الأشجار للمزارع

  ## التغييرات الجديدة

  1. جدول جديد farm_tree_varieties:
    - `id` (uuid, primary key): معرف فريد
    - `farm_id` (uuid, foreign key): ربط بجدول farms
    - `tree_type` (text): نوع الشجرة (نخيل، زيتون)
    - `variety_name` (text): اسم الصنف (خلاص، سكري، برحي، أربيكينا، إلخ)
    - `tree_count` (integer): عدد الأشجار من هذا الصنف
    - `price_per_tree` (decimal): السعر للشجرة (اختياري - يمكن أن يختلف حسب الصنف)
    - `available_count` (integer): العدد المتاح
    - `created_at` (timestamptz): وقت الإنشاء
    - `updated_at` (timestamptz): وقت آخر تحديث

  2. جدول public_reservations_varieties:
    - ربط الحجز بالأصناف المختلفة

  ## الملاحظات
  - كل مزرعة يمكن أن تحتوي على عدة أصناف
  - كل صنف له عدد مستقل من الأشجار
  - السعر يمكن أن يختلف حسب الصنف
*/

-- إنشاء جدول أصناف الأشجار
CREATE TABLE IF NOT EXISTS farm_tree_varieties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  tree_type text NOT NULL CHECK (tree_type IN ('نخيل', 'زيتون')),
  variety_name text NOT NULL,
  tree_count integer NOT NULL DEFAULT 0 CHECK (tree_count >= 0),
  price_per_tree decimal(10,2),
  available_count integer NOT NULL DEFAULT 0 CHECK (available_count >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(farm_id, tree_type, variety_name)
);

-- إنشاء جدول ربط الحجوزات بالأصناف
CREATE TABLE IF NOT EXISTS public_reservations_varieties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public_reservations(id) ON DELETE CASCADE,
  variety_id uuid NOT NULL REFERENCES farm_tree_varieties(id) ON DELETE CASCADE,
  tree_count integer NOT NULL CHECK (tree_count > 0),
  price_per_tree decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء indexes لتسريع البحث
CREATE INDEX IF NOT EXISTS idx_farm_tree_varieties_farm_id ON farm_tree_varieties(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_tree_varieties_tree_type ON farm_tree_varieties(tree_type);
CREATE INDEX IF NOT EXISTS idx_public_reservations_varieties_reservation ON public_reservations_varieties(reservation_id);
CREATE INDEX IF NOT EXISTS idx_public_reservations_varieties_variety ON public_reservations_varieties(variety_id);

-- دالة لتحديث available_count تلقائياً
CREATE OR REPLACE FUNCTION sync_variety_available_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.available_count := NEW.tree_count;
  ELSIF TG_OP = 'UPDATE' AND NEW.tree_count != OLD.tree_count THEN
    NEW.available_count := NEW.tree_count - (OLD.tree_count - OLD.available_count);
    IF NEW.available_count < 0 THEN
      NEW.available_count := 0;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث available_count
DROP TRIGGER IF EXISTS trigger_sync_variety_available_count ON farm_tree_varieties;
CREATE TRIGGER trigger_sync_variety_available_count
  BEFORE INSERT OR UPDATE ON farm_tree_varieties
  FOR EACH ROW
  EXECUTE FUNCTION sync_variety_available_count();

-- دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_farm_tree_varieties_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث updated_at
DROP TRIGGER IF EXISTS trigger_update_farm_tree_varieties_timestamp ON farm_tree_varieties;
CREATE TRIGGER trigger_update_farm_tree_varieties_timestamp
  BEFORE UPDATE ON farm_tree_varieties
  FOR EACH ROW
  EXECUTE FUNCTION update_farm_tree_varieties_timestamp();

-- تفعيل RLS
ALTER TABLE farm_tree_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_reservations_varieties ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لـ farm_tree_varieties
CREATE POLICY "الجميع يمكنهم قراءة أصناف الأشجار"
  ON farm_tree_varieties
  FOR SELECT
  USING (true);

CREATE POLICY "المستخدمون المصادقون يمكنهم إنشاء أصناف الأشجار"
  ON farm_tree_varieties
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "المستخدمون المصادقون يمكنهم تحديث أصناف الأشجار"
  ON farm_tree_varieties
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "المستخدمون المصادقون يمكنهم حذف أصناف الأشجار"
  ON farm_tree_varieties
  FOR DELETE
  TO authenticated
  USING (true);

-- سياسات RLS لـ public_reservations_varieties
CREATE POLICY "الجميع يمكنهم قراءة أصناف الحجوزات"
  ON public_reservations_varieties
  FOR SELECT
  USING (true);

CREATE POLICY "الجميع يمكنهم إنشاء أصناف الحجوزات"
  ON public_reservations_varieties
  FOR INSERT
  WITH CHECK (true);

-- تعليقات على الجداول
COMMENT ON TABLE farm_tree_varieties IS 'جدول أصناف الأشجار - يحتوي على تفاصيل كل صنف في كل مزرعة';
COMMENT ON COLUMN farm_tree_varieties.variety_name IS 'اسم الصنف مثل: خلاص، سكري، برحي، أربيكينا، كوراتينا';
COMMENT ON COLUMN farm_tree_varieties.tree_count IS 'إجمالي عدد الأشجار من هذا الصنف';
COMMENT ON COLUMN farm_tree_varieties.available_count IS 'العدد المتاح للحجز من هذا الصنف';
COMMENT ON TABLE public_reservations_varieties IS 'جدول ربط الحجوزات بأصناف الأشجار المختلفة';
