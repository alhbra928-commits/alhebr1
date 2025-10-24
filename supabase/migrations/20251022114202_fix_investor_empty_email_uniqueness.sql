/*
  # Fix Investor Empty Email Uniqueness Issue

  1. Problem
    - Multiple investors with empty email '' violates unique constraint
    - Empty string should not be treated as unique value
    
  2. Solution
    - Drop the unique constraint on email
    - Create partial unique index that ignores empty/null emails
    - Ensures real emails are unique but empty values are allowed
*/

-- Drop the existing unique constraint
ALTER TABLE investors DROP CONSTRAINT IF EXISTS investors_email_key;

-- Create partial unique index (only for non-empty emails)
CREATE UNIQUE INDEX IF NOT EXISTS investors_unique_email_idx 
ON investors (email) 
WHERE email IS NOT NULL AND email != '';

-- Add comment
COMMENT ON INDEX investors_unique_email_idx IS 'Ensures unique emails but allows multiple empty values for public bookings';
