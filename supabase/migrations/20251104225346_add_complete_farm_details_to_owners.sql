/*
  # إضافة تفاصيل المزرعة الكاملة لأصحاب المزارع

  1. الحقول الجديدة:
    - total_palm_trees (عدد أشجار النخيل)
    - total_olive_trees (عدد أشجار الزيتون)
    - available_palm_trees (النخيل المتاح)
    - available_olive_trees (الزيتون المتاح)
    - palm_tree_price (سعر شجرة النخيل)
    - olive_tree_price (سعر شجرة الزيتون)
    - farm_coordinates (إحداثيات الموقع)
    - farm_address (العنوان التفصيلي)
    - farm_description (وصف المزرعة)
    - farm_images (صور المزرعة - JSON array)
    - expected_annual_return (العائد السنوي المتوقع)

  2. ملاحظات:
    - farm_type موجود بالفعل (نخيل/زيتون)
    - farm_area موجود (المساحة)
    - farm_location_* موجود (الموقع)
*/

-- إضافة حقول أعداد الأشجار
DO $$ 
BEGIN
  -- عدد أشجار النخيل الإجمالي
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'total_palm_trees'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN total_palm_trees integer DEFAULT 0 CHECK (total_palm_trees >= 0);
  END IF;

  -- عدد أشجار الزيتون الإجمالي
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'total_olive_trees'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN total_olive_trees integer DEFAULT 0 CHECK (total_olive_trees >= 0);
  END IF;

  -- النخيل المتاح
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'available_palm_trees'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN available_palm_trees integer DEFAULT 0 CHECK (available_palm_trees >= 0);
  END IF;

  -- الزيتون المتاح
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'available_olive_trees'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN available_olive_trees integer DEFAULT 0 CHECK (available_olive_trees >= 0);
  END IF;

  -- سعر شجرة النخيل
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'palm_tree_price'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN palm_tree_price numeric(10,2) CHECK (palm_tree_price >= 0);
  END IF;

  -- سعر شجرة الزيتون
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'olive_tree_price'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN olive_tree_price numeric(10,2) CHECK (olive_tree_price >= 0);
  END IF;

  -- إحداثيات GPS
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'farm_coordinates'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN farm_coordinates text;
  END IF;

  -- العنوان التفصيلي
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'farm_address'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN farm_address text;
  END IF;

  -- وصف المزرعة
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'farm_description'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN farm_description text;
  END IF;

  -- صور المزرعة (JSON array of URLs)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'farm_images'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN farm_images jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- العائد السنوي المتوقع (نسبة مئوية)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owners' AND column_name = 'expected_annual_return'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN expected_annual_return numeric(5,2) CHECK (expected_annual_return >= 0 AND expected_annual_return <= 100);
  END IF;
END $$;

-- تحديث constraint على farm_type لضمان القيم الصحيحة
DO $$
BEGIN
  -- حذف constraint القديم إن وُجد
  ALTER TABLE farm_owners DROP CONSTRAINT IF EXISTS farm_owners_farm_type_check;
  
  -- إضافة constraint جديد
  ALTER TABLE farm_owners ADD CONSTRAINT farm_owners_farm_type_check 
    CHECK (farm_type IN ('نخيل', 'زيتون', 'نخيل وزيتون', 'palm', 'olive', 'mixed'));
END $$;

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_farm_owners_farm_type ON farm_owners(farm_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farm_owners_palm_trees ON farm_owners(available_palm_trees) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farm_owners_olive_trees ON farm_owners(available_olive_trees) WHERE deleted_at IS NULL;

-- تعليقات على الأعمدة
COMMENT ON COLUMN farm_owners.total_palm_trees IS 'إجمالي عدد أشجار النخيل في المزرعة';
COMMENT ON COLUMN farm_owners.total_olive_trees IS 'إجمالي عدد أشجار الزيتون في المزرعة';
COMMENT ON COLUMN farm_owners.available_palm_trees IS 'عدد أشجار النخيل المتاحة للحجز';
COMMENT ON COLUMN farm_owners.available_olive_trees IS 'عدد أشجار الزيتون المتاحة للحجز';
COMMENT ON COLUMN farm_owners.palm_tree_price IS 'سعر شجرة النخيل الواحدة بالريال';
COMMENT ON COLUMN farm_owners.olive_tree_price IS 'سعر شجرة الزيتون الواحدة بالريال';
COMMENT ON COLUMN farm_owners.farm_coordinates IS 'إحداثيات GPS للمزرعة (lat,lng)';
COMMENT ON COLUMN farm_owners.farm_address IS 'العنوان التفصيلي للمزرعة';
COMMENT ON COLUMN farm_owners.farm_description IS 'وصف تفصيلي عن المزرعة';
COMMENT ON COLUMN farm_owners.farm_images IS 'مصفوفة JSON لروابط صور المزرعة';
COMMENT ON COLUMN farm_owners.expected_annual_return IS 'العائد السنوي المتوقع (نسبة مئوية)';

-- دالة للتحقق من صحة البيانات
CREATE OR REPLACE FUNCTION validate_farm_owner_data()
RETURNS TRIGGER AS $$
BEGIN
  -- التحقق من أن الأشجار المتاحة لا تتجاوز الإجمالي
  IF NEW.available_palm_trees > NEW.total_palm_trees THEN
    RAISE EXCEPTION 'Available palm trees cannot exceed total palm trees';
  END IF;

  IF NEW.available_olive_trees > NEW.total_olive_trees THEN
    RAISE EXCEPTION 'Available olive trees cannot exceed total olive trees';
  END IF;

  -- إذا كان النوع نخيل فقط، يجب أن يكون هناك نخيل
  IF NEW.farm_type IN ('نخيل', 'palm') AND (NEW.total_palm_trees IS NULL OR NEW.total_palm_trees = 0) THEN
    RAISE EXCEPTION 'Palm farm must have palm trees';
  END IF;

  -- إذا كان النوع زيتون فقط، يجب أن يكون هناك زيتون
  IF NEW.farm_type IN ('زيتون', 'olive') AND (NEW.total_olive_trees IS NULL OR NEW.total_olive_trees = 0) THEN
    RAISE EXCEPTION 'Olive farm must have olive trees';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger للتحقق
DROP TRIGGER IF EXISTS validate_farm_owner_data_trigger ON farm_owners;
CREATE TRIGGER validate_farm_owner_data_trigger
  BEFORE INSERT OR UPDATE ON farm_owners
  FOR EACH ROW
  EXECUTE FUNCTION validate_farm_owner_data();
