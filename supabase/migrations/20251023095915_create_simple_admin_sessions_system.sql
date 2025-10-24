/*
  # نظام الجلسات الإدارية البسيط
  
  ## الجداول الجديدة
  
  ### 1. admin_active_sessions - الجلسات النشطة
  ### 2. admin_module_permissions - صلاحيات الوحدات
  ### 3. admin_access_log - سجل الدخول
  
  ## الأمان
  - RLS مفعل مع سياسات عامة للتطوير
*/

-- جدول الجلسات النشطة
CREATE TABLE IF NOT EXISTS admin_active_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_phone text NOT NULL,
  admin_name text NOT NULL,
  admin_role text NOT NULL,
  session_token text UNIQUE NOT NULL,
  device_info text,
  ip_address text,
  current_module text,
  session_status text NOT NULL DEFAULT 'active',
  last_activity_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- جدول صلاحيات الوحدات
CREATE TABLE IF NOT EXISTS admin_module_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_phone text NOT NULL,
  module_id text NOT NULL,
  module_name_ar text NOT NULL,
  module_name_en text NOT NULL,
  can_view boolean DEFAULT true,
  can_create boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  icon text,
  is_active boolean DEFAULT true,
  granted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(admin_phone, module_id)
);

-- جدول سجل الوصول
CREATE TABLE IF NOT EXISTS admin_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_phone text NOT NULL,
  admin_name text,
  action_type text NOT NULL,
  action_details text,
  device_info text,
  ip_address text,
  action_status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_admin_active_sessions_phone ON admin_active_sessions(admin_phone);
CREATE INDEX IF NOT EXISTS idx_admin_active_sessions_token ON admin_active_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_active_sessions_status ON admin_active_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_admin_module_permissions_phone ON admin_module_permissions(admin_phone);
CREATE INDEX IF NOT EXISTS idx_admin_module_permissions_module ON admin_module_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_admin_access_log_phone ON admin_access_log(admin_phone);
CREATE INDEX IF NOT EXISTS idx_admin_access_log_created ON admin_access_log(created_at DESC);

-- تفعيل RLS
ALTER TABLE admin_active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_access_log ENABLE ROW LEVEL SECURITY;

-- سياسات RLS عامة
CREATE POLICY "public_access_admin_active_sessions" ON admin_active_sessions FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_access_admin_module_permissions" ON admin_module_permissions FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_access_admin_access_log" ON admin_access_log FOR ALL TO public USING (true) WITH CHECK (true);

-- trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_admin_module_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_module_permissions_updated_at ON admin_module_permissions;
CREATE TRIGGER admin_module_permissions_updated_at
  BEFORE UPDATE ON admin_module_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_module_permissions_updated_at();

-- إدراج صلاحيات المدير العام (رقم: 0500000000)
INSERT INTO admin_module_permissions (admin_phone, module_id, module_name_ar, module_name_en, can_view, can_create, can_edit, can_delete, icon, is_active)
VALUES
  ('0500000000', 'dashboard', 'لوحة التحكم', 'Dashboard', true, true, true, true, 'LayoutDashboard', true),
  ('0500000000', 'farms', 'المزارع', 'Farms', true, true, true, true, 'Trees', true),
  ('0500000000', 'investors', 'المستثمرون', 'Investors', true, true, true, true, 'Users', true),
  ('0500000000', 'reservations', 'الحجوزات', 'Reservations', true, true, true, true, 'Calendar', true),
  ('0500000000', 'documentation', 'التوثيق', 'Documentation', true, true, true, true, 'FileText', true),
  ('0500000000', 'finance', 'المالية', 'Finance', true, true, true, true, 'DollarSign', true),
  ('0500000000', 'wallets', 'المحافظ', 'Wallets', true, true, true, true, 'Wallet', true),
  ('0500000000', 'owners', 'المالكون', 'Owners', true, true, true, true, 'UserCheck', true),
  ('0500000000', 'permissions', 'الصلاحيات', 'Permissions', true, true, true, true, 'Shield', true),
  ('0500000000', 'sessions', 'الجلسات الحية', 'Live Sessions', true, true, true, true, 'Activity', true),
  ('0500000000', 'settings', 'الإعدادات', 'Settings', true, true, true, true, 'Settings', true),
  ('0500000000', 'backups', 'النسخ الاحتياطية', 'Backups', true, true, true, true, 'Database', true)
ON CONFLICT (admin_phone, module_id) DO UPDATE 
SET can_view = true, can_create = true, can_edit = true, can_delete = true, is_active = true, updated_at = now();

-- إدراج صلاحيات موظف تجريبي (رقم: 0501234567)
INSERT INTO admin_module_permissions (admin_phone, module_id, module_name_ar, module_name_en, can_view, can_create, can_edit, can_delete, icon, is_active)
VALUES
  ('0501234567', 'dashboard', 'لوحة التحكم', 'Dashboard', true, false, false, false, 'LayoutDashboard', true),
  ('0501234567', 'finance', 'المالية', 'Finance', true, true, true, false, 'DollarSign', true),
  ('0501234567', 'reservations', 'الحجوزات', 'Reservations', true, false, true, false, 'Calendar', true)
ON CONFLICT (admin_phone, module_id) DO UPDATE 
SET can_view = EXCLUDED.can_view, can_create = EXCLUDED.can_create, can_edit = EXCLUDED.can_edit, 
    can_delete = EXCLUDED.can_delete, is_active = true, updated_at = now();
