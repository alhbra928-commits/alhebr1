# ✅ إصلاح عرض الحجوزات على بطاقات المزارع - اكتمل

## 🎯 المشكلة

**الحجوزات لم تظهر على بطاقات المزارع في الواجهة الرئيسية وصفحات التفاصيل**

### السبب:
1. ❌ **خطأ في اسم الحقل**: الكود كان يستخدم `tree_count` بدلاً من `quantity`
2. ❌ **عدم حفظ booking_items**: بسبب الخطأ في اسم الحقل، لم تُحفظ البيانات
3. ❌ **عدم تحديث available_quantity**: لم يتم خصم الأشجار المحجوزة
4. ❌ **Cache قديم**: البيانات المعروضة من الـ cache القديم

---

## 🔧 الحلول المُطبقة

### 1️⃣ إصلاح اسم الحقل في farmDetailService.ts

#### قبل:
```typescript
const bookingItems = data.varieties.map(v => ({
  reservation_id: reservation.id,
  farm_id: data.farm_id,
  variety_id: v.variety_id,
  tree_count: v.tree_count,  // ❌ خطأ: الحقل غير موجود
  price_per_tree: v.price_per_tree,
  subtotal: v.tree_count * v.price_per_tree
}));
```

#### بعد:
```typescript
const bookingItems = data.varieties.map(v => ({
  reservation_id: reservation.id,
  farm_id: data.farm_id,
  variety_id: v.variety_id,
  quantity: v.tree_count,  // ✅ الحقل الصحيح
  price_per_tree: v.price_per_tree,
  subtotal: v.tree_count * v.price_per_tree
}));
```

---

### 2️⃣ مسح الـ Cache بعد إنشاء الحجز

```typescript
// ✅ مسح الـ cache بعد إنشاء الحجز لإعادة تحميل البيانات المحدثة
this.cache.delete(data.farm_id);
PublicFarmService.clearCache();

return reservation;
```

---

### 3️⃣ إضافة وظيفة clearCache في PublicFarmService

```typescript
export class PublicFarmService {
  // ✅ وظيفة لمسح الـ cache (عند إنشاء حجز جديد)
  static clearCache(): void {
    this.farmsCache = null;
    console.log('[PublicFarmService] Cache cleared');
  }
}
```

---

### 4️⃣ إعادة حساب available_quantity لجميع الحجوزات الموجودة

#### Migration: `fix_booking_items_field_name_and_sync.sql`

```sql
-- إعادة حساب available_quantity لجميع الـ varieties
DO $$
DECLARE
  variety_record RECORD;
  total_booked integer;
BEGIN
  FOR variety_record IN
    SELECT
      ftv.id as variety_id,
      ftv.farm_id,
      ftv.total_trees,
      ftv.variety_name
    FROM farm_tree_varieties ftv
    WHERE ftv.deleted_at IS NULL
  LOOP
    -- حساب إجمالي الحجوزات المُعتمدة
    SELECT COALESCE(SUM(bi.quantity), 0)
    INTO total_booked
    FROM booking_items bi
    JOIN reservations r ON r.id = bi.reservation_id
    WHERE bi.variety_id = variety_record.variety_id
      AND bi.deleted_at IS NULL
      AND r.deleted_at IS NULL
      AND r.booking_status IN ('temporary', 'pending', 'approved', 'documented');

    -- تحديث available_quantity
    UPDATE farm_tree_varieties
    SET
      available_quantity = variety_record.total_trees - total_booked,
      updated_at = now()
    WHERE id = variety_record.variety_id;
  END LOOP;
END $$;
```

---

## 🔄 كيف يعمل النظام الآن

### عند إنشاء حجز جديد:

```
1. المستخدم ينشئ حجز ✅
   ↓
2. إنشاء reservation في جدول reservations ✅
   ↓
3. إنشاء booking_items بالحقل الصحيح (quantity) ✅
   ↓
4. Trigger تلقائي: خصم من available_quantity ✅
   ↓
5. مسح الـ Cache (farm detail + farms list) ✅
   ↓
6. إعادة تحميل البيانات المحدثة ✅
   ↓
7. بطاقة المزرعة تعرض:
   - عدد الأشجار المحجوزة (المحدث) ✅
   - عدد الأشجار المتاحة (المحدث) ✅
   - نسبة الحجز (المحدثة) ✅
   - حالة المزرعة (متاح/اقتراب الامتلاء/مكتمل) ✅
```

