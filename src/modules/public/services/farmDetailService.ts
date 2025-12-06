import { supabase } from '../../../lib/supabase';

export interface FarmVariety {
  id: string;
  variety_name: string;
  price_per_tree: number;
  available_quantity: number;
  description_ar?: string;
}

export interface VarietyBookingItem {
  variety_id: string;
  tree_count: number;
  price_per_tree: number;
}

export interface CreateReservationData {
  farm_id: string;
  investor_name: string;
  investor_phone: string;
  varieties: VarietyBookingItem[];
  total_trees: number;
  total_amount: number;
}

export class FarmDetailService {
  private static cache: Map<string, { data: any; timestamp: number }> = new Map();
  private static CACHE_DURATION = 60000; // 1 minute

  static async getFarmById(farmId: string) {
    // Check cache first
    const cached = this.cache.get(farmId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('[FarmDetailService] Returning cached data for:', farmId);
      return cached.data;
    }

    try {
      const { data: farm, error: farmError } = await supabase
        .from('farms')
        .select('*')
        .eq('id', farmId)
        .is('deleted_at', null)
        .single();

      if (farmError || !farm) {
        console.error('[FarmDetailService] Farm fetch error:', farmError);
        return null;
      }

      const { data: varieties } = await supabase
        .from('farm_tree_varieties')
        .select('*')
        .eq('farm_id', farmId)
        .is('deleted_at', null);

      const result = {
        ...farm,
        varieties: varieties || []
      };

      // Cache the result
      this.cache.set(farmId, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('[FarmDetailService] Unexpected error:', error);
      return null;
    }
  }

  static async createReservation(data: CreateReservationData) {
    try {
      // First, create or get investor
      let investorId: string;

      const { data: existingInvestor } = await supabase
        .from('investors')
        .select('id')
        .eq('phone', data.investor_phone)
        .maybeSingle();

      if (existingInvestor) {
        investorId = existingInvestor.id;
      } else {
        const { data: newInvestor, error: investorError } = await supabase
          .from('investors')
          .insert({
            full_name: data.investor_name,
            phone: data.investor_phone,
            email: '',
            national_id: '',
            status: 'active'
          })
          .select('id')
          .single();

        if (investorError) throw investorError;
        investorId = newInvestor.id;
      }

      // Create reservation for the primary variety (first one)
      const primaryVariety = data.varieties[0];

      const contractStartDate = new Date();
      const contractEndDate = new Date();
      contractEndDate.setFullYear(contractEndDate.getFullYear() + 1);

      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          farm_id: data.farm_id,
          investor_id: investorId,
          customer_name: data.investor_name,
          customer_phone: data.investor_phone,
          number_of_trees: data.total_trees,
          price_per_tree: primaryVariety.price_per_tree,
          total_amount: data.total_amount,
          contract_start_date: contractStartDate.toISOString().split('T')[0],
          contract_end_date: contractEndDate.toISOString().split('T')[0],
          status: 'pending',
          payment_status: 'pending',
          booking_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Create booking items for all varieties
      if (data.varieties.length > 0) {
        const bookingItems = data.varieties.map(v => ({
          reservation_id: reservation.id,
          farm_id: data.farm_id,
          variety_id: v.variety_id,
          tree_count: v.tree_count,
          price_per_tree: v.price_per_tree,
          subtotal: v.tree_count * v.price_per_tree
        }));

        const { error: itemsError } = await supabase
          .from('booking_items')
          .insert(bookingItems);

        if (itemsError) {
          console.error('Error creating booking items:', itemsError);
        }
      }

      return reservation;
    } catch (error) {
      console.error('Error in createReservation:', error);
      throw error;
    }
  }
}
