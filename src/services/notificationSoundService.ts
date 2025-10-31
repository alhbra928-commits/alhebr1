// Notification Sound Service

interface SoundSettings {
  enabled: boolean;
  volume: number;
}

interface NotificationSettings {
  new_booking: SoundSettings;
  payment_received: SoundSettings;
  urgent: SoundSettings;
  success: SoundSettings;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  new_booking: { enabled: true, volume: 0.7 },
  payment_received: { enabled: true, volume: 0.6 },
  urgent: { enabled: true, volume: 0.8 },
  success: { enabled: true, volume: 0.5 }
};

class NotificationSoundService {
  private settings: NotificationSettings;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem('notification_sound_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('notification_sound_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  enableSound(type: keyof NotificationSettings, enabled: boolean) {
    this.settings[type].enabled = enabled;
    this.saveSettings();
  }

  setVolume(type: keyof NotificationSettings, volume: number) {
    this.settings[type].volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  private playTone(frequency: number, duration: number, volume: number) {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  }

  playNewBookingSound() {
    if (!this.settings.new_booking.enabled) return;
    const vol = this.settings.new_booking.volume;
    this.playTone(800, 0.15, vol);
    setTimeout(() => this.playTone(1000, 0.15, vol), 150);
  }

  playPaymentReceivedSound() {
    if (!this.settings.payment_received.enabled) return;
    const vol = this.settings.payment_received.volume;
    this.playTone(600, 0.2, vol);
    setTimeout(() => this.playTone(800, 0.2, vol), 200);
  }

  playUrgentSound() {
    if (!this.settings.urgent.enabled) return;
    const vol = this.settings.urgent.volume;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.playTone(1200, 0.1, vol), i * 150);
    }
  }

  playSuccessSound() {
    if (!this.settings.success.enabled) return;
    const vol = this.settings.success.volume;
    this.playTone(500, 0.1, vol);
    setTimeout(() => this.playTone(700, 0.1, vol), 100);
    setTimeout(() => this.playTone(900, 0.15, vol), 200);
  }
}

class BookingNotificationMonitor {
  private active = false;
  private intervalId: number | null = null;

  isActive(): boolean {
    return this.active;
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'granted') return true;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  startMonitoring() {
    this.active = true;
    console.log('Booking notification monitoring started');
  }

  stopMonitoring() {
    this.active = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Booking notification monitoring stopped');
  }
}

export const notificationSoundService = new NotificationSoundService();
export const bookingNotificationMonitor = new BookingNotificationMonitor();
