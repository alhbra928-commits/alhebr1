import { useState, useEffect } from 'react';
import { Crown, Phone, Key, LogIn, Loader2 } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { AdminUsersStorage } from '../services/adminUsersStorage';

interface SmartAdminLoginPageProps {
  onLoginSuccess: (adminData: any) => void;
  onCancel?: () => void;
}

export function SmartAdminLoginPage({ onLoginSuccess, onCancel }: SmartAdminLoginPageProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoRotation, setLogoRotation] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogoRotation(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!phone.trim() || !otp.trim()) {
      setError('يرجى إدخال رقم الجوال ورمز الدخول');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // تأخير بصري بسيط للتجربة
      await new Promise(resolve => setTimeout(resolve, 800));

      const result = await AdminUsersStorage.verifyLogin(phone, otp);

      if (!result.success) {
        setError(result.message || 'حدث خطأ في تسجيل الدخول');
        setIsLoading(false);
        return;
      }

      // حفظ رقم الهاتف في localStorage للاستخدام في الصلاحيات
      localStorage.setItem('admin_phone', phone);

      const welcomeMessage = result.user?.role === 'super_admin'
        ? '👑 مرحباً بالقائد'
        : '🌿 مرحباً بفريق العمل';

      setSuccessMessage(welcomeMessage);
      await new Promise(resolve => setTimeout(resolve, 800));

      onLoginSuccess(result.user);
    } catch (err) {
      setError('حدث خطأ في تسجيل الدخول');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 animate-gradient"
        style={{
          background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 25%, #5A8672 50%, #3D5B4B 75%, #2E2A26 100%)',
          backgroundSize: '400% 400%',
        }}
      />

      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              background: brandGradients.gold,
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: 'blur(80px)',
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div
          className="transform transition-all duration-1000"
          style={{
            opacity: showForm ? 1 : 0,
            transform: showForm ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          }}
        >
          <div
            className="mb-8 flex justify-center"
            style={{
              transform: `rotate(${logoRotation}deg)`,
              transition: 'transform 0.05s linear',
            }}
          >
            <div
              className="relative flex h-32 w-32 items-center justify-center rounded-full"
              style={{
                background: brandGradients.gold,
                boxShadow: '0 0 80px rgba(212, 175, 55, 0.6), 0 0 120px rgba(212, 175, 55, 0.4)',
              }}
            >
              <Crown className="h-16 w-16 text-white" strokeWidth={2} fill="rgba(255, 255, 255, 0.2)" />
            </div>
          </div>

          <div
            className="rounded-3xl p-8 backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h1
              className="mb-2 text-center text-3xl font-black"
              style={{
                background: brandGradients.gold,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              🔐 تسجيل دخول الإدارة
            </h1>
            <p className="mb-8 text-center text-sm" style={{ color: 'rgba(212, 175, 55, 0.8)' }}>
              بوابة الحبر الإدارية
            </p>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">📱 رقم الجوال</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: brandColors.primary.gold }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full rounded-xl border-2 bg-white/10 px-4 py-3 pr-12 text-right font-bold text-white placeholder-white/40 backdrop-blur-sm transition-all focus:outline-none"
                    style={{
                      borderColor: 'rgba(212, 175, 55, 0.3)',
                    }}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white">🔑 رمز الدخول</label>
                <div className="relative">
                  <Key className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: brandColors.primary.gold }} />
                  <input
                    type="password"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="••••"
                    className="w-full rounded-xl border-2 bg-white/10 px-4 py-3 pr-12 text-right font-bold text-white placeholder-white/40 backdrop-blur-sm transition-all focus:outline-none"
                    style={{
                      borderColor: 'rgba(212, 175, 55, 0.3)',
                    }}
                    disabled={isLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              {error && (
                <div
                  className="animate-shake rounded-xl p-3 text-center text-sm font-bold"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '2px solid rgba(239, 68, 68, 0.5)',
                    color: '#FCA5A5',
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {successMessage && (
                <div
                  className="animate-bounce-in rounded-xl p-4 text-center text-lg font-black"
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '2px solid rgba(16, 185, 129, 0.5)',
                    color: '#10B981',
                  }}
                >
                  {successMessage}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-2xl py-4 font-black text-white transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
                style={{
                  background: brandGradients.gold,
                  boxShadow: '0 10px 40px rgba(212, 175, 55, 0.5)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>جاري التحقق...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>دخول</span>
                    </>
                  )}
                </div>
              </button>

              {onCancel && (
                <button
                  onClick={onCancel}
                  className="w-full py-3 text-center text-sm font-bold transition-colors hover:text-white"
                  style={{ color: 'rgba(212, 175, 55, 0.7)' }}
                  disabled={isLoading}
                >
                  العودة للمنصة
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient {
          animation: gradient 15s ease infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
