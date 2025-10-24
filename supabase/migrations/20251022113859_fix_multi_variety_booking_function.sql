/*
  # Fix Multi-Variety Booking Function

  1. Issue Fixed
    - Column name error: 'name' -> 'full_name' in investors table
    - Updated function to use correct column names
    
  2. Changes
    - Use 'full_name' instead of 'name' for investor creation
    - All other logic remains the same
*/

-- Drop and recreate the function with correct column names
DROP FUNCTION IF EXISTS create_multi_variety_reservation(uuid, text, text, jsonb, integer, numeric);

CREATE OR REPLACE FUNCTION create_multi_variety_reservation(
  p_farm_id uuid,
  p_investor_name text,
  p_investor_phone text,
  p_varieties jsonb,
  p_total_trees integer,
  p_total_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_investor_id uuid;
  v_reservation_id uuid;
  v_variety_item jsonb;
  v_items_created integer := 0;
  v_farm_tree_type text;
BEGIN
  -- 1. Get farm tree type
  SELECT tree_type INTO v_farm_tree_type
  FROM farms
  WHERE id = p_farm_id
  AND deleted_at IS NULL;

  IF v_farm_tree_type IS NULL THEN
    RAISE EXCEPTION 'Farm not found or deleted';
  END IF;

  -- 2. Get or create investor
  SELECT id INTO v_investor_id
  FROM investors
  WHERE phone = p_investor_phone
  AND deleted_at IS NULL
  LIMIT 1;

  IF v_investor_id IS NULL THEN
    INSERT INTO investors (
      full_name,
      phone,
      status,
      total_invested,
      total_trees_owned,
      created_at,
      updated_at
    ) VALUES (
      p_investor_name,
      p_investor_phone,
      'نشط',
      0,
      0,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_investor_id;
  END IF;

  -- 3. Create reservation
  INSERT INTO reservations (
    id,
    farm_id,
    investor_id,
    customer_name,
    customer_phone,
    tree_type,
    number_of_trees,
    price_per_tree,
    total_amount,
    status,
    payment_status,
    reservation_date,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_farm_id,
    v_investor_id,
    p_investor_name,
    p_investor_phone,
    v_farm_tree_type,
    p_total_trees,
    ROUND(p_total_amount / p_total_trees, 2),
    p_total_amount,
    'قيد المراجعة',
    'في انتظار الدفع',
    NOW(),
    NOW(),
    NOW()
  )
  RETURNING id INTO v_reservation_id;

  -- 4. Create booking_items for each variety
  FOR v_variety_item IN SELECT * FROM jsonb_array_elements(p_varieties)
  LOOP
    INSERT INTO booking_items (
      id,
      reservation_id,
      variety_id,
      quantity,
      price_per_tree,
      subtotal,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_reservation_id,
      (v_variety_item->>'variety_id')::uuid,
      (v_variety_item->>'tree_count')::integer,
      (v_variety_item->>'price_per_tree')::numeric,
      (v_variety_item->>'tree_count')::integer * (v_variety_item->>'price_per_tree')::numeric,
      NOW(),
      NOW()
    );
    
    v_items_created := v_items_created + 1;
  END LOOP;

  -- 5. Return success response
  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'investor_id', v_investor_id,
    'booking_items_count', v_items_created,
    'message', 'تم إنشاء الحجز بنجاح'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'خطأ في إنشاء الحجز: %', SQLERRM;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_multi_variety_reservation(uuid, text, text, jsonb, integer, numeric) TO anon;
GRANT EXECUTE ON FUNCTION create_multi_variety_reservation(uuid, text, text, jsonb, integer, numeric) TO authenticated;

COMMENT ON FUNCTION create_multi_variety_reservation IS 'Creates complete reservation with multiple varieties - FIXED version with correct column names';
