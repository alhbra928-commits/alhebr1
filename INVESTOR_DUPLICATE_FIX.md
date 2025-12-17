# إصلاح مشكلة تكرار المستثمرين عند الحجز

## المشكلة:
```
duplicate key value violates unique constraint "investors_phone_unique"
```

عند تأكيد الحجز، كان النظام يحاول إنشاء مستثمر جديد حتى لو كان موجود مسبقاً.

---

## السبب:

### 1. Race Condition (تضارب التوقيت)
```
المستخدم يضغط "تأكيد" مرتين بسرعة
↓
كلا الطلبين يبحثان عن المستثمر في نفس الوقت
↓
كلاهما لا يجدان المستثمر
↓
كلاهما يحاولان إنشاء مستثمر جديد بنفس الهاتف
↓
الثاني يفشل: duplicate key error
```

### 2. مستثمر موجود مسبقاً
- إذا كان المستثمر حجز سابقاً برقم الهاتف نفسه
- النظام القديم يحاول إنشاء مستثمر جديد بدلاً من استخدام الموجود

---

## الحل المطبق:

### ✅ 1. استخدام upsert بدلاً من insert
```typescript
// قبل:
.insert({ phone, name })

// بعد:
.upsert({ phone, name }, {
  onConflict: 'phone',
  ignoreDuplicates: false
})
```

### ✅ 2. Fallback عند حدوث خطأ
```typescript
if (error.code === '23505') {
  // جلب المستثمر الموجود
  const existing = await getInvestorByPhone();
  return existing.id;
}
```

### ✅ 3. تحديث الاسم إذا تغير
```typescript
if (existingInvestor.full_name !== newName) {
  await updateInvestorName(existingInvestor.id, newName);
}
```

---

## النتيجة:

### ✅ قبل الإصلاح:
```
مستثمر يحجز مرة أخرى → ❌ خطأ duplicate key
ضغط مرتين على تأكيد → ❌ خطأ duplicate key
```

### ✅ بعد الإصلاح:
```
مستثمر يحجز مرة أخرى → ✅ يستخدم نفس الحساب
ضغط مرتين على تأكيد → ✅ يستخدم نفس الحساب
مستثمر جديد → ✅ ينشئ حساب جديد
```

---

## ملفات تم تعديلها:
- `src/modules/public/services/farmDetailService.ts`

## الإصدار:
- v20251217_1765977932719

## تم البناء:
✅ npm run build - نجح
