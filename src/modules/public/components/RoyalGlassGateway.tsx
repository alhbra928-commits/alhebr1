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

        {/* Giant Glass Crown with Kufi Text Inside */}
        <div
          className="relative cursor-pointer group"
          onClick={onEnter}
        >
          {/* Outer Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-300/40 via-yellow-200/40 to-amber-300/40 blur-3xl animate-pulse" />

          {/* Giant Crown SVG - Glass Effect */}
          <div className="relative">
            <svg
              viewBox="0 0 400 320"
              className="w-72 h-60 sm:w-96 sm:h-80 md:w-[28rem] md:h-96 lg:w-[32rem] lg:h-[26rem] transition-all duration-500 group-hover:scale-110 group-active:scale-95"
              style={{
                filter: 'drop-shadow(0 20px 60px rgba(217, 119, 6, 0.4))',
              }}
            >
              {/* Crown Shape - Glass Style */}
              <defs>
                <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0.6)', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: 'rgba(255, 255, 255, 0.3)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(255, 255, 255, 0.5)', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="borderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#d97706', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#b45309', stopOpacity: 1 }} />
                </linearGradient>
                <filter id="glassBlur">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
                </filter>
              </defs>

              {/* Crown Base */}
              <path
                d="M 50 280 L 80 180 L 120 220 L 200 140 L 280 220 L 320 180 L 350 280 Z"
                fill="url(#glassGradient)"
                stroke="url(#borderGradient)"
                strokeWidth="4"
                style={{
                  backdropFilter: 'blur(20px)',
                }}
              />

              {/* Crown Points */}
              <circle cx="80" cy="180" r="20" fill="url(#glassGradient)" stroke="url(#borderGradient)" strokeWidth="3" />
              <circle cx="120" cy="220" r="18" fill="url(#glassGradient)" stroke="url(#borderGradient)" strokeWidth="3" />
              <circle cx="200" cy="140" r="25" fill="url(#glassGradient)" stroke="url(#borderGradient)" strokeWidth="4" />
              <circle cx="280" cy="220" r="18" fill="url(#glassGradient)" stroke="url(#borderGradient)" strokeWidth="3" />
              <circle cx="320" cy="180" r="20" fill="url(#glassGradient)" stroke="url(#borderGradient)" strokeWidth="3" />

              {/* Crown Top Jewel */}
              <circle cx="200" cy="110" r="15" fill="#fbbf24" stroke="#d97706" strokeWidth="3">
                <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Inner Shine Effect */}
              <ellipse cx="200" cy="200" rx="120" ry="60" fill="rgba(255, 255, 255, 0.2)" opacity="0.6" />

              {/* Text: مزاد in Kufi Style */}
              <text
                x="200"
                y="235"
                textAnchor="middle"
                style={{
                  fontSize: '72px',
                  fontFamily: "'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Noto Kufi Arabic', serif",
                  fontWeight: 700,
                  fill: 'url(#borderGradient)',
                  letterSpacing: '0.08em',
                }}
              >
                مزاد
              </text>

              {/* Text Shadow Effect */}
              <text
                x="200"
                y="235"
                textAnchor="middle"
                style={{
                  fontSize: '72px',
                  fontFamily: "'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Noto Kufi Arabic', serif",
                  fontWeight: 700,
                  fill: 'none',
                  stroke: '#92400e',
                  strokeWidth: '1',
                  opacity: 0.3,
                  letterSpacing: '0.08em',
                }}
              >
                مزاد
              </text>
            </svg>

            {/* Decorative Sparkles */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-amber-400 rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `sparkle ${2 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
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
