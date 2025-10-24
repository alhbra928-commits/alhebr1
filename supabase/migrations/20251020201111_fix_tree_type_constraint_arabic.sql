/*
  # إصلاح constraint حقل tree_type في جدول farms

  ## المشكلة:
  - القيد الحالي يسمح فقط بـ 'palm' و 'olive' بالإنجليزية
  - التطبيق يرسل القيم بالعربية: 'نخيل', 'زيتون', 'مختلط'
  - هذا يمنع إضافة أي مزرعة جديدة

  ## الحل:
  1. حذف القيد القديم (farms_tree_type_check)
  2. إضافة قيد جديد يقبل القيم العربية الثلاث
  3. تحديث أي بيانات موجودة من الإنجليزية للعربية

  ## التغييرات:
  - حذف: CHECK ((tree_type = ANY (ARRAY['palm'::text, 'olive'::text])))
  - إضافة: CHECK (tree_type IN ('نخيل', 'زيتون', 'مختلط'))
*/

-- حذف القيد القديم
ALTER TABLE farms 
DROP CONSTRAINT IF EXISTS farms_tree_type_check;

-- تحديث البيانات الموجودة من الإنجليزية للعربية
UPDATE farms 
SET tree_type = CASE 
  WHEN tree_type = 'palm' THEN 'نخيل'
  WHEN tree_type = 'olive' THEN 'زيتون'
  ELSE tree_type
END
WHERE tree_type IN ('palm', 'olive');

-- إضافة القيد الجديد بالقيم العربية
ALTER TABLE farms 
ADD CONSTRAINT farms_tree_type_check 
CHECK (tree_type IN ('نخيل', 'زيتون', 'مختلط'));
