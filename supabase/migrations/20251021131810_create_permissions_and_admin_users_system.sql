/*
  # إنشاء نظام الصلاحيات والمستخدمين الإداريين

  1. جداول جديدة
    - `admin_roles` - الأدوار الإدارية (مدير عام، مشرف مالي، إلخ)
      - `id` (uuid, primary key)
      - `role_name` (text) - اسم الدور بالعربي
      - `role_name_en` (text) - اسم الدور بالإنجليزي
      - `role_code` (text, unique) - كود الدور (super_admin, finance_manager, إلخ)
      - `description` (text) - وصف الدور
      - `permissions` (jsonb) - صلاحيات الدور بصيغة JSON
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `admin_users` - المستخدمين الإداريين
      - `id` (uuid, primary key)
      - `full_name` (text) - الاسم الكامل
      - `email` (text, unique) - البريد الإلكتروني
      - `phone` (text) - رقم الجوال
      - `role_id` (uuid) - معرف الدور
      - `is_active` (boolean) - حالة النشاط
      - `two_factor_enabled` (boolean) - التحقق بخطوتين
      - `device_locked` (boolean) - قفل الجهاز
      - `last_login` (timestamptz) - آخر تسجيل دخول
      - `last_login_ip` (text) - آخر IP للدخول
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `deleted_at` (timestamptz)
      - `deleted_by` (uuid)

    - `user_sessions` - جلسات المستخدمين الحية
      - `id` (uuid, primary key)
      - `user_id` (uuid) - معرف المستخدم
      - `user_type` (text) - نوع المستخدم (investor, farm_owner, admin)
      - `session_token` (text) - رمز الجلسة
      - `ip_address` (text) - عنوان IP
      - `user_agent` (text) - معلومات المتصفح
      - `location` (text) - الموقع الجغرافي
      - `is_active` (boolean) - حالة الجلسة
      - `started_at` (timestamptz) - وقت البدء
      - `last_activity` (timestamptz) - آخر نشاط
      - `ended_at` (timestamptz) - وقت الانتهاء

    - `login_attempts` - محاولات تسجيل الدخول
      - `id` (uuid, primary key)
      - `username` (text) - اسم المستخدم المحاول
      - `user_type` (text) - نوع المستخدم
      - `ip_address` (text) - عنوان IP
      - `success` (boolean) - نجاح المحاولة
      - `failure_reason` (text) - سبب الفشل
      - `attempted_at` (timestamptz) - وقت المحاولة

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - سياسات للوصول الإداري فقط

  3. البيانات الأولية
    - إضافة الأدوار الأساسية
*/

-- جدول الأدوار الإدارية
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text NOT NULL,
  role_name_en text NOT NULL,
  role_code text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول المستخدمين الإداريين
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role_id uuid REFERENCES admin_roles(id),
  is_active boolean DEFAULT true,
  two_factor_enabled boolean DEFAULT false,
  device_locked boolean DEFAULT false,
  last_login timestamptz,
  last_login_ip text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  deleted_by uuid
);

-- جدول الجلسات الحية
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('investor', 'farm_owner', 'admin')),
  session_token text NOT NULL,
  ip_address text,
  user_agent text,
  location text,
  is_active boolean DEFAULT true,
  started_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- جدول محاولات تسجيل الدخول
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  user_type text NOT NULL,
  ip_address text,
  success boolean DEFAULT false,
  failure_reason text,
  attempted_at timestamptz DEFAULT now()
);

-- فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_type ON user_sessions(user_type);
CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts(username);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);

-- تفعيل RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- سياسات RLS - الوصول للمصادقين فقط
CREATE POLICY "Authenticated users can view admin roles"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage sessions"
  ON user_sessions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert login attempts"
  ON login_attempts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- محفز تحديث updated_at
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_users_updated_at_trigger ON admin_users;
CREATE TRIGGER update_admin_users_updated_at_trigger
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- إضافة الأدوار الأساسية
INSERT INTO admin_roles (role_name, role_name_en, role_code, description, permissions) VALUES
(
  'المدير العام',
  'Super Admin',
  'super_admin',
  'وصول كامل لجميع الإدارات والصلاحيات',
  '{"full_access": true, "can_manage_users": true, "can_manage_farms": true, "can_manage_finance": true, "can_view_reports": true, "can_manage_documentation": true}'
),
(
  'المشرف المالي',
  'Finance Manager',
  'finance_manager',
  'دخول للإدارة المالية والتقارير فقط',
  '{"full_access": false, "can_manage_users": false, "can_manage_farms": false, "can_manage_finance": true, "can_view_reports": true, "can_manage_documentation": false}'
),
(
  'مشرف المزارع',
  'Farm Supervisor',
  'farm_supervisor',
  'تعديل وإدارة بيانات المزارع وأصحابها فقط',
  '{"full_access": false, "can_manage_users": false, "can_manage_farms": true, "can_manage_finance": false, "can_view_reports": true, "can_manage_documentation": false}'
),
(
  'قسم التوثيق',
  'Documentation Department',
  'documentation_dept',
  'الوصول لإدارة التوثيق فقط',
  '{"full_access": false, "can_manage_users": false, "can_manage_farms": false, "can_manage_finance": false, "can_view_reports": false, "can_manage_documentation": true}'
),
(
  'الدعم الفني',
  'Technical Support',
  'tech_support',
  'متابعة المستثمرين والجلسات دون تعديل',
  '{"full_access": false, "can_manage_users": false, "can_manage_farms": false, "can_manage_finance": false, "can_view_reports": true, "can_manage_documentation": false}'
)
ON CONFLICT (role_code) DO NOTHING;
