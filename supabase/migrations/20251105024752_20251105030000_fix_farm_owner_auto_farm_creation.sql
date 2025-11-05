/*
  # إصلاح نظام ربط أصحاب المزارع بالمزارع

  ## المشكلة
  - عند إنشاء صاحب مزرعة من الإدارة، لا يتم إنشاء مزرعة تلقائياً
  - رقم الجوال يُحفظ بصيغة +966 مما يمنع صاحب المزرعة من الدخول
  - البطاقة لا تظهر معتمدة في لوحة صاحب المزرعة

  ## الحل
  1. دالة لتطبيع رقم الجوال (إزالة +966 وإضافة 0)
  2. Trigger لإنشاء مزرعة تلقائياً عند إضافة صاحب مزرعة
  3. تحديث الأرقام الموجودة

  ## الخطوات
  - إنشاء دالة normalize_phone_number()
  - إنشاء trigger auto_create_farm_for_owner
  - تحديث الأرقام الحالية
*/

-- ===================================
-- دالة تطبيع رقم الجوال
-- ===================================
CREATE OR REPLACE FUNCTION normalize_phone_number(phone TEXT)
RETURNS TEXT AS $$
BEGIN
  -- إزالة المسافات والشرطات
  phone := REPLACE(REPLACE(phone, ' ', ''), '-', '');
  
  -- تحويل +966 إلى 0
  IF phone LIKE '+966%' THEN
    phone := '0' || SUBSTRING(phone FROM 5);
  END IF;
  
  -- تحويل 966 إلى 0
  IF phone LIKE '966%' AND LENGTH(phone) = 12 THEN
    phone := '0' || SUBSTRING(phone FROM 4);
  END IF;
  
  -- التأكد من وجود 0 في البداية
  IF NOT phone LIKE '0%' AND LENGTH(phone) = 9 THEN
    phone := '0' || phone;
  END IF;
  
  RETURN phone;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===================================
-- Trigger لتطبيع رقم الجوال تلقائياً
-- ===================================
CREATE OR REPLACE FUNCTION auto_normalize_farm_owner_phone()
RETURNS TRIGGER AS $$
BEGIN
  -- تطبيع رقم الجوال عند الإدخال أو التحديث
  NEW.mobile_number := normalize_phone_number(NEW.mobile_number);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS normalize_phone_before_insert_farm_owners ON farm_owners;
CREATE TRIGGER normalize_phone_before_insert_farm_owners
  BEFORE INSERT OR UPDATE ON farm_owners
  FOR EACH ROW
  EXECUTE FUNCTION auto_normalize_farm_owner_phone();

-- ===================================
-- Trigger لإنشاء مزرعة تلقائياً
-- ===================================
CREATE OR REPLACE FUNCTION auto_create_farm_for_new_owner()
RETURNS TRIGGER AS $$
DECLARE
  v_farm_code TEXT;
  v_farm_id UUID;
  v_area_sqm NUMERIC;
BEGIN
  -- توليد farm_code تلقائي
  SELECT 'FARM-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('farm_code_seq')::TEXT, 4, '0')
  INTO v_farm_code;
  
  -- تحويل المساحة إلى متر مربع
  v_area_sqm := COALESCE(NEW.farm_area, 10000);
  
  IF NEW.farm_area_unit = 'هكتار' THEN
    v_area_sqm := v_area_sqm * 10000;
  ELSIF NEW.farm_area_unit = 'فدان' THEN
    v_area_sqm := v_area_sqm * 4200;
  END IF;
  
  -- إنشاء المزرعة
  INSERT INTO farms (
    id,
    owner_id,
    name_ar,
    name_en,
    farm_code,
    location,
    area_sqm,
    farm_type,
    tree_type,
    total_farm_area,
    farm_area_unit,
    actual_total_price,
    price_per_tree,
    total_trees,
    available_trees,
    status,
    submission_status,
    payment_grace_period,
    region,
    city,
    admin_notes,
    created_at,
    created_by
  )
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE('مزرعة ' || NEW.full_name, 'مزرعة جديدة'),
    COALESCE('Farm of ' || NEW.full_name, 'New Farm'),
    v_farm_code,
    COALESCE(NEW.farm_location_city || ', ' || NEW.farm_location_region, 'غير محدد'),
    v_area_sqm,
    COALESCE(NEW.farm_type, 'نخيل'),
    COALESCE(NEW.farm_type, 'نخيل'),
    COALESCE(NEW.farm_area, 10000),
    COALESCE(NEW.farm_area_unit, 'متر'),
    COALESCE(NEW.actual_price, 100000),
    COALESCE(NEW.actual_price / NULLIF(NEW.farm_area, 0), 100),
    GREATEST(FLOOR(v_area_sqm / 100), 10),
    GREATEST(FLOOR(v_area_sqm / 100), 10),
    CASE 
      WHEN NEW.status = 'active' THEN 'active'
      WHEN NEW.status = 'pending' THEN 'pending'
      ELSE 'active'
    END,
    CASE 
      WHEN NEW.status = 'active' THEN 'approved'
      ELSE 'pending'
    END,
    COALESCE(NEW.payment_grace_period, 30),
    NEW.region,
    NEW.city,
    NEW.admin_notes,
    NOW(),
    NEW.created_by
  )
  RETURNING id INTO v_farm_id;
  
  RAISE NOTICE 'تم إنشاء المزرعة % لصاحب المزرعة %', v_farm_code, NEW.full_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_farm_after_owner_insert ON farm_owners;
CREATE TRIGGER create_farm_after_owner_insert
  AFTER INSERT ON farm_owners
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NULL)
  EXECUTE FUNCTION auto_create_farm_for_new_owner();

-- ===================================
-- تحديث الأرقام الحالية
-- ===================================
UPDATE farm_owners
SET mobile_number = normalize_phone_number(mobile_number)
WHERE mobile_number LIKE '+966%' OR mobile_number LIKE '966%';

-- ===================================
-- إنشاء sequence إذا لم يكن موجوداً
-- ===================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'farm_code_seq') THEN
    CREATE SEQUENCE farm_code_seq START 8;
  END IF;
END $$;
