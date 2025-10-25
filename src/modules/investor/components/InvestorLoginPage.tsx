import { useState } from 'react';
import { LogIn, Loader, AlertCircle, UserPlus } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { InvestorService } from '../services/investorService';

interface InvestorLoginPageProps {
  onLoginSuccess: (phone: string) => void;
  onBack: () => void;
}

export function InvestorLoginPage({ onLoginSuccess, onBack }: InvestorLoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('+966');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      if (!phone || phone === '+966' || phone.length < 13) {
        setError('الرجاء إدخال رقم جوال صحيح');
        return;
      }

      const investor = await InvestorService.getInvestorByPhone(phone);

      if (!investor) {
        setError('لم يتم العثور على حساب مرتبط بهذا الرقم');
        return;
      }

      onLoginSuccess(phone);
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');

      if (!phone || phone === '+966' || phone.length < 13) {
        setError('الرجاء إدخال رقم جوال صحيح');
        return;
      }

      if (!fullName.trim()) {
        setError('الرجاء إدخال الاسم الكامل');
        return;
      }

      console.log('🔵 بدء التسجيل المباشر:', { phone, fullName });

      // التحقق من عدم وجود الحساب
      const existingInvestor = await InvestorService.getInvestorByPhone(phone);
      if (existingInvestor) {
        setError('هذا الرقم مسجل مسبقاً. استخدم تسجيل الدخول');
        return;
      }

      console.log('✅ الرقم غير مسجل، جاري الإنشاء...');

      // إنشاء حساب جديد
      const result = await InvestorService.createDirectAccount(phone, fullName);

      if (!result.success) {
        setError(result.error || 'فشل التسجيل');
        return;
      }

      console.log('✅ تم التسجيل بنجاح');

      onLoginSuccess(phone);
    } catch (err: any) {
      console.error('❌ خطأ في التسجيل:', err);
      setError(err.message || 'حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6"
      style={{
        background: 'linear-gradient(135deg, #2d3436 0%, #1e272e 50%, #2d3436 100%)',
      }}
      dir="rtl"
    >
      <div className="max-w-md w-full">
        <div
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            border: `2px solid ${brandColors.primary.gold}40`,
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.3) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10">
            {/* الهيدر */}
            <div className="text-center mb-6 sm:mb-8">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center animate-pulse"
                style={{
                  background: brandGradients.gold,
                  boxShadow: '0 20px 60px rgba(212,175,55,0.5)',
                }}
              >
                <span className="text-3xl sm:text-4xl">🌿</span>
              </div>

              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3"
                style={{
                  background: brandGradients.gold,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                لوحة المستثمر
              </h1>

              <p className="text-gray-400 text-xs sm:text-sm px-2">
                {mode === 'login'
                  ? 'ادخل رقم جوالك المسجّل لتتابع طلبك'
                  : 'سجّل حساب جديد واستثمر في المستقبل'}
              </p>
            </div>

            {/* أزرار التبديل بين الدخول والتسجيل */}
            <div className="flex gap-2 mb-6 sm:mb-8 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                  setFullName('');
                }}
                disabled={loading}
                className="flex-1 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-all"
                style={{
                  background: mode === 'login' ? brandGradients.gold : 'transparent',
                  color: mode === 'login' ? 'white' : brandColors.primary.gold,
                }}
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                disabled={loading}
                className="flex-1 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-all"
                style={{
                  background: mode === 'register' ? brandGradients.gold : 'transparent',
                  color: mode === 'register' ? 'white' : brandColors.primary.gold,
                }}
              >
                تسجيل جديد
              </button>
            </div>

            {/* النموذج */}
            <div className="space-y-4 sm:space-y-6">
              {/* رقم الجوال */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-gray-300">
                  📱 رقم الجوال
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 5xxxxxxxx"
                  disabled={loading}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 outline-none transition-all text-base sm:text-lg text-white"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: error ? brandColors.error : brandColors.primary.gold + '40',
                  }}
                />
              </div>

              {/* الاسم الكامل (للتسجيل فقط) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-gray-300">
                    👤 الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    disabled={loading}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 outline-none transition-all text-base sm:text-lg text-white"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderColor: error ? brandColors.error : brandColors.primary.gold + '40',
                    }}
                  />
                </div>
              )}

              {/* رسالة خطأ */}
              {error && (
                <div
                  className="rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
                  style={{ background: brandColors.error + '20' }}
                >
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: brandColors.error }} />
                  <p className="text-xs sm:text-sm font-bold" style={{ color: brandColors.error }}>
                    {error}
                  </p>
                </div>
              )}

              {/* زر الدخول أو التسجيل */}
              <button
                onClick={mode === 'login' ? handleLogin : handleRegister}
                disabled={loading}
                className="w-full py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center gap-2 sm:gap-3"
                style={{
                  background: loading ? brandGradients.beige : brandGradients.gold,
                  boxShadow: loading ? 'none' : '0 10px 40px rgba(212,175,55,0.3)',
                }}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                    <span className="text-sm sm:text-xl">
                      {mode === 'login' ? 'جاري التحقق...' : 'جاري التسجيل...'}
                    </span>
                  </>
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-sm sm:text-xl">الدخول إلى لوحة المستثمر 🌿</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-sm sm:text-xl">إنشاء حساب جديد 🌱</span>
                  </>
                )}
              </button>

              {/* زر العودة */}
              <button
                onClick={onBack}
                disabled={loading}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.2)',
                }}
              >
                العودة للرئيسية
              </button>

              {/* ملاحظة للتسجيل الجديد */}
              {mode === 'register' && (
                <div className="text-center text-xs sm:text-sm text-gray-400 leading-relaxed px-2">
                  بعد التسجيل، يمكنك استعراض المزارع المتاحة والحجز مباشرة من لوحة المستثمر
                </div>
              )}
            </div>
          </div>

          {/* التأثيرات البصرية */}
          <div
            className="absolute -top-20 -left-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
            style={{ background: brandColors.primary.gold }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
            style={{ background: brandColors.primary.gold }}
          />
        </div>

        {/* الحقوق */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            © 2025 منصة النخيل والزيتون - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}
