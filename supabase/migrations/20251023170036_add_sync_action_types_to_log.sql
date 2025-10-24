/*
  # إضافة أنواع أحداث المزامنة

  1. المشكلة
    - financial_base_log لا يتضمن 'owner_synced' و 'investors_synced'
    
  2. الحل
    - إضافة أنواع المزامنة الجديدة
*/

ALTER TABLE financial_base_log 
DROP CONSTRAINT IF EXISTS financial_base_log_action_type_check;

ALTER TABLE financial_base_log
ADD CONSTRAINT financial_base_log_action_type_check
CHECK (action_type IN (
  'farm_created',
  'farm_linked',
  'owner_linked',
  'owner_synced',
  'investor_booking',
  'investors_synced',
  'financial_update',
  'marketing_price_change',
  'actual_price_change',
  'sync_completed',
  'error_occurred'
));
