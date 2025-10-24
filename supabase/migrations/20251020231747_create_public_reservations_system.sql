/*
  # Public Reservations System for Farm Platform

  ## Overview
  This migration enhances the reservations system to support public bookings from the main platform interface.

  ## Changes

  1. **New Fields in reservations table**
    - `customer_name` (text) - Full name of the customer
    - `customer_phone` (text) - Phone number for login and contact
    - `tree_type` (text) - Type of trees (palm/olive/mixed)
    - `palm_count` (integer) - Number of palm trees (for mixed)
    - `olive_count` (integer) - Number of olive trees (for mixed)
    - `booking_source` (text) - Source of booking (public_platform/admin_panel)
    - Make `investor_id` nullable for public bookings
    - Make `contract_start_date` and `contract_end_date` nullable initially

  2. **Update Status Values**
    - Add 'pending_contact' status for new public bookings

  3. **Indexes**
    - Add index on customer_phone for fast lookup
    - Add index on booking_source
    - Add index on status for filtering

  ## Security
  - No changes to RLS (currently disabled for testing)
  
  ## Notes
  - Public bookings start with status 'pending_contact'
  - investor_id will be linked after admin processes the booking
*/

-- Make investor_id nullable for public bookings
ALTER TABLE reservations 
  ALTER COLUMN investor_id DROP NOT NULL;

-- Make contract dates nullable initially (will be set by admin)
ALTER TABLE reservations 
  ALTER COLUMN contract_start_date DROP NOT NULL;

ALTER TABLE reservations 
  ALTER COLUMN contract_end_date DROP NOT NULL;

-- Add new fields for public bookings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE reservations ADD COLUMN customer_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE reservations ADD COLUMN customer_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'tree_type'
  ) THEN
    ALTER TABLE reservations ADD COLUMN tree_type text CHECK (tree_type IN ('palm', 'olive', 'mixed', 'نخيل', 'زيتون', 'مختلط'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'palm_count'
  ) THEN
    ALTER TABLE reservations ADD COLUMN palm_count integer DEFAULT 0 CHECK (palm_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'olive_count'
  ) THEN
    ALTER TABLE reservations ADD COLUMN olive_count integer DEFAULT 0 CHECK (olive_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'booking_source'
  ) THEN
    ALTER TABLE reservations ADD COLUMN booking_source text DEFAULT 'public_platform' CHECK (booking_source IN ('public_platform', 'admin_panel'));
  END IF;
END $$;

-- Update status constraint to include new status
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check 
  CHECK (status IN ('pending', 'pending_contact', 'confirmed', 'active', 'completed', 'cancelled'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reservations_customer_phone ON reservations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_reservations_booking_source ON reservations(booking_source);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_farm_id ON reservations(farm_id);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at DESC);

-- Update the updated_at timestamp trigger to work with new fields
CREATE OR REPLACE FUNCTION update_reservation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reservation_timestamp ON reservations;
CREATE TRIGGER trigger_update_reservation_timestamp
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_reservation_timestamp();
