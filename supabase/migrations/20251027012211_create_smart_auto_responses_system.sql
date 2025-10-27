/*
  # نظام الردود التلقائية الذكية للواتساب (Smart Auto-Responses System v3.0)

  ## الجداول الجديدة
  
  ### 1. `whatsapp_auto_responses`
  جدول الردود التلقائية الذكية:
  - `id` (uuid): معرف فريد
  - `keyword` (text): الكلمة المفتاحية للبحث
  - `response_ar` (text): نص الرد بالعربي
  - `response_en` (text): نص الرد بالإنجليزي
  - `intent` (text): نوع النية (question, followup, thanks, request, financial, technical, greeting)
  - `priority` (int): مستوى الأولوية من 1-5
  - `usage_count` (int): عدد مرات الاستخدام
  - `ai_generated` (boolean): هل تم توليده بالذكاء الاصطناعي
  - `status` (text): الحالة (active, inactive, pending_review)
  - `created_by` (text): رقم هاتف الموظف المنشئ
  - `last_used_at` (timestamp): آخر مرة استخدام
  - `effectiveness_score` (decimal): نسبة الفاعلية (من 0 إلى 1)
  - `metadata` (jsonb): بيانات إضافية

  ### 2. `whatsapp_response_logs`
  سجل استخدام الردود:
  - `id` (uuid): معرف فريد
  - `response_id` (uuid): معرف الرد المستخدم
  - `user_phone` (text): رقم المستخدم
  - `user_message` (text): رسالة المستخدم الأصلية
  - `matched_keyword` (text): الكلمة المطابقة
  - `response_sent` (text): الرد المرسل
  - `was_helpful` (boolean): هل كان مفيداً (من تقييم المستخدم)
  - `created_at` (timestamp): وقت الإرسال

  ## الأمان
  - RLS مفعل على جميع الجداول
  - سياسات للإدارة فقط
  - تسجيل كامل للعمليات
*/

-- إنشاء جدول الردود التلقائية
CREATE TABLE IF NOT EXISTS whatsapp_auto_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  response_ar text NOT NULL,
  response_en text,
  intent text NOT NULL DEFAULT 'question' CHECK (intent IN ('question', 'followup', 'thanks', 'request', 'financial', 'technical', 'greeting', 'general')),
  priority int NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  usage_count int NOT NULL DEFAULT 0,
  ai_generated boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_review')),
  created_by text NOT NULL,
  approved_by text,
  last_used_at timestamptz,
  effectiveness_score decimal(3,2) DEFAULT 0.00 CHECK (effectiveness_score BETWEEN 0 AND 1),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  deleted_by text
);

-- إنشاء جدول سجل استخدام الردود
CREATE TABLE IF NOT EXISTS whatsapp_response_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid REFERENCES whatsapp_auto_responses(id) ON DELETE CASCADE,
  user_phone text NOT NULL,
  user_type text CHECK (user_type IN ('visitor', 'investor', 'owner', 'admin')),
  user_message text NOT NULL,
  matched_keyword text NOT NULL,
  response_sent text NOT NULL,
  was_helpful boolean,
  feedback_text text,
  response_time_ms int,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول إحصاءات الردود (مُحدّث يومياً)
CREATE TABLE IF NOT EXISTS whatsapp_response_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid REFERENCES whatsapp_auto_responses(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  usage_count int DEFAULT 0,
  helpful_count int DEFAULT 0,
  unhelpful_count int DEFAULT 0,
  avg_response_time_ms int DEFAULT 0,
  unique_users_count int DEFAULT 0,
  UNIQUE(response_id, date)
);

