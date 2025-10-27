/*
  # Smart Button Permissions System

  إضافة صلاحيات الزر الذكي إلى نظام الرقابة
*/

-- إضافة module الزر الذكي
INSERT INTO admin_module_permissions (
  admin_phone,
  module_id,
  module_name_ar,
  module_name_en,
  can_view,
  can_create,
  can_edit,
  can_delete,
  icon,
  is_active
)
SELECT 
  phone,
  'whatsapp.button',
  'الزر الذكي',
  'Smart Button',
  true,
  false,
  false,
  false,
  'MessageCircle',
  true
FROM admin_users
WHERE is_active = true AND phone IS NOT NULL
ON CONFLICT (admin_phone, module_id) DO NOTHING;

-- جدول الصلاحيات الفرعية
CREATE TABLE IF NOT EXISTS smart_button_sub_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_phone text NOT NULL,
  permission_type text NOT NULL CHECK (permission_type IN ('view', 'edit', 'responses', 'ai', 'test')),
  is_granted boolean DEFAULT true,
  granted_by text,
  granted_at timestamptz DEFAULT now(),
  UNIQUE(admin_phone, permission_type)
);

ALTER TABLE smart_button_sub_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view smart button permissions"
  ON smart_button_sub_permissions FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can manage smart button permissions"
  ON smart_button_sub_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- منح الصلاحيات للجميع
INSERT INTO smart_button_sub_permissions (admin_phone, permission_type, is_granted, granted_by)
SELECT au.phone, perm.permission_type, true, 'system'
FROM admin_users au
CROSS JOIN (SELECT unnest(ARRAY['view', 'edit', 'responses', 'ai', 'test']) as permission_type) perm
WHERE au.is_active = true AND au.phone IS NOT NULL
ON CONFLICT (admin_phone, permission_type) DO NOTHING;

-- وظيفة التحقق
CREATE OR REPLACE FUNCTION check_smart_button_permission(p_admin_phone text, p_permission_type text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN COALESCE((
    SELECT is_granted FROM smart_button_sub_permissions
    WHERE admin_phone = p_admin_phone AND permission_type = p_permission_type
  ), false);
END;
$$;

-- View
CREATE OR REPLACE VIEW smart_button_permissions_summary AS
SELECT 
  au.phone,
  au.full_name,
  bool_or(CASE WHEN sbp.permission_type = 'view' AND sbp.is_granted THEN true ELSE false END) as can_view,
  bool_or(CASE WHEN sbp.permission_type = 'edit' AND sbp.is_granted THEN true ELSE false END) as can_edit,
  bool_or(CASE WHEN sbp.permission_type = 'responses' AND sbp.is_granted THEN true ELSE false END) as can_manage_responses,
  bool_or(CASE WHEN sbp.permission_type = 'ai' AND sbp.is_granted THEN true ELSE false END) as can_manage_ai,
  bool_or(CASE WHEN sbp.permission_type = 'test' AND sbp.is_granted THEN true ELSE false END) as can_test
FROM admin_users au
LEFT JOIN smart_button_sub_permissions sbp ON sbp.admin_phone = au.phone
WHERE au.is_active = true
GROUP BY au.phone, au.full_name;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sb_perms_phone ON smart_button_sub_permissions(admin_phone);
CREATE INDEX IF NOT EXISTS idx_sb_perms_type ON smart_button_sub_permissions(permission_type);
