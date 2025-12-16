/*
  # تفعيل Triggers النظام المالي الذكي
  
  ## المشكلة المكتشفة
  - الـ triggers المالية كانت معطّلة (DISABLED)
  - عند إنشاء مزرعة جديدة، لا تُنشأ بطاقة مالية تلقائياً
  - عند إنشاء حجز، لا يتم تحديث المبالغ تلقائياً
  
  ## الحل
  تفعيل جميع الـ triggers المالية:
  1. trigger_create_farm_finance_card → لإنشاء بطاقة مالية عند إضافة مزرعة
  2. trigger_update_marketing_amount → لتحديث المبلغ التسويقي عند الحجز
  3. trigger_calculate_farm_finances → لحساب المبالغ المالية تلقائياً
  
  ## التغييرات
  - تفعيل الـ triggers الثلاثة
  - التحقق من حالتها
*/

-- ═══════════════════════════════════════════════════════════
-- تفعيل جميع الـ Triggers المالية
-- ═══════════════════════════════════════════════════════════

-- 1. تفعيل trigger إنشاء البطاقة المالية عند إضافة مزرعة
ALTER TABLE farms ENABLE TRIGGER trigger_create_farm_finance_card;

-- 2. تفعيل trigger تحديث المبلغ التسويقي عند الحجز
ALTER TABLE reservations ENABLE TRIGGER trigger_update_marketing_amount;

-- 3. تفعيل trigger حساب المبالغ المالية
ALTER TABLE smart_farm_finances ENABLE TRIGGER trigger_calculate_farm_finances;

-- ═══════════════════════════════════════════════════════════
-- إنشاء function للتحقق من حالة الـ triggers
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_financial_triggers_status()
RETURNS TABLE(
  trigger_name TEXT,
  table_name TEXT,
  status TEXT,
  is_enabled BOOLEAN
)
LANGUAGE SQL
AS $$
  SELECT 
    t.tgname::TEXT as trigger_name,
    c.relname::TEXT as table_name,
    CASE t.tgenabled
      WHEN 'O' THEN 'ENABLED'
      WHEN 'D' THEN 'DISABLED'
      WHEN 'R' THEN 'REPLICA'
      WHEN 'A' THEN 'ALWAYS'
    END as status,
    (t.tgenabled = 'O' OR t.tgenabled = 'A') as is_enabled
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  WHERE t.tgname IN (
    'trigger_create_farm_finance_card',
    'trigger_update_marketing_amount',
    'trigger_calculate_farm_finances'
  )
  ORDER BY c.relname, t.tgname;
$$;

COMMENT ON FUNCTION check_financial_triggers_status() IS 'فحص حالة الـ triggers المالية للتأكد من تفعيلها';
