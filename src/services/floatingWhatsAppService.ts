import { supabase } from '../lib/supabase';

export interface FloatingWhatsAppSettings {
  id: string;
  is_enabled: boolean;
  button_position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  button_color_primary: string;
  button_color_secondary: string;
  pulse_enabled: boolean;
  pulse_interval_seconds: number;
  tooltip_text_ar: string;
  tooltip_text_en: string;
  auto_suggest_enabled: boolean;
  auto_suggest_delay_seconds: number;
  notification_sound_enabled: boolean;
  session_tracking_enabled: boolean;
}

export interface ContactNumber {
  id: string;
  department: string;
  department_name_ar: string;
  department_name_en: string;
  phone_number: string;
  welcome_message_ar?: string;
  welcome_message_en?: string;
  icon?: string;
  is_active: boolean;
  display_order: number;
  user_types: string[];
}

export interface UserSession {
  id?: string;
  session_id: string;
  user_type: 'visitor' | 'investor' | 'owner' | 'admin';
  user_id?: string;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  current_page?: string;
  current_farm_code?: string;
  current_farm_name?: string;
  context_data?: any;
  ip_address?: string;
  user_agent?: string;
  last_activity_at?: string;
}

export interface ContextLog {
  session_id: string;
  user_type: string;
  user_id?: string;
  user_name?: string;
  user_phone?: string;
  page_url?: string;
  page_name?: string;
  farm_code?: string;
  farm_name?: string;
  department?: string;
  contact_number?: string;
  message_text: string;
  context_data?: any;
  ip_address?: string;
}

export interface UserContext {
  userType: 'visitor' | 'investor' | 'owner' | 'admin';
  userId?: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  currentPage: string;
  currentFarmCode?: string;
  currentFarmName?: string;
  sessionId: string;
}

class FloatingWhatsAppService {
  private sessionId: string | null = null;
  private activityCheckInterval: NodeJS.Timeout | null = null;

  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = localStorage.getItem('whatsapp_session_id') || this.generateSessionId();
      localStorage.setItem('whatsapp_session_id', this.sessionId);
    }
    return this.sessionId;
  }

  async getSettings(): Promise<FloatingWhatsAppSettings | null> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_floating_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) return [];
      return data;
    } catch (error) {
      console.error('Error loading floating WhatsApp settings:', error);
      return null;
    }
  }

  async getContactNumbers(userType: string): Promise<ContactNumber[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_contact_numbers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) return [];

      return (data || []).filter(contact =>
        contact.user_types.includes(userType)
      );
    } catch (error) {
      console.error('Error loading contact numbers:', error);
      return [];
    }
  }

  async createOrUpdateSession(session: UserSession): Promise<boolean> {
    try {
      // Use upsert to handle both insert and update in one operation
      const { error } = await supabase
        .from('whatsapp_user_sessions')
        .upsert({
          ...session,
          last_activity_at: new Date().toISOString()
        }, {
          onConflict: 'session_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error upserting session:', error);
        return false;
      }

      this.startActivityTracking();
      return true;
    } catch (error) {
      console.error('Error creating/updating session:', error);
      return false;
    }
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await supabase
        .from('whatsapp_user_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('session_id', sessionId);
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  startActivityTracking(): void {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
    }

    this.activityCheckInterval = setInterval(() => {
      const sessionId = this.getSessionId();
      this.updateSessionActivity(sessionId);
    }, 30000);
  }

  stopActivityTracking(): void {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }
  }

  async logContext(log: ContextLog): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('whatsapp_context_logs')
        .insert([log]);

      if (error) return [];
      return true;
    } catch (error) {
      console.error('Error logging context:', error);
      return false;
    }
  }

  buildWhatsAppMessage(context: UserContext, department: ContactNumber): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let message = `مرحباً 👋\n\nأرغب بالتواصل بخصوص: ${department.department_name_ar}\n\n`;

    const userTypeNames: Record<string, string> = {
      visitor: 'زائر',
      investor: 'مستثمر مسجل',
      owner: 'صاحب مزرعة',
      admin: 'إداري'
    };

    message += `👤 المرسل: ${userTypeNames[context.userType] || 'زائر'}\n`;

    if (context.userName) {
      message += `📝 الاسم: ${context.userName}\n`;
    }

    if (context.currentFarmCode) {
      message += `🌾 المزرعة: ${context.currentFarmName || context.currentFarmCode}\n`;
      message += `#️⃣ رقم المزرعة: ${context.currentFarmCode}\n`;
    }

    message += `📍 الصفحة: ${this.getPageNameArabic(context.currentPage)}\n`;
    message += `🕒 الوقت: ${dateStr} - ${timeStr}\n`;

    return message;
  }

  getPageNameArabic(page: string): string {
    const pageNames: Record<string, string> = {
      'home': 'الصفحة الرئيسية',
      'farms': 'قائمة المزارع',
      'farm-detail': 'تفاصيل المزرعة',
      'booking': 'صفحة الحجز',
      'investor-dashboard': 'لوحة المستثمر',
      'owner-dashboard': 'لوحة صاحب المزرعة',
      'admin-dashboard': 'لوحة الإدارة',
      'documentation': 'التوثيق',
      'finance': 'المالية',
      'reservations': 'الحجوزات'
    };

    return pageNames[page] || page;
  }

  async openWhatsApp(
    context: UserContext,
    department: ContactNumber
  ): Promise<void> {
    const message = this.buildWhatsAppMessage(context, department);
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = department.phone_number.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    await this.logContext({
      session_id: context.sessionId,
      user_type: context.userType,
      user_id: context.userId,
      user_name: context.userName,
      user_phone: context.userPhone,
      page_url: window.location.href,
      page_name: context.currentPage,
      farm_code: context.currentFarmCode,
      farm_name: context.currentFarmName,
      department: department.department,
      contact_number: department.phone_number,
      message_text: message,
      context_data: { department_name: department.department_name_ar }
    });

    window.open(whatsappUrl, '_blank');
  }

  async getActiveSessions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity_at', { ascending: false });

      if (error) return [];
      return data || [];
    } catch (error) {
      console.error('Error loading active sessions:', error);
      return [];
    }
  }

  async getContextLogs(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_context_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return [];
      return data || [];
    } catch (error) {
      console.error('Error loading context logs:', error);
      return [];
    }
  }

  async updateSettings(settings: Partial<FloatingWhatsAppSettings>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('whatsapp_floating_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (error) return [];
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }

  async updateContactNumber(id: string, updates: Partial<ContactNumber>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('whatsapp_contact_numbers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating contact number:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error updating contact number:', error);
      return false;
    }
  }

  async addContactNumber(contact: Omit<ContactNumber, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('whatsapp_contact_numbers')
        .insert([contact]);

      if (error) {
        console.error('Error adding contact number:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error adding contact number:', error);
      return false;
    }
  }

  async deleteContactNumber(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('whatsapp_contact_numbers')
        .delete()
        .eq('id', id);

      if (error) return [];
      return true;
    } catch (error) {
      console.error('Error deleting contact number:', error);
      return false;
    }
  }
}

export const floatingWhatsAppService = new FloatingWhatsAppService();
