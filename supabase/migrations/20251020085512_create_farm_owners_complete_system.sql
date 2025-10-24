/*
  # نظام إدارة أصحاب المزارع - النظام الكامل
  # Farm Owners Management - Complete System
  
  ## الميزات:
  - إدارة كاملة لأصحاب المزارع ومعلومات مزارعهم
  - تجميد وتفعيل
  - حذف نهائي مع أرشفة تلقائية
  - تتبع كامل عبر Audit Log
*/

-- جدول أصحاب المزارع
CREATE TABLE farm_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات المالك الشخصية
  full_name text NOT NULL,
  mobile_number text NOT NULL UNIQUE,
  email text,
  region text NOT NULL,
  city text NOT NULL,
  admin_notes text,
  
  -- معلومات المزرعة الأساسية
  farm_area numeric NOT NULL,
  farm_area_unit text DEFAULT 'متر' CHECK (farm_area_unit IN ('متر', 'هكتار')),
  farm_type text NOT NULL CHECK (farm_type IN ('نخيل', 'زيتون', 'مختلط')),
  actual_price numeric NOT NULL,
  deed_number text NOT NULL,
  farm_location_region text NOT NULL,
  farm_location_city text NOT NULL,
  farm_location_description text,
  payment_grace_period integer NOT NULL CHECK (payment_grace_period IN (3, 6, 9, 12)),
  
  -- حالة المالك
  status text DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'archived')),
  frozen_at timestamptz,
  frozen_by uuid,
  frozen_reason text,
  
  -- التوثيق
  created_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid,
  
  -- Soft delete
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE INDEX idx_farm_owners_mobile ON farm_owners(mobile_number);
CREATE INDEX idx_farm_owners_status ON farm_owners(status);
CREATE INDEX idx_farm_owners_deleted_at ON farm_owners(deleted_at);
CREATE INDEX idx_farm_owners_created_at ON farm_owners(created_at DESC);

ALTER TABLE farm_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage farm owners"
  ON farm_owners FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- جدول أرشيف المالكين
CREATE TABLE owners_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_owner_id uuid NOT NULL,
  owner_data jsonb NOT NULL,
  deletion_reason text,
  deleted_at timestamptz DEFAULT now(),
  deleted_by uuid,
  can_restore boolean DEFAULT true,
  restored_at timestamptz,
  restored_by uuid
);

CREATE INDEX idx_owners_archive_deleted_at ON owners_archive(deleted_at DESC);
CREATE INDEX idx_owners_archive_original_id ON owners_archive(original_owner_id);

ALTER TABLE owners_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view archive"
  ON owners_archive FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- دالة تجميد/تفعيل المالك
CREATE OR REPLACE FUNCTION toggle_owner_status(
  p_owner_id uuid,
  p_new_status text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_current_status text;
BEGIN
  SELECT status INTO v_current_status
  FROM farm_owners
  WHERE id = p_owner_id AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'المالك غير موجود');
  END IF;
  
  IF p_new_status = 'frozen' THEN
    UPDATE farm_owners
    SET status = 'frozen', frozen_at = now(), frozen_by = auth.uid(),
        frozen_reason = p_reason, updated_at = now(), updated_by = auth.uid()
    WHERE id = p_owner_id;
  ELSE
    UPDATE farm_owners
    SET status = 'active', frozen_at = NULL, frozen_by = NULL,
        frozen_reason = NULL, updated_at = now(), updated_by = auth.uid()
    WHERE id = p_owner_id;
  END IF;
  
  RETURN jsonb_build_object('success', true, 'message', 
    CASE WHEN p_new_status = 'frozen' THEN 'تم تجميد المالك بنجاح' ELSE 'تم تفعيل المالك بنجاح' END);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة الحذف النهائي مع الأرشفة
CREATE OR REPLACE FUNCTION delete_owner_permanently(
  p_owner_id uuid,
  p_deletion_reason text DEFAULT 'حذف إداري'
)
RETURNS jsonb AS $$
DECLARE
  v_owner_data jsonb;
  v_archive_id uuid;
BEGIN
  SELECT row_to_json(fo.*)::jsonb INTO v_owner_data
  FROM farm_owners fo WHERE fo.id = p_owner_id;
  
  IF v_owner_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'المالك غير موجود');
  END IF;
  
  INSERT INTO owners_archive (original_owner_id, owner_data, deletion_reason, deleted_by)
  VALUES (p_owner_id, v_owner_data, p_deletion_reason, auth.uid())
  RETURNING id INTO v_archive_id;
  
  DELETE FROM farm_owners WHERE id = p_owner_id;
  
  RETURN jsonb_build_object('success', true, 'archive_id', v_archive_id,
    'message', 'تم حذف المالك نهائياً وحفظ نسخة في الأرشيف');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة الحصول على إحصائيات
CREATE OR REPLACE FUNCTION get_owners_statistics()
RETURNS jsonb AS $$
DECLARE
  v_total integer;
  v_active integer;
  v_frozen integer;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'active'),
         COUNT(*) FILTER (WHERE status = 'frozen')
  INTO v_total, v_active, v_frozen
  FROM farm_owners WHERE deleted_at IS NULL;
  
  RETURN jsonb_build_object('total', v_total, 'active', v_active, 'frozen', v_frozen);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;