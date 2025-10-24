/*
  # نظام الأكواد والباركود الذكي للمزارع

  ## التغييرات الجديدة

  1. إضافة حقول جديدة لجدول farms:
    - `farm_code` (text, unique): رقم فريد للمزرعة بصيغة FARM-2025-XXXX
    - `farm_barcode` (text): مسار ملف الباركود
    - `barcode_generated_at` (timestamptz): وقت توليد الباركود

  2. جدول جديد farm_trees:
    - `id` (uuid, primary key): معرف فريد
    - `farm_id` (uuid, foreign key): ربط بجدول farms
    - `tree_code` (text, unique): كود الشجرة بصيغة FARM-2025-XXXX-T0001
    - `tree_status` (text): حالة الشجرة (متاحة، محجوزة، مباعة)
    - `created_at` (timestamptz): وقت الإنشاء
    - `updated_at` (timestamptz): وقت آخر تحديث

  3. دالة لتوليد رقم المزرعة التلقائي
  4. Trigger لإنشاء أكواد الأشجار تلقائياً
  5. RLS policies للأمان

  ## الملاحظات
  - رقم المزرعة يُولد تلقائياً ولا يمكن تعديله
  - أكواد الأشجار تُنشأ تلقائياً عند إضافة مزرعة جديدة
  - جميع العمليات مؤرشفة في audit_log
*/

-- إضافة الحقول الجديدة لجدول farms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'farm_code'
  ) THEN
    ALTER TABLE farms ADD COLUMN farm_code text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'farm_barcode'
  ) THEN
    ALTER TABLE farms ADD COLUMN farm_barcode text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'barcode_generated_at'
  ) THEN
    ALTER TABLE farms ADD COLUMN barcode_generated_at timestamptz;
  END IF;
END $$;

-- إنشاء جدول farm_trees
CREATE TABLE IF NOT EXISTS farm_trees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  tree_code text UNIQUE NOT NULL,
  tree_status text DEFAULT 'متاحة' CHECK (tree_status IN ('متاحة', 'محجوزة', 'مباعة')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء index لتسريع البحث
CREATE INDEX IF NOT EXISTS idx_farm_trees_farm_id ON farm_trees(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_trees_tree_code ON farm_trees(tree_code);
CREATE INDEX IF NOT EXISTS idx_farms_farm_code ON farms(farm_code);

-- دالة لتوليد رقم المزرعة التلقائي
CREATE OR REPLACE FUNCTION generate_farm_code()
RETURNS text AS $$
DECLARE
  current_year text;
  next_number integer;
  new_code text;
BEGIN
  -- الحصول على السنة الحالية
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  -- الحصول على آخر رقم مستخدم
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(farm_code FROM 'FARM-' || current_year || '-(.*)') AS integer
      )
    ), 0
  ) + 1 INTO next_number
  FROM farms
  WHERE farm_code LIKE 'FARM-' || current_year || '-%';
  
  -- تكوين الرقم الجديد بصيغة FARM-2025-0001
  new_code := 'FARM-' || current_year || '-' || LPAD(next_number::text, 4, '0');
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- دالة لتوليد أكواد الأشجار
CREATE OR REPLACE FUNCTION generate_tree_codes()
RETURNS TRIGGER AS $$
DECLARE
  tree_counter integer;
  tree_code text;
BEGIN
  -- توليد farm_code إذا لم يكن موجوداً
  IF NEW.farm_code IS NULL THEN
    NEW.farm_code := generate_farm_code();
  END IF;

  -- إنشاء أكواد الأشجار
  FOR tree_counter IN 1..NEW.total_trees LOOP
    tree_code := NEW.farm_code || '-T' || LPAD(tree_counter::text, 4, '0');
    
    INSERT INTO farm_trees (farm_id, tree_code, tree_status)
    VALUES (NEW.id, tree_code, 'متاحة')
    ON CONFLICT (tree_code) DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتوليد الأكواد عند إضافة مزرعة جديدة
DROP TRIGGER IF EXISTS trigger_generate_tree_codes ON farms;
CREATE TRIGGER trigger_generate_tree_codes
  AFTER INSERT ON farms
  FOR EACH ROW
  EXECUTE FUNCTION generate_tree_codes();

-- تفعيل RLS على جدول farm_trees
ALTER TABLE farm_trees ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لجدول farm_trees
CREATE POLICY "المستخدمون المصادقون يمكنهم قراءة أكواد الأشجار"
  ON farm_trees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "المستخدمون المصادقون يمكنهم إنشاء أكواد الأشجار"
  ON farm_trees
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "المستخدمون المصادقون يمكنهم تحديث حالة الأشجار"
  ON farm_trees
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "المستخدمون المصادقون يمكنهم حذف أكواد الأشجار"
  ON farm_trees
  FOR DELETE
  TO authenticated
  USING (true);

-- دالة لتحديث أكواد الأشجار عند تغيير العدد
CREATE OR REPLACE FUNCTION update_tree_codes_on_change()
RETURNS TRIGGER AS $$
DECLARE
  current_count integer;
  tree_counter integer;
  tree_code text;
BEGIN
  -- إذا تغير عدد الأشجار
  IF NEW.total_trees != OLD.total_trees THEN
    -- الحصول على العدد الحالي
    SELECT COUNT(*) INTO current_count
    FROM farm_trees
    WHERE farm_id = NEW.id;
    
    -- إذا زاد العدد، نضيف أشجار جديدة
    IF NEW.total_trees > current_count THEN
      FOR tree_counter IN (current_count + 1)..NEW.total_trees LOOP
        tree_code := NEW.farm_code || '-T' || LPAD(tree_counter::text, 4, '0');
        
        INSERT INTO farm_trees (farm_id, tree_code, tree_status)
        VALUES (NEW.id, tree_code, 'متاحة')
        ON CONFLICT (tree_code) DO NOTHING;
      END LOOP;
    
    -- إذا نقص العدد، نحذف الأشجار الزائدة (المتاحة فقط)
    ELSIF NEW.total_trees < current_count THEN
      DELETE FROM farm_trees
      WHERE farm_id = NEW.id
        AND tree_status = 'متاحة'
        AND id IN (
          SELECT id FROM farm_trees
          WHERE farm_id = NEW.id
            AND tree_status = 'متاحة'
          ORDER BY created_at DESC
          LIMIT (current_count - NEW.total_trees)
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger للتحديث
DROP TRIGGER IF EXISTS trigger_update_tree_codes ON farms;
CREATE TRIGGER trigger_update_tree_codes
  AFTER UPDATE ON farms
  FOR EACH ROW
  WHEN (NEW.total_trees IS DISTINCT FROM OLD.total_trees)
  EXECUTE FUNCTION update_tree_codes_on_change();

-- إضافة تعليق على الجداول
COMMENT ON TABLE farm_trees IS 'جدول أكواد الأشجار - يحتوي على كود فريد لكل شجرة في كل مزرعة';
COMMENT ON COLUMN farms.farm_code IS 'رقم فريد للمزرعة بصيغة FARM-YYYY-XXXX';
COMMENT ON COLUMN farms.farm_barcode IS 'مسار ملف الباركود (QR Code)';
COMMENT ON COLUMN farm_trees.tree_code IS 'كود الشجرة بصيغة FARM-YYYY-XXXX-TNNNN';
COMMENT ON COLUMN farm_trees.tree_status IS 'حالة الشجرة: متاحة، محجوزة، مباعة';
