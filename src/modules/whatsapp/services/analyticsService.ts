import { supabase } from '../../../lib/supabase';

export interface AnalyticsData {
  messages_sent_today: number;
  messages_sent_week: number;
  messages_sent_month: number;
  success_rate: number;
  failed_count: number;
  top_template: {
    name: string;
    usage_count: number;
  } | null;
  top_event: {
    event_type: string;
    count: number;
  } | null;
  messages_by_direction: {
    outbound: number;
    inbound: number;
  };
  messages_by_status: {
    pending: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  messages_by_user_type: {
    investor: number;
    owner: number;
    visitor: number;
    unknown: number;
  };
  smart_button?: {
    total_conversations: number;
    ai_handled: number;
    human_escalated: number;
    ai_success_rate: number;
    top_intent: string | null;
    satisfaction_score: number;
  };
  ai_learning?: {
    total_learned: number;
    pending_approval: number;
    approved_patterns: number;
  };
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface EventAnalytics {
  event_type: string;
  total_messages: number;
  success_count: number;
  failed_count: number;
  success_rate: number;
}

class AnalyticsService {
  async getAnalytics(filters?: {
    start_date?: string;
    end_date?: string;
    user_type?: string;
    event_type?: string;
  }): Promise<AnalyticsData> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Messages sent today
    const { count: todayCount } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('direction', 'outbound')
      .gte('created_at', today.toISOString());

    // Messages sent this week
    const { count: weekCount } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('direction', 'outbound')
      .gte('created_at', weekAgo.toISOString());

    // Messages sent this month
    const { count: monthCount } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('direction', 'outbound')
      .gte('created_at', monthAgo.toISOString());

    // Success and failure counts
    const { count: successCount } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('direction', 'outbound')
      .in('status', ['sent', 'delivered', 'read'])
      .gte('created_at', today.toISOString());

    const { count: failedCount } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('direction', 'outbound')
      .eq('status', 'failed')
      .gte('created_at', today.toISOString());

    const successRate = todayCount > 0 ? ((successCount || 0) / todayCount) * 100 : 0;

    // Top template
    const { data: topTemplateData } = await supabase
      .from('whatsapp_templates')
      .select('name, usage_count')
      .order('usage_count', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Top event type
    const { data: messagesWithEvents } = await supabase
      .from('whatsapp_messages')
      .select('event_type')
      .not('event_type', 'is', null);

    const eventCounts: Record<string, number> = {};
    messagesWithEvents?.forEach((msg) => {
      if (msg.event_type) {
        eventCounts[msg.event_type] = (eventCounts[msg.event_type] || 0) + 1;
      }
    });

    const topEvent = Object.keys(eventCounts).length > 0
      ? Object.entries(eventCounts).sort((a, b) => b[1] - a[1])[0]
      : null;

    // Messages by direction
    const { count: outboundCount } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('direction', 'outbound');

    const { count: inboundCount } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('direction', 'inbound');

    // Messages by status
    const statuses = ['pending', 'sent', 'delivered', 'read', 'failed'];
    const statusCounts: any = {};

    for (const status of statuses) {
      const { count } = await supabase
        .from('whatsapp_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      statusCounts[status] = count || 0;
    }

    // Messages by user type (from inbox threads)
    const { data: threads } = await supabase
      .from('whatsapp_inbox_threads')
      .select('user_type, user_phone');

    const userTypeCounts = {
      investor: 0,
      owner: 0,
      visitor: 0,
      unknown: 0
    };

    threads?.forEach((thread) => {
      const type = thread.user_type || 'unknown';
      if (type in userTypeCounts) {
        userTypeCounts[type as keyof typeof userTypeCounts]++;
      }
    });

    const { data: aiAnalytics } = await supabase
      .from('ai_analytics')
      .select('*')
      .eq('date', today.toISOString().split('T')[0])
      .maybeSingle();

    const { data: smartButtonStats } = await supabase
      .from('smart_button_stats')
      .select('*')
      .eq('date', today.toISOString().split('T')[0])
      .maybeSingle();

    const { count: totalLearned } = await supabase
      .from('auto_learning_logs')
      .select('*', { count: 'exact', head: true })
      .eq('learned_at', null, { negate: true });

    const { count: pendingApproval } = await supabase
      .from('auto_learning_logs')
      .select('*', { count: 'exact', head: true })
      .eq('should_add_to_kb', true)
      .eq('is_approved', false);

    const { count: approvedPatterns } = await supabase
      .from('auto_learning_logs')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true);

    const totalConversations = (smartButtonStats?.total_messages || 0);
    const aiHandled = (smartButtonStats?.auto_responses_sent || 0);
    const aiSuccessRate = totalConversations > 0
      ? Math.round((aiHandled / totalConversations) * 1000) / 10
      : 0;

    return {
      messages_sent_today: todayCount || 0,
      messages_sent_week: weekCount || 0,
      messages_sent_month: monthCount || 0,
      success_rate: Math.round(successRate * 10) / 10,
      failed_count: failedCount || 0,
      top_template: topTemplateData
        ? { name: topTemplateData.name, usage_count: topTemplateData.usage_count }
        : null,
      top_event: topEvent
        ? { event_type: topEvent[0], count: topEvent[1] }
        : null,
      messages_by_direction: {
        outbound: outboundCount || 0,
        inbound: inboundCount || 0
      },
      messages_by_status: statusCounts,
      messages_by_user_type: userTypeCounts,
      smart_button: {
        total_conversations: totalConversations,
        ai_handled: aiHandled,
        human_escalated: (aiAnalytics?.human_escalated || 0),
        ai_success_rate: aiSuccessRate,
        top_intent: (aiAnalytics?.top_intent || null),
        satisfaction_score: (aiAnalytics?.satisfaction_score || 0)
      },
      ai_learning: {
        total_learned: totalLearned || 0,
        pending_approval: pendingApproval || 0,
        approved_patterns: approvedPatterns || 0
      }
    };
  }

  async getTimeSeriesData(days: number = 7): Promise<TimeSeriesData[]> {
    const result: TimeSeriesData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const { count } = await supabase
        .from('whatsapp_messages')
        .select('*', { count: 'exact', head: true })
        .eq('direction', 'outbound')
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString());

      result.push({
        date: date.toISOString().split('T')[0],
        count: count || 0
      });
    }

    return result;
  }

