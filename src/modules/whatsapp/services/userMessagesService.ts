import { supabase } from '../../../lib/supabase';

export interface UserMessage {
  id: string;
  content: string;
  direction: 'outbound' | 'inbound';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  event_type?: string;
  created_at: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
}

class UserMessagesService {
  async getInvestorMessages(phone: string): Promise<UserMessage[]> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('id, content, direction, status, event_type, created_at, sent_at, delivered_at, read_at')
      .eq('recipient_phone', phone)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getOwnerMessages(phone: string): Promise<UserMessage[]> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('id, content, direction, status, event_type, created_at, sent_at, delivered_at, read_at')
      .eq('recipient_phone', phone)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getMessagesByUserId(userId: string, userType: 'investor' | 'owner'): Promise<UserMessage[]> {
    let phone: string | null = null;

    if (userType === 'investor') {
      const { data } = await supabase
        .from('investors')
        .select('phone')
        .eq('id', userId)
        .maybeSingle();
      phone = data?.phone || null;
    } else if (userType === 'owner') {
      const { data } = await supabase
        .from('farm_owners')
        .select('mobile')
        .eq('id', userId)
        .maybeSingle();
      phone = data?.mobile || null;
    }

    if (!phone) return [];

    return userType === 'investor'
      ? await this.getInvestorMessages(phone)
      : await this.getOwnerMessages(phone);
  }

  getEventTypeLabel(eventType?: string): string {
    const labels: Record<string, string> = {
      'booking_created': 'إنشاء حجز',
      'booking_confirmed': 'تأكيد حجز',
      'certificate_issued': 'إصدار شهادة',
      'payment_received': 'استلام دفعة',
      'payment_rejected': 'رفض دفعة',
      'settlement_completed': 'تسوية مكتملة',
      'farm_approved': 'اعتماد مزرعة',
      'farm_rejected': 'رفض مزرعة',
      'investor_welcome': 'ترحيب',
      'owner_welcome': 'ترحيب',
      'login_otp': 'رمز دخول'
    };
    return eventType ? labels[eventType] || eventType : 'رسالة مباشرة';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'معلق',
      'sent': 'مرسل',
      'delivered': 'تم التسليم',
      'read': 'مقروء',
      'failed': 'فاشل'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': 'text-gray-400',
      'sent': 'text-blue-400',
      'delivered': 'text-green-400',
      'read': 'text-emerald-400',
      'failed': 'text-red-400'
    };
    return colors[status] || 'text-gray-400';
  }
}

export const userMessagesService = new UserMessagesService();
