/*
  # إصلاح constraint حقل status في جدول farms

  ## المشكلة:
  - القيد الحالي يسمح بـ: 'active', 'inactive', 'full'
  - التطبيق يستخدم: 'active', 'frozen', 'under_review'
  - هذا عدم توافق يمنع إضافة المزارع

  ## الحل:
  1. حذف القيد القديم (farms_status_check)
  2. إضافة قيد جديد يقبل القيم التي يستخدمها التطبيق
  3. تحديث أي بيانات موجودة

  ## التغييرات:
  - حذف: CHECK ((status = ANY (ARRAY['active', 'inactive', 'full'])))
  - إضافة: CHECK (status IN ('active', 'frozen', 'under_review', 'archived'))
*/

-- حذف القيد القديم
ALTER TABLE farms 
DROP CONSTRAINT IF EXISTS farms_status_check;

-- تحديث البيانات الموجودة
UPDATE farms 
SET status = CASE 
  WHEN status = 'inactive' THEN 'frozen'
  WHEN status = 'full' THEN 'archived'
  ELSE status
END
WHERE status IN ('inactive', 'full');

-- إضافة القيد الجديد المطابق للتطبيق
ALTER TABLE farms 
ADD CONSTRAINT farms_status_check 
CHECK (status IN ('active', 'frozen', 'under_review', 'archived'));