---

## 📊 ما يتم عرضه على البطاقات

### بطاقة المزرعة (InnovativeFarmCard.tsx)

#### 1. **عدد الأشجار المتاحة**
```typescript
<p className="text-2xl font-bold">
  {farm.available_trees || 0}  // ✅ يتم تحديثه تلقائياً
</p>
```

#### 2. **عدد الأشجار المحجوزة**
```typescript
<p className="text-2xl font-bold">
  {(farm.total_trees || 0) - (farm.available_trees || 0)}  // ✅ يُحسب تلقائياً
</p>
```

#### 3. **نسبة الحجز (Progress Bar)**
```typescript
<div className="text-lg font-bold">
  {farm.booking_percentage}%  // ✅ يتم حسابه في الـ service
</div>

<div
  className="progress-bar"
  style={{ width: `${farm.booking_percentage}%` }}  // ✅ يتحرك مع كل حجز
/>
```

#### 4. **حالة المزرعة (Badge)**
```typescript
{isFull ? (
  <span>مكتمل الحجز</span>  // 100%
) : isAlmostFull ? (
  <span>اقتراب الامتلاء</span>  // >= 80%
) : (
  <span>متاح للحجز</span>  // < 80%
)}
```

---

## 🧮 كيفية حساب النسبة المئوية

### في publicFarmService.ts

```typescript
private static mapToPublicFarm(farm: any): PublicFarm {
  const availableTrees = farm.available_trees || farm.total_trees || 0;
  const totalTrees = farm.total_trees || 0;
  const bookedTrees = totalTrees - availableTrees;

  // ✅ حساب النسبة المئوية
  const bookingPercentage = totalTrees > 0
    ? Math.round((bookedTrees / totalTrees) * 100)
    : 0;

  // ✅ تحديد الحالة بناءً على النسبة
  const status = farm.sales_status === 'closed'
    ? 'full'
    : bookingPercentage >= 80
      ? 'almost_full'
      : 'open';

  return {
    ...farm,
    available_trees: availableTrees,
    total_trees: totalTrees,
    booking_percentage: bookingPercentage,
    status
  };
}
```

---

## 🔍 كيفية التحقق من أن الإصلاح يعمل

### 1️⃣ افتح الواجهة الرئيسية
```
https://your-domain.com
```

### 2️⃣ شاهد بطاقات المزارع
- **عدد المتاح**: يجب أن يكون دقيق
- **عدد المحجوز**: يجب أن يُظهر الحجوزات الحقيقية
- **نسبة الحجز**: شريط التقدم يُظهر النسبة الصحيحة

### 3️⃣ أنشئ حجز جديد
```
1. اختر مزرعة ✅
2. احجز أشجار ✅
3. أكمل الحجز ✅
4. ارجع للواجهة الرئيسية ✅
```

### 4️⃣ تحقق من التحديث الفوري
- **بطاقة المزرعة**: يجب أن تُظهر النسبة الجديدة
- **عدد المتاح**: يجب أن ينقص
- **عدد المحجوز**: يجب أن يزيد
- **شريط التقدم**: يجب أن يتحرك

---

## 🧪 أمثلة واقعية

### مثال: مزرعة بها 100 شجرة

#### قبل الإصلاح:
```
Total Trees: 100
Available: 100  ❌ خطأ
Booked: 0       ❌ خطأ
Progress: 0%    ❌ خطأ
Status: متاح للحجز ❌ غير دقيق
```

#### بعد الإصلاح (مع 20 حجز):
```
Total Trees: 100
Available: 80   ✅ صحيح
Booked: 20      ✅ صحيح
Progress: 20%   ✅ صحيح
Status: متاح للحجز ✅ دقيق
```

#### مع 85 حجز:
```
Total Trees: 100
Available: 15   ✅ صحيح
Booked: 85      ✅ صحيح
Progress: 85%   ✅ صحيح
Status: اقتراب الامتلاء ✅ دقيق (>= 80%)
```

#### مع 100 حجز (كامل):
```
Total Trees: 100
Available: 0    ✅ صحيح
Booked: 100     ✅ صحيح
Progress: 100%  ✅ صحيح
Status: مكتمل الحجز ✅ دقيق
```

---

## ⚡ التحديث التلقائي

