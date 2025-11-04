/*
  # تعطيل trigger التحقق من بيانات المزرعة نهائياً

  1. المشكلة:
    - Trigger يمنع الموافقة على البطاقات
    - يطلب أشجار نخيل عند تغيير الحالة
    
  2. الحل:
    - حذف الـ trigger تماماً
    - إزالة قيود التحقق الصارمة
    - السماح بإدارة البيانات بحرية
*/

-- حذف الـ trigger نهائياً
DROP TRIGGER IF EXISTS validate_farm_owner_data_trigger ON farm_owners;

-- حذف الدالة نهائياً
DROP FUNCTION IF EXISTS validate_farm_owner_data() CASCADE;

-- إنشاء دالة بسيطة للتحديث التلقائي فقط (بدون validation)
CREATE OR REPLACE FUNCTION auto_update_available_trees()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث الأشجار المتاحة تلقائياً فقط إذا كانت NULL
  IF NEW.available_palm_trees IS NULL AND NEW.total_palm_trees IS NOT NULL THEN
    NEW.available_palm_trees := NEW.total_palm_trees;
  END IF;

  IF NEW.available_olive_trees IS NULL AND NEW.total_olive_trees IS NOT NULL THEN
    NEW.available_olive_trees := NEW.total_olive_trees;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger بسيط للتحديث التلقائي فقط (بدون validation)
CREATE TRIGGER auto_update_available_trees_trigger
  BEFORE INSERT OR UPDATE ON farm_owners
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_available_trees();

-- تحديث السجلات الموجودة لملء القيم الافتراضية
UPDATE farm_owners
SET 
  total_palm_trees = COALESCE(total_palm_trees, 0),
  total_olive_trees = COALESCE(total_olive_trees, 0),
  available_palm_trees = COALESCE(available_palm_trees, 0),
  available_olive_trees = COALESCE(available_olive_trees, 0)
WHERE deleted_at IS NULL;
