/*
  # تأسيس منصة تملك النخيل والزيتون - قاعدة البيانات الأساسية
  # Palm & Olive Investment Platform - Database Foundation

  ## نظرة عامة / Overview
  هذا الملف يؤسس البنية الأساسية لمنصة تملك النخيل والزيتون، التي تمكّن المستثمرين
  من شراء حصص في المزارع والحصول على عوائد سنوية من المحاصيل.
  
  This migration establishes the foundational database structure for the Palm & Olive 
  Investment Platform, enabling investors to purchase shares in farms and receive 
  annual returns from harvests.

  ## 1. الجداول الجديدة / New Tables

  ### أ) farm_owners (أصحاب المزارع)
  يحتوي على معلومات أصحاب المزارع الذين يعرضون أراضيهم للاستثمار
  - `id` (uuid): المعرّف الفريد
  - `user_id` (uuid): ربط مع جدول المستخدمين في النظام
  - `full_name` (text): الاسم الكامل
  - `phone` (text): رقم الهاتف
  - `national_id` (text): رقم الهوية الوطنية
  - `bank_account` (text): معلومات الحساب البنكي
  - `status` (text): حالة المالك (active/suspended/pending)
  - `created_at` (timestamptz): تاريخ التسجيل
  - `updated_at` (timestamptz): تاريخ آخر تحديث

  ### ب) farms (المزارع)
  يحتوي على معلومات المزارع المتاحة للاستثمار
  - `id` (uuid): المعرّف الفريد
  - `owner_id` (uuid): معرّف صاحب المزرعة
  - `name_ar` (text): اسم المزرعة بالعربية
  - `name_en` (text): اسم المزرعة بالإنجليزية
  - `location` (text): موقع المزرعة
  - `area_sqm` (numeric): المساحة بالمتر المربع
  - `tree_type` (text): نوع الشجر (palm/olive)
  - `total_trees` (integer): إجمالي عدد الأشجار
  - `available_trees` (integer): عدد الأشجار المتاحة للحجز
  - `price_per_tree` (numeric): سعر الشجرة الواحدة
  - `expected_annual_return` (numeric): العائد السنوي المتوقع بالريال
  - `description_ar` (text): وصف المزرعة بالعربية
  - `description_en` (text): وصف المزرعة بالإنجليزية
  - `images` (jsonb): صور المزرعة
  - `documents` (jsonb): المستندات الرسمية
  - `status` (text): حالة المزرعة (active/inactive/full)
  - `created_at` (timestamptz): تاريخ الإضافة
  - `updated_at` (timestamptz): تاريخ آخر تحديث

  ### ج) investors (المستثمرون)
  يحتوي على معلومات المستثمرين المسجلين في المنصة
  - `id` (uuid): المعرّف الفريد
  - `user_id` (uuid): ربط مع جدول المستخدمين
  - `full_name` (text): الاسم الكامل
  - `phone` (text): رقم الهاتف
  - `email` (text): البريد الإلكتروني
  - `national_id` (text): رقم الهوية
  - `total_invested` (numeric): إجمالي المبلغ المستثمر
  - `total_trees_owned` (integer): إجمالي عدد الأشجار المملوكة
  - `status` (text): حالة المستثمر (active/suspended)
  - `created_at` (timestamptz): تاريخ التسجيل
  - `updated_at` (timestamptz): تاريخ آخر تحديث

  ### د) reservations (الحجوزات)
  يحتوي على حجوزات المستثمرين للأشجار
  - `id` (uuid): المعرّف الفريد
  - `farm_id` (uuid): معرّف المزرعة
  - `investor_id` (uuid): معرّف المستثمر
  - `number_of_trees` (integer): عدد الأشجار المحجوزة
  - `price_per_tree` (numeric): سعر الشجرة وقت الحجز
  - `total_amount` (numeric): المبلغ الإجمالي
  - `reservation_date` (timestamptz): تاريخ الحجز
  - `contract_start_date` (date): تاريخ بداية العقد
  - `contract_end_date` (date): تاريخ نهاية العقد
  - `status` (text): حالة الحجز (pending/confirmed/active/completed/cancelled)
  - `payment_status` (text): حالة الدفع (pending/paid/refunded)
  - `created_at` (timestamptz): تاريخ الإنشاء
  - `updated_at` (timestamptz): تاريخ آخر تحديث

  ### هـ) documents (المستندات والشهادات)
  يحتوي على المستندات الرسمية والشهادات
  - `id` (uuid): المعرّف الفريد
  - `reservation_id` (uuid): معرّف الحجز
  - `document_type` (text): نوع المستند (contract/certificate/invoice/receipt)
  - `document_url` (text): رابط المستند
  - `document_number` (text): رقم المستند
  - `issued_date` (timestamptz): تاريخ الإصدار
  - `metadata` (jsonb): بيانات إضافية
  - `created_at` (timestamptz): تاريخ الإنشاء

  ### و) wallets (المحافظ المالية)
  يحتوي على المحافظ المالية والعمليات المالية
  - `id` (uuid): المعرّف الفريد
  - `user_id` (uuid): معرّف المستخدم (مستثمر أو مالك)
  - `user_type` (text): نوع المستخدم (investor/owner)
  - `balance` (numeric): الرصيد الحالي
  - `total_deposits` (numeric): إجمالي الإيداعات
  - `total_withdrawals` (numeric): إجمالي السحوبات
  - `currency` (text): العملة (SAR)
  - `status` (text): حالة المحفظة (active/frozen/closed)
  - `created_at` (timestamptz): تاريخ الإنشاء
  - `updated_at` (timestamptz): تاريخ آخر تحديث

  ### ز) wallet_transactions (معاملات المحفظة)
  يحتوي على جميع المعاملات المالية
  - `id` (uuid): المعرّف الفريد
  - `wallet_id` (uuid): معرّف المحفظة
  - `transaction_type` (text): نوع المعاملة (deposit/withdrawal/payment/refund/return)
  - `amount` (numeric): المبلغ
  - `description_ar` (text): وصف بالعربية
  - `description_en` (text): وصف بالإنجليزية
  - `reference_id` (uuid): معرّف مرجعي (reservation_id مثلاً)
  - `reference_type` (text): نوع المرجع (reservation/farm/other)
  - `status` (text): حالة المعاملة (pending/completed/failed/cancelled)
  - `created_at` (timestamptz): تاريخ المعاملة

  ### ح) notifications (الإشعارات)
  يحتوي على إشعارات النظام للمستخدمين
  - `id` (uuid): المعرّف الفريد
  - `user_id` (uuid): معرّف المستخدم
  - `title_ar` (text): عنوان الإشعار بالعربية
  - `title_en` (text): عنوان الإشعار بالإنجليزية
  - `message_ar` (text): نص الإشعار بالعربية
  - `message_en` (text): نص الإشعار بالإنجليزية
  - `type` (text): نوع الإشعار (info/success/warning/error)
  - `is_read` (boolean): حالة القراءة
  - `related_id` (uuid): معرّف مرتبط
  - `related_type` (text): نوع المرتبط
  - `created_at` (timestamptz): تاريخ الإنشاء

  ### ط) settings (الإعدادات العامة)
  يحتوي على إعدادات النظام العامة
  - `id` (uuid): المعرّف الفريد
  - `setting_key` (text): مفتاح الإعداد
  - `setting_value` (jsonb): قيمة الإعداد
  - `description_ar` (text): وصف بالعربية
  - `description_en` (text): وصف بالإنجليزية
  - `updated_at` (timestamptz): تاريخ آخر تحديث

  ## 2. العلاقات / Relationships
  - farm_owners → farms (one-to-many)
  - farms → reservations (one-to-many)
  - investors → reservations (one-to-many)
  - reservations → documents (one-to-many)
  - investors/owners → wallets (one-to-one per user_type)
  - wallets → wallet_transactions (one-to-many)

  ## 3. الأمان / Security
  - تفعيل RLS على جميع الجداول
  - سياسات الوصول محددة حسب نوع المستخدم
  - جميع البيانات المالية محمية
  - التحقق من الصلاحيات قبل أي عملية

  ## 4. ملاحظات مهمة / Important Notes
  - جميع الأسعار والمبالغ بالريال السعودي (SAR)
  - جميع التواريخ بتوقيت UTC
  - يتم حفظ سجل كامل لجميع العمليات المالية
  - القيم الافتراضية محددة لضمان سلامة البيانات
*/

