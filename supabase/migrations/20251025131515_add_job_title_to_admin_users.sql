/*
  # إضافة حقل المسمى الوظيفي لجدول المستخدمين الإداريين

  1. تعديلات على الجدول
    - إضافة حقل `job_title` (المسمى الوظيفي بالعربية) إلى جدول `admin_users`
    - إضافة حقل `job_title_en` (المسمى الوظيفي بالإنجليزية) إلى جدول `admin_users`
  
  2. التحديثات
    - تحديث المسمى الوظيفي للمدير العام
    - تحديث المسمى الوظيفي لأسماء التميمي
*/

-- إضافة حقل المسمى الوظيفي
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS job_title_en TEXT;

-- تحديث المسميات الوظيفية للمستخدمين الحاليين
UPDATE admin_users
SET 
  job_title = 'المدير العام',
  job_title_en = 'General Manager'
WHERE phone = '0500000001';

UPDATE admin_users
SET 
  job_title = 'مديرة العمليات',
  job_title_en = 'Operations Manager'
WHERE phone = '0500000088';
