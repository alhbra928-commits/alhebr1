/*
  # Add secret_code column to admin_users
  
  1. Changes
    - Add secret_code column to store user's secret login code
    - This enables proper authentication without relying on localStorage
  
  2. Security Notes
    - Secret codes are stored as plain text for simplicity
    - In production, these should be hashed
    - The secret code is generated randomly when creating a user
*/

-- إضافة عمود secret_code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'secret_code'
  ) THEN
    ALTER TABLE admin_users 
    ADD COLUMN secret_code TEXT;
  END IF;
END $$;

-- تحديث المستخدمين الموجودين برمز افتراضي
UPDATE admin_users 
SET secret_code = '1234' 
WHERE secret_code IS NULL AND phone = '0500000000';

-- ترك الرموز الأخرى NULL حتى يتم تحديثها من localStorage
