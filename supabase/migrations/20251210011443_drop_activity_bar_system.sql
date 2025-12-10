/*
  # حذف نظام شريط النشاط المباشر بالكامل

  1. الجداول المحذوفة
    - `activity_bar_settings` - إعدادات شريط النشاط
    - `platform_activities` - أحداث النشاط

  2. التأثير
    - حذف كامل لجداول شريط النشاط
    - لا يوجد أثر في قاعدة البيانات
    - حذف نهائي ومن الجذور

  ملاحظة: تم الحذف بطلب المستخدم بشكل نهائي
*/

-- حذف جدول الأحداث أولاً (بسبب foreign keys)
DROP TABLE IF EXISTS platform_activities CASCADE;

-- حذف جدول الإعدادات
DROP TABLE IF EXISTS activity_bar_settings CASCADE;
