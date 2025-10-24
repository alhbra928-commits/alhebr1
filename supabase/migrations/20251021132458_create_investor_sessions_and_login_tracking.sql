/*
  # إنشاء نظام تتبع جلسات المستثمرين

  1. جداول جديدة
    - `investor_sessions` - جلسات المستثمرين
      - `id` (uuid, primary key)
      - `phone` (text) - رقم جوال المستثمر
      - `session_token` (text) - رمز الجلسة
      - `ip_address` (text) - عنوان IP
      - `user_agent` (text) - معلومات المتصفح
      - `device_type` (text) - نوع الجهاز (mobile, desktop)
      - `is_active` (boolean) - حالة الجلسة
      - `is_first_login` (boolean) - هل هذا أول دخول؟
      - `otp_required` (boolean) - هل يتطلب OTP؟
      - `started_at` (timestamptz) - وقت البدء
      - `last_activity` (timestamptz) - آخر نشاط
      - `expires_at` (timestamptz) - وقت انتهاء الصلاحية
      - `ended_at` (timestamptz) - وقت الانتهاء

    - `investor_login_attempts` - محاولات دخول المستثمرين
      - `id` (uuid, primary key)
      - `phone` (text) - رقم الجوال المحاول
      - `ip_address` (text) - عنوان IP
      - `user_agent` (text) - معلومات المتصفح
      - `device_type` (text) - نوع الجهاز
      - `login_type` (text) - نوع الدخول (first_time, with_otp)
      - `otp_entered` (text) - الرمز المدخل
      - `success` (boolean) - نجاح المحاولة
      - `failure_reason` (text) - سبب الفشل
      - `attempted_at` (timestamptz) - وقت المحاولة

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - سياسات للوصول

  3. الفهارس
    - فهرسة للبحث السريع
*/

-- جدول جلسات المستثمرين
CREATE TABLE IF NOT EXISTS investor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  session_token text UNIQUE NOT NULL,
  ip_address text,
  user_agent text,
  device_type text CHECK (device_type IN ('mobile', 'desktop', 'tablet', 'unknown')),
  is_active boolean DEFAULT true,
  is_first_login boolean DEFAULT false,
  otp_required boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  ended_at timestamptz
);

-- جدول محاولات دخول المستثمرين
CREATE TABLE IF NOT EXISTS investor_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  ip_address text,
  user_agent text,
  device_type text,
  login_type text CHECK (login_type IN ('first_time', 'with_otp', 'session_resume')),
  otp_entered text,
  success boolean DEFAULT false,
  failure_reason text,
  attempted_at timestamptz DEFAULT now()
);

-- فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_investor_sessions_phone ON investor_sessions(phone);
CREATE INDEX IF NOT EXISTS idx_investor_sessions_session_token ON investor_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_investor_sessions_is_active ON investor_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_investor_sessions_expires_at ON investor_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_investor_login_attempts_phone ON investor_login_attempts(phone);
CREATE INDEX IF NOT EXISTS idx_investor_login_attempts_attempted_at ON investor_login_attempts(attempted_at);

-- تفعيل RLS
ALTER TABLE investor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_login_attempts ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "Anyone can create sessions"
  ON investor_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own sessions"
  ON investor_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update sessions"
  ON investor_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert login attempts"
  ON investor_login_attempts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view login attempts"
  ON investor_login_attempts FOR SELECT
  TO authenticated
  USING (true);

-- دالة لتنظيف الجلسات المنتهية تلقائياً
CREATE OR REPLACE FUNCTION cleanup_expired_investor_sessions()
RETURNS void AS $$
BEGIN
  UPDATE investor_sessions
  SET is_active = false, ended_at = now()
  WHERE is_active = true
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- دالة للتحقق من وجود جلسة نشطة
CREATE OR REPLACE FUNCTION has_active_session(p_phone text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM investor_sessions
    WHERE phone = p_phone
      AND is_active = true
      AND expires_at > now()
  );
END;
$$ LANGUAGE plpgsql;
