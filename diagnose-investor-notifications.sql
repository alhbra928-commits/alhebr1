-- تشخيص: لماذا لا تصل الإشعارات للمستثمر محمد إبراهيم؟

-- 1. هل المستثمر موجود في جدول investors؟
SELECT 
  '1. Investor Check' as step,
  id,
  full_name,
  phone,
  status,
  deleted_at
FROM investors
WHERE full_name ILIKE '%محمد%إبراهيم%' 
   OR full_name ILIKE '%محمد%ابراهيم%'
   OR phone IN (SELECT customer_phone FROM reservations WHERE customer_name ILIKE '%محمد%');

-- 2. هل الحجز موجود في جدول reservations؟
SELECT 
  '2. Reservation Check' as step,
  id,
  customer_name,
  customer_phone,
  booking_status,
  status,
  investor_id,
  deleted_at
FROM reservations
WHERE customer_name ILIKE '%محمد%';

-- 3. هل هناك إشعارات للمستثمر؟
SELECT 
  '3. Notifications Check' as step,
  n.id,
  n.investor_id,
  n.booking_id,
  n.type,
  n.title,
  n.message,
  n.read_at,
  n.created_at,
  i.full_name,
  i.phone
FROM notifications n
LEFT JOIN investors i ON n.investor_id = i.id
WHERE i.full_name ILIKE '%محمد%'
ORDER BY n.created_at DESC
LIMIT 10;

-- 4. آخر تغييرات حالة الحجوزات
SELECT 
  '4. State Changes Check' as step,
  bsc.id,
  bsc.booking_id,
  bsc.old_booking_status,
  bsc.new_booking_status,
  bsc.changed_by,
  bsc.changed_at,
  r.customer_name
FROM booking_state_changes bsc
LEFT JOIN reservations r ON bsc.booking_id = r.id
WHERE r.customer_name ILIKE '%محمد%'
ORDER BY bsc.changed_at DESC
LIMIT 5;

-- 5. التحقق من الـ trigger
SELECT 
  '5. Trigger Check' as step,
  tgname as trigger_name,
  tgenabled as is_enabled,
  tgtype as trigger_type
FROM pg_trigger
WHERE tgname = 'trigger_generate_booking_notification';

-- 6. إحصائيات عامة
SELECT 
  '6. General Stats' as step,
  COUNT(*) as total_investors
FROM investors
WHERE deleted_at IS NULL;

SELECT 
  '6. General Stats' as step,
  COUNT(*) as total_reservations
FROM reservations
WHERE deleted_at IS NULL;

SELECT 
  '6. General Stats' as step,
  COUNT(*) as total_notifications
FROM notifications;
