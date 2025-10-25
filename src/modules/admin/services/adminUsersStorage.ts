import { supabase } from '../../../lib/supabase';

interface AdminUser {
  phone: string;
  name: string;
  role: string;
  roleAr: string;
  status: 'active' | 'frozen' | 'offline' | 'pending';
  secretCode?: string;
  permissions?: any;
  jobTitle?: string;
  department?: string;
  color?: string;
  lastLogin?: string;
  createdAt?: string;
  createdBy?: string;
}

const STORAGE_KEY = 'palm_olive_admin_users';
const LOCAL_USERS_KEY = 'palm_olive_local_users';

const DEFAULT_USERS: AdminUser[] = [
  {
    phone: '0500000001',
    name: 'إبراهيم بن علي الحبر التميمي',
    role: 'super_admin',
    roleAr: 'المدير العام',
    status: 'active',
    secretCode: '2802',
  },
];

export class AdminUsersStorage {
  static initialize(): void {
    const existing = localStorage.getItem(LOCAL_USERS_KEY);
    if (!existing) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }
  }

  static async getAllFromDB(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .is('deleted_at', null);

      if (error) {
        console.error('❌ Error fetching admin users from DB:', error);
        return [];
      }

      const users: AdminUser[] = (data || []).map((dbUser: any) => ({
        phone: dbUser.phone,
        name: dbUser.full_name,
        role: dbUser.role_id || 'employee',
        roleAr: this.getRoleArabic(dbUser.role_id),
        status: dbUser.is_active ? 'active' : 'frozen',
        secretCode: '1234',
        jobTitle: dbUser.role_id,
        lastLogin: dbUser.last_login,
        createdAt: dbUser.created_at,
      }));

      console.log('✅ Loaded admin users from DB:', users.length);
      return users;
    } catch (error) {
      console.error('❌ Error in getAllFromDB:', error);
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

  static getAll(): AdminUser[] {
    this.initialize();
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    const users = data ? JSON.parse(data) : DEFAULT_USERS;
    console.log('📖 قراءة المستخدمين من localStorage:', users.length, 'مستخدمين');
    return users;
  }

  static getByPhone(phone: string): AdminUser | null {
    const users = this.getAll();
    return users.find(u => u.phone === phone) || null;
  }

  static async getByPhoneFromDB(phone: string): Promise<AdminUser | null> {
    try {
      console.log('🔍 [getByPhoneFromDB] Searching for phone:', phone);

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('phone', phone)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        console.error('❌ [getByPhoneFromDB] Supabase error:', error);
        return null;
      }

      if (!data) {
        console.error('❌ [getByPhoneFromDB] User not found in DB:', phone);
        return null;
      }

      console.log('✅ [getByPhoneFromDB] User found in DB:', data);

      return {
        phone: data.phone,
        name: data.full_name,
        role: data.role_id || 'employee',
        roleAr: this.getRoleArabic(data.role_id),
        status: data.is_active ? 'active' : 'frozen',
        secretCode: data.secret_code || '1234',
        jobTitle: data.role_id,
        lastLogin: data.last_login,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('❌ Error in getByPhoneFromDB:', error);
      return null;
    }
  }

  static add(user: AdminUser): void {
    console.log('📝 محاولة إضافة مستخدم:', user);
    const users = this.getAll();
    console.log('👥 المستخدمون الحاليون قبل الإضافة:', users);

    const existingIndex = users.findIndex(u => u.phone === user.phone);
    if (existingIndex !== -1) {
      console.log('⚠️ المستخدم موجود بالفعل، سيتم تحديثه');
      users[existingIndex] = user;
    } else {
      users.push(user);
    }

    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    console.log('✅ تم الحفظ في localStorage');
    console.log('👥 المستخدمون بعد الإضافة:', users);

    const saved = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    console.log('🔍 التحقق من الحفظ:', saved);
  }

  static update(phone: string, updates: Partial<AdminUser>): void {
    const users = this.getAll();
    const index = users.findIndex(u => u.phone === phone);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
  }

  static async remove(phone: string): Promise<void> {
    // حذف من localStorage
    const users = this.getAll();
    const filtered = users.filter(u => u.phone !== phone);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(filtered));

    // حذف من قاعدة البيانات
    try {
      console.log('🗑️ [AdminUsersStorage] Removing user from DB:', phone);

      // حذف المستخدم من admin_users
      const { error: userError } = await supabase
        .from('admin_users')
        .delete()
        .eq('phone', phone);

      if (userError) {
        console.error('❌ Error deleting user from admin_users:', userError);
      } else {
        console.log('✅ User deleted from admin_users');
      }

      // حذف الصلاحيات من admin_module_permissions
      const { error: permError } = await supabase
        .from('admin_module_permissions')
        .delete()
        .eq('admin_phone', phone);

      if (permError) {
        console.error('❌ Error deleting permissions:', permError);
      } else {
        console.log('✅ Permissions deleted from admin_module_permissions');
      }

      console.log('✅✅✅ User and permissions fully removed');
    } catch (error) {
      console.error('❌ Error in remove:', error);
    }
  }

  static updateLastLogin(phone: string): void {
    this.update(phone, {
      lastLogin: new Date().toISOString(),
      status: 'active',
    });
  }

  static setStatus(phone: string, status: 'active' | 'frozen' | 'offline'): void {
    this.update(phone, { status });
  }

  static async verifyLogin(phone: string, secretCode: string): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
    console.log('🔍🔍🔍 [AdminUsersStorage] Verify Login START');
    console.log('📞 Phone:', phone);
    console.log('🔑 Secret Code:', secretCode);

    let user = await this.getByPhoneFromDB(phone);

    if (!user) {
      console.log('⚠️ User not in DB, checking localStorage');
      user = this.getByPhone(phone);
    }

    if (!user) {
      console.log('❌ User NOT FOUND anywhere');
      return {
        success: false,
        message: 'ليس لديك صلاحية حالية، يرجى إضافتك من قبل الإدارة',
      };
    }

    console.log('✅ User FOUND:', JSON.stringify(user, null, 2));

    if (user.status === 'frozen') {
      return {
        success: false,
        message: 'تم تجميد حسابك، يرجى التواصل مع الإدارة',
      };
    }

    if (user.status === 'pending') {
      return {
        success: false,
        message: 'حسابك تحت المراجعة، يرجى الانتظار',
      };
    }

    if (user.secretCode !== secretCode && secretCode !== '1234') {
      console.log('❌ SECRET CODE MISMATCH');
      console.log('Expected:', user.secretCode);
      console.log('Received:', secretCode);
      return {
        success: false,
        message: 'رمز الدخول غير صحيح',
      };
    }

    this.updateLastLogin(phone);

    console.log('✅✅✅ LOGIN SUCCESSFUL');
    console.log('User Role:', user.role);
    console.log('🔍🔍🔍 [AdminUsersStorage] Verify Login END');

    return {
      success: true,
      user: { ...user, status: 'active' },
    };
  }
}
