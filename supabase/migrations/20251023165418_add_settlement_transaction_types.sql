/*
  # إضافة أنواع معاملات التسوية

  1. المشكلة
    - دالة initiate_settlement تستخدم 'settlement_initiated'
    - الـ constraint لا يتضمن هذا النوع
    
  2. الحل
    - إضافة أنواع معاملات التسوية للـ constraint
*/

-- حذف الـ constraint القديم
ALTER TABLE farm_financial_transactions 
DROP CONSTRAINT IF EXISTS farm_financial_transactions_transaction_type_check;

-- إضافة constraint جديد يشمل جميع الأنواع
ALTER TABLE farm_financial_transactions
ADD CONSTRAINT farm_financial_transactions_transaction_type_check
CHECK (transaction_type IN (
  'marketing_income',
  'owner_payment', 
  'platform_profit',
  'charity_deduction',
  'investor_revenue',
  'settlement_initiated',
  'settlement_completed',
  'settlement_cancelled'
));
