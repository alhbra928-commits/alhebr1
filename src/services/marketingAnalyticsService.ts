import { supabase } from '../lib/supabase';
import { analyticsPixelLoader } from './analyticsPixelLoader';

export interface PlatformConnection {
  id: string;
  platform: 'google_analytics' | 'tiktok_pixel' | 'meta_pixel' | 'twitter_pixel' | 'youtube_analytics';
  is_active: boolean;
  api_key?: string;
  pixel_id?: string;
  property_id?: string;
  connection_status: 'connected' | 'disconnected' | 'error' | 'pending';
  last_checked_at?: string;
  last_error?: string;
  settings?: Record<string, any>;
}

export interface VisitorAnalytics {
  session_id: string;
  page_url: string;
  page_title?: string;
  referrer_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;
}

export interface TrafficSource {
  date: string;
  traffic_source: string;
  total_visits: number;
  unique_visitors: number;
  total_page_views: number;
  avg_time_on_site?: number;
  devices_breakdown?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface DashboardStats {
  total_visitors: number;
  total_visits: number;
  total_page_views: number;
  avg_time_on_site: number;
  sources_breakdown: Record<string, number>;
  top_pages: Array<{
    url: string;
    title: string;
    views: number;
  }>;
  daily_trend: Array<{
    date: string;
    visits: number;
  }>;
}

class MarketingAnalyticsService {
  // إدارة إعدادات الربط
  async getPlatformConnections(): Promise<PlatformConnection[]> {
    const { data, error } = await supabase
      .from('marketing_platform_connections')
      .select('*')
      .order('platform');

    if (error) throw error;
    return data || [];
  }

  async updatePlatformConnection(
    platform: string,
    updates: Partial<PlatformConnection>
  ): Promise<void> {
    const { error } = await supabase
      .from('marketing_platform_connections')
      .upsert({
        platform,
        ...updates,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'platform'
      });

    if (error) throw error;
  }

  async testPlatformConnection(platform: string): Promise<{
    success: boolean;
    status?: string;
    response_time?: number;
    error?: string;
  }> {
    const { data, error } = await supabase.rpc('test_platform_connection', {
      p_platform: platform,
      p_admin_id: (await supabase.auth.getUser()).data.user?.id || null
    });

    if (error) throw error;
    return data;
  }

  // تتبع الزوار
  async trackVisitor(analytics: VisitorAnalytics): Promise<string> {
    const { data, error } = await supabase.rpc('track_visitor', {
      p_session_id: analytics.session_id,
      p_page_url: analytics.page_url,
      p_page_title: analytics.page_title,
      p_referrer_url: analytics.referrer_url,
      p_utm_source: analytics.utm_source,
      p_utm_medium: analytics.utm_medium,
      p_utm_campaign: analytics.utm_campaign,
      p_device_type: analytics.device_type || 'desktop',
      p_browser: analytics.browser,
      p_os: analytics.os
    });

    if (error) throw error;
    return data;
  }

  // الإحصائيات
  async getDashboardStats(
    startDate?: string,
    endDate?: string
  ): Promise<DashboardStats> {
    const { data, error } = await supabase.rpc('get_marketing_dashboard_stats', {
      p_start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      p_end_date: endDate || new Date().toISOString().split('T')[0]
    });

    if (error) throw error;
    return data;
  }

  async getTrafficSources(
    startDate?: string,
    endDate?: string
  ): Promise<TrafficSource[]> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('traffic_sources_daily')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTopPages(limit: number = 10): Promise<Array<{
    page_url: string;
    page_title?: string;
    total_views: number;
    unique_visitors: number;
    avg_time_on_page?: number;
  }>> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('page_analytics_daily')
      .select('*')
      .eq('date', today)
      .order('total_views', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // تجميع البيانات اليومية
  async aggregateDailyData(date?: string): Promise<void> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // تجميع بيانات الزيارات
    await supabase.rpc('aggregate_daily_traffic', {
      target_date: targetDate
    });

    // تجميع بيانات الصفحات
    await supabase.rpc('aggregate_daily_pages', {
      target_date: targetDate
    });
  }

  // سجل حالة الاتصال
  async getConnectionHealthLog(
    platform?: string,
    limit: number = 50
  ): Promise<Array<{
    id: string;
    platform: string;
    status: string;
    response_time?: number;
    error_message?: string;
    checked_at: string;
  }>> {
    let query = supabase
      .from('connection_health_log')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(limit);

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // مساعد: الحصول على معلومات الجهاز
  getDeviceInfo(): {
    device_type: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
  } {
    const ua = navigator.userAgent;

    // نوع الجهاز
    let device_type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/mobile/i.test(ua)) {
      device_type = 'mobile';
    } else if (/tablet|ipad/i.test(ua)) {
      device_type = 'tablet';
    }

    // المتصفح
    let browser = 'Unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';

    // نظام التشغيل
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return { device_type, browser, os };
  }

  // مساعد: استخراج معاملات UTM من URL
  getUTMParams(): {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  } {
    const params = new URLSearchParams(window.location.search);

    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined
    };
  }

  // مساعد: إنشاء session ID فريد
  getOrCreateSessionId(): string {
    const SESSION_KEY = 'analytics_session_id';
    const SESSION_DURATION = 30 * 60 * 1000; // 30 دقيقة

    let sessionData = localStorage.getItem(SESSION_KEY);

    if (sessionData) {
      const { id, timestamp } = JSON.parse(sessionData);

      // التحقق من انتهاء الجلسة
      if (Date.now() - timestamp < SESSION_DURATION) {
        // تحديث الوقت
        localStorage.setItem(SESSION_KEY, JSON.stringify({
          id,
          timestamp: Date.now()
        }));
        return id;
      }
    }

    // إنشاء جلسة جديدة
    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      id: newId,
      timestamp: Date.now()
    }));

    return newId;
  }

  // تتبع تلقائي للصفحة الحالية
  async trackCurrentPage(): Promise<void> {
    try {
      const deviceInfo = this.getDeviceInfo();
      const utmParams = this.getUTMParams();
      const sessionId = this.getOrCreateSessionId();

      // تتبع في قاعدة البيانات
      await this.trackVisitor({
        session_id: sessionId,
        page_url: window.location.href,
        page_title: document.title,
        referrer_url: document.referrer || undefined,
        ...utmParams,
        ...deviceInfo
      });

      // تتبع على جميع المنصات المُحمّلة (Google, TikTok, Meta, Twitter)
      analyticsPixelLoader.trackPageView(window.location.href);

      console.log('✅ Page tracked:', window.location.href);
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  // تتبع حدث مخصص
  trackCustomEvent(eventName: string, eventData?: Record<string, any>): void {
    analyticsPixelLoader.trackEvent(eventName, eventData);
  }

  // تهيئة السكربتات التحليلية
  async initializePixels(): Promise<void> {
    await analyticsPixelLoader.initialize();
  }

  // إعادة تحميل السكربتات (بعد تحديث الإعدادات)
  async reloadPixels(): Promise<void> {
    await analyticsPixelLoader.reload();
  }

  // التحقق من المنصات المحملة
  getLoadedPlatforms(): string[] {
    return analyticsPixelLoader.getLoadedPlatforms();
  }
}

export const marketingAnalyticsService = new MarketingAnalyticsService();
