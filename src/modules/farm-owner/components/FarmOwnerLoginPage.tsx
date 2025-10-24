import React, { useState } from 'react';
import { farmOwnerService } from '../services/farmOwnerService';

interface FarmOwnerLoginPageProps {
  onLoginSuccess: (profileId: string, status: string) => void;
}

export const FarmOwnerLoginPage: React.FC<FarmOwnerLoginPageProps> = ({ onLoginSuccess }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanMobile = mobileNumber.trim();
    if (!/^(05|5)\d{8}$/.test(cleanMobile)) {
      setError('رقم الجوال غير صحيح. يجب أن يبدأ بـ 05 ويتكون من 10 أرقام');
      setLoading(false);
      return;
    }

    const result = await farmOwnerService.loginOrCreate(cleanMobile);

    if (result.success) {
      onLoginSuccess(result.profile_id!, result.status!);
    } else {
      setError(result.error || 'حدث خطأ في تسجيل الدخول');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, #1C2E0F 0%, #0F1A08 50%, #1C2E0F 100%)'
    }}>
      <div className="w-full max-w-md">
        {/* الشعار */}
        <div className="text-center mb-8">
          <div
            className="inline-block text-6xl mb-4"
            style={{
              filter: 'drop-shadow(0 0 20px #8BC34A)',
              animation: 'float 3s ease-in-out infinite'
            }}
          >
            🌳
          </div>
          <h1
            className="text-3xl font-black mb-2"
            style={{
              background: 'linear-gradient(135deg, #A4D65E 0%, #8BC34A 50%, #689F38 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            لوحة صاحب المزرعة
          </h1>
          <p className="text-sm" style={{ color: '#8BC34A', opacity: 0.8 }}>
            منصة الحبر الزراعية - استثمارك يبدأ من الأرض
          </p>
        </div>

        {/* البطاقة الرئيسية */}
        <div
          className="relative rounded-3xl p-8 transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, #2D4519 0%, #1C2E0F 100%)',
            boxShadow: '0 25px 80px rgba(139, 195, 74, 0.4), inset 0 0 40px rgba(139, 195, 74, 0.1)',
            border: '2px solid rgba(139, 195, 74, 0.3)'
          }}
        >
          {/* شبكة الخلفية */}
          <div
            className="absolute inset-0 opacity-20 rounded-3xl"
            style={{
              background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 195, 74, 0.1) 2px, rgba(139, 195, 74, 0.1) 4px),
                           repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 195, 74, 0.1) 2px, rgba(139, 195, 74, 0.1) 4px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              🎩 دخول صاحب المزرعة
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* حقل رقم الجوال */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#8BC34A' }}>
                  📱 رقم الجوال
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="05xxxxxxxx"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl text-white text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '2px solid rgba(139, 195, 74, 0.3)',
                    caretColor: '#8BC34A'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8BC34A';
                    e.target.style.boxShadow = '0 0 20px rgba(139, 195, 74, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(139, 195, 74, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* رسالة الخطأ */}
              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-center"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5'
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* زر الدخول */}
              <button
                type="submit"
                disabled={loading || !mobileNumber.trim()}
                className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading || !mobileNumber.trim()
                    ? 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                    : 'linear-gradient(135deg, #A4D65E 0%, #8BC34A 50%, #689F38 100%)',
                  boxShadow: loading || !mobileNumber.trim()
                    ? 'none'
                    : '0 15px 40px rgba(139, 195, 74, 0.5), inset 0 0 20px rgba(139, 195, 74, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري التحقق...
                  </span>
                ) : (
                  '✓ دخول'
                )}
              </button>
            </form>

            {/* ملاحظة */}
            <div className="mt-6 text-center text-xs" style={{ color: '#8BC34A', opacity: 0.7 }}>
              سيتم إنشاء حساب تلقائياً إذا كان رقمك غير مسجل
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-6 text-center text-sm" style={{ color: '#8BC34A', opacity: 0.6 }}>
          لوحة خاصة بأصحاب المزارع المعتمدين
        </div>
      </div>
    </div>
  );
};
