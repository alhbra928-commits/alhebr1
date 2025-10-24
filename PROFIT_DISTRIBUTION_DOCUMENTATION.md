# 💰 توثيق نظام توزيع الأرباح

## 📅 التاريخ
2025-10-23

## ✅ الحالة
**مكتمل - جاهز للاستخدام**

---

## 🎯 الهدف

توضيح توزيع الأرباح بعد التسوية:
1. ✅ محفظة صاحب المزرعة تُغلق نهائياً
2. ✅ الأرباح تُوزع تلقائياً
3. ✅ محفظة المنصة تستقبل 75%
4. ✅ محفظة الخير تستقبل 25%

---

## 🔄 سير العمل الكامل

### المرحلة 1️⃣: قبل التسوية
```
┌─────────────────────────────────────┐
│ محفظة المستثمرين: 60,000,000 ريال │ ✅ نشطة
│ محفظة صاحب المزرعة: 0 ريال        │ ⏳ في انتظار
│ محفظة المنصة: 0 ريال               │ ⏳ في انتظار
│ محفظة الخير: 0 ريال                │ ⏳ في انتظار
└─────────────────────────────────────┘
```

### المرحلة 2️⃣: التسوية (executeSettlement)
```
Admin يضغط "✅ تنفيذ التسوية"
↓
60M تنتقل من محفظة المستثمرين → محفظة صاحب المزرعة
↓
محفظة صاحب المزرعة تُغلق نهائياً ❌
↓
settlement_status = 'settled'
owner_payment_approved = true
```

### المرحلة 3️⃣: توزيع الأرباح (distributeProfits)
```
يتم استدعاء distribute_profits_to_platform_and_charity() تلقائياً
↓
حساب الأرباح:
- الأرباح الإجمالية = 99,800,000 - 60,000,000 = 39,800,000 ريال
- محفظة الخير (25%) = 39,800,000 × 0.25 = 9,950,000 ريال
- محفظة المنصة (75%) = 39,800,000 - 9,950,000 = 29,850,000 ريال
↓
تحديث المحافظ:
✅ platform_wallet.total_balance += 29,850,000
✅ charity_wallet.total_balance += 9,950,000
↓
profit_distributed = true
charity_distributed = true
```

### المرحلة 4️⃣: بعد التسوية
```
┌─────────────────────────────────────┐
│ محفظة المستثمرين: 60M ريال         │ 🔒 مقفلة
│ محفظة صاحب المزرعة: 60M ريال       │ ❌ مغلقة نهائياً
│ محفظة المنصة: 29,850,000 ريال      │ ✅ نشطة
│ محفظة الخير: 9,950,000 ريال        │ ✅ نشطة
└─────────────────────────────────────┘
```

---

## 📊 العرض في الصفحة

### قبل التسوية:
```typescript
محفظة المستثمرين:
  amount: 60,000,000
  description: "المبلغ المجمع: 100%"
  status: نشطة ✅

محفظة صاحب المزرعة:
  amount: 0 (remaining_for_owner)
  description: "متبقي: 0 ريال"
  status: نشطة ⏳

محفظة المنصة:
  amount: 0
  description: "في انتظار التسوية"
  status: غير نشطة ⏸️

محفظة الخير:
  amount: 0
  description: "في انتظار التسوية"
  status: غير نشطة ⏸️
```

### بعد التسوية:
```typescript
محفظة المستثمرين:
  amount: 60,000,000
  description: "المبلغ المجمع: 100%"
  status: مقفلة 🔒
  opacity: 60%

محفظة صاحب المزرعة:
  amount: 60,000,000 (actual_amount)
  description: "تمت التسوية ✅"
  status: مغلقة نهائياً ❌
  border: red (4px)
  badge: "مغلقة"

محفظة المنصة:
  amount: 29,850,000 (netPlatformProfit)
  description: "الربح الصافي (بعد استقطاع 25%)"
  status: نشطة ✅

محفظة الخير:
  amount: 9,950,000 (charityAmount)
  description: "25% من الأرباح الإجمالية"
  status: نشطة ✅
```

---

## 📋 رسالة توزيع الأرباح

بعد التسوية تظهر بطاقة جميلة:

