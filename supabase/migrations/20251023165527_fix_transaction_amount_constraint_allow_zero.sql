/*
  # السماح بالمبلغ صفر للمعاملات الإدارية

  1. المشكلة
    - constraint يمنع amount = 0
    - معاملات التسوية والإدارة تحتاج مبلغ صفر
    
  2. الحل
    - تعديل constraint للسماح بـ >= 0 بدلاً من > 0
*/

ALTER TABLE farm_financial_transactions 
DROP CONSTRAINT IF EXISTS valid_transaction_amount;

ALTER TABLE farm_financial_transactions
ADD CONSTRAINT valid_transaction_amount
CHECK (amount >= 0);
