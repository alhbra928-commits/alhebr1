import { supabase } from '../../../lib/supabase';

export interface FarmVariety {
  id: string;
  farm_id: string;
  tree_type: string;
  variety_name: string;
  variety_name_en: string;
  price_per_tree: number;
  available_quantity: number;
  max_booking_per_investor: number;
  total_trees: number;
  description_ar?: string;
  description_en?: string;
}

export interface FarmDetail {
  id: string;
  farm_code: string;
  name_ar: string;
  name_en: string;
  tree_type: 'palm' | 'olive' | 'mixed';
  farm_type: string;
  city: string;
  region: string;
  total_trees: number;
  available_trees: number;
  price_per_tree: number;
  description_ar?: string;
  description_en?: string;
  aerial_map_url?: string;
  google_map_link?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  images?: string[];
  varieties: FarmVariety[];
  has_well?: boolean;
  has_electricity?: boolean;
  has_fence?: boolean;
  has_road?: boolean;
  has_sterilization?: boolean;
  technical_notes?: string;
}

export interface ReservationVariety {
  variety_id: string;
  tree_count: number;
  price_per_tree: number;
}

export interface CreateReservationData {
  farm_id: string;
  investor_name: string;
  investor_phone: string;
  varieties: ReservationVariety[];
  total_trees: number;
  total_amount: number;
}

export class FarmDetailService {
  static normalizePhone(phone: string): string {
    if (!phone) return phone;
    let normalized = phone.trim();
    if (normalized.startsWith('+966')) {
      normalized = normalized.substring(4);
    } else if (normalized.startsWith('966')) {
      normalized = normalized.substring(3);
    } else if (normalized.startsWith('00966')) {
      normalized = normalized.substring(5);
    }
    if (normalized.startsWith('0')) {
      normalized = normalized.substring(1);
    }
    normalized = normalized.replace(/\s/g, '');
    return normalized;
  }

  static async getFarmById(farmId: string): Promise<FarmDetail | null> {
    const startTime = performance.now();
    console.log('[PERF] FarmDetail: Started loading farm', farmId);

    try {
      let farm = null;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(farmId);

      const farmQuery = supabase
        .from('farms')
        .select('id, farm_code, name_ar, name_en, tree_type, farm_type, city, region, total_trees, available_trees, price_per_tree, description_ar, description_en, aerial_map_url, google_map_link, latitude, longitude, status, images, has_well, has_electricity, has_fence, has_road, has_sterilization, technical_notes')
        .is('deleted_at', null)
        .eq('status', 'active');

      const { data, error } = isUUID
        ? await farmQuery.eq('id', farmId).maybeSingle()
        : await farmQuery.eq('farm_code', farmId).maybeSingle();

      console.log(`[PERF] FarmDetail: Farm query took ${(performance.now() - startTime).toFixed(0)}ms`);
      console.log('[PERF] FarmDetail: Query result:', {
        found: !!data,
        isUUID,
        farmId,
        data: data ? { id: data.id, name: data.name_ar } : null,
        error: error
      });

      if (error) {
        console.error('[ERROR] FarmDetail: Query error:', error);
        throw error;
      }

      farm = data;

      if (!farm) {
        console.log('[PERF] FarmDetail: Farm not found');
        return null;
      }

      const varietiesStart = performance.now();
      const { data: varieties, error: varietiesError } = await supabase
        .from('farm_tree_varieties')
        .select('id, farm_id, tree_type, variety_name, variety_name_en, price_per_tree, available_quantity, max_booking_per_investor, total_trees, description_ar, description_en')
        .eq('farm_id', farm.id)
        .is('deleted_at', null)
        .gt('available_quantity', 0)
        .order('tree_type', { ascending: true })
        .order('variety_name', { ascending: true });

      console.log(`[PERF] FarmDetail: Varieties query took ${(performance.now() - varietiesStart).toFixed(0)}ms, Count: ${varieties?.length || 0}`);

      if (varietiesError) throw varietiesError;

      console.log(`[PERF] FarmDetail: TOTAL took ${(performance.now() - startTime).toFixed(0)}ms`);

      const normalizedTreeType = farm.tree_type === 'نخيل' ? 'palm' : farm.tree_type === 'زيتون' ? 'olive' : (farm.tree_type || 'palm');

      console.log('[PERF] FarmDetail: tree_type conversion:', {
        original: farm.tree_type,
        normalized: normalizedTreeType
      });

      // Debug: تسجيل معلومات الصور من قاعدة البيانات
      console.log('[FarmDetailService] Images Debug:', {
        farmName: farm.name_ar,
        aerial_map_url_exists: !!farm.aerial_map_url,
        aerial_map_url_length: farm.aerial_map_url?.length,
        aerial_map_url_preview: farm.aerial_map_url?.substring(0, 50),
        images_raw: farm.images,
        images_is_array: Array.isArray(farm.images),
        images_length: Array.isArray(farm.images) ? farm.images.length : 0
      });

      return {
        id: farm.id,
        farm_code: farm.farm_code || `FARM-${farm.id.slice(0, 8)}`,
        name_ar: farm.name_ar,
        name_en: farm.name_en,
        tree_type: normalizedTreeType,
        farm_type: farm.farm_type || farm.tree_type,
        city: farm.city,
        region: farm.region,
        total_trees: farm.total_trees || 0,
        available_trees: farm.available_trees || 0,
        price_per_tree: farm.price_per_tree || 0,
        description_ar: farm.description_ar,
        description_en: farm.description_en,
        aerial_map_url: farm.aerial_map_url,
        google_map_link: farm.google_map_link,
        latitude: farm.latitude,
        longitude: farm.longitude,
        status: farm.status,
        images: Array.isArray(farm.images) ? farm.images : [],
        varieties: varieties || [],
        has_well: farm.has_well || false,
        has_electricity: farm.has_electricity || false,
        has_fence: farm.has_fence || false,
        has_road: farm.has_road || false,
        has_sterilization: farm.has_sterilization || false,
        technical_notes: farm.technical_notes
      };
    } catch (error) {
      console.log(`[PERF] FarmDetail: FAILED after ${(performance.now() - startTime).toFixed(0)}ms`);
      throw error;
    }
  }

