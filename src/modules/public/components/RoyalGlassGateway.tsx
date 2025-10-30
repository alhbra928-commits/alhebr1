import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
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
        <div
          className="relative max-w-2xl w-full cursor-pointer group"
          onClick={onEnter}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-300/30 via-yellow-200/30 to-amber-300/30 blur-3xl" />

          {/* Main Glass Card */}
          <div className="relative backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 transition-all duration-500 hover:scale-105 active:scale-95">
            {/* Golden Border Animation */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-amber-400/30 animate-pulse" />

            {/* MZAD Text - Ultra Large & Professional */}
            <div className="text-center">
              <h1
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-tight select-none"
                style={{
                  background: 'linear-gradient(135deg, #b45309 0%, #d97706 25%, #fbbf24 50%, #d97706 75%, #b45309 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 4px 30px rgba(217, 119, 6, 0.4)',
                  letterSpacing: '0.05em',
                  fontFamily: "'Tajawal', 'Cairo', sans-serif",
                }}
              >
                مزاد
              </h1>
            </div>

            {/* Progress Bar */}
            {settings.auto_enter_enabled && (
              <div className="mt-8 sm:mt-10">
                <div className="relative h-2 sm:h-3 bg-amber-200/50 rounded-full overflow-hidden backdrop-blur-sm border border-amber-300/30">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="flex justify-center items-center mt-4">
                  <span
                    className="text-sm sm:text-base font-bold"
                    style={{
                      color: '#92400e',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            )}

            {/* Decorative Corners */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-r-2 border-amber-400/50 rounded-tr-xl" />
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-l-2 border-amber-400/50 rounded-bl-xl" />
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-l-2 border-amber-400/50 rounded-tl-xl" />
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-r-2 border-amber-400/50 rounded-br-xl" />
          </div>
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

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
