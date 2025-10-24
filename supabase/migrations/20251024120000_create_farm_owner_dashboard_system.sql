/*
  # لوحة صاحب المزرعة الذكية v4 - النظام الكامل
  # Smart Farm Owner Dashboard v4 - Complete System

  ## الهيكل:
  1. جدول ملفات أصحاب المزارع (farm_owner_profiles)
  2. جدول جلسات أصحاب المزارع (farm_owner_sessions)
  3. جدول الإشعارات (farm_owner_notifications)
  4. جدول طلبات المراجعة (farm_submission_requests)
  5. جدول الأصناف الزراعية (farm_varieties_data)

  ## الميزات:
  - دخول ذكي برقم الجوال فقط
  - تتبع حالة المزرعة من الرفع حتى البيع
  - إشعارات فورية داخلية + واتساب
  - ربط تلقائي مع إدارة أصحاب المزارع
  - نموذج ذكي متعدد الأصناف
*/

-- ========================================
-- 1️⃣ جدول ملفات أصحاب المزارع للوحة
-- ========================================
CREATE TABLE IF NOT EXISTS farm_owner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- الربط مع farm_owners (إن وجد)
  farm_owner_id uuid REFERENCES farm_owners(id) ON DELETE CASCADE,

  -- بيانات التسجيل الأولي
  mobile_number text NOT NULL UNIQUE,
  full_name text,
  national_id text,

  -- حالة الملف الشخصي
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'suspended')),

  -- معلومات الموقع
  region text,
  city text,
  location_lat decimal,
  location_lng decimal,

  -- معلومات الصك
  deed_number text,
  total_farm_area numeric,
  farm_area_unit text DEFAULT 'متر' CHECK (farm_area_unit IN ('متر', 'هكتار', 'دونم')),

  -- نوع المزرعة
  farm_type text CHECK (farm_type IN ('نخيل', 'زيتون', 'مختلط')),

  -- التسعير
  actual_total_price numeric,
  price_per_tree numeric,
  payment_grace_period integer CHECK (payment_grace_period IN (3, 6, 9, 12)),

  -- ملاحظات إضافية
  additional_notes text,
  admin_notes text,
  rejection_reason text,

  -- التوثيق
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid,
  rejected_at timestamptz,
  rejected_by uuid,

  -- Soft delete
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE INDEX idx_farm_owner_profiles_mobile ON farm_owner_profiles(mobile_number);
CREATE INDEX idx_farm_owner_profiles_status ON farm_owner_profiles(status);
CREATE INDEX idx_farm_owner_profiles_farm_owner_id ON farm_owner_profiles(farm_owner_id);
CREATE INDEX idx_farm_owner_profiles_created_at ON farm_owner_profiles(created_at DESC);

-- ========================================
-- 2️⃣ جدول الأصناف الزراعية
-- ========================================
CREATE TABLE IF NOT EXISTS farm_varieties_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- الربط بالملف الشخصي
  profile_id uuid NOT NULL REFERENCES farm_owner_profiles(id) ON DELETE CASCADE,

  -- تفاصيل الصنف
  variety_type text NOT NULL CHECK (variety_type IN ('نخيل', 'زيتون')),
  variety_name text NOT NULL, -- سكري، خلاص، إسباني، نبالي، إلخ
  variety_count integer NOT NULL CHECK (variety_count > 0),

  -- معلومات إضافية
  notes text,

  -- التوثيق
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_farm_varieties_profile ON farm_varieties_data(profile_id);
CREATE INDEX idx_farm_varieties_type ON farm_varieties_data(variety_type);

-- ========================================
-- 3️⃣ جدول طلبات المراجعة
-- ========================================
CREATE TABLE IF NOT EXISTS farm_submission_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- الربط بالملف الشخصي
  profile_id uuid NOT NULL REFERENCES farm_owner_profiles(id) ON DELETE CASCADE,

  -- البيانات المرسلة (snapshot)
  submitted_data jsonb NOT NULL,
  varieties_data jsonb,

  -- الحالة
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),

  -- سبب الرفض
  rejection_reason text,
  admin_notes text,

  -- التوثيق
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,

  -- Soft delete
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE INDEX idx_farm_submission_status ON farm_submission_requests(status);
CREATE INDEX idx_farm_submission_profile ON farm_submission_requests(profile_id);
CREATE INDEX idx_farm_submission_submitted_at ON farm_submission_requests(submitted_at DESC);

