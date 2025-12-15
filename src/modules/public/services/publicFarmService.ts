import { supabase } from '../../../lib/supabase';
import { PublicFarm, FarmSuggestion } from '../types/farm.types';

export class PublicFarmService {
  private static farmsCache: { data: PublicFarm[]; timestamp: number } | null = null;
  private static CACHE_DURATION = 30000; // 30 seconds

  static clearCache(): void {
    console.log('[PublicFarmService] Cache cleared');
    this.farmsCache = null;
  }

  static async getAllFarms(limit: number = 20): Promise<PublicFarm[]> {
    // Check cache
    if (this.farmsCache && Date.now() - this.farmsCache.timestamp < this.CACHE_DURATION) {
      console.log('[PublicFarmService] Returning cached farms');
      return this.farmsCache.data;
    }

    const { data: farms, error: farmsError } = await supabase
      .from('farms')
      .select('id, farm_barcode, farm_code, name_ar, name_en, tree_type, city, region, total_trees, price_per_tree, marketing_price, actual_price, images, aerial_map_url, google_map_link, description_ar, description_en, latitude, longitude, sales_status, created_at')
      .is('deleted_at', null)
      .eq('status', 'active')
      .order('sales_status', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (farmsError) {
      console.error('[PublicFarmService] Farms fetch error:', farmsError);
      return this.farmsCache?.data || [];
    }

    if (!farms || farms.length === 0) {
      return [];
    }

    const farmIds = farms.map(f => f.id);

    const { data: allVarieties } = await supabase
      .from('farm_tree_varieties')
      .select('farm_id, available_quantity, total_trees')
      .in('farm_id', farmIds)
      .is('deleted_at', null);

    const varietiesByFarm = new Map<string, Array<{available_quantity: number, total_trees: number}>>();

    if (allVarieties) {
      allVarieties.forEach((variety: any) => {
        if (!varietiesByFarm.has(variety.farm_id)) {
          varietiesByFarm.set(variety.farm_id, []);
        }
        varietiesByFarm.get(variety.farm_id)!.push({
          available_quantity: variety.available_quantity || 0,
          total_trees: variety.total_trees || 0
        });
      });
    }

    const farmsWithCalculations = farms.map((farm: any) => {
      const varieties = varietiesByFarm.get(farm.id) || [];

      const totalAvailable = varieties.reduce((sum, v) => sum + v.available_quantity, 0);
      const totalTreesFromVarieties = varieties.reduce((sum, v) => sum + v.total_trees, 0);

      return {
        ...farm,
        available_trees: totalAvailable,
        total_trees: totalTreesFromVarieties > 0 ? totalTreesFromVarieties : (farm.total_trees || 0)
      };
    });

    const result = farmsWithCalculations.map((farm: any) => this.mapToPublicFarm(farm));

    // Cache the result
    this.farmsCache = {
      data: result,
      timestamp: Date.now()
    };

    return result;
  }

  static async getFarmByBarcode(barcode: string): Promise<PublicFarm | null> {
    const { data, error } = await supabase
      .from('farms')
      .select('id, farm_barcode, farm_code, name_ar, name_en, tree_type, city, region, status, total_trees, price_per_tree, marketing_price, actual_price, description_ar, description_en, images, aerial_map_url, google_map_link, latitude, longitude, sales_status, created_at')
      .or(`farm_barcode.eq.${barcode},farm_code.eq.${barcode}`)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const { data: varieties } = await supabase
      .from('farm_tree_varieties')
      .select('available_quantity, total_trees')
      .eq('farm_id', data.id)
      .is('deleted_at', null);

    const totalAvailable = varieties?.reduce((sum, v) => sum + (v.available_quantity || 0), 0) || 0;
    const totalTrees = varieties?.reduce((sum, v) => sum + (v.total_trees || 0), 0) || data.total_trees || 0;

    const farmWithVarieties = {
      ...data,
      available_trees: totalAvailable,
      total_trees: totalTrees > 0 ? totalTrees : data.total_trees
    };

    return this.mapToPublicFarm(farmWithVarieties);
  }

  static async getSuggestedFarms(limit: number = 3): Promise<FarmSuggestion[]> {
    const { data, error } = await supabase
      .from('farms')
      .select('farm_barcode, farm_code, name_ar, name_en')
      .is('deleted_at', null)
      .eq('status', 'active')
      .limit(limit);

    if (error) throw error;

    return data.map((farm: any, index: number) => ({
      barcode: farm.farm_barcode || farm.farm_code || `FARM-${index}`,
      farm_name: farm.name_ar || farm.name_en || 'مزرعة',
      reason: index === 0 ? 'most_booked' : index === 1 ? 'highest_return' : 'new_opening',
      badge: index === 0 ? 'الأكثر حجزاً' : index === 1 ? 'الأعلى عائداً' : 'افتتح حديثاً',
    }));
  }

  static async getSimilarFarms(barcode: string, limit: number = 3): Promise<PublicFarm[]> {
    const currentFarm = await this.getFarmByBarcode(barcode);
    if (!currentFarm) return [];

    const { data, error } = await supabase
      .from('farms')
      .select('id, farm_barcode, farm_code, name_ar, name_en, tree_type, city, region, status, total_trees, price_per_tree, marketing_price, actual_price, description_ar, description_en, images, aerial_map_url, google_map_link, latitude, longitude, sales_status, created_at')
      .eq('city', currentFarm.location_city)
      .not('farm_barcode', 'eq', barcode)
      .not('farm_code', 'eq', barcode)
      .is('deleted_at', null)
      .limit(limit);

    if (error) throw error;

    return data.map((farm: any) => this.mapToPublicFarm(farm));
  }

  private static mapToPublicFarm(farm: any): PublicFarm {
    const availableTrees = farm.available_trees || farm.total_trees || 0;
    const totalTrees = farm.total_trees || 0;
    const bookedTrees = totalTrees - availableTrees;
    const bookingPercentage = totalTrees > 0 ? Math.round((bookedTrees / totalTrees) * 100) : 0;
    const completionPercentage = bookingPercentage;

    const status = farm.sales_status === 'closed' ? 'full' : bookingPercentage >= 80 ? 'almost_full' : 'open';
    const aerialImage = farm.aerial_map_url || (farm.images && farm.images[0]) || '';

    // Debug: تسجيل معلومات الصور في البطاقة
    console.log('[PublicFarmService] Images Debug for Card:', {
      farmName: farm.name_ar,
      aerial_map_url_exists: !!farm.aerial_map_url,
      aerial_map_url_length: farm.aerial_map_url?.length,
      aerial_map_url_preview: farm.aerial_map_url?.substring(0, 50),
      images_exists: !!farm.images,
      images_length: farm.images?.length,
      aerialImage_final: aerialImage ? aerialImage.substring(0, 50) + '...' : 'EMPTY'
    });

    const treeType = farm.tree_type === 'نخيل' ? 'palm' : farm.tree_type === 'زيتون' ? 'olive' : 'palm';

    return {
      id: farm.id,
      barcode: farm.farm_barcode || farm.farm_code || '',
      farm_name: farm.name_ar || farm.name_en || 'مزرعة',
      total_trees: totalTrees,
      available_trees: availableTrees,
      base_price: farm.price_per_tree || farm.marketing_price || farm.actual_price || 0,
      tree_type: treeType,
      location_city: farm.city || '',
      location_region: farm.region || '',
      description: farm.description_ar || farm.description_en || '',
      aerial_image: aerialImage,
      ground_images: farm.images || [],
      video_url: null,
      google_map_link: farm.google_map_link || null,
      status,
      completion_percentage: completionPercentage,
      booking_percentage: bookingPercentage,
      latitude: farm.latitude || null,
      longitude: farm.longitude || null,
      harvest_duration: 'سنوياً',
      soil_type: 'خصبة',
      services_available: ['ري', 'صيانة'],
      created_at: farm.created_at,
    };
  }
}
