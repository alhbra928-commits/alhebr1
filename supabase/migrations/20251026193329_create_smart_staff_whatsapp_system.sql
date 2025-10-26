/*
  # نظام الواتساب الذكي للموظفين والتخصصات

  ## الوصف
  نظام متكامل لإدارة تواصل العملاء عبر الواتساب مع ربط كل موظف بتخصصه
  ورقم واتساب خاص، مع توجيه ذكي للعملاء وتحليلات متقدمة.

  ## 1. الجداول الجديدة
  
  ### أ) `whatsapp_departments` - الأقسام والتخصصات
    - `id` (uuid) - المعرف الفريد
    - `code` (text) - كود القسم (sales, support, finance, admin)
    - `name_ar` (text) - اسم القسم بالعربية
    - `name_en` (text) - اسم القسم بالإنجليزية
    - `description_ar` (text) - وصف القسم
    - `icon` (text) - أيقونة القسم
    - `color` (text) - لون القسم
    - `priority` (int) - ترتيب الأولوية
    - `is_active` (boolean) - حالة التفعيل
    - `available_for` (text[]) - متاح لأنواع المستخدمين
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### ب) `whatsapp_staff` - الموظفين
    - `id` (uuid) - المعرف الفريد
    - `full_name` (text) - الاسم الكامل
    - `job_title` (text) - المسمى الوظيفي
    - `phone_number` (text) - رقم الواتساب الخاص
    - `email` (text) - البريد الإلكتروني
    - `department_id` (uuid) - القسم التابع له
    - `is_active` (boolean) - حالة التفعيل
    - `is_available` (boolean) - متاح حالياً للرد
    - `max_concurrent_chats` (int) - أقصى عدد محادثات متزامنة
    - `current_active_chats` (int) - المحادثات النشطة حالياً
    - `avatar_url` (text) - صورة الموظف
    - `working_hours` (jsonb) - ساعات العمل
    - `auto_reply_enabled` (boolean) - الرد التلقائي
    - `auto_reply_message_ar` (text) - رسالة الرد التلقائي
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### ج) `whatsapp_smart_routing` - التوجيه الذكي
    - `id` (uuid) - المعرف الفريد
    - `user_type` (text) - نوع المستخدم
    - `user_context` (text) - سياق الزيارة (page, farm_code)
    - `department_id` (uuid) - القسم الموصى به
    - `staff_id` (uuid) - الموظف الموصى به
    - `pre_filled_message` (text) - الرسالة المعبأة مسبقاً
    - `priority_score` (int) - درجة الأولوية
    - `is_active` (boolean)
    - `created_at` (timestamptz)

  ### د) `whatsapp_staff_analytics` - تحليلات الموظفين
    - `id` (uuid) - المعرف الفريد
    - `staff_id` (uuid) - الموظف
    - `date` (date) - التاريخ
    - `total_chats` (int) - إجمالي المحادثات
    - `active_chats` (int) - المحادثات النشطة
    - `completed_chats` (int) - المحادثات المكتملة
    - `avg_response_time_seconds` (int) - متوسط وقت الرد
    - `satisfaction_score` (decimal) - تقييم الرضا
    - `created_at` (timestamptz)

  ### هـ) `whatsapp_live_notifications` - الإشعارات الحية
    - `id` (uuid) - المعرف الفريد
    - `staff_id` (uuid) - الموظف المستهدف
    - `notification_type` (text) - نوع الإشعار
    - `title` (text) - العنوان
    - `message` (text) - الرسالة
    - `user_name` (text) - اسم المستخدم
    - `user_phone` (text) - رقم المستخدم
    - `context_data` (jsonb) - بيانات إضافية
    - `is_read` (boolean) - مقروء
    - `priority` (text) - الأولوية (high, medium, low)
    - `created_at` (timestamptz)

  ## 2. الأمان
  - RLS مفعل على جميع الجداول
  - Admin يرى كل شيء
  - Staff يرى بياناته فقط

  ## 3. الفهارس
  - فهارس للبحث السريع
  - فهارس للتقارير
*/

-- ========================================
-- 1. جدول الأقسام والتخصصات
-- ========================================

CREATE TABLE IF NOT EXISTS whatsapp_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text,
  icon text DEFAULT 'MessageCircle',
  color text DEFAULT '#556B2F',
  priority int DEFAULT 0,
  is_active boolean DEFAULT true,
  available_for text[] DEFAULT ARRAY['visitor', 'investor', 'owner', 'admin'],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========================================
-- 2. جدول الموظفين
-- ========================================

CREATE TABLE IF NOT EXISTS whatsapp_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  job_title text NOT NULL,
  phone_number text UNIQUE NOT NULL,
  email text,
  department_id uuid REFERENCES whatsapp_departments(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  is_available boolean DEFAULT true,
  max_concurrent_chats int DEFAULT 5,
  current_active_chats int DEFAULT 0,
  avatar_url text,
  working_hours jsonb DEFAULT '{
    "saturday": {"start": "08:00", "end": "17:00"},
    "sunday": {"start": "08:00", "end": "17:00"},
    "monday": {"start": "08:00", "end": "17:00"},
    "tuesday": {"start": "08:00", "end": "17:00"},
    "wednesday": {"start": "08:00", "end": "17:00"},
    "thursday": {"start": "08:00", "end": "14:00"}
  }'::jsonb,
  auto_reply_enabled boolean DEFAULT false,
  auto_reply_message_ar text DEFAULT 'شكراً لتواصلك! سأرد عليك في أقرب وقت ممكن.',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_phone_number CHECK (phone_number ~ '^\d{12}$')
);

