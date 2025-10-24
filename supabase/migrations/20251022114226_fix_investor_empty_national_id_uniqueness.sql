/*
  # Fix Investor Empty National ID Uniqueness Issue

  1. Problem
    - Multiple investors with empty national_id '' violates unique constraint
    - Empty string should not be treated as unique value
    
  2. Solution
    - Drop the unique constraint on national_id
    - Create partial unique index that ignores empty/null national_id
    - Ensures real national IDs are unique but empty values are allowed
*/

-- Drop the existing unique constraint
ALTER TABLE investors DROP CONSTRAINT IF EXISTS investors_national_id_key;

-- Create partial unique index (only for non-empty national_id)
CREATE UNIQUE INDEX IF NOT EXISTS investors_unique_national_id_idx 
ON investors (national_id) 
WHERE national_id IS NOT NULL AND national_id != '';

-- Add comment
COMMENT ON INDEX investors_unique_national_id_idx IS 'Ensures unique national IDs but allows multiple empty values for public bookings';
