import React, { useState, useEffect } from 'react';
import { X, Save, Home, Sprout, MapPin, Settings, Upload, Check } from 'lucide-react';
import { ErrorModal } from '../../../components/common/ErrorModal';

interface Variety {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface FarmFormData {
  name_ar: string;
  owner_id: string;
  deed_number: string;
  area_sqm: number;
  area_unit: string;
  farm_type: string;
  description_ar: string;
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
  technical_notes: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  google_map_link: string;
  aerial_map_url: string;
  payment_grace_period: number;
  status: string;
  admin_notes: string;
}

interface FarmFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FarmFormData, varieties: Variety[]) => Promise<void>;
  owners: any[];
  initialData?: any;
  mode: 'create' | 'edit';
}

export function FarmFormModal({ isOpen, onClose, onSubmit, owners, initialData, mode }: FarmFormModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [varieties, setVarieties] = useState<Variety[]>([{
    id: '1',
    name: '',
    quantity: 0,
    price: 0,
    total: 0
  }]);
  const [formData, setFormData] = useState<FarmFormData>({
    name_ar: '',
    owner_id: '',
    deed_number: '',
    area_sqm: 0,
    area_unit: 'متر',
    farm_type: 'نخيل',
    description_ar: '',
    crop_type: '',
    total_trees: 0,
    actual_price: 0,
    marketing_price: 0,
    unit_marketing_price: 0,
    total_marketing_price: 0,
    unit_actual_price: 0,
    total_actual_price: 0,
    has_well: false,
    has_electricity: false,
    has_fence: false,
    has_road: false,
    has_sterilization: false,
    technical_notes: '',
    region: '',
    city: '',
    latitude: undefined,
    longitude: undefined,
    google_map_link: '',
    aerial_map_url: '',
    payment_grace_period: 6,
    status: 'active',
    admin_notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [varietiesErrors, setVarietiesErrors] = useState<{[key: string]: string}>({});

  // Error Modal State
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    technicalDetails: '',
    errorType: 'general' as 'validation' | 'database' | 'network' | 'general',
    missingFields: [] as { section: string; fields: string[] }[]
  });

  const tabs = [
    { id: 0, label: 'البيانات الأساسية', icon: Home },
    { id: 1, label: 'التفاصيل الزراعية', icon: Sprout },
    { id: 2, label: 'الموقع والصورة', icon: MapPin },
    { id: 3, label: 'الإعدادات', icon: Settings }
  ];

  useEffect(() => {
    const totalQuantity = varieties.reduce((sum, v) => sum + (v.quantity || 0), 0);
    const totalPrice = varieties.reduce((sum, v) => sum + (v.total || 0), 0);
    const varietyNames = varieties.filter(v => v.name.trim()).map(v => v.name).join(', ');

    const avgPricePerTree = totalQuantity > 0 ? totalPrice / totalQuantity : 0;

    // Only update if values actually changed (avoid infinite loop)
    if (
      formData.total_trees !== totalQuantity ||
      Math.abs(formData.unit_marketing_price - avgPricePerTree) > 0.01
    ) {
      setFormData(prev => ({
        ...prev,
        crop_type: varietyNames || prev.crop_type,
        total_trees: totalQuantity,
        unit_marketing_price: avgPricePerTree,
        total_marketing_price: totalPrice,
        marketing_price: totalPrice,
        unit_actual_price: avgPricePerTree,
        total_actual_price: totalPrice,
        actual_price: totalPrice
      }));
    }
  }, [varieties, formData.total_trees, formData.unit_marketing_price]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData && mode === 'edit') {
      setFormData({
        name_ar: initialData.name_ar || '',
        owner_id: initialData.owner_id || '',
        deed_number: initialData.deed_number || '',
        area_sqm: initialData.area_sqm || 0,
        area_unit: initialData.area_unit || 'متر',
        farm_type: initialData.farm_type || 'نخيل',
        description_ar: initialData.description_ar || '',
        crop_type: initialData.crop_type || '',
        total_trees: initialData.total_trees || 0,
        actual_price: initialData.actual_price || 0,
        marketing_price: initialData.marketing_price || 0,
        unit_marketing_price: initialData.unit_marketing_price || 0,
        total_marketing_price: initialData.total_marketing_price || 0,
        unit_actual_price: initialData.unit_actual_price || 0,
        total_actual_price: initialData.total_actual_price || 0,
        has_well: initialData.has_well || false,
        has_electricity: initialData.has_electricity || false,
        has_fence: initialData.has_fence || false,
        has_road: initialData.has_road || false,
        has_sterilization: initialData.has_sterilization || false,
        technical_notes: initialData.technical_notes || '',
        region: initialData.region || '',
        city: initialData.city || '',
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        google_map_link: initialData.google_map_link || '',
        aerial_map_url: initialData.aerial_map_url || '',
        payment_grace_period: initialData.payment_grace_period || 6,
        status: initialData.status || 'active',
        admin_notes: initialData.admin_notes || ''
      });
      if (initialData.aerial_map_url) {
        setImagePreview(initialData.aerial_map_url);
      }

      if (initialData.varieties && initialData.varieties.length > 0) {
        const loadedVarieties = initialData.varieties.map((v: any, index: number) => ({
          id: v.id || `${Date.now()}-${index}`,
          name: v.variety_name || '',
          quantity: v.total_trees || 0,
          price: Number(v.price_per_tree) || 0,
          total: (v.total_trees || 0) * (Number(v.price_per_tree) || 0)
        }));
        setVarieties(loadedVarieties);
      }
    } else {
      setVarieties([{
        id: '1',
        name: '',
        quantity: 0,
        price: 0,
        total: 0
      }]);
    }

    setActiveTab(0);
    setErrors({});
  }, [initialData, mode, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميغابايت');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateTab = (tabIndex: number) => {
    const newErrors: any = {};

    switch (tabIndex) {
      case 0: // البيانات الأساسية
        if (!formData.name_ar.trim()) newErrors.name_ar = 'اسم المزرعة مطلوب';
        if (!formData.owner_id) newErrors.owner_id = 'يجب اختيار صاحب المزرعة';
        if (!formData.deed_number.trim()) newErrors.deed_number = 'رقم الصك مطلوب';
        if (!formData.area_sqm || formData.area_sqm <= 0) newErrors.area_sqm = 'المساحة مطلوبة';
        break;

      case 1: // التفاصيل الزراعية
        const validVarieties = varieties.filter(v => v.name.trim() && v.quantity > 0 && v.price > 0);
        if (validVarieties.length === 0) {
          newErrors.varieties = 'يجب إضافة صنف واحد على الأقل بجميع البيانات';
        }
        break;

      case 2: // الموقع والخريطة
        if (!formData.region.trim()) newErrors.region = 'المنطقة مطلوبة';
        if (!formData.city.trim()) newErrors.city = 'المدينة مطلوبة';
        break;

      case 3: // الإعدادات - لا توجد حقول مطلوبة
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAll = () => {
    const allErrors: any = {};

    // البيانات الأساسية
    if (!formData.name_ar.trim()) allErrors.name_ar = 'اسم المزرعة مطلوب';
    if (!formData.owner_id) allErrors.owner_id = 'يجب اختيار صاحب المزرعة';
    if (!formData.deed_number.trim()) allErrors.deed_number = 'رقم الصك مطلوب';
    if (!formData.area_sqm || formData.area_sqm <= 0) allErrors.area_sqm = 'المساحة مطلوبة';

    // التفاصيل الزراعية
    const validVarieties = varieties.filter(v => v.name.trim() && v.quantity > 0 && v.price > 0);
    if (validVarieties.length === 0) {
      allErrors.varieties = 'يجب إضافة صنف واحد على الأقل بجميع البيانات';
    }

    // الموقع
    if (!formData.region.trim()) allErrors.region = 'المنطقة مطلوبة';
    if (!formData.city.trim()) allErrors.city = 'المدينة مطلوبة';

    const hasErrors = Object.keys(allErrors).length > 0;

    if (hasErrors) {
      setErrors(allErrors);
    }

    return !hasErrors;
  };

  const handleNextTab = () => {
    if (validateTab(activeTab)) {
      if (activeTab < 3) {
        setActiveTab(activeTab + 1);
        setErrors({});
      }
    } else {
      // إنشاء رسالة مفصلة عن الحقول الناقصة
      const errorFields: string[] = [];

      if (activeTab === 0) {
        if (errors.name_ar) errorFields.push('اسم المزرعة');
        if (errors.owner_id) errorFields.push('صاحب المزرعة');
        if (errors.deed_number) errorFields.push('رقم الصك');
        if (errors.area_sqm) errorFields.push('المساحة (يجب أن تكون أكبر من صفر)');
      } else if (activeTab === 1) {
        if (errors.varieties) errorFields.push('يجب إضافة صنف واحد على الأقل بجميع البيانات (الاسم، العدد، السعر)');
      } else if (activeTab === 2) {
        if (errors.region) errorFields.push('المنطقة');
        if (errors.city) errorFields.push('المدينة');
      }

      const tabNames = ['البيانات الأساسية', 'التفاصيل الزراعية', 'الموقع والخريطة', 'الإعدادات'];

      setErrorModal({
        isOpen: true,
        title: '⚠️ خطأ في التحقق من البيانات',
        message: `لا يمكن الانتقال إلى القسم التالي.\n\nيوجد حقول مطلوبة في قسم "${tabNames[activeTab]}" لم يتم ملؤها بشكل صحيح.`,
        technicalDetails: `Section: ${tabNames[activeTab]}\nMissing Fields: ${errorFields.join(', ')}`,
        errorType: 'validation',
        missingFields: [{
          section: tabNames[activeTab],
          fields: errorFields
        }]
      });
    }
  };

  const handlePreviousTab = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateAll();

    if (!isValid) {
      // الأخطاء موجودة الآن في state errors بعد استدعاء validateAll
      // نحتاج للانتظار قليلاً حتى يتم تحديث الـ state
      setTimeout(() => {
        const errorsList: { section: string; fields: string[] }[] = [
          { section: 'البيانات الأساسية', fields: [] },
          { section: 'التفاصيل الزراعية', fields: [] },
          { section: 'الموقع والخريطة', fields: [] },
        ];

        // البيانات الأساسية
        if (!formData.name_ar.trim()) errorsList[0].fields.push('اسم المزرعة');
        if (!formData.owner_id) errorsList[0].fields.push('صاحب المزرعة');
        if (!formData.deed_number.trim()) errorsList[0].fields.push('رقم الصك');
        if (!formData.area_sqm || formData.area_sqm <= 0) errorsList[0].fields.push('المساحة (يجب أن تكون أكبر من صفر)');

        // التفاصيل الزراعية
        const validVarieties = varieties.filter(v => v.name.trim() && v.quantity > 0 && v.price > 0);
        if (validVarieties.length === 0) {
          errorsList[1].fields.push('يجب إضافة صنف واحد على الأقل بجميع البيانات (الاسم، العدد، السعر)');
        }

        // الموقع
        if (!formData.region.trim()) errorsList[2].fields.push('المنطقة');
        if (!formData.city.trim()) errorsList[2].fields.push('المدينة');

        setErrorModal({
          isOpen: true,
          title: '❌ فشل حفظ المزرعة',
          message: 'لا يمكن حفظ المزرعة حاليًا.\n\nيوجد حقول مطلوبة في الأقسام التالية لم يتم ملؤها بشكل صحيح.\n\nالرجاء مراجعة الحقول المذكورة أدناه وملئها بالقيم الصحيحة.',
          technicalDetails: `Validation Failed\nMissing fields listed below`,
          errorType: 'validation',
          missingFields: errorsList.filter(s => s.fields.length > 0)
        });
      }, 100);

      return;
    }

    try {
      setLoading(true);

      let finalData = { ...formData };

      if (imageFile) {
        finalData.aerial_map_url = imagePreview;
      }

      const validVarieties = varieties.filter(v => v.name.trim() && v.quantity > 0 && v.price > 0);

      await onSubmit(finalData, validVarieties);

      setVarieties([{
        id: '1',
        name: '',
        quantity: 0,
        price: 0,
        total: 0
      }]);
      setFormData({
        name_ar: '',
        owner_id: '',
        deed_number: '',
        area_sqm: 0,
        area_unit: 'متر',
        farm_type: 'نخيل',
        description_ar: '',
        crop_type: '',
        total_trees: 0,
        actual_price: 0,
        marketing_price: 0,
        unit_marketing_price: 0,
        total_marketing_price: 0,
        unit_actual_price: 0,
        total_actual_price: 0,
        has_well: false,
        has_electricity: false,
        has_fence: false,
        has_road: false,
        has_sterilization: false,
        technical_notes: '',
        region: '',
        city: '',
        latitude: undefined,
        longitude: undefined,
        google_map_link: '',
        aerial_map_url: '',
        payment_grace_period: 6,
        status: 'active',
        admin_notes: ''
      });
      setImageFile(null);
      setImagePreview('');

      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'حدث خطأ أثناء الحفظ' });

      setErrorModal({
        isOpen: true,
        title: '❌ خطأ في قاعدة البيانات',
        message: 'حدث خطأ أثناء محاولة حفظ المزرعة في قاعدة البيانات.\n\nالرجاء مراجعة التفاصيل التقنية أدناه ونسخها للدعم الفني.',
        technicalDetails: `Error Type: Database Error\nTimestamp: ${new Date().toISOString()}\nError Message: ${error.message || 'Unknown error'}\n\nStack Trace:\n${error.stack || 'No stack trace available'}\n\nForm Data:\n${JSON.stringify(formData, null, 2)}`,
        errorType: 'database',
        missingFields: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="bg-gradient-to-r from-[#C89B3C] to-[#D4AF37] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  {mode === 'create' ? 'إضافة مزرعة جديدة' : 'تعديل بيانات المزرعة'}
                </h2>
                <p className="text-white/80 text-sm">
                  {mode === 'create' ? 'إدخال كامل بيانات المزرعة والتفاصيل التسويقية' : 'تحديث المعلومات'}
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

          <div className="flex gap-2 mt-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isCompleted = tab.id < activeTab;
              const isCurrent = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all relative ${
                    isCurrent
                      ? 'bg-white text-[#C89B3C] shadow-lg'
                      : isCompleted
                      ? 'bg-white/40 text-white hover:bg-white/50'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isCompleted && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </span>
                  )}
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-bold">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-280px)]">
          {activeTab === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#3D5B4B] mb-4 flex items-center gap-2">
                <Home className="h-5 w-5" />
                البيانات الأساسية للمزرعة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    اسم المزرعة *
                  </label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className={`w-full px-4 py-3 bg-white border-2 ${
                      errors.name_ar ? 'border-red-400' : 'border-[#C89B3C]/20'
                    } rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors`}
                    placeholder="مزرعة النخيل الذهبية"
                  />
                  {errors.name_ar && <p className="text-red-500 text-xs mt-1">{errors.name_ar}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    صاحب المزرعة *
                  </label>
                  <select
                    value={formData.owner_id}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                    className={`w-full px-4 py-3 bg-white border-2 ${
                      errors.owner_id ? 'border-red-400' : 'border-[#C89B3C]/20'
                    } rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors`}
                  >
                    <option value="">-- اختر المالك --</option>
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.full_name}
                      </option>
                    ))}
                  </select>
                  {errors.owner_id && <p className="text-red-500 text-xs mt-1">{errors.owner_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    رقم صك المزرعة *
                  </label>
                  <input
                    type="text"
                    value={formData.deed_number}
                    onChange={(e) => setFormData({ ...formData, deed_number: e.target.value })}
                    className={`w-full px-4 py-3 bg-white border-2 ${
                      errors.deed_number ? 'border-red-400' : 'border-[#C89B3C]/20'
                    } rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors`}
                    placeholder="123456789"
                  />
                  {errors.deed_number && <p className="text-red-500 text-xs mt-1">{errors.deed_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">المساحة *</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.area_sqm}
                      onChange={(e) => setFormData({ ...formData, area_sqm: parseFloat(e.target.value) })}
                      className={`flex-1 px-4 py-3 bg-white border-2 ${
                        errors.area_sqm ? 'border-red-400' : 'border-[#C89B3C]/20'
                      } rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors`}
                      placeholder="5000"
                    />
                    <select
                      value={formData.area_unit}
                      onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                      className="px-4 py-3 bg-white border-2 border-[#C89B3C]/20 rounded-xl focus:outline-none focus:border-[#C89B3C]"
                    >
                      <option value="متر">متر</option>
                      <option value="هكتار">هكتار</option>
                    </select>
                  </div>
                  {errors.area_sqm && <p className="text-red-500 text-xs mt-1">{errors.area_sqm}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">نوع المزرعة *</label>
                  <select
                    value={formData.farm_type}
                    onChange={(e) => setFormData({ ...formData, farm_type: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-[#C89B3C]/20 rounded-xl focus:outline-none focus:border-[#C89B3C]"
                  >
                    <option value="نخيل">🌴 نخيل</option>
                    <option value="زيتون">🌳 زيتون</option>
                    <option value="مختلط">🌾 مختلط</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    الوصف العام
                  </label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-[#C89B3C]/20 rounded-xl focus:outline-none focus:border-[#C89B3C] transition-colors"
                    placeholder="وصف شامل عن المزرعة..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                <Sprout className="h-6 w-6" />
                إدارة الأصناف والتسعير التفصيلي
              </h3>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6">
                {varieties.filter(v => v.name.trim() && v.quantity > 0 && v.price > 0).length === 0 && (
                  <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4">
                    <p className="text-red-800 font-bold flex items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      يجب إضافة صنف واحد على الأقل بجميع البيانات (الاسم، العدد، السعر)
                    </p>
                    <p className="text-red-700 text-sm mt-2">
                      املأ الحقول الثلاثة أدناه (اسم الصنف + العدد + السعر) لإضافة صنف صحيح
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                      <span className="text-2xl">🌴</span>
                      قائمة الأصناف (حتى 20 صنف)
                    </h4>
                    <p className="text-sm text-emerald-700 mt-1">
                      اختر الصنف من القائمة + أدخل العدد + أدخل السعر = الحساب تلقائي ✓
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (varieties.length < 20) {
                        setVarieties([...varieties, {
                          id: Date.now().toString(),
                          name: '',
                          quantity: 0,
                          price: 0,
                          total: 0
                        }]);
                      }
                    }}
                    disabled={varieties.length >= 20}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm flex items-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    إضافة صنف جديد
                  </button>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {varieties.map((variety, index) => (
                    <div
                      key={variety.id}
                      className="bg-white rounded-xl p-5 border-2 border-emerald-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-bold text-emerald-900 flex items-center gap-2">
                          <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-black">
                            {index + 1}
                          </span>
                          صنف رقم {index + 1}
                        </h5>
                        {varieties.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setVarieties(varieties.filter(v => v.id !== variety.id));
                            }}
                            className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors flex items-center justify-center"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            اسم الصنف
                            <span className="text-red-500 text-lg">*</span>
                            {variety.name.trim() && <span className="text-green-500 ml-2">✓</span>}
                          </label>
                          <input
                            type="text"
                            value={variety.name}
                            onChange={(e) => {
                              const newVarieties = [...varieties];
                              newVarieties[index] = {
                                ...newVarieties[index],
                                name: e.target.value
                              };
                              setVarieties(newVarieties);
                            }}
                            placeholder="اكتب اسم الصنف مثل: نخل سكري، زيتون بيكوال، إلخ..."
                            className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none transition-colors font-medium ${
                              !variety.name.trim()
                                ? 'border-red-300 focus:border-red-500'
                                : 'border-emerald-200 focus:border-emerald-400'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            العدد
                            <span className="text-red-500 text-lg">*</span>
                            {variety.quantity > 0 && <span className="text-green-500 ml-2">✓</span>}
                          </label>
                          <input
                            type="number"
                            value={variety.quantity === 0 ? '' : variety.quantity}
                            onChange={(e) => {
                              const newVarieties = [...varieties];
                              const qty = e.target.value === '' ? 0 : parseInt(e.target.value);
                              newVarieties[index] = {
                                ...newVarieties[index],
                                quantity: qty,
                                total: qty * newVarieties[index].price
                              };
                              setVarieties(newVarieties);
                            }}
                            className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none transition-colors text-center font-bold ${
                              variety.quantity <= 0
                                ? 'border-red-300 focus:border-red-500'
                                : 'border-emerald-200 focus:border-emerald-400'
                            }`}
                            placeholder="5000"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            السعر (ريال)
                            <span className="text-red-500 text-lg">*</span>
                            {variety.price > 0 && <span className="text-green-500 ml-2">✓</span>}
                          </label>
                          <input
                            type="number"
                            value={variety.price === 0 ? '' : variety.price}
                            onChange={(e) => {
                              const newVarieties = [...varieties];
                              const price = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              newVarieties[index] = {
                                ...newVarieties[index],
                                price: price,
                                total: newVarieties[index].quantity * price
                              };
                              setVarieties(newVarieties);
                            }}
                            className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none transition-colors text-center font-bold ${
                              variety.price <= 0
                                ? 'border-red-300 focus:border-red-500'
                                : 'border-emerald-200 focus:border-emerald-400'
                            }`}
                            placeholder="2"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div className="md:col-span-4">
                          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-amber-700 font-medium mb-1">المجموع التلقائي لهذا الصنف</p>
                                <p className="text-sm text-amber-600">
                                  {variety.quantity.toLocaleString('ar-SA')} × {variety.price.toLocaleString('ar-SA')} =
                                </p>
                              </div>
                              <div className="text-left">
                                <p className="text-2xl font-black text-amber-900">
                                  {variety.total.toLocaleString('ar-SA')}
                                </p>
                                <p className="text-xs text-amber-700 font-bold">ريال</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6">
                  <h4 className="text-lg font-black text-blue-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    الإجمالي الكلي لجميع الأصناف
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                      <p className="text-sm text-gray-600 mb-2">إجمالي العدد</p>
                      <p className="text-3xl font-black text-blue-900">
                        {varieties.reduce((sum, v) => sum + (v.quantity || 0), 0).toLocaleString('ar-SA')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">شجرة / نخلة</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-4 border-2 border-emerald-600 text-white">
                      <p className="text-sm opacity-90 mb-2">المجموع الكلي النهائي</p>
                      <p className="text-4xl font-black">
                        {varieties.reduce((sum, v) => sum + (v.total || 0), 0).toLocaleString('ar-SA')}
                      </p>
                      <p className="text-xs opacity-90 mt-1 font-bold">ريال سعودي</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-3">
                    المميزات الإضافية
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { key: 'has_well', label: 'بئر', icon: '💧' },
                      { key: 'has_electricity', label: 'كهرباء', icon: '⚡' },
                      { key: 'has_fence', label: 'سور', icon: '🚧' },
                      { key: 'has_road', label: 'طريق', icon: '🛣️' },
                      { key: 'has_sterilization', label: 'عقم زراعي', icon: '🌿' }
                    ].map((feature) => (
                      <label
                        key={feature.key}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData[feature.key as keyof FarmFormData]
                            ? 'bg-green-50 border-green-400'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData[feature.key as keyof FarmFormData] as boolean}
                          onChange={(e) => setFormData({ ...formData, [feature.key]: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-lg">{feature.icon}</span>
                        <span className="text-sm font-medium">{feature.label}</span>
                        {formData[feature.key as keyof FarmFormData] && (
                          <Check className="h-4 w-4 text-green-600 mr-auto" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    ملاحظات فنية
                  </label>
                  <textarea
                    value={formData.technical_notes}
                    onChange={(e) => setFormData({ ...formData, technical_notes: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-400 transition-colors"
                    placeholder="تفاصيل إضافية عن الإنتاج أو الحالة..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                الموقع والصورة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">المنطقة *</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className={`w-full px-4 py-3 bg-white border-2 ${
                      errors.region ? 'border-red-400' : 'border-blue-200'
                    } rounded-xl focus:outline-none focus:border-blue-400 transition-colors`}
                    placeholder="الرياض"
                  />
                  {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">المدينة *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-4 py-3 bg-white border-2 ${
                      errors.city ? 'border-red-400' : 'border-blue-200'
                    } rounded-xl focus:outline-none focus:border-blue-400 transition-colors`}
                    placeholder="الدرعية"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">خط العرض</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="24.7136"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">خط الطول</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="46.6753"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    رابط خريطة جوجل
                  </label>
                  <input
                    type="url"
                    value={formData.google_map_link}
                    onChange={(e) => setFormData({ ...formData, google_map_link: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="https://maps.google.com/..."
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    مدة السماح لتحصيل المبلغ الكامل
                  </label>
                  <select
                    value={formData.payment_grace_period}
                    onChange={(e) => setFormData({ ...formData, payment_grace_period: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400"
                  >
                    <option value={3}>3 أشهر</option>
                    <option value={6}>6 أشهر</option>
                    <option value={9}>9 أشهر</option>
                    <option value={12}>12 شهر</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    📸 رفع صورة المزرعة
                  </label>
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleImageChange}
                      className="hidden"
                      id="farm-image-upload"
                    />
                    <label
                      htmlFor="farm-image-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="صورة المزرعة"
                            className="max-h-64 rounded-lg"
                          />
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            تم الرفع
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-blue-400" />
                          <div>
                            <p className="text-blue-600 font-bold">اضغط هنا لرفع الصورة</p>
                            <p className="text-xs text-gray-500 mt-1">JPG أو PNG - الحد الأقصى 5 ميغابايت</p>
                            <p className="text-xs text-gray-500">يمكنك رفع صورة عامة للمزرعة أو صورة جوية</p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                الإعدادات المالية والإدارية
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    حالة المزرعة
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                  >
                    <option value="active">✅ نشطة</option>
                    <option value="frozen">🧊 مجمدة</option>
                    <option value="under_review">🕐 تحت المراجعة</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    ملاحظات الإدارة (للاستخدام الداخلي فقط)
                  </label>
                  <textarea
                    value={formData.admin_notes}
                    onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="ملاحظات خاصة بالإدارة..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <h4 className="font-bold text-amber-900 mb-2">📋 ملخص البيانات</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">اسم المزرعة:</p>
                    <p className="font-bold">{formData.name_ar || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">المساحة:</p>
                    <p className="font-bold">{formData.area_sqm} {formData.area_unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">عدد الأشجار:</p>
                    <p className="font-bold">{formData.total_trees || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">السعر التسويقي:</p>
                    <p className="font-bold text-green-600">{formData.marketing_price.toLocaleString()} ريال</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* شريط التقدم */}
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#C89B3C] to-[#D4AF37] h-full transition-all duration-500"
              style={{ width: `${((activeTab + 1) / 4) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600">
            الخطوة {activeTab + 1} من 4
          </p>

          <div className="flex gap-3 pt-4">
            {activeTab > 0 && (
              <button
                type="button"
                onClick={handlePreviousTab}
                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-bold flex items-center gap-2"
              >
                ← السابق
              </button>
            )}

            {activeTab < 3 ? (
              <button
                type="button"
                onClick={handleNextTab}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#C89B3C] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-bold"
              >
                التالي →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                <Save className="h-5 w-5" />
                {loading ? 'جاري الحفظ...' : mode === 'create' ? '💾 حفظ المزرعة' : '✏️ حفظ التعديلات'}
              </button>
            )}

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

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        technicalDetails={errorModal.technicalDetails}
        errorType={errorModal.errorType}
        missingFields={errorModal.missingFields}
      />
    </div>
  );
}
