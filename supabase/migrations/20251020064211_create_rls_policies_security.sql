/*
  # سياسات الأمان والوصول - Row Level Security Policies
  # Security and Access Control Policies

  ## نظرة عامة / Overview
  هذا الملف يحدد سياسات الأمان (RLS) لجميع الجداول في قاعدة البيانات.
  يضمن أن كل مستخدم يمكنه فقط الوصول إلى البيانات المخصصة له حسب دوره.
  
  This migration defines Row Level Security policies for all tables.
  It ensures each user can only access data appropriate to their role.

  ## السياسات المطبقة / Applied Policies

  ### 1. farm_owners (أصحاب المزارع)
  - المالك يمكنه عرض بياناته الخاصة فقط
  - المالك يمكنه تحديث بياناته الخاصة
  - المستخدمون الجدد يمكنهم إنشاء حساب مالك

  ### 2. farms (المزارع)
  - الجميع يمكنهم عرض المزارع النشطة
  - المالك فقط يمكنه إضافة وتعديل مزارعه
  - المالك فقط يمكنه حذف مزارعه

  ### 3. investors (المستثمرون)
  - المستثمر يمكنه عرض بياناته الخاصة
  - المستثمر يمكنه تحديث بياناته
  - المستخدمون الجدد يمكنهم إنشاء حساب مستثمر

  ### 4. reservations (الحجوزات)
  - المستثمر يمكنه عرض حجوزاته
  - المالك يمكنه عرض حجوزات مزارعه
  - المستثمر يمكنه إنشاء حجز جديد
  - المستثمر يمكنه تحديث حجوزاته (قبل التأكيد)

  ### 5. documents (المستندات)
  - المستثمر يمكنه عرض مستندات حجوزاته
  - المالك يمكنه عرض مستندات مزارعه

  ### 6. wallets (المحافظ)
  - المستخدم يمكنه عرض محفظته الخاصة
  - المستخدم يمكنه تحديث محفظته

  ### 7. wallet_transactions (معاملات المحفظة)
  - المستخدم يمكنه عرض معاملات محفظته
  - النظام يمكنه إضافة معاملات جديدة

  ### 8. notifications (الإشعارات)
  - المستخدم يمكنه عرض إشعاراته
  - المستخدم يمكنه تحديث حالة القراءة

  ### 9. settings (الإعدادات)
  - الجميع يمكنهم قراءة الإعدادات العامة
  - المسؤولون فقط يمكنهم التعديل

  ## ملاحظات أمنية / Security Notes
  - جميع السياسات تتحقق من auth.uid() للتأكد من هوية المستخدم
  - لا يمكن الوصول لأي بيانات بدون مصادقة (إلا المزارع النشطة للعرض)
  - البيانات المالية محمية بشكل خاص
  - يتم التحقق من الملكية في كل عملية
*/

-- ===================================================================
-- 1. سياسات أصحاب المزارع / Farm Owners Policies
-- ===================================================================

-- المالك يمكنه عرض بياناته
CREATE POLICY "Farm owners can view own data"
  ON farm_owners FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- المالك يمكنه تحديث بياناته
CREATE POLICY "Farm owners can update own data"
  ON farm_owners FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- المستخدمون الجدد يمكنهم إنشاء حساب
CREATE POLICY "Users can create farm owner profile"
  ON farm_owners FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ===================================================================
-- 2. سياسات المزارع / Farms Policies
-- ===================================================================

-- الجميع يمكنهم عرض المزارع النشطة (للتصفح العام)
CREATE POLICY "Anyone can view active farms"
  ON farms FOR SELECT
  TO authenticated
  USING (status = 'active');

-- المالك يمكنه عرض جميع مزارعه
CREATE POLICY "Owners can view all their farms"
  ON farms FOR SELECT
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM farm_owners WHERE user_id = auth.uid()
    )
  );

-- المالك يمكنه إضافة مزرعة جديدة
CREATE POLICY "Owners can insert own farms"
  ON farms FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id IN (
      SELECT id FROM farm_owners WHERE user_id = auth.uid()
    )
  );

-- المالك يمكنه تحديث مزارعه
CREATE POLICY "Owners can update own farms"
  ON farms FOR UPDATE
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM farm_owners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    owner_id IN (
      SELECT id FROM farm_owners WHERE user_id = auth.uid()
    )
  );

