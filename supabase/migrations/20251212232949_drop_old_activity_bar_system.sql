/*
  # حذف النظام القديم لشريط النشاط بالكامل

  1. حذف الجداول
    - حذف جدول `activity_bar_messages`
    - حذف جدول `activity_bar_settings`
    - حذف أي functions أو triggers مرتبطة
  
  2. التنظيف
    - إزالة كل البيانات القديمة
    - تنظيف النظام للبدء من جديد
*/

-- حذف الجداول القديمة
DROP TABLE IF EXISTS activity_bar_messages CASCADE;
DROP TABLE IF EXISTS activity_bar_settings CASCADE;

-- حذف أي functions مرتبطة
DROP FUNCTION IF EXISTS auto_update_activity_bar_timestamp CASCADE;
DROP FUNCTION IF EXISTS log_activity_bar_changes CASCADE;
