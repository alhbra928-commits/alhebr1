/*
  # نظام تتبع الترحيب بالمستثمر الجديد
  
  ## المشكلة
  رسالة الترحيب تظهر أحياناً ولا تظهر أحياناً للمستثمر الجديد
  
  ## السبب
  1. لا يوجد تتبع في قاعدة البيانات
  2. الاعتماد فقط على isFirstTimeLogin prop
  3. لا يوجد تحقق من أول دخول فعلي
  
  ## الحل
  1. جدول لتتبع welcome_status لكل مستثمر
  2. التحقق من أول تسجيل دخول حقيقي
  3. تحديث تلقائي عند الإغلاق
  4. ضمان عرض مرة واحدة فقط
*/

-- =============================================
-- 1. جدول تتبع حالة الترحيب
-- =============================================

CREATE TABLE IF NOT EXISTS investor_welcome_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  welcome_shown boolean DEFAULT false,
  welcome_shown_at timestamptz,
  first_login_at timestamptz DEFAULT now(),
  login_count integer DEFAULT 0,
  last_login_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_investor_phone UNIQUE (phone)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_investor_welcome_phone ON investor_welcome_status(phone);
CREATE INDEX IF NOT EXISTS idx_investor_welcome_shown ON investor_welcome_status(welcome_shown);

-- Enable RLS
ALTER TABLE investor_welcome_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "المستثمرون يستطيعون رؤية حالتهم"
  ON investor_welcome_status FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "المستثمرون يستطيعون تحديث حالتهم"
  ON investor_welcome_status FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "المستثمرون يستطيعون إضافة حالتهم"
  ON investor_welcome_status FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "المسؤولون يستطيعون رؤية كل الحالات"
  ON investor_welcome_status FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- 2. دوال مساعدة
-- =============================================

