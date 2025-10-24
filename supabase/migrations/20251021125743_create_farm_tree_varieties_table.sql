/*
  # إنشاء جدول أصناف أشجار المزارع

  1. جداول جديدة
    - `farm_tree_varieties` - أصناف الأشجار لكل مزرعة
      - `id` (uuid, primary key)
      - `farm_id` (uuid, foreign key to farms)
      - `tree_type` (text) - نوع الشجرة (نخيل/زيتون)
      - `variety_name` (text) - اسم الصنف بالعربي
      - `variety_name_en` (text) - اسم الصنف بالإنجليزي
      - `price_per_tree` (numeric) - سعر الشجرة الواحدة
      - `available_quantity` (integer) - الكمية المتاحة
      - `max_booking_per_investor` (integer) - الحد الأعلى للحجز لكل مستثمر
      - `total_trees` (integer) - إجمالي الأشجار من هذا الصنف
      - `description_ar` (text) - وصف الصنف بالعربي
      - `description_en` (text) - وصف الصنف بالإنجليزي
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `deleted_at` (timestamptz) - للحذف الناعم
      - `deleted_by` (uuid) - معرف من قام بالحذف

  2. الأمان
    - تفعيل RLS على الجدول
    - سياسة للقراءة العامة للأصناف المتاحة
    - سياسة للإدارة للمصادقين فقط

  3. المحفزات
    - تحديث updated_at تلقائياً
    - الحذف الناعم
*/

-- إنشاء الجدول
CREATE TABLE IF NOT EXISTS farm_tree_varieties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  tree_type text NOT NULL CHECK (tree_type IN ('نخيل', 'زيتون')),
  variety_name text NOT NULL,
  variety_name_en text,
  price_per_tree numeric(10, 2) NOT NULL DEFAULT 0 CHECK (price_per_tree >= 0),
  available_quantity integer NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
  max_booking_per_investor integer NOT NULL DEFAULT 100 CHECK (max_booking_per_investor > 0),
  total_trees integer NOT NULL DEFAULT 0 CHECK (total_trees >= 0),
  description_ar text,
  description_en text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  deleted_by uuid
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_farm_tree_varieties_farm_id ON farm_tree_varieties(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_tree_varieties_tree_type ON farm_tree_varieties(tree_type);
CREATE INDEX IF NOT EXISTS idx_farm_tree_varieties_deleted_at ON farm_tree_varieties(deleted_at);

-- تفعيل RLS
ALTER TABLE farm_tree_varieties ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة العامة للأصناف المتاحة
CREATE POLICY "Public can view available varieties"
  ON farm_tree_varieties
  FOR SELECT
  TO anon, authenticated
  USING (available_quantity > 0 AND deleted_at IS NULL);

-- سياسة للمصادقين لعرض جميع الأصناف (للإدارة)
CREATE POLICY "Authenticated users can view all varieties"
  ON farm_tree_varieties
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- سياسة الإضافة للمصادقين فقط
CREATE POLICY "Authenticated users can insert varieties"
  ON farm_tree_varieties
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسة التحديث للمصادقين فقط
CREATE POLICY "Authenticated users can update varieties"
  ON farm_tree_varieties
  FOR UPDATE
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (true);

-- سياسة الحذف للمصادقين فقط
CREATE POLICY "Authenticated users can delete varieties"
  ON farm_tree_varieties
  FOR DELETE
  TO authenticated
  USING (true);

-- محفز تحديث updated_at
CREATE OR REPLACE FUNCTION update_farm_tree_varieties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_farm_tree_varieties_updated_at_trigger ON farm_tree_varieties;
CREATE TRIGGER update_farm_tree_varieties_updated_at_trigger
  BEFORE UPDATE ON farm_tree_varieties
  FOR EACH ROW
  EXECUTE FUNCTION update_farm_tree_varieties_updated_at();

-- إضافة بيانات تجريبية لمزرعة أبو علي
INSERT INTO farm_tree_varieties (
  farm_id,
  tree_type,
  variety_name,
  variety_name_en,
  price_per_tree,
  available_quantity,
  max_booking_per_investor,
  total_trees,
  description_ar
) VALUES
(
  '40c668a6-1c8d-4ee6-b5e3-569e28d05f66',
  'نخيل',
  'نخيل سكري القصيم',
  'Sukkari Date Palm - Qassim',
  250,
  2000,
  500,
  2500,
  'صنف فاخر من نخيل التمر السكري من منطقة القصيم، معروف بجودة تمره العالية وحلاوته المميزة'
),
(
  '40c668a6-1c8d-4ee6-b5e3-569e28d05f66',
  'نخيل',
  'نخيل خلاص الأحساء',
  'Khlas Date Palm - Al-Ahsa',
  220,
  1500,
  400,
  2000,
  'نخيل خلاص من الأحساء، من أجود أنواع التمور في المملكة'
),
(
  '40c668a6-1c8d-4ee6-b5e3-569e28d05f66',
  'نخيل',
  'نخيل برحي',
  'Barhi Date Palm',
  200,
  1000,
  300,
  1500,
  'صنف برحي مميز يؤكل طازجاً وله قيمة تسويقية عالية'
)
ON CONFLICT DO NOTHING;
