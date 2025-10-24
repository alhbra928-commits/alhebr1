/*
  # تنظيف إيصالات السداد من base64
  
  1. التغييرات
    - إضافة عمود مؤقت لتتبع الإيصالات التي تم تحويلها
    - تحديث حالة الإيصالات القديمة لإعادة رفعها
  
  2. الملاحظات
    - الإيصالات الحالية base64 (2MB+) تسبب بطء شديد
    - يجب على المستثمرين إعادة رفع الإيصالات
    - الإيصالات الجديدة ستُخزن في Storage فقط
*/

-- إضافة عمود لتتبع نوع التخزين
ALTER TABLE payment_receipts 
ADD COLUMN IF NOT EXISTS storage_type VARCHAR(20) DEFAULT 'base64';

-- تحديث الإيصالات الموجودة
UPDATE payment_receipts
SET storage_type = CASE
  WHEN receipt_file_url LIKE 'data:%' THEN 'base64'
  WHEN receipt_file_url LIKE 'http%' THEN 'storage'
  ELSE 'unknown'
END
WHERE deleted_at IS NULL;

-- إنشاء view لعرض الإيصالات بدون base64 (أداء أفضل)
CREATE OR REPLACE VIEW payment_receipts_summary AS
SELECT 
  id,
  reservation_id,
  investor_id,
  bank_name,
  amount,
  transfer_date,
  CASE 
    WHEN receipt_file_url LIKE 'data:%' THEN 'base64_data'
    ELSE receipt_file_url
  END as receipt_file_url,
  receipt_file_name,
  status,
  storage_type,
  created_at,
  updated_at,
  verified_at,
  verified_by
FROM payment_receipts
WHERE deleted_at IS NULL;

-- إنشاء index لتسريع الاستعلامات
CREATE INDEX IF NOT EXISTS idx_payment_receipts_reservation_status 
ON payment_receipts(reservation_id, status, deleted_at);

CREATE INDEX IF NOT EXISTS idx_payment_receipts_investor_status 
ON payment_receipts(investor_id, status, deleted_at) 
WHERE investor_id IS NOT NULL;