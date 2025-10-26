import { supabase } from '../lib/supabase';

// ========================================
// Types
// ========================================

export interface Department {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  icon: string;
  color: string;
  priority: number;
  is_active: boolean;
  available_for: string[];
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  full_name: string;
  job_title: string;
  phone_number: string;
  email?: string;
  department_id?: string;
  department?: Department;
  is_active: boolean;
  is_available: boolean;
  max_concurrent_chats: number;
  current_active_chats: number;
  avatar_url?: string;
  working_hours: any;
  auto_reply_enabled: boolean;
  auto_reply_message_ar?: string;
  created_at: string;
  updated_at: string;
}

export interface SmartRouting {
  id: string;
  user_type: 'visitor' | 'investor' | 'owner' | 'admin';
  user_context?: string;
  department_id?: string;
  staff_id?: string;
  pre_filled_message?: string;
  priority_score: number;
  is_active: boolean;
}

export interface StaffAnalytics {
  id: string;
  staff_id: string;
  date: string;
  total_chats: number;
  active_chats: number;
  completed_chats: number;
  avg_response_time_seconds: number;
  satisfaction_score: number;
}

export interface LiveNotification {
  id: string;
  staff_id: string;
  notification_type: 'new_chat' | 'urgent_inquiry' | 'follow_up' | 'system';
  title: string;
  message: string;
  user_name?: string;
  user_phone?: string;
  context_data: any;
  is_read: boolean;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

export interface UserContext {
  userType: 'visitor' | 'investor' | 'owner' | 'admin';
  userId?: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  currentPage?: string;
  currentFarmCode?: string;
  currentFarmName?: string;
}

// ========================================
// Service
// ========================================

export class SmartWhatsAppStaffService {

  // ========================================
  // Departments Management
  // ========================================

  static async getDepartments(activeOnly = true): Promise<Department[]> {
    let query = supabase
      .from('whatsapp_departments')
      .select('*')
      .order('priority', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching departments:', error);
      return [];
    }

    return data || [];
  }

  static async getDepartmentsByUserType(userType: string): Promise<Department[]> {
    const { data, error } = await supabase
      .from('whatsapp_departments')
      .select('*')
      .eq('is_active', true)
      .contains('available_for', [userType])
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching departments by user type:', error);
      return [];
    }

    return data || [];
  }

  static async createDepartment(department: Partial<Department>): Promise<boolean> {
    const { error } = await supabase
      .from('whatsapp_departments')
      .insert([department]);

    if (error) {
      console.error('Error creating department:', error);
      return false;
    }

    return true;
  }

  static async updateDepartment(id: string, updates: Partial<Department>): Promise<boolean> {
    const { error } = await supabase
      .from('whatsapp_departments')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating department:', error);
      return false;
    }

