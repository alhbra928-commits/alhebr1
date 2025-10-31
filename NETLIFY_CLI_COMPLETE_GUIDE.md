# 🚀 دليل Netlify CLI الكامل - خطوة بخطوة

## ⚡ النشر السريع في 3 دقائق

---

## 📋 **الخطوة 1: تثبيت Netlify CLI**

### افتح Terminal في مشروعك:

```bash
npm install -g netlify-cli
```

**انتظر حتى ينتهي التثبيت (30 ثانية)**

---

## 🔐 **الخطوة 2: تسجيل الدخول**

```bash
netlify login
```

**ماذا سيحدث:**
```
سيفتح متصفح تلقائياً
اضغط "Authorize"
سترى: "You're now logged in!"
ارجع للـ Terminal
```

---

## 🏗️ **الخطوة 3: بناء المشروع (إذا لم تبنيه بعد)**

```bash
npm run build
```

**انتظر حتى يكتمل (30 ثانية)**

**النتيجة:**
```
✅ dist/index.html
✅ dist/assets/
✅ جاهز للنشر!
```

---

## 🚀 **الخطوة 4: النشر على Netlify**

### اختر إحدى الطريقتين:

---

### ✅ **الطريقة A: Deploy مباشرة (Production)**

```bash
netlify deploy --prod --dir=dist
```

**ماذا سيحدث:**
```
1. سيسأل: "Create & configure a new site?"
   → اضغط Enter (Yes)

2. سيسأل: "Team:"
   → اختر team الخاص بك (أو Personal)

3. سيسأل: "Site name:"
   → اكتب اسم (مثل: palm-olive-platform)
   → أو اضغط Enter لاسم عشوائي

4. سيبدأ الرفع:
   📤 Uploading files...
   ⚙️ Processing...

5. النتيجة:
   ✅ Website Draft URL: https://[site-name].netlify.app
   ✅ Unique Deploy URL: https://[id]--[site-name].netlify.app
```

**موقعك الآن LIVE!** 🎉

---

### ✅ **الطريقة B: Deploy تجريبي أولاً (Draft)**

```bash
# 1. Deploy تجريبي للاختبار:
netlify deploy --dir=dist

# 2. افتح الرابط واختبر الموقع

# 3. إذا كان كل شيء تمام:
netlify deploy --prod --dir=dist
```

---

## 🔗 **الخطوة 5: احصل على رابط الموقع**

```bash
netlify open
```

**سيفتح Dashboard في المتصفح**

**أو:**

```bash
netlify status
```

**النتيجة:**
```
Site Name:    palm-olive-platform
Site ID:      abc123-xyz789
Website URL:  https://palm-olive-platform.netlify.app
Admin URL:    https://app.netlify.com/sites/palm-olive-platform
```

---

## 🌐 **الخطوة 6: ربط نطاق mzad1.com**

### في Terminal:

```bash
netlify domains:add mzad1.com
```

**أو يدوياً:**

1. افتح Dashboard:
```bash
netlify open
```

2. اذهب إلى: **Domain management**

3. اضغط: **Add custom domain**

4. أدخل: `mzad1.com`

5. **Netlify سيعطيك DNS Records**

---

## 📝 **DNS Records للنطاق:**

### في Hostinger (أو مزود النطاق):

#### **الطريقة A: Name Servers (الأسهل)**

```
اذهب لإعدادات النطاق
غيّر Name Servers إلى:

ns1.netlify.com
ns2.netlify.com
ns3.netlify.com
ns4.netlify.com
```

#### **الطريقة B: DNS Records (أسرع)**

```
احذف أي Redirect قديم
أضف هذه السجلات:

┌──────────────────────────────────────┐
│ Type: A                              │
│ Name: @                              │
│ Value: 75.2.60.5                     │
│ TTL: Auto                            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Type: CNAME                          │
│ Name: www                            │
│ Value: [your-site].netlify.app       │
│ TTL: Auto                            │
└──────────────────────────────────────┘
```

**⏱️ انتظر 5-60 دقيقة للتفعيل**

---

## 🔄 **التحديثات المستقبلية**

### كل ما تحتاجه:

```bash
# 1. غيّر الكود
# 2. ابنِ المشروع:
npm run build

# 3. انشر:
netlify deploy --prod --dir=dist
```

**بس! موقعك متحدث في ثواني!** ⚡

---

## 🛠️ **أوامر Netlify CLI المفيدة:**

```bash
# فتح Dashboard في المتصفح:
netlify open

# عرض معلومات الموقع:
netlify status

# عرض الـ logs:
netlify watch

# ربط مشروع موجود:
netlify link

# فك الربط:
netlify unlink

# عرض قائمة المواقع:
netlify sites:list

# حذف موقع:
netlify sites:delete

# عرض الأوامر المتاحة:
netlify help
```

