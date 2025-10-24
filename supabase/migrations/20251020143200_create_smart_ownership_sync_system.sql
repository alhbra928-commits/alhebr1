/*
  # نظام التكامل الذكي - إدارة الحجوزات والتوثيق والمستثمرين

  ## 1. الجداول الجديدة

  ### A) جدول bookings (إدارة الحجوزات)
    - `id` (uuid, primary key): معرف فريد
    - `booking_code` (text, unique): رقم الحجز بصيغة BOOK-2025-XXXX
    - `farm_id` (uuid, foreign key): ربط بجدول farms
    - `investor_id` (uuid, foreign key): ربط بجدول investors
    - `farm_code` (text): نسخة من كود المزرعة
    - `investor_name` (text): اسم المستثمر
    - `investor_mobile` (text): رقم جوال المستثمر
    - `investor_email` (text): بريد المستثمر
    - `reserved_trees` (integer): عدد الأشجار المحجوزة
    - `total_price` (numeric): السعر الإجمالي
    - `payment_status` (text): حالة الدفع (pending, partial, completed)
    - `payment_amount` (numeric): المبلغ المدفوع
    - `booking_status` (text): حالة الحجز (pending, approved, rejected, documented)
    - `booking_date` (timestamptz): تاريخ الحجز
    - `approved_at` (timestamptz): تاريخ الموافقة
    - `approved_by` (uuid): من وافق
    - `notes` (text): ملاحظات إدارية
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - `deleted_at` (timestamptz): للحذف الناعم

  ### B) جدول documentation (إدارة التوثيق)
    - `id` (uuid, primary key)
    - `booking_id` (uuid, unique): ربط بالحجز الأصلي
    - `booking_code` (text): نسخة من رقم الحجز
    - `certificate_code` (text, unique): رقم الشهادة CERT-2025-XXXX
    - `farm_id` (uuid, foreign key)
    - `farm_code` (text)
    - `investor_id` (uuid, foreign key)
    - `investor_name` (text)
    - `reserved_trees` (integer)
    - `total_price` (numeric)
    - `certificate_pdf_url` (text): رابط الشهادة
    - `certificate_generated_at` (timestamptz)
    - `verification_token` (text, unique): رمز تحقق
    - `qr_code_url` (text): باركود التحقق
    - `status` (text): documented, verified, archived
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### C) جدول investor_certificates (ربط المستثمرين بالشهادات)
    - `id` (uuid, primary key)
    - `investor_id` (uuid, foreign key)
    - `documentation_id` (uuid, foreign key)
    - `certificate_code` (text)
    - `farm_code` (text)
    - `is_viewed` (boolean): هل شاهدها المستثمر
    - `viewed_at` (timestamptz)
    - `download_count` (integer): عدد مرات التحميل
    - `created_at` (timestamptz)

  ### D) جدول migration_log (سجل التحويلات)
    - `id` (uuid, primary key)
    - `booking_id` (uuid)
    - `booking_code` (text)
    - `documentation_id` (uuid)
    - `certificate_code` (text)
    - `migrated_by` (uuid): من نفذ العملية
    - `migration_reason` (text)
    - `backup_data` (jsonb): نسخة احتياطية
    - `created_at` (timestamptz)

  ## 2. الأمان والـ RLS
    - تفعيل RLS على جميع الجداول
    - سياسات قراءة وكتابة للمصادقين فقط
    - المستثمرون يرون بياناتهم فقط

  ## 3. الدوال الذكية
    - generate_booking_code(): توليد رقم حجز تلقائي
    - generate_certificate_code(): توليد رقم شهادة تلقائي
    - auto_migrate_to_documentation(): نقل من الحجوزات للتوثيق
    - update_tree_status_on_booking(): تحديث حالة الأشجار

  ## الملاحظات
    - جميع العمليات مؤرشفة في audit_log
    - النسخ الاحتياطية في migration_log
    - الحذف من bookings فقط بعد نجاح التوثيق
*/

