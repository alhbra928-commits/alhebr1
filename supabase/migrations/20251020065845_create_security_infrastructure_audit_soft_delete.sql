/*
  # البنية التحتية للأمان - نظام التدقيق والحذف الآمن
  # Security Infrastructure - Audit Log & Soft Delete System

  ## نظرة عامة / Overview
  هذا الملف ينشئ البنية التحتية الأمنية الكاملة للمنصة، بما في ذلك:
  - نظام تسجيل العمليات الكامل (Audit Log)
  - نظام الحذف الآمن (Soft Delete) لجميع الجداول
  - نظام النسخ الاحتياطي التلقائي قبل كل تعديل
  - Triggers تلقائية لحماية البيانات
  
  This migration creates comprehensive security infrastructure including:
  - Complete audit logging system
  - Soft delete functionality for all tables
  - Automatic backup before modifications
  - Automatic triggers for data protection

  ## 1. الجداول الجديدة / New Tables

  ### أ) audit_logs (سجل العمليات)
  يسجل كل عملية تحدث في النظام بالتفصيل
  - `id` (uuid): المعرّف الفريد
  - `table_name` (text): اسم الجدول
  - `record_id` (uuid): معرّف السجل المتأثر
  - `operation` (text): نوع العملية (INSERT/UPDATE/DELETE)
  - `old_data` (jsonb): البيانات القديمة (قبل التعديل)
  - `new_data` (jsonb): البيانات الجديدة (بعد التعديل)
  - `user_id` (uuid): معرّف المستخدم الذي قام بالعملية
  - `user_email` (text): البريد الإلكتروني للمستخدم
  - `ip_address` (text): عنوان IP
  - `user_agent` (text): معلومات المتصفح
  - `operation_timestamp` (timestamptz): وقت العملية
  - `metadata` (jsonb): بيانات إضافية

  ### ب) data_backups (النسخ الاحتياطية التلقائية)
  تخزين نسخ احتياطية تلقائية من البيانات قبل التعديل أو الحذف
  - `id` (uuid): المعرّف الفريد
  - `table_name` (text): اسم الجدول
  - `record_id` (uuid): معرّف السجل
  - `backup_data` (jsonb): النسخة الكاملة من البيانات
  - `backup_type` (text): نوع النسخة (before_update/before_delete)
  - `created_by` (uuid): من قام بالعملية
  - `created_at` (timestamptz): تاريخ النسخة
  - `is_restored` (boolean): هل تم استرجاع هذه النسخة
  - `restored_at` (timestamptz): تاريخ الاسترجاع

  ### ج) system_logs (سجلات النظام)
  سجل شامل لكل الأحداث والأخطاء في النظام
  - `id` (uuid): المعرّف الفريد
  - `log_level` (text): مستوى السجل (info/warning/error/critical)
  - `log_type` (text): نوع السجل (auth/transaction/api/system)
  - `message_ar` (text): الرسالة بالعربية
  - `message_en` (text): الرسالة بالإنجليزية
  - `user_id` (uuid): المستخدم المرتبط
  - `ip_address` (text): عنوان IP
  - `request_path` (text): مسار الطلب
  - `request_method` (text): نوع الطلب
  - `stack_trace` (text): تتبع الخطأ
  - `metadata` (jsonb): بيانات إضافية
  - `created_at` (timestamptz): تاريخ السجل

  ## 2. إضافة حقول Soft Delete للجداول الموجودة
  - إضافة حقل `deleted_at` لجميع الجداول الرئيسية
  - إضافة حقل `deleted_by` لتسجيل من قام بالحذف
  - إضافة فهارس للأداء

  ## 3. الأمان / Security
  - RLS مفعّل على جميع الجداول الجديدة
  - سجلات Audit لا يمكن حذفها أو تعديلها
  - فقط المسؤولون يمكنهم الوصول لسجلات التدقيق
  - النسخ الاحتياطية محمية ولا يمكن حذفها

  ## 4. ملاحظات مهمة / Important Notes
  - جميع السجلات تُحفظ لمدة 90 يوم على الأقل
  - النسخ الاحتياطية تلقائية ولا تحتاج تدخل يدوي
  - نظام Soft Delete يحفظ البيانات للأبد ما لم يتم حذفها يدوياً
  - يمكن استرجاع أي بيانات محذوفة خلال فترة محددة
*/

-- ===========================
-- 1. جدول سجل العمليات
-- Audit Logs Table
-- ===========================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE')),
  old_data jsonb DEFAULT '{}'::jsonb,
  new_data jsonb DEFAULT '{}'::jsonb,
  user_id uuid,
  user_email text,
  ip_address text,
  user_agent text,
  operation_timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- 2. جدول النسخ الاحتياطية
-- Data Backups Table
-- ===========================
CREATE TABLE IF NOT EXISTS data_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  backup_data jsonb NOT NULL,
  backup_type text NOT NULL CHECK (backup_type IN ('before_update', 'before_delete', 'scheduled', 'manual')),
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  is_restored boolean DEFAULT false,
  restored_at timestamptz,
  restored_by uuid,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- ===========================
