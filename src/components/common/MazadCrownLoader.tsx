import { useState, useEffect } from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MazadCrownLoaderProps {
  message?: string;
  subtitle?: string;
}

interface LoaderTexts {
  mainTitle: string;
  defaultMessage: string;
}

export function MazadCrownLoader({
  message,
  subtitle
}: MazadCrownLoaderProps) {
  const [texts, setTexts] = useState<LoaderTexts>({
    mainTitle: 'مزادات',
    defaultMessage: 'جاري التحميل...'
  });

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_texts')
        .select('key, text_ar')
        .eq('section', 'loader')
        .in('key', ['main_title', 'default_message']);

      if (error) throw error;

      if (data) {
        const textsMap: any = {};
        data.forEach(item => {
          const camelKey = item.key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          textsMap[camelKey] = item.text_ar;
        });

        setTexts(prev => ({ ...prev, ...textsMap }));
      }
    } catch (error) {
      console.error('Error loading loader texts:', error);
    }
  };

  const displayMessage = message || texts.defaultMessage;
  const displaySubtitle = subtitle || texts.mainTitle;
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <Crown className="w-8 h-8 text-emerald-600 opacity-30" />
          </div>
        ))}
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* دوائر متوهجة */}
        <div className="relative mb-8">
          {/* الدائرة الخارجية */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              animation: 'pulse-glow 2s ease-in-out infinite'
            }}
          >
            <div
              className="w-64 h-64 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 50%, transparent 100%)',
              }}
            />
          </div>

          {/* الدائرة الوسطى */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              animation: 'pulse-glow 2s ease-in-out infinite',
              animationDelay: '0.5s'
            }}
          >
            <div
              className="w-48 h-48 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* التاج الرئيسي */}
          <div className="relative flex items-center justify-center">
            <div
              className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 shadow-2xl flex items-center justify-center"
              style={{
                animation: 'crown-pulse 2s ease-in-out infinite',
                boxShadow: '0 0 60px rgba(16, 185, 129, 0.5), 0 0 100px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Crown
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-white"
                strokeWidth={1.5}
                style={{
                  filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))',
                  animation: 'crown-float 3s ease-in-out infinite'
                }}
              />

              {/* توهج داخلي */}
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent"
                style={{
                  animation: 'shine-rotate 4s linear infinite',
                }}
              />
            </div>

            {/* شرارات متحركة حول التاج */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2"
                style={{
                  animation: `sparkle-orbit ${3 + (i * 0.1)}s linear infinite`,
                  animationDelay: `${i * 0.2}s`,
                  transformOrigin: '0 0'
                }}
              >
                <Sparkles
                  className="w-6 h-6 text-yellow-400"
                  style={{
                    transform: `rotate(${angle}deg) translateX(120px)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* النصوص */}
        <div className="mt-12 text-center space-y-6">
          {/* كلمة مزادات */}
          <div
            className="text-6xl sm:text-7xl md:text-8xl font-black leading-none mb-4"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 25%, #34d399 50%, #10b981 75%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% auto',
              animation: 'gradient-flow 3s linear infinite',
              textShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.02em'
            }}
          >
            {displaySubtitle}
          </div>

          {/* رسالة التحميل */}
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
                background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s linear infinite'
              }}
            />

            <div className="relative z-10 flex items-center gap-3">
              {/* نقاط متحركة */}
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>

              <p
                className="text-emerald-800 font-bold text-lg sm:text-xl md:text-2xl"
                style={{
                  textShadow: '0 1px 2px rgba(16, 185, 129, 0.2)'
                }}
              >
                {displayMessage}
              </p>
            </div>
          </div>

          {/* نقاط التقدم */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-emerald-600"
                style={{
                  animation: 'pulse-dot 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) translateX(15px) rotate(180deg);
            opacity: 0.6;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.9;
          }
        }

        @keyframes crown-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 60px rgba(16, 185, 129, 0.5), 0 0 100px rgba(16, 185, 129, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 80px rgba(16, 185, 129, 0.7), 0 0 120px rgba(16, 185, 129, 0.5);
          }
        }

        @keyframes crown-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-8px) rotate(-3deg);
          }
          50% {
            transform: translateY(0) rotate(0deg);
          }
          75% {
            transform: translateY(-8px) rotate(3deg);
          }
        }

        @keyframes shine-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sparkle-orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes gradient-flow {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        @keyframes pulse-dot {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.3);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
