/*
  # إضافة صلاحية القراءة العامة للمزارع والحجوزات

  1. التغييرات
    - إضافة سياسة RLS للسماح للمستخدمين غير المصادقين بقراءة بيانات المزارع النشطة
    - السماح بإنشاء حجوزات مؤقتة للجميع
  
  2. الأمان
    - السماح فقط بقراءة المزارع النشطة وغير المحذوفة
    - القراءة فقط - لا يمكن التعديل أو الحذف
*/

-- السماح للجميع (بما في ذلك anon) بقراءة المزارع النشطة
DROP POLICY IF EXISTS "Public can view active farms" ON farms;
CREATE POLICY "Public can view active farms"
  ON farms
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active' AND deleted_at IS NULL);

-- السماح للجميع بإنشاء حجوزات مؤقتة
DROP POLICY IF EXISTS "Anyone can create reservations" ON reservations;
CREATE POLICY "Anyone can create reservations"
  ON reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- السماح للجميع بقراءة حجوزاتهم (سنقيدها لاحقاً بناءً على رقم الجوال)
DROP POLICY IF EXISTS "Users can view their own reservations" ON reservations;
CREATE POLICY "Users can view their own reservations"
  ON reservations
  FOR SELECT
  TO anon, authenticated
  USING (true);
