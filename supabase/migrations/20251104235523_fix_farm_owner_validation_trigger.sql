/*
  # إصلاح trigger التحقق من بيانات المزرعة

  1. المشكلة:
    - Trigger يطلب أشجار عند الإنشاء/التحديث
    - يسبب خطأ عند إنشاء سجل جديد قبل إضافة الأشجار
    
  2. الحل:
    - جعل التحقق أكثر مرونة
    - السماح بإنشاء السجل أولاً
    - التحقق فقط عند الاعتماد (approval_status = 'approved')
*/

-- حذف الدالة والـ trigger القديم
DROP TRIGGER IF EXISTS validate_farm_owner_data_trigger ON farm_owners;
DROP FUNCTION IF EXISTS validate_farm_owner_data();

-- إنشاء دالة محسّنة للتحقق
CREATE OR REPLACE FUNCTION validate_farm_owner_data()
RETURNS TRIGGER AS $$
BEGIN
  -- التحقق فقط إذا كانت الحالة "معتمدة" أو "نشطة"
  -- هذا يسمح بإنشاء السجل أولاً ثم إضافة التفاصيل لاحقاً
  IF NEW.approval_status = 'approved' OR NEW.status = 'active' THEN
    
    -- التحقق من أن الأشجار المتاحة لا تتجاوز الإجمالي
    IF NEW.available_palm_trees > COALESCE(NEW.total_palm_trees, 0) THEN
      RAISE EXCEPTION 'Available palm trees cannot exceed total palm trees';
    END IF;

    IF NEW.available_olive_trees > COALESCE(NEW.total_olive_trees, 0) THEN
      RAISE EXCEPTION 'Available olive trees cannot exceed total olive trees';
    END IF;

    -- التحقق من نوع المزرعة والأشجار (فقط إذا كانت معتمدة)
    -- إذا كان النوع نخيل فقط، يجب أن يكون هناك نخيل
    IF NEW.farm_type IN ('نخيل', 'palm') AND COALESCE(NEW.total_palm_trees, 0) = 0 THEN
      -- تحذير فقط، لا نمنع العملية
      RAISE NOTICE 'Palm farm should have palm trees';
    END IF;

    -- إذا كان النوع زيتون فقط، يجب أن يكون هناك زيتون
    IF NEW.farm_type IN ('زيتون', 'olive') AND COALESCE(NEW.total_olive_trees, 0) = 0 THEN
      -- تحذير فقط، لا نمنع العملية
      RAISE NOTICE 'Olive farm should have olive trees';
    END IF;
    
  END IF;

  -- تحديث الأشجار المتاحة تلقائياً إذا لم تكن محددة
  IF NEW.available_palm_trees IS NULL THEN
    NEW.available_palm_trees := COALESCE(NEW.total_palm_trees, 0);
  END IF;

  IF NEW.available_olive_trees IS NULL THEN
    NEW.available_olive_trees := COALESCE(NEW.total_olive_trees, 0);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger محسّن
CREATE TRIGGER validate_farm_owner_data_trigger
  BEFORE INSERT OR UPDATE ON farm_owners
  FOR EACH ROW
  EXECUTE FUNCTION validate_farm_owner_data();

-- تحديث السجلات الموجودة لإزالة أي مشاكل
UPDATE farm_owners
SET 
  total_palm_trees = COALESCE(total_palm_trees, 0),
  total_olive_trees = COALESCE(total_olive_trees, 0),
  available_palm_trees = COALESCE(available_palm_trees, total_palm_trees, 0),
  available_olive_trees = COALESCE(available_olive_trees, total_olive_trees, 0)
WHERE deleted_at IS NULL;
