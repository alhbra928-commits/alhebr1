/*
  # تنظيف البيانات الوهمية - الإبقاء على مزرعة الخالدية فقط
  
  1. التغييرات
    - حذف جميع المزارع الوهمية
    - الإبقاء فقط على FARM-2025-0003 (مزرعة الخالدية)
    - حذف البيانات المالية المرتبطة بالمزارع الوهمية
    
  2. الأمان
    - حذف نهائي للبيانات الوهمية
    - لن يؤثر على الحجوزات الفعلية
*/

-- 1. حذف الحالات المالية للمزارع الوهمية
DELETE FROM farm_financial_states
WHERE farm_barcode != 'FARM-2025-0003';

-- 2. حذف المحافظ المالية للمزارع الوهمية
DELETE FROM farm_wallets
WHERE farm_barcode != 'FARM-2025-0003';

-- 3. تنظيف أصناف الأشجار للمزارع الوهمية
DELETE FROM farm_tree_varieties
WHERE farm_id NOT IN (
  SELECT id FROM farms WHERE farm_code = 'FARM-2025-0003' AND deleted_at IS NULL
);

-- 4. soft delete للمزارع الوهمية (بدون deleted_by)
UPDATE farms
SET 
  deleted_at = now(),
  updated_at = now()
WHERE farm_code != 'FARM-2025-0003'
AND deleted_at IS NULL;

-- 5. إضافة ملاحظة
COMMENT ON TABLE farms IS 'تم تنظيف المزارع الوهمية - مزرعة الخالدية فقط متاحة';
COMMENT ON TABLE farm_wallets IS 'تم تنظيف المحافظ الوهمية - محفظة الخالدية فقط';
