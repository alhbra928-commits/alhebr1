/*
  # تحديث هيكل صلاحيات الزر الذكي

  تحديث الجدول ليحتوي على الصلاحيات الخمس كأعمدة منفصلة
*/

-- حذف الجدول القديم
DROP TABLE IF EXISTS smart_button_sub_permissions CASCADE;

-- إنشاء جدول جديد بهيكل محسّن
CREATE TABLE smart_button_sub_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  can_view boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_manage_responses boolean DEFAULT false,
  can_manage_ai boolean DEFAULT false,
  can_test boolean DEFAULT false,
  updated_by text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE smart_button_sub_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view smart button permissions"
  ON smart_button_sub_permissions FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can manage smart button permissions"
  ON smart_button_sub_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- منح الصلاحيات الأساسية للمديرين
INSERT INTO smart_button_sub_permissions (phone_number, can_view, can_edit, can_manage_responses, can_manage_ai, can_test)
SELECT phone_number, true, false, false, false, false
FROM admin_users
WHERE is_active = true AND phone_number IS NOT NULL
ON CONFLICT (phone_number) DO NOTHING;

-- منح جميع الصلاحيات للمدير العام
INSERT INTO smart_button_sub_permissions (phone_number, can_view, can_edit, can_manage_responses, can_manage_ai, can_test)
VALUES ('0500000001', true, true, true, true, true)
ON CONFLICT (phone_number) DO UPDATE SET
  can_view = true,
  can_edit = true,
  can_manage_responses = true,
  can_manage_ai = true,
  can_test = true;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sb_perms_phone_v2 ON smart_button_sub_permissions(phone_number);

-- View مبسط
CREATE OR REPLACE VIEW smart_button_permissions_summary AS
SELECT
  au.phone_number,
  au.full_name,
  COALESCE(sbp.can_view, false) as can_view,
  COALESCE(sbp.can_edit, false) as can_edit,
  COALESCE(sbp.can_manage_responses, false) as can_manage_responses,
  COALESCE(sbp.can_manage_ai, false) as can_manage_ai,
  COALESCE(sbp.can_test, false) as can_test
FROM admin_users au
LEFT JOIN smart_button_sub_permissions sbp ON sbp.phone_number = au.phone_number
WHERE au.is_active = true;
