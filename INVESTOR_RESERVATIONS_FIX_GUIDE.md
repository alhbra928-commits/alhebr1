# 🔍 حل مشكلة عدم ظهور الحجوزات في لوحة تحكم المستثمر

## المشكلة
بعد قيام المستثمر بحجز، لا تظهر الحجوزات في لوحة التحكم الخاصة به.

## التشخيص

### 1. استخدم أداة التشخيص
افتح الملف: `test-investor-reservations-debug.html` في المتصفح واختبر رقم هاتف المستثمر.

### 2. الأسباب المحتملة

#### أ) المستثمر غير موجود في قاعدة البيانات
**الأعراض:**
- لا يوجد سجل في جدول `investors`
- لا توجد حجوزات

**الحل:**
- تأكد من إنشاء حجز أولاً من الواجهة العامة
- الحجز سيقوم تلقائياً بإنشاء سجل المستثمر

#### ب) الحجوزات محذوفة (Soft Delete)
**الأعراض:**
- المستثمر موجود
- الحجوزات موجودة لكن `deleted_at IS NOT NULL`

**الحل:**
```sql
-- استعادة الحجوزات المحذوفة
UPDATE reservations
SET deleted_at = NULL, deleted_by = NULL
WHERE customer_phone = 'رقم_الهاتف'
  AND deleted_at IS NOT NULL;
```

#### ج) عدم تطابق رقم الهاتف
**الأعراض:**
- المستثمر موجود برقم هاتف
- الحجوزات موجودة برقم هاتف مختلف قليلاً (مثل بوجود أو عدم وجود 0 في البداية)

**الحل:**
```sql
-- فحص تطابق الأرقام
SELECT
  i.phone as investor_phone,
  r.customer_phone as reservation_phone,
  r.id as reservation_id
FROM investors i
LEFT JOIN reservations r ON r.customer_phone = i.phone
WHERE i.phone = 'رقم_الهاتف';

-- توحيد الأرقام
UPDATE reservations
SET customer_phone = 'الرقم_الصحيح'
WHERE customer_phone = 'الرقم_الخاطئ';
```

#### د) عدم ربط investor_id
**الأعراض:**
- الحجوزات موجودة
- `investor_id` فارغ (NULL)

**الحل:**
```sql
-- ربط الحجوزات بالمستثمر تلقائياً
UPDATE reservations r
SET investor_id = i.id
FROM investors i
WHERE r.customer_phone = i.phone
  AND r.investor_id IS NULL
  AND r.deleted_at IS NULL;
```

## الفحص السريع

### 1. فحص المستثمر
```sql
SELECT * FROM investors
WHERE phone = 'رقم_الهاتف'
  AND deleted_at IS NULL;
```

### 2. فحص الحجوزات
```sql
SELECT
  id,
  customer_name,
  customer_phone,
  investor_id,
  number_of_trees,
  total_amount,
  status,
  booking_status,
  deleted_at
FROM reservations
WHERE customer_phone = 'رقم_الهاتف'
ORDER BY created_at DESC;
```

### 3. فحص الربط
```sql
SELECT
  r.id as reservation_id,
  r.customer_name,
  r.customer_phone,
  r.investor_id,
  i.id as investor_table_id,
  i.full_name,
  i.phone as investor_phone
FROM reservations r
LEFT JOIN investors i ON r.customer_phone = i.phone
WHERE r.customer_phone = 'رقم_الهاتف'
  AND r.deleted_at IS NULL;
```

## الحلول الشاملة

### الحل 1: إعادة مزامنة البيانات
```sql
-- 1. إنشاء أو تحديث المستثمر
INSERT INTO investors (phone, full_name, status)
SELECT DISTINCT
  customer_phone,
  customer_name,
  'active'
FROM reservations
WHERE deleted_at IS NULL
  AND customer_phone NOT IN (SELECT phone FROM investors WHERE deleted_at IS NULL)
ON CONFLICT (phone) DO NOTHING;

-- 2. ربط الحجوزات بالمستثمرين
UPDATE reservations r
SET investor_id = i.id
FROM investors i
WHERE r.customer_phone = i.phone
  AND r.investor_id IS NULL
  AND r.deleted_at IS NULL
  AND i.deleted_at IS NULL;
```

### الحل 2: تطبيع أرقام الهواتف
```sql
-- إزالة الأصفار من البداية
UPDATE investors
SET phone = LTRIM(phone, '0')
WHERE phone LIKE '0%';

UPDATE reservations
SET customer_phone = LTRIM(customer_phone, '0')
WHERE customer_phone LIKE '0%';

-- إعادة الربط
UPDATE reservations r
SET investor_id = i.id
FROM investors i
WHERE r.customer_phone = i.phone
  AND r.investor_id IS NULL
  AND r.deleted_at IS NULL;
```

## الوقاية من المشكلة

### تأكد من تفعيل Triggers
```sql
-- فحص الـ triggers الموجودة
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'reservations'
  AND (trigger_name LIKE '%investor%' OR trigger_name LIKE '%link%')
ORDER BY trigger_name;
```

يجب أن تجد:
- `auto_link_investor_on_reservation_insert`
- `auto_set_investor_id_on_reservation`
- `sync_investor_from_reservation`

### تأكد من RLS Policies
```sql
-- فحص سياسات RLS
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'reservations'
  AND cmd = 'SELECT';
```

## اختبار الحل

### 1. من لوحة التحكم
1. سجل دخول بحساب المستثمر
2. اذهب إلى تبويب "حجوزاتي"
3. يجب أن ترى الحجوزات

### 2. من Console المتصفح
```javascript
// افتح Console (F12) في المتصفح
// ستجد سجلات مثل:
// "📊 [InvestorDashboard] Loaded data for phone: 500000001"
// "📦 Reservations: Array(1)"
// "📦 Reservations count: 1"
```

### 3. من أداة التشخيص
افتح `test-investor-reservations-debug.html` واختبر رقم الهاتف.

## الخلاصة

**أكثر المشاكل شيوعاً:**
1. ✅ الحجوزات محذوفة (deleted_at IS NOT NULL)
2. ✅ عدم تطابق رقم الهاتف (مع أو بدون صفر)
3. ✅ عدم ربط investor_id

**الحل السريع:**
```sql
-- نفّذ هذا الاستعلام لإصلاح معظم المشاكل
UPDATE reservations r
SET
  investor_id = i.id,
  deleted_at = NULL,
  customer_phone = LTRIM(customer_phone, '0')
FROM investors i
WHERE LTRIM(r.customer_phone, '0') = LTRIM(i.phone, '0')
  AND (r.investor_id IS NULL OR r.deleted_at IS NOT NULL)
  AND i.deleted_at IS NULL;
```

---

## الدعم

إذا استمرت المشكلة:
1. استخدم أداة التشخيص
2. تحقق من Console في المتصفح
3. نفذ الاستعلامات الموجودة أعلاه
4. امسح ذاكرة المتصفح وسجل دخول من جديد
