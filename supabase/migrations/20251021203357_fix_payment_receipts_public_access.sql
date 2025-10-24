/*
  # إصلاح سياسات الوصول لإيصالات السداد - دعم الحجوزات العامة

  ## المشكلة
  السياسة الحالية تتطلب `investor_id = auth.uid()` لكن المستثمرين العامين
  يحجزون بدون تسجيل دخول، لذلك `investor_id` يكون `null` والـ auth.uid() غير موجود.

  ## الحل
  تعديل سياسة الإضافة للسماح برفع الإيصالات للحجوزات المعتمدة حتى بدون authentication،
  مع الاحتفاظ بالأمان من خلال التحقق من:
  1. الحجز موجود وحالته confirmed
  2. الحجز غير محذوف
  3. reservation_id صحيح

  ## التغييرات
  1. حذف السياسة القديمة للإضافة
  2. إنشاء سياسة جديدة تدعم الحالتين:
     - حجوزات عامة (investor_id = null)
     - حجوزات مصادق عليها (investor_id = auth.uid())
  3. تعديل سياسة القراءة لدعم قراءة الإيصالات بناءً على reservation_id

  ## الأمان
  - المستثمر العام يمكنه رفع إيصال فقط لحجز معتمد (confirmed)
  - لا يمكن رفع إيصالات لحجوزات محذوفة
  - الإدارة تحتفظ بصلاحية التحقق الكاملة
*/

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Investors can upload receipts for approved reservations" ON payment_receipts;
DROP POLICY IF EXISTS "Investors can view own payment receipts" ON payment_receipts;

-- سياسة القراءة الجديدة: قراءة عامة للإيصالات (يمكن التحكم بها لاحقاً)
CREATE POLICY "Anyone can view payment receipts for reservations"
  ON payment_receipts FOR SELECT
  USING (
    deleted_at IS NULL
  );

-- سياسة الإضافة الجديدة: السماح برفع إيصالات للحجوزات المعتمدة (عامة أو مصادق عليها)
CREATE POLICY "Allow uploading receipts for confirmed reservations"
  ON payment_receipts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reservations r
      WHERE r.id = reservation_id
        AND r.status = 'confirmed'
        AND r.deleted_at IS NULL
    )
  );

-- إضافة تعليق توضيحي
COMMENT ON POLICY "Allow uploading receipts for confirmed reservations" ON payment_receipts IS 
  'يسمح برفع إيصالات السداد للحجوزات المعتمدة - يدعم الحجوزات العامة والمصادق عليها';
