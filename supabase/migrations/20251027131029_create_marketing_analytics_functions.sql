/*
  # دوال نظام التحليل التسويقي

  ## الدوال:
  1. aggregate_daily_traffic - تجميع بيانات الزيارات اليومية
  2. aggregate_daily_pages - تجميع بيانات الصفحات اليومية
  3. get_marketing_dashboard_stats - إحصائيات لوحة التحكم
  4. test_platform_connection - اختبار اتصال المنصة
  5. track_visitor - تسجيل زيارة جديدة
*/

-- دالة تجميع بيانات الزيارات اليومية
CREATE OR REPLACE FUNCTION aggregate_daily_traffic(target_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- حذف البيانات القديمة لنفس اليوم (لإعادة الحساب)
  DELETE FROM traffic_sources_daily WHERE date = target_date;
  
  -- تجميع البيانات لكل مصدر
  INSERT INTO traffic_sources_daily (
    date,
    traffic_source,
    total_visits,
    unique_visitors,
    total_page_views,
    avg_time_on_site,
    bounce_rate,
    devices_breakdown
  )
  SELECT
    target_date,
    COALESCE(traffic_source, 'direct') as traffic_source,
    COUNT(*) as total_visits,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    COUNT(*) as total_page_views,
    AVG(time_on_page)::integer as avg_time_on_site,
    NULL as bounce_rate, -- يُحسب لاحقاً
    jsonb_build_object(
      'mobile', COUNT(*) FILTER (WHERE device_type = 'mobile'),
      'tablet', COUNT(*) FILTER (WHERE device_type = 'tablet'),
      'desktop', COUNT(*) FILTER (WHERE device_type = 'desktop')
    ) as devices_breakdown
  FROM visitor_analytics
  WHERE visited_at::date = target_date
  GROUP BY traffic_source;
END;
$$;

-- دالة تجميع بيانات الصفحات اليومية
CREATE OR REPLACE FUNCTION aggregate_daily_pages(target_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- حذف البيانات القديمة لنفس اليوم
  DELETE FROM page_analytics_daily WHERE date = target_date;
  
  -- تجميع البيانات لكل صفحة
  INSERT INTO page_analytics_daily (
    date,
    page_url,
    page_title,
    total_views,
    unique_visitors,
    avg_time_on_page,
    avg_scroll_depth,
    total_clicks,
    sources_breakdown
  )
  SELECT
    target_date,
    page_url,
    MAX(page_title) as page_title,
    COUNT(*) as total_views,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    AVG(time_on_page)::integer as avg_time_on_page,
    AVG(scroll_depth)::integer as avg_scroll_depth,
    SUM(clicks_count) as total_clicks,
    jsonb_object_agg(
      COALESCE(traffic_source, 'direct'),
      COUNT(*)
    ) FILTER (WHERE traffic_source IS NOT NULL) as sources_breakdown
  FROM visitor_analytics
  WHERE visited_at::date = target_date
  GROUP BY page_url;
END;
$$;

-- دالة الحصول على إحصائيات لوحة التحكم
CREATE OR REPLACE FUNCTION get_marketing_dashboard_stats(
  p_start_date date DEFAULT CURRENT_DATE - 30,
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_visitors', (
      SELECT COUNT(DISTINCT visitor_id)
      FROM visitor_analytics
      WHERE visited_at::date BETWEEN p_start_date AND p_end_date
    ),
    'total_visits', (
      SELECT COUNT(*)
      FROM visitor_analytics
      WHERE visited_at::date BETWEEN p_start_date AND p_end_date
    ),
    'total_page_views', (
      SELECT COUNT(*)
      FROM visitor_analytics
      WHERE visited_at::date BETWEEN p_start_date AND p_end_date
    ),
    'avg_time_on_site', (
      SELECT AVG(time_on_page)::integer
      FROM visitor_analytics
      WHERE visited_at::date BETWEEN p_start_date AND p_end_date
    ),
    'sources_breakdown', (
      SELECT jsonb_object_agg(
        COALESCE(traffic_source, 'direct'),
        count
      )
      FROM (
        SELECT 
          traffic_source,
          COUNT(*) as count
        FROM visitor_analytics
        WHERE visited_at::date BETWEEN p_start_date AND p_end_date
        GROUP BY traffic_source
      ) t
    ),
    'top_pages', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'url', page_url,
          'title', page_title,
          'views', views
        )
        ORDER BY views DESC
      )
      FROM (
        SELECT 
          page_url,
          MAX(page_title) as page_title,
          COUNT(*) as views
        FROM visitor_analytics
        WHERE visited_at::date BETWEEN p_start_date AND p_end_date
        GROUP BY page_url
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) t
    ),
    'daily_trend', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', visit_date,
          'visits', visits
        )
        ORDER BY visit_date
      )
      FROM (
        SELECT 
          visited_at::date as visit_date,
          COUNT(*) as visits
        FROM visitor_analytics
        WHERE visited_at::date BETWEEN p_start_date AND p_end_date
        GROUP BY visited_at::date
        ORDER BY visited_at::date
      ) t
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- دالة اختبار اتصال المنصة
CREATE OR REPLACE FUNCTION test_platform_connection(
  p_platform text,
  p_admin_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_time timestamptz;
  v_end_time timestamptz;
  v_response_time integer;
  v_connection record;
  v_result jsonb;
BEGIN
  v_start_time := clock_timestamp();
  
  -- الحصول على معلومات الاتصال
  SELECT * INTO v_connection
  FROM marketing_platform_connections
  WHERE platform = p_platform;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Platform not configured'
    );
  END IF;
  
  -- محاكاة فحص الاتصال (في الإنتاج، هنا يتم استدعاء API)
  -- لأغراض التطوير، نفترض النجاح إذا كانت المفاتيح موجودة
  v_end_time := clock_timestamp();
  v_response_time := EXTRACT(MILLISECONDS FROM (v_end_time - v_start_time))::integer;
  
  IF v_connection.api_key IS NOT NULL OR v_connection.pixel_id IS NOT NULL THEN
    -- تحديث حالة الاتصال
    UPDATE marketing_platform_connections
    SET 
      connection_status = 'connected',
      last_checked_at = now(),
      last_error = NULL
    WHERE platform = p_platform;
    
    -- تسجيل في السجل
    INSERT INTO connection_health_log (
      platform,
      status,
      response_time,
      checked_by
    ) VALUES (
      p_platform,
      'success',
      v_response_time,
      p_admin_id
    );
    
    v_result := jsonb_build_object(
      'success', true,
      'status', 'connected',
      'response_time', v_response_time,
      'message', 'Connection successful'
    );
  ELSE
    -- فشل الاتصال
    UPDATE marketing_platform_connections
    SET 
      connection_status = 'disconnected',
      last_checked_at = now(),
      last_error = 'Missing API credentials'
    WHERE platform = p_platform;
    
    INSERT INTO connection_health_log (
      platform,
      status,
      error_message,
      checked_by
    ) VALUES (
      p_platform,
      'failed',
      'Missing API credentials',
      p_admin_id
    );
    
    v_result := jsonb_build_object(
      'success', false,
      'status', 'disconnected',
      'error', 'Missing API credentials'
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- دالة تسجيل زيارة (للاستخدام من الواجهة)
CREATE OR REPLACE FUNCTION track_visitor(
  p_session_id text,
  p_page_url text,
  p_page_title text DEFAULT NULL,
  p_referrer_url text DEFAULT NULL,
  p_utm_source text DEFAULT NULL,
  p_utm_medium text DEFAULT NULL,
  p_utm_campaign text DEFAULT NULL,
  p_device_type text DEFAULT 'desktop',
  p_browser text DEFAULT NULL,
  p_os text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_visitor_id uuid;
  v_traffic_source text;
BEGIN
  -- تحديد مصدر الزيارة من UTM أو referrer
  IF p_utm_source IS NOT NULL THEN
    v_traffic_source := CASE
      WHEN p_utm_source ILIKE '%tiktok%' THEN 'tiktok'
      WHEN p_utm_source ILIKE '%instagram%' OR p_utm_source ILIKE '%ig%' THEN 'instagram'
      WHEN p_utm_source ILIKE '%facebook%' OR p_utm_source ILIKE '%fb%' THEN 'facebook'
      WHEN p_utm_source ILIKE '%twitter%' OR p_utm_source ILIKE '%x.com%' THEN 'twitter'
      WHEN p_utm_source ILIKE '%youtube%' OR p_utm_source ILIKE '%yt%' THEN 'youtube'
      WHEN p_utm_source ILIKE '%google%' THEN 'google'
      ELSE 'other'
    END;
  ELSIF p_referrer_url IS NOT NULL THEN
    v_traffic_source := CASE
      WHEN p_referrer_url ILIKE '%tiktok%' THEN 'tiktok'
      WHEN p_referrer_url ILIKE '%instagram%' THEN 'instagram'
      WHEN p_referrer_url ILIKE '%facebook%' THEN 'facebook'
      WHEN p_referrer_url ILIKE '%twitter%' OR p_referrer_url ILIKE '%x.com%' THEN 'twitter'
      WHEN p_referrer_url ILIKE '%youtube%' THEN 'youtube'
      WHEN p_referrer_url ILIKE '%google%' THEN 'google'
      ELSE 'other'
    END;
  ELSE
    v_traffic_source := 'direct';
  END IF;
  
  -- إدخال السجل
  INSERT INTO visitor_analytics (
    session_id,
    visitor_id,
    page_url,
    page_title,
    referrer_url,
    traffic_source,
    utm_source,
    utm_medium,
    utm_campaign,
    device_type,
    browser,
    os
  ) VALUES (
    p_session_id,
    NULL, -- يُملأ من cookie في الواجهة
    p_page_url,
    p_page_title,
    p_referrer_url,
    v_traffic_source,
    p_utm_source,
    p_utm_medium,
    p_utm_campaign,
    p_device_type,
    p_browser,
    p_os
  ) RETURNING id INTO v_visitor_id;
  
  RETURN v_visitor_id;
END;
$$;

-- إضافة صلاحيات للدوال
GRANT EXECUTE ON FUNCTION aggregate_daily_traffic TO authenticated;
GRANT EXECUTE ON FUNCTION aggregate_daily_pages TO authenticated;
GRANT EXECUTE ON FUNCTION get_marketing_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION test_platform_connection TO authenticated;
GRANT EXECUTE ON FUNCTION track_visitor TO anon, authenticated;
