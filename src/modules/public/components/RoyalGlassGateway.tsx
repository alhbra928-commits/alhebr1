import React, { useState, useEffect } from 'react';
import { Palmtree, Leaf, ArrowLeft, Crown } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface GatewayProps {
  onEnter: () => void;
}

interface GatewaySettings {
  enabled: boolean;
  auto_enter_enabled: boolean;
  auto_enter_delay: number;
  welcome_text_ar: string;
  subtitle_text_ar: string;
  description_text_ar: string;
}

export function RoyalGlassGateway({ onEnter }: GatewayProps) {
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('royal_gateway_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setSettings(data || {
        enabled: true,
        auto_enter_enabled: true,
        auto_enter_delay: 5,
        welcome_text_ar: 'مرحباً بكم',
        subtitle_text_ar: 'منصة الاستثمار الزراعي',
        description_text_ar: 'استثمار آمن في النخيل والزيتون',
      });
    } catch (error) {
      console.error('Error loading gateway settings:', error);
      setSettings({
        enabled: true,
        auto_enter_enabled: true,
        auto_enter_delay: 5,
        welcome_text_ar: 'مرحباً بكم',
        subtitle_text_ar: 'منصة الاستثمار الزراعي',
        description_text_ar: 'استثمار آمن في النخيل والزيتون',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!settings || loading) return;

    if (!settings.enabled) {
      onEnter();
      return;
    }

    const delay = settings.auto_enter_delay * 1000;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (delay / 50));
      });
    }, 50);

    const timer = settings.auto_enter_enabled
      ? setTimeout(() => {
          onEnter();
        }, delay)
      : null;

    return () => {
      clearInterval(progressInterval);
      if (timer) clearTimeout(timer);
    };
  }, [settings, loading, onEnter]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 flex items-center justify-center">
        <div className="text-amber-700 text-xl font-bold">جاري التحميل...</div>
      </div>
    );
  }

  if (!settings?.enabled) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
      {/* Golden Particles Background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6">

        {/* Crown Icon */}
        <div className="mb-6 sm:mb-8 animate-bounce-slow">
          <Crown
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
            strokeWidth={2}
            style={{
              color: '#d97706',
              filter: 'drop-shadow(0 4px 12px rgba(217, 119, 6, 0.4))',
            }}
          />
        </div>

        {/* Glass Card */}
        <div className="relative max-w-2xl w-full">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-300/30 via-yellow-200/30 to-amber-300/30 blur-3xl" />

          {/* Main Glass Card */}
          <div className="relative backdrop-blur-2xl bg-white/40 border border-white/60 rounded-3xl shadow-2xl p-8 sm:p-12">
            {/* Golden Border Animation */}
            <div className="absolute inset-0 rounded-3xl border-2 border-amber-400/30 animate-pulse" />

            {/* Trees Container */}
            <div className="flex items-center justify-center gap-6 sm:gap-8 mb-10">
              {/* Palm Tree */}
              <div className="relative group">
                <div className="absolute inset-0 bg-green-400/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500" />
                <Palmtree
                  className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-green-700 group-hover:scale-110 transition-transform duration-300"
                  strokeWidth={1.8}
                  style={{
                    filter: 'drop-shadow(0 4px 12px rgba(34, 197, 94, 0.4))',
                    animation: 'sway 3s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Divider */}
              <div className="h-28 sm:h-32 md:h-36 w-0.5 bg-gradient-to-b from-transparent via-amber-400 to-transparent opacity-60" />

              {/* Olive Tree */}
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500" />
                <Leaf
                  className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-emerald-700 group-hover:scale-110 transition-transform duration-300"
                  strokeWidth={1.8}
                  style={{
                    filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.4))',
                    animation: 'sway 3s ease-in-out infinite 0.5s',
                  }}
                />
              </div>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h1
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-5 leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #b45309 0%, #d97706 25%, #fbbf24 50%, #d97706 75%, #b45309 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 2px 20px rgba(217, 119, 6, 0.3)',
                  letterSpacing: '-0.02em',
                }}
              >
                {settings.welcome_text_ar}
              </h1>

              <p
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 leading-relaxed"
                style={{
                  color: '#92400e',
                  textShadow: '0 1px 2px rgba(146, 64, 14, 0.1)',
                  letterSpacing: '-0.01em',
                }}
              >
                {settings.subtitle_text_ar}
              </p>

              <p
                className="text-base sm:text-lg md:text-xl font-medium leading-relaxed px-2"
                style={{
                  color: '#b45309',
                  letterSpacing: '-0.005em',
                }}
              >
                {settings.description_text_ar}
              </p>
            </div>

            {/* Progress Bar */}
            {settings.auto_enter_enabled && (
              <div className="mb-6">
                <div className="relative h-3 bg-amber-200/50 rounded-full overflow-hidden backdrop-blur-sm border border-amber-300/30">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span
                    className="text-sm sm:text-base font-bold"
                    style={{
                      color: '#92400e',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    جاري الدخول...
                  </span>
                  <span
                    className="text-base sm:text-lg font-black font-mono"
                    style={{
                      color: '#b45309',
                    }}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            )}

            {/* Enter Button */}
            <button
              onClick={onEnter}
              className="group relative w-full py-5 sm:py-6 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {/* Button Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 opacity-90 group-hover:opacity-100 transition-opacity" />

              {/* Button Content */}
              <div className="relative flex items-center justify-center gap-3">
                <span
                  className="text-xl sm:text-2xl md:text-3xl font-black"
                  style={{
                    color: '#451a03',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.3)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  دخول المنصة
                </span>
                <ArrowLeft
                  className="w-6 h-6 sm:w-7 sm:h-7 group-hover:-translate-x-2 transition-transform"
                  style={{ color: '#451a03' }}
                  strokeWidth={2.5}
                />
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            </button>

            {/* Decorative Corners */}
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-400/50 rounded-tr-xl" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-400/50 rounded-bl-xl" />
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-400/50 rounded-tl-xl" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-400/50 rounded-br-xl" />
          </div>
        </div>

        {/* Bottom Decorative Text */}
        <div className="mt-8 text-center">
          <p
            className="text-base sm:text-lg font-bold tracking-wide"
            style={{
              color: '#92400e',
              textShadow: '0 1px 2px rgba(146, 64, 14, 0.1)',
            }}
          >
            استثمارك يبدأ من هنا
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }

        @keyframes sway {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(2deg);
          }
          75% {
            transform: rotate(-2deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
