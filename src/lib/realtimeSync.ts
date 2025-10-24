import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type ChangeCallback = (payload: any) => void;
type TableChangeCallback = {
  onInsert?: ChangeCallback;
  onUpdate?: ChangeCallback;
  onDelete?: ChangeCallback;
};

class RealtimeSyncService {
  private channels: Map<string, RealtimeChannel> = new Map();

  subscribeToTable(
    tableName: string,
    callbacks: TableChangeCallback,
    filter?: string
  ): () => void {
    const channelName = `${tableName}_${Date.now()}`;

    let channelBuilder = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: filter
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              callbacks.onInsert?.(payload);
              break;
            case 'UPDATE':
              callbacks.onUpdate?.(payload);
              break;
            case 'DELETE':
              callbacks.onDelete?.(payload);
              break;
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channelBuilder);

    return () => {
      supabase.removeChannel(channelBuilder);
      this.channels.delete(channelName);
    };
  }

  subscribeToMultipleTables(
    tables: Array<{ name: string; callbacks: TableChangeCallback; filter?: string }>
  ): () => void {
    const unsubscribers = tables.map(({ name, callbacks, filter }) =>
      this.subscribeToTable(name, callbacks, filter)
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const realtimeSync = new RealtimeSyncService();

export function useRealtimeTable(
  tableName: string,
  callbacks: TableChangeCallback,
  filter?: string
): () => void {
  return realtimeSync.subscribeToTable(tableName, callbacks, filter);
}

export function useRealtimeTables(
  tables: Array<{ name: string; callbacks: TableChangeCallback; filter?: string }>
): () => void {
  return realtimeSync.subscribeToMultipleTables(tables);
}
