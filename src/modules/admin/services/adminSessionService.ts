import { supabase } from '../../../lib/supabase';

export interface AdminSession {
  id: string;
  admin_phone: string;
  admin_name: string;
  admin_role: string;
  session_token: string;
  device_info: string;
  ip_address: string;
  current_module: string;
  session_status: 'active' | 'idle' | 'expired' | 'terminated';
  last_activity_at: string;
  expires_at: string;
  started_at: string;
  ended_at?: string;
}

export interface AdminPermission {
  id: string;
  admin_phone: string;
  module_id: string;
  module_name_ar: string;
  module_name_en: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  icon: string;
  is_active: boolean;
}

export class AdminSessionService {
  static async createSession(adminData: any): Promise<{ session: AdminSession; permissions: AdminPermission[] }> {
    try {
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8);

      const deviceInfo = navigator.userAgent;
      const ipAddress = 'Unknown';

      const sessionData = {
        admin_phone: adminData.phone,
        admin_name: adminData.name,
        admin_role: adminData.role,
        session_token: sessionToken,
        device_info: deviceInfo,
        ip_address: ipAddress,
        current_module: 'dashboard',
        session_status: 'active',
        expires_at: expiresAt.toISOString(),
      };

      const { data: session, error: sessionError } = await supabase
        .from('admin_active_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) throw sessionError;

      const { data: permissions, error: permError } = await supabase
        .from('admin_module_permissions')
        .select('*')
        .eq('admin_phone', adminData.phone)
        .eq('is_active', true);

      if (permError) throw permError;

      await supabase.from('admin_access_log').insert({
        admin_phone: adminData.phone,
        admin_name: adminData.name,
        action_type: 'login',
        action_details: 'تسجيل دخول ناجح',
        device_info: deviceInfo,
        ip_address: ipAddress,
        action_status: 'success',
      });

      localStorage.setItem('admin_session_token', sessionToken);
      localStorage.setItem('admin_data', JSON.stringify(adminData));

      return { session, permissions };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  static async updateActivity(sessionToken: string, currentModule?: string) {
    try {
      const updates: any = {
        last_activity_at: new Date().toISOString(),
        session_status: 'active',
      };

      if (currentModule) {
        updates.current_module = currentModule;
      }

      await supabase
        .from('admin_active_sessions')
        .update(updates)
        .eq('session_token', sessionToken);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }

  static async terminateSession(sessionToken: string) {
    try {
      await supabase
        .from('admin_active_sessions')
        .update({
          session_status: 'terminated',
          ended_at: new Date().toISOString(),
        })
        .eq('session_token', sessionToken);

      localStorage.removeItem('admin_session_token');
      localStorage.removeItem('admin_data');
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  }

  static async getAllActiveSessions(): Promise<AdminSession[]> {
    try {
      const { data, error } = await supabase
        .from('admin_active_sessions')
        .select('*')
        .eq('session_status', 'active')
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return [];
    }
  }

  static async getSessionByToken(sessionToken: string): Promise<AdminSession | null> {
    try {
      const { data, error } = await supabase
        .from('admin_active_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  static async checkIdleSessions() {
    try {
      const twentyMinutesAgo = new Date();
      twentyMinutesAgo.setMinutes(twentyMinutesAgo.getMinutes() - 20);

      await supabase
        .from('admin_active_sessions')
        .update({ session_status: 'idle' })
        .eq('session_status', 'active')
        .lt('last_activity_at', twentyMinutesAgo.toISOString());
    } catch (error) {
      console.error('Error checking idle sessions:', error);
    }
  }

  static async getAllUsers(): Promise<any[]> {
    try {
      console.log('🔍 [AdminSessionService] Fetching all users from admin_users...');

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [AdminSessionService] Error fetching users:', error);
        throw error;
      }

      console.log('✅ [AdminSessionService] Raw users from DB:', data);

      const users = (data || []).map((user: any) => ({
        phone: user.phone,
        name: user.full_name || user.phone,
        role: user.role_id || 'employee',
        roleAr: this.getRoleArabic(user.role_id),
        email: user.email,
        isActive: user.is_active,
      }));

      console.log('✅ [AdminSessionService] Mapped users:', users);
      return users;
    } catch (error) {
      console.error('❌ [AdminSessionService] Error in getAllUsers:', error);
      return [];
    }
  }

  static getRoleArabic(roleId: string | null): string {
    if (!roleId) return 'موظف';

    const roleMap: Record<string, string> = {
      'super_admin': 'مدير عام',
      'admin': 'مدير',
      'employee': 'موظف',
      'staff': 'موظف',
      'موظف': 'موظف',
      'مدير': 'مدير',
    };

    return roleMap[roleId.toLowerCase()] || 'موظف';
  }

  static async getPermissions(adminPhone: string): Promise<AdminPermission[]> {
    try {
      console.log('🔍 [AdminSessionService] Fetching permissions for:', adminPhone);

      const { data, error } = await supabase
        .from('admin_module_permissions')
        .select('*')
        .eq('admin_phone', adminPhone)
        .eq('is_active', true)
        .order('module_name_ar');

      if (error) {
        console.error('❌ [AdminSessionService] Error fetching permissions:', error);
        throw error;
      }

      console.log('✅ [AdminSessionService] Permissions for', adminPhone, ':', data);
      console.log('✅ [AdminSessionService] Active permissions count:', data?.length || 0);

      // Log each permission detail
      if (data && data.length > 0) {
        data.forEach((perm, idx) => {
          console.log(`  ${idx + 1}. ${perm.module_id}: view=${perm.can_view}, create=${perm.can_create}, edit=${perm.can_edit}, delete=${perm.can_delete}`);
        });
      }

      return data || [];
    } catch (error) {
      console.error('❌ [AdminSessionService] Error in getPermissions:', error);
      return [];
    }
  }

  static async updatePermission(permissionId: string, updates: Partial<AdminPermission>) {
    try {
      console.log('📝 [AdminSessionService] updatePermission START');
      console.log('Permission ID:', permissionId);
      console.log('Updates:', updates);

      const { data, error } = await supabase
        .from('admin_module_permissions')
        .update(updates)
        .eq('id', permissionId)
        .select();

      if (error) {
        console.error('❌ [AdminSessionService] Supabase error:', error);
        throw error;
      }

      console.log('✅ [AdminSessionService] Updated successfully:', data);
      console.log('📝 [AdminSessionService] updatePermission END');
    } catch (error) {
      console.error('❌❌❌ [AdminSessionService] Error updating permission:', error);
      throw error;
    }
  }

  static async createUserInDB(userData: any) {
    try {
      console.log('📝 [AdminSessionService] createUserInDB START');
      console.log('User data:', userData);

      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          phone: userData.phone,
          full_name: userData.full_name,
          email: userData.email,
          is_active: userData.is_active !== false,
          secret_code: userData.secret_code,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [AdminSessionService] Supabase error:', error);
        throw error;
      }

      console.log('✅ [AdminSessionService] User created:', data);
      return data;
    } catch (error) {
      console.error('❌❌❌ [AdminSessionService] Error creating user:', error);
      throw error;
    }
  }

  static async addPermissionToDB(permission: any) {
    try {
      console.log('📝 [AdminSessionService] addPermissionToDB START');
      console.log('Permission:', permission);

      const { data, error } = await supabase
        .from('admin_module_permissions')
        .insert(permission)
        .select()
        .single();

      if (error) {
        console.error('❌ [AdminSessionService] Supabase error:', error);
        throw error;
      }

      console.log('✅ [AdminSessionService] Permission created:', data);
      return data;
    } catch (error) {
      console.error('❌❌❌ [AdminSessionService] Error adding permission:', error);
      throw error;
    }
  }

  static async addPermission(permission: Omit<AdminPermission, 'id' | 'granted_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('admin_module_permissions')
        .insert(permission)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding permission:', error);
      throw error;
    }
  }

  static async deletePermission(permissionId: string) {
    try {
      const { error } = await supabase
        .from('admin_module_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting permission:', error);
      throw error;
    }
  }

  static async getAccessLog(adminPhone?: string, limit: number = 100) {
    try {
      let query = supabase
        .from('admin_access_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (adminPhone) {
        query = query.eq('admin_phone', adminPhone);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching access log:', error);
      return [];
    }
  }

  static async addAccessLog(
    adminPhone: string,
    adminName: string,
    actionType: string,
    actionDetails: string,
    actionStatus: string
  ) {
    try {
      const deviceInfo = navigator.userAgent;
      const ipAddress = 'Unknown';

      await supabase.from('admin_access_log').insert({
        admin_phone: adminPhone,
        admin_name: adminName,
        action_type: actionType,
        action_details: actionDetails,
        device_info: deviceInfo,
        ip_address: ipAddress,
        action_status: actionStatus,
      });
    } catch (error) {
      console.error('Error adding access log:', error);
    }
  }

  static getCurrentSession(): { token: string | null; admin: any | null } {
    const token = localStorage.getItem('admin_session_token');
    const adminData = localStorage.getItem('admin_data');

    return {
      token,
      admin: adminData ? JSON.parse(adminData) : null,
    };
  }

  static async validateSession(): Promise<boolean> {
    try {
      const { token } = this.getCurrentSession();
      if (!token) return false;

      const session = await this.getSessionByToken(token);
      if (!session) return false;

      if (session.session_status !== 'active') return false;

      const expiresAt = new Date(session.expires_at);
      if (expiresAt < new Date()) {
        await this.terminateSession(token);
        return false;
      }

      await this.updateActivity(token);
      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }
}
