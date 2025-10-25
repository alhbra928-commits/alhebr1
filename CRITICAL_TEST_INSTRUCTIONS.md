# 🔴 تعليمات الاختبار الحاسمة

## ✅ التغييرات المطبقة

### 1. adminSessionService.ts
- إضافة `.eq('is_active', true)` في getPermissions()

### 2. AdvancedBookingsView.tsx  
- إضافة `usePermissions` hook
- إضافة شروط للأزرار في البطاقات (السطور 333-335, 356, 397)
- إضافة شروط للأزرار في BookingDetailsPanel (السطور 418-421)

### 3. Build
- ✅ ناجح (8.64s)
- Hash جديد: reservations-module

---

## 🧪 طريقة الاختبار الصحيحة

### الخطوة 1: افتح الصفحة في Incognito Mode
```
Chrome: Ctrl + Shift + N
Edge: Ctrl + Shift + N
Firefox: Ctrl + Shift + P
```

### الخطوة 2: اذهب لـ:
```
http://localhost:5173
```

### الخطوة 3: افتح Console (F12) قبل تسجيل الدخول

### الخطوة 4: سجل دخول
```
انقر زر التاج 👑
رقم: 0510101010
```

### الخطوة 5: راقب Console
```
يجب أن ترى:
🔍 [PermissionsContext] ...
```

### الخطوة 6: افتح قسم الحجوزات

### الخطوة 7: راقب Console مرة أخرى
```
يجب أن ترى:
🔍 [AdvancedBookingsView] Permissions Check:
  isAdmin: false
  canEdit: false
  canDelete: false
  canCreate: false
```

### الخطوة 8: افحص البطاقات
- ابحث عن أي حجز
- هل ترى زر "اعتماد"؟
- هل ترى زر "رفض"؟
- هل ترى زر "حذف"؟

### الخطوة 9: افتح تفاصيل حجز
- انقر "عرض التفاصيل"
- راقب Console:
```
🔍 [BookingDetailsPanel] Permissions Check:
  isAdmin: false
  canEdit: false
  canDelete: false
  canCreate: false
```

### الخطوة 10: افحص Panel
- هل ترى أي أزرار إجراءات؟

---

## 📸 أرسل لي Screenshot

إذا لم يعمل، أرسل لي screenshot من:
1. Console (F12) - أريد أن أرى جميع الرسائل
2. صفحة الحجوزات - البطاقات
3. Panel التفاصيل

---

## 🔍 معلومات إضافية للتشخيص

### في Console، اكتب هذا الكود:
```javascript
// تحقق من localStorage
console.log('Admin Data:', localStorage.getItem('admin_data'));

// تحقق من الصلاحيات الحالية
// (بعد تسجيل الدخول)
```

---

## ⚠️ ملاحظة مهمة جداً

إذا كنت تستخدم نفس المتصفح ونفس الـ Tab:
1. الكاش القديم لا يزال موجود
2. حتى Ctrl + Shift + R قد لا يكفي

**الحل الوحيد المضمون:**
1. أغلق المتصفح تماماً
2. افتح متصفح جديد
3. استخدم Incognito Mode
4. جرب مرة أخرى
