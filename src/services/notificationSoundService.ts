import { supabase } from '../lib/supabase';

// =====================================
// خدمة الإشعارات الصوتية
// =====================================

export interface NotificationSound {
  type: 'new_booking' | 'payment_received' | 'urgent' | 'success';
  volume: number;
  enabled: boolean;
}

class NotificationSoundService {
  private audioContext: AudioContext | null = null;
  private settings: Record<string, NotificationSound> = {
    new_booking: { type: 'new_booking', volume: 0.7, enabled: true },
    payment_received: { type: 'payment_received', volume: 0.6, enabled: true },
    urgent: { type: 'urgent', volume: 0.8, enabled: true },
    success: { type: 'success', volume: 0.5, enabled: true }
  };

  // =====================================
  // تهيئة AudioContext
  // =====================================

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // =====================================
  // توليد صوت باستخدام Web Audio API
  // =====================================

  private playBeep(frequency: number, duration: number, volume: number, type: OscillatorType = 'sine') {
    const ctx = this.initAudioContext();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  // =====================================
  // صوت حجز جديد (نغمة إيجابية)
  // =====================================

  playNewBookingSound() {
    if (!this.settings.new_booking.enabled) return;

    const volume = this.settings.new_booking.volume;

    // نغمة ثلاثية صاعدة
    setTimeout(() => this.playBeep(523.25, 0.15, volume, 'sine'), 0);     // C5
    setTimeout(() => this.playBeep(659.25, 0.15, volume, 'sine'), 150);   // E5
    setTimeout(() => this.playBeep(783.99, 0.3, volume, 'sine'), 300);    // G5
  }

  // =====================================
  // صوت دفعة مستلمة (نغمة نقود)
  // =====================================

  playPaymentReceivedSound() {
    if (!this.settings.payment_received.enabled) return;

    const volume = this.settings.payment_received.volume;

    // نغمة "كاشينج"
    setTimeout(() => this.playBeep(800, 0.1, volume, 'square'), 0);
    setTimeout(() => this.playBeep(1000, 0.1, volume, 'square'), 80);
    setTimeout(() => this.playBeep(1200, 0.2, volume, 'sine'), 160);
  }

  // =====================================
  // صوت عاجل (تنبيه)
  // =====================================

  playUrgentSound() {
    if (!this.settings.urgent.enabled) return;

    const volume = this.settings.urgent.volume;

    // نغمة تنبيه متكررة
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.playBeep(880, 0.2, volume, 'square'), i * 400);
    }
  }

  // =====================================
  // صوت نجاح (تأكيد)
  // =====================================

  playSuccessSound() {
    if (!this.settings.success.enabled) return;

    const volume = this.settings.success.volume;

    // نغمة تأكيد قصيرة
    this.playBeep(659.25, 0.15, volume, 'sine');
  }

  // =====================================
  // تشغيل ملف صوتي (اختياري)
  // =====================================

  playAudioFile(url: string, volume: number = 0.7) {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
  }

  // =====================================
  // تحديث الإعدادات
  // =====================================

  updateSettings(type: string, updates: Partial<NotificationSound>) {
    if (this.settings[type]) {
      this.settings[type] = { ...this.settings[type], ...updates };
    }
  }

  getSettings() {
    return this.settings;
  }

  // =====================================
  // تفعيل/إيقاف الأصوات
  // =====================================

  enableSound(type: string, enabled: boolean) {
    if (this.settings[type]) {
      this.settings[type].enabled = enabled;
    }
  }

  setVolume(type: string, volume: number) {
    if (this.settings[type]) {
      this.settings[type].volume = Math.max(0, Math.min(1, volume));
    }
  }

  // =====================================
  // تفعيل/إيقاف جميع الأصوات
  // =====================================

  enableAllSounds(enabled: boolean) {
    Object.keys(this.settings).forEach(key => {
      this.settings[key].enabled = enabled;
    });
  }
}

// =====================================
// تصدير Instance واحد
// =====================================

export const notificationSoundService = new NotificationSoundService();

// =====================================
// خدمة مراقبة الحجوزات الجديدة
// =====================================

export class BookingNotificationMonitor {
  private subscription: any = null;
  private lastBookingTime: number = Date.now();
  private isMonitoring: boolean = false;

  // =====================================
  // بدء المراقبة
  // =====================================

  startMonitoring() {
    if (this.isMonitoring) {
      console.log('Already monitoring bookings');
      return;
    }

    console.log('Starting booking notification monitor...');
    this.isMonitoring = true;

    // الاشتراك في تحديثات جدول reservations
    this.subscription = supabase
      .channel('booking_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          console.log('New booking detected:', payload);
          this.handleNewBooking(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservations',
          filter: 'booking_status=eq.documented'
        },
        (payload) => {
          console.log('Booking documented:', payload);
          notificationSoundService.playSuccessSound();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
  }

  // =====================================
  // إيقاف المراقبة
  // =====================================

  stopMonitoring() {
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
      this.subscription = null;
      this.isMonitoring = false;
      console.log('Stopped booking notification monitor');
    }
  }

  // =====================================
  // معالجة حجز جديد
  // =====================================

  private handleNewBooking(booking: any) {
    // تجنب تشغيل الصوت للحجوزات القديمة عند تحميل الصفحة
    const bookingTime = new Date(booking.created_at).getTime();
    const timeDiff = Date.now() - bookingTime;

    // فقط إذا كان الحجز جديد (أقل من 10 ثواني)
    if (timeDiff < 10000) {
      notificationSoundService.playNewBookingSound();

      // إظهار إشعار متصفح (اختياري)
      this.showBrowserNotification(booking);
    }
  }

  // =====================================
  // إشعار المتصفح
  // =====================================

  private showBrowserNotification(booking: any) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('حجز جديد!', {
        body: `تم استلام حجز جديد من مستثمر`,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'new-booking',
        requireInteraction: false
      });
    }
  }

  // =====================================
  // طلب إذن الإشعارات
  // =====================================

  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  // =====================================
  // حالة المراقبة
  // =====================================

  isActive() {
    return this.isMonitoring;
  }
}

// =====================================
// تصدير Instance واحد
// =====================================

export const bookingNotificationMonitor = new BookingNotificationMonitor();