  static async createReservation(data: CreateReservationData): Promise<any> {
    try {
      console.log('🔄 Creating reservation with data:', data);

      if (!data.varieties || data.varieties.length === 0) {
        throw new Error('يجب اختيار صنف واحد على الأقل');
      }

      if (data.varieties.length > 20) {
        throw new Error('الحد الأقصى 20 صنف في الحجز الواحد');
      }

      const normalizedPhone = this.normalizePhone(data.investor_phone);
      console.log('📞 Phone normalization:', data.investor_phone, '→', normalizedPhone);

      const avgPricePerTree = data.total_trees > 0
        ? data.total_amount / data.total_trees
        : 0;

      const reservation = {
        farm_id: data.farm_id,
        customer_name: data.investor_name,
        customer_phone: normalizedPhone,
        number_of_trees: data.total_trees,
        price_per_tree: avgPricePerTree,
        total_amount: data.total_amount,
        status: 'pending',
        booking_status: 'temporary',
        payment_status: 'pending',
        reservation_date: new Date().toISOString()
      };

      console.log('�� Reservation object:', reservation);

      const { data: reservationData, error: reservationError } = await supabase
        .from('reservations')
        .insert([reservation])
        .select()
        .single();

      if (reservationError) {
        console.error('❌ Reservation error:', reservationError);
        throw reservationError;
      }

      console.log('✅ Reservation created:', reservationData.id);

      const reservationId = reservationData.id;
      const bookingItems = data.varieties.map(v => ({
        reservation_id: reservationId,
        variety_id: v.variety_id,
        quantity: v.tree_count,
        price_per_tree: v.price_per_tree,
        subtotal: v.tree_count * v.price_per_tree
      }));

      console.log(`📋 Creating ${bookingItems.length} booking items for ${data.varieties.length} varieties...`);

      const { data: itemsData, error: itemsError } = await supabase
        .from('booking_items')
        .insert(bookingItems)
        .select();

      if (itemsError) {
        console.error('❌ Booking items error:', itemsError);
        await supabase.from('reservations').delete().eq('id', reservationId);
        throw itemsError;
      }

      console.log(`✅ Created ${itemsData.length} booking items successfully`);

      return {
        ...reservationData,
        booking_items: itemsData
      };
    } catch (error) {
      console.error('❌ Error creating reservation:', error);
      throw error;
    }
  }

  static async getAvailableTreesCount(farmId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('farm_tree_varieties')
        .select('available_quantity')
        .eq('farm_id', farmId);

      if (error) throw error;

      return data.reduce((sum, variety) => sum + (variety.available_quantity || 0), 0);
    } catch (error) {
      console.error('Error fetching available trees:', error);
      return 0;
    }
  }
}
