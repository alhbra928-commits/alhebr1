# ⚛️ دليل اختبار نظام Atomic Deployment

## 📋 الاختبارات المطلوبة

### 🧪 الاختبار 1: نشر نسخة جديدة (Blue → Green)

#### الخطوات:
```bash
# 1. البناء
npm run build

# 2. فحص الملفات المطلوبة
ls -la dist/manifest.json
ls -la dist/version.txt
ls -la dist/deployment-info.json

# 3. النشر
./scripts/deploy-blue-green.sh

# 4. التحقق
cat /deployments/current/version.txt
```

#### النتيجة المتوقعة:
```
⚛️ ==========================================
⚛️  ATOMIC BLUE/GREEN DEPLOYMENT
⚛️ ==========================================

📦 Version: v2025.10.30_140000
🔵 Current Channel: blue
🟢 Deploying to: green

📁 Creating deployment structure...
📦 Deploying new version to green...
🔍 Verifying deployment...
✅ All critical files present
🔐 Manifest hash: a1b2c3d4e5f6...

🔄 Switching active channel...
✅ Active channel switched to: green

⚛️ ==========================================
⚛️  DEPLOYMENT SUCCESSFUL
⚛️ ==========================================
```

---

### 🧪 الاختبار 2: التحديث التلقائي في المتصفح

#### الخطوات:
```bash
# 1. افتح المنصة في المتصفح
https://your-domain.com

# 2. افتح Console (F12)
# 3. انتظر 30 ثانية (أو اكتب):
__atomicDeployment__.forceCheck()

# 4. راقب النتائج
```

#### النتيجة المتوقعة (Console):
```
⚛️ ATOMIC DEPLOYMENT SYSTEM
🔐 Security Level: Enterprise
📦 Strategy: Atomic with Rollback
🔄 Auto-update: Enabled

📌 Stored Version: v2025.10.30_140000
⚛️ Service Worker registered: /

⚛️ Starting manifest monitoring...
⚛️ Version change detected
   Current: v2025.10.30_140000
   New: v2025.10.30_150000

⚛️ ✅ Manifest integrity verified
⚛️ Manifest structure valid
   Files: 27
   Hash: sha256-a1b2c3d4...

🚀 NEW VERSION AVAILABLE
📦 Version: v2025.10.30_150000
🔵 Channel: blue
📊 Files: 27
⏰ Timestamp: 30/10/2025, 3:00:00 م

💾 Preserved 4 auth keys
🗑️ Cleared 3 cache(s)
♻️ Auth data restored

🔄 RELOADING TO APPLY NEW VERSION
[إعادة تحميل تلقائية]
```

---

### 🧪 الاختبار 3: فشل التحقق (Rollback)

#### الخطوات:
```bash
# 1. إنشاء manifest معطوب عمداً
cd dist
echo '{"invalid": "manifest"}' > manifest.json

# 2. محاولة النشر
cd ..
./scripts/deploy-blue-green.sh
```

#### النتيجة المتوقعة:
```
🔍 Verifying deployment...
❌ Missing critical file: version.txt
❌ Deployment verification failed!
🔄 Rolling back...
✅ Rollback completed

[النظام يبقى على النسخة القديمة الصحيحة]
```

#### التحقق في المتصفح:
```javascript
// في Console:
__atomicDeployment__.getCurrentVersion()
// يجب أن يعيد: "v2025.10.30_140000" (النسخة القديمة)
```

---

### 🧪 الاختبار 4: فشل Integrity Check

#### الخطوات:
```bash
# 1. بناء طبيعي
npm run build

# 2. تعديل ملف بعد الـ manifest
echo "<!-- modified -->" >> dist/index.html

# 3. النشر
./scripts/deploy-blue-green.sh

# 4. فتح المنصة في المتصفح
```

#### النتيجة المتوقعة في Console:
```
⚛️ Version change detected
   Current: v2025.10.30_140000
   New: v2025.10.30_150000

⚛️ Verifying index.html integrity...
⚛️ ❌ Integrity check failed for index.html
⚛️ 🔄 Rollback: Keeping current version

[لا إعادة تحميل - النظام يبقى على النسخة القديمة]
```

---

## ✅ معايير النجاح

### الاختبار 1:
- ✅ النشر يكتمل بنجاح
- ✅ يتم التبديل بين blue و green
- ✅ جميع الملفات موجودة في الـ target directory
- ✅ manifest.json صحيح

### الاختبار 2:
- ✅ النظام يكتشف النسخة الجديدة تلقائياً
- ✅ يتم التحقق من integrity
- ✅ يتم حذف caches القديمة
- ✅ يحفظ auth data
- ✅ يعيد التحميل تلقائياً
- ✅ المنصة تعمل بالنسخة الجديدة

### الاختبار 3:
- ✅ النظام يكتشف الخطأ
- ✅ يرفض النشر
- ✅ يرجع للنسخة السابقة
- ✅ لا توجد down time

### الاختبار 4:
- ✅ النظام يكتشف تغيير الـ integrity
- ✅ يرفض التحديث
- ✅ يبقى على النسخة القديمة
- ✅ لا يعيد التحميل
- ✅ لا توجد down time

---

## 🔍 أوامر التشخيص

### فحص الحالة الحالية:
```javascript
// في Console:
__atomicDeployment__.getCurrentVersion()
__atomicDeployment__.getDeploymentInfo()
```

### فحص Service Worker:
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => {
    console.log('SW:', reg.active?.scriptURL);
  });
});
```

### فحص Caches:
```javascript
caches.keys().then(names => {
  console.log('Caches:', names);
});
```

### فحص Manifest:
```bash
curl -H "Cache-Control: no-cache" https://your-domain.com/manifest.json | jq
```

### فحص Deployment Files:
```bash
ls -la /deployments/
ls -la /deployments/current/
cat /deployments/current/version.txt
cat /deployments/current/manifest.json | jq '.version, .channel'
```

---

## 📊 تقرير الاختبار

بعد إكمال جميع الاختبارات، املأ هذا التقرير:

```markdown
# تقرير اختبار Atomic Deployment System

## معلومات الاختبار
- التاريخ: _______
- المنصة: _______
- Build Version: _______

## نتائج الاختبارات

### الاختبار 1: نشر نسخة جديدة
- [ ] نجح
- [ ] فشل
- الملاحظات: _______

### الاختبار 2: التحديث التلقائي
- [ ] نجح
- [ ] فشل
- الملاحظات: _______

### الاختبار 3: Rollback على خطأ Verification
- [ ] نجح
- [ ] فشل
- الملاحظات: _______

### الاختبار 4: Rollback على خطأ Integrity
- [ ] نجح
- [ ] فشل
- الملاحظات: _______

## النتيجة النهائية
- [ ] جميع الاختبارات نجحت ✅
- [ ] بعض الاختبارات فشلت ❌

## التوصيات
_______
```

---

## 🚀 الخطوة التالية

بعد نجاح جميع الاختبارات:

1. ✅ النظام جاهز للإنتاج
2. ✅ يمكن النشر على Production
3. ✅ التحديثات ستتم تلقائياً
4. ✅ Rollback سيعمل تلقائياً عند الأخطاء

---

# 🎉 النظام معتمد للاستخدام المؤسسي!
