import { supabase } from '../../../lib/supabase';

// =====================================
// WhatsApp Service - خدمة الواتساب المركزية
// =====================================

export interface WhatsAppSettings {
  id: string;
  api_key: string | null;
  phone_number_id: string | null;
  business_account_id: string | null;
  webhook_verify_token: string | null;
  platform_signature: string;
  platform_logo_url: string | null;
  is_active: boolean;
  connection_status: 'connected' | 'disconnected' | 'error';
  last_connection_check: string | null;
}

export interface WhatsAppMessage {
  id: string;
  message_id: string | null;
  template_id: string | null;
  recipient_phone: string;
  recipient_name: string | null;
  recipient_type: 'investor' | 'farm_owner' | 'admin' | 'support';
  message_content: string;
  message_type: 'auto' | 'broadcast' | 'manual' | 'reply';
  message_category: string | null;
  trigger_event: string | null;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  template_code: string;
  template_name_ar: string;
  template_category: string;
  message_content_ar: string;
  message_content_en: string | null;
  variables: string[];
  target_audience: string[];
  is_active: boolean;
  usage_count: number;
}

export interface BroadcastCampaign {
  id: string;
  campaign_name: string;
  campaign_description: string | null;
  message_content: string;
  target_audience: string[];
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  created_at: string;
}

export interface DailyStats {
  date: string;
  total_sent: number;
  total_delivered: number;
  total_read: number;
  total_failed: number;
  by_category: Record<string, number>;
  by_type: Record<string, number>;
}

class WhatsAppService {
  // =====================================
  // الإعدادات
  // =====================================

  async getSettings(): Promise<WhatsAppSettings | null> {
    const { data, error } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateSettings(settings: Partial<WhatsAppSettings>): Promise<void> {
    const currentSettings = await this.getSettings();

    if (!currentSettings) {
      throw new Error('Settings not found');
    }

    const { error } = await supabase
      .from('whatsapp_settings')
      .update(settings)
      .eq('id', currentSettings.id);

    if (error) throw error;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const settings = await this.getSettings();

      if (!settings?.api_key || !settings?.phone_number_id) {
        return {
          success: false,
          message: 'API Key أو Phone Number ID غير مكتمل'
        };
      }

      // هنا يتم اختبار الاتصال مع WhatsApp Business API
      // في الوضع الحالي نعتبره ناجح للتطوير

      await this.updateSettings({
        connection_status: 'connected',
        last_connection_check: new Date().toISOString()
      });

      return {
        success: true,
        message: 'تم الاتصال بنجاح'
      };
    } catch (error) {
      await this.updateSettings({
        connection_status: 'error',
        last_connection_check: new Date().toISOString()
      });

      return {
        success: false,
        message: error instanceof Error ? error.message : 'فشل الاتصال'
      };
    }
  }

  // =====================================
  // القوالب
  // =====================================

