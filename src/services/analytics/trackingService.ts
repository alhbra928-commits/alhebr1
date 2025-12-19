import { supabase } from '../../lib/supabase';

interface TrackingSession {
  sessionId: string;
  createdAt: Date;
  lastActivity: Date;
}

interface DeviceInfo {
  deviceType: 'mobile' | 'desktop' | 'tablet';
  os: string;
  browser: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
}

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

class AnalyticsTrackingService {
  private sessionId: string | null = null;
  private isInitialized = false;
  private eventQueue: any[] = [];
  private flushInterval: number | null = null;
  private SESSION_KEY = 'analytics_session_id';
  private SESSION_START_KEY = 'analytics_session_start';

  async initialize() {
    if (this.isInitialized) return;

    try {
      const existingSessionId = this.getStoredSessionId();

      if (existingSessionId && !this.isSessionExpired()) {
        this.sessionId = existingSessionId;
        await this.updateSessionActivity();
      } else {
        await this.createNewSession();
      }

      this.isInitialized = true;
      this.startEventFlush();

      console.log('✅ Analytics Tracking Service initialized with session:', this.sessionId);
    } catch (error) {
      console.error('❌ Failed to initialize tracking service:', error);
    }
  }

  private async createNewSession() {
    try {
      const deviceInfo = this.getDeviceInfo();
      const utmParams = this.getUTMParams();
      const referrer = document.referrer || null;
      const landingPath = window.location.pathname + window.location.search;

      const { data, error } = await supabase
        .from('analytics_sessions')
        .insert([{
          landing_path: landingPath,
          referrer,
          ...utmParams,
          ...deviceInfo,
          user_agent: navigator.userAgent,
        }])
        .select('session_id')
        .single();

      if (error) throw error;

      if (data) {
        this.sessionId = data.session_id;
        this.storeSessionId(data.session_id);
        console.log('✅ New analytics session created:', data.session_id);
      }
    } catch (error) {
      console.error('❌ Failed to create session:', error);
    }
  }

  private async updateSessionActivity() {
    if (!this.sessionId) return;

    try {
      await supabase
        .from('analytics_sessions')
        .update({
          last_activity_at: new Date().toISOString(),
          session_duration_seconds: this.getSessionDuration(),
        })
        .eq('session_id', this.sessionId);
    } catch (error) {
      console.error('❌ Failed to update session activity:', error);
    }
  }

  private getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent.toLowerCase();

    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (/mobile|android|iphone|ipod/.test(ua)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/.test(ua)) {
      deviceType = 'tablet';
    }

    let os = 'unknown';
    if (/windows/.test(ua)) os = 'windows';
    else if (/mac/.test(ua)) os = 'mac';
    else if (/linux/.test(ua)) os = 'linux';
    else if (/android/.test(ua)) os = 'android';
    else if (/iphone|ipad|ipod/.test(ua)) os = 'ios';

    let browser = 'unknown';
    if (/chrome/.test(ua) && !/edg/.test(ua)) browser = 'chrome';
    else if (/safari/.test(ua) && !/chrome/.test(ua)) browser = 'safari';
    else if (/firefox/.test(ua)) browser = 'firefox';
    else if (/edg/.test(ua)) browser = 'edge';

    return {
      deviceType,
      os,
      browser,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language || 'ar',
    };
  }

  private getUTMParams(): UTMParams {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
    };
  }

  private getStoredSessionId(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  private storeSessionId(sessionId: string) {
    localStorage.setItem(this.SESSION_KEY, sessionId);
    localStorage.setItem(this.SESSION_START_KEY, Date.now().toString());
  }

  private isSessionExpired(): boolean {
    const sessionStart = localStorage.getItem(this.SESSION_START_KEY);
    if (!sessionStart) return true;

    const elapsed = Date.now() - parseInt(sessionStart);
    const THIRTY_MINUTES = 30 * 60 * 1000;

    return elapsed > THIRTY_MINUTES;
  }

  private getSessionDuration(): number {
    const sessionStart = localStorage.getItem(this.SESSION_START_KEY);
    if (!sessionStart) return 0;

    return Math.floor((Date.now() - parseInt(sessionStart)) / 1000);
  }

  async trackEvent(
    eventName: string,
    eventValue?: any,
    metadata?: any
  ) {
    if (!this.sessionId) {
      console.warn('⚠️ No session ID, queuing event:', eventName);
      this.eventQueue.push({ eventName, eventValue, metadata });
      return;
    }

    try {
      const event = {
        session_id: this.sessionId,
        event_name: eventName,
        event_value: eventValue || {},
        path: window.location.pathname,
        page_title: document.title,
        metadata: metadata || {},
      };

      this.eventQueue.push(event);

      if (this.eventQueue.length >= 5) {
        await this.flushEvents();
      }
    } catch (error) {
      console.error('❌ Failed to track event:', error);
    }
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    try {
      const eventsToSend = [...this.eventQueue];
      this.eventQueue = [];

      const { error } = await supabase
        .from('analytics_events')
        .insert(eventsToSend);

      if (error) throw error;

      console.log(`✅ Flushed ${eventsToSend.length} events`);
    } catch (error) {
      console.error('❌ Failed to flush events:', error);
      this.eventQueue.unshift(...this.eventQueue);
    }
  }

  private startEventFlush() {
    if (this.flushInterval) return;

    this.flushInterval = window.setInterval(() => {
      this.flushEvents();
    }, 10000);
  }

  async trackPageView(path?: string) {
    await this.trackEvent('home_view', {
      path: path || window.location.pathname,
      referrer: document.referrer,
    });
  }

  async trackFarmView(farmId: string, farmName: string) {
    await this.trackEvent('farm_view', {
      farm_id: farmId,
      farm_name: farmName,
    });
  }

  async trackBookingStart(farmId: string, farmName: string) {
    await this.trackEvent('booking_start', {
      farm_id: farmId,
      farm_name: farmName,
    });
  }

  async trackBookingSubmit(farmId: string, farmName: string, trees: number) {
    await this.trackEvent('booking_submit', {
      farm_id: farmId,
      farm_name: farmName,
      trees_count: trees,
    });
  }

  async trackWhatsAppClick(source: string) {
    await this.trackEvent('whatsapp_click', {
      source,
    });
  }

  async trackShareClick(farmId: string, farmName: string) {
    await this.trackEvent('share_click', {
      farm_id: farmId,
      farm_name: farmName,
    });
  }

  cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    this.flushEvents();
  }
}

export const TrackingService = new AnalyticsTrackingService();
