# 🎯 دليل تطوير نظام الواتساب المركزي - البنية الأساسية

## ✅ ما تم إنجازه

### 1️⃣ قاعدة البيانات (مكتملة 100%)

تم إنشاء 7 جداول كاملة:

```sql
✓ whatsapp_settings          - إعدادات النظام
✓ whatsapp_message_templates  - قوالب الرسائل (6 قوالب جاهزة)
✓ whatsapp_messages          - سجل الرسائل الكامل
✓ whatsapp_broadcast_campaigns - حملات البث
✓ whatsapp_automation_rules   - قواعد الأتمتة
✓ whatsapp_conversations     - المحادثات الثنائية
✓ whatsapp_daily_stats       - الإحصائيات اليومية
```

**المزايا:**
- RLS مفعّل على جميع الجداول
- 15+ فهرس لتحسين الأداء
- Triggers تلقائية للإحصائيات
- Function جاهزة لإرسال الرسائل

### 2️⃣ الخدمة الأساسية (مكتملة 80%)

**الملف:** `src/modules/whatsapp/services/whatsappService.ts`

**الوظائف الجاهزة:**
```typescript
✓ getSettings()               - جلب الإعدادات
✓ updateSettings()            - تحديث الإعدادات
✓ testConnection()            - اختبار الاتصال
✓ getTemplates()              - جلب القوالب
✓ createTemplate()            - إنشاء قالب
✓ sendMessage()               - إرسال رسالة
✓ getMessages()               - جلب سجل الرسائل
✓ getCampaigns()              - جلب الحملات
✓ getDailyStats()             - الإحصائيات اليومية
✓ getTodayStats()             - إحصائيات اليوم
✓ sendBookingConfirmation()   - تأكيد الحجز
✓ sendPaymentConfirmation()   - تأكيد الدفع
✓ sendCertificateNotification() - إشعار الشهادة
```

---

## 🚧 ما يحتاج إلى إكمال

### المرحلة 1️⃣: الواجهات الأساسية (4-6 ساعات)

#### أ) Dashboard الرئيسي

**المسار:** `src/modules/whatsapp/components/WhatsAppDashboard.tsx`

**المكونات المطلوبة:**
```tsx
- إحصائيات لحظية (اليوم)
- عدادات متحركة (مرسل، مستلم، مقروء، فاشل)
- رسوم بيانية للأيام السابقة
- بطاقات سريعة للإدارات (مالية، حجوزات، توثيق)
- حالة الاتصال (متصل/غير متصل)
- زر سريع لإرسال broadcast
```

**التصميم:**
- Gradient زيتوني × ذهبي
- بطاقات 3D مع shadows
- عدّادات متحركة (AnimatedCounter)
- أيقونات من lucide-react

#### ب) إدارة القوالب

**المسار:** `src/modules/whatsapp/components/TemplatesManager.tsx`

**المكونات:**
```tsx
- جدول القوالب مع الفئات
- نموذج إنشاء/تعديل قالب
- معاينة القالب مع المتغيرات
- تفعيل/إيقاف القالب
- إحصائيات الاستخدام لكل قالب
```

#### ج) سجل الرسائل

**المسار:** `src/modules/whatsapp/components/MessagesLog.tsx`

**المكونات:**
```tsx
- جدول الرسائل مع فلاتر
- بحث بالرقم أو الاسم
- فلتر حسب الحالة/النوع/الفئة/التاريخ
- تفاصيل الرسالة في modal
- زر إعادة الإرسال للفاشلة
- تصدير إلى Excel/CSV
```

#### د) البث الجماعي

**المسار:** `src/modules/whatsapp/components/BroadcastManager.tsx`

**المكونات:**
```tsx
- إنشاء حملة جديدة
- اختيار الفئة المستهدفة
- كتابة الرسالة أو اختيار قالب
- معاينة المستلمين
- جدولة الإرسال
- متابعة حالة الحملة
```

#### هـ) الإعدادات والربط

**المسار:** `src/modules/whatsapp/components/WhatsAppSettings.tsx`

**المكونات:**
```tsx
- إدخال API Key
- إدخال Phone Number ID
- إدخال Business Account ID
- توقيع المنصة
- رابط الشعار
- زر اختبار الاتصال
- حالة الاتصال اللحظية
```

---

### المرحلة 2️⃣: التكامل مع الإدارات (3-4 ساعات)

#### أ) إدارة الحجوزات

**الملف:** `src/modules/reservations/components/AdvancedBookingsView.tsx`

