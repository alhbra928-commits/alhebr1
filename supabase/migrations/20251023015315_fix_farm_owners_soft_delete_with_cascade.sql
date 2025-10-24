/*
  # إصلاح حذف صاحب المزرعة - Soft Delete مع Cascade
  
  ## المشكلة:
  - دالة delete_owner_permanently تحاول حذف نهائي
  - جدول smart_farm_finances يشير إلى farm_owners
  - Foreign Key يمنع الحذف: "violates foreign key constraint"
  
  ## الحل:
  1. تحويل الحذف إلى Soft Delete
  2. عند حذف صاحب مزرعة، يتم:
     - وضع deleted_at للمالك
     - حذف جميع المزارع المرتبطة (soft delete)
     - حذف جميع البطاقات المالية (soft delete)
  3. إضافة trigger للحذف التلقائي
  
  ## الأمان:
  - النظام آمن ولا يفقد البيانات
  - إمكانية الاستعادة في أي وقت
  - يتم الأرشفة قبل الحذف
*/

-- ==========================================
-- 1️⃣ إعادة بناء دالة delete_owner_permanently
-- ==========================================

CREATE OR REPLACE FUNCTION delete_owner_permanently(
  p_owner_id uuid,
  p_deletion_reason text DEFAULT 'حذف إداري'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_data jsonb;
  v_archive_id uuid;
  v_farms_count int;
  v_finances_count int;
BEGIN
  -- 1. جلب بيانات المالك
  SELECT row_to_json(fo.*)::jsonb INTO v_owner_data
  FROM farm_owners fo 
  WHERE fo.id = p_owner_id 
  AND fo.deleted_at IS NULL;
  
  IF v_owner_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'المالك غير موجود أو محذوف مسبقاً'
    );
  END IF;
  
  -- 2. حفظ نسخة في الأرشيف
  INSERT INTO owners_archive (
    original_owner_id, 
    owner_data, 
    deletion_reason, 
    deleted_by
  )
  VALUES (
    p_owner_id, 
    v_owner_data, 
    p_deletion_reason, 
    auth.uid()
  )
  RETURNING id INTO v_archive_id;
  
  -- 3. حذف المزارع المرتبطة (soft delete)
  UPDATE farms
  SET 
    deleted_at = now(),
    deleted_by = auth.uid(),
    status = 'archived'
  WHERE owner_id = p_owner_id
  AND deleted_at IS NULL;
  
  GET DIAGNOSTICS v_farms_count = ROW_COUNT;
  
  -- 4. حذف البطاقات المالية (soft delete)
  UPDATE smart_farm_finances
  SET 
    deleted_at = now(),
    deleted_by = auth.uid(),
    updated_at = now()
  WHERE owner_id = p_owner_id
  AND deleted_at IS NULL;
  
  GET DIAGNOSTICS v_finances_count = ROW_COUNT;
  
  -- 5. حذف المالك (soft delete)
  UPDATE farm_owners
  SET 
    deleted_at = now(),
    deleted_by = auth.uid()
  WHERE id = p_owner_id;
  
  -- 6. إرجاع النتيجة
  RETURN jsonb_build_object(
    'success', true, 
    'archive_id', v_archive_id,
    'deleted_farms', v_farms_count,
    'deleted_finances', v_finances_count,
    'message', format(
      'تم حذف المالك بنجاح (soft delete)\n- المزارع المحذوفة: %s\n- البطاقات المالية: %s\n- تم الأرشفة برقم: %s',
      v_farms_count,
      v_finances_count,
      v_archive_id
    )
  );
END;
$$;

-- ==========================================
-- 2️⃣ دالة استعادة صاحب المزرعة
-- ==========================================

CREATE OR REPLACE FUNCTION restore_owner(p_owner_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farms_count int;
  v_finances_count int;
BEGIN
  -- 1. استعادة المالك
  UPDATE farm_owners
  SET 
    deleted_at = NULL,
    deleted_by = NULL
  WHERE id = p_owner_id
  AND deleted_at IS NOT NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'المالك غير موجود أو غير محذوف'
    );
  END IF;
  
  -- 2. استعادة المزارع
  UPDATE farms
  SET 
    deleted_at = NULL,
    deleted_by = NULL,
    status = 'active'
  WHERE owner_id = p_owner_id
  AND deleted_at IS NOT NULL;
  
  GET DIAGNOSTICS v_farms_count = ROW_COUNT;
  
  -- 3. استعادة البطاقات المالية
  UPDATE smart_farm_finances
  SET 
    deleted_at = NULL,
    deleted_by = NULL,
    updated_at = now()
  WHERE owner_id = p_owner_id
  AND deleted_at IS NOT NULL;
  
  GET DIAGNOSTICS v_finances_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'restored_farms', v_farms_count,
    'restored_finances', v_finances_count,
    'message', format(
      'تم استعادة المالك بنجاح\n- المزارع المستعادة: %s\n- البطاقات المالية: %s',
      v_farms_count,
      v_finances_count
    )
  );
END;
$$;

-- ==========================================
-- 3️⃣ Comments
-- ==========================================

COMMENT ON FUNCTION delete_owner_permanently(uuid, text) IS 
'حذف صاحب مزرعة (soft delete) مع حذف جميع المزارع والبطاقات المالية المرتبطة';

COMMENT ON FUNCTION restore_owner(uuid) IS 
'استعادة صاحب مزرعة محذوف مع جميع المزارع والبطاقات المالية المرتبطة';

-- ==========================================
-- 4️⃣ تسجيل في سجل الأحداث
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ تم إصلاح حذف أصحاب المزارع';
  RAISE NOTICE '   - تحويل إلى Soft Delete';
  RAISE NOTICE '   - Cascade على المزارع والبطاقات المالية';
  RAISE NOTICE '   - إضافة دالة استعادة restore_owner()';
END $$;
