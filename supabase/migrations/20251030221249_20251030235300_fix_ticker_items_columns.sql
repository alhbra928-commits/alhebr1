/*
  # إصلاح جدول ticker_items لمطابقة الكود

  1. الأعمدة الجديدة
    - ticker_type: نوع الشريط (header/main)
    - content_ar: المحتوى بالعربي
    - content_en: المحتوى بالإنجليزي
    - icon_name: اسم الأيقونة
    - icon_color: لون الأيقونة
    - text_color: لون النص

  2. إعادة تسمية الأعمدة
    - label → content_ar
    - label_en → content_en
    - icon → icon_name
    - color → icon_color
*/

-- إضافة الأعمدة الجديدة
DO $$
BEGIN
  -- ticker_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_items' AND column_name = 'ticker_type'
  ) THEN
    ALTER TABLE ticker_items
    ADD COLUMN ticker_type text DEFAULT 'main' NOT NULL;
  END IF;

  -- content_ar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_items' AND column_name = 'content_ar'
  ) THEN
    ALTER TABLE ticker_items
    ADD COLUMN content_ar text;
  END IF;

  -- content_en
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_items' AND column_name = 'content_en'
  ) THEN
    ALTER TABLE ticker_items
    ADD COLUMN content_en text;
  END IF;

  -- icon_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_items' AND column_name = 'icon_name'
  ) THEN
    ALTER TABLE ticker_items
    ADD COLUMN icon_name text DEFAULT 'Star';
  END IF;

  -- icon_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_items' AND column_name = 'icon_color'
  ) THEN
    ALTER TABLE ticker_items
    ADD COLUMN icon_color text DEFAULT 'emerald-600';
  END IF;

  -- text_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticker_items' AND column_name = 'text_color'
  ) THEN
    ALTER TABLE ticker_items
    ADD COLUMN text_color text DEFAULT 'gray-800';
  END IF;

END $$;

-- نسخ البيانات من الأعمدة القديمة
UPDATE ticker_items
SET
  content_ar = COALESCE(label, 'نص الشريط'),
  content_en = label_en,
  icon_name = COALESCE(icon, 'Star'),
  icon_color = CASE 
    WHEN color = '#10b981' THEN 'emerald-600'
    WHEN color = '#3b82f6' THEN 'blue-600'
    WHEN color = '#8b5cf6' THEN 'purple-600'
    WHEN color = '#f59e0b' THEN 'amber-600'
    ELSE 'emerald-600'
  END,
  text_color = 'gray-800',
  ticker_type = 'main',
  updated_at = now()
WHERE id IS NOT NULL;

-- إضافة NOT NULL constraint لـ content_ar بعد نسخ البيانات
ALTER TABLE ticker_items 
ALTER COLUMN content_ar SET NOT NULL;

-- إضافة CHECK constraints
DO $$
BEGIN
  ALTER TABLE ticker_items
  ADD CONSTRAINT check_ticker_items_type
  CHECK (ticker_type IN ('header', 'main'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_ticker_items_type_active
  ON ticker_items(ticker_type, is_active);

CREATE INDEX IF NOT EXISTS idx_ticker_items_sort_order
  ON ticker_items(sort_order);
