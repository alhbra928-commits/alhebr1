import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, MapPin, Ruler, DollarSign, CreditCard, Calendar, Upload, TreePine, Droplets, CreditCard as Edit3, Map } from 'lucide-react';

interface FarmOwnerFormData {
  owner_full_name: string;
  owner_phone: string;
  farm_location: string;
  farm_area: number;
  farm_area_unit: 'هكتار' | 'متر مربع';
  farm_type: 'نخيل' | 'زيتون' | 'أخرى';
  farm_type_other?: string;
  farm_price: number;
  bank_iban: string;
  payment_duration_days: number;
  farm_image_url?: string;
  manual_entry: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'frozen';
}

interface FarmOwnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FarmOwnerFormData) => Promise<void>;
  initialData?: Partial<FarmOwnerFormData>;
  mode: 'create' | 'edit';
}

export function FarmOwnerFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode
}: FarmOwnerFormModalProps) {
  const [formData, setFormData] = useState<FarmOwnerFormData>({
    owner_full_name: '',
    owner_phone: '+966',
    farm_location: '',
    farm_area: 0,
    farm_area_unit: 'هكتار',
    farm_type: 'نخيل',
    farm_type_other: '',
    farm_price: 0,
    bank_iban: 'SA',
    payment_duration_days: 180,
    farm_image_url: '',
    manual_entry: true,
    approval_status: 'approved',
    status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        ...formData,
        ...initialData
      });
      if (initialData.farm_image_url) {
        setImagePreview(initialData.farm_image_url);
      }
    }
  }, [initialData, mode]);

  const handleChange = (field: keyof FarmOwnerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (value: string) => {
    let phone = value;
    if (!phone.startsWith('+966')) {
      phone = '+966' + phone.replace(/^\+?966?/, '');
    }
    phone = phone.replace(/[^0-9+]/g, '');
    handleChange('owner_phone', phone);
  };

  const handleIBANChange = (value: string) => {
    let iban = value.toUpperCase();
    if (!iban.startsWith('SA')) {
      iban = 'SA' + iban.replace(/^SA/, '');
    }
    iban = iban.replace(/[^A-Z0-9]/g, '');
    handleChange('bank_iban', iban);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev: any) => ({ ...prev, image: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        handleChange('farm_image_url', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.owner_full_name.trim()) {
      newErrors.owner_full_name = 'الاسم الكامل مطلوب';
    }

    if (!formData.owner_phone || formData.owner_phone === '+966') {
      newErrors.owner_phone = 'رقم الجوال مطلوب';
    } else if (formData.owner_phone.length < 13) {
      newErrors.owner_phone = 'رقم الجوال غير صحيح';
    }

    if (!formData.farm_location.trim()) {
      newErrors.farm_location = 'موقع المزرعة مطلوب';
    }

    if (!formData.farm_area || formData.farm_area <= 0) {
      newErrors.farm_area = 'مساحة المزرعة مطلوبة';
    }

    if (formData.farm_type === 'أخرى' && !formData.farm_type_other?.trim()) {
      newErrors.farm_type_other = 'يرجى تحديد نوع المزرعة';
    }

    if (!formData.farm_price || formData.farm_price <= 0) {
      newErrors.farm_price = 'السعر المطلوب مطلوب';
    }

    if (formData.bank_iban && formData.bank_iban !== 'SA' && formData.bank_iban.length !== 24) {
      newErrors.bank_iban = 'رقم الآيبان غير صحيح (يجب أن يكون 24 حرف)';
    }

    if (!formData.payment_duration_days || formData.payment_duration_days <= 0) {
      newErrors.payment_duration_days = 'مدة السداد مطلوبة';
    }

    if (!formData.farm_image_url && mode === 'create') {
      newErrors.image = 'صورة المزرعة مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'حدث خطأ أثناء الحفظ' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-3xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black">
                {mode === 'create' ? '➕ إضافة مالك مزرعة جديد' : '✏️ تعديل بيانات المالك'}
              </h2>
              <p className="text-sm text-white/80">الرجاء تعبئة جميع الحقول المطلوبة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* الاسم الكامل */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <User className="h-4 w-4 text-emerald-600" />
              الاسم الكامل لمالك المزرعة *
            </label>
            <input
              type="text"
              value={formData.owner_full_name}
              onChange={(e) => handleChange('owner_full_name', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              placeholder="مثال: أحمد محمد العلي"
            />
            {errors.owner_full_name && (
              <p className="text-sm text-red-600 mt-1">{errors.owner_full_name}</p>
            )}
          </div>

          {/* رقم الجوال */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Phone className="h-4 w-4 text-emerald-600" />
              رقم الجوال *
            </label>
            <input
              type="tel"
              value={formData.owner_phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              placeholder="+966501234567"
              dir="ltr"
            />
            {errors.owner_phone && (
              <p className="text-sm text-red-600 mt-1">{errors.owner_phone}</p>
            )}
          </div>

          {/* موقع المزرعة */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              موقع المزرعة *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.farm_location}
                onChange={(e) => handleChange('farm_location', e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                placeholder="مثال: الرياض - حي النرجس"
              />
              <button
                type="button"
                className="px-4 py-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-all flex items-center gap-2"
              >
                <Map className="h-4 w-4" />
                خريطة
              </button>
            </div>
            {errors.farm_location && (
              <p className="text-sm text-red-600 mt-1">{errors.farm_location}</p>
            )}
          </div>

          {/* مساحة المزرعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Ruler className="h-4 w-4 text-emerald-600" />
                مساحة المزرعة *
              </label>
              <input
                type="number"
                value={formData.farm_area || ''}
                onChange={(e) => handleChange('farm_area', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                placeholder="1000"
                min="0"
                step="0.01"
              />
              {errors.farm_area && (
                <p className="text-sm text-red-600 mt-1">{errors.farm_area}</p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                الوحدة
              </label>
              <select
                value={formData.farm_area_unit}
                onChange={(e) => handleChange('farm_area_unit', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              >
                <option value="هكتار">هكتار</option>
                <option value="متر مربع">متر مربع</option>
              </select>
            </div>
          </div>

          {/* نوع المزرعة */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <TreePine className="h-4 w-4 text-emerald-600" />
              نوع المزرعة *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleChange('farm_type', 'نخيل')}
                className={`flex-1 px-6 py-4 rounded-xl border-2 font-bold transition-all ${
                  formData.farm_type === 'نخيل'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
                }`}
              >
                🟤 نخيل
              </button>
              <button
                type="button"
                onClick={() => handleChange('farm_type', 'زيتون')}
                className={`flex-1 px-6 py-4 rounded-xl border-2 font-bold transition-all ${
                  formData.farm_type === 'زيتون'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                }`}
              >
                🟢 زيتون
              </button>
              <button
                type="button"
                onClick={() => handleChange('farm_type', 'أخرى')}
                className={`flex-1 px-6 py-4 rounded-xl border-2 font-bold transition-all ${
                  formData.farm_type === 'أخرى'
                    ? 'border-gray-500 bg-gray-50 text-gray-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                ⚪️ أخرى
              </button>
            </div>
            {formData.farm_type === 'أخرى' && (
              <input
                type="text"
                value={formData.farm_type_other || ''}
                onChange={(e) => handleChange('farm_type_other', e.target.value)}
                className="w-full mt-3 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                placeholder="حدد نوع المزرعة..."
              />
            )}
            {errors.farm_type_other && (
              <p className="text-sm text-red-600 mt-1">{errors.farm_type_other}</p>
            )}
          </div>

          {/* السعر المطلوب */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              السعر المطلوب للمزرعة (ريال) *
            </label>
            <input
              type="number"
              value={formData.farm_price || ''}
              onChange={(e) => handleChange('farm_price', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              placeholder="500000"
              min="0"
              step="1000"
            />
            {errors.farm_price && (
              <p className="text-sm text-red-600 mt-1">{errors.farm_price}</p>
            )}
          </div>

          {/* رقم الآيبان */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              رقم الحساب البنكي (IBAN)
            </label>
            <input
              type="text"
              value={formData.bank_iban}
              onChange={(e) => handleIBANChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              placeholder="SA0380000000608010167519"
              maxLength={24}
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-1">
              يجب أن يبدأ بـ SA ويتكون من 24 حرف ورقم
            </p>
            {errors.bank_iban && (
              <p className="text-sm text-red-600 mt-1">{errors.bank_iban}</p>
            )}
          </div>

          {/* مدة السداد */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Calendar className="h-4 w-4 text-emerald-600" />
              مدة إكمال السداد (بالأيام) *
            </label>
            <select
              value={formData.payment_duration_days}
              onChange={(e) => handleChange('payment_duration_days', parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
            >
              <option value={30}>30 يوم (شهر واحد)</option>
              <option value={60}>60 يوم (شهران)</option>
              <option value={90}>90 يوم (3 أشهر)</option>
              <option value={180}>180 يوم (6 أشهر)</option>
              <option value={365}>365 يوم (سنة)</option>
            </select>
            {errors.payment_duration_days && (
              <p className="text-sm text-red-600 mt-1">{errors.payment_duration_days}</p>
            )}
          </div>

          {/* رفع صورة المزرعة */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Upload className="h-4 w-4 text-emerald-600" />
              صورة المزرعة * {mode === 'create' && '(إلزامي)'}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-all">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="معاينة"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      handleChange('farm_image_url', '');
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    إزالة الصورة
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <label className="cursor-pointer">
                    <span className="text-emerald-600 font-bold hover:text-emerald-700">
                      اضغط لاختيار صورة
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG (حد أقصى 5 ميجابايت)
                  </p>
                </div>
              )}
            </div>
            {errors.image && (
              <p className="text-sm text-red-600 mt-1">{errors.image}</p>
            )}
          </div>

          {/* تسجيل يدوي */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.manual_entry}
                onChange={(e) => handleChange('manual_entry', e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <p className="font-bold text-amber-900">تسجيل يدوي</p>
                <p className="text-sm text-amber-700">
                  تم تعبئة هذا النموذج نيابة عن المالك
                </p>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
              {errors.submit}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {mode === 'create' ? 'حفظ وإضافة' : 'حفظ التعديلات'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
