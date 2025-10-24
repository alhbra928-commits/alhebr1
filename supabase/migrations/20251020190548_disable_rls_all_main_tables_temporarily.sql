/*
  # تعطيل RLS مؤقتاً على الجداول الرئيسية
  
  1. Changes
    - تعطيل RLS على farms, investors, reservations, farm_trees
    - يسمح بالعمليات بدون مصادقة
  
  2. Security Note
    - هذا التعطيل مؤقت فقط
    - سيتم إعادة تفعيل RLS عند إضافة نظام المصادقة الكامل
  
  3. Tables Affected
    - farms: جدول المزارع
    - investors: جدول المستثمرين
    - reservations: جدول الحجوزات
    - farm_trees: جدول الأشجار
*/

ALTER TABLE farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE investors DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE farm_trees DISABLE ROW LEVEL SECURITY;