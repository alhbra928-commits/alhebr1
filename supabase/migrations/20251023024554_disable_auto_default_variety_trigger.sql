/*
  # تعطيل إنشاء الصنف التلقائي

  1. التغييرات
    - حذف trigger: auto_create_default_variety
    - حذف function: create_default_variety_for_farm
  
  2. السبب
    - يُنشئ صنف "General Olive" أو "General Palm" تلقائياً
    - هذا يسبب ظهور أصناف غير مرغوبة في صفحة الحجز
    - الأصناف يتم إنشاؤها يدوياً من نموذج المزرعة
  
  3. الملاحظات
    - الأصناف الموجودة لن تتأثر
    - فقط المزارع الجديدة لن تحصل على صنف تلقائي
*/

-- حذف الـ trigger
DROP TRIGGER IF EXISTS auto_create_default_variety ON farms;

-- حذف الـ function
DROP FUNCTION IF EXISTS create_default_variety_for_farm();
