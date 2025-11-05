import { supabase } from '../../lib/supabase';

export interface FarmOwnerData {
  id?: string;
  owner_full_name: string;
  owner_phone: string;
  farm_location: string;
  farm_area: number;
  farm_area_unit: string;
  farm_type: string;
  farm_type_other?: string;
  farm_price: number;
  bank_iban: string;
  payment_duration_days: number;
  farm_image_url?: string;
  manual_entry: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'frozen';
  created_at?: string;
  updated_at?: string;
}

export class OwnersService {
  /**
   * إنشاء مالك مزرعة جديد
   */
  static async createOwner(data: Omit<FarmOwnerData, 'id' | 'created_at' | 'updated_at'>): Promise<FarmOwnerData> {
    try {
      // تحويل البيانات للتوافق مع الجدول (full_name و mobile_number)
      const dbData = {
        // الحقول الإلزامية للنظام القديم
        full_name: data.owner_full_name,
        mobile_number: data.owner_phone,
        region: 'السعودية', // قيمة افتراضية
        city: data.farm_location || 'غير محدد',
        farm_area: data.farm_area,
        farm_area_unit: data.farm_area_unit,
        farm_type: data.farm_type,
        actual_price: data.farm_price,
        deed_number: 'AUTO-' + Date.now(), // رقم صك تلقائي
        farm_location_region: 'السعودية',
        farm_location_city: data.farm_location || 'غير محدد',
        payment_grace_period: data.payment_duration_days,

        // الحقول الجديدة
        owner_full_name: data.owner_full_name,
        owner_phone: data.owner_phone,
        farm_location: data.farm_location,
        farm_price: data.farm_price,
        payment_duration_days: data.payment_duration_days,
        farm_image_url: data.farm_image_url,
        manual_entry: data.manual_entry,
        farm_type_other: data.farm_type_other,

        // البنك
        bank_iban: data.bank_iban,

        // الحالة
        approval_status: data.approval_status,
        status: data.status,

        // التواريخ
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: owner, error } = await supabase
        .from('farm_owners')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Error creating owner:', error);
        throw new Error(error.message);
      }

      console.log('✅ Owner created successfully:', owner);
      return owner;
    } catch (error: any) {
      console.error('❌ Failed to create owner:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع أصحاب المزارع
   */
  static async getAllOwners(): Promise<FarmOwnerData[]> {
    try {
      const { data, error } = await supabase
        .from('farm_owners')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching owners:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('❌ Failed to fetch owners:', error);
      return [];
    }
  }

  /**
   * الحصول على أصحاب المزارع حسب الحالة
   */
  static async getOwnersByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<FarmOwnerData[]> {
    try {
      const { data, error } = await supabase
        .from('farm_owners')
        .select('*')
        .eq('approval_status', status)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching owners by status:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('❌ Failed to fetch owners by status:', error);
      return [];
    }
  }

  /**
   * الحصول على مالك واحد
   */
  static async getOwnerById(id: string): Promise<FarmOwnerData | null> {
    try {
      const { data, error } = await supabase
        .from('farm_owners')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching owner:', error);
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch owner:', error);
      return null;
    }
  }

  /**
   * تحديث بيانات المالك
   */
  static async updateOwner(id: string, data: Partial<FarmOwnerData>): Promise<FarmOwnerData> {
    try {
      // تحويل البيانات للتوافق مع الجدول
      const dbData: any = {
        updated_at: new Date().toISOString()
      };

      // مزامنة الحقول الجديدة مع القديمة
      if (data.owner_full_name) {
        dbData.full_name = data.owner_full_name;
        dbData.owner_full_name = data.owner_full_name;
      }
      if (data.owner_phone) {
        dbData.mobile_number = data.owner_phone;
        dbData.owner_phone = data.owner_phone;
      }
      if (data.farm_location) {
        dbData.city = data.farm_location;
        dbData.farm_location = data.farm_location;
      }
      if (data.farm_price !== undefined) {
        dbData.actual_price = data.farm_price;
        dbData.farm_price = data.farm_price;
      }
      if (data.payment_duration_days !== undefined) {
        dbData.payment_grace_period = data.payment_duration_days;
        dbData.payment_duration_days = data.payment_duration_days;
      }

      // باقي الحقول
      if (data.farm_area !== undefined) dbData.farm_area = data.farm_area;
      if (data.farm_area_unit) dbData.farm_area_unit = data.farm_area_unit;
      if (data.farm_type) dbData.farm_type = data.farm_type;
      if (data.farm_type_other) dbData.farm_type_other = data.farm_type_other;
      if (data.bank_iban) dbData.bank_iban = data.bank_iban;
      if (data.farm_image_url) dbData.farm_image_url = data.farm_image_url;
      if (data.approval_status) dbData.approval_status = data.approval_status;
      if (data.status) dbData.status = data.status;

      const { data: owner, error } = await supabase
        .from('farm_owners')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating owner:', error);
        throw new Error(error.message);
      }

      console.log('✅ Owner updated successfully:', owner);
      return owner;
    } catch (error: any) {
      console.error('❌ Failed to update owner:', error);
      throw error;
    }
  }

  /**
   * اعتماد مالك المزرعة
   */
  static async approveOwner(id: string): Promise<FarmOwnerData> {
    try {
      const { data: owner, error } = await supabase
        .from('farm_owners')
        .update({
          approval_status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error approving owner:', error);
        throw new Error(error.message);
      }

      console.log('✅ Owner approved successfully:', owner);

      // إنشاء سجل مالي للمالك
      await this.createFinancialRecord(owner);

      return owner;
    } catch (error: any) {
      console.error('❌ Failed to approve owner:', error);
      throw error;
    }
  }

  /**
   * رفض مالك المزرعة
   */
  static async rejectOwner(id: string, reason?: string): Promise<FarmOwnerData> {
    try {
      const { data: owner, error } = await supabase
        .from('farm_owners')
        .update({
          approval_status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error rejecting owner:', error);
        throw new Error(error.message);
      }

      console.log('✅ Owner rejected:', owner);
      return owner;
    } catch (error: any) {
      console.error('❌ Failed to reject owner:', error);
      throw error;
    }
  }

  /**
   * حذف مالك المزرعة (soft delete)
   */
  static async deleteOwner(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('farm_owners')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: '00000000-0000-0000-0000-000000000000'
        })
        .eq('id', id);

      if (error) {
        console.error('Error deleting owner:', error);
        throw new Error(error.message);
      }

      console.log('✅ Owner deleted successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to delete owner:', error);
      return false;
    }
  }

