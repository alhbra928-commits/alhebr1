# 🔐 نظام دخول الإدارة الذكي - منصة النخيل والزيتون

## 📋 نظرة عامة

نظام دخول إداري متطور يوفر تجربة مستخدم فخمة مع نظام جلسات حية وإدارة صلاحيات متقدمة.

---

## ✨ المميزات الرئيسية

### 1️⃣ **صفحة الدخول الذكية (Smart Login Portal)**

#### التصميم البصري:
- خلفية متحركة متدرجة بألوان الزيتون والذهبي
- شعار تاج ذهبي دوّار في المنتصف
- تأثيرات ضوئية متحركة في الخلفية
- نموذج دخول فاخر بتأثيرات زجاجية (Glassmorphism)

#### الحقول:
```
📱 رقم الجوال
🔑 رمز الدخول (OTP)
```

#### حسابات الاختبار:
```
المدير العام:
- الجوال: 0500000000
- الرمز: 1234

الموظف:
- الجوال: 0501234567
- الرمز: 5678
```

#### التحقق الذكي:
- ✅ التحقق من صلاحية المستخدم
- ✅ التحقق من رمز الدخول
- ✅ إنشاء جلسة تلقائياً عند النجاح
- ✅ رسائل خطأ واضحة ومفهومة

---

### 2️⃣ **نظام الجلسات الحية (Live Sessions)**

#### الميزات:
- تتبع جميع الجلسات النشطة في الوقت الحقيقي
- عرض معلومات تفصيلية لكل جلسة:
  - اسم المستخدم ورقم الجوال
  - القسم الحالي الذي يعمل فيه
  - آخر نشاط (منذ كم دقيقة/ساعة)
  - عنوان IP
  - معلومات الجهاز
  - حالة الجلسة (نشط/خامل/منتهي)

#### الإدارة:
- إمكانية إنهاء أي جلسة بضغطة واحدة
- تحديث تلقائي كل 10 ثوان
- تنبيه تلقائي عند خمول الجلسة لأكثر من 20 دقيقة

---

### 3️⃣ **نظام الصلاحيات المتقدم**

#### الوحدات المتاحة:
```
✓ لوحة التحكم (Dashboard)
✓ المزارع (Farms)
✓ المستثمرون (Investors)
✓ الحجوزات (Reservations)
✓ التوثيق (Documentation)
✓ المالية (Finance)
✓ المحافظ (Wallets)
✓ المالكون (Owners)
✓ الصلاحيات (Permissions)
✓ الجلسات الحية (Live Sessions)
✓ الإعدادات (Settings)
✓ النسخ الاحتياطية (Backups)
```

#### مستويات الصلاحيات:
```typescript
interface Permission {
  can_view: boolean;    // عرض
  can_create: boolean;  // إنشاء
  can_edit: boolean;    // تعديل
  can_delete: boolean;  // حذف
}
```

#### مثال:
```
المدير العام (Super Admin):
  - جميع الوحدات: عرض ✓ | إنشاء ✓ | تعديل ✓ | حذف ✓

موظف المالية:
  - لوحة التحكم: عرض ✓ | إنشاء ✗ | تعديل ✗ | حذف ✗
  - المالية: عرض ✓ | إنشاء ✓ | تعديل ✓ | حذف ✗
  - الحجوزات: عرض ✓ | إنشاء ✗ | تعديل ✓ | حذف ✗
```

---

## 🗄️ قاعدة البيانات

### الجداول الرئيسية:

#### 1. `admin_active_sessions` - الجلسات النشطة
```sql
CREATE TABLE admin_active_sessions (
  id uuid PRIMARY KEY,
  admin_phone text NOT NULL,
  admin_name text NOT NULL,
  admin_role text NOT NULL,
  session_token text UNIQUE NOT NULL,
  device_info text,
  ip_address text,
  current_module text,
  session_status text DEFAULT 'active',
  last_activity_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);
```

#### 2. `admin_module_permissions` - صلاحيات الوحدات
```sql
CREATE TABLE admin_module_permissions (
  id uuid PRIMARY KEY,
  admin_phone text NOT NULL,
  module_id text NOT NULL,
  module_name_ar text NOT NULL,
  module_name_en text NOT NULL,
  can_view boolean DEFAULT true,
  can_create boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  icon text,
  is_active boolean DEFAULT true,
  granted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(admin_phone, module_id)
);
```

