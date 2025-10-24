/*
  # إزالة قيد التفرد من farm_code في smart_farm_finances
  
  ## المشكلة
  - farm_code له unique constraint
  - عند إعادة المحاولة من cache المتصفح، يحدث خطأ duplicate key
  - الـ ON CONFLICT لا يعمل لأن الكود القديم محفوظ في cache
  
  ## الحل
  - إزالة unique constraint من farm_code
  - farm_id هو الـ foreign key وهو كافي للربط
  - farm_code يمكن أن يتكرر مؤقتاً أثناء التزامن
  
  ## التغييرات
  1. حذف constraint: smart_farm_finances_farm_code_key
  2. الاعتماد على farm_id كـ foreign key رئيسي
*/

-- ═══════════════════════════════════════════════════════════
-- إزالة unique constraint من farm_code
-- ═══════════════════════════════════════════════════════════

ALTER TABLE smart_farm_finances 
DROP CONSTRAINT IF EXISTS smart_farm_finances_farm_code_key;

-- ═══════════════════════════════════════════════════════════
-- إضافة index عادي (غير unique) لتحسين الأداء
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_smart_farm_finances_farm_code 
ON smart_farm_finances(farm_code)
WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_smart_farm_finances_farm_code IS 'Index عادي (غير unique) لتسريع البحث بـ farm_code';