  /**
   * إنشاء سجل مالي للمالك
   */
  private static async createFinancialRecord(owner: FarmOwnerData): Promise<void> {
    try {
      // يمكن إضافة منطق إنشاء السجل المالي هنا
      console.log('📊 Creating financial record for owner:', owner.id);

      // مثال: إنشاء محفظة مالية
      const { error } = await supabase
        .from('farm_wallets')
        .insert([{
          farm_code: `FARM-${owner.id?.substring(0, 8).toUpperCase()}`,
          owner_id: owner.id,
          total_investment: owner.farm_price,
          available_balance: 0,
          pending_revenue: 0,
          total_distributed: 0,
          status: 'active',
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error creating financial record:', error);
      } else {
        console.log('✅ Financial record created');
      }
    } catch (error) {
      console.error('❌ Failed to create financial record:', error);
    }
  }

  /**
   * الحصول على إحصائيات أصحاب المزارع
   */
  static async getStatistics(): Promise<any> {
    try {
      const { count: total, error: totalError } = await supabase
        .from('farm_owners')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      const { count: approved, error: approvedError } = await supabase
        .from('farm_owners')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'approved')
        .is('deleted_at', null);

      const { count: pending, error: pendingError } = await supabase
        .from('farm_owners')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'pending')
        .is('deleted_at', null);

      const { count: rejected, error: rejectedError } = await supabase
        .from('farm_owners')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'rejected')
        .is('deleted_at', null);

      if (totalError || approvedError || pendingError || rejectedError) {
        console.error('Error fetching statistics');
      }

      return {
        total: total || 0,
        approved: approved || 0,
        pending: pending || 0,
        rejected: rejected || 0
      };
    } catch (error: any) {
      console.error('❌ Failed to fetch statistics:', error);
      return {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
      };
    }
  }
}
