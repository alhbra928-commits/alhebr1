import React, { useState, useEffect } from 'react';
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

      {/* Main Content - Simple & Elegant */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">

        {/* 3D Circle with MZAD Text */}
        <div
          className="relative mb-6 sm:mb-8 cursor-pointer"
          onClick={onEnter}
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Outer Glow Ring */}
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(217, 119, 6, 0.3), transparent)',
              filter: 'blur(30px)',
              transform: 'translateZ(-20px)',
            }}
          />

          {/* 3D Circle */}
          <div
            className="relative group transition-all duration-500 hover:scale-110 active:scale-95"
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #f59e0b, #d97706)',
              boxShadow: `
                0 20px 60px rgba(217, 119, 6, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.3),
                inset 0 -10px 30px rgba(180, 83, 9, 0.5)
              `,
              transform: 'rotateX(10deg) rotateY(-10deg)',
              transformStyle: 'preserve-3d',
              animation: 'rotate3d 8s ease-in-out infinite',
            }}
          >
            {/* Inner Shine */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 60%)',
                transform: 'translateZ(5px)',
              }}
            />

            {/* MZAD Arabic Text - Ultra Professional */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: 'translateZ(20px)',
              }}
            >
              <span
                className="font-black select-none"
                style={{
                  fontSize: '56px',
                  fontFamily: "'Tajawal', 'Cairo', sans-serif",
                  background: 'linear-gradient(180deg, #ffffff 0%, #fef3c7 50%, #fbbf24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: `
                    0 2px 10px rgba(0, 0, 0, 0.3),
                    0 0 30px rgba(251, 191, 36, 0.5)
                  `,
                  letterSpacing: '0.05em',
                  fontWeight: 900,
                  lineHeight: 1,
                  transform: 'translateY(-5px)',
                }}
              >
                مزاد
              </span>
            </div>

            {/* Circle Border Effect */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: '3px solid rgba(255, 255, 255, 0.2)',
                transform: 'translateZ(10px)',
              }}
            />

            {/* Rotating Border Effect */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                animation: 'spin 4s linear infinite',
              }}
            />
          </div>
        </div>

        {/* MZAD English - 3D Small Text */}
        <div
          className="relative mb-8 sm:mb-12"
          style={{
            perspective: '500px',
            transformStyle: 'preserve-3d',
          }}
        >
          <h2
            className="font-black tracking-[0.3em] select-none"
            style={{
              fontSize: '18px',
              fontFamily: "'Poppins', sans-serif",
              background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 4px 8px rgba(217, 119, 6, 0.3)',
              transform: 'translateZ(10px) rotateX(5deg)',
              letterSpacing: '0.3em',
              fontWeight: 900,
            }}
          >
            MZAD
          </h2>
        </div>

        {/* Progress Bar - Minimal */}
        {settings.auto_enter_enabled && (
          <div className="w-48 sm:w-64">
            <div className="relative h-1 bg-amber-200/40 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
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

        @keyframes rotate3d {
          0%, 100% {
            transform: rotateX(10deg) rotateY(-10deg);
          }
          25% {
            transform: rotateX(15deg) rotateY(5deg);
          }
          50% {
            transform: rotateX(10deg) rotateY(10deg);
          }
          75% {
            transform: rotateX(5deg) rotateY(-5deg);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
