# 📋 دليل استخدام Smart Error Modal

## نظام الإبلاغ الذكي عن الأخطاء

تم تطوير نظام متقدم للإبلاغ عن الأخطاء يلتقط كل التفاصيل تلقائياً ويسمح لك بنسخها بضغطة زر واحدة!

---

## ✨ المميزات

### 1. **التقاط تلقائي للتفاصيل**
- معلومات الخطأ الكاملة
- Supabase error codes & messages
- Stack trace
- Request & Response data
- معلومات البيئة (Browser, Platform, URL)
- الوقت والتاريخ الدقيق

### 2. **واجهة ذكية**
- تصنيف تلقائي لنوع الخطأ:
  - 🔴 Database errors
  - 🟣 Constraint violations
  - 🟠 RLS policy errors
  - 🔵 Network errors
  - 🟡 Validation errors

- ألوان مميزة لكل نوع
- أيقونات واضحة

### 3. **تقرير قابل للنسخ**
```
╔═══════════════════════════════════════════════════╗
║         📋 تقرير تفصيلي كامل عن المشكلة           ║
╚═══════════════════════════════════════════════════╝

📌 معلومات أساسية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏷️  العنوان: فشل اعتماد الإيصال
⏰ التاريخ والوقت: [تاريخ كامل]
🔖 نوع المشكلة: constraint
👤 الإجراء: اعتماد الإيصال (Receipt ID: xxx)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 وصف المشكلة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[وصف تفصيلي]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 الحلول المقترحة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. تأكد من...
2. تحقق من...
3. راجع...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 التفاصيل التقنية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Supabase Error Code: 23514
📄 Error Message: ...
📋 Details: ...
💭 Hint: ...

📚 Stack Trace: ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 بيانات الطلب (Request Data)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{JSON}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 معلومات البيئة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖥️  User Agent: ...
📱 Platform: ...
🌍 Language: ...
🔗 URL: ...
```

---

## 🔧 كيفية الاستخدام

### مثال 1: استخدام بسيط

```typescript
import { SmartErrorModal } from '../components/common/SmartErrorModal';

// في الـ component
const [showErrorModal, setShowErrorModal] = useState(false);
const [errorDetails, setErrorDetails] = useState<any>(null);

// عند حدوث خطأ
try {
  await someAsyncFunction();
} catch (error: any) {
  setErrorDetails({
    title: 'فشل العملية',
    message: 'حدث خطأ أثناء تنفيذ العملية',
    error: error,
    errorType: 'database', // أو اتركها فارغة للتصنيف التلقائي
    suggestions: [
      'تأكد من الاتصال بالإنترنت',
      'تحقق من صلاحياتك'
    ]
  });
  setShowErrorModal(true);
}

// في JSX
<SmartErrorModal
  isOpen={showErrorModal}
  onClose={() => {
    setShowErrorModal(false);
    setErrorDetails(null);
  }}
  title={errorDetails?.title}
  message={errorDetails?.message}
  error={errorDetails?.error}
  errorType={errorDetails?.errorType}
  suggestions={errorDetails?.suggestions}
/>
```

---

### مثال 2: استخدام متقدم مع تفاصيل كاملة

```typescript
try {
  await PaymentReceiptService.verifyReceipt(receiptId, 'admin', 'ملاحظة');
} catch (error: any) {
  setErrorDetails({
    title: '❌ فشل اعتماد الإيصال',
    message: 'حدث خطأ أثناء محاولة اعتماد الإيصال. يرجى مراجعة التفاصيل التقنية أدناه.',
    error: error,
    errorDetails: {
      timestamp: new Date(),
      userAction: `اعتماد الإيصال (Receipt ID: ${receiptId})`,
      apiEndpoint: '/rest/v1/payment_receipts',
      statusCode: error?.status,
      supabaseError: {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint
      },
      requestData: {
        receiptId: receiptId,
        action: 'verify',
        verifiedBy: 'admin'
      },
      responseData: error?.response
    },
    suggestions: [
      'تأكد من أن الإيصال موجود ولم يتم حذفه',
      'تحقق من صلاحيات المستخدم',
      'راجع قيود قاعدة البيانات (Constraints)',
      'تأكد من أن نوع الإشعار مسموح به'
    ]
  });
  setShowErrorModal(true);
}
```

---

## 📊 أنواع الأخطاء المدعومة

| النوع | الوصف | اللون | الأيقونة |
|------|-------|------|---------|
| `validation` | أخطاء التحقق من الحقول | 🟡 Amber | FileText |
| `database` | أخطاء قاعدة البيانات | 🔴 Red | Database |
| `constraint` | انتهاك قيود DB | 🟣 Purple | AlertCircle |
| `rls` | أخطاء RLS policies | 🟠 Orange | AlertCircle |
| `network` | مشاكل الشبكة | 🔵 Blue | Wifi |
| `general` | عام | ⚪ Gray | Bug |

---

## 🤖 التصنيف التلقائي

الـ modal ذكي! يصنف الأخطاء تلقائياً بناءً على:

```typescript
// Constraint errors
if (errorMsg.includes('constraint') || errorCode === '23505' || errorCode === '23514') {
  return 'constraint';
}

// RLS errors
if (errorMsg.includes('row level security') || errorCode === '42501') {
  return 'rls';
}

// Database errors
if (errorMsg.includes('database') || errorCode.startsWith('2') || errorCode.startsWith('4')) {
  return 'database';
}
```

---

## 💡 نصائح

### 1. **استخدم errorDetails للتفاصيل الدقيقة**
```typescript
errorDetails: {
  timestamp: new Date(),
  userAction: 'اعتماد الإيصال',
  apiEndpoint: '/rest/v1/payment_receipts',
  statusCode: 400,
  requestData: { receiptId: '123' },
  responseData: error?.response
}
```

### 2. **أضف suggestions مفيدة**
```typescript
suggestions: [
  'تأكد من الاتصال بالإنترنت',
  'امسح cache المتصفح',
  'تحقق من صلاحياتك',
  'راجع الـ constraint: notifications_type_check'
]
```

### 3. **دع الـ modal يصنف تلقائياً**
لا تحدد `errorType` إلا إذا كنت متأكداً. الـ modal سيصنف تلقائياً!

---

## 🎯 الفائدة الرئيسية

**عندما يرسل لك المستخدم التقرير:**
- تحصل على **كل** التفاصيل
- لا تحتاج لطلب معلومات إضافية
- تعرف بالضبط أين المشكلة
- تحل المشكلة أسرع ✨

---

## 📱 مثال حي

تم تطبيقه في:
- `BookingDetailsPanel.tsx` → اعتماد الإيصالات
- يمكن استخدامه في أي مكان آخر!

---

## ✅ جاهز للاستخدام

المشروع الآن يستخدم **SmartErrorModal** في جميع عمليات اعتماد الإيصالات.

عند حدوث أي خطأ:
1. يظهر modal جميل
2. يعرض التفاصيل كاملة
3. يقترح حلول
4. يسمح بنسخ التقرير بضغطة زر
5. يرسله المستخدم لك
6. تحل المشكلة في دقائق! 🚀