```
┌─────────────────────────────────────────┐
│         🤍 توزيع الأرباح 🤍            │
├─────────────────────────────────────────┤
│                                         │
│  الأرباح الإجمالية: 39,800,000 ريال   │
│  ─────────────────────────────────────  │
│  💰 محفظة المنصة: 29,850,000 (75%)    │
│  🤍 محفظة الخير: 9,950,000 (25%)      │
│                                         │
│         🤲 جزاكم الله خيرًا 🤲         │
└─────────────────────────────────────────┘

خلفية: from-yellow-50 to-yellow-100
إطار: border-2 border-yellow-400
```

---

## 🔍 التفاصيل التقنية

### الحسابات:
```typescript
const grossProfit = Number(farmData.platform_profit) || 0;  // 39,800,000
const charityAmount = Number(farmData.charity_amount) || 0;  // 9,950,000
const netPlatformProfit = grossProfit - charityAmount;       // 29,850,000
```

### الشروط:
```typescript
const isSettled = farmData.owner_payment_approved;           // true بعد التسوية
const isProfitDistributed = farmData.profit_distributed;     // true بعد التوزيع
```

### قاعدة البيانات:
```sql
-- بعد التسوية
SELECT 
  settlement_status,           -- 'settled'
  owner_payment_approved,      -- true
  profit_distributed,          -- true
  charity_distributed,         -- true
  platform_profit,             -- 39,800,000
  charity_amount              -- 9,950,000
FROM smart_farm_finances
WHERE farm_code = 'FARM-2025-0006';
```

---

## 🎨 التصميم

### محفظة المنصة:
```css
gradient: from-purple-600 to-purple-800
title: "محفظة المنصة"
amount: 29,850,000 ريال
description: "الربح الصافي (بعد استقطاع 25%)"
status: نشطة ✅
```

### محفظة الخير:
```css
gradient: from-pink-600 to-pink-800
title: "محفظة الخير"
amount: 9,950,000 ريال
description: "25% من الأرباح الإجمالية"
status: نشطة ✅
```

### بطاقة التوزيع:
```css
background: from-yellow-50 to-yellow-100
border: 2px solid yellow-400
shadow: xl
text: yellow-900 (عناوين), green-700 (منصة), pink-700 (خير)
```

---

## 📦 ملخص التغييرات

### ملفات معدلة:

1. **FarmFinancialFullPage.tsx**
   - حساب الربح الصافي: `netPlatformProfit = grossProfit - charityAmount`
   - تحديث عرض محفظة المنصة
   - تحديث عرض محفظة الخير
   - إضافة بطاقة توزيع الأرباح
   - إضافة شرط `isProfitDistributed`

### الأكواد المضافة:
```typescript
// الحسابات
const grossProfit = Number(farmData.platform_profit) || 0;
const netPlatformProfit = grossProfit - charityAmount;
const isProfitDistributed = farmData.profit_distributed;

// البطاقة الجديدة
{isProfitDistributed && (
  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100...">
    // محتوى البطاقة
  </div>
)}
```

---

## ✅ التحقق

### البيانات الفعلية:

```sql
-- المحافظ الحالية
platform_wallet.total_balance = 59,700,000 (من مزرعتين)
charity_wallet.total_balance = 19,900,000 (من مزرعتين)

-- مزرعة الزيتونة
grossProfit = 39,800,000
netPlatformProfit = 29,850,000 (75%)
charityAmount = 9,950,000 (25%)
```

---

## 🚀 التجربة

1. **Hard Refresh**: `Ctrl+Shift+R`
2. اذهب إلى "الإدارة المالية"
3. انقر على "مزرعة الزيتونة"
4. (إذا لم تكن مُسوّاة) اضغط "✅ تنفيذ التسوية"
5. **شاهد التوزيع التلقائي!** 🎉

---

## 🎉 النتيجة

**نظام توزيع الأرباح يعمل بشكل كامل وتلقائي!**

```
التسوية → إغلاق محفظة المالك → التوزيع التلقائي
                                  ↓
                   محفظة المنصة (75%) + محفظة الخير (25%)
```

**كل شيء واضح وشفاف!** ✨