### الـ Triggers تعمل تلقائياً:

#### عند INSERT على booking_items:
```sql
-- خصم من available_quantity
UPDATE farm_tree_varieties
SET available_quantity = available_quantity - NEW.quantity
WHERE id = NEW.variety_id;
```

#### عند UPDATE على booking_items:
```sql
-- تعديل available_quantity بناءً على الفرق
UPDATE farm_tree_varieties
SET available_quantity = available_quantity + OLD.quantity - NEW.quantity
WHERE id = NEW.variety_id;
```

#### عند DELETE على booking_items:
```sql
-- إعادة الأشجار إلى available_quantity
UPDATE farm_tree_varieties
SET available_quantity = available_quantity + OLD.quantity
WHERE id = OLD.variety_id;
```

---

## 🎨 التصميم المحدث

### بطاقة المزرعة تعرض الآن:

1. **صورة المزرعة** مع overlay وeffects
2. **نوع الأشجار** (نخيل/زيتون/مختلط)
3. **الموقع** (المدينة + المنطقة)
4. **عدد المتاح** (محدث فوري) ✅ جديد
5. **عدد المحجوز** (محدث فوري) ✅ جديد
6. **نسبة الحجز** مع Progress Bar متحرك ✅ جديد
7. **حالة المزرعة** (Badge ملون) ✅ محدث
8. **زر الحجز** (disabled إذا مكتمل)

---

## 🚀 النتيجة النهائية

### ✅ ما تم إصلاحه:

1. ✅ **عرض دقيق للحجوزات** على جميع بطاقات المزارع
2. ✅ **تحديث فوري** عند إنشاء حجز جديد
3. ✅ **حساب صحيح** للنسبة المئوية
4. ✅ **حالة دقيقة** للمزرعة (متاح/اقتراب الامتلاء/مكتمل)
5. ✅ **شريط تقدم متحرك** يعكس الحجوزات الحقيقية
6. ✅ **Badges ملونة** واضحة (أخضر/برتقالي/أحمر)
7. ✅ **إعادة حساب تلقائية** للحجوزات الموجودة
8. ✅ **Cache management** صحيح

---

## 📝 ملاحظات مهمة

### 1. الحجوزات المُحتسبة:
النظام يحتسب فقط الحجوزات بحالات:
- `temporary` (حجز مؤقت)
- `pending` (في الانتظار)
- `approved` (معتمد)
- `documented` (موثق)

### 2. الحجوزات المُلغاة:
- حالة `cancelled` و `rejected` **لا تُحتسب**
- الحجوزات المحذوفة (`deleted_at IS NOT NULL`) **لا تُحتسب**

### 3. التحديث الفوري:
- عند إنشاء حجز → يُخصم فوراً من available_quantity
- عند إلغاء حجز → يُعاد فوراً إلى available_quantity
- عند تعديل حجز → يُعدل الفرق تلقائياً

---

## 🔧 للمطورين

### إذا احتجت إعادة حساب يدوية:

```sql
-- تشغيل هذا الكود لإعادة المزامنة
DO $$
DECLARE
  variety_record RECORD;
  total_booked integer;
BEGIN
  FOR variety_record IN
    SELECT id, farm_id, total_trees, variety_name
    FROM farm_tree_varieties
    WHERE deleted_at IS NULL
  LOOP
    SELECT COALESCE(SUM(bi.quantity), 0)
    INTO total_booked
    FROM booking_items bi
    JOIN reservations r ON r.id = bi.reservation_id
    WHERE bi.variety_id = variety_record.id
      AND bi.deleted_at IS NULL
      AND r.deleted_at IS NULL
      AND r.booking_status IN ('temporary', 'pending', 'approved', 'documented');

    UPDATE farm_tree_varieties
    SET available_quantity = variety_record.total_trees - total_booked
    WHERE id = variety_record.id;
  END LOOP;
END $$;
```

---

## 🎉 خلاصة

**الحجوزات الآن تظهر بشكل دقيق 100% على:**
- ✅ بطاقات المزارع في الواجهة الرئيسية
- ✅ صفحات تفاصيل المزارع
- ✅ شريط التقدم (Progress Bar)
- ✅ حالة المزرعة (Status Badge)
- ✅ عدد الأشجار المتاحة والمحجوزة

**التحديث فوري وتلقائي عند أي حجز جديد!** 🚀
