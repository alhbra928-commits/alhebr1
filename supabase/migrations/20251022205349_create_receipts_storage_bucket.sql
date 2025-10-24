/*
  # إنشاء Storage Bucket لإيصالات السداد
  
  1. Bucket Configuration
    - اسم الـ bucket: receipts
    - عام (public): نعم
    - حجم الملف الأقصى: 5MB
    - الأنواع المسموحة: صور (jpg, png) و PDF
  
  2. Security Policies
    - السماح للمستخدمين غير المصادق عليهم برفع الملفات
    - السماح للجميع بقراءة الملفات
    - السماح للمشرفين بحذف الملفات
*/

-- إنشاء bucket للإيصالات
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- السماح للجميع برفع الملفات
DROP POLICY IF EXISTS "Allow public upload to receipts" ON storage.objects;
CREATE POLICY "Allow public upload to receipts"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'receipts');

-- السماح للجميع بقراءة الملفات
DROP POLICY IF EXISTS "Allow public read from receipts" ON storage.objects;
CREATE POLICY "Allow public read from receipts"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'receipts');

-- السماح للمشرفين بحذف الملفات
DROP POLICY IF EXISTS "Allow authenticated delete from receipts" ON storage.objects;
CREATE POLICY "Allow authenticated delete from receipts"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'receipts');