/*
  # إضافة قسم إدارة الواتساب إلى مصفوفة الصلاحيات
  
  1. Changes
    - إضافة قسم "إدارة الواتساب" كوحدة كاملة في نظام الصلاحيات
    - يمكن منح صلاحيات محددة (عرض، إنشاء، تعديل، حذف)
    - أو منح صلاحيات كاملة لجميع مزايا الواتساب
    
  2. Module Structure
    - module_id: 'whatsapp'
    - module_name_ar: 'إدارة الواتساب'
    - module_name_en: 'WhatsApp Management'
    - يشمل: الربط الخارجي، القوالب، الأحداث، الصندوق، الزر الذكي، التقارير
    
  3. Notes
    - هذا القسم يربط مع الصلاحيات الداخلية للزر الذكي
    - الصلاحيات الكاملة تمنح الوصول لجميع التبويبات
    - الصلاحيات المحددة تتحكم في مستوى الوصول
*/

-- إضافة وظيفة مساعدة لإنشاء صلاحيات الواتساب للمستخدمين الحاليين
CREATE OR REPLACE FUNCTION add_whatsapp_permission_to_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- إضافة صلاحية إدارة الواتساب للمدير العام وصاحب المنصة فقط
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
    'whatsapp',
    'إدارة الواتساب',
    'WhatsApp Management',
    true,
    true,
    true,
    true,
    'MessageCircle',
    true
  FROM admin_users
  WHERE phone IN ('0569335257', '0500000001')
    AND is_active = true
    AND deleted_at IS NULL
  ON CONFLICT (admin_phone, module_id) 
  DO UPDATE SET
    can_view = true,
    can_create = true,
    can_edit = true,
    can_delete = true,
    is_active = true,
    updated_at = now();
    
END;
$$;

-- تنفيذ الوظيفة لإضافة الصلاحيات
SELECT add_whatsapp_permission_to_users();

-- إنشاء فهرس لتسريع البحث
CREATE INDEX IF NOT EXISTS idx_admin_module_permissions_whatsapp 
ON admin_module_permissions(admin_phone) 
WHERE module_id = 'whatsapp';

-- تسجيل في سجل النظام
DO $$
BEGIN
  INSERT INTO system_logs (
    table_name,
    operation,
    new_data,
    performed_by
  )
  VALUES (
    'admin_module_permissions',
    'whatsapp_module_added',
    jsonb_build_object(
      'module_id', 'whatsapp',
      'module_name', 'إدارة الواتساب',
      'description', 'تم إضافة قسم إدارة الواتساب إلى مصفوفة الصلاحيات'
    ),
    'system'
  );
EXCEPTION WHEN OTHERS THEN
  -- تجاهل إذا فشل التسجيل
  NULL;
END;
$$;
