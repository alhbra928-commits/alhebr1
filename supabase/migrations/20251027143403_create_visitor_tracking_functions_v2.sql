/*
  # دوال نظام تتبع الزوار - Visitor Tracking Functions v2
*/

-- دالة تصنيف مصدر الزيارة
CREATE OR REPLACE FUNCTION classify_traffic_source(
  p_utm_source text,
  p_utm_medium text,
  p_referrer text
)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_utm_source IS NOT NULL THEN
    IF p_utm_source IN ('tiktok', 'instagram', 'facebook', 'twitter', 'youtube', 'linkedin', 'snapchat') THEN
      RETURN 'social';
    END IF;
    
    IF p_utm_source IN ('google', 'bing', 'yahoo', 'duckduckgo') OR p_utm_medium = 'organic' THEN
      RETURN 'search';
    END IF;
    
    IF p_utm_medium IN ('cpc', 'ppc', 'paid', 'display', 'banner') THEN
      RETURN 'paid';
    END IF;
    
    IF p_utm_medium = 'email' OR p_utm_source = 'email' THEN
      RETURN 'email';
    END IF;
    
    RETURN 'referral';
  END IF;
  
  IF p_referrer IS NOT NULL AND p_referrer != '' THEN
    IF p_referrer ILIKE '%tiktok.com%' THEN RETURN 'social';
    ELSIF p_referrer ILIKE '%instagram.com%' THEN RETURN 'social';
    ELSIF p_referrer ILIKE '%facebook.com%' THEN RETURN 'social';
    ELSIF p_referrer ILIKE '%twitter.com%' OR p_referrer ILIKE '%x.com%' THEN RETURN 'social';
    ELSIF p_referrer ILIKE '%youtube.com%' THEN RETURN 'social';
    ELSIF p_referrer ILIKE '%google.%' THEN RETURN 'search';
    ELSIF p_referrer ILIKE '%bing.%' THEN RETURN 'search';
    ELSIF p_referrer ILIKE '%yahoo.%' THEN RETURN 'search';
    ELSE
      RETURN 'referral';
    END IF;
  END IF;
  
  RETURN 'direct';
END;
$$;

