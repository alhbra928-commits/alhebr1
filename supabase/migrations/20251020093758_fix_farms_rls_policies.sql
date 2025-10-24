/*
  # إصلاح سياسات RLS لجدول المزارع
  
  ## التغييرات
  1. إضافة سياسات كاملة للإدارة
  2. السماح بجميع العمليات للمستخدمين المصادقين
  
  ## السياسات
  - عرض جميع المزارع
  - إضافة مزرعة جديدة
  - تحديث المزارع
  - حذف المزارع
*/

-- حذف السياسة القديمة إن وجدت
DROP POLICY IF EXISTS "Anyone can view active farms" ON farms;

-- سياسة عرض جميع المزارع للمصادقين
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'farms' 
    AND policyname = 'Admins can view all farms'
  ) THEN
    CREATE POLICY "Admins can view all farms"
      ON farms FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- سياسة إضافة مزارع
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'farms' 
    AND policyname = 'Admins can insert farms'
  ) THEN
    CREATE POLICY "Admins can insert farms"
      ON farms FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- سياسة تحديث المزارع
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'farms' 
    AND policyname = 'Admins can update farms'
  ) THEN
    CREATE POLICY "Admins can update farms"
      ON farms FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- سياسة حذف المزارع
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'farms' 
    AND policyname = 'Admins can delete farms'
  ) THEN
    CREATE POLICY "Admins can delete farms"
      ON farms FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;
