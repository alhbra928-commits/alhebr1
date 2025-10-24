import { supabase } from '../../../lib/supabase';

export interface AdminRole {
  id: string;
  role_name: string;
  role_name_en: string;
  role_code: string;
  description: string;
  permissions: any;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role_id: string;
  role?: AdminRole;
  is_active: boolean;
  two_factor_enabled: boolean;
  device_locked: boolean;
  last_login: string | null;
  last_login_ip: string | null;
  created_at: string;
}

export interface InvestorInfo {
  phone: string;
  name: string;
  total_reservations: number;
  total_amount: number;
  last_activity: string | null;
  is_active: boolean;
}

export interface FarmOwnerInfo {
  id: string;
  name: string;
  phone: string;
  total_farms: number;
  active_farms: number;
  last_update: string | null;
  is_active: boolean;
}

export interface UserSession {
  id: string;
  user_id: string;
  user_type: string;
  ip_address: string;
  user_agent: string;
  location: string;
  is_active: boolean;
  started_at: string;
  last_activity: string;
}

export interface LoginAttempt {
  id: string;
  username: string;
  user_type: string;
  ip_address: string;
  success: boolean;
  failure_reason: string;
  attempted_at: string;
}

export interface MonitoringStats {
  activeInvestors: number;
  activeFarmOwners: number;
  activeAdmins: number;
  failedLoginAttempts: number;
  activeSessions: number;
}

export class PermissionsService {
  static async getAllRoles(): Promise<AdminRole[]> {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*')
        .order('role_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  static async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          *,
          role:admin_roles(*)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  }

  static async createAdminUser(user: Partial<AdminUser>): Promise<AdminUser> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .insert([user])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  static async updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating admin user:', error);
      throw error;
    }
  }

  static async deleteAdminUser(id: string, deletedBy: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: deletedBy
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting admin user:', error);
      throw error;
    }
  }

  static async getAllInvestors(): Promise<InvestorInfo[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('customer_phone, customer_name, total_amount, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const investorMap = new Map<string, InvestorInfo>();

      (data || []).forEach((reservation: any) => {
        const phone = reservation.customer_phone;

        if (investorMap.has(phone)) {
          const existing = investorMap.get(phone)!;
          existing.total_reservations += 1;
          existing.total_amount += parseFloat(reservation.total_amount || 0);

          if (reservation.created_at > existing.last_activity!) {
            existing.last_activity = reservation.created_at;
          }
        } else {
          investorMap.set(phone, {
            phone,
            name: reservation.customer_name,
            total_reservations: 1,
            total_amount: parseFloat(reservation.total_amount || 0),
            last_activity: reservation.created_at,
            is_active: true
          });
        }
      });

      return Array.from(investorMap.values());
    } catch (error) {
      console.error('Error fetching investors:', error);
      throw error;
    }
  }

  static async getAllFarmOwners(): Promise<FarmOwnerInfo[]> {
    try {
      const { data, error } = await supabase
        .from('farm_owners')
        .select(`
          id,
          name,
          phone,
          created_at,
          farms(id, status, updated_at)
        `)
        .is('deleted_at', null);

      if (error) throw error;

      return (data || []).map((owner: any) => {
        const farms = owner.farms || [];
        const activeFarms = farms.filter((f: any) => f.status === 'active').length;
        const lastUpdate = farms.length > 0
          ? farms.reduce((latest: string, farm: any) =>
              farm.updated_at > latest ? farm.updated_at : latest,
              farms[0].updated_at
            )
          : null;

        return {
          id: owner.id,
          name: owner.name,
          phone: owner.phone,
          total_farms: farms.length,
          active_farms: activeFarms,
          last_update: lastUpdate,
          is_active: true
        };
      });
    } catch (error) {
      console.error('Error fetching farm owners:', error);
      throw error;
    }
  }

  static async getActiveSessions(): Promise<UserSession[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  static async getLoginAttempts(limit: number = 50): Promise<LoginAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .order('attempted_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching login attempts:', error);
      throw error;
    }
  }

  static async getMonitoringStats(): Promise<MonitoringStats> {
    try {
      const [sessions, loginAttempts] = await Promise.all([
        this.getActiveSessions(),
        this.getLoginAttempts(100)
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeInvestors = sessions.filter(s => s.user_type === 'investor').length;
      const activeFarmOwners = sessions.filter(s => s.user_type === 'farm_owner').length;
      const activeAdmins = sessions.filter(s => s.user_type === 'admin').length;
      const failedLoginAttempts = loginAttempts.filter(
        a => !a.success && new Date(a.attempted_at) >= today
      ).length;

      return {
        activeInvestors,
        activeFarmOwners,
        activeAdmins,
        failedLoginAttempts,
        activeSessions: sessions.length
      };
    } catch (error) {
      console.error('Error fetching monitoring stats:', error);
      throw error;
    }
  }

  static async endSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }
}