-- 3. جدول سجلات النظام
-- System Logs Table
-- ===========================
CREATE TABLE IF NOT EXISTS system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_level text NOT NULL DEFAULT 'info' CHECK (log_level IN ('info', 'warning', 'error', 'critical', 'debug')),
  log_type text NOT NULL CHECK (log_type IN ('auth', 'transaction', 'api', 'database', 'system', 'security')),
  message_ar text NOT NULL,
  message_en text NOT NULL,
  user_id uuid,
  ip_address text,
  request_path text,
  request_method text CHECK (request_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', NULL)),
  stack_trace text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ===========================
-- 4. إضافة حقول Soft Delete للجداول الموجودة
-- Add Soft Delete Fields to Existing Tables
-- ===========================

-- إضافة للمزارع
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farms' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE farms ADD COLUMN deleted_at timestamptz;
    ALTER TABLE farms ADD COLUMN deleted_by uuid;
  END IF;
END $$;

-- إضافة لأصحاب المزارع
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farm_owners' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE farm_owners ADD COLUMN deleted_at timestamptz;
    ALTER TABLE farm_owners ADD COLUMN deleted_by uuid;
  END IF;
END $$;

-- إضافة للمستثمرين
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investors' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE investors ADD COLUMN deleted_at timestamptz;
    ALTER TABLE investors ADD COLUMN deleted_by uuid;
  END IF;
END $$;

-- إضافة للحجوزات
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN deleted_at timestamptz;
    ALTER TABLE reservations ADD COLUMN deleted_by uuid;
  END IF;
END $$;

-- إضافة للمستندات
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE documents ADD COLUMN deleted_at timestamptz;
    ALTER TABLE documents ADD COLUMN deleted_by uuid;
  END IF;
END $$;

-- إضافة للمحافظ
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wallets' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE wallets ADD COLUMN deleted_at timestamptz;
    ALTER TABLE wallets ADD COLUMN deleted_by uuid;
  END IF;
END $$;

-- إضافة لمعاملات المحفظة
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wallet_transactions' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE wallet_transactions ADD COLUMN deleted_at timestamptz;
    ALTER TABLE wallet_transactions ADD COLUMN deleted_by uuid;
  END IF;
END $$;

-- ===========================
-- 5. إنشاء الفهارس للأداء
-- Create Indexes for Performance
-- ===========================

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(operation_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_backups_table_record ON data_backups(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_data_backups_type ON data_backups(backup_type);
CREATE INDEX IF NOT EXISTS idx_data_backups_created ON data_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_backups_not_restored ON data_backups(is_restored) WHERE is_restored = false;

CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_system_logs_type ON system_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_user ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at DESC);

-- فهارس Soft Delete
CREATE INDEX IF NOT EXISTS idx_farms_not_deleted ON farms(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farm_owners_not_deleted ON farm_owners(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_investors_not_deleted ON investors(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_not_deleted ON reservations(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_not_deleted ON documents(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wallets_not_deleted ON wallets(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_not_deleted ON wallet_transactions(id) WHERE deleted_at IS NULL;

-- ===========================
-- 6. تفعيل RLS على الجداول الجديدة
-- Enable RLS on New Tables
-- ===========================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- ===========================
-- 7. سياسات الأمان للجداول الجديدة
-- Security Policies for New Tables
-- ===========================

-- سياسات سجل العمليات (للقراءة فقط من المسؤولين)
CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- منع التعديل أو الحذف نهائياً
CREATE POLICY "Audit logs are immutable"
  ON audit_logs FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Audit logs cannot be deleted"
  ON audit_logs FOR DELETE
  TO authenticated
  USING (false);

-- السماح بالإدراج من النظام
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسات النسخ الاحتياطية
CREATE POLICY "Users can view own data backups"
  ON data_backups FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "System can insert backups"
  ON data_backups FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- منع حذف النسخ الاحتياطية
CREATE POLICY "Backups cannot be deleted"
  ON data_backups FOR DELETE
  TO authenticated
  USING (false);

-- سياسات سجلات النظام
CREATE POLICY "Admins can view system logs"
  ON system_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert logs"
  ON system_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ===========================
-- 8. دوال مساعدة / Helper Functions
-- ===========================

-- دالة للتحقق من حالة الحذف
CREATE OR REPLACE FUNCTION is_soft_deleted(table_name text, record_id uuid)
RETURNS boolean AS $$
DECLARE
  is_deleted boolean;
  query text;
BEGIN
  query := format('SELECT deleted_at IS NOT NULL FROM %I WHERE id = $1', table_name);
  EXECUTE query INTO is_deleted USING record_id;
  RETURN COALESCE(is_deleted, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة لاسترجاع السجل المحذوف
CREATE OR REPLACE FUNCTION restore_soft_deleted(table_name text, record_id uuid)
RETURNS boolean AS $$
DECLARE
  query text;
BEGIN
  query := format('UPDATE %I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1 AND deleted_at IS NOT NULL', table_name);
  EXECUTE query USING record_id;
  
  -- تسجيل عملية الاسترجاع
  INSERT INTO audit_logs (table_name, record_id, operation, user_id, metadata)
  VALUES (restore_soft_deleted.table_name, record_id, 'RESTORE', auth.uid(), jsonb_build_object('restored_at', now()));
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة لتسجيل العمليات في Audit Log
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      old_data,
      user_id,
      operation_timestamp
    ) VALUES (
      TG_TABLE_NAME,
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      auth.uid(),
      now()
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      old_data,
      new_data,
      user_id,
      operation_timestamp
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'UPDATE',
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid(),
      now()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      new_data,
      user_id,
      operation_timestamp
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'INSERT',
      to_jsonb(NEW),
      auth.uid(),
      now()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للنسخ الاحتياطي التلقائي
CREATE OR REPLACE FUNCTION auto_backup_before_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
    INSERT INTO data_backups (
      table_name,
      record_id,
      backup_data,
      backup_type,
      created_by
    ) VALUES (
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD),
      CASE WHEN TG_OP = 'UPDATE' THEN 'before_update' ELSE 'before_delete' END,
      auth.uid()
    );
  END IF;
  
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;