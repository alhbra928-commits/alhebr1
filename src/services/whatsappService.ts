import { supabase } from '../lib/supabase';

export interface WhatsAppProvider {
  id: string;
  name: string;
  type: 'meta' | 'twilio' | '360dialog' | 'other';
  base_url: string;
  api_key: string;
  webhook_secret?: string;
  phone_number: string;
  is_active: boolean;
  is_default: boolean;
  test_status: 'pending' | 'success' | 'failed';
  test_message?: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'notification' | 'otp' | 'marketing' | 'support' | 'transaction';
  content_ar: string;
  content_en?: string;
  variables: string[];
  provider_id?: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  provider_id?: string;
  template_id?: string;
  event_type?: string;
  recipient_phone: string;
  recipient_name?: string;
  content: string;
  direction: 'outbound' | 'inbound';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  external_message_id?: string;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  latency_ms?: number;
  provider_response?: any;
}

class WhatsAppService {
  async getProviders(): Promise<WhatsAppProvider[]> {
    const { data, error } = await supabase
      .from('whatsapp_providers')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDefaultProvider(): Promise<WhatsAppProvider | null> {
    const { data, error } = await supabase
      .from('whatsapp_providers')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createProvider(provider: Omit<WhatsAppProvider, 'id' | 'created_at' | 'updated_at' | 'test_status' | 'test_message'>): Promise<WhatsAppProvider> {
    const { data: session } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from('whatsapp_providers')
      .insert({
        ...provider,
        created_by: session?.session?.user?.id,
        test_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProvider(id: string, updates: Partial<WhatsAppProvider>): Promise<WhatsAppProvider> {
    const { data, error } = await supabase
      .from('whatsapp_providers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProvider(id: string): Promise<void> {
    const { data: session } = await supabase.auth.getSession();

    const { error } = await supabase
      .from('whatsapp_providers')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: session?.session?.user?.id
      })
      .eq('id', id);

    if (error) throw error;
  }

  async testConnection(providerId: string): Promise<TestConnectionResult> {
    const startTime = Date.now();

    try {
      const { data: provider, error: providerError } = await supabase
        .from('whatsapp_providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (providerError) throw providerError;

      const testPayload = this.buildTestPayload(provider);

      const response = await fetch(provider.base_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.api_key}`
        },
        body: JSON.stringify(testPayload)
      });

      const latency = Date.now() - startTime;
      const responseData = await response.json();

      if (response.ok) {
        await this.updateProvider(providerId, {
          test_status: 'success',
          test_message: 'Connection successful'
        });

        await this.logOperation({
          operation: 'test_connection',
          provider_id: providerId,
          status: 'success',
          request_data: testPayload,
          response_data: responseData,
          execution_time_ms: latency
        });

        return {
          success: true,
          message: 'تم الاتصال بنجاح',
          latency_ms: latency,
          provider_response: responseData
        };
      } else {
        throw new Error(responseData.error?.message || 'فشل الاتصال');
      }
    } catch (error: any) {
      const latency = Date.now() - startTime;

      await this.updateProvider(providerId, {
        test_status: 'failed',
        test_message: error.message
      });

      await this.logOperation({
        operation: 'test_connection',
        provider_id: providerId,
        status: 'error',
        error_message: error.message,
        execution_time_ms: latency
      });

      return {
        success: false,
        message: error.message,
        latency_ms: latency
      };
    }
  }

  private buildTestPayload(provider: WhatsAppProvider): any {
    switch (provider.type) {
      case 'meta':
        return {
          messaging_product: 'whatsapp',
          to: provider.phone_number,
          type: 'template',
          template: {
            name: 'hello_world',
            language: { code: 'ar' }
          }
        };

      case 'twilio':
        return {
          To: `whatsapp:${provider.phone_number}`,
          From: `whatsapp:${provider.phone_number}`,
          Body: 'Test connection'
        };

      case '360dialog':
        return {
          to: provider.phone_number,
          type: 'text',
          text: { body: 'Test connection' }
        };

      default:
        return {
          phone: provider.phone_number,
          message: 'Test connection'
        };
    }
  }

  async getTemplates(): Promise<WhatsAppTemplate[]> {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getMessages(limit: number = 50): Promise<WhatsAppMessage[]> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getMessagesByPhone(phone: string, limit: number = 50): Promise<WhatsAppMessage[]> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('recipient_phone', phone)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async logOperation(log: {
    operation: string;
    provider_id?: string;
    message_id?: string;
    status: 'success' | 'error' | 'warning';
    request_data?: any;
    response_data?: any;
    error_message?: string;
    execution_time_ms?: number;
  }): Promise<void> {
    await supabase
      .from('whatsapp_logs')
      .insert(log);
  }

  async getStats() {
    const [providersResult, messagesResult, templatesResult] = await Promise.all([
      supabase.from('whatsapp_providers').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('whatsapp_messages').select('status', { count: 'exact', head: true }),
      supabase.from('whatsapp_templates').select('id', { count: 'exact', head: true }).is('deleted_at', null)
    ]);

    const { data: sentToday } = await supabase
      .from('whatsapp_messages')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    return {
      total_providers: providersResult.count || 0,
      total_messages: messagesResult.count || 0,
      total_templates: templatesResult.count || 0,
      sent_today: sentToday?.count || 0
    };
  }
}

export const whatsappService = new WhatsAppService();