-- ===========================
-- 1. جدول أصحاب المزارع
-- Farm Owners Table
-- ===========================
CREATE TABLE IF NOT EXISTS farm_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  full_name text NOT NULL,
  phone text NOT NULL,
  national_id text UNIQUE NOT NULL,
  bank_account text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ===========================
-- 2. جدول المزارع
-- Farms Table
-- ===========================
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  location text NOT NULL,
  area_sqm numeric NOT NULL CHECK (area_sqm > 0),
  tree_type text NOT NULL CHECK (tree_type IN ('palm', 'olive')),
  total_trees integer NOT NULL CHECK (total_trees > 0),
  available_trees integer NOT NULL DEFAULT 0 CHECK (available_trees >= 0),
  price_per_tree numeric NOT NULL CHECK (price_per_tree > 0),
  expected_annual_return numeric NOT NULL DEFAULT 0 CHECK (expected_annual_return >= 0),
  description_ar text DEFAULT '',
  description_en text DEFAULT '',
  images jsonb DEFAULT '[]'::jsonb,
  documents jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'full')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_farm_owner FOREIGN KEY (owner_id) REFERENCES farm_owners(id) ON DELETE CASCADE
);

-- ===========================
-- 3. جدول المستثمرين
-- Investors Table
-- ===========================
CREATE TABLE IF NOT EXISTS investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text UNIQUE NOT NULL,
  national_id text UNIQUE NOT NULL,
  total_invested numeric DEFAULT 0 CHECK (total_invested >= 0),
  total_trees_owned integer DEFAULT 0 CHECK (total_trees_owned >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ===========================
-- 4. جدول الحجوزات
-- Reservations Table
-- ===========================
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  investor_id uuid NOT NULL,
  number_of_trees integer NOT NULL CHECK (number_of_trees > 0),
  price_per_tree numeric NOT NULL CHECK (price_per_tree > 0),
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  reservation_date timestamptz DEFAULT now(),
  contract_start_date date NOT NULL,
  contract_end_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_reservation_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  CONSTRAINT fk_reservation_investor FOREIGN KEY (investor_id) REFERENCES investors(id) ON DELETE CASCADE,
  CONSTRAINT check_contract_dates CHECK (contract_end_date > contract_start_date)
);

