/*
  # إصلاح سياسات RLS لحملات WhatsApp
  
  1. التغييرات
    - إضافة سياسة قراءة للمستخدمين المصادق عليهم
    - إضافة سياسة إنشاء للمستخدمين المصادق عليهم
    - إضافة سياسة تحديث للمستخدمين المصادق عليهم
    - إضافة سياسة حذف للمستخدمين المصادق عليهم
    
  2. الأمان
    - الوصول محدود للمستخدمين المصادق عليهم فقط
    - جميع العمليات متاحة للمشرفين النشطين
*/

-- حذف السياسة القديمة
DROP POLICY IF EXISTS "Admins can manage campaigns" ON whatsapp_broadcast_campaigns;

-- سياسة القراءة للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can read campaigns"
  ON whatsapp_broadcast_campaigns
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسة الإنشاء للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can create campaigns"
  ON whatsapp_broadcast_campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسة التحديث للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can update campaigns"
  ON whatsapp_broadcast_campaigns
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسة الحذف للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can delete campaigns"
  ON whatsapp_broadcast_campaigns
  FOR DELETE
  TO authenticated
  USING (true);
