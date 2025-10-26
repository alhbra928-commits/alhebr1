import { supabase } from '../../../lib/supabase';

export interface InboxThread {
  id: string;
  user_phone: string;
  user_name?: string;
  user_type?: 'investor' | 'owner' | 'visitor' | 'unknown';
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  status: 'open' | 'closed' | 'archived';
  assigned_to?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
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

class InboxService {
  async getThreads(filters?: {
    status?: 'open' | 'closed' | 'archived';
    assigned_to?: string;
  }): Promise<InboxThread[]> {
    let query = supabase
      .from('whatsapp_inbox_threads')
      .select('*')
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getConversation(phone: string): Promise<ConversationMessage[]> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('recipient_phone', phone)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async sendMessage(phone: string, content: string, recipientName?: string): Promise<void> {
    const { data: session } = await supabase.auth.getSession();

    const { data, error } = await supabase.rpc('send_whatsapp_message', {
      p_recipient_phone: phone,
      p_recipient_name: recipientName || null,
      p_template_id: null,
      p_content: content,
      p_event_type: null,
      p_variables: {}
    });

    if (error) throw error;
  }

  async sendTemplate(
    phone: string,
    templateId: string,
    variables: Record<string, string>,
    recipientName?: string
  ): Promise<void> {
    const { data, error } = await supabase.rpc('send_whatsapp_message', {
      p_recipient_phone: phone,
      p_recipient_name: recipientName || null,
      p_template_id: templateId,
      p_content: null,
      p_event_type: null,
      p_variables: variables
    });

    if (error) throw error;
  }

  async updateThreadStatus(threadId: string, status: 'open' | 'closed' | 'archived'): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_inbox_threads')
      .update({ status })
      .eq('id', threadId);

    if (error) throw error;
  }

  async markThreadAsRead(threadId: string): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_inbox_threads')
      .update({ unread_count: 0 })
      .eq('id', threadId);

    if (error) throw error;
  }

  async assignThread(threadId: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_inbox_threads')
      .update({ assigned_to: adminId })
      .eq('id', threadId);

    if (error) throw error;
  }

  async addThreadTags(threadId: string, tags: string[]): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_inbox_threads')
      .update({ tags })
      .eq('id', threadId);

    if (error) throw error;
  }

  async searchThreads(searchTerm: string): Promise<InboxThread[]> {
    const { data, error } = await supabase
      .from('whatsapp_inbox_threads')
      .select('*')
      .or(`user_phone.ilike.%${searchTerm}%,user_name.ilike.%${searchTerm}%,last_message.ilike.%${searchTerm}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getStats() {
    const [openResult, unreadResult, todayResult] = await Promise.all([
      supabase.from('whatsapp_inbox_threads').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('whatsapp_inbox_threads').select('unread_count').eq('status', 'open'),
      supabase.from('whatsapp_messages')
        .select('id', { count: 'exact', head: true })
        .eq('direction', 'outbound')
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    ]);

    const totalUnread = unreadResult.data?.reduce((sum, thread) => sum + (thread.unread_count || 0), 0) || 0;

    return {
      open_threads: openResult.count || 0,
      unread_messages: totalUnread,
      sent_today: todayResult.count || 0
    };
  }

  subscribeToNewMessages(callback: (message: ConversationMessage) => void) {
    return supabase
      .channel('whatsapp_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages'
        },
        (payload) => {
          callback(payload.new as ConversationMessage);
        }
      )
      .subscribe();
  }

  subscribeToThreadUpdates(callback: (thread: InboxThread) => void) {
    return supabase
      .channel('whatsapp_threads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_inbox_threads'
        },
        (payload) => {
          callback(payload.new as InboxThread);
        }
      )
      .subscribe();
  }
}

export const inboxService = new InboxService();