---

## 🔧 **متغيرات البيئة (Environment Variables)**

### إضافة متغيرات البيئة:

```bash
# طريقة 1: عبر CLI
netlify env:set VITE_SUPABASE_URL "your_url"
netlify env:set VITE_SUPABASE_ANON_KEY "your_key"

# طريقة 2: عبر Dashboard
netlify open
# → Site settings → Environment variables → Add variable
```

**بعد إضافة المتغيرات:**

```bash
# أعد النشر:
netlify deploy --prod --dir=dist
```

---

## 📊 **مراقبة الموقع:**

```bash
# فتح Analytics:
netlify open --analytics

# فتح Functions logs:
netlify functions:log

# عرض Build logs:
netlify build
```

---

## 🆘 **حل المشاكل الشائعة:**

### ❌ **المشكلة: Command not found**

```bash
# الحل:
npm install -g netlify-cli

# أو باستخدام npx:
npx netlify-cli deploy --prod --dir=dist
```

---

### ❌ **المشكلة: Not authorized**

```bash
# الحل:
netlify logout
netlify login
```

---

### ❌ **المشكلة: الموقع لا يفتح**

```bash
# 1. تحقق من حالة النشر:
netlify status

# 2. شاهد آخر deploy:
netlify open --site

# 3. تحقق من Build logs في Dashboard
```

---

### ❌ **المشكلة: 404 عند التنقل**

```
✅ الحل موجود مسبقاً في netlify.toml:

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

هذا يضمن عمل React Router بشكل صحيح
```

---

### ❌ **المشكلة: البيانات لا تظهر**

```bash
# تحقق من Environment Variables:
netlify open
# → Site settings → Environment variables

# تأكد من:
✅ VITE_SUPABASE_URL موجود
✅ VITE_SUPABASE_ANON_KEY موجود
✅ القيم صحيحة

# ثم أعد النشر:
netlify deploy --prod --dir=dist
```

---

## 🎯 **الأوامر الكاملة للنشر (نسخ + لصق):**

### **نشر جديد (أول مرة):**

```bash
# 1. تثبيت CLI:
npm install -g netlify-cli

# 2. تسجيل دخول:
netlify login

# 3. بناء المشروع:
npm run build

# 4. النشر:
netlify deploy --prod --dir=dist

# 5. احصل على الرابط:
netlify status
```

---

### **تحديث موجود:**

```bash
# 1. بناء:
npm run build

# 2. نشر:
netlify deploy --prod --dir=dist
```

---

## 📱 **النشر من الموبايل (Termux):**

```bash
# على Android (Termux):
pkg install nodejs
npm install -g netlify-cli
cd /path/to/project
npm run build
netlify login
netlify deploy --prod --dir=dist
```

---

## 🔐 **الأمان:**

```bash
# لا تشارك هذه الملفات:
.netlify/
.env
.env.local

# تأكد أن .gitignore يحتوي على:
.netlify
.env*
dist/
node_modules/
```

---

## 💰 **الأسعار:**

```
الخطة المجانية:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 100 GB Bandwidth شهرياً
✅ 300 Build minutes شهرياً
✅ Unlimited sites
✅ SSL مجاني
✅ CDN عالمي
✅ Forms: 100 submissions/شهر
✅ Functions: 125K requests/شهر
✅ كافية تماماً لمشروعك!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📚 **موارد إضافية:**

```
Netlify CLI Docs:
https://docs.netlify.com/cli/get-started/

Netlify Dashboard:
https://app.netlify.com

Netlify Forums:
https://answers.netlify.com

Netlify Status:
https://www.netlifystatus.com
```

---

## ✅ **ملخص سريع:**

```bash
# التسلسل الكامل:
npm install -g netlify-cli    # مرة واحدة فقط
netlify login                  # مرة واحدة فقط
npm run build                  # كل تحديث
netlify deploy --prod --dir=dist  # كل تحديث
```

**النتيجة:** موقعك على https://mzad1.com في دقائق! 🚀

---

## 🎉 **مبروك مقدماً!**

بعد إتمام هذه الخطوات:

```
✅ موقعك LIVE على Netlify
✅ SSL مجاني ومفعّل
✅ CDN سريع عالمياً
✅ Auto-deployment جاهز
✅ مzad1.com يعمل
✅ منصة احترافية 100%
```

---

## 📞 **هل تحتاج مساعدة؟**

قل لي في أي خطوة أنت:
- "ثبت CLI" ✅
- "سجلت دخول" ✅
- "نشرت" ✅
- "واجهت مشكلة" ❓

**أنا هنا لمساعدتك! 💪**
