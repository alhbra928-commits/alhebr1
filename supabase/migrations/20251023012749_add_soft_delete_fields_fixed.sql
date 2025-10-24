/*
  # إضافة Soft Delete للجداول المالية
*/

DO $$
BEGIN
  -- smart_farm_finances
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_farm_finances' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE smart_farm_finances ADD COLUMN deleted_at TIMESTAMPTZ;
    CREATE INDEX idx_smart_farm_finances_deleted ON smart_farm_finances(deleted_at) WHERE deleted_at IS NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_farm_finances' AND column_name = 'deleted_by'
  ) THEN
    ALTER TABLE smart_farm_finances ADD COLUMN deleted_by UUID;
  END IF;
  
  -- farm_financial_transactions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_financial_transactions' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE farm_financial_transactions ADD COLUMN deleted_at TIMESTAMPTZ;
    CREATE INDEX idx_farm_financial_trans_deleted ON farm_financial_transactions(deleted_at) WHERE deleted_at IS NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_financial_transactions' AND column_name = 'deleted_by'
  ) THEN
    ALTER TABLE farm_financial_transactions ADD COLUMN deleted_by UUID;
  END IF;
END $$;
