# 🔄 تعليمات تحديث الصلاحيات

## ⚠️ المشكلة

الصلاحيات محدثة في قاعدة البيانات، لكن المتصفح يستخدم **session cache قديم**.

---

## ✅ الحل (خطوتين فقط!)

### 1️⃣ احذف الـ localStorage

**في Chrome:**
```
1. اضغط F12 (فتح Developer Tools)
2. اذهب لـ Application (أو التطبيق)
3. من القائمة اليسرى: Local Storage
4. اضغط على https://localhost:5173
5. اضغط على أيقونة 🗑️ (Clear)
```

**أو اكتب في Console:**
```javascript
localStorage.clear()
location.reload()
```

### 2️⃣ سجل دخول من جديد

```
الرقم: 0510101010
```

---

## 🧪 النتيجة المتوقعة

### ✅ القائمة الجانبية:
```
✅ المزارع - يظهر
✅ التوثيق - يظهر  
✅ الحجوزات - يظهر
✅ المالية - يظهر
❌ المستثمرين - لا يظهر (لا صلاحية)
```

### ✅ داخل المزارع:
```
✅ القسم يفتح
✅ المزارع تظهر
❌ زر "إضافة مزرعة" مخفي
❌ أزرار "تعديل/حذف" مخفية
✅ فقط زر "عرض" موجود
```

### ✅ داخل التوثيق:
```
✅ القسم يفتح
✅ الشهادات تظهر
❌ أزرار "أرشفة/حذف" مخفية
✅ فقط زر "عرض" موجود
```

---

## 📊 ما تم إصلاحه

### 1. أضفت الدوال في Interface ✅
```typescript
interface PermissionsContextValue {
  // ... الدوال القديمة
  canCreate: (moduleId: string) => boolean;  // ✅ جديد
  canEdit: (moduleId: string) => boolean;    // ✅ جديد
  canDelete: (moduleId: string) => boolean;  // ✅ جديد
  canView: (moduleId: string) => boolean;    // ✅ جديد
}
```

### 2. أضفت صلاحيات view في قاعدة البيانات ✅
```sql
✅ farms: can_view = true
✅ documentation: can_view = true
✅ reservations: can_view = true
✅ finance: can_view = true
```

### 3. Build ناجح ✅
```
✓ built in 8.13s
```

---

## 🚨 إذا لم يعمل

جرب **Incognito Mode** (نافذة تصفح خاص):
```
Chrome: Ctrl + Shift + N
Firefox: Ctrl + Shift + P
Safari: Cmd + Shift + N
```

ثم سجل دخول: `0510101010`

---

**الآن يجب أن يعمل كل شيء!** ✅
