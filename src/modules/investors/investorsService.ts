import { supabase } from '../../lib/supabase';

export interface Investor {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  email: string;
  national_id: string;
  mobile_number?: string;
  total_invested: number;
  total_trees_owned: number;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  updated_at: string;
  bookings_count?: number;
  certificates_count?: number;
  wallet_balance?: number;
}

export interface InvestorFormData {
  full_name: string;
  phone: string;
  email: string;
  national_id: string;
  mobile_number?: string;
}

export class InvestorsService {
  static async getAll(limit: number = 100, offset: number = 0): Promise<{ data: Investor[], count: number }> {
    const { data, error, count } = await supabase
      .from('investors')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const investors = (data || []).map(investor => ({
      ...investor,
      bookings_count: 0,
      certificates_count: 0,
      mobile_number: investor.phone
    }));

    return { data: investors, count: count || 0 };
  }

  static async getById(id: string): Promise<Investor | null> {
    const { data, error } = await supabase
      .from('investors')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(investorData: InvestorFormData): Promise<Investor> {
    const { data, error } = await supabase
      .from('investors')
      .insert({
        full_name: investorData.full_name,
        phone: investorData.phone || investorData.mobile_number,
        email: investorData.email,
        national_id: investorData.national_id,
        status: 'active',
        total_invested: 0,
        total_trees_owned: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, investorData: Partial<InvestorFormData>): Promise<Investor> {
    const updates: any = {
      ...investorData,
      updated_at: new Date().toISOString()
    };

    if (investorData.mobile_number) {
      updates.phone = investorData.mobile_number;
    }

    const { data, error } = await supabase
      .from('investors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateStatus(id: string, status: 'active' | 'suspended' | 'pending'): Promise<Investor> {
    const { data, error } = await supabase
      .from('investors')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const investor = await this.getById(id);
    if (!investor) throw new Error('Investor not found');

    const backupData = {
      ...investor,
      deleted_at: new Date().toISOString(),
      backup_reason: 'Admin deletion'
    };

    await supabase.from('migration_log').insert({
      migration_type: 'investor_deletion',
      source_table: 'investors',
      source_id: id,
      backup_data: backupData,
      status: 'completed'
    });

    // استخدام soft delete بدلاً من hard delete لتفعيل الـ trigger
    const { error } = await supabase
      .from('investors')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: (await supabase.auth.getUser()).data.user?.id || null
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async getStatistics() {
    const { count: total } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const { count: active } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('deleted_at', null);

    const { count: suspended } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'suspended')
      .is('deleted_at', null);

    const { count: pending } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .is('deleted_at', null);

    return {
      total: total || 0,
      active: active || 0,
      suspended: suspended || 0,
      pending: pending || 0,
      totalInvestment: 0,
      totalTrees: 0
    };
  }

  static async getInvestorBookings(investorId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        farms:farm_id(id, farm_code, name_ar)
      `)
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getInvestorCertificates(investorId: string) {
    const { data, error } = await supabase
      .from('documentation')
      .select(`
        *,
        farms:farm_id(id, farm_code, name_ar)
      `)
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getInvestorFarms(investorId: string) {
    const { data, error } = await supabase
      .from('documentation')
      .select(`
        farm_id,
        farms:farm_id(id, farm_code, name_ar, farm_type, region, city)
      `)
      .eq('investor_id', investorId);

    if (error) throw error;

    const uniqueFarms = Array.from(
      new Map((data || []).map(item => [item.farm_id, item.farms])).values()
    );

    return uniqueFarms;
  }
}
