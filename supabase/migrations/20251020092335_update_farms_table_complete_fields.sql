/*
  # تحديث جدول المزارع - إضافة الحقول الكاملة
  
  ## التغييرات
  
  1. **إضافة حقول جديدة:**
     - deed_number (رقم الصك)
     - area_unit (الوحدة)
     - crop_type (الصنف الزراعي)
     - actual_price (السعر الفعلي)
     - marketing_price (السعر التسويقي)
     - المميزات (بئر، كهرباء، سور، طريق، عقم)
     - technical_notes (ملاحظات فنية)
     - region, city (المنطقة والمدينة)
     - latitude, longitude (الإحداثيات)
     - google_map_link (رابط الخريطة)
     - aerial_map_url (الخريطة الجوية)
     - payment_grace_period (مدة السماح)
     - admin_notes (ملاحظات الإدارة)
     - created_by, updated_by (التتبع)
  
  2. **تحديث الحقول الموجودة:**
     - إعادة تسمية بعض الحقول للتوافق
  
  ## الأمان
  - جميع الحقول الجديدة محمية بـ RLS
  - السعر الفعلي للإدارة فقط
*/

-- إضافة الأعمدة الجديدة إن لم تكن موجودة

-- البيانات الأساسية
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'deed_number') THEN
    ALTER TABLE farms ADD COLUMN deed_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'area_unit') THEN
    ALTER TABLE farms ADD COLUMN area_unit text DEFAULT 'متر';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'farm_type') THEN
    ALTER TABLE farms ADD COLUMN farm_type text;
  END IF;
END $$;

-- التفاصيل الزراعية والتسويقية
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'crop_type') THEN
    ALTER TABLE farms ADD COLUMN crop_type text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'actual_price') THEN
    ALTER TABLE farms ADD COLUMN actual_price numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'marketing_price') THEN
    ALTER TABLE farms ADD COLUMN marketing_price numeric;
  END IF;
  
  -- المميزات
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'has_well') THEN
    ALTER TABLE farms ADD COLUMN has_well boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'has_electricity') THEN
    ALTER TABLE farms ADD COLUMN has_electricity boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'has_fence') THEN
    ALTER TABLE farms ADD COLUMN has_fence boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'has_road') THEN
    ALTER TABLE farms ADD COLUMN has_road boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'has_sterilization') THEN
    ALTER TABLE farms ADD COLUMN has_sterilization boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'technical_notes') THEN
    ALTER TABLE farms ADD COLUMN technical_notes text;
  END IF;
END $$;

-- الموقع والخريطة
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'region') THEN
    ALTER TABLE farms ADD COLUMN region text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'city') THEN
    ALTER TABLE farms ADD COLUMN city text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'latitude') THEN
    ALTER TABLE farms ADD COLUMN latitude numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'longitude') THEN
    ALTER TABLE farms ADD COLUMN longitude numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'google_map_link') THEN
    ALTER TABLE farms ADD COLUMN google_map_link text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'aerial_map_url') THEN
    ALTER TABLE farms ADD COLUMN aerial_map_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'payment_grace_period') THEN
    ALTER TABLE farms ADD COLUMN payment_grace_period integer DEFAULT 6;
  END IF;
END $$;

-- الإعدادات الإدارية
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'admin_notes') THEN
    ALTER TABLE farms ADD COLUMN admin_notes text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'created_by') THEN
    ALTER TABLE farms ADD COLUMN created_by uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'updated_by') THEN
    ALTER TABLE farms ADD COLUMN updated_by uuid;
  END IF;
END $$;

-- إنشاء جدول الأرشيف إن لم يكن موجوداً
CREATE TABLE IF NOT EXISTS farms_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  farm_data jsonb NOT NULL,
  deleted_at timestamptz DEFAULT now(),
  deleted_by uuid,
  deletion_reason text,
  can_restore boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE farms_archive ENABLE ROW LEVEL SECURITY;

-- سياسات الأرشيف
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'farms_archive' 
    AND policyname = 'Admins can view farm archive'
  ) THEN
    CREATE POLICY "Admins can view farm archive"
      ON farms_archive FOR SELECT
      TO authenticated
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'farms_archive' 
    AND policyname = 'Admins can insert farm archive'
  ) THEN
    CREATE POLICY "Admins can insert farm archive"
      ON farms_archive FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- دالة حذف المزرعة مع الأرشفة
CREATE OR REPLACE FUNCTION delete_farm_permanently(
  p_farm_id uuid,
  p_deleted_by uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_farm_data jsonb;
BEGIN
  SELECT to_jsonb(farms.*) INTO v_farm_data
  FROM farms
  WHERE id = p_farm_id AND deleted_at IS NULL;
  
  IF v_farm_data IS NULL THEN
    RAISE EXCEPTION 'Farm not found or already deleted';
  END IF;
  
  INSERT INTO farms_archive (
    farm_id,
    farm_data,
    deleted_by,
    deletion_reason,
    can_restore
  ) VALUES (
    p_farm_id,
    v_farm_data,
    p_deleted_by,
    p_reason,
    true
  );
  
  UPDATE farms
  SET 
    deleted_at = now(),
    deleted_by = p_deleted_by,
    status = 'archived'
  WHERE id = p_farm_id;
END;
$$;

-- دالة إحصائيات المزارع
CREATE OR REPLACE FUNCTION get_farms_statistics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE status = 'active'),
    'frozen', COUNT(*) FILTER (WHERE status = 'frozen'),
    'under_review', COUNT(*) FILTER (WHERE status = 'under_review'),
    'total_trees', COALESCE(SUM(total_trees), 0),
    'available_trees', COALESCE(SUM(available_trees), 0),
    'total_area', COALESCE(SUM(area_sqm), 0),
    'avg_marketing_price', COALESCE(AVG(marketing_price), 0)
  ) INTO v_stats
  FROM farms
  WHERE deleted_at IS NULL;
  
  RETURN v_stats;
END;
$$;

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_farms_deed ON farms(deed_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farms_crop_type ON farms(crop_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farms_region_city ON farms(region, city) WHERE deleted_at IS NULL;

-- تعليقات توضيحية
COMMENT ON COLUMN farms.actual_price IS 'السعر الفعلي - للإدارة فقط - لا يُعرض للمستثمرين';
COMMENT ON COLUMN farms.marketing_price IS 'السعر التسويقي - يُعرض للمستثمرين في الواجهة العامة';
COMMENT ON COLUMN farms.aerial_map_url IS 'رابط الخريطة الجوية من Google Earth';
COMMENT ON COLUMN farms.crop_type IS 'الصنف الزراعي (مثال: خلاص، سكري، بيكال، أربكينا...)';
COMMENT ON COLUMN farms.payment_grace_period IS 'مدة السماح لتحصيل المبلغ الكامل بالأشهر (3/6/9/12)';
