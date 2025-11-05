/*
  # إصلاح constraint مدة السداد
  
  ## المشكلة
  - الـ constraint الحالي يسمح فقط بـ: 3, 6, 9, 12 (أشهر)
  - النظام الجديد يرسل عدد الأيام (مثل 180 يوم)
  
  ## الحل
  - حذف الـ constraint القديم
  - السماح بأي قيمة موجبة
  
  ## الملاحظات
  - هذا يعطي مرونة أكبر في تحديد مدة السداد
  - يمكن تحديد أي عدد من الأيام
*/

-- حذف الـ constraint القديم
ALTER TABLE farm_owners 
DROP CONSTRAINT IF EXISTS farm_owners_payment_grace_period_check;

-- إضافة constraint جديد يسمح بأي قيمة موجبة
ALTER TABLE farm_owners 
ADD CONSTRAINT farm_owners_payment_grace_period_check 
CHECK (payment_grace_period > 0);

-- إضافة تعليق للتوضيح
COMMENT ON COLUMN farm_owners.payment_grace_period IS 'مدة السداد بالأيام - يجب أن تكون أكبر من صفر';
