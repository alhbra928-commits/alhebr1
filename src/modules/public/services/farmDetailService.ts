import { supabase } from '../../../lib/supabase';

export interface FarmVariety {
  id: string;
  variety_name: string;
  price_per_tree: number;
  available_quantity: number;
  description_ar?: string;
}

export interface CreateReservationData {
  farm_id: string;
  variety_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  quantity: number;
  total_price: number;
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
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert({
        farm_id: data.farm_id,
        variety_id: data.variety_id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email,
        quantity: data.quantity,
        total_price: data.total_price,
        booking_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return reservation;
  }
}
