/*
  # إصلاح حقل user_id في جدول notifications ليكون nullable
  
  ## المشكلة
  - عند تحديث حجز، يتم تحديث الإحصائيات المالية
  - عند اكتمال التمويل، يتم إنشاء notification
  - حقل user_id في notifications مطلوب (NOT NULL)
  - لكن الإشعارات المالية ليست موجهة لمستخدم محدد
  
  ## الحل
  - جعل user_id nullable في جدول notifications
  - الإشعارات العامة (system notifications) ستكون بدون user_id
  - الإشعارات الموجهة لمستخدمين ستحتوي على user_id
*/

-- جعل user_id nullable
ALTER TABLE notifications 
ALTER COLUMN user_id DROP NOT NULL;

COMMENT ON COLUMN notifications.user_id IS 
'معرّف المستخدم المستهدف - NULL للإشعارات العامة (system notifications)';
