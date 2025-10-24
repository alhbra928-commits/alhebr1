/*
  # Make Investor Fields Nullable for Public Bookings

  1. Problem
    - Public booking system doesn't collect email or national_id initially
    - These fields are marked as NOT NULL causing booking failures
    - Investors should be able to register with just name and phone
    
  2. Solution
    - Make email and national_id nullable
    - Allow initial booking with minimal information
    - Can be updated later through investor panel
    
  3. Security
    - RLS policies still in effect
    - No breaking changes to existing data
*/

-- Make email nullable with default empty string for existing records
ALTER TABLE investors 
ALTER COLUMN email DROP NOT NULL;

-- Make national_id nullable
ALTER TABLE investors 
ALTER COLUMN national_id DROP NOT NULL;

-- Add defaults for existing NULL values if any
UPDATE investors 
SET email = '' 
WHERE email IS NULL;

UPDATE investors 
SET national_id = '' 
WHERE national_id IS NULL;

-- Add helpful comment
COMMENT ON COLUMN investors.email IS 'Email address - optional during initial booking, can be added later';
COMMENT ON COLUMN investors.national_id IS 'National ID - optional during initial booking, can be added later';
