/*
  # تحديث RLS policies لـ booking_items للسماح بـ insert from anon
  
  1. Policies
    - السماح لـ anon بإنشاء booking_items
*/

-- حذف policy القديمة إن وجدت
DROP POLICY IF EXISTS "Allow anon insert booking items" ON booking_items;

-- إضافة policy للسماح بـ insert
CREATE POLICY "Allow anon insert booking items"
  ON booking_items
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- السماح بقراءة booking_items
DROP POLICY IF EXISTS "Allow anon read booking items" ON booking_items;

CREATE POLICY "Allow anon read booking items"
  ON booking_items
  FOR SELECT
  TO anon
  USING (true);
