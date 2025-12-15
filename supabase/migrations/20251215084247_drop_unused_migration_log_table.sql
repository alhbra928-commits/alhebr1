/*
  # إزالة جدول migration_log غير المستخدم

  1. التغييرات
    - حذف جدول `migration_log` القديم
    - حذف الـ indexes المرتبطة
    - حذف RLS policies المرتبطة

  2. السبب
    - الجدول لم يعد مستخدمًا في النظام
    - النظام يستخدم الآن `audit_log` بدلاً منه
    - يسبب أخطاء 400 في Console
*/

-- حذف RLS policies أولاً
DROP POLICY IF EXISTS "Admin can view migration log" ON migration_log;
DROP POLICY IF EXISTS "System can insert migration log" ON migration_log;

-- حذف الـ indexes
DROP INDEX IF EXISTS idx_migration_log_booking_id;
DROP INDEX IF EXISTS idx_migration_log_documentation_id;

-- حذف الجدول
DROP TABLE IF EXISTS migration_log CASCADE;
