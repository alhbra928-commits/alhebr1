import { supabase } from '../../lib/supabase';

export interface FarmFormData {
  name_ar: string;
  owner_id: string;
  deed_number: string;
  area_sqm: number;
  area_unit: string;
  farm_type: string;
  description_ar?: string;
  crop_type: string;
  total_trees: number;
  actual_price: number;
  marketing_price: number;
  unit_marketing_price: number;
  total_marketing_price: number;
  unit_actual_price: number;
  total_actual_price: number;
  has_well: boolean;
  has_electricity: boolean;
  has_fence: boolean;
  has_road: boolean;
  has_sterilization: boolean;
  technical_notes?: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  google_map_link?: string;
  aerial_map_url?: string;
  payment_grace_period: number;
  status: string;
  admin_notes?: string;
}

export interface Farm extends FarmFormData {
  id: string;
  farm_code?: string;
  farm_barcode?: string;
  barcode_generated_at?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface TreeCode {
  id: string;
  farm_id: string;
  tree_code: string;
  tree_status: 'متاحة' | 'محجوزة' | 'مباعة';
  created_at: string;
  updated_at: string;
}

export class FarmsService {
  static async getAll(limit: number = 100, offset: number = 0) {
    const { data: farms, error, count } = await supabase
      .from('farms')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching farms:', error);
      return { data: [], count: 0 };
    }

    if (!farms || farms.length === 0) return { data: [], count: 0 };

    const ownerIds = [...new Set(farms.map(f => f.owner_id).filter(Boolean))];

    const { data: owners } = await supabase
      .from('farm_owners')
      .select('id, full_name, mobile_number')
      .in('id', ownerIds);

    const ownersMap = new Map(owners?.map(o => [o.id, o]) || []);

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

    const farmsWithVarieties = farms.map((farm) => {
      const varieties = varietiesByFarm.get(farm.id) || [];
      const totalAvailable = varieties.reduce((sum, v) => sum + v.available_quantity, 0);
      const totalTreesFromVarieties = varieties.reduce((sum, v) => sum + v.total_trees, 0);

      return {
        ...farm,
        available_trees: totalAvailable,
        total_trees: totalTreesFromVarieties > 0 ? totalTreesFromVarieties : (farm.total_trees || 0),
        owner: ownersMap.get(farm.owner_id) || null
      };
    });

    return {
      data: farmsWithVarieties,
      count: count || 0
    };
  }

  static async getById(id: string) {
    const { data: farm, error } = await supabase
      .from('farms')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Error fetching farm:', error);
      return null;
    }

    if (!farm) return null;

    const { data: owner } = await supabase
      .from('farm_owners')
      .select('id, full_name, mobile_number, region, city')
      .eq('id', farm.owner_id)
      .maybeSingle();

    const varieties = await this.getVarieties(id);

    const totalAvailable = varieties?.reduce((sum, v) => sum + (v.available_quantity || 0), 0) || 0;
    const totalTrees = varieties?.reduce((sum, v) => sum + (v.total_trees || 0), 0) || farm.total_trees || 0;

