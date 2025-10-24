/*
  # إنشاء نظام إيصالات السداد البنكية

  ## الهدف
  تمكين المستثمرين من رفع إيصالات السداد البنكي بعد اعتماد الحجوزات
  وإدارتها من قبل الإدارة للتحقق وإصدار الشهادات.

  ## 1. الجداول الجديدة
  
  ### payment_receipts
  يحتوي على جميع إيصالات السداد المرفوعة من المستثمرين:
  - `id` (uuid, primary key) - معرف فريد
  - `reservation_id` (uuid, foreign key) - ربط بالحجز
  - `investor_id` (uuid, foreign key) - المستثمر صاحب الإيصال
  - `bank_name` (text) - اسم البنك
  - `amount` (numeric) - المبلغ المحول
  - `transfer_date` (date) - تاريخ التحويل
  - `receipt_file_url` (text) - رابط ملف الإيصال
  - `receipt_file_name` (text) - اسم الملف الأصلي
  - `notes` (text, nullable) - ملاحظات المستثمر
  - `status` (text) - الحالة: pending, verified, rejected
  - `verified_by` (uuid, nullable) - من قام بالتحقق
  - `verified_at` (timestamptz, nullable) - وقت التحقق
  - `verification_notes` (text, nullable) - ملاحظات الإدارة
  - `created_at` (timestamptz) - وقت الرفع
  - `updated_at` (timestamptz) - آخر تحديث
  - `deleted_at` (timestamptz, nullable) - للحذف الآمن

  ## 2. الأمان
  - تفعيل RLS على جميع الجداول
  - سياسات قراءة: المستثمر يرى إيصالاته فقط، الإدارة ترى الكل
  - سياسات الإضافة: المستثمرون المصادقون فقط
  - سياسات التحديث: الإدارة فقط للتحقق

  ## 3. الفهارس
  - فهرس على reservation_id للبحث السريع
  - فهرس على investor_id للوصول لإيصالات مستثمر معين
  - فهرس على status للتصفية

  ## 4. الحالات المتوقعة
  - `pending` - بانتظار التحقق من الإدارة
  - `verified` - تم التحقق من السداد
  - `rejected` - مرفوض (مبلغ خاطئ، إيصال غير واضح، إلخ)
*/

-- إنشاء جدول إيصالات السداد
CREATE TABLE IF NOT EXISTS payment_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id) ON DELETE SET NULL,
  bank_name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  transfer_date date NOT NULL,
  receipt_file_url text NOT NULL,
  receipt_file_name text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  verification_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  deleted_by uuid
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_payment_receipts_reservation 
  ON payment_receipts(reservation_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payment_receipts_investor 
  ON payment_receipts(investor_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payment_receipts_status 
  ON payment_receipts(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payment_receipts_created 
  ON payment_receipts(created_at DESC) WHERE deleted_at IS NULL;

-- تفعيل RLS
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: المستثمر يرى إيصالاته فقط
CREATE POLICY "Investors can view own payment receipts"
  ON payment_receipts FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL AND
    (
      investor_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM admin_users 
        WHERE id = auth.uid()
      )
    )
  );

-- سياسة الإضافة: المستثمرون يمكنهم رفع إيصالات لحجوزاتهم المعتمدة فقط
CREATE POLICY "Investors can upload receipts for approved reservations"
  ON payment_receipts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reservations r
      WHERE r.id = reservation_id
        AND r.investor_id = auth.uid()
        AND r.status = 'confirmed'
        AND r.deleted_at IS NULL
    )
  );

-- سياسة التحديث: الإدارة فقط يمكنها التحقق من الإيصالات
CREATE POLICY "Admins can verify payment receipts"
  ON payment_receipts FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- سياسة الحذف الآمن: الإدارة فقط
CREATE POLICY "Admins can soft delete payment receipts"
  ON payment_receipts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_payment_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تفعيل الـ trigger
DROP TRIGGER IF EXISTS payment_receipts_updated_at ON payment_receipts;
CREATE TRIGGER payment_receipts_updated_at
  BEFORE UPDATE ON payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_receipts_updated_at();

-- دالة لتحديث حالة الحجز عند التحقق من الإيصال
CREATE OR REPLACE FUNCTION update_reservation_after_payment_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- عند التحقق من الإيصال، تحديث حالة الدفع في الحجز
  IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
    UPDATE reservations
    SET 
      payment_status = 'completed',
      updated_at = now()
    WHERE id = NEW.reservation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تفعيل الـ trigger
DROP TRIGGER IF EXISTS payment_receipt_verified ON payment_receipts;
CREATE TRIGGER payment_receipt_verified
  AFTER UPDATE ON payment_receipts
  FOR EACH ROW
  WHEN (NEW.status = 'verified' AND OLD.status != 'verified')
  EXECUTE FUNCTION update_reservation_after_payment_verification();

-- إضافة تعليقات توضيحية
COMMENT ON TABLE payment_receipts IS 'إيصالات السداد البنكي المرفوعة من المستثمرين';
COMMENT ON COLUMN payment_receipts.status IS 'pending: بانتظار التحقق | verified: تم التحقق | rejected: مرفوض';
COMMENT ON COLUMN payment_receipts.receipt_file_url IS 'رابط ملف الإيصال (صورة أو PDF)';
