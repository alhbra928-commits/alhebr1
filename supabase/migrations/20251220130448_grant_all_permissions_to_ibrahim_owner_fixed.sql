/*
  # منح جميع الصلاحيات المطلقة للمدير العام - إبراهيم علي الحبر
  
  1. الصلاحيات الممنوحة
    - جميع الأقسام في admin_module_permissions
    - جميع الصلاحيات الفرعية في smart_button_sub_permissions
    - كل صلاحية بحالة: can_view, can_create, can_edit, can_delete = true
    
  2. الأقسام المشمولة
    - لوحة التحكم، المزارع، المستثمرون، الحجوزات
    - التوثيق، المالية، المحافظ، المالكون
    - الصلاحيات، الجلسات، الإعدادات، النسخ الاحتياطية
    - الواتساب، الزر الذكي، التسويق، العمليات
*/

-- منح صلاحيات جميع الأقسام الرئيسية
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
VALUES
  ('0544433244', 'dashboard', 'لوحة التحكم', 'Dashboard', true, true, true, true, 'LayoutDashboard', true),
  ('0544433244', 'farms', 'المزارع', 'Farms', true, true, true, true, 'Trees', true),
  ('0544433244', 'investors', 'المستثمرون', 'Investors', true, true, true, true, 'Users', true),
  ('0544433244', 'reservations', 'الحجوزات', 'Reservations', true, true, true, true, 'Calendar', true),
  ('0544433244', 'documentation', 'التوثيق', 'Documentation', true, true, true, true, 'FileText', true),
  ('0544433244', 'finance', 'المالية', 'Finance', true, true, true, true, 'DollarSign', true),
  ('0544433244', 'wallets', 'المحافظ', 'Wallets', true, true, true, true, 'Wallet', true),
  ('0544433244', 'owners', 'المالكون', 'Owners', true, true, true, true, 'UserCheck', true),
  ('0544433244', 'permissions', 'الصلاحيات', 'Permissions', true, true, true, true, 'Shield', true),
  ('0544433244', 'sessions', 'الجلسات الحية', 'Live Sessions', true, true, true, true, 'Activity', true),
  ('0544433244', 'settings', 'الإعدادات', 'Settings', true, true, true, true, 'Settings', true),
  ('0544433244', 'backups', 'النسخ الاحتياطية', 'Backups', true, true, true, true, 'Database', true),
  ('0544433244', 'whatsapp', 'إدارة الواتساب', 'WhatsApp Management', true, true, true, true, 'MessageCircle', true),
  ('0544433244', 'whatsapp.button', 'الزر الذكي', 'Smart Button', true, true, true, true, 'MessageSquare', true),
  ('0544433244', 'marketing', 'التسويق', 'Marketing', true, true, true, true, 'TrendingUp', true),
  ('0544433244', 'operations', 'العمليات', 'Operations', true, true, true, true, 'Briefcase', true)
ON CONFLICT (admin_phone, module_id) 
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = now();

-- منح صلاحيات الزر الذكي (النظام الجديد - أعمدة منفصلة)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_button_sub_permissions' 
    AND column_name = 'phone_number'
  ) THEN
    INSERT INTO smart_button_sub_permissions (
      phone_number,
      can_view,
      can_edit,
      can_manage_responses,
      can_manage_ai,
      can_test
    )
    VALUES (
      '0544433244',
      true,
      true,
      true,
      true,
      true
    )
    ON CONFLICT (phone_number)
    DO UPDATE SET
      can_view = true,
      can_edit = true,
      can_manage_responses = true,
      can_manage_ai = true,
      can_test = true,
      updated_at = now();
  END IF;
END $$;

-- منح صلاحيات الزر الذكي (النظام القديم - سجلات منفصلة)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_button_sub_permissions' 
    AND column_name = 'admin_phone'
  ) THEN
    INSERT INTO smart_button_sub_permissions (
      admin_phone,
      permission_type,
      is_granted
    )
    VALUES
      ('0544433244', 'view', true),
      ('0544433244', 'edit', true),
      ('0544433244', 'responses', true),
      ('0544433244', 'ai', true),
      ('0544433244', 'test', true)
    ON CONFLICT (admin_phone, permission_type)
    DO UPDATE SET
      is_granted = true,
      granted_at = now();
  END IF;
END $$;

-- تسجيل العملية في سجل التدقيق
DO $$
DECLARE
  v_admin_user_id uuid;
BEGIN
  SELECT id INTO v_admin_user_id 
  FROM admin_users 
  WHERE phone = '0544433244' 
  LIMIT 1;
  
  IF v_admin_user_id IS NOT NULL THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      old_data,
      new_data,
      user_id,
      user_email,
      ip_address,
      user_agent,
      metadata
    ) VALUES (
      'admin_module_permissions',
      v_admin_user_id,
      'UPDATE',
      null,
      jsonb_build_object(
        'admin_phone', '0544433244',
        'admin_name', 'إبراهيم علي الحبر'
      ),
      v_admin_user_id,
      'owner@hisas1.com',
      'SYSTEM',
      'Migration Script',
      jsonb_build_object(
        'action', 'GRANT_ALL_PERMISSIONS',
        'note', 'منح جميع الصلاحيات المطلقة للمدير العام'
      )
    );
  END IF;
END $$;
