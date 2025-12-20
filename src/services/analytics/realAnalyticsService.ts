/**
 * Real Analytics Service - Production Ready
 *
 * يستخدم Service Role للكتابة (آمن للإنتاج)
 * يسجل Sessions و Events بشكل حقيقي
 */

import { supabase } from '../../lib/supabase';

interface SessionData {
  session_id: string;
  landing_page: string;
  referrer: string | null;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  device_type: string;
  os: string;
  browser: string;
  user_agent: string;
}

interface EventData {
  session_id: string;
  event_type:
    | 'page_view'
    | 'home_view'
    | 'farm_view'
    | 'farm_detail_view'
    | 'booking_start'
    | 'booking_submit'
    | 'booking_complete'
    | 'whatsapp_click'
    | 'payment_upload'
    | 'certificate_view'
    | 'share_click'
    | 'filter_used'
    | 'search_performed'
    | 'concept_view'
    | 'owner_login'
    | 'investor_login';
  event_name?: string;
  page_path?: string;
  page_title?: string;
  event_data?: Record<string, any>;
  load_time_ms?: number;
}

// Helper type for quantity change tracking
interface QuantityChangeData {
  farm_id: string;
  farm_name: string;
  old_quantity: number;
  new_quantity: number;
}

class RealAnalyticsService {
  private sessionId: string | null = null;
  private SESSION_KEY = 'analytics_session_id';
  private sessionStartTime: number = Date.now();

  /**
   * الحصول على أو إنشاء session_id
   */
  getOrCreateSessionId(): string {
    if (this.sessionId) return this.sessionId;

    let sessionId = localStorage.getItem(this.SESSION_KEY);

    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(this.SESSION_KEY, sessionId);
      console.log('🆕 New Session Created:', sessionId);
    }

