/*
  منح صاحب المنصة صلاحيات كاملة

  رقم الجوال: 0569335257
  الاسم: ابراهيم بن علي الحبر التميمي

  هذا السكريبت يضيف جميع الأقسام الـ 13 بصلاحيات كاملة
*/

-- 1. لوحة التحكم (dashboard)
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
) VALUES (
  '0569335257',
  'dashboard',
  'لوحة التحكم',
  'Dashboard',
  true, true, true, true,
  'LayoutDashboard',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- 2. أصحاب المزارع (owners)
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
) VALUES (
  '0569335257',
  'owners',
  'أصحاب المزارع',
  'Farm Owners',
  true, true, true, true,
  'Building',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- 3. المزارع (farms) - موجود مسبقاً
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
) VALUES (
  '0569335257',
  'farms',
  'المزارع',
  'Farms',
  true, true, true, true,
  'MapPin',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- 4. الحجوزات (reservations) - موجود مسبقاً
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
) VALUES (
  '0569335257',
  'reservations',
  'الحجوزات',
  'Reservations',
  true, true, true, true,
  'Calendar',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- 5. المستثمرون (investors) - موجود مسبقاً
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
) VALUES (
  '0569335257',
  'investors',
  'المستثمرون',
  'Investors',
  true, true, true, true,
  'Users',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- 6. النظام المالي الذكي (finance) - موجود مسبقاً
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
) VALUES (
  '0569335257',
  'finance',
  'النظام المالي الذكي',
  'Finance',
  true, true, true, true,
  'Wallet',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- 7. الخدمات الزراعية (agriculture)
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
) VALUES (
  '0569335257',
  'agriculture',
  'الخدمات الزراعية',
  'Agriculture',
  true, true, true, true,
  'Sprout',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- 8. التوثيق (documentation) - موجود مسبقاً
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
) VALUES (
  '0569335257',
  'documentation',
  'التوثيق',
  'Documentation',
  true, true, true, true,
  'Award',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- 9. التسويق (marketing)
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
) VALUES (
  '0569335257',
  'marketing',
  'التسويق',
  'Marketing',
  true, true, true, true,
  'TrendingUp',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- 10. واتساب (whatsapp)
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
) VALUES (
  '0569335257',
  'whatsapp',
  'واتساب',
  'WhatsApp',
  true, true, true, true,
  'MessageSquare',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- 11. المحافظ (wallets)
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
) VALUES (
  '0569335257',
  'wallets',
  'المحافظ',
  'Wallets',
  true, true, true, true,
  'Wallet',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- 12. إدارة الصلاحيات (permissions)
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
) VALUES (
  '0569335257',
  'permissions',
  'إدارة الصلاحيات',
  'Permissions',
  true, true, true, true,
  'Shield',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- 13. الإعدادات (settings)
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
) VALUES (
  '0569335257',
  'settings',
  'الإعدادات',
  'Settings',
  true, true, true, true,
  'Settings',
  true
) ON CONFLICT (admin_phone, module_id)
DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  is_active = true,
  updated_at = NOW();

-- التحقق من النتيجة
SELECT
  module_id,
  module_name_ar,
  can_view,
  can_create,
  can_edit,
  can_delete,
  is_active
FROM admin_module_permissions
WHERE admin_phone = '0569335257'
ORDER BY
  CASE module_id
    WHEN 'dashboard' THEN 1
    WHEN 'owners' THEN 2
    WHEN 'farms' THEN 3
    WHEN 'reservations' THEN 4
    WHEN 'investors' THEN 5
    WHEN 'finance' THEN 6
    WHEN 'agriculture' THEN 7
    WHEN 'documentation' THEN 8
    WHEN 'marketing' THEN 9
    WHEN 'whatsapp' THEN 10
    WHEN 'wallets' THEN 11
    WHEN 'permissions' THEN 12
    WHEN 'settings' THEN 13
    ELSE 99
  END;

-- عرض عدد الصلاحيات
SELECT COUNT(*) as total_permissions
FROM admin_module_permissions
WHERE admin_phone = '0569335257';