-- دالة تسجيل جلسة زائر
CREATE OR REPLACE FUNCTION track_visitor_session(
  p_session_id text,
  p_visitor_ip text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_device_type text DEFAULT 'desktop',
  p_browser text DEFAULT NULL,
  p_os text DEFAULT NULL,
  p_screen_resolution text DEFAULT NULL,
  p_language text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_region text DEFAULT NULL,
  p_referrer_url text DEFAULT NULL,
  p_landing_page text DEFAULT NULL,
  p_utm_source text DEFAULT NULL,
  p_utm_medium text DEFAULT NULL,
  p_utm_campaign text DEFAULT NULL,
  p_utm_term text DEFAULT NULL,
  p_utm_content text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_uuid uuid;
  v_traffic_category text;
  v_existing_count integer;
BEGIN
  v_traffic_category := classify_traffic_source(p_utm_source, p_utm_medium, p_referrer_url);
  
  SELECT COUNT(*) INTO v_existing_count
  FROM visitor_sessions
  WHERE visitor_ip = p_visitor_ip
  AND created_at > now() - interval '30 days';
  
  INSERT INTO visitor_sessions (
    session_id, visitor_ip, user_agent, device_type, browser, os,
    screen_resolution, language, country, city, region, referrer_url,
    landing_page, utm_source, utm_medium, utm_campaign, utm_term,
    utm_content, traffic_source_category, is_new_visitor, is_returning_visitor
  ) VALUES (
    p_session_id, p_visitor_ip, p_user_agent, p_device_type, p_browser, p_os,
    p_screen_resolution, p_language, p_country, p_city, p_region, p_referrer_url,
    p_landing_page, p_utm_source, p_utm_medium, p_utm_campaign, p_utm_term,
    p_utm_content, v_traffic_category, (v_existing_count = 0), (v_existing_count > 0)
  )
  ON CONFLICT (session_id) 
  DO UPDATE SET last_activity_at = now(), updated_at = now()
  RETURNING id INTO v_session_uuid;
  
  INSERT INTO realtime_visitors (session_id, current_page, utm_source, device_type, last_heartbeat_at)
  VALUES (p_session_id, p_landing_page, p_utm_source, p_device_type, now())
  ON CONFLICT (session_id) DO UPDATE SET last_heartbeat_at = now();
  
  RETURN v_session_uuid;
END;
$$;

-- دالة تسجيل زيارة صفحة
CREATE OR REPLACE FUNCTION track_page_visit(
  p_session_id text,
  p_page_url text,
  p_page_title text DEFAULT NULL,
  p_page_path text DEFAULT NULL,
  p_page_section text DEFAULT NULL,
  p_time_on_page_seconds integer DEFAULT 0,
  p_utm_source text DEFAULT NULL,
  p_utm_medium text DEFAULT NULL,
  p_utm_campaign text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_visit_id uuid;
BEGIN
  INSERT INTO page_visits (
    session_id, page_url, page_title, page_path, page_section,
    time_on_page_seconds, utm_source, utm_medium, utm_campaign
  ) VALUES (
    p_session_id, p_page_url, p_page_title, p_page_path, p_page_section,
    p_time_on_page_seconds, p_utm_source, p_utm_medium, p_utm_campaign
  )
  RETURNING id INTO v_visit_id;
  
  UPDATE visitor_sessions
  SET pages_visited = pages_visited + 1, last_activity_at = now(), exit_page = p_page_url
  WHERE session_id = p_session_id;
  
  UPDATE realtime_visitors
  SET current_page = p_page_url, current_section = p_page_section, last_heartbeat_at = now()
  WHERE session_id = p_session_id;
  
  RETURN v_visit_id;
END;
$$;

-- دالة تحديث مدة الجلسة
CREATE OR REPLACE FUNCTION update_session_duration(
  p_session_id text,
  p_duration_seconds integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE visitor_sessions
  SET session_duration_seconds = p_duration_seconds, last_activity_at = now()
  WHERE session_id = p_session_id;
  
  UPDATE realtime_visitors
  SET last_heartbeat_at = now()
  WHERE session_id = p_session_id;
END;
$$;

-- دالة الحصول على عدد الزوار الحاليين
CREATE OR REPLACE FUNCTION get_realtime_visitors_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM realtime_visitors
  WHERE last_heartbeat_at < now() - interval '5 minutes';
  
  SELECT COUNT(*) INTO v_count FROM realtime_visitors;
  
  RETURN v_count;
END;
$$;

-- دالة تجميع البيانات اليومية
CREATE OR REPLACE FUNCTION aggregate_daily_traffic_data(
  p_date date DEFAULT CURRENT_DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_visits integer;
  v_unique_visitors integer;
  v_new_visitors integer;
  v_returning_visitors integer;
  v_tiktok integer; v_instagram integer; v_twitter integer;
  v_facebook integer; v_youtube integer; v_google integer;
  v_direct integer; v_other integer;
  v_mobile integer; v_tablet integer; v_desktop integer;
  v_avg_duration integer; v_avg_pages numeric;
BEGIN
  SELECT 
    COUNT(*), COUNT(DISTINCT session_id),
    COUNT(*) FILTER (WHERE is_new_visitor = true),
    COUNT(*) FILTER (WHERE is_returning_visitor = true),
    COUNT(*) FILTER (WHERE utm_source = 'tiktok'),
    COUNT(*) FILTER (WHERE utm_source = 'instagram'),
    COUNT(*) FILTER (WHERE utm_source = 'twitter' OR utm_source = 'x'),
    COUNT(*) FILTER (WHERE utm_source = 'facebook'),
    COUNT(*) FILTER (WHERE utm_source = 'youtube'),
    COUNT(*) FILTER (WHERE traffic_source_category = 'search'),
    COUNT(*) FILTER (WHERE traffic_source_category = 'direct'),
    COUNT(*) FILTER (WHERE traffic_source_category NOT IN ('social', 'search', 'direct')),
    COUNT(*) FILTER (WHERE device_type = 'mobile'),
    COUNT(*) FILTER (WHERE device_type = 'tablet'),
    COUNT(*) FILTER (WHERE device_type = 'desktop'),
    AVG(session_duration_seconds)::integer, AVG(pages_visited)
  INTO 
    v_total_visits, v_unique_visitors, v_new_visitors, v_returning_visitors,
    v_tiktok, v_instagram, v_twitter, v_facebook, v_youtube, v_google,
    v_direct, v_other, v_mobile, v_tablet, v_desktop, v_avg_duration, v_avg_pages
  FROM visitor_sessions
  WHERE DATE(created_at) = p_date;
  
  INSERT INTO daily_traffic_summary (
    date, total_visits, unique_visitors, new_visitors, returning_visitors,
    visits_from_tiktok, visits_from_instagram, visits_from_twitter,
    visits_from_facebook, visits_from_youtube, visits_from_google,
    visits_from_direct, visits_from_other,
    tiktok_percentage, instagram_percentage, twitter_percentage,
    facebook_percentage, youtube_percentage, google_percentage,
    direct_percentage, other_percentage,
    mobile_visits, tablet_visits, desktop_visits,
    avg_session_duration_seconds, avg_pages_per_session
  ) VALUES (
    p_date, v_total_visits, v_unique_visitors, v_new_visitors, v_returning_visitors,
    v_tiktok, v_instagram, v_twitter, v_facebook, v_youtube, v_google, v_direct, v_other,
    CASE WHEN v_total_visits > 0 THEN (v_tiktok::numeric / v_total_visits * 100) ELSE 0 END,
    CASE WHEN v_total_visits > 0 THEN (v_instagram::numeric / v_total_visits * 100) ELSE 0 END,
    CASE WHEN v_total_visits > 0 THEN (v_twitter::numeric / v_total_visits * 100) ELSE 0 END,
    CASE WHEN v_total_visits > 0 THEN (v_facebook::numeric / v_total_visits * 100) ELSE 0 END,
    CASE WHEN v_total_visits > 0 THEN (v_youtube::numeric / v_total_visits * 100) ELSE 0 END,
    CASE WHEN v_total_visits > 0 THEN (v_google::numeric / v_total_visits * 100) ELSE 0 END,
    CASE WHEN v_total_visits > 0 THEN (v_direct::numeric / v_total_visits * 100) ELSE 0 END,
    CASE WHEN v_total_visits > 0 THEN (v_other::numeric / v_total_visits * 100) ELSE 0 END,
    v_mobile, v_tablet, v_desktop, v_avg_duration, v_avg_pages
  )
  ON CONFLICT (date) DO UPDATE SET
    total_visits = EXCLUDED.total_visits,
    unique_visitors = EXCLUDED.unique_visitors,
    new_visitors = EXCLUDED.new_visitors,
    returning_visitors = EXCLUDED.returning_visitors,
    visits_from_tiktok = EXCLUDED.visits_from_tiktok,
    visits_from_instagram = EXCLUDED.visits_from_instagram,
    visits_from_twitter = EXCLUDED.visits_from_twitter,
    visits_from_facebook = EXCLUDED.visits_from_facebook,
    visits_from_youtube = EXCLUDED.visits_from_youtube,
    visits_from_google = EXCLUDED.visits_from_google,
    visits_from_direct = EXCLUDED.visits_from_direct,
    visits_from_other = EXCLUDED.visits_from_other,
    tiktok_percentage = EXCLUDED.tiktok_percentage,
    instagram_percentage = EXCLUDED.instagram_percentage,
    twitter_percentage = EXCLUDED.twitter_percentage,
    facebook_percentage = EXCLUDED.facebook_percentage,
    youtube_percentage = EXCLUDED.youtube_percentage,
    google_percentage = EXCLUDED.google_percentage,
    direct_percentage = EXCLUDED.direct_percentage,
    other_percentage = EXCLUDED.other_percentage,
    mobile_visits = EXCLUDED.mobile_visits,
    tablet_visits = EXCLUDED.tablet_visits,
    desktop_visits = EXCLUDED.desktop_visits,
    avg_session_duration_seconds = EXCLUDED.avg_session_duration_seconds,
    avg_pages_per_session = EXCLUDED.avg_pages_per_session,
    updated_at = now();
END;
$$;

-- دالة الحصول على الإحصائيات حسب المصدر
CREATE OR REPLACE FUNCTION get_traffic_by_source(
  p_start_date date DEFAULT CURRENT_DATE - 30,
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  source_name text,
  visit_count bigint,
  percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(utm_source, traffic_source_category, 'direct') as source_name,
    COUNT(*) as visit_count,
    (COUNT(*)::numeric / NULLIF((SELECT COUNT(*)::numeric FROM visitor_sessions WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date), 0) * 100) as percentage
  FROM visitor_sessions
  WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date
  GROUP BY COALESCE(utm_source, traffic_source_category, 'direct')
  ORDER BY visit_count DESC;
END;
$$;

-- دالة الحصول على الصفحات الأكثر زيارة
CREATE OR REPLACE FUNCTION get_top_pages(
  p_limit integer DEFAULT 10,
  p_start_date date DEFAULT CURRENT_DATE - 7,
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  page_url text,
  page_title text,
  page_section text,
  visit_count bigint,
  avg_time_on_page integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.page_url, pv.page_title, pv.page_section,
    COUNT(*) as visit_count,
    AVG(pv.time_on_page_seconds)::integer as avg_time_on_page
  FROM page_visits pv
  WHERE DATE(pv.visited_at) BETWEEN p_start_date AND p_end_date
  GROUP BY pv.page_url, pv.page_title, pv.page_section
  ORDER BY visit_count DESC
  LIMIT p_limit;
END;
$$;
