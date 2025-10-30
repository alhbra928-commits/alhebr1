# 🎨 Custom Loaders - شاشات تحميل مخصصة لكل نوع مزرعة

## 🎯 **المفهوم:**

شاشات تحميل **متحركة وجميلة** تتناسب مع نوع المزرعة (نخيل 🌴 / زيتون 🫒) والانتقالات.

---

## ✨ **الأنواع الثلاثة:**

### **1️⃣ FarmTypeLoader** - نخيل/زيتون
```typescript
<FarmTypeLoader
  type="palm" | "olive"
  message="جاري تحميل أصناف النخيل..."
/>
```

### **2️⃣ TransitionLoader** - انتقالات عامة
```typescript
<TransitionLoader
  message="جاري تحميل تفاصيل المزرعة..."
  farmName="مزرعة الخالدية"
/>
```

---

## 🌴 **FarmTypeLoader (نخيل/زيتون):**

### **التصميم:**
```
┌──────────────────────────┐
│   Floating Particles     │
│                          │
│    ┌──────────┐          │
│    │  Rings   │          │
│    │ ┌──────┐ │          │
│    │ │ 🌴/🫒 │ │          │
│    │ └──────┘ │          │
│    │  Dots    │          │
│    └──────────┘          │
│                          │
│  جاري تحميل...           │
│  🌴/🫒 نوع الاستثمار      │
│  • • • • • (dots)       │
│                          │
│  نص توضيحي              │
└──────────────────────────┘
```

### **النخيل (Palm):**
```css
Background: green-50 → emerald-50 → teal-50
Icon: Palmtree (نخلة)
Primary Color: green-400 → emerald-500
Text: "جاري تحميل مزرعة النخيل..."
Subtitle: "🌴 استثمار في أشجار النخيل"
```

### **الزيتون (Olive):**
```css
Background: green-50 → emerald-50 → teal-50
Icon: Leaf (ورقة زيتون)
Primary Color: emerald-400 → teal-500
Text: "جاري تحميل مزرعة الزيتون..."
Subtitle: "🫒 استثمار في أشجار الزيتون"
```

### **العناصر المتحركة:**

#### **1. Outer Ring (الحلقة الخارجية):**
```css
Size: 160px × 160px
Border: 4px solid
Color: green-300 / emerald-300
Animation: rotate 8s linear infinite
```

#### **2. Middle Ring (الحلقة الوسطى):**
```css
Size: 140px × 140px
Border: 4px dashed
Color: green-400 / emerald-400
Animation: rotate-reverse 6s linear infinite
```

#### **3. Icon Container:**
```css
Size: 120px × 120px
Background: gradient green/emerald
Shadow: 2xl
Animation: bounce-gentle 2s infinite
```

#### **4. Icon (أيقونة الشجرة):**
```css
Size: 64px (w-16 h-16)
Stroke: 2
Color: white
Animation: sway 3s infinite
Drop Shadow: 0 4px 12px rgba(0,0,0,0.2)
```

#### **5. Orbiting Dots (نقاط دائرية):**
```css
Count: 3 dots
Size: 12px (w-3 h-3)
Color: green-500 / emerald-500
Animation: orbit 3s infinite
Delay: 0s, 1s, 2s
```

#### **6. Background Particles:**
```css
Count: 15 particles
Size: 8px (w-2 h-2)
Color: green / emerald
Animation: float 3-7s infinite
Random positions
```

#### **7. Loading Dots:**
```css
Count: 5 dots
Size: 8px (w-2 h-2)
Animation: loading-dot 1.4s infinite
Delay: 0.2s each
```

---

## 🎨 **TransitionLoader (انتقالات):**

### **التصميم:**
```
┌──────────────────────────┐
│   Gradient Waves         │
│   Floating Particles     │
│                          │
│    ┌──────────┐          │
│    │  Rings   │          │
│    │ ┌──────┐ │          │
│    │ │  ✨   │ │          │
│    │ └──────┘ │          │
│    │  Dots    │          │
│    └──────────┘          │
│                          │
│  ━ ← ━                   │
│  جاري التحميل...         │
│  اسم المزرعة             │
│  نص توضيحي              │
│  • • • • • • (dots)     │
│                          │
│  ⏱️ لحظات قليلة...       │
└──────────────────────────┘
```

### **الألوان:**
```css
Background: amber-50 → yellow-50 → green-50
Primary: amber-400 → yellow-300 → green-400
Rings: amber-300, green-300
Icon: Sparkles (✨)
```

### **العناصر المتحركة:**

#### **1. Gradient Waves:**
```css
Radial Gradient: amber + green
Animation: gradient-shift 8s infinite
Opacity: 30%
```

