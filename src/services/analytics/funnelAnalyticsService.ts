/**
 * Funnel Analytics Service
 *
 * يحلل رحلة المستثمر (Investor Journey) من analytics_events
 */

import { supabase } from '../../lib/supabase';

interface FunnelStep {
  step: string;
  stepNumber: number;
  count: number;
  percentage: number;
  dropOff: number;
}

interface EventCount {
  eventType: string;
  count: number;
}

export class FunnelAnalyticsService {
  /**
   * جلب Funnel كامل (رحلة المستثمر)
   */
  static async getFunnelData(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<FunnelStep[]> {
    try {
      const timeRanges: Record<string, string> = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days',
      };

      const interval = timeRanges[timeRange];

      // الخطوات بالترتيب
      const steps = [
        { key: 'home_view', label: 'زيارة الموقع', stepNumber: 1 },
        { key: 'farm_view', label: 'عرض مزرعة', stepNumber: 2 },
        { key: 'farm_detail_view', label: 'تفاصيل المزرعة', stepNumber: 3 },
        { key: 'booking_start', label: 'بدء الحجز', stepNumber: 4 },
        { key: 'booking_submit', label: 'إرسال الحجز', stepNumber: 5 },
        { key: 'payment_upload', label: 'رفع الإيصال', stepNumber: 6 },
        { key: 'booking_complete', label: 'إكمال الحجز', stepNumber: 7 },
      ];

      // جلب عدد كل event
      const eventCounts: Record<string, number> = {};

      for (const step of steps) {
        const { data, error } = await supabase
          .from('analytics_events')
          .select('session_id')
          .eq('event_type', step.key)
          .gte('created_at', `now() - interval '${interval}'`);

        if (error) throw error;

        // عدد الجلسات الفريدة لكل خطوة
        const uniqueSessions = new Set(data?.map(e => e.session_id) || []);
        eventCounts[step.key] = uniqueSessions.size;
      }

      // حساب النسب والـ drop-off
      const totalVisitors = eventCounts['home_view'] || 1; // لتجنب القسمة على صفر

      const funnelData: FunnelStep[] = steps.map((step, index) => {
        const count = eventCounts[step.key] || 0;
        const percentage = Math.round((count / totalVisitors) * 100);

        // حساب Drop-off (الفرق بين الخطوة الحالية والسابقة)
        let dropOff = 0;
        if (index > 0) {
          const prevCount = eventCounts[steps[index - 1].key] || 0;
          dropOff = Math.round(((prevCount - count) / prevCount) * 100);
        }

        return {
          step: step.label,
          stepNumber: step.stepNumber,
          count,
          percentage,
          dropOff,
        };
      });

      return funnelData;
    } catch (error) {
      console.error('Error getting funnel data:', error);
      return [];
    }
  }

  /**
   * معدل التحويل الإجمالي (من زيارة إلى حجز)
   */
  static async getConversionRate(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    visitors: number;
    bookings: number;
    conversionRate: number;
  }> {
    try {
      const timeRanges: Record<string, string> = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days',
      };

      const interval = timeRanges[timeRange];

      // عدد الزوار (home_view)
      const { data: visitorsData } = await supabase
        .from('analytics_events')
        .select('session_id')
        .eq('event_type', 'home_view')
        .gte('created_at', `now() - interval '${interval}'`);

      const visitors = new Set(visitorsData?.map(e => e.session_id) || []).size;

      // عدد الحجوزات (booking_complete)
      const { data: bookingsData } = await supabase
        .from('analytics_events')
        .select('session_id')
        .eq('event_type', 'booking_complete')
        .gte('created_at', `now() - interval '${interval}'`);

      const bookings = new Set(bookingsData?.map(e => e.session_id) || []).size;

      // معدل التحويل
      const conversionRate = visitors > 0 ? Math.round((bookings / visitors) * 100 * 10) / 10 : 0;

      return {
        visitors,
        bookings,
        conversionRate,
      };
    } catch (error) {
      console.error('Error getting conversion rate:', error);
      return {
        visitors: 0,
        bookings: 0,
        conversionRate: 0,
      };
    }
  }

  /**
   * متوسط الوقت بين الخطوات
   */
  static async getAverageTimeBetweenSteps(
    fromEvent: string,
    toEvent: string,
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<number> {
    try {
      const timeRanges: Record<string, string> = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days',
      };

      const interval = timeRanges[timeRange];

      // جلب الأحداث
      const { data: fromEvents } = await supabase
        .from('analytics_events')
        .select('session_id, created_at')
        .eq('event_type', fromEvent)
        .gte('created_at', `now() - interval '${interval}'`);

      const { data: toEvents } = await supabase
        .from('analytics_events')
        .select('session_id, created_at')
        .eq('event_type', toEvent)
        .gte('created_at', `now() - interval '${interval}'`);

      if (!fromEvents || !toEvents) return 0;

      // تجميع حسب session_id
      const sessionTimes: number[] = [];

      fromEvents.forEach(fromEvent => {
        const matchingToEvent = toEvents.find(te => te.session_id === fromEvent.session_id);
        if (matchingToEvent) {
          const timeDiff = new Date(matchingToEvent.created_at).getTime() - new Date(fromEvent.created_at).getTime();
          sessionTimes.push(timeDiff / 1000); // بالثواني
        }
      });

      // متوسط الوقت
      if (sessionTimes.length === 0) return 0;
      return Math.round(sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length);
    } catch (error) {
      console.error('Error getting average time between steps:', error);
      return 0;
    }
  }

  /**
   * أكثر الصفحات مشاهدة
   */
  static async getTopPages(timeRange: '1h' | '24h' | '7d' | '30d' = '24h', limit = 10): Promise<{
    pagePath: string;
    views: number;
    uniqueVisitors: number;
  }[]> {
    try {
      const timeRanges: Record<string, string> = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days',
      };

      const interval = timeRanges[timeRange];

      const { data, error } = await supabase
        .from('analytics_events')
        .select('page_path, session_id')
        .eq('event_type', 'page_view')
        .gte('created_at', `now() - interval '${interval}'`);

      if (error) throw error;

      // تجميع حسب الصفحة
      const pageStats: Record<string, { views: number; sessions: Set<string> }> = {};

      data?.forEach(event => {
        if (event.page_path) {
          if (!pageStats[event.page_path]) {
            pageStats[event.page_path] = {
              views: 0,
              sessions: new Set(),
            };
          }
          pageStats[event.page_path].views++;
          pageStats[event.page_path].sessions.add(event.session_id);
        }
      });

      // تحويل إلى array مرتب
      return Object.entries(pageStats)
        .map(([pagePath, stats]) => ({
          pagePath,
          views: stats.views,
          uniqueVisitors: stats.sessions.size,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top pages:', error);
      return [];
    }
  }

  /**
   * توزيع الأحداث حسب النوع
   */
  static async getEventDistribution(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<EventCount[]> {
    try {
      const timeRanges: Record<string, string> = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days',
      };

      const interval = timeRanges[timeRange];

      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_type')
        .gte('created_at', `now() - interval '${interval}'`);

      if (error) throw error;

      // تجميع حسب النوع
      const eventCount: Record<string, number> = {};

      data?.forEach(event => {
        eventCount[event.event_type] = (eventCount[event.event_type] || 0) + 1;
      });

      // تحويل إلى array مرتب
      return Object.entries(eventCount)
        .map(([eventType, count]) => ({
          eventType,
          count,
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting event distribution:', error);
      return [];
    }
  }
}
