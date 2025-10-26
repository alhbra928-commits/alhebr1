/*
  # إضافة unique constraint على farm_code

  1. حذف السجلات المكررة
  2. إضافة UNIQUE constraint
*/

-- حذف المكررات (نبقي الأحدث فقط)
DELETE FROM smart_farm_finances a
USING smart_farm_finances b
WHERE a.id < b.id
  AND a.farm_code = b.farm_code;

-- إضافة unique constraint
ALTER TABLE smart_farm_finances
ADD CONSTRAINT smart_farm_finances_farm_code_unique 
UNIQUE (farm_code);

COMMENT ON CONSTRAINT smart_farm_finances_farm_code_unique ON smart_farm_finances 
IS 'كل مزرعة لها سجل واحد فقط في smart_farm_finances';
