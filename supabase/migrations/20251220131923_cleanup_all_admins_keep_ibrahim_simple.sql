/*
  # تنظيف شامل - الإبقاء على المدير العام إبراهيم فقط
  
  1. ما سيتم حذفه
    - جميع المستخدمين الإداريين ما عدا إبراهيم علي الحبر (0544433244)
    - جميع صلاحياتهم من admin_module_permissions
    - جميع صلاحياتهم من smart_button_sub_permissions
    - جميع جلساتهم النشطة من admin_active_sessions
    
  2. من سيبقى
    - إبراهيم علي الحبر (0544433244) - المدير العام والمالك الرئيسي
    - جميع صلاحياته المطلقة (16 قسم + 5 صلاحيات زر ذكي)
*/

-- حذف جميع الجلسات النشطة للمستخدمين الآخرين
DELETE FROM admin_active_sessions
WHERE admin_phone != '0544433244';

-- حذف جميع صلاحيات الزر الذكي للمستخدمين الآخرين
DELETE FROM smart_button_sub_permissions
WHERE admin_phone != '0544433244';

-- حذف جميع صلاحيات الأقسام للمستخدمين الآخرين
DELETE FROM admin_module_permissions
WHERE admin_phone != '0544433244';

-- حذف جميع سجلات الدخول للمستخدمين الآخرين
DELETE FROM admin_access_log
WHERE admin_phone != '0544433244';

-- حذف جميع المستخدمين الإداريين ما عدا إبراهيم (Soft Delete)
DO $$
DECLARE
  v_ibrahim_id uuid;
BEGIN
  SELECT id INTO v_ibrahim_id
  FROM admin_users
  WHERE phone = '0544433244'
  LIMIT 1;
  
  UPDATE admin_users
  SET 
    deleted_at = now(),
    deleted_by = v_ibrahim_id,
    is_active = false,
    updated_at = now()
  WHERE phone != '0544433244'
    AND deleted_at IS NULL;
END $$;

-- تأكيد صلاحيات إبراهيم المطلقة
UPDATE admin_users
SET 
  is_active = true,
  is_platform_owner = true,
  deleted_at = NULL,
  deleted_by = NULL,
  updated_at = now()
WHERE phone = '0544433244';

-- التحقق النهائي وإصدار تقرير
DO $$
DECLARE
  v_active_admins int;
  v_total_permissions int;
  v_smart_button_perms int;
  v_deleted_admins int;
BEGIN
  SELECT COUNT(*) INTO v_active_admins
  FROM admin_users
  WHERE is_active = true AND deleted_at IS NULL;
  
  SELECT COUNT(*) INTO v_deleted_admins
  FROM admin_users
  WHERE deleted_at IS NOT NULL;
  
  SELECT COUNT(*) INTO v_total_permissions
  FROM admin_module_permissions;
  
  SELECT COUNT(*) INTO v_smart_button_perms
  FROM smart_button_sub_permissions;
  
  RAISE NOTICE '=================================================';
  RAISE NOTICE '         التقرير النهائي لعملية التنظيف         ';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'عدد المستخدمين النشطين: %', v_active_admins;
  RAISE NOTICE 'عدد المستخدمين المحذوفين: %', v_deleted_admins;
  RAISE NOTICE 'عدد صلاحيات الأقسام المتبقية: %', v_total_permissions;
  RAISE NOTICE 'عدد صلاحيات الزر الذكي المتبقية: %', v_smart_button_perms;
  RAISE NOTICE '=================================================';
  
  IF v_active_admins = 1 THEN
    RAISE NOTICE '✅ التنظيف تم بنجاح - مستخدم واحد فقط متبقي';
  ELSE
    RAISE WARNING '⚠️ تحذير: يوجد % مستخدم نشط', v_active_admins;
  END IF;
END $$;
