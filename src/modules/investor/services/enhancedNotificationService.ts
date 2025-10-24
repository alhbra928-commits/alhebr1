import { supabase } from '../../../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  investor_id: string;
  reservation_id?: string;
  type: string;
  title_ar: string;
  message_ar: string;
  status: string;
  is_read: boolean;
  priority: string;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

export interface ConnectionStatus {
  status: 'connected' | 'connecting' | 'disconnected';
  lastUpdate: Date;
}

export class EnhancedNotificationService {
  private static notificationChannel: RealtimeChannel | null = null;
  private static reservationChannel: RealtimeChannel | null = null;
  private static connectionStatusCallback: ((status: ConnectionStatus) => void) | null = null;
  private static reconnectTimer: NodeJS.Timeout | null = null;
  private static pollTimer: NodeJS.Timeout | null = null;
  private static lastConnectionCheck = new Date();

  /**
   * تطبيع رقم الهاتف
   */
  private static normalizePhone(phone: string): string {
    if (!phone) return phone;
    let normalized = phone.trim();
    if (normalized.startsWith('+966')) {
      normalized = normalized.substring(4);
    } else if (normalized.startsWith('966')) {
      normalized = normalized.substring(3);
    } else if (normalized.startsWith('00966')) {
      normalized = normalized.substring(5);
    }
    if (normalized.startsWith('0')) {
      normalized = normalized.substring(1);
    }
    normalized = normalized.replace(/\s/g, '');
    return normalized;
  }

