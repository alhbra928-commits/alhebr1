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

        {/* Pure Crystal Glass Crown with Artistic Logo */}
        <div
          className="relative cursor-pointer group"
          onClick={onEnter}
        >
          {/* Outer Glow - Pure White/Crystal */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-blue-50/20 to-white/20 blur-3xl animate-pulse" />

          {/* Pure Crystal Glass Crown with Thin Golden Border */}
          <div className="relative">
            {/* Main White Crystal Crown - Fill Only */}
            <Crown
              className="w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] absolute inset-0 transition-all duration-500 group-hover:scale-110 group-active:scale-95"
              strokeWidth={0}
              style={{
                color: '#ffffff',
                fill: '#ffffff',
                opacity: 0.85,
                filter: `
                  drop-shadow(0 0 60px rgba(255, 255, 255, 0.9))
                  drop-shadow(0 15px 100px rgba(147, 197, 253, 0.4))
                  drop-shadow(0 20px 120px rgba(255, 255, 255, 0.7))
                `,
              }}
            />

            {/* White Crystal Stroke */}
            <Crown
              className="w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] absolute inset-0 transition-all duration-500 group-hover:scale-110 group-active:scale-95"
              strokeWidth={3}
              fill="none"
              style={{
                stroke: '#ffffff',
                opacity: 0.95,
                filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.8))',
              }}
            />

            {/* Thin Golden Outline on Top */}
            <Crown
              className="w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] relative transition-all duration-500 group-hover:scale-110 group-active:scale-95"
              strokeWidth={1.5}
              fill="none"
              style={{
                stroke: 'url(#goldenGradient)',
                filter: `
                  drop-shadow(0 0 20px rgba(251, 191, 36, 0.6))
                  drop-shadow(0 2px 10px rgba(217, 119, 6, 0.4))
                `,
              }}
            />

            {/* Andalusian Style "مزاد" Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h1
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold select-none"
                style={{
                  marginTop: '8%',
                  background: 'linear-gradient(135deg, #b45309 0%, #d97706 20%, #fbbf24 40%, #fef3c7 50%, #fbbf24 60%, #d97706 80%, #b45309 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: `
                    0 0 60px rgba(251, 191, 36, 1),
                    0 0 40px rgba(217, 119, 6, 0.8),
                    0 4px 30px rgba(251, 191, 36, 0.6),
                    0 8px 40px rgba(0, 0, 0, 0.3)
                  `,
                  fontFamily: "'Scheherazade New', 'Amiri', 'Lateef', 'Arabic Typesetting', serif",
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                }}
              >
                مزاد
              </h1>
            </div>

            {/* Hidden SVG for gradients */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <defs>
                {/* Golden Gradient for Crown Border */}
                <linearGradient id="goldenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                  <stop offset="25%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#fef3c7', stopOpacity: 1 }} />
                  <stop offset="75%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>

            {/* Crystal Sparkles - Pure White */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-white"
                  style={{
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 8px rgba(147, 197, 253, 0.4)',
                    top: `${5 + Math.random() * 90}%`,
                    left: `${5 + Math.random() * 90}%`,
                    animation: `sparkle ${1 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.7 + Math.random() * 0.3,
                  }}
                />
              ))}
            </div>

            {/* Multiple Glass Shine Effects */}
            <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 bg-gradient-to-br from-white/50 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-1/4 h-1/4 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Progress Bar - Below Crown */}
          {settings.auto_enter_enabled && (
            <div className="mt-8 sm:mt-10 max-w-md mx-auto">
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

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
