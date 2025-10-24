/*
  # إضافة 'completed' إلى قيم payment_status المسموحة

  1. المشكلة
    - القيم الحالية المسموحة: pending, paid, refunded
    - نحتاج 'completed' للإشارة إلى اكتمال الدفع والتحقق من الإيصال
    
  2. الحل
    - إضافة 'completed' إلى check constraint
    - تحديث trigger ليستخدم 'completed' (أو يمكن استخدام 'paid')
    
  3. سلسلة حالات الدفع
    pending → paid/completed (عند التحقق من الإيصال)
*/

-- إزالة constraint القديم
ALTER TABLE reservations 
DROP CONSTRAINT IF EXISTS reservations_payment_status_check;

-- إضافة constraint جديد يتضمن 'completed'
ALTER TABLE reservations
ADD CONSTRAINT reservations_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'completed', 'refunded'));

-- تحديث الوصف
COMMENT ON COLUMN reservations.payment_status IS 'حالة الدفع: pending (معلق), paid (مدفوع), completed (مكتمل ومتحقق منه), refunded (مسترجع)';
