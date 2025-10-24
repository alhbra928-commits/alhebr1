import { supabase } from '../../../lib/supabase';

interface SessionData {
  phone: string;
  sessionToken: string;
  investorName: string;
  expiresAt: string;
  createdAt: string;
}

const DEMO_MODE = true;
const SESSION_STORAGE_KEY = 'investor_session_data';
const SESSION_DURATION_HOURS = 24;

export class SessionManager {
  static encryptData(data: string): string {
    try {
      return btoa(encodeURIComponent(data));
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  }

  static decryptData(encrypted: string): string {
    try {
      return decodeURIComponent(atob(encrypted));
    } catch (error) {
      console.error('Decryption error:', error);
      return encrypted;
    }
  }

  static saveSession(sessionData: SessionData): void {
    try {
      const encrypted = this.encryptData(JSON.stringify(sessionData));
      localStorage.setItem(SESSION_STORAGE_KEY, encrypted);

      this.syncSessionWithDatabase(sessionData);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  static getSession(): SessionData | null {
    try {
      const encrypted = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!encrypted) return null;

      const decrypted = this.decryptData(encrypted);
      const sessionData: SessionData = JSON.parse(decrypted);

      if (this.isSessionExpired(sessionData)) {
        this.clearSession();
        return null;
      }

      this.updateLastActivity(sessionData.sessionToken);

      return sessionData;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  static isSessionExpired(sessionData: SessionData): boolean {
    if (DEMO_MODE) {
      return false;
    }

    const expiresAt = new Date(sessionData.expiresAt);
    return expiresAt < new Date();
  }

  static async clearSession(): Promise<void> {
    try {
      const sessionData = this.getSession();

      if (sessionData) {
        await supabase
          .from('investor_sessions')
          .update({
            is_active: false,
            ended_at: new Date().toISOString()
          })
          .eq('session_token', sessionData.sessionToken);
      }

      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  static async syncSessionWithDatabase(sessionData: SessionData): Promise<void> {
    try {
      await supabase
        .from('investor_sessions')
        .update({
          last_activity: new Date().toISOString()
        })
        .eq('session_token', sessionData.sessionToken);
    } catch (error) {
      console.error('Error syncing session:', error);
    }
  }

  static async updateLastActivity(sessionToken: string): Promise<void> {
    try {
      await supabase
        .from('investor_sessions')
        .update({
          last_activity: new Date().toISOString()
        })
        .eq('session_token', sessionToken);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }

  static async validateSession(sessionToken: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('investor_sessions')
        .select('is_active, expires_at')
        .eq('session_token', sessionToken)
        .maybeSingle();

      if (!data) return false;

      if (!data.is_active) return false;

      if (!DEMO_MODE) {
        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
          await this.clearSession();
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }

  static async restoreSession(): Promise<SessionData | null> {
    try {
      const sessionData = this.getSession();
      if (!sessionData) return null;

      const isValid = await this.validateSession(sessionData.sessionToken);
      if (!isValid) {
        this.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Error restoring session:', error);
      return null;
    }
  }

  static getSessionStatus(): {
    isActive: boolean;
    phone: string | null;
    expiresIn: string | null;
  } {
    const sessionData = this.getSession();

    if (!sessionData) {
      return {
        isActive: false,
        phone: null,
        expiresIn: null
      };
    }

    if (DEMO_MODE) {
      return {
        isActive: true,
        phone: sessionData.phone,
        expiresIn: 'مستمرة (وضع تجريبي)'
      };
    }

    const expiresAt = new Date(sessionData.expiresAt);
    const now = new Date();
    const hoursRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));

    return {
      isActive: true,
      phone: sessionData.phone,
      expiresIn: `${hoursRemaining} ساعة`
    };
  }

  static async getAllActiveSessions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('investor_sessions')
        .select(`
          *,
          investors(name, has_reservations)
        `)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return [];
    }
  }

  static async getSessionStats(): Promise<{
    totalActive: number;
    withReservations: number;
    withoutReservations: number;
    demoModeSessions: number;
  }> {
    try {
      const sessions = await this.getAllActiveSessions();

      return {
        totalActive: sessions.length,
        withReservations: sessions.filter((s: any) => s.investors?.has_reservations).length,
        withoutReservations: sessions.filter((s: any) => !s.investors?.has_reservations).length,
        demoModeSessions: DEMO_MODE ? sessions.length : 0
      };
    } catch (error) {
      console.error('Error fetching session stats:', error);
      return {
        totalActive: 0,
        withReservations: 0,
        withoutReservations: 0,
        demoModeSessions: 0
      };
    }
  }

  static isDemoMode(): boolean {
    return DEMO_MODE;
  }

  static getSessionDuration(): number {
    return SESSION_DURATION_HOURS;
  }
}