    return {
      ...farm,
      available_trees: totalAvailable,
      total_trees: totalTrees > 0 ? totalTrees : farm.total_trees,
      owner: owner || null,
      varieties: varieties
    };
  }

  static async getActive() {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active farms:', error);
      return { data: [], count: 0 };
    }
    return data || [];
  }

  static async create(farm: FarmFormData) {
    // التحقق من الحقول المطلوبة
    if (!farm.name_ar?.trim()) {
      throw new Error('اسم المزرعة مطلوب');
    }
    if (!farm.region?.trim() || !farm.city?.trim()) {
      throw new Error('المنطقة والمدينة مطلوبة لإنشاء الموقع');
    }
    if (!farm.total_trees || farm.total_trees <= 0) {
      throw new Error('عدد الأشجار يجب أن يكون أكبر من صفر');
    }
    if (!farm.unit_marketing_price || farm.unit_marketing_price <= 0) {
      throw new Error('السعر التسويقي للوحدة يجب أن يكون أكبر من صفر');
    }
    if (!farm.area_sqm || farm.area_sqm <= 0) {
      throw new Error('المساحة يجب أن تكون أكبر من صفر');
    }

    // تحويل crop_type إلى tree_type المقبول في قاعدة البيانات
    const mapTreeType = (cropType: string | undefined, farmType: string): string => {
      // إذا لم يتم تحديد crop_type، استخدم farm_type
      const typeToCheck = cropType?.trim() || farmType?.trim() || '';
      const normalized = typeToCheck.toLowerCase();

      // البحث عن كلمات دالة
      if (normalized.includes('نخل') || normalized.includes('نخيل')) {
        return 'نخيل';
      } else if (normalized.includes('زيت') || normalized.includes('زيتون')) {
        return 'زيتون';
      } else if (normalized.includes('مختلط') || normalized.includes('مزيج')) {
        return 'مختلط';
      }

      // إذا كانت القيمة بالفعل من القيم المقبولة
      if (['نخيل', 'زيتون', 'مختلط'].includes(typeToCheck)) {
        return typeToCheck;
      }

      // القيمة الافتراضية بناءً على farm_type
      return farmType || 'نخيل';
    };

    const treeType = mapTreeType(farm.crop_type, farm.farm_type);

    // إزالة crop_type فقط من الكائن قبل الإرسال لأنه ليس عمود في الجدول
    // نبقي farm_type لأنه موجود في جدول farms
    const { crop_type, ...farmDataWithoutCropType } = farm;

    // إضافة timestamp فريد لكسر الـ cache ومنع التكرار
    const uniqueTimestamp = Date.now();

    const { data, error } = await supabase
      .from('farms')
      .insert([{
        ...farmDataWithoutCropType,
        name_en: farm.name_ar, // استخدام الاسم العربي كاسم إنجليزي مؤقت
        location: `${farm.region}, ${farm.city}`, // ملء حقل الموقع
        tree_type: treeType, // تحويل نوع المحصول إلى نوع شجرة مقبول
        available_trees: farm.total_trees, // افتراضياً كل الأشجار متاحة
        price_per_tree: farm.unit_marketing_price, // السعر للشجرة
        expected_annual_return: 0, // يمكن تحديثه لاحقاً
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      // رسالة خطأ تفصيلية
      let errorMsg = 'خطأ في قاعدة البيانات:\n\n';

      if (error.message.includes('tree_type_check')) {
        errorMsg += '❌ نوع الشجرة غير صحيح\nالقيم المسموح بها: نخيل، زيتون، مختلط\n';
      } else if (error.message.includes('status_check')) {
        errorMsg += '❌ حالة المزرعة غير صحيحة\nالقيم المسموح بها: active، frozen، under_review، archived\n';
      } else if (error.message.includes('not-null')) {
        errorMsg += '❌ يوجد حقل مطلوب لم يتم ملؤه\n';
      } else {
        errorMsg += error.message;
      }

      errorMsg += '\n\nالتفاصيل التقنية:\n' + error.message;
      throw new Error(errorMsg);
    }

    return data as Farm;
  }

  static async update(id: string, updates: Partial<FarmFormData>) {
    // إزالة crop_type فقط من updates قبل الإرسال
    // نبقي farm_type لأنه موجود في جدول farms
    const { crop_type, ...updatesWithoutCropType } = updates;

    const updateData: any = {
      ...updatesWithoutCropType,
      updated_at: new Date().toISOString()
    };

    // إذا تم تحديث الاسم العربي، حدّث الاسم الإنجليزي أيضاً
    if (updates.name_ar) {
      updateData.name_en = updates.name_ar;
    }

    // إذا تم تحديث المنطقة أو المدينة، حدّث الموقع
    if (updates.region || updates.city) {
      const { data: currentFarm } = await supabase
        .from('farms')
        .select('region, city')
        .eq('id', id)
        .maybeSingle();

      const region = updates.region || currentFarm?.region || '';
      const city = updates.city || currentFarm?.city || '';
      updateData.location = `${region}, ${city}`;
    }

    // إذا تم تحديث نوع المحصول، حدّث نوع الشجرة باستخدام دالة التحويل
    if (crop_type) {
      const mapTreeType = (cropType: string): string => {
        const normalized = cropType.trim().toLowerCase();
        if (normalized.includes('نخل') || normalized.includes('نخيل')) {
          return 'نخيل';
        } else if (normalized.includes('زيت') || normalized.includes('زيتون')) {
          return 'زيتون';
        } else if (normalized.includes('مختلط') || normalized.includes('مزيج')) {
          return 'مختلط';
        }
        if (['نخيل', 'زيتون', 'مختلط'].includes(cropType)) {
          return cropType;
        }
        return 'نخيل';
      };
      updateData.tree_type = mapTreeType(crop_type);
    }

    // إذا تم تحديث عدد الأشجار، حدّث الأشجار المتاحة
    if (updates.total_trees !== undefined) {
      updateData.available_trees = updates.total_trees;
    }

    // إذا تم تحديث سعر الوحدة التسويقي، حدّث السعر للشجرة
    if (updates.unit_marketing_price !== undefined) {
      updateData.price_per_tree = updates.unit_marketing_price;
    }

    const { data, error } = await supabase
      .from('farms')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) return { data: [], count: 0 };
    return data as Farm;
  }

  static async deletePermanently(id: string, reason?: string) {
    const { error } = await supabase.rpc('delete_farm_permanently', {
      p_farm_id: id,
      p_deleted_by: null,
      p_reason: reason
    });

    if (error) return { data: [], count: 0 };
  }

  static async getStatistics() {
    const { data, error } = await supabase.rpc('get_farms_statistics');

    if (error) {
      console.error('Error fetching statistics:', error);
      return {
        total: 0,
        active: 0,
        frozen: 0,
        under_review: 0,
        total_trees: 0,
        available_trees: 0,
        total_area: 0,
        avg_marketing_price: 0
      };
    }
    return data;
  }

  static formatPrice(price: number): string {
    return `${price.toLocaleString('ar-SA')} ريال`;
  }

  static getFarmTypeEmoji(type: string): string {
    const emojiMap: { [key: string]: string } = {
      'نخيل': '🌴',
      'زيتون': '🫒',
      'مختلط': '🌾'
    };
    return emojiMap[type] || '🌱';
  }

  static getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      active: 'bg-green-100 text-green-700 border-green-400',
      frozen: 'bg-blue-100 text-blue-700 border-blue-400',
      under_review: 'bg-yellow-100 text-yellow-700 border-yellow-400',
      archived: 'bg-gray-100 text-gray-700 border-gray-400'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700 border-gray-400';
  }

  static getStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      active: 'نشطة',
      frozen: 'مجمدة',
      under_review: 'تحت المراجعة',
      archived: 'مؤرشفة'
    };
    return labelMap[status] || status;
  }

  static calculateProfitMargin(actualPrice: number, marketingPrice: number): number {
    if (actualPrice === 0) return 0;
    return ((marketingPrice - actualPrice) / actualPrice) * 100;
  }

  static formatArea(area: number, unit: string): string {
    return `${area.toLocaleString('ar-SA')} ${unit}`;
  }

  static async getTreeCodes(farmId: string): Promise<TreeCode[]> {
    const { data, error } = await supabase
      .from('farm_trees')
      .select('*')
      .eq('farm_id', farmId)
      .order('tree_code', { ascending: true });

    if (error) {
      console.error('Error fetching tree codes:', error);
      return { data: [], count: 0 };
    }

    return data || [];
  }

  static async getFarmWithTreeCodes(farmId: string) {
    const farm = await this.getById(farmId);
    if (!farm) return null;

    const treeCodes = await this.getTreeCodes(farmId);

    return {
      ...farm,
      treeCodes
    };
  }

  static async generateBarcode(farmCode: string, farmName: string): Promise<string> {
    const barcodeData = {
      farm_code: farmCode,
      farm_name: farmName,
      generated_at: new Date().toISOString()
    };

    const dataString = JSON.stringify(barcodeData);
    const encodedData = encodeURIComponent(dataString);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}`;

    return qrCodeUrl;
  }

  static async updateBarcodeInfo(farmId: string, barcodeUrl: string) {
    const { error } = await supabase
      .from('farms')
      .update({
        farm_barcode: barcodeUrl,
        barcode_generated_at: new Date().toISOString()
      })
      .eq('id', farmId);

    if (error) return { data: [], count: 0 };
  }

  static async getTreeCodesByStatus(farmId: string, status: string): Promise<TreeCode[]> {
    const { data, error } = await supabase
      .from('farm_trees')
      .select('*')
      .eq('farm_id', farmId)
      .eq('tree_status', status)
      .order('tree_code', { ascending: true });

    if (error) {
      console.error('Error fetching tree codes by status:', error);
      return { data: [], count: 0 };
    }

    return data || [];
  }

  static async updateTreeStatus(treeCode: string, newStatus: 'متاحة' | 'محجوزة' | 'مباعة') {
    const { error } = await supabase
      .from('farm_trees')
      .update({
        tree_status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('tree_code', treeCode);

    if (error) return { data: [], count: 0 };
  }

  static async createBackupForCodes(farmId: string) {
    const farm = await this.getFarmWithTreeCodes(farmId);
    if (!farm) return null;

    const backup = {
      farm_code: farm.farm_code,
      farm_name: farm.name_ar,
      farm_barcode: farm.farm_barcode,
      total_trees: farm.total_trees,
      tree_codes: farm.treeCodes,
      backup_date: new Date().toISOString(),
      backup_reason: 'Automatic backup after farm creation'
    };

    return backup;
  }

  static async saveVarieties(farmId: string, varieties: any[], farmTreeType?: string) {
    const { data: existingVarieties, error: fetchError } = await supabase
      .from('farm_tree_varieties')
      .select('id')
      .eq('farm_id', farmId)
      .is('deleted_at', null);

    if (fetchError) {
      console.error('Error fetching existing varieties:', fetchError);
    }

    if (existingVarieties && existingVarieties.length > 0) {
      const { error: deleteError } = await supabase
        .from('farm_tree_varieties')
        .update({ deleted_at: new Date().toISOString() })
        .eq('farm_id', farmId)
        .is('deleted_at', null);

      if (deleteError) {
        console.error('Error soft-deleting old varieties:', deleteError);
      }
    }

    const varietiesToInsert = varieties.map(v => ({
      farm_id: farmId,
      tree_type: farmTreeType || 'نخيل',
      variety_name: v.name,
      variety_name_en: v.name,
      price_per_tree: v.price,
      available_quantity: v.quantity,
      total_trees: v.quantity,
      max_booking_per_investor: v.quantity,
      description_ar: '',
      description_en: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error: insertError } = await supabase
      .from('farm_tree_varieties')
      .insert(varietiesToInsert);

    if (insertError) {
      console.error('Error inserting varieties:', insertError);
      throw insertError;
    }
  }

  static async getVarieties(farmId: string) {
    const { data, error } = await supabase
      .from('farm_tree_varieties')
      .select('*')
      .eq('farm_id', farmId)
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching varieties:', error);
      return [];
    }

    return data || [];
  }

  static async updateSalesStatus(farmId: string, newStatus: 'open' | 'closed', adminId?: string) {
    const { data, error } = await supabase.rpc('update_farm_sales_status_manual', {
      farm_id_param: farmId,
      new_status: newStatus,
      admin_id: adminId || null
    });

    if (error) {
      console.error('Error updating sales status:', error);
      return { data: [], count: 0 };
    }

    return data;
  }

  static async calculateSalesStatus(farmId: string) {
    const { data, error } = await supabase.rpc('calculate_farm_sales_status', {
      farm_id_param: farmId
    });

    if (error) {
      console.error('Error calculating sales status:', error);
      return { data: [], count: 0 };
    }

    return data;
  }
}
