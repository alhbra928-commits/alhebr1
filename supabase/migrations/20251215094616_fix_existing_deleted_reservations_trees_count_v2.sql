/*
  # إصلاح البيانات الحالية - تحديث الأشجار المتاحة للحجوزات المحذوفة

  ## المشكلة
  الحجوزات التي تم حذفها سابقاً (قبل تطبيق الـ trigger الجديد) لم يتم 
  تحديث عدد الأشجار المتاحة في المزارع الخاصة بها.

  ## الحل
  مسح جميع الحجوزات المحذوفة وتحديث available_trees في المزارع المرتبطة

  ## التنفيذ
  1. حساب إجمالي الأشجار المحذوفة لكل مزرعة
  2. إضافة هذا العدد إلى available_trees
  3. تسجيل العملية في audit log
*/

-- تحديث الأشجار المتاحة لجميع المزارع التي لديها حجوزات محذوفة
DO $$
DECLARE
  v_farm_record RECORD;
  v_freed_trees INTEGER;
  v_total_farms_fixed INTEGER := 0;
  v_total_trees_freed INTEGER := 0;
BEGIN
  -- المرور على كل مزرعة لديها حجوزات محذوفة
  FOR v_farm_record IN (
    SELECT 
      f.id as farm_id,
      f.name_ar,
      f.available_trees as current_available,
      f.total_trees,
      COALESCE(SUM(r.number_of_trees), 0) as deleted_trees_count
    FROM farms f
    INNER JOIN reservations r ON r.farm_id = f.id
    WHERE f.deleted_at IS NULL
      AND r.deleted_at IS NOT NULL
    GROUP BY f.id, f.name_ar, f.available_trees, f.total_trees
    HAVING COALESCE(SUM(r.number_of_trees), 0) > 0
  )
  LOOP
    v_freed_trees := v_farm_record.deleted_trees_count;

    -- تحديث الأشجار المتاحة
    UPDATE farms
    SET
      available_trees = LEAST(
        total_trees,
        available_trees + v_freed_trees
      ),
      updated_at = NOW()
    WHERE id = v_farm_record.farm_id;

    -- تسجيل في audit log
    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      user_id,
      metadata,
      operation_timestamp
    ) VALUES (
      'farms',
      v_farm_record.farm_id,
      'UPDATE',
      NULL,
      jsonb_build_object(
        'action', 'fix_deleted_reservations_trees',
        'reason', 'Fixing existing deleted reservations',
        'farm_name', v_farm_record.name_ar,
        'trees_freed', v_freed_trees,
        'previous_available', v_farm_record.current_available,
        'new_available', LEAST(v_farm_record.total_trees, v_farm_record.current_available + v_freed_trees)
      ),
      NOW()
    );

    v_total_farms_fixed := v_total_farms_fixed + 1;
    v_total_trees_freed := v_total_trees_freed + v_freed_trees;

    RAISE NOTICE 'Fixed farm: % - Freed % trees (% -> %)',
      v_farm_record.name_ar,
      v_freed_trees,
      v_farm_record.current_available,
      LEAST(v_farm_record.total_trees, v_farm_record.current_available + v_freed_trees);
  END LOOP;

  RAISE NOTICE '✅ Completed: Fixed % farms, Freed % trees total', 
    v_total_farms_fixed, 
    v_total_trees_freed;
END $$;
