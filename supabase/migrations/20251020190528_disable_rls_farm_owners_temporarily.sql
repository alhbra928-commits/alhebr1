/*
  # تعطيل RLS مؤقتاً لجدول farm_owners
  
  1. Changes
    - تعطيل RLS على جدول farm_owners مؤقتاً للسماح بالإضافة والتعديل
    - سيتم إعادة تفعيله عند إضافة نظام المصادقة
  
  2. Security Note
    - هذا التعطيل مؤقت فقط
    - يجب إعادة تفعيل RLS عند إضافة Authentication
*/

-- تعطيل RLS مؤقتاً
ALTER TABLE farm_owners DISABLE ROW LEVEL SECURITY;