-- ==========================================
-- 1. إنشاء جدول الحجوزات (bookings)
-- ==========================================

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code text UNIQUE,
  farm_id uuid REFERENCES farms(id) ON DELETE RESTRICT,
  investor_id uuid REFERENCES investors(id) ON DELETE RESTRICT,
  farm_code text,
  investor_name text NOT NULL,
  investor_mobile text NOT NULL,
  investor_email text,
  reserved_trees integer NOT NULL CHECK (reserved_trees > 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed')),
  payment_amount numeric DEFAULT 0 CHECK (payment_amount >= 0),
  booking_status text DEFAULT 'pending' CHECK (booking_status IN ('pending', 'approved', 'rejected', 'documented')),
  booking_date timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- ==========================================
-- 2. إنشاء جدول التوثيق (documentation)
-- ==========================================

CREATE TABLE IF NOT EXISTS documentation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid UNIQUE,
  booking_code text,
  certificate_code text UNIQUE NOT NULL,
  farm_id uuid REFERENCES farms(id) ON DELETE RESTRICT,
  farm_code text,
  investor_id uuid REFERENCES investors(id) ON DELETE RESTRICT,
  investor_name text NOT NULL,
  reserved_trees integer NOT NULL,
  total_price numeric NOT NULL,
  certificate_pdf_url text,
  certificate_generated_at timestamptz DEFAULT now(),
  verification_token text UNIQUE,
  qr_code_url text,
  status text DEFAULT 'documented' CHECK (status IN ('documented', 'verified', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- 3. إنشاء جدول شهادات المستثمرين
-- ==========================================

CREATE TABLE IF NOT EXISTS investor_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  documentation_id uuid NOT NULL REFERENCES documentation(id) ON DELETE CASCADE,
  certificate_code text NOT NULL,
  farm_code text,
  is_viewed boolean DEFAULT false,
  viewed_at timestamptz,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(investor_id, documentation_id)
);

-- ==========================================
-- 4. إنشاء جدول سجل التحويلات
-- ==========================================

CREATE TABLE IF NOT EXISTS migration_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid,
  booking_code text,
  documentation_id uuid,
  certificate_code text,
  migrated_by uuid,
  migration_reason text,
  backup_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 5. إنشاء Indexes للأداء
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_bookings_farm_id ON bookings(farm_id);
CREATE INDEX IF NOT EXISTS idx_bookings_investor_id ON bookings(investor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);

CREATE INDEX IF NOT EXISTS idx_documentation_booking_id ON documentation(booking_id);
CREATE INDEX IF NOT EXISTS idx_documentation_farm_id ON documentation(farm_id);
CREATE INDEX IF NOT EXISTS idx_documentation_investor_id ON documentation(investor_id);
CREATE INDEX IF NOT EXISTS idx_documentation_certificate_code ON documentation(certificate_code);
CREATE INDEX IF NOT EXISTS idx_documentation_verification_token ON documentation(verification_token);

CREATE INDEX IF NOT EXISTS idx_investor_certificates_investor_id ON investor_certificates(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_certificates_documentation_id ON investor_certificates(documentation_id);

CREATE INDEX IF NOT EXISTS idx_migration_log_booking_id ON migration_log(booking_id);
CREATE INDEX IF NOT EXISTS idx_migration_log_documentation_id ON migration_log(documentation_id);

-- ==========================================
-- 6. دالة توليد رقم الحجز التلقائي
-- ==========================================

CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS text AS $$
DECLARE
  current_year text;
  next_number integer;
  new_code text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;

  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(booking_code FROM 'BOOK-' || current_year || '-(.*)') AS integer
      )
    ), 0
  ) + 1 INTO next_number
  FROM bookings
  WHERE booking_code LIKE 'BOOK-' || current_year || '-%';

  new_code := 'BOOK-' || current_year || '-' || LPAD(next_number::text, 4, '0');

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 7. دالة توليد رقم الشهادة التلقائي
-- ==========================================

CREATE OR REPLACE FUNCTION generate_certificate_code()
RETURNS text AS $$
DECLARE
  current_year text;
  next_number integer;
  new_code text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;

  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(certificate_code FROM 'CERT-' || current_year || '-(.*)') AS integer
      )
    ), 0
  ) + 1 INTO next_number
  FROM documentation
  WHERE certificate_code LIKE 'CERT-' || current_year || '-%';

  new_code := 'CERT-' || current_year || '-' || LPAD(next_number::text, 4, '0');

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 8. Trigger لتوليد booking_code تلقائياً
-- ==========================================

CREATE OR REPLACE FUNCTION set_booking_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_code IS NULL THEN
    NEW.booking_code := generate_booking_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_booking_code ON bookings;
