import { supabase } from '../../lib/supabase';

export interface FarmOwner {
  id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  region: string;
  city: string;
  admin_notes?: string;
  farm_area: number;
  farm_area_unit: string;
  farm_type: string;
  actual_price: number;
  deed_number: string;
  farm_location_region: string;
  farm_location_city: string;
  farm_location_description?: string;
  payment_grace_period: number;
  status: 'active' | 'frozen' | 'archived';
  frozen_at?: string;
  frozen_by?: string;
  frozen_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface OwnerFormData {
  full_name: string;
  mobile_number: string;
  email?: string;
  region: string;
  city: string;
  admin_notes?: string;
  farm_area: number;
  farm_area_unit: string;
  farm_type: string;
  actual_price: number;
  deed_number: string;
  farm_location_region: string;
  farm_location_city: string;
  farm_location_description?: string;
  payment_grace_period: number;
}

export interface OwnerStatistics {
  total: number;
  active: number;
  frozen: number;
}

export class OwnersService {
  // Cache بسيط للأداء السريع
  private static ownersCache: { data: FarmOwner[]; timestamp: number } | null = null;
  private static CACHE_DURATION = 30000; // 30 ثانية

  /**
   * الحصول على طلبات المراجعة المعلقة
   */
  static async getPendingSubmissions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('farm_submission_requests')
        .select(`
          id,
          profile_id,
          status,
          submitted_at,
          farm_owner_profiles!inner (
            mobile_number,
            full_name
          )
        `)
        .eq('status', 'pending')
        .is('deleted_at', null)
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('⚠️ Failed to fetch pending submissions:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.warn('⚠️ Pending submissions completely failed');
      return [];
    }
  }

  static async getOwnersList(status?: string, useCache: boolean = true): Promise<FarmOwner[]> {
    // التحقق من الـ cache
    if (useCache && this.ownersCache) {
      const now = Date.now();
      if (now - this.ownersCache.timestamp < this.CACHE_DURATION) {
        console.log('✅ Using cached owners data');

        // تطبيق الفلتر على الـ cache
        let filtered = this.ownersCache.data;
        if (status) {
          filtered = filtered.filter(o => o.status === status);
        }
        return filtered;
      }
    }

    // جلب البيانات من Supabase
    let query = supabase
      .from('farm_owners')
      .select(`
        id,
        full_name,
        mobile_number,
        email,
        region,
        city,
        status,
        farm_type,
        actual_price,
        created_at,
        updated_at
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // حفظ في الـ cache
    if (!status) {
      this.ownersCache = {
        data: data as FarmOwner[] || [],
        timestamp: Date.now()
      };
    }

    return data as FarmOwner[] || [];
  }

  // دالة لمسح الـ cache عند الحاجة
  static clearCache() {
    this.ownersCache = null;
  }

  static async getOwnerById(id: string): Promise<FarmOwner> {
    const { data, error } = await supabase
      .from('farm_owners')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('المالك غير موجود');
    return data;
  }

  static async getOwnerVarieties(ownerId: string): Promise<Variety[]> {
    // Get farm associated with owner
    const { data: farm } = await supabase
      .from('farms')
      .select('id')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (!farm) return [];

    // Get varieties
    const { data: varieties, error } = await supabase
      .from('farm_tree_varieties')
      .select('tree_type, variety_name, total_trees')
      .eq('farm_id', farm.id)
      .is('deleted_at', null);

    if (error) throw error;

    return (varieties || []).map(v => ({
      type: v.tree_type as 'نخيل' | 'زيتون',
      name: v.variety_name,
      count: v.total_trees
    }));
  }

  static async createOwner(ownerData: any) {
    // Remove varieties from ownerData as it's not a column in farm_owners
    const { varieties, ...cleanOwnerData } = ownerData;

    const { data, error } = await supabase
      .from('farm_owners')
      .insert([{
        ...cleanOwnerData,
        status: 'active',
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;

    // مسح الـ cache بعد الإضافة
    this.clearCache();

    return data;
  }

  static async updateOwner(id: string, ownerData: any) {
    // Remove varieties from ownerData as it's not a column in farm_owners
    const { varieties, ...cleanOwnerData } = ownerData;

    const { data, error } = await supabase
      .from('farm_owners')
      .update({
        ...cleanOwnerData,
        updated_at: new Date().toISOString(),
        updated_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // مسح الـ cache بعد التحديث
    this.clearCache();

    return data;
  }

  static async toggleStatus(id: string, newStatus: 'active' | 'frozen', reason?: string) {
    const { data, error } = await supabase.rpc('toggle_owner_status', {
      p_owner_id: id,
      p_new_status: newStatus,
      p_reason: reason
    });

    if (error) throw error;

    // مسح الـ cache بعد تغيير الحالة
    this.clearCache();

    return data;
  }

  static async deleteOwnerPermanently(id: string, deletionReason?: string) {
    const { data, error } = await supabase.rpc('delete_owner_permanently', {
      p_owner_id: id,
      p_deletion_reason: deletionReason || 'حذف إداري'
    });

    if (error) throw error;

    // مسح الـ cache بعد الحذف
    this.clearCache();

    return data;
  }

  /**
   * الموافقة على طلب مزرعة
   */
  static async approveSubmission(submissionId: string, adminNotes?: string) {
    // الحصول على معرف الأدمن الحالي
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle();

    const adminId = adminData?.id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase.rpc('approve_farm_submission', {
      p_submission_id: submissionId,
      p_admin_id: adminId,
      p_admin_notes: adminNotes || null
    });

    if (error) {
      console.error('Error approving submission:', error);
      throw error;
    }
    return data;
  }

  /**
   * رفض طلب مزرعة
   */
  static async rejectSubmission(submissionId: string, rejectionReason: string) {
    // الحصول على معرف الأدمن الحالي
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle();

    const adminId = adminData?.id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase.rpc('reject_farm_submission', {
      p_submission_id: submissionId,
      p_admin_id: adminId,
      p_rejection_reason: rejectionReason
    });

    if (error) {
      console.error('Error rejecting submission:', error);
      throw error;
    }
    return data;
  }

  static async getStatistics(): Promise<OwnerStatistics> {
    try {
      const { data, error } = await supabase.rpc('get_owners_statistics');

      if (error) {
        console.warn('⚠️ Statistics RPC failed, using fallback:', error);
        // Fallback: حساب بسيط من البيانات الموجودة
        const { data: owners } = await supabase
          .from('farm_owners')
          .select('status', { count: 'exact', head: true })
          .is('deleted_at', null);

        return {
          total: owners?.length || 0,
          active: owners?.filter(o => o.status === 'active').length || 0,
          frozen: owners?.filter(o => o.status === 'frozen').length || 0
        };
      }

      return data;
    } catch (err) {
      console.warn('⚠️ Statistics failed completely, returning zeros');
      return { total: 0, active: 0, frozen: 0 };
    }
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }

  static getFarmTypeEmoji(type: string): string {
    const map: any = {
      'نخيل': '🌴',
      'زيتون': '🫒',
      'مختلط': '🌾'
    };
    return map[type] || '🌱';
  }

  static getStatusColor(status: string): string {
    const map: any = {
      'active': 'bg-green-100 text-green-700 border-green-200',
      'frozen': 'bg-blue-100 text-blue-700 border-blue-200',
      'archived': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return map[status] || map.active;
  }

  static getStatusLabel(status: string): string {
    const map: any = {
      'active': 'نشط',
      'frozen': 'مجمد',
      'archived': 'مؤرشف'
    };
    return map[status] || status;
  }
}
