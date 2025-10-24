import { useState } from 'react';
import { LogIn, Loader, AlertCircle } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { InvestorService } from '../services/investorService';

interface InvestorLoginPageProps {
  onLoginSuccess: (phone: string) => void;
  onBack: () => void;
}

export function InvestorLoginPage({ onLoginSuccess, onBack }: InvestorLoginPageProps) {
  const [phone, setPhone] = useState('+966');
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
        setError('لم يتم العثور على حجوزات مرتبطة بهذا الرقم');
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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, #2d3436 0%, #1e272e 50%, #2d3436 100%)',
      }}
      dir="rtl"
    >
      <div className="max-w-md w-full">
        <div
          className="rounded-3xl p-12 relative overflow-hidden"
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
            <div className="text-center mb-8">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse"
                style={{
                  background: brandGradients.gold,
                  boxShadow: '0 20px 60px rgba(212,175,55,0.5)',
                }}
              >
                <span className="text-4xl">🌿</span>
              </div>

              <h1
                className="text-4xl font-black mb-3"
                style={{
                  background: brandGradients.gold,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                لوحة المستثمر
              </h1>

              <p className="text-gray-400 text-sm">
                ادخل رقم جوالك المسجّل أثناء الحجز لتتابع طلبك
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-300">
                  رقم الجوال
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 5xxxxxxxx"
                  disabled={loading}
                  className="w-full px-6 py-4 rounded-xl border-2 outline-none transition-all text-lg text-white"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: error ? brandColors.error : brandColors.primary.gold + '40',
                  }}
                />
              </div>

              {error && (
                <div
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ background: brandColors.error + '20' }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: brandColors.error }} />
                  <p className="text-sm font-bold" style={{ color: brandColors.error }}>
                    {error}
                  </p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-5 rounded-2xl font-black text-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center gap-3"
                style={{
                  background: loading ? brandGradients.beige : brandGradients.gold,
                  boxShadow: loading ? 'none' : '0 10px 40px rgba(212,175,55,0.3)',
                }}
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6" />
                    <span>الدخول إلى لوحة المستثمر 🌿</span>
                  </>
                )}
              </button>

              <button
                onClick={onBack}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.2)',
                }}
              >
                العودة للرئيسية
              </button>
            </div>
          </div>

          <div
            className="absolute -top-20 -left-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
            style={{ background: brandColors.primary.gold }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
            style={{ background: brandColors.primary.gold }}
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 منصة النخيل والزيتون - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}