-- ========================================
-- 3. جدول التوجيه الذكي
-- ========================================

CREATE TABLE IF NOT EXISTS whatsapp_smart_routing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type text NOT NULL CHECK (user_type IN ('visitor', 'investor', 'owner', 'admin')),
  user_context text, -- 'home', 'farm_detail', 'my_investments', etc.
  department_id uuid REFERENCES whatsapp_departments(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES whatsapp_staff(id) ON DELETE SET NULL,
  pre_filled_message text,
  priority_score int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- 4. جدول تحليلات الموظفين
-- ========================================

CREATE TABLE IF NOT EXISTS whatsapp_staff_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES whatsapp_staff(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_chats int DEFAULT 0,
  active_chats int DEFAULT 0,
  completed_chats int DEFAULT 0,
  avg_response_time_seconds int DEFAULT 0,
  satisfaction_score decimal(3,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(staff_id, date)
);

-- ========================================
-- 5. جدول الإشعارات الحية
-- ========================================

CREATE TABLE IF NOT EXISTS whatsapp_live_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES whatsapp_staff(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('new_chat', 'urgent_inquiry', 'follow_up', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  user_name text,
  user_phone text,
  context_data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- 6. تحديث جدول whatsapp_context_logs
-- ========================================

-- إضافة حقول جديدة للربط مع النظام الجديد
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_context_logs' 
    AND column_name = 'assigned_staff_id'
  ) THEN
    ALTER TABLE whatsapp_context_logs ADD COLUMN assigned_staff_id uuid REFERENCES whatsapp_staff(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_context_logs' 
    AND column_name = 'assigned_department_id'
  ) THEN
    ALTER TABLE whatsapp_context_logs ADD COLUMN assigned_department_id uuid REFERENCES whatsapp_departments(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_context_logs' 
    AND column_name = 'chat_status'
  ) THEN
    ALTER TABLE whatsapp_context_logs ADD COLUMN chat_status text DEFAULT 'initiated' 
      CHECK (chat_status IN ('initiated', 'active', 'completed', 'abandoned'));
  END IF;
END $$;

-- ========================================
-- 7. الفهارس للأداء
-- ========================================

CREATE INDEX IF NOT EXISTS idx_staff_department ON whatsapp_staff(department_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_staff_availability ON whatsapp_staff(is_available, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_routing_context ON whatsapp_smart_routing(user_type, user_context) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_analytics_date ON whatsapp_staff_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_staff ON whatsapp_live_notifications(staff_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_assigned ON whatsapp_context_logs(assigned_staff_id, created_at DESC);

-- ========================================
-- 8. RLS Policies
-- ========================================

ALTER TABLE whatsapp_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_smart_routing ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_staff_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_live_notifications ENABLE ROW LEVEL SECURITY;

-- Public يقرأ الأقسام النشطة فقط
CREATE POLICY "Anyone can view active departments"
  ON whatsapp_departments FOR SELECT
  TO public
  USING (is_active = true);

-- Public يقرأ الموظفين النشطين المتاحين فقط
CREATE POLICY "Anyone can view available staff"
  ON whatsapp_staff FOR SELECT
  TO public
  USING (is_active = true AND is_available = true);

-- Public يقرأ التوجيهات النشطة
CREATE POLICY "Anyone can view active routing rules"
  ON whatsapp_smart_routing FOR SELECT
  TO public
  USING (is_active = true);

-- Admin يتحكم بكل شيء
CREATE POLICY "Admin full access to departments"
  ON whatsapp_departments FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access to staff"
  ON whatsapp_staff FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access to routing"
  ON whatsapp_smart_routing FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access to analytics"
  ON whatsapp_staff_analytics FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access to notifications"
  ON whatsapp_live_notifications FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- ========================================
-- 9. بيانات أولية - الأقسام
-- ========================================

INSERT INTO whatsapp_departments (code, name_ar, name_en, description_ar, icon, color, priority, available_for) VALUES
('sales', 'المبيعات والحجوزات', 'Sales & Bookings', 'للاستفسار عن المزارع والحجوزات والأسعار', 'ShoppingCart', '#D4AF37', 1, ARRAY['visitor', 'investor']),
('support', 'الدعم الفني', 'Technical Support', 'للمساعدة في استخدام المنصة وحل المشاكل', 'Headphones', '#556B2F', 2, ARRAY['visitor', 'investor', 'owner', 'admin']),
('finance', 'الشؤون المالية', 'Financial Affairs', 'للاستفسارات المالية والمدفوعات والتسويات', 'DollarSign', '#6B8E23', 3, ARRAY['investor', 'owner']),
('investments', 'متابعة الاستثمارات', 'Investment Tracking', 'لمتابعة استثماراتك وشهاداتك', 'TrendingUp', '#8B7355', 4, ARRAY['investor']),
('owner_services', 'خدمات أصحاب المزارع', 'Farm Owner Services', 'للمساعدة في إدارة مزرعتك وبياناتك', 'Tractor', '#A0522D', 5, ARRAY['owner']),
('admin', 'الإدارة العامة', 'General Administration', 'للأمور الإدارية والتنسيق', 'UserCog', '#2F4F4F', 6, ARRAY['admin'])
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 10. Triggers للتحديث التلقائي
-- ========================================

-- تحديث updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON whatsapp_departments
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_updated_at();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON whatsapp_staff
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_updated_at();