  /**
   * الاشتراك في إشعارات المستثمر مع معالجة الأخطاء
   */
  static async subscribeToNotifications(
    phone: string,
    onNotification: (notification: Notification) => void,
    onConnectionChange?: (status: ConnectionStatus) => void
  ): Promise<RealtimeChannel> {
    const normalizedPhone = this.normalizePhone(phone);
    console.log('🔔 [Notifications] Subscribing - Original:', phone, 'Normalized:', normalizedPhone);

    // حفظ callback حالة الاتصال
    if (onConnectionChange) {
      this.connectionStatusCallback = onConnectionChange;
    }

    // إلغاء الاشتراك السابق
    if (this.notificationChannel) {
      await this.unsubscribeFromNotifications();
    }

    try {
      // الحصول على investor_id
      const { data: investor } = await supabase
        .from('investors')
        .select('id')
        .eq('phone', normalizedPhone)
        .is('deleted_at', null)
        .maybeSingle();

      if (!investor) {
        console.error('❌ [Notifications] Investor not found');
        this.updateConnectionStatus('disconnected');
        return null as any;
      }

      this.updateConnectionStatus('connecting');

      // إنشاء قناة الإشعارات
      this.notificationChannel = supabase
        .channel(`notifications_${investor.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `investor_id=eq.${investor.id}`
          },
          (payload) => {
            console.log('✅ [Notifications] New notification received:', payload.new);
            onNotification(payload.new as Notification);
            this.updateConnectionStatus('connected');
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `investor_id=eq.${investor.id}`
          },
          (payload) => {
            console.log('🔄 [Notifications] Notification updated:', payload.new);
            onNotification(payload.new as Notification);
            this.updateConnectionStatus('connected');
          }
        )
        .subscribe((status, err) => {
          console.log('📡 [Notifications] Subscription status:', status);

          if (err) {
            console.error('❌ [Notifications] Subscription error:', err);
            this.updateConnectionStatus('disconnected');
            this.startReconnectTimer(phone, onNotification, onConnectionChange);
            this.startPollingFallback(phone, onNotification);
            return;
          }

          if (status === 'SUBSCRIBED') {
            console.log('✅ [Notifications] Successfully subscribed, setting status to connected');
            this.updateConnectionStatus('connected');
            this.stopPollingFallback();

            // تأكيد الاتصال بعد 2 ثانية إذا لم يتغير
            setTimeout(() => {
              console.log('🔄 [Notifications] Confirming connection status');
              this.updateConnectionStatus('connected');
            }, 2000);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.updateConnectionStatus('disconnected');
            this.startReconnectTimer(phone, onNotification, onConnectionChange);
            this.startPollingFallback(phone, onNotification);
          } else if (status === 'CLOSED') {
            console.log('⚠️ [Notifications] Channel closed, reconnecting...');
            this.updateConnectionStatus('connecting');
            this.startReconnectTimer(phone, onNotification, onConnectionChange);
          }
        });

      return this.notificationChannel;
    } catch (error) {
      console.error('❌ [Notifications] Subscription failed:', error);
      this.updateConnectionStatus('disconnected');
      this.startPollingFallback(phone, onNotification);
      throw error;
    }
  }

  /**
   * الاشتراك في تحديثات الحجوزات
   */
  static async subscribeToReservationUpdates(
    phone: string,
    onUpdate: (reservation: any) => void
  ): Promise<RealtimeChannel> {
    const normalizedPhone = this.normalizePhone(phone);
    console.log('🔔 [Reservations] Subscribing - Original:', phone, 'Normalized:', normalizedPhone);

    if (this.reservationChannel) {
      await this.unsubscribeFromReservations();
    }

    this.reservationChannel = supabase
      .channel(`reservations_${normalizedPhone}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservations',
          filter: `customer_phone=eq.${normalizedPhone}`
        },
        (payload) => {
          console.log('✅ [Reservations] Update received:', payload.new);
          onUpdate(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('📡 [Reservations] Subscription status:', status);
      });

    return this.reservationChannel;
  }

  /**
   * جلب الإشعارات غير المقروءة
   */
  static async getUnreadNotifications(phone: string): Promise<Notification[]> {
    try {
      const normalizedPhone = this.normalizePhone(phone);
      console.log('📬 [getUnreadNotifications] Phone:', normalizedPhone);

      const { data: investor } = await supabase
        .from('investors')
        .select('id')
        .eq('phone', normalizedPhone)
        .is('deleted_at', null)
        .maybeSingle();

      if (!investor) {
        console.log('❌ [getUnreadNotifications] Investor not found');
        return [];
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('investor_id', investor.id)
        .eq('status', 'unread')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      console.log('✅ [getUnreadNotifications] Found', data?.length || 0, 'notifications');
      return data as Notification[];
    } catch (error) {
      console.error('Error in getUnreadNotifications:', error);
      return [];
    }
  }

  /**
   * جلب عدد الإشعارات غير المقروءة
   */
  static async getUnreadCount(phone: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_unread_notifications_count', { p_investor_phone: phone });

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  /**
   * تحديد إشعار كمقروء
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'read',
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  }

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  static async markAllAsRead(phone: string): Promise<void> {
    try {
      const { data: investor } = await supabase
        .from('investors')
        .select('id')
        .eq('phone', phone)
        .is('deleted_at', null)
        .single();

      if (!investor) {
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'read',
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('investor_id', investor.id)
        .eq('status', 'unread');

      if (error) {
        console.error('Error marking all as read:', error);
      }
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  }

  /**
   * إلغاء الاشتراك في الإشعارات
   */
  static async unsubscribeFromNotifications(): Promise<void> {
    if (this.notificationChannel) {
      console.log('🔕 [Notifications] Unsubscribing...');
      await supabase.removeChannel(this.notificationChannel);
      this.notificationChannel = null;
    }
    this.stopReconnectTimer();
    this.stopPollingFallback();
  }

  /**
   * إلغاء الاشتراك في الحجوزات
   */
  static async unsubscribeFromReservations(): Promise<void> {
    if (this.reservationChannel) {
      console.log('🔕 [Reservations] Unsubscribing...');
      await supabase.removeChannel(this.reservationChannel);
      this.reservationChannel = null;
    }
  }

  /**
   * إلغاء جميع الاشتراكات
   */
  static async unsubscribeAll(): Promise<void> {
    await this.unsubscribeFromNotifications();
    await this.unsubscribeFromReservations();
    this.connectionStatusCallback = null;
  }

  /**
   * تحديث حالة الاتصال
   */
  private static updateConnectionStatus(status: 'connected' | 'connecting' | 'disconnected'): void {
    this.lastConnectionCheck = new Date();

    if (this.connectionStatusCallback) {
      this.connectionStatusCallback({
        status,
        lastUpdate: this.lastConnectionCheck
      });
    }
  }

  /**
   * بدء مؤقت إعادة الاتصال
   */
  private static startReconnectTimer(
    phone: string,
    onNotification: (notification: Notification) => void,
    onConnectionChange?: (status: ConnectionStatus) => void
  ): void {
    if (this.reconnectTimer) {
      return;
    }

    console.log('🔄 [Notifications] Starting reconnect timer (10s)...');

    this.reconnectTimer = setTimeout(async () => {
      console.log('🔄 [Notifications] Attempting to reconnect...');
      this.reconnectTimer = null;

      try {
        await this.subscribeToNotifications(phone, onNotification, onConnectionChange);
      } catch (error) {
        console.error('❌ [Notifications] Reconnect failed:', error);
      }
    }, 10000);
  }

  /**
   * إيقاف مؤقت إعادة الاتصال
   */
  private static stopReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * بدء الاستطلاع الاحتياطي (Polling Fallback)
   */
  private static startPollingFallback(
    phone: string,
    onNotification: (notification: Notification) => void
  ): void {
    if (this.pollTimer) {
      return;
    }

    console.log('📊 [Notifications] Starting polling fallback (15s)...');

    let lastCheck = new Date();

    this.pollTimer = setInterval(async () => {
      try {
        const { data: investor } = await supabase
          .from('investors')
          .select('id')
          .eq('phone', phone)
          .is('deleted_at', null)
          .single();

        if (!investor) {
          return;
        }

        // جلب الإشعارات الجديدة منذ آخر فحص
        const { data: newNotifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('investor_id', investor.id)
          .gt('created_at', lastCheck.toISOString())
          .order('created_at', { ascending: false });

        if (newNotifications && newNotifications.length > 0) {
          console.log('📊 [Polling] Found new notifications:', newNotifications.length);
          newNotifications.forEach(notification => {
            onNotification(notification as Notification);
          });
        }

        lastCheck = new Date();
      } catch (error) {
        console.error('❌ [Polling] Error:', error);
      }
    }, 15000);
  }

  /**
   * إيقاف الاستطلاع الاحتياطي
   */
  private static stopPollingFallback(): void {
    if (this.pollTimer) {
      console.log('🛑 [Notifications] Stopping polling fallback...');
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * الحصول على حالة الاتصال الحالية
   */
  static getConnectionStatus(): ConnectionStatus {
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - this.lastConnectionCheck.getTime();

    let status: 'connected' | 'connecting' | 'disconnected' = 'disconnected';

    if (this.notificationChannel?.state === 'joined') {
      status = 'connected';
    } else if (timeSinceLastCheck < 10000) {
      status = 'connecting';
    }

    return {
      status,
      lastUpdate: this.lastConnectionCheck
    };
  }
}
