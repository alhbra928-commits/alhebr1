import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, CreditCard } from 'lucide-react';
import { Investor, InvestorFormData } from '../investorsService';

interface InvestorFormModalProps {
  isOpen: boolean;
  investor: Investor | null;
  onClose: () => void;
  onSubmit: (data: InvestorFormData) => Promise<void>;
}

export function InvestorFormModal({
  isOpen,
  investor,
  onClose,
  onSubmit
}: InvestorFormModalProps) {
  const [formData, setFormData] = useState<InvestorFormData>({
    full_name: '',
    phone: '',
    email: '',
    national_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (investor) {
      setFormData({
        full_name: investor.full_name,
        phone: investor.phone,
        email: investor.email,
        national_id: investor.national_id,
        mobile_number: investor.mobile_number || investor.phone
      });
    } else {
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        national_id: ''
      });
    }
    setErrors({});
  }, [investor, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'الاسم الكامل مطلوب';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الجوال مطلوب';
    } else if (!/^05\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الجوال غير صحيح (يجب أن يبدأ بـ 05 ويتكون من 10 أرقام)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.national_id.trim()) {
      newErrors.national_id = 'رقم الهوية مطلوب';
    } else if (!/^\d{10}$/.test(formData.national_id)) {
      newErrors.national_id = 'رقم الهوية يجب أن يتكون من 10 أرقام';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        mobile_number: formData.phone
      });
      onClose();
    } catch (error: any) {
      alert(`حدث خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-[#C89B3C] to-[#D4B574] p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">
                  {investor ? 'تعديل بيانات المستثمر' : 'إضافة مستثمر جديد'}
                </h2>
                <p className="text-white/90 text-sm">
                  {investor ? 'تحديث معلومات المستثمر في النظام' : 'إضافة مستثمر جديد إلى المنصة'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-[#C89B3C]" />
                الاسم الكامل *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={`w-full px-4 py-3 border-2 ${
                  errors.full_name ? 'border-red-500' : 'border-gray-200'
                } rounded-lg focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/20 outline-none font-bold`}
                placeholder="أدخل الاسم الكامل للمستثمر"
              />
              {errors.full_name && (
                <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#C89B3C]" />
                رقم الجوال *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-3 border-2 ${
                  errors.phone ? 'border-red-500' : 'border-gray-200'
                } rounded-lg focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/20 outline-none font-mono font-bold`}
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                رقم الجوال سيُستخدم لتسجيل الدخول
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#C89B3C]" />
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 border-2 ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                } rounded-lg focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/20 outline-none font-mono`}
                placeholder="example@domain.com"
                dir="ltr"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#C89B3C]" />
                رقم الهوية الوطنية *
              </label>
              <input
                type="text"
                value={formData.national_id}
                onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                className={`w-full px-4 py-3 border-2 ${
                  errors.national_id ? 'border-red-500' : 'border-gray-200'
                } rounded-lg focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/20 outline-none font-mono font-bold`}
                placeholder="1234567890"
                maxLength={10}
                dir="ltr"
              />
              {errors.national_id && (
                <p className="text-red-500 text-xs mt-1">{errors.national_id}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-[#2C2C2C] rounded-lg font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#C89B3C] to-[#D4B574] hover:from-[#B8894E] hover:to-[#C89B3C] text-white rounded-lg font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الحفظ...' : investor ? 'حفظ التعديلات' : 'إضافة المستثمر'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
