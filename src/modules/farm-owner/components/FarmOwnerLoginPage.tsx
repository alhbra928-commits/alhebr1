import React, { useState, useEffect } from 'react';
import { farmOwnerService } from '../services/farmOwnerService';
import { RefreshCw, ArrowRight } from 'lucide-react';

interface FarmOwnerLoginPageProps {
  onLoginSuccess: (profileId: string, status: string) => void;
}

export const FarmOwnerLoginPage: React.FC<FarmOwnerLoginPageProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'mobile' | 'name' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [displayedOTP, setDisplayedOTP] = useState('');
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanMobile = mobileNumber.trim();
    if (!/^(05|5)\d{8}$/.test(cleanMobile)) {
      setError('رقم الجوال غير صحيح. يجب أن يبدأ بـ 05 ويتكون من 10 أرقام');
      setLoading(false);
      return;
    }

    const { exists } = await farmOwnerService.checkAccount(cleanMobile);

    if (!exists) {
      // حساب جديد - اطلب الاسم
      setIsNewAccount(true);
      setStep('name');
    } else {
      // حساب موجود - أرسل OTP
      const result = await farmOwnerService.sendOTP(cleanMobile);
      if (result.success) {
        setDisplayedOTP(result.otp || '');
        setIsNewAccount(false);
        setStep('otp');
        setCountdown(300);
      } else {
        setError(result.error || 'حدث خطأ في إرسال رمز التحقق');
      }
    }

    setLoading(false);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!fullName.trim() || fullName.trim().length < 3) {
      setError('الرجاء إدخال الاسم الكامل (3 أحرف على الأقل)');
      setLoading(false);
      return;
    }

    // إنشاء حساب جديد مع الاسم
    const result = await farmOwnerService.directLoginWithName(mobileNumber, fullName.trim());
    if (result.success) {
      onLoginSuccess(result.profile_id!, result.status!);
    } else {
      setError(result.error || 'حدث خطأ في التسجيل');
    }

    setLoading(false);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (otp.length !== 6) {
      setError('رمز التحقق يجب أن يكون 6 أرقام');
      setLoading(false);
      return;
    }

    const result = await farmOwnerService.verifyOTPAndLogin(mobileNumber, otp);

    if (result.success) {
      onLoginSuccess(result.profile_id!, result.status!);
    } else {
      setError(result.error || 'رمز التحقق غير صحيح');
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    const result = await farmOwnerService.sendOTP(mobileNumber);
    if (result.success) {
      setDisplayedOTP(result.otp || '');
      setCountdown(300);
      setOtp('');
      setError('');
    } else {
      setError(result.error || 'حدث خطأ في إعادة إرسال الرمز');
    }

    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6" style={{
      background: 'linear-gradient(135deg, #1C2E0F 0%, #0F1A08 50%, #1C2E0F 100%)'
    }}>
      {/* زر العودة */}
      <button
        onClick={() => window.location.href = '/'}
        className="fixed top-3 sm:top-6 right-3 sm:right-6 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 group z-50 text-xs sm:text-sm"
        style={{
          background: 'rgba(139, 195, 74, 0.1)',
          border: '2px solid rgba(139, 195, 74, 0.3)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <ArrowRight size={16} className="sm:w-5 sm:h-5" style={{ color: '#8BC34A' }} />
        <span className="font-bold" style={{ color: '#8BC34A' }}>
          العودة للمنصة
        </span>
      </button>

      <div className="w-full max-w-md px-2 sm:px-0">
        <div className="text-center mb-6 sm:mb-8">
          <div
            className="inline-block text-4xl sm:text-6xl mb-3 sm:mb-4"
            style={{
              filter: 'drop-shadow(0 0 20px #8BC34A)',
              animation: 'float 3s ease-in-out infinite'
            }}
          >
            🌳
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black mb-1.5 sm:mb-2"
            style={{
              background: 'linear-gradient(135deg, #A4D65E 0%, #8BC34A 50%, #689F38 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            لوحة صاحب المزرعة
          </h1>
          <p className="text-xs sm:text-sm px-4" style={{ color: '#8BC34A', opacity: 0.8 }}>
            منصة الحبر الزراعية - استثمارك يبدأ من الأرض
          </p>
        </div>

        <div
          className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, #2D4519 0%, #1C2E0F 100%)',
            boxShadow: '0 25px 80px rgba(139, 195, 74, 0.4), inset 0 0 40px rgba(139, 195, 74, 0.1)',
            border: '2px solid rgba(139, 195, 74, 0.3)'
          }}
        >
          <div
            className="absolute inset-0 opacity-20 rounded-3xl"
            style={{
              background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 195, 74, 0.1) 2px, rgba(139, 195, 74, 0.1) 4px),
                           repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 195, 74, 0.1) 2px, rgba(139, 195, 74, 0.1) 4px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <div className="relative z-10">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 text-center leading-relaxed">
              {step === 'mobile' ? '🎩 دخول صاحب المزرعة' : step === 'name' ? '👤 الاسم الكامل' : '🔐 التحقق من الرمز'}
            </h2>

            {step === 'mobile' ? (
              <form onSubmit={handleMobileSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#8BC34A' }}>
                    📱 رقم الجوال
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="05xxxxxxxx"
                    disabled={loading}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-white text-base sm:text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2"
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

                {error && (
                  <div
                    className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-center"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '2px solid rgba(239, 68, 68, 0.3)',
                      color: '#FCA5A5'
                    }}
                  >
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !mobileNumber.trim()}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg text-white transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                      <span className="inline-block w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري التحقق...
                    </span>
                  ) : (
                    '✓ متابعة'
                  )}
                </button>

                <div className="mt-4 text-center text-xs" style={{ color: '#8BC34A', opacity: 0.7 }}>
                  • دخول مباشر للمرة الأولى<br />
                  • رمز تحقق للمرات التالية
                </div>
              </form>
            ) : step === 'name' ? (
              <form onSubmit={handleNameSubmit} className="space-y-4 sm:space-y-6">
                <div
                  className="p-3 sm:p-4 rounded-lg sm:rounded-xl text-center"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '2px solid rgba(59, 130, 246, 0.5)'
                  }}
                >
                  <p className="text-sm font-bold" style={{ color: '#93C5FD' }}>
                    مرحباً بك في منصة الحبر
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#93C5FD', opacity: 0.8 }}>
                    الرجاء إدخال اسمك الكامل لإنشاء حسابك
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#8BC34A' }}>
                    👤 الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: أحمد محمد العلي"
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
                  <p className="text-xs mt-2" style={{ color: '#8BC34A', opacity: 0.7 }}>
                    سيتم استخدام اسمك في الشهادات والمراسلات الرسمية
                  </p>
                </div>

                {error && (
                  <div
                    className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-center"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '2px solid rgba(239, 68, 68, 0.3)',
                      color: '#FCA5A5'
                    }}
                  >
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !fullName.trim()}
                  className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: loading || !fullName.trim()
                      ? 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                      : 'linear-gradient(135deg, #A4D65E 0%, #8BC34A 50%, #689F38 100%)',
                    boxShadow: loading || !fullName.trim()
                      ? 'none'
                      : '0 15px 40px rgba(139, 195, 74, 0.5), inset 0 0 20px rgba(139, 195, 74, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                      <span className="inline-block w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري إنشاء الحساب...
                    </span>
                  ) : (
                    '✓ إنشاء حسابي'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('mobile');
                    setFullName('');
                    setError('');
                  }}
                  className="w-full py-3 rounded-xl font-bold transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    color: 'white'
                  }}
                >
                  رجوع
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-4 sm:space-y-6">
                <div
                  className="p-3 sm:p-4 rounded-lg sm:rounded-xl text-center animate-pulse"
                  style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    border: '2px solid rgba(251, 191, 36, 0.5)'
                  }}
                >
                  <p className="text-xs font-bold mb-2" style={{ color: '#FCD34D' }}>
                    🧪 وضع الاختبار - الرمز الفعلي:
                  </p>
                  <p className="text-3xl font-black tracking-widest" style={{ color: '#FBBF24' }}>
                    {displayedOTP}
                  </p>
                  <p className="text-xs mt-2" style={{ color: '#FCD34D', opacity: 0.8 }}>
                    في الإنتاج: سيتم إرساله عبر واتساب
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#8BC34A' }}>
                    🔢 رمز التحقق (6 أرقام)
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    disabled={loading}
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl text-white text-2xl font-black text-center tracking-widest transition-all duration-300 focus:outline-none focus:ring-2"
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

                {countdown > 0 && (
                  <div className="text-center text-sm" style={{ color: '#8BC34A' }}>
                    ⏱️ صلاحية الرمز: {formatTime(countdown)}
                  </div>
                )}

                {error && (
                  <div
                    className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-center"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '2px solid rgba(239, 68, 68, 0.3)',
                      color: '#FCA5A5'
                    }}
                  >
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: loading || otp.length !== 6
                      ? 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                      : 'linear-gradient(135deg, #A4D65E 0%, #8BC34A 50%, #689F38 100%)',
                    boxShadow: loading || otp.length !== 6
                      ? 'none'
                      : '0 15px 40px rgba(139, 195, 74, 0.5), inset 0 0 20px rgba(139, 195, 74, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                      <span className="inline-block w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري التحقق...
                    </span>
                  ) : (
                    '✓ تحقق ودخول'
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('mobile');
                      setOtp('');
                      setError('');
                    }}
                    className="flex-1 py-3 rounded-xl font-bold transition-all hover:scale-105"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      color: 'white'
                    }}
                  >
                    رجوع
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading || countdown > 240}
                    className="flex-1 py-3 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: countdown > 240 ? 'rgba(107, 114, 128, 0.3)' : 'rgba(251, 191, 36, 0.2)',
                      border: `2px solid ${countdown > 240 ? 'rgba(107, 114, 128, 0.5)' : 'rgba(251, 191, 36, 0.5)'}`,
                      color: countdown > 240 ? '#9CA3AF' : '#FBBF24'
                    }}
                  >
                    <RefreshCw size={18} />
                    إعادة إرسال
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm" style={{ color: '#8BC34A', opacity: 0.6 }}>
          بوابة خاصة بأصحاب المزارع المعتمدين
        </div>
      </div>
    </div>
  );
};
