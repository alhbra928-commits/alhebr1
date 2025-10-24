# 🔧 دليل استكشاف أخطاء إدارة أصحاب المزارع

## ✅ الإصلاحات المطبقة

### 1️⃣ إضافة دالة getPendingSubmissions
```typescript
// src/modules/owners/ownersService.ts
static async getPendingSubmissions(): Promise<any[]> {
  const { data, error } = await supabase
    .from('farm_submission_requests')
    .select(`...`)
    .eq('status', 'pending')
    ...
}
```

### 2️⃣ تحديث loadData لجلب الطلبات
```typescript
const [ownersData, statsData, pendingData] = await Promise.all([
  OwnersService.getOwnersList(),
  OwnersService.getStatistics(),
  OwnersService.getPendingSubmissions() // ✅ إضافة جديدة
]);
```

### 3️⃣ معالجة الأخطاء
- ✅ إضافة `.catch()` لكل استدعاء
- ✅ Console logs للتتبع
- ✅ قيم افتراضية عند الفشل

---

## 🧪 التحقق من البيانات

### طريقة 1: SQL مباشر
```sql
SELECT
  id,
  submitted_data->>'full_name' as name,
  status,
  submitted_at
FROM farm_submission_requests
WHERE status = 'pending' AND deleted_at IS NULL;
```

**النتيجة المتوقعة:**
```
┌──────────┬──────────────┬─────────┬─────────────────────┐
│ id       │ name         │ status  │ submitted_at        │
├──────────┼──────────────┼─────────┼─────────────────────┤
│ ca9d9a8b │ عمر التميمي  │ pending │ 2025-10-24 14:16:12 │
│ 8f7b6351 │ محمد أحمد... │ pending │ 2025-10-24 14:08:23 │
└──────────┴──────────────┴─────────┴─────────────────────┘
```

### طريقة 2: صفحة الاختبار
افتح:
```
/test-pending-submissions.html
```

يجب أن تظهر **2 طلبات معلقة**.

---

## 🎯 خطوات التحقق في الواجهة

1. **افتح Console** (F12)
2. **ابحث عن:**
   ```
   ✅ Loaded data: { owners: X, pending: 2, stats: {...} }
   ```

3. **إذا ظهر `pending: 2`** → البيانات تُحمل بنجاح ✅
4. **إذا ظهر `pending: 0`** → هناك مشكلة في الاستعلام ❌

---

## 🐛 الأخطاء الشائعة

### خطأ: "getPendingSubmissions is not a function"
**السبب:** الدالة غير محفوظة في `ownersService.ts`

**الحل:**
```bash
npm run build
```

### خطأ: "Failed to load resource: ERR_CONNECTION_CLOSED"
**السبب:** مشكلة في RLS أو الاتصال

**الحل:**
1. تحقق من `.env`:
   ```
   VITE_SUPABASE_URL=https://...
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

2. تحقق من RLS:
   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'farm_submission_requests';
   ```

### خطأ: البيانات موجودة لكن لا تظهر
**السبب:** التبويب الخطأ مفتوح

**الحل:**
1. تأكد أنك في تبويب **"طلبات المراجعة"**
2. يجب أن يظهر رقم `(2)` بجانب اسم التبويب

---

## 📊 هيكل البيانات

### farm_submission_requests
```json
{
  "id": "uuid",
  "profile_id": "uuid",
  "status": "pending",
  "submitted_data": {
    "full_name": "عمر التميمي",
    "mobile_number": "0505050505",
    "region": "الرياض",
    "actual_total_price": 5000000,
    ...
  },
  "varieties_data": [
    {"name": "خلاص", "type": "نخيل", "count": 1000},
    {"name": "سكري", "type": "نخيل", "count": 1000}
  ]
}
```

### farm_owner_profiles
```json
{
  "id": "uuid",
  "mobile_number": "0505050505",
  "full_name": "عمر التميمي",
  "status": "pending"
}
```

---

## 🔄 عملية الموافقة

### ماذا يحدث عند الضغط على "موافقة"؟

1. ✅ ينشئ سجل في `farm_owners`
2. ✅ ينشئ المزرعة في `farms`
3. ✅ يضيف الأصناف في `farm_tree_varieties`
4. ✅ يحدّث `status` إلى `approved`
5. ✅ يرسل إشعار

### SQL Function المستخدمة:
```sql
SELECT approve_farm_submission(
  'submission-id',
  'admin-id',
  'ملاحظات الموافقة'
);
```

---

## 📝 ملاحظات مهمة

1. ⚠️ **البيانات موجودة بالفعل** - المشكلة فقط في العرض
2. ✅ **الدوال محدثة** - `getPendingSubmissions` موجودة الآن
3. ✅ **معالجة الأخطاء محسّنة** - لن يتوقف التطبيق عند الخطأ
4. ✅ **Console logs مضافة** - للتتبع والتشخيص

---

## 🎉 الحالة النهائية

- ✅ البيانات محفوظة في قاعدة البيانات
- ✅ الدوال محدثة
- ✅ الواجهة محدثة
- ✅ معالجة الأخطاء جاهزة
- ✅ البناء نجح

**الطلبات يجب أن تظهر الآن في تبويب "طلبات المراجعة"!** 🚀
