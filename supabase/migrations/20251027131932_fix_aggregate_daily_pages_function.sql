/*
  # إصلاح دالة تجميع الصفحات اليومية

  ## المشكلة:
  - خطأ في استخدام jsonb_object_agg مع COUNT متداخل
  
  ## الحل:
  - استخدام subquery لتجميع المصادر
*/

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
    (
      SELECT jsonb_object_agg(
        COALESCE(traffic_source, 'direct'),
        source_count
      )
      FROM (
        SELECT 
          traffic_source,
          COUNT(*) as source_count
        FROM visitor_analytics va2
        WHERE va2.visited_at::date = target_date
          AND va2.page_url = va.page_url
        GROUP BY traffic_source
      ) sources
    ) as sources_breakdown
  FROM visitor_analytics va
  WHERE visited_at::date = target_date
  GROUP BY page_url;
END;
$$;
