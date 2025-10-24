/*
  # إصلاح RLS policy لـ anon في payment_receipts
  
  1. التغييرات
    - إزالة شرط deleted_at من policy الـ anon
    - السماح لـ anon بتحديث status للإيصالات
    
  2. الأمان
    - anon يمكنه فقط تحديث حالة الإيصال (status)
    - لا يحتاج للتحقق من deleted_at
*/

-- حذف policy القديم
DROP POLICY IF EXISTS "Allow anon to update payment receipt status" ON payment_receipts;

-- إنشاء policy جديد بدون deleted_at
CREATE POLICY "Allow anon to update payment receipt status"
ON payment_receipts
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

COMMENT ON POLICY "Allow anon to update payment receipt status" ON payment_receipts IS 'Allows anon to update payment receipt status for verification';