    this.sessionId = sessionId;
    return sessionId;
  }

  /**
   * تحليل نظام التشغيل
   */
  private detectOS(ua: string): string {
    const uaLower = ua.toLowerCase();

    if (uaLower.includes('windows')) return 'Windows';
    if (uaLower.includes('mac os')) return 'macOS';
    if (uaLower.includes('iphone') || uaLower.includes('ipad')) return 'iOS';
    if (uaLower.includes('android')) return 'Android';
    if (uaLower.includes('linux')) return 'Linux';

    return 'Unknown';
  }

  /**
   * تحليل المتصفح
   */
  private detectBrowser(ua: string): string {
    const uaLower = ua.toLowerCase();

    if (uaLower.includes('firefox')) return 'Firefox';
    if (uaLower.includes('chrome') && !uaLower.includes('edge')) return 'Chrome';
    if (uaLower.includes('safari') && !uaLower.includes('chrome')) return 'Safari';
    if (uaLower.includes('edge')) return 'Edge';
    if (uaLower.includes('opera') || uaLower.includes('opr')) return 'Opera';

    return 'Unknown';
  }

  /**
   * تحليل نوع الجهاز
   */
  private detectDeviceType(ua: string): string {
    const uaLower = ua.toLowerCase();

    if (/mobile|android|iphone|ipod/.test(uaLower)) return 'mobile';
    if (/tablet|ipad/.test(uaLower)) return 'tablet';

    return 'desktop';
  }

  /**
   * بدء جلسة جديدة (يُستدعى مرة واحدة عند تحميل الصفحة)
   */
  async startSession(): Promise<void> {
    try {
      const sessionId = this.getOrCreateSessionId();

      // التحقق من وجود الجلسة
      const { data: existingSession } = await supabase
        .from('analytics_sessions')
        .select('id, is_active')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existingSession?.is_active) {
        console.log('📊 Session already active:', sessionId);
        return;
      }

      // جمع البيانات
      const urlParams = new URLSearchParams(window.location.search);
      const fullPath = window.location.pathname + window.location.search;
      const ua = navigator.userAgent;

      const sessionData: SessionData = {
        session_id: sessionId,
        landing_page: fullPath,
        referrer: document.referrer || null,
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_content: urlParams.get('utm_content') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
        device_type: this.detectDeviceType(ua),
        os: this.detectOS(ua),
        browser: this.detectBrowser(ua),
        user_agent: ua,
      };

      console.log('📊 Creating new session:', sessionData);

      // إنشاء الجلسة (insert or update)
      const { data, error } = await supabase
        .from('analytics_sessions')
        .upsert(sessionData, { onConflict: 'session_id' })
        .select('id')
        .single();

      if (error) {
        console.error('❌ Failed to create session:', error);
        return;
      }

      console.log('✅ Session created successfully:', data?.id);
      this.sessionStartTime = Date.now();
    } catch (error) {
      console.error('❌ Error in startSession:', error);
    }
  }

  /**
   * تسجيل حدث (Event)
   */
  async trackEvent(eventData: Omit<EventData, 'session_id'>): Promise<void> {
    try {
      const sessionId = this.getOrCreateSessionId();

      const fullEventData: EventData = {
        session_id: sessionId,
        ...eventData,
        page_path: eventData.page_path || window.location.pathname,
        page_title: eventData.page_title || document.title,
      };

      console.log('📊 Tracking event:', fullEventData.event_type);

      const { error } = await supabase
        .from('analytics_events')
        .insert(fullEventData);

      if (error) {
        console.error('❌ Failed to track event:', error);
        return;
      }

      console.log('✅ Event tracked:', fullEventData.event_type);
    } catch (error) {
      console.error('❌ Error in trackEvent:', error);
    }
  }

  /**
   * تسجيل page view
   */
  async trackPageView(pagePath?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'page_view',
      page_path: pagePath || window.location.pathname,
      page_title: document.title,
    });
  }

  /**
   * تسجيل home view
   */
  async trackHomeView(): Promise<void> {
    await this.trackEvent({
      event_type: 'home_view',
      event_name: 'User viewed home page',
    });
  }

  /**
   * تسجيل farm view
   */
  async trackFarmView(farmId: string, farmName: string): Promise<void> {
    await this.trackEvent({
      event_type: 'farm_view',
      event_name: `Viewed farm: ${farmName}`,
      event_data: { farm_id: farmId, farm_name: farmName },
    });
  }

  /**
   * تسجيل farm detail view
   */
  async trackFarmDetailView(farmId: string, farmName: string): Promise<void> {
    await this.trackEvent({
      event_type: 'farm_detail_view',
      event_name: `Viewed farm details: ${farmName}`,
      event_data: { farm_id: farmId, farm_name: farmName },
    });
  }

  /**
   * تسجيل booking start
   */
  async trackBookingStart(farmId: string, farmName: string): Promise<void> {
    await this.trackEvent({
      event_type: 'booking_start',
      event_name: `Started booking for: ${farmName}`,
      event_data: { farm_id: farmId, farm_name: farmName },
    });
  }

  /**
   * تسجيل booking submit
   */
  async trackBookingSubmit(farmId: string, farmName: string, treesCount: number): Promise<void> {
    await this.trackEvent({
      event_type: 'booking_submit',
      event_name: `Submitted booking for: ${farmName}`,
      event_data: {
        farm_id: farmId,
        farm_name: farmName,
        trees_count: treesCount,
      },
    });
  }

  /**
   * تسجيل booking complete
   */
  async trackBookingComplete(farmId: string, farmName: string, bookingId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'booking_complete',
      event_name: `Completed booking for: ${farmName}`,
      event_data: {
        farm_id: farmId,
        farm_name: farmName,
        booking_id: bookingId,
      },
    });
  }

  /**
   * تسجيل WhatsApp click
   */
  async trackWhatsAppClick(source: string): Promise<void> {
    await this.trackEvent({
      event_type: 'whatsapp_click',
      event_name: `Clicked WhatsApp button from: ${source}`,
      event_data: { source },
    });
  }

  /**
   * تسجيل payment upload
   */
  async trackPaymentUpload(bookingId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'payment_upload',
      event_name: 'Uploaded payment receipt',
      event_data: { booking_id: bookingId },
    });
  }

  /**
   * تسجيل certificate view
   */
  async trackCertificateView(certificateId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'certificate_view',
      event_name: 'Viewed certificate',
      event_data: { certificate_id: certificateId },
    });
  }

  /**
   * تسجيل share click
   */
  async trackShareClick(shareType: string, itemId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'share_click',
      event_name: `Shared ${shareType}`,
      event_data: { share_type: shareType, item_id: itemId },
    });
  }

  /**
   * تسجيل filter used
   */
  async trackFilterUsed(filterType: string, filterValue: string): Promise<void> {
    await this.trackEvent({
      event_type: 'filter_used',
      event_name: `Used filter: ${filterType}`,
      event_data: { filter_type: filterType, filter_value: filterValue },
    });
  }

  /**
   * تسجيل search performed
   */
  async trackSearchPerformed(searchQuery: string): Promise<void> {
    await this.trackEvent({
      event_type: 'search_performed',
      event_name: 'Performed search',
      event_data: { search_query: searchQuery },
    });
  }

  /**
   * تسجيل concept view
   */
  async trackConceptView(): Promise<void> {
    await this.trackEvent({
      event_type: 'concept_view',
      event_name: 'Viewed concept page',
    });
  }

  /**
   * إنهاء الجلسة
   */
  async endSession(): Promise<void> {
    try {
      const sessionId = this.getOrCreateSessionId();
      const durationSeconds = Math.floor((Date.now() - this.sessionStartTime) / 1000);

      const { error } = await supabase
        .from('analytics_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('❌ Failed to end session:', error);
        return;
      }

      console.log('✅ Session ended:', sessionId, `(${durationSeconds}s)`);
    } catch (error) {
      console.error('❌ Error in endSession:', error);
    }
  }
}

// Singleton instance
export const realAnalytics = new RealAnalyticsService();

// Auto-start session on page load
if (typeof window !== 'undefined') {
  // بدء الجلسة فوراً
  realAnalytics.startSession();

  // إنهاء الجلسة عند إغلاق الصفحة
  window.addEventListener('beforeunload', () => {
    realAnalytics.endSession();
  });

  // تسجيل page view تلقائياً
  realAnalytics.trackPageView();
}
