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

    // حفظ في localStorage فوراً
    localStorage.setItem('admin_session_token', sessionToken);
    localStorage.setItem('admin_data', JSON.stringify(adminData));

    try {
      // Timeout سريع (2 ثانية)
      const dbPromise = Promise.all([
        supabase.from('admin_active_sessions').insert(sessionData).select().single(),
        supabase.from('admin_module_permissions').select('*').eq('admin_phone', adminData.phone).eq('is_active', true),
        supabase.from('admin_access_log').insert({
          admin_phone: adminData.phone,
          admin_name: adminData.name,
          action_type: 'login',
          action_details: 'تسجيل دخول ناجح',
          device_info: deviceInfo,
          ip_address: ipAddress,
          action_status: 'success',
        })
      ]);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 2000);
      });

      const [sessionResult, permissionsResult] = await Promise.race([dbPromise, timeoutPromise]) as any;

      return {
        session: sessionResult.data,
        permissions: permissionsResult.data || []
      };
    } catch (error) {
      // فشل Database - إرجاع بيانات محلية
      return {
        session: { ...sessionData, id: sessionToken } as any,
        permissions: adminData.permissions || []
      };
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

      this.clearSession();
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  }

  static clearSession() {
    // تنظيف كامل لجميع بيانات الجلسة
    localStorage.removeItem('admin_session_token');
    localStorage.removeItem('admin_data');
    sessionStorage.clear();
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
        roleAr: user.job_title || this.getRoleArabic(user.role_id),
        jobTitle: user.job_title,
        jobTitleEn: user.job_title_en,
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
      const { data, error } = await supabase
        .from('admin_module_permissions')
        .select('*')
        .eq('admin_phone', adminPhone)
        .eq('is_active', true)
        .order('module_name_ar');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.warn('⚠️ [AdminSessionService] Could not fetch permissions from DB, using localStorage');

      // Fallback: محاولة الحصول على الصلاحيات من localStorage
      const adminData = localStorage.getItem('admin_data');
      if (adminData) {
        try {
          const admin = JSON.parse(adminData);
          if (admin.phone === adminPhone && admin.permissions) {
            // تحويل permissions object إلى array بصيغة AdminPermission
            const permissionsArray: AdminPermission[] = Object.entries(admin.permissions).map(([moduleId, perms]: [string, any]) => ({
              id: crypto.randomUUID(),
              admin_phone: adminPhone,
              module_id: moduleId,
              module_name_ar: moduleId,
              module_name_en: moduleId,
              can_view: perms.view || false,
              can_create: perms.create || false,
              can_edit: perms.edit || false,
              can_delete: perms.delete || false,
              icon: '',
              is_active: true,
            }));
            return permissionsArray;
          }
        } catch (parseError) {
          console.error('Error parsing admin_data:', parseError);
        }
      }

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
          job_title: userData.job_title || null,
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

  static async updateUserInfo(phone: string, updates: { full_name?: string; job_title?: string }) {
    try {
      console.log('📝 [AdminSessionService] updateUserInfo START');
      console.log('Phone:', phone);
      console.log('Updates:', updates);

      const { data, error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('phone', phone)
        .select()
        .single();

      if (error) {
        console.error('❌ [AdminSessionService] Supabase error:', error);
        throw error;
      }

      console.log('✅ [AdminSessionService] User info updated:', data);
      return data;
    } catch (error) {
      console.error('❌❌❌ [AdminSessionService] Error updating user info:', error);
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

  static async deleteUser(phone: string) {
    try {
      console.log('🗑️ [AdminSessionService] deleteUser START');
      console.log('Phone:', phone);

      // 1. أولاً: حذف جميع الصلاحيات للمستخدم
      console.log('🗑️ Step 1: Deleting all permissions for user...');
      const { error: permissionsError } = await supabase
        .from('admin_module_permissions')
        .delete()
        .eq('admin_phone', phone);

      if (permissionsError) {
        console.error('❌ Error deleting permissions:', permissionsError);
        throw permissionsError;
      }
      console.log('✅ Permissions deleted successfully');

      // 2. ثانياً: حذف جميع الجلسات النشطة
      console.log('🗑️ Step 2: Deleting active sessions...');
      const { error: sessionsError } = await supabase
        .from('admin_active_sessions')
        .delete()
        .eq('admin_phone', phone);

      if (sessionsError) {
        console.error('❌ Error deleting sessions:', sessionsError);
        // نستمر حتى لو كان هناك خطأ في حذف الجلسات
      }
      console.log('✅ Sessions deleted successfully');

      // 3. ثالثاً: حذف المستخدم من جدول admin_users
      console.log('🗑️ Step 3: Deleting user from admin_users...');
      const { error: deleteError } = await supabase
        .from('admin_users')
        .delete()
        .eq('phone', phone);

      if (deleteError) {
        console.error('❌ Error deleting user:', deleteError);
        throw deleteError;
      }

      console.log('✅ User deleted successfully from database');

      // 4. رابعاً: تسجيل في Access Log
      await this.addAccessLog(
        phone,
        'System',
        'delete_user',
        `حذف المستخدم ${phone} وجميع صلاحياته بشكل نهائي`,
        'success'
      );

      console.log('✅ [AdminSessionService] deleteUser COMPLETED');

    } catch (error) {
      console.error('❌ Error in deleteUser:', error);
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
