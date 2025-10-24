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
      setIsNewAccount(true);
      setStep('name');
    } else {
      const result = await farmOwnerService.sendOTP(cleanMobile);
      if (result.success) {
        setDisplayedOTP(result.otp || '');
        setIsNewAccount(false);
        setStep('otp');
        setCountdown(180);
      } else {
        setError(result.error || 'حدث خطأ في إرسال الرمز');
      }
    }

    setLoading(false);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!fullName.trim()) {
      setError('الرجاء إدخال الاسم الكامل');
      setLoading(false);
      return;
    }

    const result = await farmOwnerService.createProfile(mobileNumber, fullName);
    if (result.success) {
      onLoginSuccess(result.profileId!, 'pending');
    } else {
      setError(result.error || 'حدث خطأ في إنشاء الحساب');
    }

    setLoading(false);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await farmOwnerService.verifyOTP(mobileNumber, otp);
    if (result.success) {
      onLoginSuccess(result.profileId!, result.status!);
    } else {
      setError(result.error || 'الرمز غير صحيح');
    }

    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4"
      style={{
        background: 'linear-gradient(135deg, #1C2E0F 0%, #0F1A08 50%, #1C2E0F 100%)'
      }}
    >
      {/* زر العودة - محسّن للجوال */}
      <button
        onClick={() => window.location.href = '/'}
        className="fixed top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 z-50 shadow-lg"
        style={{
          background: 'rgba(139, 195, 74, 0.15)',
          border: '1.5px solid rgba(139, 195, 74, 0.4)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#8BC34A' }} />
        <span className="text-xs sm:text-sm font-bold" style={{ color: '#8BC34A' }}>
          عودة
        </span>
      </button>

      <div className="w-full max-w-md">
        {/* الشعار - محسّن للجوال */}
        <div className="text-center mb-6 sm:mb-8">
          <div
            className="inline-block text-5xl sm:text-6xl mb-3 sm:mb-4"
            style={{
              filter: 'drop-shadow(0 0 20px #8BC34A)',
              animation: 'float 3s ease-in-out infinite'
            }}
          >
            🌳
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black mb-1.5 sm:mb-2 px-4"
            style={{
              background: 'linear-gradient(135deg, #A4D65E 0%, #8BC34A 50%, #689F38 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            لوحة صاحب المزرعة
          </h1>
          <p className="text-xs sm:text-sm px-6" style={{ color: '#8BC34A', opacity: 0.8 }}>
            منصة الحبر الزراعية - استثمارك يبدأ من الأرض
          </p>
        </div>

        {/* صندوق النموذج - محسّن للجوال */}
        <div
          className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 transition-all duration-500 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #2D4519 0%, #1C2E0F 100%)',
            boxShadow: '0 20px 60px rgba(139, 195, 74, 0.3), inset 0 0 40px rgba(139, 195, 74, 0.1)',
            border: '2px solid rgba(139, 195, 74, 0.3)'
          }}
        >
          {/* خلفية منقطة */}
          <div
            className="absolute inset-0 opacity-10 rounded-2xl sm:rounded-3xl pointer-events-none"
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

            {/* نموذج رقم الجوال */}
            {step === 'mobile' && (
              <form onSubmit={handleMobileSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2 text-right" style={{ color: '#8BC34A' }}>
                    📱 رقم الجوال
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="05xxxxxxxx"
                    disabled={loading}
                    dir="ltr"
                    className="w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-white text-base sm:text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '2px solid rgba(139, 195, 74, 0.3)',
                      caretColor: '#8BC34A'
                    }}
                  />
                </div>

                {error && (
                  <div
                    className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-center"
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
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg text-white transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{
                    background: loading || !mobileNumber.trim()
                      ? 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                      : 'linear-gradient(135deg, #A4D65E 0%, #8BC34A 50%, #689F38 100%)',
                    boxShadow: loading || !mobileNumber.trim()
                      ? 'none'
                      : '0 10px 30px rgba(139, 195, 74, 0.4), inset 0 0 20px rgba(139, 195, 74, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري التحقق...
                    </span>
                  ) : (
                    '✓ متابعة'
                  )}
                </button>

                <div className="mt-3 sm:mt-4 text-center text-[10px] sm:text-xs leading-relaxed" style={{ color: '#8BC34A', opacity: 0.7 }}>
                  • دخول مباشر للمرة الأولى<br />
                  • رمز تحقق للمرات التالية
                </div>
              </form>
            )}

            {/* نموذج الاسم */}
            {step === 'name' && (
              <form onSubmit={handleNameSubmit} className="space-y-4 sm:space-y-5">
                <div
                  className="p-3 sm:p-4 rounded-xl text-center mb-4"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '2px solid rgba(59, 130, 246, 0.5)'
                  }}
                >
                  <p className="text-xs sm:text-sm text-blue-200 font-semibold leading-relaxed">
                    مرحباً بك! حساب جديد<br />
                    الرجاء إدخال اسمك الكامل
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2 text-right" style={{ color: '#8BC34A' }}>
                    👤 الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    disabled={loading}
                    className="w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-white text-base sm:text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '2px solid rgba(139, 195, 74, 0.3)',
                      caretColor: '#8BC34A'
                    }}
                  />
                </div>

                {error && (
                  <div
                    className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-center"
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
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg text-white transition-all duration-500 active:scale-95 disabled:opacity-50 shadow-lg"
                  style={{
                    background: loading || !fullName.trim()
                      ? 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                      : 'linear-gradient(135deg, #A4D65E 0%, #8BC34A 50%, #689F38 100%)',
                    boxShadow: loading || !fullName.trim()
                      ? 'none'
                      : '0 10px 30px rgba(139, 195, 74, 0.4)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الإنشاء...
                    </span>
                  ) : (
                    '✓ إنشاء حساب'
                  )}
                </button>
              </form>
            )}

            {/* نموذج OTP */}
            {step === 'otp' && (
              <form onSubmit={handleOTPSubmit} className="space-y-4 sm:space-y-5">
                {displayedOTP && (
                  <div
                    className="p-3 sm:p-4 rounded-xl text-center mb-4"
                    style={{
                      background: 'rgba(139, 195, 74, 0.2)',
                      border: '2px solid rgba(139, 195, 74, 0.5)'
                    }}
                  >
                    <p className="text-xs sm:text-sm text-green-200 mb-2 font-semibold">
                      🔐 رمز التحقق الخاص بك:
                    </p>
                    <p className="text-3xl sm:text-4xl font-black text-white tracking-widest" dir="ltr">
                      {displayedOTP}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2 text-right" style={{ color: '#8BC34A' }}>
                    🔢 أدخل رمز التحقق
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    disabled={loading}
                    maxLength={6}
                    dir="ltr"
                    className="w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-white text-2xl sm:text-3xl font-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-center tracking-widest"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '2px solid rgba(139, 195, 74, 0.3)',
                      caretColor: '#8BC34A'
                    }}
                  />
                </div>

                {countdown > 0 && (
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-yellow-300 font-semibold">
                      ⏱️ انتهاء الصلاحية: {formatTime(countdown)}
                    </p>
                  </div>
                )}

                {error && (
                  <div
                    className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-center"
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
                  disabled={loading || !otp.trim() || otp.length !== 6}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg text-white transition-all duration-500 active:scale-95 disabled:opacity-50 shadow-lg"
                  style={{
                    background: loading || !otp.trim() || otp.length !== 6
                      ? 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
                      : 'linear-gradient(135deg, #A4D65E 0%, #8BC34A 50%, #689F38 100%)',
                    boxShadow: loading || !otp.trim()
                      ? 'none'
                      : '0 10px 30px rgba(139, 195, 74, 0.4)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري التحقق...
                    </span>
                  ) : (
                    '✓ تسجيل الدخول'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
