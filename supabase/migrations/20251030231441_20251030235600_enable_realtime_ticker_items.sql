/*
  # تفعيل Realtime للشريط المتحرك

  1. التغييرات:
    - تفعيل Realtime على جدول ticker_items
    - تفعيل Realtime على جدول ticker_settings

  2. السبب:
    - لضمان ظهور التحديثات فوراً في الشريط
    - عند إضافة/تعديل/حذف الرسائل تظهر مباشرة
    - تجربة مستخدم سلسة

  3. الملاحظات:
    - Realtime subscription موجود في الكود
    - لكن الجدول لم يكن مفعّل للـ publication
    - الآن سيعمل التزامن الفوري
*/

-- Enable realtime for ticker_items
ALTER PUBLICATION supabase_realtime ADD TABLE ticker_items;

-- Enable realtime for ticker_settings
ALTER PUBLICATION supabase_realtime ADD TABLE ticker_settings;

-- Verify activation
DO $$
DECLARE
  items_enabled boolean;
  settings_enabled boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'ticker_items'
  ) INTO items_enabled;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'ticker_settings'
  ) INTO settings_enabled;
  
  RAISE NOTICE '✅ Realtime Status:';
  RAISE NOTICE '   - ticker_items: %', CASE WHEN items_enabled THEN 'ENABLED ✓' ELSE 'DISABLED ✗' END;
  RAISE NOTICE '   - ticker_settings: %', CASE WHEN settings_enabled THEN 'ENABLED ✓' ELSE 'DISABLED ✗' END;
END $$;
