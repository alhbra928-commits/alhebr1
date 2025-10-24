import { supabase } from '../../../lib/supabase';

export interface BadgeNotifications {
  reservations: number;
  certificates: number;
  financials: number;
  notifications: number;
}

const STORAGE_KEY = 'investor_last_viewed';

export class NotificationBadgeService {
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
  static saveLastViewed(tabId: string): void {
    const data = this.getLastViewed();
    data[tabId] = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static getLastViewed(): { [key: string]: string } {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static async getNotificationCounts(phone: string): Promise<BadgeNotifications> {
    try {
      const normalizedPhone = this.normalizePhone(phone);
      console.log('📢 [NotificationBadge] Phone:', normalizedPhone);
      const lastViewed = this.getLastViewed();

      const [reservationsNew, certificatesNew, receiptsNew] = await Promise.all([
        this.getNewReservationsCount(normalizedPhone, lastViewed.reservations),
        this.getNewCertificatesCount(normalizedPhone, lastViewed.certificates),
        this.getNewReceiptsUpdatesCount(normalizedPhone, lastViewed.financials),
      ]);

      const totalNotifications = reservationsNew + certificatesNew + receiptsNew;

      return {
        reservations: reservationsNew,
        certificates: certificatesNew,
        financials: receiptsNew,
        notifications: totalNotifications
      };
    } catch (error) {
      console.error('Error getting notification counts:', error);
      return {
        reservations: 0,
        certificates: 0,
        financials: 0,
        notifications: 0
      };
    }
  }

  static async getNewReservationsCount(phone: string, lastViewed?: string): Promise<number> {
    try {
      let query = supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('customer_phone', phone)
        .is('deleted_at', null);

      if (lastViewed) {
        query = query.gt('updated_at', lastViewed);
      }

      const { count } = await query;
      return count || 0;
    } catch (error) {
      console.error('Error getting new reservations:', error);
      return 0;
    }
  }

  static async getNewCertificatesCount(phone: string, lastViewed?: string): Promise<number> {
    try {
      const { data: investor } = await supabase
        .from('investors')
        .select('id')
        .eq('phone', phone)
        .is('deleted_at', null)
        .maybeSingle();

      if (!investor) return 0;

      let query = supabase
        .from('documentation')
        .select('id', { count: 'exact', head: true })
        .eq('investor_id', investor.id)
        .is('deleted_at', null);

      if (lastViewed) {
        query = query.gt('updated_at', lastViewed);
      }

      const { count } = await query;
      return count || 0;
    } catch (error) {
      console.error('Error getting new certificates:', error);
      return 0;
    }
  }

  static async getNewReceiptsUpdatesCount(phone: string, lastViewed?: string): Promise<number> {
    try {
      const { data: reservations } = await supabase
        .from('reservations')
        .select('id')
        .eq('customer_phone', phone)
        .is('deleted_at', null);

      if (!reservations || reservations.length === 0) return 0;

      const reservationIds = reservations.map(r => r.id);

      let query = supabase
        .from('payment_receipts')
        .select('id', { count: 'exact', head: true })
        .in('reservation_id', reservationIds)
        .is('deleted_at', null)
        .in('status', ['pending', 'verified', 'rejected']);

      if (lastViewed) {
        query = query.gt('updated_at', lastViewed);
      }

      const { count } = await query;
      return count || 0;
    } catch (error) {
      console.error('Error getting receipt updates:', error);
      return 0;
    }
  }

  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static async subscribeToUpdates(
    phone: string,
    onUpdate: (counts: BadgeNotifications) => void
  ): Promise<() => void> {
    const normalizedPhone = this.normalizePhone(phone);
    console.log('🔔 [subscribeToUpdates] Phone:', normalizedPhone);

    const refreshCounts = async () => {
      const counts = await this.getNotificationCounts(normalizedPhone);
      onUpdate(counts);
    };

    await refreshCounts();

    const { data: investor } = await supabase
      .from('investors')
      .select('id')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    const channels: any[] = [];

    const reservationsChannel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `customer_phone=eq.${normalizedPhone}`
        },
        () => {
          console.log('🔔 Reservation updated');
          refreshCounts();
        }
      )
      .subscribe();

    channels.push(reservationsChannel);

    if (investor?.id) {
      const certificatesChannel = supabase
        .channel('documentation-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documentation',
            filter: `investor_id=eq.${investor.id}`
          },
          () => {
            console.log('🔔 Certificate updated');
            refreshCounts();
          }
        )
        .subscribe();

      channels.push(certificatesChannel);
    }

    const receiptsChannel = supabase
      .channel('payment-receipts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_receipts'
        },
        () => {
          console.log('🔔 Receipt updated');
          refreshCounts();
        }
      )
      .subscribe();

    channels.push(receiptsChannel);

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }
}