**الإضافة المطلوبة:**
```typescript
import { whatsappService } from '../../whatsapp/services/whatsappService';

// عند الموافقة على الحجز
await whatsappService.sendBookingConfirmation({
  customer_name: booking.customer_name,
  customer_phone: booking.customer_phone,
  farm_name: booking.farm_name,
  tree_count: booking.reserved_trees,
  total_amount: booking.total_amount,
  booking_id: booking.id
});
```

#### ب) إدارة المستندات

**الملف:** `src/modules/documentation/components/DocumentationView.tsx`

**الإضافة المطلوبة:**
```typescript
// عند إصدار الشهادة
await whatsappService.sendCertificateNotification({
  customer_name: doc.customer_name,
  customer_phone: doc.customer_phone,
  certificate_number: doc.verification_token,
  tree_count: doc.reserved_trees
});
```

#### ج) إدارة الدفعات

**الملف:** `src/modules/documentation/components/PaymentReceiptsManagement.tsx`

**الإضافة المطلوبة:**
```typescript
// عند قبول الدفعة
await whatsappService.sendPaymentConfirmation({
  customer_name: receipt.investor_name,
  customer_phone: receipt.investor_phone,
  amount: receipt.amount,
  payment_date: new Date(receipt.payment_date).toLocaleDateString('ar-SA')
});
```

#### د) إدارة التسويات

**الملف:** `src/modules/finance/services/settlementService.ts`

**الإضافة المطلوبة:**
```typescript
// عند إتمام التسوية
await whatsappService.sendMessage({
  recipient_phone: owner.mobile,
  recipient_name: owner.name_ar,
  recipient_type: 'farm_owner',
  template_code: 'SETTLEMENT_COMPLETED',
  variables: {
    owner_name: owner.name_ar,
    amount: settlement.amount.toString(),
    settlement_date: new Date().toLocaleDateString('ar-SA')
  },
  trigger_event: 'settlement_completed'
});
```

---

### المرحلة 3️⃣: زر الواتساب العائم (2 ساعة)

**المسار:** `src/components/common/FloatingWhatsAppButton.tsx`

**المكونات:**
```tsx
export function FloatingWhatsAppButton() {
  // زر دائري في الزاوية اليمنى السفلى
  // أخضر بأيقونة واتساب
  // عند الضغط يفتح نافذة دردشة
  // أو يحول للواتساب مباشرة

  const whatsappNumber = '+966XXXXXXXXX';
  const message = 'مرحباً، أحتاج مساعدة في...';

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50..."
    >
      <MessageCircle className="w-8 h-8" />
    </a>
  );
}
```

**الإضافة في:**
- `src/App.tsx`
- `src/modules/dashboard/EnhancedDashboard.tsx`
- `src/modules/public/components/PublicPlatformRouter.tsx`

---

### المرحلة 4️⃣: WhatsApp Business API (4-6 ساعات)

**الملف:** `src/modules/whatsapp/services/whatsappAPI.ts`

**التكامل المطلوب:**
```typescript
// استخدام Meta WhatsApp Business Cloud API
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  message: string
) {
  const response = await fetch(
    `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    }
  );

  return response.json();
}
```

**خطوات التفعيل:**
1. إنشاء حساب Meta Business
2. إنشاء تطبيق WhatsApp Business
3. الحصول على Access Token
4. تسجيل Phone Number
5. Verify Webhook URL
6. اختبار الإرسال

---

## 📊 هيكل المجلدات المقترح

```
src/modules/whatsapp/
├── components/
│   ├── WhatsAppDashboard.tsx          ⭐ (أساسي)
│   ├── TemplatesManager.tsx           ⭐ (أساسي)
│   ├── MessagesLog.tsx                ⭐ (أساسي)
│   ├── BroadcastManager.tsx           ⭐ (أساسي)
│   ├── WhatsAppSettings.tsx           ⭐ (أساسي)
│   ├── ConversationViewer.tsx         (اختياري)
│   ├── AutomationRulesManager.tsx     (متقدم)
│   └── StatsCharts.tsx                (مساعد)
│
├── services/
│   ├── whatsappService.ts             ✅ (جاهز)
│   ├── whatsappAPI.ts                 🚧 (يحتاج تطوير)
│   └── whatsappWebhook.ts             🚧 (يحتاج تطوير)
│
└── types/
    └── whatsapp.types.ts              (أنواع مشتركة)
