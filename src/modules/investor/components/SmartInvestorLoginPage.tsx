import { useState, useEffect } from 'react';
import { LogIn, Loader, AlertCircle, Copy, Check } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { InvestorService } from '../services/investorService';

interface SmartInvestorLoginPageProps {
  onLoginSuccess: (phone: string, sessionToken: string, investorName?: string) => void;
  onBack: () => void;
}

export function SmartInvestorLoginPage({ onLoginSuccess, onBack }: SmartInvestorLoginPageProps) {
  const [phone, setPhone] = useState('+966');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTPField, setShowOTPField] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [copied, setCopied] = useState(false);

  const demoOTP = InvestorService.getDemoOTP();
  const isDemoMode = InvestorService.isDemoMode();

  // Check for auto-login after booking
  useEffect(() => {
    const checkAutoLogin = async () => {
      const shouldAutoLogin = sessionStorage.getItem('should_auto_login');
      const pendingPhone = sessionStorage.getItem('pending_investor_phone');

      if (shouldAutoLogin === 'true' && pendingPhone) {
        console.log('[SmartLogin] Auto-login detected for phone:', pendingPhone);

        setPhone(`+966${pendingPhone}`);
        setLoading(true);

        try {
          const fullPhone = `+966${pendingPhone}`;

          // Extended wait and retry mechanism for DB trigger to complete
          console.log('[SmartLogin] Waiting for DB sync and triggers...');

          let loginStatus = null;
          let attempts = 0;
          const maxAttempts = 6;
          const initialWait = 2000;
          const retryWait = 1500;

          // Initial longer wait for trigger to execute
          await new Promise(resolve => setTimeout(resolve, initialWait));

          while (attempts < maxAttempts) {
            attempts++;
            console.log(`[SmartLogin] Attempt ${attempts}/${maxAttempts}`);

            try {
              loginStatus = await InvestorService.checkLoginStatus(fullPhone);

              if (loginStatus.exists) {
                console.log('[SmartLogin] ✅ User found in system!');
                break;
              }
            } catch (checkError) {
              console.warn(`[SmartLogin] Check error on attempt ${attempts}:`, checkError);
            }

            if (attempts < maxAttempts) {
              console.log('[SmartLogin] ⏳ User not found yet, waiting...');
              await new Promise(resolve => setTimeout(resolve, retryWait));
            }
          }

          if (loginStatus && loginStatus.exists) {
            // Clear the flags after successful detection
            sessionStorage.removeItem('should_auto_login');
            sessionStorage.removeItem('pending_investor_phone');

            if (loginStatus.sessionToken) {
              const investorData = await InvestorService.getInvestorByPhone(fullPhone);
              onLoginSuccess(fullPhone, loginStatus.sessionToken, investorData?.customer_name);
            } else if (loginStatus.isFirstLogin) {
              const sessionToken = await InvestorService.createSession(fullPhone, true);
              await InvestorService.logLoginAttempt({
                phone: fullPhone,
                login_type: 'first_time_auto',
                success: true
              });
              const investorData = await InvestorService.getInvestorByPhone(fullPhone);
              onLoginSuccess(fullPhone, sessionToken, investorData?.customer_name);
            }
          } else {
            console.error('[SmartLogin] ❌ User not found after all attempts');
            // Don't remove flags yet - let user try manual login
            setError('جاري معالجة حجزك في قاعدة البيانات. يرجى الانتظار لحظات ثم المحاولة مرة أخرى.');
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('[SmartLogin] Auto-login error:', err);
          setError('حدث خطأ في الدخول التلقائي. يمكنك إدخال رقم الجوال يدوياً.');
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
      }
    };

    checkAutoLogin();
  }, [onLoginSuccess]);

  const handlePhoneSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📱📱📱 [handlePhoneSubmit] Input phone:', phone);

      if (!phone || phone === '+966' || phone.length < 13) {
        setError('الرجاء إدخال رقم جوال صحيح');
        return;
      }

      console.log('⚡⚡⚡ [handlePhoneSubmit] Calling checkLoginStatus with:', phone);
      const loginStatus = await InvestorService.checkLoginStatus(phone);
      console.log('✅✅✅ [handlePhoneSubmit] Login status:', loginStatus);

      // إذا لم يكن موجوداً في النظام، إنشاء حساب تلقائياً ودخول مباشر
      if (!loginStatus.exists) {
        console.log('⚠️ المستثمر غير موجود، جاري الإنشاء التلقائي...');

        const result = await InvestorService.createInvestorQuickRegistration(phone, 'مستثمر جديد');

        if (!result.success) {
          setError('فشل إنشاء الحساب. الرجاء المحاولة مرة أخرى.');
          return;
        }

        console.log('✅ تم إنشاء الحساب تلقائياً - دخول مباشر للمرة الأولى');

        setIsFirstLogin(true);
        const sessionToken = await InvestorService.createSession(phone, true);

        await InvestorService.logLoginAttempt({
          phone,
          login_type: 'first_time_auto_created',
          success: true
        });

        const investorData = await InvestorService.getInvestorByPhone(phone);
        console.log('🔍 Auto-Created Account - Investor Data:', investorData);
        onLoginSuccess(phone, sessionToken, investorData?.customer_name);
        return;
      }

      // جلسة نشطة موجودة
      if (loginStatus.sessionToken) {
        await InvestorService.logLoginAttempt({
          phone,
          login_type: 'session_resume',
          success: true
        });
        const investorData = await InvestorService.getInvestorByPhone(phone);
        console.log('🔍 Session Resume - Investor Data:', investorData);
        console.log('🔍 Session Resume - Sending name:', investorData?.customer_name);
        onLoginSuccess(phone, loginStatus.sessionToken, investorData?.customer_name);
        return;
      }

      // دخول لأول مرة بدون OTP
      if (loginStatus.isFirstLogin) {
        setIsFirstLogin(true);
        const sessionToken = await InvestorService.createSession(phone, true);

        await InvestorService.logLoginAttempt({
          phone,
          login_type: 'first_time',
          success: true
        });

        const investorData = await InvestorService.getInvestorByPhone(phone);
        console.log('🔍 First Login - Investor Data:', investorData);
        console.log('🔍 First Login - Sending name:', investorData?.customer_name);
        onLoginSuccess(phone, sessionToken, investorData?.customer_name);
      } else {
        // دخول عادي يتطلب OTP
        setIsFirstLogin(false);
        setShowOTPField(true);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      if (!otp) {
        setError('الرجاء إدخال رمز الدخول');
        return;
      }

      const isValid = await InvestorService.verifyOTP(phone, otp);

      if (!isValid) {
        setError('رمز الدخول غير صحيح');
        await InvestorService.logLoginAttempt({
          phone,
          login_type: 'with_otp',
          otp_entered: otp,
          success: false,
          failure_reason: 'رمز خاطئ'
        });
        return;
      }

      const sessionToken = await InvestorService.createSession(phone, false);

      await InvestorService.logLoginAttempt({
        phone,
        login_type: 'with_otp',
        otp_entered: otp,
        success: true
      });

      const investorData = await InvestorService.getInvestorByPhone(phone);
      console.log('🔍 OTP Login - Investor Data:', investorData);
      console.log('🔍 OTP Login - Sending name:', investorData?.customer_name);
      onLoginSuccess(phone, sessionToken, investorData?.customer_name);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('حدث خطأ أثناء التحقق. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOTP = () => {
    if (demoOTP) {
      navigator.clipboard.writeText(demoOTP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  background: brandGradients.gold,
                  boxShadow: '0 20px 60px rgba(212,175,55,0.5)',
                  animation: 'pulse 4s ease-in-out infinite',
                }}
              >
                <span className="text-4xl">🌴</span>
              </div>

              <h1
                className="text-4xl font-black mb-3"
                style={{
                  background: brandGradients.gold,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                منصة تملك النخيل والزيتون
              </h1>

              <p className="text-gray-400 text-sm">
                ادخل رقم جوالك لتتابع مزارعك واستثماراتك
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-300">
                  📱 رقم الجوال
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 5xxxxxxxx"
                  disabled={loading || showOTPField}
                  className="w-full px-6 py-4 rounded-xl border-2 outline-none transition-all text-lg text-white"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: error ? brandColors.error : brandColors.primary.gold + '40',
                  }}
                />
              </div>

              {showOTPField && (
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-300">
                    🔐 رمز الدخول
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="أدخل رمز الدخول"
                    disabled={loading}
                    className="w-full px-6 py-4 rounded-xl border-2 outline-none transition-all text-lg text-white text-center tracking-widest font-bold"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderColor: error ? brandColors.error : brandColors.primary.gold + '40',
                    }}
                  />

                  {isDemoMode && demoOTP && (
                    <div
                      className="mt-4 p-4 rounded-xl flex items-center justify-between"
                      style={{
                        background: 'rgba(212,175,55,0.1)',
                        border: `1px solid ${brandColors.primary.gold}30`,
                      }}
                    >
                      <div>
                        <p className="text-sm text-gray-400 mb-1">رمز الدخول التجريبي:</p>
                        <p className="text-2xl font-black" style={{ color: brandColors.primary.gold }}>
                          {demoOTP}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">(انسخه لتجربة الدخول)</p>
                      </div>
                      <button
                        onClick={handleCopyOTP}
                        className="p-3 rounded-lg transition-all hover:scale-110"
                        style={{
                          background: brandGradients.gold,
                          color: 'white',
                        }}
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                </div>
              )}

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
                onClick={showOTPField ? handleOTPSubmit : handlePhoneSubmit}
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
                    <span>{showOTPField ? 'جاري التحقق...' : 'جاري الدخول...'}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6" />
                    <span>{showOTPField ? 'تأكيد الدخول' : 'الدخول إلى لوحة المستثمر'} 🌿</span>
                  </>
                )}
              </button>

              {showOTPField && (
                <button
                  onClick={() => {
                    setShowOTPField(false);
                    setOtp('');
                    setError('');
                  }}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                >
                  تغيير رقم الجوال
                </button>
              )}

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

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 20px 60px rgba(212,175,55,0.5);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 25px 70px rgba(212,175,55,0.7);
          }
        }
      `}</style>
    </div>
  );
}
