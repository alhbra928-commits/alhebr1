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

        {/* Crystal Glass Crown with Modern Text */}
        <div
          className="relative cursor-pointer group"
          onClick={onEnter}
        >
          {/* Outer Glow - Rainbow Glass Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-purple-200/30 to-pink-200/30 blur-3xl animate-pulse" />

          {/* Crystal Glass Crown */}
          <div className="relative">
            {/* Glass Effect Layer 1 - Blue/Purple Tint */}
            <Crown
              className="w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] absolute inset-0 transition-all duration-500 group-hover:scale-110 group-active:scale-95"
              strokeWidth={2}
              style={{
                color: 'rgba(147, 197, 253, 0.6)',
                filter: 'blur(1px) drop-shadow(0 0 20px rgba(147, 197, 253, 0.5))',
              }}
            />

            {/* Glass Effect Layer 2 - White Crystal */}
            <Crown
              className="w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] absolute inset-0 transition-all duration-500 group-hover:scale-110 group-active:scale-95"
              strokeWidth={1.5}
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                filter: 'drop-shadow(0 8px 32px rgba(255, 255, 255, 0.3)) drop-shadow(0 4px 16px rgba(217, 119, 6, 0.2))',
              }}
            />

            {/* Glass Effect Layer 3 - Golden Accent */}
            <Crown
              className="w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] relative transition-all duration-500 group-hover:scale-110 group-active:scale-95"
              strokeWidth={1}
              style={{
                color: 'rgba(251, 191, 36, 0.4)',
                filter: 'drop-shadow(0 20px 60px rgba(217, 119, 6, 0.3))',
              }}
            />

            {/* Modern Text "مزاد" - Cairo/Tajawal Font */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black select-none"
                style={{
                  marginTop: '10%',
                  background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 50%, #d97706 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: `
                    0 0 40px rgba(251, 191, 36, 0.8),
                    0 0 20px rgba(217, 119, 6, 0.6),
                    0 4px 16px rgba(0, 0, 0, 0.2)
                  `,
                  fontFamily: "'Cairo', 'Tajawal', 'Almarai', sans-serif",
                  fontWeight: 900,
                  letterSpacing: '0.05em',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                }}
              >
                مزاد
              </h1>
            </div>

            {/* Crystal Sparkles - Rainbow Colors */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {[...Array(16)].map((_, i) => {
                const colors = ['#93c5fd', '#c4b5fd', '#f9a8d4', '#fbbf24', '#86efac'];
                const color = colors[i % colors.length];
                return (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: color,
                      boxShadow: `0 0 10px ${color}`,
                      top: `${10 + Math.random() * 80}%`,
                      left: `${10 + Math.random() * 80}%`,
                      animation: `sparkle ${1.5 + Math.random() * 2}s ease-in-out infinite`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                );
              })}
            </div>

            {/* Glass Shine Effect */}
            <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl pointer-events-none" />
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
