/*
  # Add Enable Repeated Gateway Toggle

  1. Changes
    - Add `enable_repeated_gateway` boolean column to royal_gateway_settings
    - Default value: false
    - When true: gateway shows on every page refresh
    - When false: use gateway_reappear_duration setting

  2. Notes
    - This gives admins explicit control over repeated gateway mode
    - More intuitive than setting duration to 0
    - Works alongside gateway_reappear_duration
*/

-- Add enable_repeated_gateway column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'royal_gateway_settings'
    AND column_name = 'enable_repeated_gateway'
  ) THEN
    ALTER TABLE royal_gateway_settings
    ADD COLUMN enable_repeated_gateway BOOLEAN DEFAULT false;
    
    -- Add helpful comment
    COMMENT ON COLUMN royal_gateway_settings.enable_repeated_gateway IS 
    'When true, gateway shows on every page refresh regardless of duration';
  END IF;
END $$;
