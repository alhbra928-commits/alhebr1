/*
  # Add investor_revenue to Transaction Types

  1. Problem
    - farm_financial_transactions constraint only allows:
      'marketing_income', 'owner_payment', 'platform_profit', 'charity_deduction'
    - Phase 2 system needs 'investor_revenue' type
    
  2. Solution
    - Drop old constraint
    - Add new constraint including 'investor_revenue'
*/

-- Drop the old constraint
ALTER TABLE farm_financial_transactions 
DROP CONSTRAINT IF EXISTS farm_financial_transactions_transaction_type_check;

-- Add new constraint with investor_revenue included
ALTER TABLE farm_financial_transactions
ADD CONSTRAINT farm_financial_transactions_transaction_type_check
CHECK (transaction_type IN (
  'marketing_income',
  'owner_payment', 
  'platform_profit',
  'charity_deduction',
  'investor_revenue'
));
