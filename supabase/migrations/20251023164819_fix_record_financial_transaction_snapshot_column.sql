/*
  # Fix farm_revenue_snapshots Column Name

  1. Problem
    - Function uses farm_finance_id but table has farm_id
    
  2. Solution
    - Update INSERT to use correct column name
*/

CREATE OR REPLACE FUNCTION record_financial_transaction(
  p_farm_code text,
  p_transaction_type text,
  p_amount numeric,
  p_description_ar text,
  p_source_type text,
  p_source_id uuid DEFAULT NULL,
  p_source_name text DEFAULT NULL,
  p_related_reservation_id uuid DEFAULT NULL,
  p_related_investor_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id uuid;
  v_farm_finance_id uuid;
  v_current_revenue numeric;
  v_actual_amount numeric;
  v_completion_percentage numeric;
BEGIN
  -- Get farm finance ID and current revenue
  SELECT id, COALESCE(total_revenue_collected, 0), COALESCE(actual_amount, 0)
  INTO v_farm_finance_id, v_current_revenue, v_actual_amount
  FROM smart_farm_finances 
  WHERE farm_code = p_farm_code;

  IF v_farm_finance_id IS NULL THEN
    RAISE EXCEPTION 'Farm finance not found for code: %', p_farm_code;
  END IF;

  -- Insert transaction record
  INSERT INTO farm_financial_transactions (
    farm_finance_id, farm_code, transaction_type, amount, description,
    source_type, source_id, investor_name, transaction_date
  ) VALUES (
    v_farm_finance_id, p_farm_code, p_transaction_type, p_amount, p_description_ar,
    p_source_type, p_source_id, p_source_name, now()
  ) RETURNING id INTO v_transaction_id;

  -- Update smart_farm_finances if this is investor revenue
  IF p_transaction_type = 'investor_revenue' THEN
    v_current_revenue := v_current_revenue + p_amount;

    IF v_actual_amount > 0 THEN
      v_completion_percentage := (v_current_revenue / v_actual_amount) * 100;
    ELSE
      v_completion_percentage := 0;
    END IF;

    UPDATE smart_farm_finances SET 
      total_revenue_collected = v_current_revenue,
      financial_completion_percentage = v_completion_percentage,
      last_revenue_transaction_id = v_transaction_id,
      total_financial_transactions = COALESCE(total_financial_transactions, 0) + 1,
      last_transaction_date = now(),
      updated_at = now()
    WHERE farm_code = p_farm_code;

    -- Create revenue snapshot (using farm_id not farm_finance_id)
    INSERT INTO farm_revenue_snapshots (
      farm_id, farm_code, total_revenue, total_investors, total_trees_sold,
      completion_percentage, coverage_percentage, marketing_amount, actual_amount,
      remaining_amount, snapshot_reason, metadata
    )
    SELECT 
      id, farm_code, total_revenue_collected, total_investors, total_trees_sold,
      financial_completion_percentage, coverage_percentage, marketing_amount, actual_amount,
      actual_amount - total_revenue_collected, 'new_investment',
      jsonb_build_object('transaction_id', v_transaction_id)
    FROM smart_farm_finances 
    WHERE farm_code = p_farm_code;

    -- Check if farm reached 100% completion
    IF v_completion_percentage >= 100 THEN
      UPDATE smart_farm_finances SET 
        settlement_status = 'ready_for_settlement',
        completion_reached_at = now()
      WHERE farm_code = p_farm_code 
      AND settlement_status = 'collecting';

      -- Log completion event
      INSERT INTO financial_base_log (
        action_type, entity_type, entity_id, entity_code, description_ar,
        new_data, source_module, status
      ) VALUES (
        'sync_completed', 'farm', v_farm_finance_id, p_farm_code,
        'المزرعة وصلت إلى الاكتمال المالي - جاهزة للتسوية',
        jsonb_build_object(
          'completion_percentage', v_completion_percentage, 
          'total_revenue', v_current_revenue, 
          'actual_amount', v_actual_amount
        ),
        'finance', 'success'
      );
    END IF;
  END IF;

  RETURN v_transaction_id;
END;
$$;
