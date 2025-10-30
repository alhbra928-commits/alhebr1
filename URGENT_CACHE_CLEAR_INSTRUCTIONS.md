# 🚨 تعليمات حرجة - حذف الـ Cache يدوياً

---

## ⚠️ المشكلة:

التصميم الداكن **موجود بالفعل في الكود** لكنه لا يظهر بسبب الـ cache القديم في المتصفح.

---

## ✅ الحل (يستغرق 30 ثانية):

### **الطريقة 1: حذف يدوي (الأفضل)**

#### **على Chrome/Edge:**
```
1. اضغط Ctrl + Shift + Delete (Windows)
   أو Cmd + Shift + Delete (Mac)

2. اختر:
   ✅ Cached images and files
   ✅ Time range: All time

3. اضغط "Clear data"

4. أغلق المتصفح بالكامل

5. افتح المتصفح من جديد

6. ادخل للموقع
```

#### **على Safari:**
```
1. اضغط Cmd + Option + E

2. اختر "Empty Caches"

3. أغلق Safari بالكامل

4. افتح Safari من جديد

5. ادخل للموقع
```

---

### **الطريقة 2: Console Script (الأسهل)**

```javascript
// افتح Developer Console (اضغط F12)
// الصق هذا الكود والصق Enter:

(async function() {
  console.log('%c🔥 FORCE CLEARING ALL CACHE', 'color:red;font-size:24px;font-weight:bold');

  const auth = {};
  ['admin_session_token', 'admin_data', 'investor_phone', 'investor_data'].forEach(k => {
    const v = localStorage.getItem(k);
    if (v) auth[k] = v;
  });

  localStorage.clear();
  sessionStorage.clear();

  if ('caches' in window) {
    const names = await caches.keys();
    console.log('Deleting', names.length, 'caches...');
    await Promise.all(names.map(n => caches.delete(n)));
  }

  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    console.log('Unregistering', regs.length, 'service workers...');
    await Promise.all(regs.map(r => r.unregister()));
  }

  Object.keys(auth).forEach(k => localStorage.setItem(k, auth[k]));

  console.log('%c✅ DONE! RELOADING...', 'color:green;font-size:20px;font-weight:bold');

  setTimeout(() => {
    window.location.href = window.location.href.split('?')[0] + '?_=' + Date.now();
  }, 500);
})();
```

---

## 🎯 أسهل طريقة:

**افتح Console (F12) والصق الكود أعلاه ← سيعمل كل شيء تلقائياً!**

---

# ✅ التصميم موجود 100% في الكود!

المشكلة فقط في cache المتصفح. استخدم الطريقة 2 (Console Script) وستشاهد التصميم الداكن فوراً!
