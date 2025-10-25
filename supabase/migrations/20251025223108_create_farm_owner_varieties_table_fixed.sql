/*
  # إنشاء جدول أصناف أصحاب المزارع

  1. الجدول الجديد:
     - farm_owner_varieties
       - id (uuid, primary key)
       - profile_id (uuid, references farm_owner_profiles)
       - variety_type (text)
       - variety_name (text)
       - variety_count (integer)
       - notes (text)
       - created_at (timestamptz)
       - updated_at (timestamptz)

  2. الأمان:
     - تفعيل RLS
     - سماح للـ anon بالقراءة والكتابة (للـ function)
*/

-- إنشاء الجدول إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS farm_owner_varieties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES farm_owner_profiles(id) ON DELETE CASCADE,
  variety_type text NOT NULL CHECK (variety_type IN ('نخيل', 'زيتون')),
  variety_name text NOT NULL,
  variety_count integer NOT NULL CHECK (variety_count > 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE farm_owner_varieties ENABLE ROW LEVEL SECURITY;

-- حذف الـ policies القديمة إن وجدت
DROP POLICY IF EXISTS "Public can read varieties" ON farm_owner_varieties;
DROP POLICY IF EXISTS "Public can insert varieties" ON farm_owner_varieties;
DROP POLICY IF EXISTS "Public can delete varieties" ON farm_owner_varieties;

-- سماح للـ anon بالقراءة
CREATE POLICY "Public can read varieties"
  ON farm_owner_varieties
  FOR SELECT
  TO anon
  USING (true);

-- سماح للـ anon بالإدراج (للـ function)
CREATE POLICY "Public can insert varieties"
  ON farm_owner_varieties
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- سماح للـ anon بالحذف (للـ function)
CREATE POLICY "Public can delete varieties"
  ON farm_owner_varieties
  FOR DELETE
  TO anon
  USING (true);

-- إنشاء index للأداء
CREATE INDEX IF NOT EXISTS idx_farm_owner_varieties_profile 
ON farm_owner_varieties(profile_id);