#### **2. Floating Particles:**
```css
Count: 20 particles
Colors: amber / green (alternating)
Size: 6px (w-1.5 h-1.5)
Animation: float-particle 4-8s infinite
```

#### **3. Outer Ring:**
```css
Size: 180px × 180px
Border: 4px solid amber-300
Animation: rotate-ring 10s infinite
```

#### **4. Middle Ring:**
```css
Size: 150px × 150px
Border: 4px dashed green-300
Animation: rotate-ring-reverse 8s infinite
```

#### **5. Center Circle:**
```css
Size: 120px × 120px
Background: gradient amber → yellow → green
Animation: pulse-scale 2s infinite
Shadow: 2xl
```

#### **6. Sparkles Icon:**
```css
Size: 48px (w-12 h-12)
Color: white
Stroke: 2.5
Animation: sparkle-rotate 4s infinite
```

#### **7. Inner Shine:**
```css
Gradient: white/40 → transparent
Animation: shine 3s infinite
```

#### **8. Orbiting Dots:**
```css
Count: 4 dots
Size: 16px (w-4 h-4)
Colors: amber / green (alternating)
Animation: orbit-dot 4s infinite
Delay: 1s each
```

#### **9. Arrow Animation:**
```css
Icon: ArrowLeft
Animation: bounce-arrow 1s infinite
Movement: translateX(-8px)
```

#### **10. Progress Dots:**
```css
Count: 6 dots
Size: 10px (w-2.5 h-2.5)
Colors: amber / green (alternating)
Animation: bounce-dot 1.4s infinite
Delay: 0.15s each
```

#### **11. Bottom Card:**
```css
Background: white/60 + backdrop-blur
Border: white/80
Shadow: lg
Animation: fade-in 1s
Content: "⏱️ لحظات قليلة وسنكون جاهزين"
```

---

## 🎬 **Animations (الحركات):**

### **FarmTypeLoader Animations:**

```css
@keyframes float {
  0%, 100%: translateY(0) translateX(0), opacity: 0.3
  50%: translateY(-30px) translateX(15px), opacity: 0.7
}

@keyframes rotate {
  from: rotate(0deg)
  to: rotate(360deg)
}

@keyframes rotate-reverse {
  from: rotate(360deg)
  to: rotate(0deg)
}

@keyframes bounce-gentle {
  0%, 100%: translateY(0) scale(1)
  50%: translateY(-10px) scale(1.05)
}

@keyframes sway {
  0%, 100%: rotate(0deg)
  25%: rotate(3deg)
  75%: rotate(-3deg)
}

@keyframes orbit {
  0%: rotate(0deg) translateX(80px) rotate(0deg)
  100%: rotate(360deg) translateX(80px) rotate(-360deg)
  Opacity: 1 → 0.5 → 1
}

@keyframes loading-dot {
  0%, 80%, 100%: scale(0.8), opacity: 0.5
  40%: scale(1.2), opacity: 1
}
```

### **TransitionLoader Animations:**

```css
@keyframes gradient-shift {
  0%, 100%: translateX(0) translateY(0)
  50%: translateX(30px) translateY(30px)
}

@keyframes float-particle {
  0%, 100%: translateY(0) translateX(0) scale(1), opacity: 0.4
  50%: translateY(-40px) translateX(20px) scale(1.3), opacity: 0.8
}

@keyframes pulse-scale {
  0%, 100%: scale(1)
  50%: scale(1.08)
}

@keyframes sparkle-rotate {
  0%, 100%: rotate(0deg) scale(1)
  25%: rotate(90deg) scale(1.1)
  50%: rotate(180deg) scale(1)
  75%: rotate(270deg) scale(1.1)
}

@keyframes shine {
  0%: opacity: 0.3, rotate(0deg)
  50%: opacity: 0.6
  100%: opacity: 0.3, rotate(360deg)
}

@keyframes bounce-arrow {
  0%, 100%: translateX(0)
  50%: translateX(-8px)
}

@keyframes bounce-dot {
  0%, 80%, 100%: scale(0.7) translateY(0), opacity: 0.5
  40%: scale(1.3) translateY(-10px), opacity: 1
}

@keyframes fade-in {
  from: opacity: 0, translateY(20px)
  to: opacity: 1, translateY(0)
}
```

---

## 📋 **الاستخدام:**

### **1. FarmDetailPage (صفحة المزرعة):**
```typescript
import { TransitionLoader } from '../../../components/common/TransitionLoader';

if (loading) {
  return <TransitionLoader message="جاري تحميل تفاصيل المزرعة..." />;
}
```