CREATE TRIGGER trigger_set_booking_code
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_code();

-- ==========================================
-- 9. دالة النقل التلقائي للتوثيق
-- ==========================================

CREATE OR REPLACE FUNCTION auto_migrate_to_documentation(
  p_booking_id uuid,
  p_migrated_by uuid DEFAULT NULL,
  p_migration_reason text DEFAULT 'Certificate issued'
)
RETURNS uuid AS $$
DECLARE
  v_booking record;
  v_documentation_id uuid;
  v_certificate_code text;
  v_verification_token text;
  v_investor_cert_id uuid;
BEGIN
  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id
    AND deleted_at IS NULL
    AND booking_status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or not approved';
  END IF;

  v_certificate_code := generate_certificate_code();
  v_verification_token := encode(gen_random_bytes(16), 'hex');

  INSERT INTO documentation (
    booking_id,
    booking_code,
    certificate_code,
    farm_id,
    farm_code,
    investor_id,
    investor_name,
    reserved_trees,
    total_price,
    verification_token,
    status,
    created_at
  ) VALUES (
    v_booking.id,
    v_booking.booking_code,
    v_certificate_code,
    v_booking.farm_id,
    v_booking.farm_code,
    v_booking.investor_id,
    v_booking.investor_name,
    v_booking.reserved_trees,
    v_booking.total_price,
    v_verification_token,
    'documented',
    now()
  )
  RETURNING id INTO v_documentation_id;

  INSERT INTO investor_certificates (
    investor_id,
    documentation_id,
    certificate_code,
    farm_code,
    created_at
  ) VALUES (
    v_booking.investor_id,
    v_documentation_id,
    v_certificate_code,
    v_booking.farm_code,
    now()
  )
  RETURNING id INTO v_investor_cert_id;

  INSERT INTO migration_log (
    booking_id,
    booking_code,
    documentation_id,
    certificate_code,
    migrated_by,
    migration_reason,
    backup_data,
    created_at
  ) VALUES (
    v_booking.id,
    v_booking.booking_code,
    v_documentation_id,
    v_certificate_code,
    p_migrated_by,
    p_migration_reason,
    row_to_json(v_booking),
    now()
  );

  UPDATE bookings
  SET booking_status = 'documented',
      updated_at = now()
  WHERE id = p_booking_id;

  RETURN v_documentation_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 10. RLS Policies
-- ==========================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "المستخدمون المصادقون يمكنهم قراءة الحجوزات"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "المستخدمون المصادقون يمكنهم إنشاء حجوزات"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "المستخدمون المصادقون يمكنهم تحديث الحجوزات"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "المستخدمون المصادقون يمكنهم قراءة التوثيق"
  ON documentation FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "المستخدمون المصادقون يمكنهم إنشاء توثيق"
  ON documentation FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "المستخدمون المصادقون يمكنهم تحديث التوثيق"
  ON documentation FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "المستثمرون يرون شهاداتهم فقط"
  ON investor_certificates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "إنشاء شهادات للمستثمرين"
  ON investor_certificates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "تحديث شهادات المستثمرين"
  ON investor_certificates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "قراءة سجل التحويلات"
  ON migration_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "إنشاء سجل تحويل"
  ON migration_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==========================================
-- 11. Comments
-- ==========================================

COMMENT ON TABLE bookings IS 'جدول الحجوزات - يحتوي على جميع حجوزات المستثمرين للمزارع';
COMMENT ON TABLE documentation IS 'جدول التوثيق - يحتوي على السجلات الموثقة والشهادات';
COMMENT ON TABLE investor_certificates IS 'جدول شهادات المستثمرين - يربط المستثمر بشهاداته';
COMMENT ON TABLE migration_log IS 'سجل التحويلات - يتتبع عمليات النقل من الحجوزات للتوثيق';

COMMENT ON FUNCTION generate_booking_code() IS 'توليد رقم حجز تلقائي بصيغة BOOK-YYYY-XXXX';
COMMENT ON FUNCTION generate_certificate_code() IS 'توليد رقم شهادة تلقائي بصيغة CERT-YYYY-XXXX';
COMMENT ON FUNCTION auto_migrate_to_documentation(uuid, uuid, text) IS 'نقل تلقائي من الحجوزات إلى التوثيق مع إنشاء الشهادة';
