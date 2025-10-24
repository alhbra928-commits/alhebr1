/*
  # إضافة نوع إشعار account_created

  1. المشكلة
    - الدالة farm_owner_login_or_create تحاول إنشاء إشعار بنوع 'account_created'
    - القيد الحالي لا يسمح بهذا النوع

  2. الحل
    - إضافة 'account_created' إلى قائمة الأنواع المسموحة
*/

-- حذف القيد القديم
ALTER TABLE farm_owner_notifications
DROP CONSTRAINT IF EXISTS farm_owner_notifications_notification_type_check;

-- إضافة القيد الجديد مع account_created
ALTER TABLE farm_owner_notifications
ADD CONSTRAINT farm_owner_notifications_notification_type_check
CHECK (notification_type IN (
  'submission_received',
  'submission_approved', 
  'submission_rejected',
  'farm_published',
  'progress_60_percent',
  'farm_sold_out',
  'payment_settlement',
  'admin_message',
  'system_alert',
  'account_created'
));

COMMENT ON CONSTRAINT farm_owner_notifications_notification_type_check ON farm_owner_notifications 
IS 'أنواع الإشعارات المسموحة لأصحاب المزارع';
