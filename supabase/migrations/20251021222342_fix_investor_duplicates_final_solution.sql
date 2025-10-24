/*
  # الحل النهائي لمشكلة المستثمرين المكررين
  
  ## المشكلة
  - ظهور مستثمرين وهميين عند إنشاء حجوزات
  - تكرار المستثمرين بنفس رقم الجوال
  - الحذف التتابعي لا يعمل بشكل صحيح
  
  ## الحل
  1. UNIQUE constraint على phone
  2. ON CONFLICT DO UPDATE في المزامنة
  3. تحسين منطق الحذف التتابعي
*/

-- 1️⃣ إضافة unique constraint
ALTER TABLE investors 
ADD CONSTRAINT investors_phone_unique UNIQUE (phone);

-- 2️⃣ إصلاح دالة المزامنة
CREATE OR REPLACE FUNCTION sync_investor_from_reservation()
RETURNS TRIGGER AS $$
DECLARE
  v_total_invested numeric;
  v_total_trees integer;
BEGIN
  IF NEW.deleted_at IS NOT NULL OR NEW.customer_phone IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT 
    COALESCE(SUM(total_amount), 0),
    COALESCE(SUM(number_of_trees), 0)
  INTO v_total_invested, v_total_trees
  FROM reservations
  WHERE customer_phone = NEW.customer_phone
    AND deleted_at IS NULL;

  INSERT INTO investors (
    full_name, phone, email, national_id,
    total_invested, total_trees_owned, status
  ) VALUES (
    NEW.customer_name,
    NEW.customer_phone,
    NEW.customer_phone || '@temp.com',
    'temp_' || NEW.customer_phone,
    v_total_invested,
    v_total_trees,
    'active'
  )
  ON CONFLICT (phone) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, investors.full_name),
    total_invested = EXCLUDED.total_invested,
    total_trees_owned = EXCLUDED.total_trees_owned,
    status = 'active',
    updated_at = now(),
    deleted_at = NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3️⃣ إصلاح الحذف التتابعي
CREATE OR REPLACE FUNCTION cascade_soft_delete_investor_reservations()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    UPDATE reservations
    SET deleted_at = NEW.deleted_at, deleted_by = NEW.deleted_by
    WHERE customer_phone = OLD.phone AND deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
