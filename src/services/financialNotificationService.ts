import { supabase } from '../lib/supabase';

export interface FinancialNotification {
  id: string;
  title_ar: string;
  message_ar: string;
  type: string;
  is_read: boolean;
  related_id: string;
  related_type: string;
  priority: string;
  action_url: string;
  created_at: string;
}

export class FinancialNotificationService {
  static async getUnreadFinancialCompletionNotifications(): Promise<FinancialNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'financial_completion')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching financial notifications:', error);
      return [];
    }

    return data || [];
  }

  static async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  static async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('type', 'financial_completion')
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  static subscribeToFinancialNotifications(
    callback: (notification: FinancialNotification) => void
  ) {
    const channel = supabase
      .channel('financial-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'type=eq.financial_completion'
        },
        (payload) => {
          callback(payload.new as FinancialNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
