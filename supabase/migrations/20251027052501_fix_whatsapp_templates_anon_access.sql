/*
  # إصلاح صلاحيات جدول القوالب للسماح بالوصول العام

  1. التغييرات
    - إضافة صلاحية قراءة للجميع (anon + authenticated)
    - إضافة صلاحية إدراج للجميع
    - إضافة صلاحية تحديث للجميع
    - الحفاظ على الصلاحيات الحالية للإداريين
    
  2. الأمان
    - RLS مفعّل
    - القوالب المحذوفة مخفية
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can read whatsapp_templates" ON whatsapp_templates;
DROP POLICY IF EXISTS "Admins can insert whatsapp_templates" ON whatsapp_templates;
DROP POLICY IF EXISTS "Admins can update whatsapp_templates" ON whatsapp_templates;

-- Create new permissive policies for anon and authenticated users

-- Policy: Anyone can read active templates
CREATE POLICY "Anyone can read active whatsapp templates"
  ON whatsapp_templates
  FOR SELECT
  TO authenticated, anon
  USING (deleted_at IS NULL);

-- Policy: Anyone can insert templates
CREATE POLICY "Anyone can insert whatsapp templates"
  ON whatsapp_templates
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy: Anyone can update templates (not deleted)
CREATE POLICY "Anyone can update whatsapp templates"
  ON whatsapp_templates
  FOR UPDATE
  TO authenticated, anon
  USING (deleted_at IS NULL)
  WITH CHECK (true);

-- Policy: Anyone can soft delete templates
CREATE POLICY "Anyone can soft delete whatsapp templates"
  ON whatsapp_templates
  FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (deleted_at IS NOT NULL);

-- Make sure created_by and deleted_by can be null (for anon users)
DO $$ 
BEGIN
  -- Check and modify created_by to allow null
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_templates' 
    AND column_name = 'created_by'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE whatsapp_templates 
    ALTER COLUMN created_by DROP NOT NULL;
  END IF;

  -- Check and modify deleted_by to allow null
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_templates' 
    AND column_name = 'deleted_by'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE whatsapp_templates 
    ALTER COLUMN deleted_by DROP NOT NULL;
  END IF;
END $$;
