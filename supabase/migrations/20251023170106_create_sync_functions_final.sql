/*
  # إنشاء دوال المزامنة النهائية

  1. الدوال
    - sync_owner_to_finances
    - sync_investors_to_finances  
    - populate_financial_relations
*/

-- دالة مزامنة المالك
CREATE OR REPLACE FUNCTION sync_owner_to_finances()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- تحديث smart_farm_finances
  UPDATE smart_farm_finances
  SET 
    owner_id = NEW.owner_id,
    owner_name = (SELECT full_name FROM farm_owners WHERE id = NEW.owner_id),
    updated_at = now()
  WHERE farm_code = NEW.farm_code;

  -- تحديث farm_financial_relations
  UPDATE farm_financial_relations
  SET 
    owner_id = NEW.owner_id,
    owners_module_synced = true,
    owners_last_sync = now(),
    updated_at = now()
  WHERE farm_code = NEW.farm_code;

  -- تسجيل في financial_base_log
  INSERT INTO financial_base_log (
    action_type, entity_type, entity_id, entity_code,
    description_ar, source_module, status
  ) VALUES (
    'owner_synced', 'farm', NEW.id, NEW.farm_code,
    'تم ربط المزرعة بالمالك: ' || COALESCE((SELECT full_name FROM farm_owners WHERE id = NEW.owner_id), 'غير معروف'),
    'owners', 'success'
  );

  RETURN NEW;
END;
$$;

-- دالة مزامنة المستثمرين
CREATE OR REPLACE FUNCTION sync_investors_to_finances(p_farm_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_total_investors int;
  v_total_invested numeric;
  v_total_trees_sold int;
BEGIN
  SELECT id INTO v_farm_id FROM farms WHERE farm_code = p_farm_code;
  
  IF v_farm_id IS NULL THEN
    RETURN;
  END IF;

  SELECT 
    COUNT(DISTINCT investor_id),
    COALESCE(SUM(total_amount), 0),
    COALESCE(SUM(number_of_trees), 0)
  INTO v_total_investors, v_total_invested, v_total_trees_sold
  FROM reservations
  WHERE farm_id = v_farm_id
  AND booking_status = 'approved'
  AND deleted_at IS NULL;

  UPDATE smart_farm_finances
  SET 
    total_investors = v_total_investors,
    total_trees_sold = v_total_trees_sold,
    updated_at = now()
  WHERE farm_code = p_farm_code;

  UPDATE farm_financial_relations
  SET 
    total_investors = v_total_investors,
    total_invested = v_total_invested,
    total_trees_sold = v_total_trees_sold,
    investors_module_synced = true,
    investors_last_sync = now(),
    updated_at = now()
  WHERE farm_code = p_farm_code;

  INSERT INTO financial_base_log (
    action_type, entity_type, entity_id, entity_code,
    description_ar, new_data, source_module, status
  ) VALUES (
    'investors_synced', 'farm', v_farm_id, p_farm_code,
    'تم تحديث بيانات المستثمرين للمزرعة',
    jsonb_build_object(
      'total_investors', v_total_investors,
      'total_invested', v_total_invested,
      'total_trees_sold', v_total_trees_sold
    ),
    'investors', 'success'
  );
END;
$$;

-- دالة ملء جدول farm_financial_relations
CREATE OR REPLACE FUNCTION populate_financial_relations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm RECORD;
BEGIN
  FOR v_farm IN 
    SELECT 
      f.id as farm_id,
      f.farm_code,
      f.owner_id,
      f.total_trees,
      f.price_per_tree,
      f.tree_type
    FROM farms f
    WHERE NOT EXISTS (
      SELECT 1 FROM farm_financial_relations 
      WHERE farm_code = f.farm_code
    )
    AND f.deleted_at IS NULL
  LOOP
    INSERT INTO farm_financial_relations (
      farm_id, farm_code,
      farms_module_synced, farms_last_sync,
      marketing_amount, total_trees, farm_type,
      owners_module_synced, owners_last_sync,
      owner_id, actual_amount,
      created_at, updated_at
    ) VALUES (
      v_farm.farm_id, v_farm.farm_code,
      true, now(),
      v_farm.total_trees * v_farm.price_per_tree, 
      v_farm.total_trees,
      v_farm.tree_type,
      v_farm.owner_id IS NOT NULL, 
      CASE WHEN v_farm.owner_id IS NOT NULL THEN now() ELSE NULL END,
      v_farm.owner_id,
      v_farm.total_trees * v_farm.price_per_tree,
      now(), now()
    );

    PERFORM sync_investors_to_finances(v_farm.farm_code);
  END LOOP;
END;
$$;

-- Trigger لمزامنة المالك
DROP TRIGGER IF EXISTS trigger_sync_owner_to_finances ON farms;
CREATE TRIGGER trigger_sync_owner_to_finances
AFTER UPDATE OF owner_id ON farms
FOR EACH ROW
WHEN (NEW.owner_id IS NOT NULL AND (OLD.owner_id IS NULL OR OLD.owner_id != NEW.owner_id))
EXECUTE FUNCTION sync_owner_to_finances();
