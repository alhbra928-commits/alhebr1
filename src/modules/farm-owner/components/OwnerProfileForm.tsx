import React, { useState, useEffect } from 'react';
import { Save, User, CreditCard, Building, Phone, Hash, CheckCircle, AlertCircle } from 'lucide-react';
import { farmOwnerService, FarmOwnerProfile } from '../services/farmOwnerService';

interface OwnerProfileFormProps {
  profileId: string;
  initialData: FarmOwnerProfile | null;
  onSuccess: () => void;
}

export const OwnerProfileForm: React.FC<OwnerProfileFormProps> = ({ profileId, initialData, onSuccess }) => {
  // معلومات المالك الشخصية
  const [fullName, setFullName] = useState(initialData?.full_name || '');
  const [nationalId, setNationalId] = useState(initialData?.national_id || '');
  const [mobileNumber, setMobileNumber] = useState(initialData?.mobile_number || '');

  // معلومات البنك
  const [bankName, setBankName] = useState(initialData?.bank_name || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(initialData?.bank_account_number || '');
  const [bankIban, setBankIban] = useState(initialData?.bank_iban || '');
  const [bankAccountHolderName, setBankAccountHolderName] = useState(initialData?.bank_account_holder_name || '');
  const [bankBranch, setBankBranch] = useState(initialData?.bank_branch || '');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.full_name || '');
      setNationalId(initialData.national_id || '');
      setMobileNumber(initialData.mobile_number || '');
      setBankName(initialData.bank_name || '');
      setBankAccountNumber(initialData.bank_account_number || '');
      setBankIban(initialData.bank_iban || '');
      setBankAccountHolderName(initialData.bank_account_holder_name || '');
      setBankBranch(initialData.bank_branch || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من البيانات
    if (!fullName.trim()) {
      setMessage({ type: 'error', text: 'الرجاء إدخال الاسم الكامل' });
      return;
    }

    if (!nationalId.trim() || nationalId.length !== 10) {
      setMessage({ type: 'error', text: 'الرجاء إدخال رقم هوية وطنية صحيح (10 أرقام)' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await farmOwnerService.updateProfile(profileId, {
        full_name: fullName,
        national_id: nationalId,
        bank_name: bankName || null,
        bank_account_number: bankAccountNumber || null,
        bank_iban: bankIban || null,
        bank_account_holder_name: bankAccountHolderName || null,
        bank_branch: bankBranch || null
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'تم تحديث بياناتك بنجاح!' });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'حدث خطأ أثناء التحديث' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ غير متوقع' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* قسم المعلومات الشخصية */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(59, 130, 246, 0.1)' }}
            >
              <User size={24} style={{ color: '#3B82F6' }} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800">المعلومات الشخصية</h3>
              <p className="text-sm text-gray-600">بياناتك الأساسية</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* الاسم الكامل */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-lg"
                placeholder="محمد أحمد السعيد"
                required
              />
            </div>

            {/* رقم الهوية الوطنية */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                رقم الهوية الوطنية <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-lg"
                placeholder="1234567890"
                maxLength={10}
                required
              />
              <p className="text-xs text-gray-500 mt-1">10 أرقام بالضبط</p>
            </div>

            {/* رقم الجوال */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                رقم الجوال
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Phone size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={mobileNumber}
                  disabled
                  className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-lg text-gray-600 cursor-not-allowed"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">لا يمكن تعديل رقم الجوال</p>
            </div>
          </div>
        </div>

        {/* قسم معلومات البنك */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16, 185, 129, 0.1)' }}
            >
              <CreditCard size={24} style={{ color: '#10B981' }} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800">معلومات الحساب البنكي</h3>
              <p className="text-sm text-gray-600">لاستلام المدفوعات</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* اسم البنك */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                اسم البنك
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Building size={20} className="text-gray-400" />
                </div>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-lg appearance-none bg-white"
                >
                  <option value="">اختر البنك</option>
                  <option value="الراجحي">مصرف الراجحي</option>
                  <option value="الأهلي">البنك الأهلي السعودي</option>
                  <option value="الرياض">بنك الرياض</option>
                  <option value="سامبا">بنك سامبا</option>
                  <option value="الإنماء">بنك الإنماء</option>
                  <option value="الجزيرة">بنك الجزيرة</option>
                  <option value="البلاد">بنك البلاد</option>
                  <option value="ساب">البنك السعودي البريطاني (ساب)</option>
                  <option value="الفرنسي">البنك السعودي الفرنسي</option>
                  <option value="الاستثمار">البنك السعودي للاستثمار</option>
                </select>
              </div>
            </div>

            {/* رقم الحساب */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                رقم الحساب البنكي
              </label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-lg"
                placeholder="1234567890"
                dir="ltr"
              />
            </div>

            {/* الآيبان */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                رقم الآيبان (IBAN)
              </label>
              <input
                type="text"
                value={bankIban}
                onChange={(e) => setBankIban(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-lg"
                placeholder="SA0000000000000000000000"
                dir="ltr"
              />
            </div>

            {/* اسم صاحب الحساب */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                اسم صاحب الحساب
              </label>
              <input
                type="text"
                value={bankAccountHolderName}
                onChange={(e) => setBankAccountHolderName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-lg"
                placeholder="محمد أحمد السعيد"
              />
            </div>

            {/* الفرع */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                فرع البنك
              </label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-lg"
                placeholder="بريدة - طريق الملك عبدالله"
              />
            </div>
          </div>
        </div>

        {/* رسالة النجاح/الخطأ */}
        {message && (
          <div
            className={`rounded-2xl p-4 flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-2 border-green-500'
                : 'bg-red-50 border-2 border-red-500'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
            )}
            <p
              className={`font-bold ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* زر الحفظ */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-xl"
          style={{
            background: loading
              ? '#9CA3AF'
              : 'linear-gradient(135deg, #3B82F6, #2563EB)'
          }}
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-3 border-t-transparent border-white rounded-full animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save size={24} />
              حفظ التحديثات
            </>
          )}
        </button>

        {/* ملاحظة */}
        <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>ملاحظة:</strong> معلوماتك الشخصية محمية ولن تُشارك مع أي طرف ثالث. المعلومات البنكية
            مطلوبة فقط لتحويل أرباحك من المبيعات.
          </p>
        </div>
      </form>
    </div>
  );
};
