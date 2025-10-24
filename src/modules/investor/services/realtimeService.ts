import { supabase } from '../../../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface BookingUpdate {
  id: string;
  booking_status: string;
  payment_status: string;
  updated_at: string;
}

export class RealtimeService {
  private static channel: RealtimeChannel | null = null;

  /**
   * الاشتراك في تحديثات الحجز في الوقت الفعلي
   */
  static subscribeToBookingUpdates(
    phone: string,
    onUpdate: (booking: BookingUpdate) => void
  ): RealtimeChannel {
    console.log('🔔 Subscribing to realtime updates for phone:', phone);

    // إلغاء الاشتراك السابق إذا وُجد
    if (this.channel) {
      this.unsubscribe();
    }

    // إنشاء قناة جديدة
    this.channel = supabase
      .channel(`bookings_${phone}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservations',
          filter: `customer_phone=eq.${phone}`
        },
        (payload) => {
          console.log('✅ Realtime update received:', payload);

          if (payload.new) {
            onUpdate({
              id: payload.new.id,
              booking_status: payload.new.booking_status,
              payment_status: payload.new.payment_status,
              updated_at: payload.new.updated_at
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    return this.channel;
  }

  /**
   * الاشتراك في تحديثات إيصالات السداد
   */
  static subscribeToReceiptUpdates(
    phone: string,
    onUpdate: (receipt: any) => void
  ): RealtimeChannel {
    console.log('🔔 Subscribing to receipt updates for phone:', phone);

    const channel = supabase
      .channel(`receipts_${phone}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payment_receipts',
          filter: `investor_phone=eq.${phone}`
        },
        (payload) => {
          console.log('✅ Receipt update received:', payload);

          if (payload.new) {
            onUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Receipt subscription status:', status);
      });

    return channel;
  }

  /**
   * إلغاء الاشتراك في التحديثات
   */
  static unsubscribe(): void {
    if (this.channel) {
      console.log('🔕 Unsubscribing from realtime updates');
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  /**
   * إلغاء جميع الاشتراكات
   */
  static unsubscribeAll(): void {
    console.log('🔕 Unsubscribing from all realtime channels');
    supabase.removeAllChannels();
    this.channel = null;
  }

  /**
   * التحقق من حالة الاتصال
   */
  static getConnectionStatus(): string {
    if (!this.channel) {
      return 'not_connected';
    }
    return this.channel.state;
  }
}
