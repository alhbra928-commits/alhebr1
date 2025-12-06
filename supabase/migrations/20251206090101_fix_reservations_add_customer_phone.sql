/*
  # Fix Reservations - Add customer_phone to existing records

  ## Overview
  This migration fixes existing reservations that don't have customer_phone
  by copying the phone number from the linked investor record.

  ## Changes
  1. Update all reservations that have investor_id but no customer_phone
  2. Copy investor's phone to reservation's customer_phone
  3. Also copy investor's full_name to customer_name if missing

  ## Notes
  - This is a one-time data fix
  - Only affects existing reservations
  - New reservations already save customer_phone
*/

-- Update existing reservations with investor data
UPDATE reservations r
SET
  customer_phone = i.phone,
  customer_name = COALESCE(r.customer_name, i.full_name)
FROM investors i
WHERE r.investor_id = i.id
  AND r.customer_phone IS NULL
  AND r.deleted_at IS NULL
  AND i.deleted_at IS NULL;
