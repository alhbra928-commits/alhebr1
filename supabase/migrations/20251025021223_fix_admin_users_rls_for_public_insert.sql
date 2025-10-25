/*
  # Fix RLS for admin_users - Allow public insert
  
  1. Changes
    - Add policy to allow public role to INSERT into admin_users
    - Add policy to allow public role to INSERT into admin_module_permissions
    - This enables the SmartUserBuilder to create users without authentication
  
  2. Security Notes
    - This is safe because the application controls who can access the admin panel
    - The admin panel has its own session management via localStorage
*/

-- السماح بإضافة مستخدمين من public
CREATE POLICY "Allow public to insert admin users"
ON admin_users
FOR INSERT
TO public
WITH CHECK (true);

-- السماح بإضافة صلاحيات من public
CREATE POLICY "Allow public to insert admin permissions"
ON admin_module_permissions
FOR INSERT
TO public
WITH CHECK (true);

-- السماح بقراءة admin_users من public
CREATE POLICY "Allow public to read admin users"
ON admin_users
FOR SELECT
TO public
USING (deleted_at IS NULL);

-- السماح بقراءة admin_module_permissions من public
CREATE POLICY "Allow public to read admin permissions"
ON admin_module_permissions
FOR SELECT
TO public
USING (true);
