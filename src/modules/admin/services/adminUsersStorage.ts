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

const DEFAULT_USERS: AdminUser[] = [
  {
    phone: '0500000000',
    name: 'المدير العام',
    role: 'super_admin',
    roleAr: 'المدير العام',
    status: 'active',
    secretCode: '1234',
  },
  {
    phone: '0501234567',
    name: 'موظف المالية',
    role: 'staff',
    roleAr: 'موظف',
    status: 'active',
    secretCode: '5678',
  },
];

export class AdminUsersStorage {
  static initialize(): void {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    }
  }

  static getAll(): AdminUser[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEY);
    const users = data ? JSON.parse(data) : DEFAULT_USERS;
    console.log('📖 قراءة المستخدمين من localStorage:', users.length, 'مستخدمين');
    return users;
  }

  static getByPhone(phone: string): AdminUser | null {
    const users = this.getAll();
    return users.find(u => u.phone === phone) || null;
  }

  static add(user: AdminUser): void {
    console.log('📝 محاولة إضافة مستخدم:', user);
    const users = this.getAll();
    console.log('👥 المستخدمون الحاليون قبل الإضافة:', users);

    // Check if user already exists
    const existingIndex = users.findIndex(u => u.phone === user.phone);
    if (existingIndex !== -1) {
      console.log('⚠️ المستخدم موجود بالفعل، سيتم تحديثه');
      users[existingIndex] = user;
    } else {
      users.push(user);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    console.log('✅ تم الحفظ في localStorage');
    console.log('👥 المستخدمون بعد الإضافة:', users);

    // Verify save
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    console.log('🔍 التحقق من الحفظ:', saved);
  }

  static update(phone: string, updates: Partial<AdminUser>): void {
    const users = this.getAll();
    const index = users.findIndex(u => u.phone === phone);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
  }

  static remove(phone: string): void {
    const users = this.getAll();
    const filtered = users.filter(u => u.phone !== phone);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
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

  static verifyLogin(phone: string, secretCode: string): { success: boolean; user?: AdminUser; message?: string } {
    const user = this.getByPhone(phone);

    if (!user) {
      return {
        success: false,
        message: 'ليس لديك صلاحية حالية، يرجى إضافتك من قبل الإدارة',
      };
    }

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

    if (user.secretCode !== secretCode) {
      return {
        success: false,
        message: 'رمز الدخول غير صحيح',
      };
    }

    this.updateLastLogin(phone);

    return {
      success: true,
      user: { ...user, status: 'active' },
    };
  }
}