#### 3. `admin_access_log` - سجل الوصول
```sql
CREATE TABLE admin_access_log (
  id uuid PRIMARY KEY,
  admin_phone text NOT NULL,
  admin_name text,
  action_type text NOT NULL,
  action_details text,
  device_info text,
  ip_address text,
  action_status text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

---

## 💻 البنية البرمجية

### الملفات الرئيسية:

#### 1. **SmartAdminLoginPage.tsx**
```
📁 src/modules/admin/components/SmartAdminLoginPage.tsx
```
- صفحة الدخول الرئيسية
- تصميم فاخر متحرك
- التحقق من البيانات
- إنشاء الجلسة

#### 2. **AdminSessionService.ts**
```
📁 src/modules/admin/services/adminSessionService.ts
```
- إدارة الجلسات (إنشاء/تحديث/إنهاء)
- التحقق من صلاحية الجلسة
- إدارة الصلاحيات
- سجل الدخول

#### 3. **LiveSessionsMonitor.tsx**
```
📁 src/modules/admin/components/LiveSessionsMonitor.tsx
```
- عرض الجلسات النشطة
- مراقبة النشاط
- إنهاء الجلسات
- تحديث تلقائي

---

## 🚀 كيفية الاستخدام

### للمطور:

#### 1. تشغيل المشروع:
```bash
npm run dev
```

#### 2. الوصول للمنصة:
- افتح المتصفح على `http://localhost:5173`
- اضغط على زر التاج الذهبي في أسفل يمين الصفحة
- ستظهر صفحة الدخول الذكية

#### 3. تسجيل الدخول:
```
المدير العام:
📱 0500000000
🔑 1234

الموظف:
📱 0501234567
🔑 5678
```

#### 4. بعد الدخول:
- سيتم إنشاء جلسة تلقائياً
- سيتم تحميل صلاحياتك
- سيتم تسجيل الدخول في السجل
- ستُوجّه إلى لوحة التحكم

---

## 🔧 الوظائف البرمجية

### إنشاء جلسة جديدة:
```typescript
import { AdminSessionService } from './services/adminSessionService';

const handleLogin = async (adminData) => {
  const { session, permissions } = await AdminSessionService.createSession(adminData);
  console.log('Session created:', session);
  console.log('Permissions:', permissions);
};
```

### تحديث نشاط الجلسة:
```typescript
const sessionToken = 'xxxxx-xxxxx-xxxxx';
await AdminSessionService.updateActivity(sessionToken, 'finance');
```

### إنهاء الجلسة:
```typescript
await AdminSessionService.terminateSession(sessionToken);
```

### الحصول على الجلسات النشطة:
```typescript
const sessions = await AdminSessionService.getAllActiveSessions();
console.log('Active sessions:', sessions);
```

### التحقق من صلاحية الجلسة:
```typescript
const isValid = await AdminSessionService.validateSession();
if (!isValid) {
  // إعادة توجيه للدخول
}
```

---

## 🎨 التصميم والألوان

### الألوان الرئيسية:
```typescript
const colors = {
  olive: '#3D5B4B',      // زيتوني داكن
  oliveLight: '#5A8672', // زيتوني فاتح
  gold: '#D4AF37',       // ذهبي
  dark: '#2E2A26',       // داكن
};
```

### التدرجات:
```typescript
const gradients = {
  background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 25%, #5A8672 50%, #3D5B4B 75%, #2E2A26 100%)',
  gold: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
  button: 'linear-gradient(135deg, #3D5B4B 0%, #5A8672 50%, #D4AF37 100%)',
};
```

### الظلال:
```css
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
box-shadow: 0 0 80px rgba(212, 175, 55, 0.6);
box-shadow: 0 10px 40px rgba(212, 175, 55, 0.5);
```

---

## 🔐 الأمان

### المستويات:
1. **التحقق من الجلسة** - في كل طلب
2. **انتهاء الجلسة تلقائياً** - بعد 8 ساعات
3. **الخمول التلقائي** - بعد 20 دقيقة من عدم النشاط
4. **سجل الدخول** - تسجيل جميع محاولات الدخول
5. **RLS Policies** - أمان على مستوى قاعدة البيانات

