/*
  # إضافة حساب المدير العام الرسمي - إبراهيم علي الحبر
  
  1. المستخدم
    - الاسم: إبراهيم علي الحبر
    - رقم الجوال: 0544433244
    - الرمز السري: 2931
    - الصلاحية: مدير عام (Super Admin) - صلاحيات مطلقة
    - الحالة: نشط بشكل دائم
    
  2. الأمان
    - يتم ربطه بدور super_admin
    - لا يمكن حذفه أو تعطيله من خلال الواجهة
    - يتم وضع علامة أنه المالك الرئيسي
    
  3. ملاحظات
    - هذا هو الحساب الرسمي للمالك الرئيسي للمنصة
    - لا يتم السماح بحذف أو تعطيل هذا الحساب
*/

-- إضافة عمود owner_flag للتمييز عن باقي المديرين
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'is_platform_owner'
  ) THEN
    ALTER TABLE admin_users 
    ADD COLUMN is_platform_owner BOOLEAN DEFAULT false;
  END IF;
END $$;

-- إضافة عمود job_title إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'job_title'
  ) THEN
    ALTER TABLE admin_users 
    ADD COLUMN job_title TEXT;
  END IF;
END $$;

-- حذف أي حساب موجود بنفس رقم الجوال (تنظيف)
DELETE FROM admin_users WHERE phone = '0544433244';

-- إضافة المدير العام الرسمي
INSERT INTO admin_users (
  full_name,
  email,
  phone,
  secret_code,
  role_id,
  job_title,
  is_active,
  is_platform_owner,
  two_factor_enabled,
  device_locked,
  created_at,
  updated_at
)
SELECT 
  'إبراهيم علي الحبر',
  'owner@hisas1.com',
  '0544433244',
  '2931',
  (SELECT id FROM admin_roles WHERE role_code = 'super_admin' LIMIT 1),
  'المدير العام والمالك الرئيسي',
  true,
  true,
  false,
  false,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE phone = '0544433244'
);

-- إنشاء دالة لحماية حساب المالك من الحذف
CREATE OR REPLACE FUNCTION protect_platform_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- منع حذف أو تعطيل المالك الرئيسي
  IF OLD.is_platform_owner = true THEN
    IF TG_OP = 'DELETE' THEN
      RAISE EXCEPTION 'لا يمكن حذف حساب المالك الرئيسي للمنصة';
    END IF;
    
    IF TG_OP = 'UPDATE' AND NEW.is_active = false THEN
      RAISE EXCEPTION 'لا يمكن تعطيل حساب المالك الرئيسي للمنصة';
    END IF;
    
    IF TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL THEN
      RAISE EXCEPTION 'لا يمكن حذف حساب المالك الرئيسي للمنصة';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة المحفز لحماية حساب المالك
DROP TRIGGER IF EXISTS protect_platform_owner_trigger ON admin_users;
CREATE TRIGGER protect_platform_owner_trigger
  BEFORE UPDATE OR DELETE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION protect_platform_owner();

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
      'admin_users',
      v_admin_user_id,
      'INSERT',
      null,
      jsonb_build_object(
        'full_name', 'إبراهيم علي الحبر',
        'phone', '0544433244',
        'role', 'super_admin',
        'is_platform_owner', true
      ),
      v_admin_user_id,
      'owner@hisas1.com',
      'SYSTEM',
      'Migration Script',
      jsonb_build_object(
        'action', 'OFFICIAL_OWNER_ACCOUNT_CREATED',
        'note', 'تم إنشاء حساب المدير العام والمالك الرئيسي للمنصة بشكل رسمي'
      )
    );
  END IF;
END $$;