```

---

## 🎨 معايير التصميم

### الألوان:
```css
الأساسي: Olive Green (#4A5D23)
الثانوي: Gold (#FFD700)
النجاح: Green (#10B981)
الخطأ: Red (#EF4444)
الخلفية: من زيتوني فاتح إلى ذهبي فاتح
```

### المكونات:
```tsx
- بطاقات 3D مع shadow-2xl
- Gradients للعناوين
- أيقونات كبيرة وواضحة
- عدّادات متحركة
- Badges للحالات
- Tooltips توضيحية
```

---

## 🔗 إضافة النظام للـ Dashboard

**الملف:** `src/modules/dashboard/EnhancedDashboard.tsx`

**الإضافة:**
```tsx
import { MessageCircle } from 'lucide-react';

const modules = [
  // ... الموديولات الموجودة
  {
    id: 'whatsapp',
    title: 'إدارة الاتصالات والواتساب',
    description: 'التحكم الكامل في الرسائل والإشعارات',
    icon: MessageCircle,
    color: 'from-green-500 to-emerald-600'
  }
];
```

**إضافة الـ Route:**
```tsx
{activeModule === 'whatsapp' && (
  <WhatsAppDashboard />
)}
```

---

## 📝 قائمة التحقق النهائية

### البنية التحتية:
- [x] جداول قاعدة البيانات
- [x] RLS Policies
- [x] Indexes
- [x] Triggers
- [x] Functions
- [x] Default Templates

### الخدمات:
- [x] whatsappService.ts (أساسي)
- [ ] whatsappAPI.ts (التكامل الفعلي)
- [ ] whatsappWebhook.ts (استقبال الردود)

### الواجهات:
- [ ] WhatsAppDashboard
- [ ] TemplatesManager
- [ ] MessagesLog
- [ ] BroadcastManager
- [ ] WhatsAppSettings

### التكامل:
- [ ] ربط مع الحجوزات
- [ ] ربط مع التوثيق
- [ ] ربط مع الدفعات
- [ ] ربط مع التسويات

### الإضافات:
- [ ] زر الواتساب العائم
- [ ] إضافة للـ Sidebar
- [ ] الاختبار الشامل

---

## 🚀 خطة التنفيذ الموصى بها

### اليوم 1 (6 ساعات):
```
9:00  - 11:00  | WhatsAppDashboard.tsx
11:00 - 13:00  | TemplatesManager.tsx
14:00 - 16:00  | MessagesLog.tsx
```

### اليوم 2 (6 ساعات):
```
9:00  - 11:00  | BroadcastManager.tsx
11:00 - 13:00  | WhatsAppSettings.tsx
14:00 - 16:00  | التكامل مع الإدارات
```

### اليوم 3 (4 ساعات):
```
9:00  - 11:00  | زر الواتساب العائم + Sidebar
11:00 - 13:00  | الاختبار والتحسينات
```

### اليوم 4 (8 ساعات):
```
9:00  - 13:00  | whatsappAPI.ts (التكامل الفعلي)
14:00 - 17:00  | الاختبار مع WhatsApp Business
```

---

## 💡 نصائح مهمة

### 1. البدء بالأساسيات:
```
✓ ابدأ بالـ Dashboard والإحصائيات
✓ ثم القوالب والرسائل
✓ ثم البث والحملات
✓ أخيراً التكامل مع API
```

### 2. الاختبار:
```
✓ اختبر كل مكون بشكل منفصل
✓ استخدم console.log بكثرة
✓ تحقق من قاعدة البيانات بعد كل عملية
✓ اختبر الـ RLS policies
```

### 3. الأمان:
```
✓ لا تعرض API Keys في الكود
✓ استخدم environment variables
✓ تحقق من صلاحيات المستخدم
✓ سجّل كل العمليات
```

---

## 🎉 النتيجة النهائية المتوقعة

عند الانتهاء ستحصل على:

1. ✅ نظام واتساب متكامل مع قاعدة بيانات قوية
2. ✅ Dashboard مركزي مع إحصائيات لحظية
3. ✅ إدارة كاملة للقوالب والرسائل
4. ✅ نظام بث جماعي احترافي
5. ✅ تكامل تلقائي مع جميع الإدارات
6. ✅ زر واتساب عائم في كل الصفحات
7. ✅ سجل كامل لجميع الرسائل
8. ✅ إحصائيات وتقارير شاملة
9. ✅ أمان عالي مع RLS
10. ✅ جاهز للتكامل مع WhatsApp Business API

---

## 📞 للدعم والمساعدة

إذا واجهت أي مشكلة:

1. راجع هذا الدليل
2. تحقق من console.log
3. افحص جداول قاعدة البيانات
4. اختبر الـ Functions يدوياً
5. راجع RLS Policies

---

**تاريخ الإنشاء:** 2025-10-24
**الإصدار:** 1.0.0
**الحالة:** 🚧 البنية الأساسية جاهزة - يحتاج إكمال الواجهات
