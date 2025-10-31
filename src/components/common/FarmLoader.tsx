import { Leaf, Droplets, Sun, Sparkles } from 'lucide-react';

interface FarmLoaderProps {
  farmType?: 'palm' | 'olive' | 'نخيل' | 'زيتون';
  message?: string;
}

export function FarmLoader({ farmType = 'palm', message = 'جاري التحميل...' }: FarmLoaderProps) {
  // تحديد نوع الشجرة
  const isPalm = farmType === 'palm' || farmType === 'نخيل';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 animate-float">
          <Leaf className="w-32 h-32 text-emerald-600" style={{ animationDelay: '0s' }} />
        </div>
        <div className="absolute top-1/4 right-20 animate-float">
          <Droplets className="w-24 h-24 text-teal-600" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float">
          <Sun className="w-28 h-28 text-amber-600" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="absolute bottom-1/4 right-1/3 animate-float">
          <Leaf className="w-20 h-20 text-green-600" style={{ animationDelay: '1.5s' }} />
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Emoji الشجرة المتحركة - مثل زر الاكتشاف */}
        <div className="relative mb-12">
          {/* دائرة خلفية متوهجة */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 50%, transparent 100%)',
                animation: 'pulse-glow 2s ease-in-out infinite'
              }}
            ></div>
          </div>

          {/* دائرة ثانية */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                animation: 'pulse-glow 2s ease-in-out infinite',
                animationDelay: '0.5s'
              }}
            ></div>
          </div>

          {/* الشجرة Emoji الكبيرة */}
          <div className="relative flex items-center justify-center">
            <div
              className="text-9xl sm:text-[12rem] md:text-[14rem] animate-bounce"
              style={{
                filter: 'drop-shadow(0 10px 30px rgba(16, 185, 129, 0.5))',
                animationDuration: '2s'
              }}
            >
              {isPalm ? '🌴' : '🌳'}
            </div>

            {/* شرارات متحركة حول الشجرة */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 animate-ping" style={{ animationDuration: '1.5s' }} />
            </div>
            <div className="absolute top-1/4 right-0 translate-x-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            </div>
            <div className="absolute top-1/4 left-0 -translate-x-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
            </div>
            <div className="absolute bottom-1/4 right-1/4">
              <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-teal-400 animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
            </div>
          </div>
        </div>

        {/* نص التحميل */}
        <div className="mt-8 text-center">
          <div
            className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm px-8 py-4 sm:px-10 sm:py-5 rounded-2xl shadow-2xl border-2 border-emerald-200 relative overflow-hidden"
            style={{
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.5)'
            }}
          >
            {/* تأثير الانزلاق */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.2) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s linear infinite'
              }}
            ></div>

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
              <p
                className="text-emerald-800 font-bold text-lg sm:text-xl md:text-2xl"
                style={{
                  textShadow: '0 1px 2px rgba(16, 185, 129, 0.2)'
                }}
              >
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
