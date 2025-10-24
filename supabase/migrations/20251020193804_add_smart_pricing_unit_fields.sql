/*
  # إضافة حقول التسعير الذكي للوحدة

  1. الحقول الجديدة
    - `unit_actual_price` (numeric): السعر الفعلي لكل شجرة/وحدة
    - `unit_marketing_price` (numeric): السعر التسويقي لكل شجرة/وحدة
    - `total_actual_price` (numeric): الإجمالي الفعلي (عدد الأشجار × السعر الفعلي للوحدة)
    - `total_marketing_price` (numeric): الإجمالي التسويقي (عدد الأشجار × السعر التسويقي للوحدة)

  2. الغرض
    - تمكين نظام التسعير الذكي التلقائي
    - actual_price و marketing_price سيتم ملؤهما تلقائياً من الحقول الجديدة
*/

-- إضافة الحقول الجديدة
DO $$
BEGIN
  -- السعر الفعلي للوحدة
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'unit_actual_price'
  ) THEN
    ALTER TABLE farms ADD COLUMN unit_actual_price NUMERIC(12,2) DEFAULT 0;
  END IF;

  -- السعر التسويقي للوحدة
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'unit_marketing_price'
  ) THEN
    ALTER TABLE farms ADD COLUMN unit_marketing_price NUMERIC(12,2) DEFAULT 0;
  END IF;

  -- الإجمالي الفعلي
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'total_actual_price'
  ) THEN
    ALTER TABLE farms ADD COLUMN total_actual_price NUMERIC(12,2) DEFAULT 0;
  END IF;

  -- الإجمالي التسويقي
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'total_marketing_price'
  ) THEN
    ALTER TABLE farms ADD COLUMN total_marketing_price NUMERIC(12,2) DEFAULT 0;
  END IF;
END $$;

-- تحديث البيانات الموجودة: حساب unit prices من actual_price و marketing_price
UPDATE farms
SET 
  unit_actual_price = CASE 
    WHEN total_trees > 0 THEN actual_price / total_trees 
    ELSE 0 
  END,
  unit_marketing_price = CASE 
    WHEN total_trees > 0 THEN marketing_price / total_trees 
    ELSE 0 
  END,
  total_actual_price = actual_price,
  total_marketing_price = marketing_price
WHERE total_trees > 0;
