-- ============================================
-- حل مشكلة حذف المستثمرين المتبقيين
-- ============================================
-- المشكلة: مستثمران لم يُحذفا لأنهما مرتبطان بحجوزات

-- المستثمرين المتبقيين:
-- 1. راشد - 567849560 - 3 أشجار
-- 2. سعد - 555553444 - شجرة واحدة

-- ============================================
-- الحل: حذف كامل ونهائي مع جميع البيانات المرتبطة
-- ============================================

BEGIN;

-- 1. حذف booking_items المرتبطة بالحجوزات
DELETE FROM booking_items
WHERE booking_id IN (
  SELECT id FROM reservations WHERE deleted_at IS NULL
);

-- 2. حذف payment_receipts المرتبطة
DELETE FROM payment_receipts
WHERE reservation_id IN (
  SELECT id FROM reservations WHERE deleted_at IS NULL
);

-- 3. حذف documentation المرتبطة
UPDATE documentation
SET
  deleted_at = NOW(),
  deleted_by = auth.uid()
WHERE booking_id IN (
  SELECT id FROM reservations WHERE deleted_at IS NULL
)
AND deleted_at IS NULL;

-- 4. حذف الحجوزات نهائياً (soft delete)
UPDATE reservations
SET
  deleted_at = NOW(),
  deleted_by = auth.uid()
WHERE deleted_at IS NULL;

-- 5. حذف المستثمرين نهائياً (soft delete)
UPDATE investors
SET
  deleted_at = NOW(),
  deleted_by = auth.uid(),
  total_trees_owned = 0,
  total_invested = 0
WHERE deleted_at IS NULL;

COMMIT;

-- ============================================
-- التحقق من النتيجة
-- ============================================

SELECT
  'investors' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted
FROM investors
UNION ALL
SELECT
  'reservations',
  COUNT(*),
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END),
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END)
FROM reservations;