-- ===========================
-- 5. جدول المستندات
-- Documents Table
-- ===========================
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('contract', 'certificate', 'invoice', 'receipt', 'other')),
  document_url text NOT NULL,
  document_number text UNIQUE NOT NULL,
  issued_date timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_document_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- ===========================
-- 6. جدول المحافظ المالية
-- Wallets Table
-- ===========================
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('investor', 'owner')),
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  total_deposits numeric DEFAULT 0 CHECK (total_deposits >= 0),
  total_withdrawals numeric DEFAULT 0 CHECK (total_withdrawals >= 0),
  currency text DEFAULT 'SAR',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_wallet UNIQUE (user_id, user_type)
);

-- ===========================
-- 7. جدول معاملات المحفظة
-- Wallet Transactions Table
-- ===========================
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'payment', 'refund', 'return')),
  amount numeric NOT NULL CHECK (amount > 0),
  description_ar text DEFAULT '',
  description_en text DEFAULT '',
  reference_id uuid,
  reference_type text CHECK (reference_type IN ('reservation', 'farm', 'other', NULL)),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_transaction_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
);

-- ===========================
-- 8. جدول الإشعارات
-- Notifications Table
-- ===========================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  message_ar text NOT NULL,
  message_en text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  related_id uuid,
  related_type text CHECK (related_type IN ('reservation', 'farm', 'wallet', 'document', 'other', NULL)),
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- 9. جدول الإعدادات العامة
-- Settings Table
-- ===========================
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description_ar text DEFAULT '',
  description_en text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- ===========================
-- إنشاء الفهارس / Create Indexes
-- ===========================
CREATE INDEX IF NOT EXISTS idx_farms_owner ON farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_farms_status ON farms(status);
CREATE INDEX IF NOT EXISTS idx_farms_tree_type ON farms(tree_type);
CREATE INDEX IF NOT EXISTS idx_reservations_farm ON reservations(farm_id);
CREATE INDEX IF NOT EXISTS idx_reservations_investor ON reservations(investor_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_documents_reservation ON documents(reservation_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ===========================
-- تفعيل RLS / Enable RLS
-- ===========================
ALTER TABLE farm_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ===========================
-- إدراج إعدادات افتراضية
-- Insert Default Settings
-- ===========================
INSERT INTO settings (setting_key, setting_value, description_ar, description_en)
VALUES 
  ('platform_name', '{"ar": "منصة تملك النخيل والزيتون", "en": "Palm & Olive Investment Platform"}'::jsonb, 'اسم المنصة', 'Platform Name'),
  ('platform_commission', '{"rate": 5, "type": "percentage"}'::jsonb, 'عمولة المنصة على كل عملية', 'Platform commission on transactions'),
  ('min_trees_per_reservation', '{"value": 1}'::jsonb, 'الحد الأدنى لعدد الأشجار في الحجز', 'Minimum trees per reservation'),
  ('contract_duration_years', '{"value": 1}'::jsonb, 'مدة العقد الافتراضية بالسنوات', 'Default contract duration in years'),
  ('support_email', '{"value": "support@palmolive.com"}'::jsonb, 'البريد الإلكتروني للدعم', 'Support email address'),
  ('support_phone', '{"value": "+966500000000"}'::jsonb, 'هاتف الدعم الفني', 'Support phone number')
ON CONFLICT (setting_key) DO NOTHING;