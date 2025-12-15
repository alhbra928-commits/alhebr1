import React, { useState } from 'react';
import { Save, X, Upload, Check, AlertCircle } from 'lucide-react';
import { OwnersService } from '../../owners/ownersService';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

interface UnifiedFarmSubmissionFormProps {
  profileId: string;
  currentPhone: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const UnifiedFarmSubmissionForm: React.FC<UnifiedFarmSubmissionFormProps> = ({
  profileId,
  currentPhone,
  onSuccess,
  onClose
}) => {
  // البيانات - مطابقة 100% لنموذج إدارة أصحاب المزارع
  const [formData, setFormData] = useState({
    owner_full_name: '',
    owner_phone: currentPhone,
    farm_location: '',
    farm_area: '',
    farm_area_unit: 'متر',
    farm_type: 'نخيل',
    farm_type_other: '',
    farm_price: '',
    bank_iban: '',
    payment_duration_days: '180',
    farm_image_url: '',
    manual_entry: true
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Error Modal
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    technicalDetails: ''
  });

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
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData(prev => ({ ...prev, farm_image_url: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.owner_full_name.trim()) {
      newErrors.owner_full_name = 'الاسم الكامل مطلوب';
    }

    if (!formData.owner_phone.trim()) {
      newErrors.owner_phone = 'رقم الجوال مطلوب';
    }

    if (!formData.farm_location.trim()) {
      newErrors.farm_location = 'موقع المزرعة مطلوب';
    }

    if (!formData.farm_area || parseFloat(formData.farm_area) <= 0) {
      newErrors.farm_area = 'المساحة مطلوبة ويجب أن تكون أكبر من صفر';
    }

    if (!formData.farm_price || parseFloat(formData.farm_price) <= 0) {
      newErrors.farm_price = 'السعر مطلوب ويجب أن يكون أكبر من صفر';
    }

    if (!formData.bank_iban.trim()) {
      newErrors.bank_iban = 'رقم الحساب البنكي (IBAN) مطلوب';
    }

    if (!formData.payment_duration_days || parseInt(formData.payment_duration_days) <= 0) {
      newErrors.payment_duration_days = 'مدة السداد مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorModal({
        isOpen: true,
        title: '⚠️ خطأ في التحقق من البيانات',
        message: 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح.',
        technicalDetails: `Missing fields: ${Object.keys(errors).join(', ')}`
      });
      return;
    }

    setLoading(true);

    try {
      // إنشاء البيانات بنفس البنية المستخدمة في إدارة أصحاب المزارع
      const ownerData = {
        owner_full_name: formData.owner_full_name,
        owner_phone: formData.owner_phone,
        farm_location: formData.farm_location,
        farm_area: parseFloat(formData.farm_area),
        farm_area_unit: formData.farm_area_unit,
        farm_type: formData.farm_type,
        farm_type_other: formData.farm_type === 'أخرى' ? formData.farm_type_other : undefined,
        farm_price: parseFloat(formData.farm_price),
        bank_iban: formData.bank_iban,
        payment_duration_days: parseInt(formData.payment_duration_days),
        farm_image_url: formData.farm_image_url || undefined,
        manual_entry: true,
        approval_status: 'pending' as const,
        status: 'active' as const
      };

      console.log('📤 Submitting farm owner data:', ownerData);

      // استخدام نفس الخدمة المستخدمة في إدارة أصحاب المزارع
      const result = await OwnersService.createOwner(ownerData);

      console.log('✅ Farm owner created successfully:', result);

      // إظهار رسالة نجاح
      alert('✅ تم إرسال طلب المزرعة بنجاح!\n\nسيتم مراجعة طلبك من قبل الإدارة وستصلك رسالة واتساب بالنتيجة.');

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error submitting farm:', error);

      // رسالة خطأ واضحة
      let errorMessage = 'حدث خطأ أثناء إرسال طلب المزرعة.\n\nالرجاء المحاولة مرة أخرى أو التواصل مع الدعم الفني.';

      // إذا كان الخطأ متعلق برقم الهاتف المكرر
      if (error.message && error.message.includes('mobile_number')) {
        errorMessage = '⚠️ رقم الهاتف المدخل مسجل مسبقاً في النظام.\n\nإذا كنت قد سجلت من قبل، سيتم تحديث بياناتك تلقائياً.';
      }

      setErrorModal({
        isOpen: true,
        title: '❌ خطأ في إرسال الطلب',
        message: errorMessage,
        technicalDetails: `Error: ${error.message || 'Unknown error'}\n\nTimestamp: ${new Date().toISOString()}\n\nPhone: ${formData.owner_phone}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden">
        {/* الهيدر */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                ➕ إضافة مزرعة جديدة
              </h2>
              <p className="text-white/90 text-sm mt-1">
                املأ البيانات التالية لإرسال طلب إضافة مزرعتك
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              type="button"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* الاسم الكامل */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              الاسم الكامل *
            </label>
            <input
              type="text"
              value={formData.owner_full_name}
              onChange={(e) => setFormData({ ...formData, owner_full_name: e.target.value })}
              className={`w-full px-4 py-3 bg-white border-2 ${
                errors.owner_full_name ? 'border-red-400' : 'border-emerald-200'
              } rounded-xl focus:outline-none focus:border-emerald-500 transition-colors`}
              placeholder="أدخل اسمك الكامل"
            />
            {errors.owner_full_name && (
              <p className="text-red-500 text-xs mt-1">{errors.owner_full_name}</p>
            )}
          </div>

          {/* رقم الجوال */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              رقم الجوال *
            </label>
            <input
              type="tel"
              value={formData.owner_phone}
              onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
              className={`w-full px-4 py-3 bg-white border-2 ${
                errors.owner_phone ? 'border-red-400' : 'border-emerald-200'
              } rounded-xl focus:outline-none focus:border-emerald-500 transition-colors`}
              placeholder="05xxxxxxxx"
              dir="ltr"
            />
            {errors.owner_phone && (
              <p className="text-red-500 text-xs mt-1">{errors.owner_phone}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* موقع المزرعة */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                موقع المزرعة (المدينة) *
              </label>
              <input
                type="text"
                value={formData.farm_location}
                onChange={(e) => setFormData({ ...formData, farm_location: e.target.value })}
                className={`w-full px-4 py-3 bg-white border-2 ${
                  errors.farm_location ? 'border-red-400' : 'border-emerald-200'
                } rounded-xl focus:outline-none focus:border-emerald-500 transition-colors`}
                placeholder="الرياض، جدة، إلخ..."
              />
              {errors.farm_location && (
                <p className="text-red-500 text-xs mt-1">{errors.farm_location}</p>
              )}
            </div>

            {/* المساحة */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                المساحة *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.farm_area}
                  onChange={(e) => setFormData({ ...formData, farm_area: e.target.value })}
                  className={`flex-1 px-4 py-3 bg-white border-2 ${
                    errors.farm_area ? 'border-red-400' : 'border-emerald-200'
                  } rounded-xl focus:outline-none focus:border-emerald-500 transition-colors`}
                  placeholder="5000"
                  min="0"
                  step="0.01"
                />
                <select
                  value={formData.farm_area_unit}
                  onChange={(e) => setFormData({ ...formData, farm_area_unit: e.target.value })}
                  className="px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="متر">متر²</option>
                  <option value="دونم">دونم</option>
                  <option value="هكتار">هكتار</option>
                </select>
              </div>
              {errors.farm_area && (
                <p className="text-red-500 text-xs mt-1">{errors.farm_area}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* نوع المزرعة */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                نوع المزرعة *
              </label>
              <select
                value={formData.farm_type}
                onChange={(e) => setFormData({ ...formData, farm_type: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value="نخيل">🌴 نخيل</option>
                <option value="زيتون">🌳 زيتون</option>
                <option value="نخيل وزيتون">🌾 نخيل وزيتون</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* السعر المطلوب */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                السعر المطلوب (ريال) *
              </label>
              <input
                type="number"
                value={formData.farm_price}
                onChange={(e) => setFormData({ ...formData, farm_price: e.target.value })}
                className={`w-full px-4 py-3 bg-white border-2 ${
                  errors.farm_price ? 'border-red-400' : 'border-emerald-200'
                } rounded-xl focus:outline-none focus:border-emerald-500 transition-colors`}
                placeholder="500000"
                min="0"
                step="0.01"
              />
              {errors.farm_price && (
                <p className="text-red-500 text-xs mt-1">{errors.farm_price}</p>
              )}
            </div>

            {/* مدة السداد */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                مدة السداد (بالأيام) *
              </label>
              <input
                type="number"
                value={formData.payment_duration_days}
                onChange={(e) => setFormData({ ...formData, payment_duration_days: e.target.value })}
                className={`w-full px-4 py-3 bg-white border-2 ${
                  errors.payment_duration_days ? 'border-red-400' : 'border-emerald-200'
                } rounded-xl focus:outline-none focus:border-emerald-500 transition-colors`}
                placeholder="180"
                min="1"
              />
              {errors.payment_duration_days && (
                <p className="text-red-500 text-xs mt-1">{errors.payment_duration_days}</p>
              )}
            </div>
          </div>

          {/* رقم الحساب البنكي */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              رقم الحساب البنكي (IBAN) *
            </label>
            <input
              type="text"
              value={formData.bank_iban}
              onChange={(e) => setFormData({ ...formData, bank_iban: e.target.value })}
              className={`w-full px-4 py-3 bg-white border-2 ${
                errors.bank_iban ? 'border-red-400' : 'border-emerald-200'
              } rounded-xl focus:outline-none focus:border-emerald-500 transition-colors`}
              placeholder="SA00 0000 0000 0000 0000 0000"
              dir="ltr"
            />
            {errors.bank_iban && (
              <p className="text-red-500 text-xs mt-1">{errors.bank_iban}</p>
            )}
          </div>

          {/* رفع صورة المزرعة */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              صورة المزرعة (اختياري)
            </label>
            <div className="border-2 border-dashed border-emerald-300 rounded-xl p-6 text-center">
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
                      className="max-h-48 rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      تم الرفع
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-emerald-400" />
                    <div>
                      <p className="text-emerald-600 font-bold">اضغط لرفع صورة المزرعة</p>
                      <p className="text-xs text-gray-500 mt-1">JPG أو PNG - بحد أقصى 5 ميغابايت</p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* ملاحظة مهمة */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">ملاحظة مهمة:</p>
                <p className="text-xs text-amber-800 mt-1">
                  سيتم مراجعة طلبك من قبل إدارة المنصة، وستصلك رسالة واتساب بنتيجة المراجعة (الاعتماد أو الرفض مع السبب).
                </p>
              </div>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              <Save className="h-5 w-5" />
              {loading ? 'جاري الإرسال...' : '📤 إرسال الطلب'}
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

      {/* Error Modal */}
      <SmartErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        technicalDetails={errorModal.technicalDetails}
      />
    </div>
  );
};