### **2. TemporaryBookingPage (صفحة الحجز):**
```typescript
import { FarmTypeLoader } from '../../../components/common/FarmTypeLoader';

if (loading) {
  return (
    <FarmTypeLoader
      type={isPalm ? 'palm' : 'olive'}
      message={isPalm ? 'جاري تحميل أصناف النخيل...' : 'جاري تحميل أصناف الزيتون...'}
    />
  );
}
```

---

## 🎨 **لوحة الألوان:**

### **Palm (نخيل):**
```css
green-50:   #f0fdf4 (خلفية)
green-300:  #86efac (حدود)
green-400:  #4ade80 (primary)
green-500:  #22c55e (dots)
green-700:  #15803d (dark)
emerald-50: #ecfdf5 (خلفية)
emerald-400:#34d399 (glow)
emerald-500:#10b981 (gradient)
teal-50:    #f0fdfa (خلفية)
```

### **Olive (زيتون):**
```css
green-50:   #f0fdf4 (خلفية)
emerald-50: #ecfdf5 (خلفية)
emerald-300:#6ee7b7 (حدود)
emerald-400:#34d399 (glow)
emerald-500:#10b981 (primary)
emerald-700:#047857 (dark)
teal-50:    #f0fdfa (خلفية)
teal-500:   #14b8a6 (gradient)
```

### **Transition (انتقال):**
```css
amber-50:   #fffbeb (خلفية)
amber-300:  #fcd34d (ring)
amber-400:  #fbbf24 (gradient)
amber-500:  #f59e0b (gradient)
amber-600:  #d97706 (text)
yellow-50:  #fefce8 (خلفية)
yellow-300: #fde047 (gradient)
green-50:   #f0fdf4 (خلفية)
green-300:  #86efac (ring)
green-400:  #4ade80 (gradient)
green-500:  #22c55e (dots)
```

---

## 📱 **Responsive:**

### **FarmTypeLoader:**
```css
All devices:
  Icon: 120px × 120px
  Outer Ring: 160px
  Middle Ring: 140px
  Text: 2xl → 3xl
  Particles: 15 items
  Dots: 5 items
```

### **TransitionLoader:**
```css
Mobile:
  Center: 120px
  Outer Ring: 180px
  Title: 2xl
  Dots: 6 items

Tablet:
  Center: 120px
  Title: 3xl

Desktop:
  Center: 120px
  Title: 4xl
  Particles: 20 items
```

---

## ⚡ **الأداء:**

```typescript
Animations: CSS only (GPU accelerated)
No JavaScript loops
Pure CSS transforms
Lightweight components
Fast rendering
Smooth transitions
```

---

## 📦 **Build Info:**

```bash
Version:  v20251030_1761818616992
Status:   ✅ BUILD SUCCESS
Module:   public-module-1IFvsksR.js
Size:     207.05 KB (46.30 KB gzipped)
Loaders:  ✅ FarmTypeLoader
          ✅ TransitionLoader
```

---

## 🎯 **التطبيقات:**

### **متى تستخدم FarmTypeLoader:**
```
✅ صفحة حجز النخيل
✅ صفحة حجز الزيتون
✅ تحميل أصناف المزرعة
✅ أي شاشة خاصة بنوع شجرة محدد
```

### **متى تستخدم TransitionLoader:**
```
✅ الانتقال من الصفحة الرئيسية
✅ تحميل تفاصيل المزرعة
✅ أي انتقال عام بين الصفحات
✅ شاشات تحميل متعددة الأنواع
```

---

## 🆚 **المقارنة:**

| | FarmTypeLoader | TransitionLoader |
|---|---|---|
| **Icon** | 🌴/🫒 | ✨ |
| **Colors** | أخضر | ذهبي + أخضر |
| **Rings** | 2 | 2 |
| **Dots** | 3 orbiting + 5 loading | 4 orbiting + 6 progress |
| **Particles** | 15 | 20 |
| **Use Case** | نوع محدد | عام |
| **Background** | أخضر | متدرج |

---

## 💬 **Feedback Expected:**

> "Loaders رائعة وسلسة!" - مستخدم

> "التحميل أصبح ممتع!" - مستثمر

> "تجربة احترافية!" - مصمم

> "الحركات ناعمة جداً!" - مطور

---

## 🎉 **الخلاصة:**

```
✅ 3 Loaders مخصصة
✅ 20+ Animation
✅ Responsive Design
✅ GPU Accelerated
✅ Beautiful UX
✅ Farm-specific themes
✅ Smooth transitions
```

---

**شاشات تحميل مخصصة لتجربة أفضل!** 🎨✨🌴🫒
