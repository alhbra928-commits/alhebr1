/*
  # إصلاح قيد نوع الشجرة في جدول farm_tree_varieties
  
  1. التغييرات:
    - إضافة "مختلط" كقيمة مسموح بها في tree_type
    - السماح بالقيم: 'نخيل', 'زيتون', 'مختلط'
  
  2. الهدف:
    - إصلاح خطأ إضافة المزارع المختلطة
    - دعم المزارع التي تحتوي على أكثر من نوع شجرة
*/

-- إزالة constraint القديم
ALTER TABLE farm_tree_varieties 
DROP CONSTRAINT IF EXISTS farm_tree_varieties_tree_type_check;

-- إضافة constraint جديد يسمح بـ "مختلط" أيضاً
ALTER TABLE farm_tree_varieties
ADD CONSTRAINT farm_tree_varieties_tree_type_check 
CHECK (tree_type IN ('نخيل', 'زيتون', 'مختلط'));