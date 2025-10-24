import { supabase } from '../../lib/supabase';

export interface BackupRecord {
  id: string;
  backup_type: 'manual' | 'automatic' | 'scheduled';
  backup_name: string;
  tables_count: number;
  records_count: number;
  created_at: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  restore_count: number;
  is_locked?: boolean;
  locked_at?: string;
  locked_by?: string;
  lock_reason?: string;
  backup_size?: number;
}

export interface RetentionLog {
  id: string;
  backup_name: string;
  backup_type: string;
  deletion_reason: string;
  deletion_type: string;
  backup_age_days: number;
  deleted_at: string;
  records_count: number;
}

export interface StorageStats {
  total_size: number;
  total_size_mb: number;
  total_count: number;
  locked_count: number;
  auto_count: number;
  manual_count: number;
  avg_size: number;
  avg_size_mb: number;
  oldest_backup: string;
  newest_backup: string;
  storage_warning: boolean;
  retention_needed: boolean;
}

export class BackupService {
  static async createManualBackup(backupName?: string) {
    const { data, error } = await supabase.rpc('create_full_backup', {
      p_backup_name: backupName || `manual_${Date.now()}`,
      p_backup_type: 'manual'
    });

    if (error) throw error;
    return data;
  }

  static async createAutomaticBackup() {
    const { data, error } = await supabase.rpc('create_full_backup', {
      p_backup_name: `auto_${new Date().toISOString().split('T')[0]}`,
      p_backup_type: 'automatic'
    });

    if (error) throw error;
    return data;
  }

  static async getBackupList(limit: number = 50): Promise<BackupRecord[]> {
    const { data, error } = await supabase.rpc('get_backup_list', {
      p_limit: limit
    });

    if (error) throw error;
    return data || [];
  }

  static async getBackupDetails(backupId: string) {
    const { data, error } = await supabase
      .from('backup_history')
      .select('*')
      .eq('id', backupId)
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteBackup(backupId: string) {
    const { error } = await supabase
      .from('backup_history')
      .delete()
      .eq('id', backupId);

    if (error) throw error;
    return { success: true };
  }

  static async getBackupStats() {
    const { data: backups, error } = await supabase
      .from('backup_history')
      .select('backup_type, status, records_count, created_at');

    if (error) throw error;

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      total: backups?.length || 0,
      manual: backups?.filter(b => b.backup_type === 'manual').length || 0,
      automatic: backups?.filter(b => b.backup_type === 'automatic').length || 0,
      last24h: backups?.filter(b => new Date(b.created_at) > last24h).length || 0,
      last7days: backups?.filter(b => new Date(b.created_at) > last7d).length || 0,
      failed: backups?.filter(b => b.status === 'failed').length || 0,
      totalRecords: backups?.reduce((sum, b) => sum + (b.records_count || 0), 0) || 0,
      lastBackup: backups && backups.length > 0
        ? backups.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null
    };

    return stats;
  }

  static generateConfirmationCode(backupId: string): string {
    return backupId.substring(0, 8).toUpperCase();
  }

  static async scheduleAutomaticBackup() {
    const lastBackup = await this.getBackupStats();
    const lastBackupDate = lastBackup.lastBackup?.created_at
      ? new Date(lastBackup.lastBackup.created_at)
      : null;

    const now = new Date();
    const shouldBackup = !lastBackupDate ||
      (now.getTime() - lastBackupDate.getTime()) > 24 * 60 * 60 * 1000;

    if (shouldBackup) {
      return await this.createAutomaticBackup();
    }

    return { success: false, message: 'النسخ الاحتياطي التلقائي ليس مستحقاً بعد' };
  }

  static async applyRetentionPolicy(maxBackups: number = 10, maxAgeDays: number = 30) {
    const { data, error } = await supabase.rpc('apply_retention_policy', {
      p_max_backups_per_type: maxBackups,
      p_max_age_days: maxAgeDays
    });

    if (error) throw error;
    return data;
  }

  static async lockBackup(backupId: string, reason: string = 'نسخة مهمة') {
    const { data, error } = await supabase.rpc('lock_backup', {
      p_backup_id: backupId,
      p_reason: reason
    });

    if (error) throw error;
    return data;
  }

  static async unlockBackup(backupId: string) {
    const { data, error } = await supabase.rpc('unlock_backup', {
      p_backup_id: backupId
    });

    if (error) throw error;
    return data;
  }

  static async getStorageStats(): Promise<StorageStats> {
    const { data, error } = await supabase.rpc('get_backup_storage_stats');

    if (error) throw error;
    return data;
  }

  static async getRetentionLogs(limit: number = 50): Promise<RetentionLog[]> {
    const { data, error } = await supabase.rpc('get_retention_logs', {
      p_limit: limit
    });

    if (error) throw error;
    return data || [];
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  static calculateStoragePercentage(usedMB: number, maxMB: number = 1000): number {
    return Math.round((usedMB / maxMB) * 100);
  }
}
