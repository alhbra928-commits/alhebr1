/*
  # إضافة خاصية رفع الشعار للودر

  1. التغييرات:
    - إضافة عمود `logo_url` لحفظ رابط الشعار
    - إضافة عمود `auto_enter` للدخول التلقائي
    - إضافة عمود `logo_animation` لحركة الشعار

  2. Storage:
    - إنشاء bucket للشعارات
    - سياسات الأمان
*/

-- إضافة الأعمدة إذا لم تكن موجودة
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loader_settings' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE loader_settings ADD COLUMN logo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loader_settings' AND column_name = 'auto_enter'
  ) THEN
    ALTER TABLE loader_settings ADD COLUMN auto_enter boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loader_settings' AND column_name = 'logo_animation'
  ) THEN
    ALTER TABLE loader_settings ADD COLUMN logo_animation text DEFAULT 'pulse' 
      CHECK (logo_animation IN ('none', 'bounce', 'spin', 'pulse', 'float'));
  END IF;
END $$;

-- إنشاء bucket للشعارات إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public)
VALUES ('loader-logos', 'loader-logos', true)
ON CONFLICT (id) DO NOTHING;

-- حذف السياسات القديمة إذا كانت موجودة
DROP POLICY IF EXISTS "Admins can upload loader logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view loader logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete loader logos" ON storage.objects;

-- سياسة رفع الشعارات (مفتوحة مؤقتاً للاختبار - يمكن تقييدها لاحقاً)
CREATE POLICY "Anyone can upload loader logos"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'loader-logos');

-- سياسة القراءة العامة للشعارات
CREATE POLICY "Anyone can read loader logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'loader-logos');

-- سياسة الحذف للمسؤولين
CREATE POLICY "Authenticated can delete loader logos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'loader-logos');
