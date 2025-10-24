/*
  # إضافة حقول نظام التسعير الذكي للمزارع

  ## التغييرات
  1. **إضافة حقول جديدة:**
     - unit_marketing_price (السعر التسويقي للوحدة - نخلة/شجرة)
     - total_marketing_price (الإجمالي التسويقي الكلي)
     - unit_actual_price (السعر الفعلي للوحدة)
     - total_actual_price (الإجمالي الفعلي الكلي)

  2. **الهدف:**
     - حساب تلقائي للأسعار الإجمالية
     - ربط بين عدد الأشجار والسعر للوحدة
     - دعم نظام الحساب الذكي في الواجهة

  ## الأمان
  - جميع الحقول محمية بـ RLS الموجود
  - السعر الفعلي للإدارة فقط
*/

-- إضافة حقل السعر التسويقي للوحدة
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'unit_marketing_price'
  ) THEN
    ALTER TABLE farms ADD COLUMN unit_marketing_price numeric DEFAULT 0 CHECK (unit_marketing_price >= 0);
    COMMENT ON COLUMN farms.unit_marketing_price IS 'السعر التسويقي للوحدة (نخلة/شجرة واحدة)';
  END IF;
END $$;

-- إضافة حقل الإجمالي التسويقي الكلي
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'total_marketing_price'
  ) THEN
    ALTER TABLE farms ADD COLUMN total_marketing_price numeric DEFAULT 0 CHECK (total_marketing_price >= 0);
    COMMENT ON COLUMN farms.total_marketing_price IS 'الإجمالي التسويقي الكلي للمزرعة (محسوب تلقائياً)';
  END IF;
END $$;

-- إضافة حقل السعر الفعلي للوحدة
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'unit_actual_price'
  ) THEN
    ALTER TABLE farms ADD COLUMN unit_actual_price numeric DEFAULT 0 CHECK (unit_actual_price >= 0);
    COMMENT ON COLUMN farms.unit_actual_price IS 'السعر الفعلي للوحدة (نخلة/شجرة واحدة)';
  END IF;
END $$;

-- إضافة حقل الإجمالي الفعلي الكلي
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'total_actual_price'
  ) THEN
    ALTER TABLE farms ADD COLUMN total_actual_price numeric DEFAULT 0 CHECK (total_actual_price >= 0);
    COMMENT ON COLUMN farms.total_actual_price IS 'الإجمالي الفعلي الكلي للمزرعة (محسوب تلقائياً)';
  END IF;
END $$;

-- إنشاء دالة لحساب الأسعار الإجمالية تلقائياً
CREATE OR REPLACE FUNCTION calculate_farm_total_prices()
RETURNS TRIGGER AS $$
BEGIN
  -- حساب الإجمالي التسويقي
  IF NEW.total_trees IS NOT NULL AND NEW.unit_marketing_price IS NOT NULL THEN
    NEW.total_marketing_price := NEW.total_trees * NEW.unit_marketing_price;
  END IF;

  -- حساب الإجمالي الفعلي
  IF NEW.total_trees IS NOT NULL AND NEW.unit_actual_price IS NOT NULL THEN
    NEW.total_actual_price := NEW.total_trees * NEW.unit_actual_price;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء Trigger لحساب الأسعار عند الإدخال أو التحديث
DROP TRIGGER IF EXISTS trigger_calculate_farm_prices ON farms;
CREATE TRIGGER trigger_calculate_farm_prices
  BEFORE INSERT OR UPDATE OF total_trees, unit_marketing_price, unit_actual_price
  ON farms
  FOR EACH ROW
  EXECUTE FUNCTION calculate_farm_total_prices();

-- إنشاء indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_farms_unit_marketing_price ON farms(unit_marketing_price);
CREATE INDEX IF NOT EXISTS idx_farms_total_marketing_price ON farms(total_marketing_price);
