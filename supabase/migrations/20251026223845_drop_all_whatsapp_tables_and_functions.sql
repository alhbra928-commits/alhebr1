/*
  # حذف نظام الواتساب بالكامل

  ## التغييرات
  1. حذف جميع الـ Triggers المرتبطة بالواتساب
  2. حذف جميع الـ Functions المرتبطة بالواتساب
  3. حذف جميع جداول الواتساب

  ## الهدف
  - تنظيف النظام بالكامل من إدارة الواتساب القديمة
  - التحضير لنظام جديد في المستقبل
*/

-- =====================================
-- 1. حذف جميع Triggers المرتبطة بالواتساب
-- =====================================

DROP TRIGGER IF EXISTS trigger_whatsapp_certificate_issued ON documentation;
DROP TRIGGER IF EXISTS trigger_whatsapp_welcome_investor ON investors;
DROP TRIGGER IF EXISTS trigger_whatsapp_new_booking ON reservations;
DROP TRIGGER IF EXISTS trigger_whatsapp_booking_confirmed ON reservations;
DROP TRIGGER IF EXISTS trigger_receipt_rejection_notification ON payment_receipts;
DROP TRIGGER IF EXISTS trigger_update_whatsapp_daily_stats ON whatsapp_messages;
DROP TRIGGER IF EXISTS update_whatsapp_analytics_updated_at ON whatsapp_analytics;
DROP TRIGGER IF EXISTS update_whatsapp_quick_replies_updated_at ON whatsapp_quick_replies;
DROP TRIGGER IF EXISTS update_whatsapp_user_preferences_updated_at ON whatsapp_user_preferences;

-- =====================================
-- 2. حذف جميع Functions المرتبطة بالواتساب
-- =====================================

DROP FUNCTION IF EXISTS notify_whatsapp_certificate_issued() CASCADE;
DROP FUNCTION IF EXISTS notify_whatsapp_welcome_investor() CASCADE;
DROP FUNCTION IF EXISTS notify_whatsapp_new_booking() CASCADE;
DROP FUNCTION IF EXISTS notify_whatsapp_booking_confirmed() CASCADE;
DROP FUNCTION IF EXISTS create_receipt_rejection_notification() CASCADE;
DROP FUNCTION IF EXISTS update_whatsapp_daily_stats() CASCADE;
DROP FUNCTION IF EXISTS update_whatsapp_updated_at() CASCADE;

-- =====================================
-- 3. حذف جميع جداول الواتساب
-- =====================================

DROP TABLE IF EXISTS whatsapp_user_sessions CASCADE;
DROP TABLE IF EXISTS whatsapp_user_preferences CASCADE;
DROP TABLE IF EXISTS whatsapp_staff_analytics CASCADE;
DROP TABLE IF EXISTS whatsapp_staff CASCADE;
DROP TABLE IF EXISTS whatsapp_smart_routing CASCADE;
DROP TABLE IF EXISTS whatsapp_settings CASCADE;
DROP TABLE IF EXISTS whatsapp_quick_replies CASCADE;
DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS whatsapp_message_templates CASCADE;
DROP TABLE IF EXISTS whatsapp_live_notifications CASCADE;
DROP TABLE IF EXISTS whatsapp_interaction_analytics CASCADE;
DROP TABLE IF EXISTS whatsapp_floating_settings CASCADE;
DROP TABLE IF EXISTS whatsapp_departments CASCADE;
DROP TABLE IF EXISTS whatsapp_daily_stats CASCADE;
DROP TABLE IF EXISTS whatsapp_conversations CASCADE;
DROP TABLE IF EXISTS whatsapp_contextual_messages CASCADE;
DROP TABLE IF EXISTS whatsapp_context_logs CASCADE;
DROP TABLE IF EXISTS whatsapp_contact_numbers CASCADE;
DROP TABLE IF EXISTS whatsapp_broadcast_campaigns CASCADE;
DROP TABLE IF EXISTS whatsapp_automation_rules CASCADE;
DROP TABLE IF EXISTS whatsapp_analytics CASCADE;
DROP TABLE IF EXISTS whatsapp_admin_notifications CASCADE;

-- تأكيد
COMMENT ON SCHEMA public IS 'تم حذف نظام الواتساب بالكامل - جاهز للبدء من جديد';
