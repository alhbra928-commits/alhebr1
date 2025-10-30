/*
  # Add gateway_reappear_duration column
  
  1. Changes
    - Add gateway_reappear_duration column to royal_gateway_settings table
    - Default value: 30 days (in seconds: 30 * 24 * 60 * 60 = 2592000)
    - Type: integer (seconds)
  
  2. Purpose
    - Control how long before gateway reappears for returning visitors
    - Default 30 days = 1 month
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings' 
    AND column_name = 'gateway_reappear_duration'
  ) THEN
    ALTER TABLE royal_gateway_settings 
    ADD COLUMN gateway_reappear_duration integer DEFAULT 2592000 NOT NULL;
    
    COMMENT ON COLUMN royal_gateway_settings.gateway_reappear_duration IS 'Duration in seconds before gateway reappears (default 30 days = 2592000 seconds)';
  END IF;
END $$;