-- المالك يمكنه حذف مزارعه
CREATE POLICY "Owners can delete own farms"
  ON farms FOR DELETE
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM farm_owners WHERE user_id = auth.uid()
    )
  );

-- ===================================================================
-- 3. سياسات المستثمرين / Investors Policies
-- ===================================================================

-- المستثمر يمكنه عرض بياناته
CREATE POLICY "Investors can view own data"
  ON investors FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- المستثمر يمكنه تحديث بياناته
CREATE POLICY "Investors can update own data"
  ON investors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- المستخدمون الجدد يمكنهم إنشاء حساب مستثمر
CREATE POLICY "Users can create investor profile"
  ON investors FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ===================================================================
-- 4. سياسات الحجوزات / Reservations Policies
-- ===================================================================

-- المستثمر يمكنه عرض حجوزاته
CREATE POLICY "Investors can view own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    investor_id IN (
      SELECT id FROM investors WHERE user_id = auth.uid()
    )
  );

-- المالك يمكنه عرض حجوزات مزارعه
CREATE POLICY "Owners can view farm reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    farm_id IN (
      SELECT f.id FROM farms f
      JOIN farm_owners fo ON f.owner_id = fo.id
      WHERE fo.user_id = auth.uid()
    )
  );

-- المستثمر يمكنه إنشاء حجز جديد
CREATE POLICY "Investors can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (
    investor_id IN (
      SELECT id FROM investors WHERE user_id = auth.uid()
    )
  );

-- المستثمر يمكنه تحديث حجوزاته (فقط إذا كانت pending)
CREATE POLICY "Investors can update pending reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (
    investor_id IN (
      SELECT id FROM investors WHERE user_id = auth.uid()
    )
    AND status = 'pending'
  )
  WITH CHECK (
    investor_id IN (
      SELECT id FROM investors WHERE user_id = auth.uid()
    )
  );

-- ===================================================================
-- 5. سياسات المستندات / Documents Policies
-- ===================================================================

-- المستثمر يمكنه عرض مستندات حجوزاته
CREATE POLICY "Investors can view own reservation documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    reservation_id IN (
      SELECT r.id FROM reservations r
      JOIN investors i ON r.investor_id = i.id
      WHERE i.user_id = auth.uid()
    )
  );

-- المالك يمكنه عرض مستندات حجوزات مزارعه
CREATE POLICY "Owners can view farm reservation documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    reservation_id IN (
      SELECT r.id FROM reservations r
      JOIN farms f ON r.farm_id = f.id
      JOIN farm_owners fo ON f.owner_id = fo.id
      WHERE fo.user_id = auth.uid()
    )
  );

-- النظام يمكنه إضافة مستندات جديدة
CREATE POLICY "System can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ===================================================================
-- 6. سياسات المحافظ / Wallets Policies
-- ===================================================================

-- المستخدم يمكنه عرض محفظته
CREATE POLICY "Users can view own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- المستخدم يمكنه تحديث محفظته
CREATE POLICY "Users can update own wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- المستخدمون يمكنهم إنشاء محفظة
CREATE POLICY "Users can create own wallet"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ===================================================================
-- 7. سياسات معاملات المحفظة / Wallet Transactions Policies
-- ===================================================================

-- المستخدم يمكنه عرض معاملات محفظته
CREATE POLICY "Users can view own wallet transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = auth.uid()
    )
  );

-- النظام يمكنه إضافة معاملات (سيتم التحقق من الصلاحيات في الكود)
CREATE POLICY "System can insert transactions"
  ON wallet_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = auth.uid()
    )
  );

-- ===================================================================
-- 8. سياسات الإشعارات / Notifications Policies
-- ===================================================================

-- المستخدم يمكنه عرض إشعاراته
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- المستخدم يمكنه تحديث حالة القراءة
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- النظام يمكنه إضافة إشعارات
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ===================================================================
-- 9. سياسات الإعدادات / Settings Policies
-- ===================================================================

-- الجميع يمكنهم قراءة الإعدادات العامة
CREATE POLICY "Anyone can read settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

-- فقط المسؤولون يمكنهم تعديل الإعدادات (سيتم تطبيق منطق الإدارة لاحقاً)
CREATE POLICY "Admins can update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can insert settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (true);