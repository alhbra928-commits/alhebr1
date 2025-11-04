# 🔒 تطبيق Migration الخصوصية

## ⚠️ خطوات مهمة جداً

### **يجب تطبيق هذا في Supabase:**

1. **افتح Supabase Dashboard**
   - اذهب إلى مشروعك
   - SQL Editor

2. **نسخ والصق هذا الكود:**

```sql
-- إضافة عمود session_token
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_messages' 
    AND column_name = 'session_token'
  ) THEN
    ALTER TABLE whatsapp_messages 
    ADD COLUMN session_token text;
  END IF;
END $$;

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session_token 
ON whatsapp_messages(session_token);

-- إضافة فهرس مركب للاستعلامات الشائعة
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session_source 
ON whatsapp_messages(session_token, source_type, created_at DESC);

-- إضافة تعليق
COMMENT ON COLUMN whatsapp_messages.session_token IS 'Session token للخصوصية - كل مستخدم له جلسة فريدة';
```

3. **اضغط Run**

4. **تحقق من النجاح:**
   - يجب أن يقول "Success"
   - لا أخطاء

---

## ✅ بعد التطبيق

1. **انشر الكود الجديد:**
```bash
npm run build
# ارفع dist/ إلى Netlify
```

2. **اختبر:**
   - افتح متصفحين مختلفين
   - جرب المحادثات
   - تأكد من الخصوصية

---

**هام:** بدون تطبيق هذا الـ Migration، الكود الجديد لن يعمل!
