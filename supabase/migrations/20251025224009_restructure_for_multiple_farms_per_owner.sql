/*
  # إعادة هيكلة النظام لدعم عدة مزارع لكل صاحب مزرعة

  1. التغييرات:
     - إزالة بيانات المزارع من farm_owner_profiles (تبقى المعلومات الشخصية فقط)
     - نقل بيانات المزارع الحالية إلى جدول farms
     - تحديث farm_submission_requests ليشير إلى farm_id
     - تحديث farm_owner_varieties ليشير إلى farm_id
     - إضافة عمود owner_id في farms للربط

  2. البنية الجديدة:
     - farm_owner_profiles: معلومات شخصية فقط
     - farms: بيانات المزارع (كل مزرعة مستقلة)
     - علاقة 1:N (صاحب واحد -> عدة مزارع)
*/

-- الخطوة 1: إضافة أعمدة جديدة في جدول farms إذا لم تكن موجودة
DO $$
BEGIN
  -- إضافة owner_id للربط مع farm_owner_profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE farms ADD COLUMN owner_id uuid REFERENCES farm_owner_profiles(id) ON DELETE CASCADE;
  END IF;

  -- إضافة حقول المزرعة المنقولة من profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'deed_number'
  ) THEN
    ALTER TABLE farms ADD COLUMN deed_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'total_farm_area'
  ) THEN
    ALTER TABLE farms ADD COLUMN total_farm_area numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'farm_area_unit'
  ) THEN
    ALTER TABLE farms ADD COLUMN farm_area_unit text DEFAULT 'متر مربع';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'actual_total_price'
  ) THEN
    ALTER TABLE farms ADD COLUMN actual_total_price numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'price_per_tree'
  ) THEN
    ALTER TABLE farms ADD COLUMN price_per_tree numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'payment_grace_period'
  ) THEN
    ALTER TABLE farms ADD COLUMN payment_grace_period integer DEFAULT 30;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'additional_notes'
  ) THEN
    ALTER TABLE farms ADD COLUMN additional_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'submission_status'
  ) THEN
    ALTER TABLE farms ADD COLUMN submission_status text DEFAULT 'draft' CHECK (submission_status IN ('draft', 'pending', 'approved', 'rejected'));
  END IF;
END $$;

-- الخطوة 2: تحديث farm_submission_requests لإضافة farm_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_submission_requests' AND column_name = 'farm_id'
  ) THEN
    ALTER TABLE farm_submission_requests ADD COLUMN farm_id uuid REFERENCES farms(id) ON DELETE CASCADE;
  END IF;
END $$;

-- الخطوة 3: تحديث farm_owner_varieties لإضافة farm_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_owner_varieties' AND column_name = 'farm_id'
  ) THEN
    ALTER TABLE farm_owner_varieties ADD COLUMN farm_id uuid REFERENCES farms(id) ON DELETE CASCADE;
  END IF;
END $$;

-- الخطوة 4: إنشاء index للأداء
CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON farms(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farm_submissions_farm_id ON farm_submission_requests(farm_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farm_varieties_farm_id ON farm_owner_varieties(farm_id);