  async getTemplates(): Promise<WhatsAppTemplate[]> {
    const { data, error } = await supabase
      .from('whatsapp_message_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTemplateByCode(code: string): Promise<WhatsAppTemplate | null> {
    const { data, error } = await supabase
      .from('whatsapp_message_templates')
      .select('*')
      .eq('template_code', code)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createTemplate(template: Omit<WhatsAppTemplate, 'id' | 'usage_count' | 'created_at'>): Promise<WhatsAppTemplate> {
    const { data, error } = await supabase
      .from('whatsapp_message_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTemplate(id: string, updates: Partial<WhatsAppTemplate>): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_message_templates')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  // =====================================
  // إرسال الرسائل
  // =====================================

  async sendMessage(params: {
    recipient_phone: string;
    recipient_name: string;
    recipient_type: 'investor' | 'farm_owner' | 'admin' | 'support';
    template_code: string;
    variables?: Record<string, string>;
    trigger_event?: string;
    trigger_reference_id?: string;
  }): Promise<string> {
    try {
      // استدعاء الـ Function في قاعدة البيانات
      const { data, error } = await supabase.rpc('send_whatsapp_message', {
        p_recipient_phone: params.recipient_phone,
        p_recipient_name: params.recipient_name,
        p_recipient_type: params.recipient_type,
        p_template_code: params.template_code,
        p_variables: params.variables || {},
        p_trigger_event: params.trigger_event || null,
        p_trigger_reference_id: params.trigger_reference_id || null
      });

      if (error) throw error;

      // في الإنتاج، هنا يتم الإرسال الفعلي عبر WhatsApp Business API
      await this.sendToWhatsAppAPI(data);

      return data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  private async sendToWhatsAppAPI(messageId: string): Promise<void> {
    // TODO: تنفيذ الإرسال الفعلي عبر WhatsApp Business Cloud API
    // هذه الوظيفة ستحتاج إلى:
    // 1. جلب بيانات الرسالة من قاعدة البيانات
    // 2. الاتصال بـ WhatsApp Business API
    // 3. إرسال الرسالة
    // 4. تحديث حالة الرسالة

    console.log('Sending message to WhatsApp API:', messageId);

    // محاكاة النجاح في التطوير
    await new Promise(resolve => setTimeout(resolve, 1000));

    await supabase
      .from('whatsapp_messages')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', messageId);
  }

  // =====================================
  // سجل الرسائل
  // =====================================

  async getMessages(filters?: {
    status?: string;
    recipient_type?: string;
    message_type?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
  }): Promise<WhatsAppMessage[]> {
    let query = supabase
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.recipient_type) {
      query = query.eq('recipient_type', filters.recipient_type);
    }

    if (filters?.message_type) {
      query = query.eq('message_type', filters.message_type);
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getMessageById(id: string): Promise<WhatsAppMessage | null> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // =====================================
  // حملات البث
  // =====================================

  async getCampaigns(): Promise<BroadcastCampaign[]> {
    const { data, error } = await supabase
      .from('whatsapp_broadcast_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createCampaign(campaign: Omit<BroadcastCampaign, 'id' | 'sent_count' | 'delivered_count' | 'failed_count' | 'created_at'>): Promise<BroadcastCampaign> {
    const { data, error } = await supabase
      .from('whatsapp_broadcast_campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async sendCampaign(campaignId: string): Promise<void> {
    // TODO: تنفيذ إرسال الحملة
    console.log('Sending campaign:', campaignId);
  }

  // =====================================
  // الإحصائيات
  // =====================================

  async getDailyStats(days: number = 30): Promise<DailyStats[]> {
    const { data, error } = await supabase
      .from('whatsapp_daily_stats')
      .select('*')
      .order('date', { ascending: false })
      .limit(days);

    if (error) throw error;
    return data || [];
  }

  async getTodayStats(): Promise<DailyStats | null> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('whatsapp_daily_stats')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getOverallStats(): Promise<{
    total_sent: number;
    total_delivered: number;
    total_read: number;
    total_failed: number;
    success_rate: number;
    delivery_rate: number;
  }> {
    const { data, error } = await supabase
      .from('whatsapp_daily_stats')
      .select('*');

    if (error) throw error;

    const stats = (data || []).reduce(
      (acc, day) => ({
        total_sent: acc.total_sent + day.total_sent,
        total_delivered: acc.total_delivered + day.total_delivered,
        total_read: acc.total_read + day.total_read,
        total_failed: acc.total_failed + day.total_failed
      }),
      { total_sent: 0, total_delivered: 0, total_read: 0, total_failed: 0 }
    );

    const success_rate = stats.total_sent > 0
      ? (stats.total_delivered / stats.total_sent) * 100
      : 0;

    const delivery_rate = stats.total_sent > 0
      ? ((stats.total_sent - stats.total_failed) / stats.total_sent) * 100
      : 0;

    return {
      ...stats,
      success_rate,
      delivery_rate
    };
  }

  // =====================================
  // أمثلة للرسائل التلقائية
  // =====================================

  async sendBookingConfirmation(params: {
    customer_name: string;
    customer_phone: string;
    farm_name: string;
    tree_count: number;
    total_amount: number;
    booking_id: string;
  }): Promise<void> {
    await this.sendMessage({
      recipient_phone: params.customer_phone,
      recipient_name: params.customer_name,
      recipient_type: 'investor',
      template_code: 'BOOKING_CONFIRMATION',
      variables: {
        customer_name: params.customer_name,
        farm_name: params.farm_name,
        tree_count: params.tree_count.toString(),
        total_amount: params.total_amount.toString(),
        booking_id: params.booking_id
      },
      trigger_event: 'booking_created',
      trigger_reference_id: params.booking_id
    });
  }

  async sendPaymentConfirmation(params: {
    customer_name: string;
    customer_phone: string;
    amount: number;
    payment_date: string;
  }): Promise<void> {
    await this.sendMessage({
      recipient_phone: params.customer_phone,
      recipient_name: params.customer_name,
      recipient_type: 'investor',
      template_code: 'PAYMENT_RECEIVED',
      variables: {
        customer_name: params.customer_name,
        amount: params.amount.toString(),
        payment_date: params.payment_date
      },
      trigger_event: 'payment_received'
    });
  }

  async sendCertificateNotification(params: {
    customer_name: string;
    customer_phone: string;
    certificate_number: string;
    tree_count: number;
  }): Promise<void> {
    await this.sendMessage({
      recipient_phone: params.customer_phone,
      recipient_name: params.customer_name,
      recipient_type: 'investor',
      template_code: 'CERTIFICATE_ISSUED',
      variables: {
        customer_name: params.customer_name,
        certificate_number: params.certificate_number,
        tree_count: params.tree_count.toString()
      },
      trigger_event: 'certificate_issued'
    });
  }
}

export const whatsappService = new WhatsAppService();