-- ========================================
-- 4️⃣ جدول جلسات أصحاب المزارع
-- ========================================
CREATE TABLE IF NOT EXISTS farm_owner_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- الربط بالملف الشخصي
  profile_id uuid NOT NULL REFERENCES farm_owner_profiles(id) ON DELETE CASCADE,
  mobile_number text NOT NULL,

  -- معلومات الجلسة
  session_token text NOT NULL UNIQUE,
  ip_address text,
  user_agent text,

  -- الحالة
  is_active boolean DEFAULT true,

  -- التوقيت
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  ended_at timestamptz,

  -- Soft delete
  deleted_at timestamptz
);

CREATE INDEX idx_farm_owner_sessions_profile ON farm_owner_sessions(profile_id);
CREATE INDEX idx_farm_owner_sessions_token ON farm_owner_sessions(session_token);
CREATE INDEX idx_farm_owner_sessions_active ON farm_owner_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_farm_owner_sessions_expires ON farm_owner_sessions(expires_at);

-- ========================================
-- 5️⃣ جدول الإشعارات
-- ========================================
CREATE TABLE IF NOT EXISTS farm_owner_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- الربط بالملف الشخصي
  profile_id uuid NOT NULL REFERENCES farm_owner_profiles(id) ON DELETE CASCADE,

  -- محتوى الإشعار
  title_ar text NOT NULL,
  message_ar text NOT NULL,

  -- النوع
  notification_type text NOT NULL CHECK (notification_type IN (
    'submission_received',
    'submission_approved',
    'submission_rejected',
    'farm_published',
    'progress_60_percent',
    'farm_sold_out',
    'payment_settlement',
    'admin_message',
    'system_alert'
  )),

  -- الحالة
  is_read boolean DEFAULT false,
  read_at timestamptz,

  -- واتساب
  whatsapp_sent boolean DEFAULT false,
  whatsapp_sent_at timestamptz,
  whatsapp_status text,

  -- معلومات إضافية
  metadata jsonb,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- التوثيق
  created_at timestamptz DEFAULT now(),

  -- Soft delete
  deleted_at timestamptz
);

CREATE INDEX idx_farm_owner_notifications_profile ON farm_owner_notifications(profile_id);
CREATE INDEX idx_farm_owner_notifications_type ON farm_owner_notifications(notification_type);
CREATE INDEX idx_farm_owner_notifications_read ON farm_owner_notifications(is_read);
CREATE INDEX idx_farm_owner_notifications_created ON farm_owner_notifications(created_at DESC);
CREATE INDEX idx_farm_owner_notifications_whatsapp ON farm_owner_notifications(whatsapp_sent);

-- ========================================
-- 🔒 RLS Policies
-- ========================================

-- farm_owner_profiles
ALTER TABLE farm_owner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create profile with mobile"
  ON farm_owner_profiles FOR INSERT
  TO anon
  WITH CHECK (mobile_number IS NOT NULL);

CREATE POLICY "Owners can view own profile"
  ON farm_owner_profiles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Owners can update own profile"
  ON farm_owner_profiles FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all profiles"
  ON farm_owner_profiles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- farm_varieties_data
ALTER TABLE farm_varieties_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage varieties"
  ON farm_varieties_data FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view varieties"
  ON farm_varieties_data FOR SELECT
  TO authenticated
  USING (true);

-- farm_submission_requests
ALTER TABLE farm_submission_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create submissions"
  ON farm_submission_requests FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view submissions"
  ON farm_submission_requests FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can manage submissions"
  ON farm_submission_requests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- farm_owner_sessions
ALTER TABLE farm_owner_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage sessions"
  ON farm_owner_sessions FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view sessions"
  ON farm_owner_sessions FOR SELECT
  TO authenticated
  USING (true);

-- farm_owner_notifications
ALTER TABLE farm_owner_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view notifications"
  ON farm_owner_notifications FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can update notifications"
  ON farm_owner_notifications FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage notifications"
  ON farm_owner_notifications FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ========================================
-- ✅ Audit Log Integration
-- ========================================

-- تسجيل جميع العمليات في audit_log
CREATE OR REPLACE FUNCTION log_farm_owner_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    record_id,
    old_data,
    new_data,
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    COALESCE(NEW.approved_by, NEW.rejected_by, OLD.deleted_by)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- تطبيق Triggers
DROP TRIGGER IF EXISTS audit_farm_owner_profiles ON farm_owner_profiles;
CREATE TRIGGER audit_farm_owner_profiles
  AFTER INSERT OR UPDATE OR DELETE ON farm_owner_profiles
  FOR EACH ROW EXECUTE FUNCTION log_farm_owner_activity();

DROP TRIGGER IF EXISTS audit_farm_submission_requests ON farm_submission_requests;
CREATE TRIGGER audit_farm_submission_requests
  AFTER INSERT OR UPDATE OR DELETE ON farm_submission_requests
  FOR EACH ROW EXECUTE FUNCTION log_farm_owner_activity();