    return true;
  }

  // ========================================
  // Staff Management
  // ========================================

  static async getStaff(includeInactive = false): Promise<Staff[]> {
    let query = supabase
      .from('whatsapp_staff')
      .select(`
        *,
        department:whatsapp_departments(*)
      `)
      .order('full_name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching staff:', error);
      return [];
    }

    return data || [];
  }

  static async getStaffByDepartment(departmentId: string): Promise<Staff[]> {
    const { data, error } = await supabase
      .from('whatsapp_staff')
      .select(`
        *,
        department:whatsapp_departments(*)
      `)
      .eq('department_id', departmentId)
      .eq('is_active', true)
      .eq('is_available', true)
      .order('current_active_chats', { ascending: true });

    if (error) {
      console.error('Error fetching staff by department:', error);
      return [];
    }

    return data || [];
  }

  static async getAvailableStaff(departmentId?: string): Promise<Staff[]> {
    let query = supabase
      .from('whatsapp_staff')
      .select(`
        *,
        department:whatsapp_departments(*)
      `)
      .eq('is_active', true)
      .eq('is_available', true)
      .order('current_active_chats', { ascending: true });

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching available staff:', error);
      return [];
    }

    return data || [];
  }

  static async createStaff(staff: Partial<Staff>): Promise<boolean> {
    const { error } = await supabase
      .from('whatsapp_staff')
      .insert([staff]);

    if (error) {
      console.error('Error creating staff:', error);
      return false;
    }

    return true;
  }

  static async updateStaff(id: string, updates: Partial<Staff>): Promise<boolean> {
    const { error } = await supabase
      .from('whatsapp_staff')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating staff:', error);
      return false;
    }

    return true;
  }

  static async toggleStaffAvailability(id: string, isAvailable: boolean): Promise<boolean> {
    return this.updateStaff(id, { is_available: isAvailable });
  }

  // ========================================
  // Smart Routing
  // ========================================

  static async getSmartRouting(context: UserContext): Promise<{
    department?: Department;
    staff?: Staff;
    message?: string;
  }> {
    // 1. جلب التوجيه المناسب
    const { data: routing } = await supabase
      .from('whatsapp_smart_routing')
      .select(`
        *,
        department:whatsapp_departments(*),
        staff:whatsapp_staff(*)
      `)
      .eq('user_type', context.userType)
      .eq('is_active', true)
      .order('priority_score', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (routing) {
      // 2. إذا كان هناك قسم محدد، جلب أفضل موظف متاح
      if (routing.department_id && !routing.staff_id) {
        const availableStaff = await this.getAvailableStaff(routing.department_id);
        if (availableStaff.length > 0) {
          return {
            department: routing.department,
            staff: availableStaff[0],
            message: this.buildContextMessage(context, routing.pre_filled_message),
          };
        }
      }

      return {
        department: routing.department,
        staff: routing.staff,
        message: this.buildContextMessage(context, routing.pre_filled_message),
      };
    }

    // 3. التوجيه الافتراضي حسب نوع المستخدم
    const departments = await this.getDepartmentsByUserType(context.userType);
    if (departments.length > 0) {
      const defaultDept = departments[0];
      const availableStaff = await this.getAvailableStaff(defaultDept.id);

      return {
        department: defaultDept,
        staff: availableStaff[0],
        message: this.buildContextMessage(context),
      };
    }

    return {};
  }

  static buildContextMessage(context: UserContext, template?: string): string {
    let message = template || 'مرحباً! ';

    // إضافة معلومات السياق
    if (context.currentFarmCode && context.currentFarmName) {
      message += `أنا مهتم بمزرعة ${context.currentFarmName} (${context.currentFarmCode}). `;
    }

    if (context.currentPage) {
      const pageNames: Record<string, string> = {
        'home': 'الصفحة الرئيسية',
        'farms': 'صفحة المزارع',
        'my-investments': 'صفحة استثماراتي',
        'owner-dashboard': 'لوحة التحكم',
      };
      message += `أتصفح حالياً: ${pageNames[context.currentPage] || context.currentPage}. `;
    }

    if (context.userName) {
      message += `\n\nالاسم: ${context.userName}`;
    }

    if (context.userPhone) {
      message += `\nالجوال: ${context.userPhone}`;
    }

    message += '\n\nأود الاستفسار عن: ';

    return message;
  }

  // ========================================
  // Open WhatsApp
  // ========================================

  static async openWhatsApp(context: UserContext, department?: Department, staff?: Staff): Promise<void> {
    // 1. الحصول على التوجيه الذكي إذا لم يتم تحديد موظف
    let targetStaff = staff;
    let targetDepartment = department;
    let message = '';

    if (!targetStaff) {
      const routing = await this.getSmartRouting(context);
      targetDepartment = routing.department;
      targetStaff = routing.staff;
      message = routing.message || '';
    } else {
      message = this.buildContextMessage(context);
    }

    // 2. تحديد رقم الهاتف
    const phoneNumber = targetStaff?.phone_number || '966500000000'; // رقم افتراضي

    // 3. تسجيل التفاعل
    await supabase.from('whatsapp_context_logs').insert([{
      session_id: `session_${Date.now()}`,
      user_type: context.userType,
      user_id: context.userId,
      user_name: context.userName,
      user_phone: context.userPhone,
      user_email: context.userEmail,
      page_name: context.currentPage || 'unknown',
      farm_code: context.currentFarmCode,
      farm_name: context.currentFarmName,
      department: targetDepartment?.code || 'general',
      assigned_staff_id: targetStaff?.id,
      assigned_department_id: targetDepartment?.id,
      chat_status: 'initiated',
    }]);

    // 4. إنشاء إشعار للموظف
    if (targetStaff) {
      await this.createNotification({
        staff_id: targetStaff.id,
        notification_type: 'new_chat',
        title: 'محادثة جديدة',
        message: `${context.userName || 'زائر'} بدأ محادثة جديدة`,
        user_name: context.userName,
        user_phone: context.userPhone,
        context_data: {
          page: context.currentPage,
          farm_code: context.currentFarmCode,
        },
        priority: 'medium',
      });
    }

    // 5. فتح الواتساب
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  // ========================================
  // Notifications
  // ========================================

  static async createNotification(notification: Partial<LiveNotification>): Promise<boolean> {
    const { error } = await supabase
      .from('whatsapp_live_notifications')
      .insert([notification]);

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  }

  static async getNotifications(staffId: string, unreadOnly = false): Promise<LiveNotification[]> {
    let query = supabase
      .from('whatsapp_live_notifications')
      .select('*')
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  }

  static async markNotificationAsRead(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('whatsapp_live_notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  }

  // ========================================
  // Analytics
  // ========================================

  static async getStaffAnalytics(staffId?: string, days = 7): Promise<StaffAnalytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('whatsapp_staff_analytics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (staffId) {
      query = query.eq('staff_id', staffId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }

    return data || [];
  }

  static async getDepartmentStats(): Promise<any[]> {
    const { data, error } = await supabase
      .from('whatsapp_context_logs')
      .select('department, assigned_department_id, count')
      .not('assigned_department_id', 'is', null);

    if (error) {
      console.error('Error fetching department stats:', error);
      return [];
    }

    return data || [];
  }
}
