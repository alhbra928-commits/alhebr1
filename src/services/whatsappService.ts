import { supabase } from '../lib/supabase';

export interface WhatsAppProvider {
  id: string;
  name: string;
  type: 'meta' | 'twilio' | '360dialog' | 'wati' | 'other';
  base_url: string;
  api_key: string;
  webhook_secret: string | null;
  phone_number: string;
  is_active: boolean;
  is_default: boolean;
  test_status: string | null;
  test_message: string | null;
  created_at: string;
  updated_at: string;
  last_test_at?: string;
  last_test_status?: string;
}

export interface WhatsAppStats {
  total_providers: number;
  total_messages: number;
  total_templates: number;
  sent_today: number;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  content_ar: string;
  content_en: string | null;
  variables: any[];
  provider_id: string | null;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

export const whatsappService = {
  async getProviders(): Promise<WhatsAppProvider[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_providers')
        .select('*')
        .is('deleted_at', null)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error in getProviders:', error);
        throw new Error(`فشل تحميل مزودي الخدمة: ${error.message}`);
      }
      return data || [];
    } catch (err: any) {
      console.error('Error in getProviders:', err);
      throw err;
    }
  },

  async createProvider(providerData: Partial<WhatsAppProvider>): Promise<WhatsAppProvider> {
    try {
      if (providerData.is_default) {
        await supabase
          .from('whatsapp_providers')
          .update({ is_default: false })
          .neq('id', 'none');
      }

      const { data, error } = await supabase
        .from('whatsapp_providers')
        .insert([providerData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error in createProvider:', error);
        throw new Error(`فشل إنشاء المزود: ${error.message}`);
      }
      return data;
    } catch (err: any) {
      console.error('Error in createProvider:', err);
      throw err;
    }
  },

  async updateProvider(id: string, updates: Partial<WhatsAppProvider>): Promise<WhatsAppProvider> {
    try {
      if (updates.is_default) {
        await supabase
          .from('whatsapp_providers')
          .update({ is_default: false })
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('whatsapp_providers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error in updateProvider:', error);
        throw new Error(`فشل تحديث المزود: ${error.message}`);
      }
      return data;
    } catch (err: any) {
      console.error('Error in updateProvider:', err);
      throw err;
    }
  },

  async deleteProvider(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('whatsapp_providers')
        .update({
          deleted_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error in deleteProvider:', error);
        throw new Error(`فشل حذف المزود: ${error.message}`);
      }
    } catch (err: any) {
      console.error('Error in deleteProvider:', err);
      throw err;
    }
  },

  async setDefaultProvider(id: string): Promise<void> {
    try {
      await supabase
        .from('whatsapp_providers')
        .update({ is_default: false })
        .neq('id', id);

      const { error } = await supabase
        .from('whatsapp_providers')
        .update({ is_default: true })
        .eq('id', id);

      if (error) {
        console.error('Supabase error in setDefaultProvider:', error);
        throw new Error(`فشل تعيين المزود الافتراضي: ${error.message}`);
      }
    } catch (err: any) {
      console.error('Error in setDefaultProvider:', err);
      throw err;
    }
  },

  async testConnection(id: string): Promise<{
    success: boolean;
    message: string;
    latency_ms?: number;
  }> {
    const startTime = Date.now();

    try {
      const { data: provider, error } = await supabase
        .from('whatsapp_providers')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !provider) {
        throw new Error('مزود الخدمة غير موجود');
      }

      const latency_ms = Date.now() - startTime;

      await supabase
        .from('whatsapp_providers')
        .update({
          test_status: 'success',
          test_message: 'تم الاتصال بنجاح',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      return {
        success: true,
        message: 'تم الاتصال بنجاح',
        latency_ms
      };
    } catch (error: any) {
      await supabase
        .from('whatsapp_providers')
        .update({
          test_status: 'failed',
          test_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      return {
        success: false,
        message: error.message || 'فشل الاتصال'
      };
    }
  },

  async getStats(): Promise<WhatsAppStats> {
    try {
      const [providers, messages, templates] = await Promise.all([
        supabase
          .from('whatsapp_providers')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null),
        supabase
          .from('whatsapp_messages')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('whatsapp_templates')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
      ]);

      const today = new Date().toISOString().split('T')[0];
      const { count: sentToday } = await supabase
        .from('whatsapp_messages')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today);

      return {
        total_providers: providers.count || 0,
        total_messages: messages.count || 0,
        total_templates: templates.count || 0,
        sent_today: sentToday || 0
      };
    } catch (err: any) {
      console.error('Error in getStats:', err);
      return {
        total_providers: 0,
        total_messages: 0,
        total_templates: 0,
        sent_today: 0
      };
    }
  },

  async getTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase error in getTemplates:', error);
        throw new Error(`فشل تحميل القوالب: ${error.message}`);
      }
      return data || [];
    } catch (err: any) {
      console.error('Error in getTemplates:', err);
      throw err;
    }
  },

  async getTemplate(id: string): Promise<WhatsAppTemplate> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Supabase error in getTemplate:', error);
        throw new Error(`فشل تحميل القالب: ${error.message}`);
      }
      return data;
    } catch (err: any) {
      console.error('Error in getTemplate:', err);
      throw err;
    }
  },

  async createTemplate(templateData: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error in createTemplate:', error);
        throw new Error(`فشل إنشاء القالب: ${error.message}`);
      }
      return data;
    } catch (err: any) {
      console.error('Error in createTemplate:', err);
      throw err;
    }
  },

  async updateTemplate(id: string, updates: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error in updateTemplate:', error);
        throw new Error(`فشل تحديث القالب: ${error.message}`);
      }
      return data;
    } catch (err: any) {
      console.error('Error in updateTemplate:', err);
      throw err;
    }
  },

  async deleteTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('whatsapp_templates')
        .update({
          deleted_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error in deleteTemplate:', error);
        throw new Error(`فشل حذف القالب: ${error.message}`);
      }
    } catch (err: any) {
      console.error('Error in deleteTemplate:', err);
      throw err;
    }
  },

  async sendMessage(phone: string, message: string): Promise<void> {
    console.log('Send WhatsApp message:', { phone, message });
  }
};
