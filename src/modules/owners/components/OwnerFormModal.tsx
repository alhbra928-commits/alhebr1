import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, MapPin, FileText, DollarSign, Home, Plus, Trash2, TreePine } from 'lucide-react';
import type { OwnerFormData } from '../ownersService';
import { OwnersService } from '../ownersService';

interface OwnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OwnerFormData) => Promise<void>;
  initialData?: any;
  mode: 'create' | 'edit';
}

interface Variety {
  type: 'نخيل' | 'زيتون';
  name: string;
  count: number;
}

export function OwnerFormModal({ isOpen, onClose, onSubmit, initialData, mode }: OwnerFormModalProps) {
  const [formData, setFormData] = useState<OwnerFormData>({
    full_name: '',
    mobile_number: '',
    email: '',
    region: '',
    city: '',
    admin_notes: '',
    farm_area: 0,
    farm_area_unit: 'متر',
    farm_type: 'نخيل',
    actual_price: 0,
    deed_number: '',
    farm_location_region: '',
    farm_location_city: '',
    farm_location_description: '',
    payment_grace_period: 6,
    bank_name: '',
    bank_account_number: '',
    bank_iban: '',
    bank_account_holder_name: '',
    bank_branch: ''
  });

  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        full_name: initialData.full_name || '',
        mobile_number: initialData.mobile_number || '',
        email: initialData.email || '',
        region: initialData.region || '',
        city: initialData.city || '',
        admin_notes: initialData.admin_notes || '',
        farm_area: initialData.farm_area || 0,
        farm_area_unit: initialData.farm_area_unit || 'متر',
        farm_type: initialData.farm_type || 'نخيل',
        actual_price: initialData.actual_price || 0,
        deed_number: initialData.deed_number || '',
        farm_location_region: initialData.farm_location_region || '',
        farm_location_city: initialData.farm_location_city || '',
        farm_location_description: initialData.farm_location_description || '',
        payment_grace_period: initialData.payment_grace_period || 6,
        bank_name: initialData.bank_name || '',
        bank_account_number: initialData.bank_account_number || '',
        bank_iban: initialData.bank_iban || '',
        bank_account_holder_name: initialData.bank_account_holder_name || '',
        bank_branch: initialData.bank_branch || ''
      });
    } else {
      setFormData({
        full_name: '',
        mobile_number: '',
        email: '',
        region: '',
        city: '',
        admin_notes: '',
        farm_area: 0,
        farm_area_unit: 'متر',
        farm_type: 'نخيل',
        actual_price: 0,
        deed_number: '',
        farm_location_region: '',
        farm_location_city: '',
        farm_location_description: '',
        payment_grace_period: 6,
        bank_name: '',
        bank_account_number: '',
        bank_iban: '',
        bank_account_holder_name: '',
        bank_branch: ''
      });
    }
    setErrors({});
    setVarieties([]);
  }, [initialData, mode, isOpen]);

  // Load varieties when editing
  useEffect(() => {
    const loadVarieties = async () => {
      if (mode === 'edit' && initialData?.id && isOpen) {
        try {
          const loadedVarieties = await OwnersService.getOwnerVarieties(initialData.id);
          setVarieties(loadedVarieties);
        } catch (error) {
          console.error('Error loading varieties:', error);
        }
      }
    };
    loadVarieties();
  }, [mode, initialData?.id, isOpen]);

  // Varieties Management
  const addVariety = () => {
    const defaultType = formData.farm_type === 'مختلط' ? 'نخيل' : (formData.farm_type as 'نخيل' | 'زيتون');
    setVarieties([...varieties, { type: defaultType, name: '', count: 0 }]);
  };

  const removeVariety = (index: number) => {
    setVarieties(varieties.filter((_, i) => i !== index));
  };

  const updateVariety = (index: number, field: keyof Variety, value: any) => {
    const updated = [...varieties];
    updated[index] = { ...updated[index], [field]: value };
    setVarieties(updated);
  };

  const getTotalTrees = () => {
    return varieties.reduce((sum, v) => sum + (v.count || 0), 0);
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.full_name.trim()) newErrors.full_name = 'الاسم الكامل مطلوب';
    if (!formData.mobile_number.trim()) newErrors.mobile_number = 'رقم الجوال مطلوب';
    if (!formData.region.trim()) newErrors.region = 'المنطقة مطلوبة';
    if (!formData.city.trim()) newErrors.city = 'المدينة مطلوبة';
    if (!formData.farm_area || formData.farm_area <= 0) newErrors.farm_area = 'مساحة المزرعة مطلوبة';
    if (!formData.actual_price || formData.actual_price <= 0) newErrors.actual_price = 'السعر الفعلي مطلوب';
    if (!formData.deed_number.trim()) newErrors.deed_number = 'رقم الصك مطلوب';
    if (!formData.farm_location_region.trim()) newErrors.farm_location_region = 'منطقة المزرعة مطلوبة';
    if (!formData.farm_location_city.trim()) newErrors.farm_location_city = 'مدينة المزرعة مطلوبة';

    // Validate varieties
    if (varieties.length === 0) {
      newErrors.varieties = 'يجب إضافة صنف واحد على الأقل';
    } else {
      const invalidVariety = varieties.find(v => !v.name.trim() || v.count <= 0);
      if (invalidVariety) {
        newErrors.varieties = 'جميع الأصناف يجب أن تحتوي على اسم وعدد صحيح';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      // Add varieties to formData
      const dataWithVarieties = { ...formData, varieties };
      await onSubmit(dataWithVarieties);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'حدث خطأ أثناء الحفظ' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        <div className="bg-gradient-to-r from-[#C89B3C] to-[#D4AF37] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {mode === 'create' ? 'إضافة صاحب مزرعة جديد' : 'تعديل بيانات المالك'}
              </h2>
              <p className="text-white/80 text-sm">
                {mode === 'create' ? 'إدخال كامل بيانات المالك ومعلومات المزرعة الأساسية' : 'تحديث المعلومات'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            type="button"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="bg-gradient-to-r from-[#3D5B4B]/10 to-[#4A6F5C]/10 p-4 rounded-xl border-2 border-[#3D5B4B]/20">
            <h3 className="text-lg font-bold text-[#3D5B4B] mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              معلومات المالك الشخصية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] mb-2">
                  <User className="h-4 w-4 text-[#C89B3C]" />
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className={`w-full px-4 py-3 bg-white border-2 ${
                    errors.full_name ? 'border-red-400' : 'border-[#C89B3C]/20'
                  } rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors`}
                  placeholder="أدخل الاسم الكامل"
                />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] mb-2">
                  <Phone className="h-4 w-4 text-[#C89B3C]" />
                  رقم الجوال *
                </label>
                <input
                  type="tel"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  className={`w-full px-4 py-3 bg-white border-2 ${
                    errors.mobile_number ? 'border-red-400' : 'border-[#C89B3C]/20'
                  } rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors`}
                  placeholder="+966501234567"
                  dir="ltr"
                />
                {errors.mobile_number && <p className="text-red-500 text-xs mt-1">{errors.mobile_number}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] mb-2">
                  <Mail className="h-4 w-4 text-[#C89B3C]" />
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-[#C89B3C]/20 rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors"
                  placeholder="owner@example.com"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] mb-2">
                  <MapPin className="h-4 w-4 text-[#C89B3C]" />
                  المنطقة *
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className={`w-full px-4 py-3 bg-white border-2 ${
                    errors.region ? 'border-red-400' : 'border-[#C89B3C]/20'
                  } rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors`}
                  placeholder="الرياض"
                />
                {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] mb-2">
                  <MapPin className="h-4 w-4 text-[#C89B3C]" />
                  المدينة *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full px-4 py-3 bg-white border-2 ${
                    errors.city ? 'border-red-400' : 'border-[#C89B3C]/20'
                  } rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors`}
                  placeholder="الرياض"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] mb-2">
                  <FileText className="h-4 w-4 text-[#C89B3C]" />
                  ملاحظات إدارية
                </label>
                <textarea
                  value={formData.admin_notes}
                  onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-[#C89B3C]/20 rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors"
                  placeholder="ملاحظات خاصة بالإدارة..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* معلومات البنك */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              معلومات البنك
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">اسم البنك</label>
                <select
                  value={formData.bank_name || ''}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                >
                  <option value="">اختر البنك</option>
                  <option value="البنك الأهلي">البنك الأهلي</option>
                  <option value="الراجحي">الراجحي</option>
                  <option value="الرياض">الرياض</option>
                  <option value="سامبا">سامبا</option>
                  <option value="البلاد">البلاد</option>
                  <option value="الإنماء">الإنماء</option>
                  <option value="الجزيرة">الجزيرة</option>
                  <option value="ساب">ساب</option>
                  <option value="العربي الوطني">العربي الوطني</option>
                  <option value="الفرنسي">الفرنسي</option>
                  <option value="بنك الخليج">بنك الخليج</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">اسم صاحب الحساب</label>
                <input
                  type="text"
                  value={formData.bank_account_holder_name || ''}
                  onChange={(e) => setFormData({ ...formData, bank_account_holder_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="الاسم كما في البنك"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">رقم الحساب البنكي</label>
                <input
                  type="text"
                  value={formData.bank_account_number || ''}
                  onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="رقم الحساب"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">رقم الآيبان (IBAN)</label>
                <input
                  type="text"
                  value={formData.bank_iban || ''}
                  onChange={(e) => setFormData({ ...formData, bank_iban: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="SA0000000000000000000000"
                  dir="ltr"
                  maxLength={34}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">فرع البنك</label>
                <input
                  type="text"
                  value={formData.bank_branch || ''}
                  onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="اسم الفرع أو المدينة"
                />
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>ملاحظة:</strong> معلومات البنك اختيارية ويمكن تعبئتها لاحقاً.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200">
            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <Home className="h-5 w-5" />
              معلومات المزرعة الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">المساحة *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.farm_area}
                    onChange={(e) => setFormData({ ...formData, farm_area: parseFloat(e.target.value) })}
                    className={`flex-1 px-4 py-3 bg-white border-2 ${
                      errors.farm_area ? 'border-red-400' : 'border-amber-200'
                    } rounded-xl focus:outline-none focus:border-amber-400 transition-colors`}
                    placeholder="5000"
                  />
                  <select
                    value={formData.farm_area_unit}
                    onChange={(e) => setFormData({ ...formData, farm_area_unit: e.target.value })}
                    className="px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                  >
                    <option value="متر">متر</option>
                    <option value="هكتار">هكتار</option>
                  </select>
                </div>
                {errors.farm_area && <p className="text-red-500 text-xs mt-1">{errors.farm_area}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">نوع المزرعة *</label>
                <select
                  value={formData.farm_type}
                  onChange={(e) => setFormData({ ...formData, farm_type: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                >
                  <option value="نخيل">🌴 نخيل</option>
                  <option value="زيتون">🌳 زيتون</option>
                  <option value="مختلط">🌾 مختلط</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] mb-2">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                  السعر الفعلي (ريال) *
                </label>
                <input
                  type="number"
                  value={formData.actual_price}
                  onChange={(e) => setFormData({ ...formData, actual_price: parseFloat(e.target.value) })}
                  className={`w-full px-4 py-3 bg-white border-2 ${
                    errors.actual_price ? 'border-red-400' : 'border-amber-200'
                  } rounded-xl focus:outline-none focus:border-amber-400 transition-colors`}
                  placeholder="500000"
                />
                {errors.actual_price && <p className="text-red-500 text-xs mt-1">{errors.actual_price}</p>}
              </div>

              {/* Varieties Section */}
              <div className="md:col-span-2">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TreePine className="h-5 w-5 text-green-600" />
                      <h4 className="text-lg font-bold text-green-900">الأصناف المزروعة *</h4>
                    </div>
                    <button
                      type="button"
                      onClick={addVariety}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-bold"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة صنف
                    </button>
                  </div>

                  {varieties.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-green-300">
                      <TreePine className="h-12 w-12 text-green-400 mx-auto mb-2" />
                      <p className="text-green-700 font-medium">لم يتم إضافة أصناف بعد</p>
                      <p className="text-green-600/70 text-sm mt-1">اضغط "إضافة صنف" للبدء</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {varieties.map((variety, index) => (
                        <div
                          key={index}
                          className="bg-white p-4 rounded-xl border-2 border-green-200 shadow-sm"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Type */}
                            {formData.farm_type === 'مختلط' && (
                              <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">
                                  النوع
                                </label>
                                <select
                                  value={variety.type}
                                  onChange={(e) => updateVariety(index, 'type', e.target.value as 'نخيل' | 'زيتون')}
                                  className="w-full px-3 py-2 bg-gray-50 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-400 text-sm"
                                >
                                  <option value="نخيل">🌴 نخيل</option>
                                  <option value="زيتون">🌳 زيتون</option>
                                </select>
                              </div>
                            )}

                            {/* Name */}
                            <div className={formData.farm_type === 'مختلط' ? '' : 'md:col-span-2'}>
                              <label className="text-xs font-medium text-gray-600 mb-1 block">
                                اسم الصنف *
                              </label>
                              <input
                                type="text"
                                value={variety.name}
                                onChange={(e) => updateVariety(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-400 text-sm"
                                placeholder={variety.type === 'نخيل' ? 'مثال: خلاص، سكري، برحي' : 'مثال: أربيكوينا، بيكوال'}
                              />
                            </div>

                            {/* Count */}
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1 block">
                                العدد *
                              </label>
                              <input
                                type="number"
                                value={variety.count}
                                onChange={(e) => updateVariety(index, 'count', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-gray-50 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-400 text-sm"
                                placeholder="100"
                                min="1"
                              />
                            </div>

                            {/* Remove Button */}
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => removeVariety(index)}
                                className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                              >
                                <Trash2 className="h-4 w-4" />
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Total Trees Summary */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900">
                            إجمالي عدد الأشجار:
                          </span>
                          <span className="text-2xl font-black text-blue-600">
                            {getTotalTrees().toLocaleString('ar-SA')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.varieties && (
                    <p className="text-red-600 text-sm mt-2 bg-red-50 p-2 rounded-lg">
                      ⚠️ {errors.varieties}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] mb-2">
                  <FileText className="h-4 w-4 text-amber-600" />
                  رقم صك المزرعة *
                </label>
                <input
                  type="text"
                  value={formData.deed_number}
                  onChange={(e) => setFormData({ ...formData, deed_number: e.target.value })}
                  className={`w-full px-4 py-3 bg-white border-2 ${
                    errors.deed_number ? 'border-red-400' : 'border-amber-200'
                  } rounded-xl focus:outline-none focus:border-amber-400 transition-colors`}
                  placeholder="123456789"
                />
                {errors.deed_number && <p className="text-red-500 text-xs mt-1">{errors.deed_number}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">منطقة المزرعة *</label>
                <input
                  type="text"
                  value={formData.farm_location_region}
                  onChange={(e) => setFormData({ ...formData, farm_location_region: e.target.value })}
                  className={`w-full px-4 py-3 bg-white border-2 ${
                    errors.farm_location_region ? 'border-red-400' : 'border-amber-200'
                  } rounded-xl focus:outline-none focus:border-amber-400 transition-colors`}
                  placeholder="الرياض"
                />
                {errors.farm_location_region && <p className="text-red-500 text-xs mt-1">{errors.farm_location_region}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">مدينة المزرعة *</label>
                <input
                  type="text"
                  value={formData.farm_location_city}
                  onChange={(e) => setFormData({ ...formData, farm_location_city: e.target.value })}
                  className={`w-full px-4 py-3 bg-white border-2 ${
                    errors.farm_location_city ? 'border-red-400' : 'border-amber-200'
                  } rounded-xl focus:outline-none focus:border-amber-400 transition-colors`}
                  placeholder="الدرعية"
                />
                {errors.farm_location_city && <p className="text-red-500 text-xs mt-1">{errors.farm_location_city}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">وصف الموقع</label>
                <input
                  type="text"
                  value={formData.farm_location_description}
                  onChange={(e) => setFormData({ ...formData, farm_location_description: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="شمال المدينة - بجوار..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">مدة السماح لسداد المبلغ *</label>
                <select
                  value={formData.payment_grace_period}
                  onChange={(e) => setFormData({ ...formData, payment_grace_period: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                >
                  <option value={3}>3 أشهر</option>
                  <option value={6}>6 أشهر</option>
                  <option value={9}>9 أشهر</option>
                  <option value={12}>12 شهر</option>
                </select>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#C89B3C] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              <Save className="h-5 w-5" />
              {loading ? 'جاري الحفظ...' : mode === 'create' ? 'إضافة المالك' : 'حفظ التعديلات'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
