import { supabase } from '../../lib/supabase';

interface DateRange {
  start: Date;
  end: Date;
}

interface SourceStats {
  source: string;
  visits: number;
  engaged: number;
  bookings: number;
  conversionRate: number;
}

interface FunnelStep {
  step: string;
  count: number;
  dropoffRate: number;
}

interface PulseData {
  level: 'high' | 'medium' | 'low';
  score: number;
  visitors: number;
  engaged: number;
  bookings: number;
}

class MarketingAnalyticsService {
  async getPulseData(period: 'today' | 'week' | 'month' = 'today'): Promise<PulseData> {
    try {
      const range = this.getDateRange(period);

      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('session_id')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());

      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_name, session_id')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());

      const visitors = sessions?.length || 0;
      const engaged = new Set(
        events?.filter(e => e.event_name === 'farm_view').map(e => e.session_id) || []
      ).size;
      const bookings = new Set(
        events?.filter(e => e.event_name === 'booking_submit').map(e => e.session_id) || []
      ).size;

      const score = (visitors * 0.3) + (engaged * 0.4) + (bookings * 0.3);

      let level: 'high' | 'medium' | 'low' = 'low';
      if (score > 50) level = 'high';
      else if (score > 20) level = 'medium';

      return { level, score, visitors, engaged, bookings };
    } catch (error) {
      console.error('Failed to get pulse data:', error);
      return { level: 'low', score: 0, visitors: 0, engaged: 0, bookings: 0 };
    }
  }

  async getKPIs(period: 'today' | 'week' | 'month' = 'today') {
    try {
      const range = this.getDateRange(period);

      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());

      const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());

      const visitors = sessions?.length || 0;
      const engaged = new Set(
        events?.filter(e => e.event_name === 'farm_view').map(e => e.session_id) || []
      ).size;
      const bookingStarts = new Set(
        events?.filter(e => e.event_name === 'booking_start').map(e => e.session_id) || []
      ).size;
      const bookingSubmits = new Set(
        events?.filter(e => e.event_name === 'booking_submit').map(e => e.session_id) || []
      ).size;
      const paymentUploads = new Set(
        events?.filter(e => e.event_name === 'payment_upload').map(e => e.session_id) || []
      ).size;

      return {
        visitors,
        engaged,
        bookingStarts,
        bookingSubmits,
        paymentUploads,
        engagementRate: visitors > 0 ? ((engaged / visitors) * 100).toFixed(1) : '0',
        conversionRate: visitors > 0 ? ((bookingSubmits / visitors) * 100).toFixed(1) : '0',
      };
    } catch (error) {
      console.error('Failed to get KPIs:', error);
      return {
        visitors: 0,
        engaged: 0,
        bookingStarts: 0,
        bookingSubmits: 0,
        paymentUploads: 0,
        engagementRate: '0',
        conversionRate: '0',
      };
    }
  }

  async getSourcesBreakdown(period: 'today' | 'week' | 'month' = 'today'): Promise<SourceStats[]> {
    try {
      const range = this.getDateRange(period);

      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('session_id, utm_source, referrer')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());

      const { data: events } = await supabase
        .from('analytics_events')
        .select('session_id, event_name')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());

      const sourcesMap = new Map<string, SourceStats>();

      sessions?.forEach(session => {
        const source = this.getSource(session);

        if (!sourcesMap.has(source)) {
          sourcesMap.set(source, {
            source,
            visits: 0,
            engaged: 0,
            bookings: 0,
            conversionRate: 0,
          });
        }

        const stats = sourcesMap.get(source)!;
        stats.visits++;
      });

      events?.forEach(event => {
        const session = sessions?.find(s => s.session_id === event.session_id);
        if (!session) return;

        const source = this.getSource(session);
        const stats = sourcesMap.get(source);
        if (!stats) return;

        if (event.event_name === 'farm_view') {
          stats.engaged++;
        }
        if (event.event_name === 'booking_submit') {
          stats.bookings++;
        }
      });

      const result = Array.from(sourcesMap.values()).map(stats => ({
        ...stats,
        conversionRate: stats.visits > 0 ? (stats.bookings / stats.visits) * 100 : 0,
      }));

      return result.sort((a, b) => b.visits - a.visits);
    } catch (error) {
      console.error('Failed to get sources breakdown:', error);
      return [];
    }
  }

  async getFunnelData(period: 'today' | 'week' | 'month' = 'today'): Promise<FunnelStep[]> {
    try {
      const range = this.getDateRange(period);

      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('session_id')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());

      const { data: events } = await supabase
        .from('analytics_events')
        .select('session_id, event_name')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());

      const totalSessions = sessions?.length || 0;

      const steps = [
        { name: 'الصفحة الرئيسية', event: 'home_view' },
        { name: 'مشاهدة مزرعة', event: 'farm_view' },
        { name: 'بدء الحجز', event: 'booking_start' },
        { name: 'إرسال الحجز', event: 'booking_submit' },
        { name: 'رفع الإيصال', event: 'payment_upload' },
      ];

      const funnelData: FunnelStep[] = steps.map((step, index) => {
        const count = new Set(
          events?.filter(e => e.event_name === step.event).map(e => e.session_id) || []
        ).size;

        const previousCount = index === 0 ? totalSessions :
          new Set(
            events?.filter(e => e.event_name === steps[index - 1].event).map(e => e.session_id) || []
          ).size;

        const dropoffRate = previousCount > 0 ?
          ((previousCount - count) / previousCount) * 100 : 0;

        return {
          step: step.name,
          count: index === 0 ? totalSessions : count,
          dropoffRate,
        };
      });

      return funnelData;
    } catch (error) {
      console.error('Failed to get funnel data:', error);
      return [];
    }
  }

  async getBestSourceToday(): Promise<{ source: string; conversionRate: number } | null> {
    try {
      const sources = await this.getSourcesBreakdown('today');
      if (sources.length === 0) return null;

      const best = sources.reduce((prev, curr) =>
        curr.conversionRate > prev.conversionRate ? curr : prev
      );

      return {
        source: best.source,
        conversionRate: best.conversionRate,
      };
    } catch (error) {
      console.error('Failed to get best source:', error);
      return null;
    }
  }

  async getIntentAnalysis(period: 'today' | 'week' | 'month' = 'today') {
    try {
      const range = this.getDateRange(period);

      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('session_id')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());

      const { data: events } = await supabase
        .from('analytics_events')
        .select('session_id, event_name')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());

      const sessionEvents = new Map<string, string[]>();
      events?.forEach(event => {
        if (!sessionEvents.has(event.session_id)) {
          sessionEvents.set(event.session_id, []);
        }
        sessionEvents.get(event.session_id)!.push(event.event_name);
      });

      let browsers = 0;
      let interested = 0;
      let nearDecision = 0;
      let investors = 0;

      sessions?.forEach(session => {
        const userEvents = sessionEvents.get(session.session_id) || [];

        if (userEvents.includes('booking_submit') || userEvents.includes('payment_upload')) {
          investors++;
        } else if (userEvents.includes('booking_start') || userEvents.includes('qty_change')) {
          nearDecision++;
        } else if (userEvents.includes('farm_view')) {
          interested++;
        } else {
          browsers++;
        }
      });

      return { browsers, interested, nearDecision, investors };
    } catch (error) {
      console.error('Failed to get intent analysis:', error);
      return { browsers: 0, interested: 0, nearDecision: 0, investors: 0 };
    }
  }

  private getSource(session: any): string {
    if (session.utm_source) {
      return session.utm_source;
    }

    if (session.referrer) {
      const referrer = session.referrer.toLowerCase();
      if (referrer.includes('tiktok')) return 'TikTok';
      if (referrer.includes('instagram')) return 'Instagram';
      if (referrer.includes('facebook')) return 'Facebook';
      if (referrer.includes('twitter') || referrer.includes('x.com')) return 'Twitter';
      if (referrer.includes('whatsapp')) return 'WhatsApp';
      if (referrer.includes('google')) return 'Google';
      if (referrer.includes('youtube')) return 'YouTube';
      return 'Referral';
    }

    return 'Direct';
  }

  private getDateRange(period: 'today' | 'week' | 'month'): DateRange {
    const end = new Date();
    const start = new Date();

    if (period === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      start.setDate(start.getDate() - 7);
    } else if (period === 'month') {
      start.setDate(start.getDate() - 30);
    }

    return { start, end };
  }
}

export const marketingAnalyticsService = new MarketingAnalyticsService();
