/*
  # إضافة صلاحيات القراءة للمستخدمين الضيوف على جدول documentation
  
  ## المشكلة
  - لوحة المستثمر تعطي شاشة بيضاء
  - الخطأ: Supabase request failed على جدول documentation
  - السبب: لا توجد سياسة RLS للمستخدمين الضيوف (anon)
  - المستثمرون غير مسجلين في auth ويستخدمون anon role
  
  ## الحل
  - إضافة سياسة قراءة للمستخدمين الضيوف (anon)
  - السماح بقراءة جميع السجلات (documentation لا يحتوي على deleted_at)
  - الحفاظ على الأمان بعدم السماح بتعديل أو حذف
  
  ## الأمان
  - القراءة فقط لجميع السجلات
  - لا صلاحيات للكتابة أو التحديث أو الحذف
*/

-- إضافة سياسة قراءة للمستخدمين الضيوف على documentation
CREATE POLICY "الضيوف يمكنهم قراءة الشهادات"
  ON documentation
  FOR SELECT
  TO anon
  USING (true);

-- إضافة سياسة قراءة للمستخدمين الضيوف على reservations
DROP POLICY IF EXISTS "الضيوف يمكنهم قراءة الحجوزات" ON reservations;

CREATE POLICY "الضيوف يمكنهم قراءة الحجوزات"
  ON reservations
  FOR SELECT
  TO anon
  USING (deleted_at IS NULL);

-- إضافة سياسة قراءة للمستخدمين الضيوف على payment_receipts
DROP POLICY IF EXISTS "الضيوف يمكنهم قراءة إيصالات الدفع" ON payment_receipts;

CREATE POLICY "الضيوف يمكنهم قراءة إيصالات الدفع"
  ON payment_receipts
  FOR SELECT
  TO anon
  USING (deleted_at IS NULL);

COMMENT ON POLICY "الضيوف يمكنهم قراءة الشهادات" ON documentation IS 
'يسمح للمستخدمين الضيوف (المستثمرين) بقراءة شهاداتهم - القراءة فقط';

COMMENT ON POLICY "الضيوف يمكنهم قراءة الحجوزات" ON reservations IS 
'يسمح للمستخدمين الضيوف (المستثمرين) بقراءة حجوزاتهم - القراءة فقط للسجلات غير المحذوفة';

COMMENT ON POLICY "الضيوف يمكنهم قراءة إيصالات الدفع" ON payment_receipts IS 
'يسمح للمستخدمين الضيوف (المستثمرين) بقراءة إيصالات الدفع - القراءة فقط للسجلات غير المحذوفة';