  async getEventAnalytics(): Promise<EventAnalytics[]> {
    const { data: messages } = await supabase
      .from('whatsapp_messages')
      .select('event_type, status')
      .not('event_type', 'is', null);

    const eventStats: Record<string, { total: number; success: number; failed: number }> = {};

    messages?.forEach((msg) => {
      if (!msg.event_type) return;

      if (!eventStats[msg.event_type]) {
        eventStats[msg.event_type] = { total: 0, success: 0, failed: 0 };
      }

      eventStats[msg.event_type].total++;

      if (['sent', 'delivered', 'read'].includes(msg.status)) {
        eventStats[msg.event_type].success++;
      } else if (msg.status === 'failed') {
        eventStats[msg.event_type].failed++;
      }
    });

    return Object.entries(eventStats).map(([event_type, stats]) => ({
      event_type,
      total_messages: stats.total,
      success_count: stats.success,
      failed_count: stats.failed,
      success_rate: stats.total > 0 ? Math.round((stats.success / stats.total) * 1000) / 10 : 0
    }));
  }

  async exportData(format: 'json' | 'csv' = 'json') {
    const analytics = await this.getAnalytics();
    const timeSeries = await this.getTimeSeriesData(30);
    const eventAnalytics = await this.getEventAnalytics();

    const exportData = {
      analytics,
      timeSeries,
      eventAnalytics,
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else {
      // Convert to CSV
      let csv = 'WhatsApp Analytics Report\n\n';
      csv += 'Summary\n';
      csv += `Messages Sent Today,${analytics.messages_sent_today}\n`;
      csv += `Messages Sent Week,${analytics.messages_sent_week}\n`;
      csv += `Messages Sent Month,${analytics.messages_sent_month}\n`;
      csv += `Success Rate,${analytics.success_rate}%\n`;
      csv += `Failed Count,${analytics.failed_count}\n\n`;

      csv += 'Time Series Data\n';
      csv += 'Date,Count\n';
      timeSeries.forEach(row => {
        csv += `${row.date},${row.count}\n`;
      });

      csv += '\nEvent Analytics\n';
      csv += 'Event Type,Total,Success,Failed,Success Rate\n';
      eventAnalytics.forEach(row => {
        csv += `${row.event_type},${row.total_messages},${row.success_count},${row.failed_count},${row.success_rate}%\n`;
      });

      return csv;
    }
  }
}

export const analyticsService = new AnalyticsService();