-- دالة للتحقق من أول دخول
CREATE OR REPLACE FUNCTION check_first_login(investor_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  welcome_record RECORD;
  is_first boolean;
BEGIN
  -- البحث عن سجل المستثمر
  SELECT * INTO welcome_record
  FROM investor_welcome_status
  WHERE phone = investor_phone;
  
  -- إذا لم يوجد سجل، هذا أول دخول
  IF welcome_record IS NULL THEN
    -- إنشاء سجل جديد
    INSERT INTO investor_welcome_status (
      phone,
      welcome_shown,
      first_login_at,
      login_count,
      last_login_at
    ) VALUES (
      investor_phone,
      false,  -- لم يتم عرض الترحيب بعد
      now(),
      1,
      now()
    );
    
    RAISE NOTICE '✅ مستثمر جديد: % - أول دخول', investor_phone;
    RETURN true;
  END IF;
  
  -- إذا وجد سجل، تحديث عداد الدخول
  UPDATE investor_welcome_status
  SET 
    login_count = login_count + 1,
    last_login_at = now(),
    updated_at = now()
  WHERE phone = investor_phone;
  
  -- إرجاع حالة الترحيب
  is_first := NOT welcome_record.welcome_shown;
  
  IF is_first THEN
    RAISE NOTICE '✅ مستثمر عائد: % - لم يتم عرض الترحيب بعد', investor_phone;
  ELSE
    RAISE NOTICE '✅ مستثمر عائد: % - تم عرض الترحيب سابقاً', investor_phone;
  END IF;
  
  RETURN is_first;
END;
$$;

-- دالة لتسجيل عرض الترحيب
CREATE OR REPLACE FUNCTION mark_welcome_shown(investor_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- تحديث حالة الترحيب
  UPDATE investor_welcome_status
  SET 
    welcome_shown = true,
    welcome_shown_at = now(),
    updated_at = now()
  WHERE phone = investor_phone;
  
  IF FOUND THEN
    RAISE NOTICE '✅ تم تسجيل عرض الترحيب للمستثمر: %', investor_phone;
    RETURN true;
  ELSE
    -- إذا لم يوجد سجل، إنشاء واحد
    INSERT INTO investor_welcome_status (
      phone,
      welcome_shown,
      welcome_shown_at,
      login_count,
      last_login_at
    ) VALUES (
      investor_phone,
      true,
      now(),
      1,
      now()
    )
    ON CONFLICT (phone) DO UPDATE
    SET
      welcome_shown = true,
      welcome_shown_at = now(),
      updated_at = now();
    
    RAISE NOTICE '✅ تم إنشاء وتسجيل عرض الترحيب للمستثمر: %', investor_phone;
    RETURN true;
  END IF;
END;
$$;

-- دالة للحصول على حالة الترحيب
CREATE OR REPLACE FUNCTION get_welcome_status(investor_phone text)
RETURNS TABLE (
  should_show_welcome boolean,
  login_count integer,
  last_login timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    NOT COALESCE(welcome_shown, false) as should_show_welcome,
    COALESCE(iws.login_count, 0) as login_count,
    iws.last_login_at as last_login
  FROM investor_welcome_status iws
  WHERE iws.phone = investor_phone;
  
  -- إذا لم يوجد سجل، إرجاع قيم افتراضية
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT true, 0, now();
  END IF;
END;
$$;

-- =============================================
-- 3. Trigger تلقائي عند أول حجز
-- =============================================

CREATE OR REPLACE FUNCTION auto_mark_first_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reservation_count integer;
BEGIN
  -- عد الحجوزات السابقة لهذا المستثمر
  SELECT COUNT(*) INTO reservation_count
  FROM reservations
  WHERE customer_phone = NEW.customer_phone
    AND deleted_at IS NULL;
  
  -- إذا كان هذا أول حجز، ضمان عرض الترحيب
  IF reservation_count <= 1 THEN
    -- إنشاء أو تحديث سجل الترحيب
    INSERT INTO investor_welcome_status (
      phone,
      welcome_shown,
      first_login_at,
      login_count
    ) VALUES (
      NEW.customer_phone,
      false,  -- ضمان عرض الترحيب
      now(),
      1
    )
    ON CONFLICT (phone) DO NOTHING;
    
    RAISE NOTICE '✅ أول حجز للمستثمر: % - سيتم عرض الترحيب', NEW.customer_phone;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_mark_first_reservation ON reservations;
CREATE TRIGGER trigger_auto_mark_first_reservation
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION auto_mark_first_reservation();

-- =============================================
-- 4. تهيئة البيانات الحالية
-- =============================================

-- تهيئة سجلات للمستثمرين الحاليين
DO $$
DECLARE
  investor_record RECORD;
  first_reservation_date timestamptz;
  total_logins integer;
BEGIN
  RAISE NOTICE '🔄 بدء تهيئة سجلات الترحيب للمستثمرين الحاليين...';
  
  FOR investor_record IN
    SELECT DISTINCT customer_phone
    FROM reservations
    WHERE customer_phone IS NOT NULL
      AND deleted_at IS NULL
  LOOP
    -- الحصول على تاريخ أول حجز
    SELECT MIN(created_at) INTO first_reservation_date
    FROM reservations
    WHERE customer_phone = investor_record.customer_phone
      AND deleted_at IS NULL;
    
    -- حساب عدد الدخول بناءً على عدد الحجوزات
    SELECT COUNT(*) INTO total_logins
    FROM reservations
    WHERE customer_phone = investor_record.customer_phone
      AND deleted_at IS NULL;
    
    -- إدراج السجل
    INSERT INTO investor_welcome_status (
      phone,
      welcome_shown,
      welcome_shown_at,
      first_login_at,
      login_count,
      last_login_at
    ) VALUES (
      investor_record.customer_phone,
      true,  -- افتراض أنهم رأوا الترحيب
      first_reservation_date,
      first_reservation_date,
      total_logins,
      now()
    )
    ON CONFLICT (phone) DO NOTHING;
    
  END LOOP;
  
  RAISE NOTICE '✅ تم تهيئة سجلات الترحيب';
END $$;

-- =============================================
-- 5. التحقق والإحصائيات
-- =============================================

DO $$
DECLARE
  total_investors integer;
  new_investors integer;
  returning_investors integer;
BEGIN
  RAISE NOTICE '📊 ====== إحصائيات الترحيب ======';
  
  SELECT COUNT(*) INTO total_investors
  FROM investor_welcome_status;
  
  SELECT COUNT(*) INTO new_investors
  FROM investor_welcome_status
  WHERE welcome_shown = false;
  
  SELECT COUNT(*) INTO returning_investors
  FROM investor_welcome_status
  WHERE welcome_shown = true;
  
  RAISE NOTICE '👥 إجمالي المستثمرين: %', total_investors;
  RAISE NOTICE '🆕 مستثمرون جدد (لم يروا الترحيب): %', new_investors;
  RAISE NOTICE '🔄 مستثمرون عائدون: %', returning_investors;
  RAISE NOTICE '================================';
END $$;
