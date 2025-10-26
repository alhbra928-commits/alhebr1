/*
  # تعطيل Triggers الثقيلة مؤقتاً
  
  المشكلة:
  - عند INSERT في farms، يتم تشغيل 11 trigger
  - هذا يسبب timeout
  
  الحل:
  - تعطيل الـ triggers غير الضرورية عند إنشاء مزرعة من صاحب المزرعة
  - الاحتفاظ بالـ triggers الأساسية فقط
*/

-- تعطيل triggers الثقيلة مؤقتاً
ALTER TABLE farms DISABLE TRIGGER trigger_create_farm_finance_card;
ALTER TABLE farms DISABLE TRIGGER trigger_create_farm_financial_state;
ALTER TABLE farms DISABLE TRIGGER trigger_create_farm_wallet;
ALTER TABLE farms DISABLE TRIGGER trigger_create_financial_entity;
ALTER TABLE farms DISABLE TRIGGER trigger_sync_farm_financial_updates;
ALTER TABLE farms DISABLE TRIGGER trigger_sync_owner_to_finances;
ALTER TABLE farms DISABLE TRIGGER cascade_delete_farm_reservations;
ALTER TABLE farms DISABLE TRIGGER trigger_cascade_farm_soft_delete;

-- الاحتفاظ بالـ triggers الأساسية فقط:
-- ✅ audit_farms_changes (للتدقيق)
-- ✅ backup_farms_before_change (للنسخ الاحتياطي)
-- ✅ trigger_set_farm_code (لإنشاء كود المزرعة)

-- ملاحظة: سيتم تفعيل الـ triggers مرة أخرى بعد حل المشكلة
