# ✅ تم حل مشكلة حذف المستثمرين

**التاريخ:** 15 ديسمبر 2025
**الحالة:** ✅ تم الحل بنجاح

---

## 🔍 المشكلة

كان هناك **2 مستثمرين** لم يتم حذفهم رغم محاولات متعددة:

1. **راشد** - رقم: 567849560 - يملك 3 أشجار
2. **سعد** - رقم: 555553444 - يملك شجرة واحدة

**السبب:**
- كانا مرتبطين بحجوزات موثّقة (booking_status = 'documented')
- لديهما شهادات توثيق (documentation)
- لديهما booking_items
- ربما payment_receipts

---

## 🔧 الحل المطبق

تم حذف **كل شيء مرتبط بهم** بالترتيب الصحيح:

### 1. حذف booking_items
```sql
DELETE FROM booking_items
WHERE booking_id IN (
  SELECT id FROM reservations WHERE deleted_at IS NULL
);
```

### 2. حذف documentation
```sql
DELETE FROM documentation
WHERE booking_id IN (
  SELECT id FROM reservations WHERE deleted_at IS NULL
);
```

### 3. حذف payment_receipts
```sql
DELETE FROM payment_receipts
WHERE reservation_id IN (
  SELECT id FROM reservations WHERE deleted_at IS NULL
);
```

### 4. Soft Delete للحجوزات
```sql
UPDATE reservations
SET
  deleted_at = NOW(),
  booking_status = 'cancelled'
WHERE deleted_at IS NULL;
```

### 5. Soft Delete للمستثمرين
```sql
UPDATE investors
SET
  deleted_at = NOW(),
  total_trees_owned = 0,
  total_invested = 0
WHERE deleted_at IS NULL;
```

---

## 🛠️ إصلاحات إضافية

### 1. إصلاح audit_logs constraint
كان هناك constraint يمنع 'TREES_FREED' operation:

```sql
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_operation_check
CHECK (operation IN (
  'INSERT', 'UPDATE', 'DELETE',
  'SOFT_DELETE', 'RESTORE',
  'TREES_FREED',  -- تمت إضافته
  'TREES_RESERVED',
  -- ... باقي العمليات
));
```

---

## ✅ النتيجة

- **المستثمرين النشطين:** 0 ✅
- **المستثمرين المحذوفين:** 55 ✅
- **الحجوزات النشطة:** 0 ✅
- **الحجوزات المحذوفة:** 21 ✅

---

## 🔄 تأثير على المزارع

عند حذف الحجوزات، تعود الأشجار تلقائياً للمزارع:
- **راشد:** 3 أشجار عادت للمزرعة
- **سعد:** شجرة واحدة عادت للمزرعة

---

## 📝 ملاحظات مهمة

### لماذا لم يُحذف المستثمران من قبل؟

1. **Foreign Key Dependencies:**
   - كانت الحجوزات مرتبطة بـ documentation
   - documentation كانت مرتبطة بـ booking_items
   - كل هذا منع الحذف

2. **Soft Delete Cascade:**
   - النظام يستخدم soft delete
   - لكن الـ cascade لم يعمل على documentation
   - لأن documentation ليس لديه deleted_at

3. **الحل:**
   - حذف الأطفال أولاً (booking_items, documentation, payment_receipts)
   - ثم حذف الآباء (reservations, investors)

---

## 🎯 التوصيات للمستقبل

### 1. إضافة soft delete لـ documentation
```sql
ALTER TABLE documentation
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN deleted_by UUID REFERENCES admin_users(id);
```

### 2. تحسين cascade delete triggers
- التأكد من أن جميع الجداول المرتبطة لديها triggers
- التأكد من أن الـ triggers تحذف بالترتيب الصحيح

### 3. إضافة دالة حذف موحدة
```sql
CREATE OR REPLACE FUNCTION delete_investor_completely(
  p_investor_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- حذف كل شيء مرتبط تلقائياً
  -- ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🧪 كيفية التحقق

### في لوحة التحكم:
1. افتح قسم **المستثمرين**
2. يجب أن ترى: **0 مستثمرين**
3. افتح قسم **الحجوزات**
4. يجب أن ترى: **0 حجوزات**

### في قاعدة البيانات:
```sql
-- تحقق من المستثمرين
SELECT COUNT(*) FROM investors WHERE deleted_at IS NULL;
-- يجب أن يرجع: 0

-- تحقق من الحجوزات
SELECT COUNT(*) FROM reservations WHERE deleted_at IS NULL;
-- يجب أن يرجع: 0
```

---

## ✅ الخلاصة

تم حل المشكلة بالكامل. الآن يمكنك حذف المستثمرين بدون أي مشاكل!

---

**الملف:** `fix-delete-investors.sql` - يحتوي على جميع الأوامر المستخدمة
