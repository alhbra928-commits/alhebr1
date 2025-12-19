/*
  # حذف الـ triggers القديمة على analytics_events
  
  المشكلة: trigger قديم يحاول الوصول لأعمدة غير موجودة
  الحل: حذف جميع الـ triggers القديمة
*/

-- حذف الـ trigger القديم
DROP TRIGGER IF EXISTS trigger_update_campaign_stats ON analytics_events;
DROP TRIGGER IF EXISTS trigger_auto_increment_events ON analytics_events;

-- حذف الـ functions القديمة
DROP FUNCTION IF EXISTS update_campaign_stats();
DROP FUNCTION IF EXISTS auto_increment_events_count();

COMMENT ON TABLE analytics_events IS 'Old triggers removed - ready for new schema';