### أفضل الممارسات:
```typescript
// ✅ جيد - التحقق من الجلسة قبل كل عملية
const isValid = await AdminSessionService.validateSession();
if (!isValid) return;

// ✅ جيد - تحديث النشاط عند التفاعل
await AdminSessionService.updateActivity(token, currentModule);

// ✅ جيد - إنهاء الجلسة عند الخروج
await AdminSessionService.terminateSession(token);
```

---

## 📊 لوحة الجلسات الحية

### الوصول:
```
لوحة التحكم → الجلسات الحية
```

### المعلومات المعروضة:
- ✅ عدد الجلسات النشطة
- ✅ اسم المستخدم ورقم الجوال
- ✅ القسم الحالي
- ✅ آخر نشاط (بالدقائق/الساعات)
- ✅ عنوان IP
- ✅ حالة الجلسة (نشط/خامل)
- ✅ وقت البدء

### الإجراءات:
- 🔴 إنهاء الجلسة
- 🔄 تحديث تلقائي (كل 10 ثوان)

---

## 🎯 الخطط المستقبلية

### المرحلة القادمة:
- [ ] إضافة OTP حقيقي عبر SMS
- [ ] تفعيل المصادقة الثنائية (2FA)
- [ ] إضافة سجل كامل للأنشطة
- [ ] إشعارات فورية للمدير عند أي دخول جديد
- [ ] تقارير تفصيلية لنشاط المستخدمين
- [ ] إدارة متقدمة للصلاحيات من الواجهة
- [ ] تنبيهات ذكية للجلسات الخاملة

---

## 📝 الملاحظات المهمة

### للمطورين:
1. ✅ النظام مدمج بالكامل مع `App.tsx`
2. ✅ جميع الجلسات تُسجل في قاعدة البيانات
3. ✅ الصلاحيات تُحمّل تلقائياً عند الدخول
4. ✅ التحديث التلقائي للجلسات كل 10 ثوان
5. ⚠️ تأكد من تحديث نشاط الجلسة عند التنقل بين الأقسام

### للمستخدمين:
1. 📱 احفظ رقم الجوال ورمز الدخول
2. 🔐 لا تشارك معلومات الدخول
3. ⏱️ الجلسة تنتهي تلقائياً بعد 8 ساعات
4. 💤 الجلسة تصبح خاملة بعد 20 دقيقة من عدم النشاط
5. 🚪 اضغط "تسجيل خروج" عند الانتهاء

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا تظهر صفحة الدخول
```
الحل: تأكد من الضغط على زر التاج الذهبي في أسفل اليمين
```

### المشكلة: رمز الدخول غير صحيح
```
الحل: استخدم الأرقام التجريبية:
- مدير: 1234
- موظف: 5678
```

### المشكلة: الجلسة تنتهي سريعاً
```
الحل:
1. تحقق من آخر نشاط
2. الجلسة تصبح خاملة بعد 20 دقيقة
3. الجلسة تنتهي بعد 8 ساعات
```

### المشكلة: لا أرى جميع الأقسام
```
الحل:
1. تحقق من صلاحياتك
2. المدير العام فقط يرى جميع الأقسام
3. الموظفون يرون فقط الأقسام المصرح لهم
```

---

## ✅ قائمة التحقق النهائية

### للتطوير:
- [x] إنشاء جداول قاعدة البيانات
- [x] إنشاء صفحة الدخول الذكية
- [x] إنشاء خدمة إدارة الجلسات
- [x] إنشاء لوحة الجلسات الحية
- [x] دمج النظام مع App.tsx
- [x] اختبار تسجيل الدخول
- [x] اختبار الصلاحيات
- [x] اختبار الجلسات الحية

### للإنتاج:
- [ ] استبدال OTP التجريبي بـ SMS حقيقي
- [ ] تفعيل RLS المشددة في قاعدة البيانات
- [ ] إضافة تشفير للبيانات الحساسة
- [ ] مراجعة الأمان النهائية
- [ ] اختبار الحمل والأداء

---

## 📞 الدعم

للمساعدة والدعم:
- 📧 البريد: support@palmolive.com
- 📱 الجوال: 0500000000
- 💬 الدعم الفني: متاح على مدار الساعة

---

**🎯 نظام دخول إدارة ذكي متطور للمنصة! ✨**

**تاريخ آخر تحديث:** 2025-10-23
