import { supabase } from '../../lib/supabase';
import type { Reservation } from '../../types/database.types';

interface CreateReservationParams {
  farm_id: string;
  investor_id: string;
  number_of_trees: number;
  contract_start_date: string;
  contract_end_date: string;
}

export class ReservationsService {
  static async getAll() {
    console.log('📥 ReservationsService.getAll() called');

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        farms:farm_id(name_ar, name_en, tree_type)
      `)
      .is('deleted_at', null)
      .neq('booking_status', 'documented') // ✅ استثناء الحجوزات الموثقة
      .order('created_at', { ascending: false });

    console.log('📊 Raw query result:', { data, error, count: data?.length });

    if (error) {
      console.error('❌ Error fetching reservations:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No reservations found');
      return [];
    }

    console.log('✅ Found', data.length, 'reservations');

    const reservationsWithInvestor = await Promise.all((data || []).map(async (reservation: any) => {
      if (reservation.customer_phone) {
        const { data: investor } = await supabase
          .from('investors')
          .select('full_name, email')
          .eq('phone', reservation.customer_phone)
          .is('deleted_at', null)
          .maybeSingle();

        return {
          ...reservation,
          investors: investor || { full_name: reservation.customer_name, email: null }
        };
      }
      return reservation;
    }));

    console.log('✅ Processed reservations with investors:', reservationsWithInvestor.length);
    return reservationsWithInvestor as Reservation[];
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        farms:farm_id(*),
        investors:investor_id(*)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getByInvestor(investorId: string) {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        farms:farm_id(name_ar, name_en, tree_type, location)
      `)
      .eq('investor_id', investorId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getByFarm(farmId: string) {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        investors:investor_id(full_name, email, phone)
      `)
      .eq('farm_id', farmId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createSafe(params: CreateReservationParams) {
    const { data, error } = await supabase.rpc('create_reservation_safe', {
      p_farm_id: params.farm_id,
      p_investor_id: params.investor_id,
      p_number_of_trees: params.number_of_trees,
      p_contract_start_date: params.contract_start_date,
      p_contract_end_date: params.contract_end_date
    });

    if (error) throw error;
    return data;
  }

  static async cancelSafe(reservationId: string, reason?: string) {
    const { data, error } = await supabase.rpc('cancel_reservation_safe', {
      p_reservation_id: reservationId,
      p_reason: reason
    });

    if (error) throw error;
    return data;
  }

  static async updateStatus(id: string, status: Reservation['status']) {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return data as Reservation;
  }

  static async updatePaymentStatus(id: string, paymentStatus: Reservation['payment_status']) {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return data as Reservation;
  }

  static async getStatistics() {
    console.log('📊 ReservationsService.getStatistics() called');

    const { data, error } = await supabase
      .from('reservations')
      .select('status, payment_status, total_amount, number_of_trees, booking_status')
      .is('deleted_at', null)
      .neq('booking_status', 'documented'); // ✅ استثناء الحجوزات الموثقة

    if (error) {
      console.error('❌ Error fetching statistics:', error);
      throw error;
    }

    console.log('📈 Statistics raw data:', data?.length, 'records');

    const stats = {
      total: data?.length || 0,
      pending: data?.filter(r => r.status === 'pending' || r.status === 'pending_contact').length || 0,
      confirmed: data?.filter(r => r.status === 'confirmed').length || 0,
      active: data?.filter(r => r.status === 'active').length || 0,
      completed: data?.filter(r => r.status === 'completed').length || 0,
      cancelled: data?.filter(r => r.status === 'cancelled').length || 0,
      totalAmount: data?.reduce((sum, r) => sum + Number(r.total_amount || 0), 0) || 0,
      totalTrees: data?.reduce((sum, r) => sum + (r.number_of_trees || 0), 0) || 0,
      paid: data?.filter(r => r.payment_status === 'paid').length || 0,
      unpaid: data?.filter(r => r.payment_status === 'pending').length || 0,
    };

    console.log('✅ Statistics calculated:', stats);
    return stats;
  }
}
