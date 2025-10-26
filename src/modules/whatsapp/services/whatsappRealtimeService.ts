import { supabase } from '../../../lib/supabase';
import { notificationSoundService } from '../../../services/notificationSoundService';

export interface WhatsAppRealtimeMessage {
  id: string;
  message_id: string | null;
  recipient_phone: string;
  recipient_name: string | null;
  recipient_type: 'investor' | 'farm_owner' | 'admin' | 'support';
  message_content: string;
  message_type: 'auto' | 'broadcast' | 'manual' | 'reply';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  template_code?: string;
  trigger_event?: string;
  sent_at: string | null;
  created_at: string;
}

export interface WhatsAppStats {
  total_messages: number;
  pending_count: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  today_sent: number;
  unread_count: number;
}

type MessageCallback = (message: WhatsAppRealtimeMessage) => void;
type StatsCallback = (stats: WhatsAppStats) => void;
type StatusCallback = (status: { messageId: string; oldStatus: string; newStatus: string }) => void;

class WhatsAppRealtimeService {
  private messagesChannel: any = null;
  private statsChannel: any = null;
  private messageCallbacks: MessageCallback[] = [];
  private statsCallbacks: StatsCallback[] = [];
  private statusCallbacks: StatusCallback[] = [];
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  private async calculateStats(): Promise<WhatsAppStats> {
    try {
      const { data: allMessages } = await supabase
        .from('whatsapp_messages')
        .select('status, created_at');

      if (!allMessages) {
        return this.getEmptyStats();
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const stats: WhatsAppStats = {
        total_messages: allMessages.length,
        pending_count: 0,
        sent_count: 0,
        delivered_count: 0,
        read_count: 0,
        failed_count: 0,
        today_sent: 0,
        unread_count: 0
      };

      allMessages.forEach(msg => {
        switch (msg.status) {
          case 'pending':
            stats.pending_count++;
            stats.unread_count++;
            break;
          case 'sent':
            stats.sent_count++;
            break;
          case 'delivered':
            stats.delivered_count++;
            break;
          case 'read':
            stats.read_count++;
            break;
          case 'failed':
            stats.failed_count++;
            break;
        }

        const createdAt = new Date(msg.created_at);
        if (createdAt >= todayStart) {
          stats.today_sent++;
        }
      });

      return stats;
    } catch (error) {
      console.error('[WhatsApp Realtime] Error calculating stats:', error);
      return this.getEmptyStats();
    }
  }

  private getEmptyStats(): WhatsAppStats {
    return {
      total_messages: 0,
      pending_count: 0,
      sent_count: 0,
      delivered_count: 0,
      read_count: 0,
      failed_count: 0,
      today_sent: 0,
      unread_count: 0
    };
  }

  private async notifyStatsUpdate() {
    const stats = await this.calculateStats();
    this.statsCallbacks.forEach(callback => {
      try {
        callback(stats);
      } catch (error) {
        console.error('[WhatsApp Realtime] Error in stats callback:', error);
      }
    });
  }

  async connect() {
    if (this.isConnected) {
      console.log('[WhatsApp Realtime] Already connected');
      return;
    }

    try {
      console.log('[WhatsApp Realtime] Connecting to realtime channels...');

      this.messagesChannel = supabase
        .channel('whatsapp-messages-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'whatsapp_messages'
          },
          async (payload) => {
            console.log('[WhatsApp Realtime] New message received:', payload.new);
            const newMessage = payload.new as WhatsAppRealtimeMessage;

            this.messageCallbacks.forEach(callback => {
              try {
                callback(newMessage);
              } catch (error) {
                console.error('[WhatsApp Realtime] Error in message callback:', error);
              }
            });

            await notificationSoundService.playSound('whatsapp');

            await this.notifyStatsUpdate();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'whatsapp_messages'
          },
          async (payload) => {
            console.log('[WhatsApp Realtime] Message updated:', payload.new);
            const updatedMessage = payload.new as WhatsAppRealtimeMessage;
            const oldMessage = payload.old as WhatsAppRealtimeMessage;

            if (oldMessage.status !== updatedMessage.status) {
              this.statusCallbacks.forEach(callback => {
                try {
                  callback({
                    messageId: updatedMessage.id,
                    oldStatus: oldMessage.status,
                    newStatus: updatedMessage.status
                  });
                } catch (error) {
                  console.error('[WhatsApp Realtime] Error in status callback:', error);
                }
              });
            }

            await this.notifyStatsUpdate();
          }
        )
        .subscribe((status) => {
          console.log('[WhatsApp Realtime] Messages channel status:', status);
          if (status === 'SUBSCRIBED') {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('[WhatsApp Realtime] Successfully connected to messages channel');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            this.isConnected = false;
            this.handleReconnect();
          }
        });

      this.statsChannel = supabase
        .channel('whatsapp-stats-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'whatsapp_daily_stats'
          },
          async () => {
            console.log('[WhatsApp Realtime] Stats updated');
            await this.notifyStatsUpdate();
          }
        )
        .subscribe((status) => {
          console.log('[WhatsApp Realtime] Stats channel status:', status);
        });

      const initialStats = await this.calculateStats();
      this.statsCallbacks.forEach(callback => callback(initialStats));

    } catch (error) {
      console.error('[WhatsApp Realtime] Connection error:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WhatsApp Realtime] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WhatsApp Realtime] Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.disconnect();
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect() {
    console.log('[WhatsApp Realtime] Disconnecting...');

    if (this.messagesChannel) {
      supabase.removeChannel(this.messagesChannel);
      this.messagesChannel = null;
    }

    if (this.statsChannel) {
      supabase.removeChannel(this.statsChannel);
      this.statsChannel = null;
    }

    this.isConnected = false;
    this.messageCallbacks = [];
    this.statsCallbacks = [];
    this.statusCallbacks = [];
  }

  onNewMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onStatsUpdate(callback: StatsCallback): () => void {
    this.statsCallbacks.push(callback);

    this.calculateStats().then(stats => {
      callback(stats);
    });

    return () => {
      this.statsCallbacks = this.statsCallbacks.filter(cb => cb !== callback);
    };
  }

  onStatusChange(callback: StatusCallback): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async refreshStats() {
    await this.notifyStatsUpdate();
  }
}

export const whatsappRealtimeService = new WhatsAppRealtimeService();
