/*
  # Add Retention Policy to Backup History System

  1. New Columns
    - `retention_days` (integer) - Number of days to keep the backup
    - `expires_at` (timestamptz) - Calculated expiration date
    - `file_path` (text) - Path to the backup file
    - `description` (text) - Detailed backup description
  
  2. Changes
    - Add retention_days column with default 7 days
    - Add expires_at column auto-calculated from created_at + retention_days
    - Add file_path for tracking physical file location
    - Add description for backup details
    - Create trigger to auto-calculate expires_at
  
  3. Notes
    - Existing backups will have 7-day default retention
    - New backups can specify custom retention (1-365 days)
    - Expires_at is automatically calculated on insert/update
*/

-- Add retention columns to backup_history
DO $$
BEGIN
  -- Add retention_days column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'backup_history' AND column_name = 'retention_days'
  ) THEN
    ALTER TABLE backup_history 
    ADD COLUMN retention_days integer DEFAULT 7 CHECK (retention_days BETWEEN 1 AND 365);
  END IF;

  -- Add expires_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'backup_history' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE backup_history 
    ADD COLUMN expires_at timestamptz;
  END IF;

  -- Add file_path column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'backup_history' AND column_name = 'file_path'
  ) THEN
    ALTER TABLE backup_history 
    ADD COLUMN file_path text;
  END IF;

  -- Add description column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'backup_history' AND column_name = 'description'
  ) THEN
    ALTER TABLE backup_history 
    ADD COLUMN description text;
  END IF;
END $$;

-- Create function to auto-calculate expires_at
CREATE OR REPLACE FUNCTION calculate_backup_expiration()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auto-calculate expires_at based on retention_days
  IF NEW.retention_days IS NOT NULL THEN
    NEW.expires_at := NEW.created_at + (NEW.retention_days || ' days')::interval;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-calculating expires_at
DROP TRIGGER IF EXISTS set_backup_expiration ON backup_history;
CREATE TRIGGER set_backup_expiration
  BEFORE INSERT OR UPDATE OF retention_days, created_at
  ON backup_history
  FOR EACH ROW
  EXECUTE FUNCTION calculate_backup_expiration();

-- Update existing backups to have expiration dates
UPDATE backup_history 
SET expires_at = created_at + (COALESCE(retention_days, 7) || ' days')::interval
WHERE expires_at IS NULL;

-- Create index for efficient expiration queries
CREATE INDEX IF NOT EXISTS idx_backup_history_expires_at 
ON backup_history(expires_at) 
WHERE expires_at IS NOT NULL;

-- Create view for active (non-expired) backups
CREATE OR REPLACE VIEW active_backups AS
SELECT 
  id,
  backup_type,
  backup_name,
  file_path,
  description,
  backup_size,
  created_at,
  retention_days,
  expires_at,
  CASE 
    WHEN expires_at > NOW() THEN expires_at - NOW()
    ELSE interval '0'
  END as time_until_expiration,
  CASE 
    WHEN expires_at > NOW() THEN true
    ELSE false
  END as is_active
FROM backup_history
WHERE expires_at IS NULL OR expires_at > NOW()
ORDER BY created_at DESC;