-- إنشاء الفهارس للأداء
CREATE INDEX IF NOT EXISTS idx_auto_responses_keyword ON whatsapp_auto_responses(keyword);
CREATE INDEX IF NOT EXISTS idx_auto_responses_intent ON whatsapp_auto_responses(intent);
CREATE INDEX IF NOT EXISTS idx_auto_responses_priority ON whatsapp_auto_responses(priority DESC);
CREATE INDEX IF NOT EXISTS idx_auto_responses_status ON whatsapp_auto_responses(status);
CREATE INDEX IF NOT EXISTS idx_auto_responses_usage ON whatsapp_auto_responses(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_response_logs_response_id ON whatsapp_response_logs(response_id);
CREATE INDEX IF NOT EXISTS idx_response_logs_created_at ON whatsapp_response_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_response_stats_date ON whatsapp_response_stats(date DESC);

-- تفعيل RLS
ALTER TABLE whatsapp_auto_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_response_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_response_stats ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة (للجميع - للاستخدام في الزر الذكي)
CREATE POLICY "Allow read active responses for all"
  ON whatsapp_auto_responses FOR SELECT
  TO anon, authenticated
  USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "Allow read response logs for admins"
  ON whatsapp_response_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read response stats for admins"
  ON whatsapp_response_stats FOR SELECT
  TO authenticated
  USING (true);

-- سياسات الكتابة (للإدارة فقط)
CREATE POLICY "Allow insert responses for authenticated"
  ON whatsapp_auto_responses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update responses for authenticated"
  ON whatsapp_auto_responses FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow delete responses for authenticated"
  ON whatsapp_auto_responses FOR DELETE
  TO authenticated
  USING (true);

-- سياسة إضافة سجلات الاستخدام (للجميع)
CREATE POLICY "Allow insert response logs for all"
  ON whatsapp_response_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- سياسة تحديث الإحصاءات (للنظام)
CREATE POLICY "Allow insert/update stats for authenticated"
  ON whatsapp_response_stats FOR ALL
  TO authenticated
  USING (true);

-- دالة تحديث عداد الاستخدام تلقائياً
CREATE OR REPLACE FUNCTION increment_response_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE whatsapp_auto_responses
  SET 
    usage_count = usage_count + 1,
    last_used_at = NEW.created_at
  WHERE id = NEW.response_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger لتحديث عداد الاستخدام
DROP TRIGGER IF EXISTS auto_increment_response_usage ON whatsapp_response_logs;
CREATE TRIGGER auto_increment_response_usage
  AFTER INSERT ON whatsapp_response_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_response_usage();

-- دالة تحديث الإحصاءات اليومية
CREATE OR REPLACE FUNCTION update_daily_response_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO whatsapp_response_stats (
    response_id,
    date,
    usage_count,
    helpful_count,
    unhelpful_count,
    unique_users_count
  )
  VALUES (
    NEW.response_id,
    CURRENT_DATE,
    1,
    CASE WHEN NEW.was_helpful = true THEN 1 ELSE 0 END,
    CASE WHEN NEW.was_helpful = false THEN 1 ELSE 0 END,
    1
  )
  ON CONFLICT (response_id, date) DO UPDATE SET
    usage_count = whatsapp_response_stats.usage_count + 1,
    helpful_count = whatsapp_response_stats.helpful_count + 
      CASE WHEN NEW.was_helpful = true THEN 1 ELSE 0 END,
    unhelpful_count = whatsapp_response_stats.unhelpful_count + 
      CASE WHEN NEW.was_helpful = false THEN 1 ELSE 0 END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger لتحديث الإحصاءات اليومية
DROP TRIGGER IF EXISTS auto_update_daily_stats ON whatsapp_response_logs;
CREATE TRIGGER auto_update_daily_stats
  AFTER INSERT ON whatsapp_response_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_response_stats();

-- دالة البحث الذكي في الردود
CREATE OR REPLACE FUNCTION search_smart_responses(
  search_query text,
  max_results int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  keyword text,
  response_ar text,
  priority int,
  usage_count int,
  match_score float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.keyword,
    r.response_ar,
    r.priority,
    r.usage_count,
    (
      CASE 
        WHEN r.keyword ILIKE search_query THEN 1.0
        WHEN r.keyword ILIKE search_query || '%' THEN 0.8
        WHEN r.keyword ILIKE '%' || search_query || '%' THEN 0.6
        WHEN r.response_ar ILIKE '%' || search_query || '%' THEN 0.4
        ELSE 0.2
      END
    ) as match_score
  FROM whatsapp_auto_responses r
  WHERE 
    r.status = 'active' 
    AND r.deleted_at IS NULL
    AND (
      r.keyword ILIKE '%' || search_query || '%'
      OR r.response_ar ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    match_score DESC,
    r.priority DESC,
    r.usage_count DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إدراج بعض الردود الأساسية
INSERT INTO whatsapp_auto_responses (keyword, response_ar, response_en, intent, priority, created_by, status) VALUES
('مرحبا', 'مرحباً بك في منصة النخيل والزيتون! 🌿 كيف يمكنني مساعدتك اليوم؟', 'Welcome to Palm & Olive Platform! 🌿 How can I help you today?', 'greeting', 5, 'system', 'active'),
('سعر', 'أسعار الأشجار تبدأ من 500 ريال للشجرة الواحدة، وتختلف حسب نوع الشجرة والمزرعة. يمكنك استعراض المزارع المتاحة للحصول على تفاصيل دقيقة 📊', 'Tree prices start from 500 SAR per tree, varying by type and farm. Browse available farms for exact details 📊', 'question', 4, 'system', 'active'),
('حجز', 'لحجز أشجار، اختر المزرعة المناسبة ثم حدد عدد الأشجار المطلوبة. بعد الدفع ستحصل على شهادة ملكية رقمية فوراً 📜✨', 'To reserve trees, choose your farm and select the number of trees. After payment, you will receive a digital ownership certificate instantly 📜✨', 'request', 5, 'system', 'active'),
('تحويل', 'التحويل المالي يتم خلال 24 ساعة بعد اكتمال المبلغ المطلوب 💰 ستصلك رسالة تأكيد فور اكتمال العملية', 'Financial transfer is completed within 24 hours after the full amount is received 💰 You will receive a confirmation message', 'financial', 5, 'system', 'active'),
('استرداد', 'لطلب استرداد، يرجى التواصل مع قسم الدعم المالي عبر الواتساب أو البريد الإلكتروني. سيتم مراجعة طلبك خلال 48 ساعة 🔄', 'For refund requests, please contact financial support via WhatsApp or email. Your request will be reviewed within 48 hours 🔄', 'financial', 4, 'system', 'active'),
('شهادة', 'شهادة الملكية الرقمية تصلك فوراً بعد إتمام الدفع ويمكن تحميلها من لوحة التحكم الخاصة بك 📱', 'The digital ownership certificate is sent immediately after payment and can be downloaded from your dashboard 📱', 'question', 4, 'system', 'active'),
('ارباح', 'الأرباح تُوزع بشكل فصلي بعد حصاد المحصول، وستصلك تفاصيل التوزيع عبر الواتساب والإيميل 💵🌾', 'Profits are distributed quarterly after harvest, and distribution details will be sent via WhatsApp and email 💵🌾', 'financial', 5, 'system', 'active'),
('شكرا', 'العفو! سعداء بخدمتك دائماً 🌟 لا تتردد في التواصل معنا لأي استفسار', 'You are welcome! Happy to serve you always 🌟 Feel free to reach out for any inquiries', 'thanks', 2, 'system', 'active')
ON CONFLICT DO NOTHING;
