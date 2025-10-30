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

        {/* Ultra Modern 3D Circle - Same Style as Concept Button */}
        <div className="relative mb-6 sm:mb-8 cursor-pointer group" onClick={onEnter}>
          {/* Outer Glow Ring - Enhanced */}
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4), transparent)',
              filter: 'blur(40px)',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* 3D Circle - Exact Copy of Concept Button Style */}
          <div
            className="relative transition-all duration-500 hover:scale-110 active:scale-95"
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4AF37 0%, #F8E45F 25%, #B8960A 50%, #8B7500 75%, #6B5D00 100%)',
              border: '4px solid rgba(212, 175, 55, 0.6)',
              boxShadow: `
                0 12px 48px rgba(212, 175, 55, 0.5),
                0 8px 32px rgba(212, 175, 55, 0.4),
                0 4px 16px rgba(212, 175, 55, 0.3),
                inset 0 2px 4px rgba(255, 255, 255, 0.3),
                inset 0 -2px 4px rgba(0, 0, 0, 0.2)
              `,
            }}
          >
            {/* Shimmer Effect - Same as Concept Button */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s linear infinite',
              }}
            />

            {/* Inner Glow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 60%)',
              }}
            />

            {/* MZAD Arabic Text - Ultra Modern & Bigger */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-black select-none"
                style={{
                  fontSize: '92px',
                  fontFamily: "'Tajawal', 'Cairo', sans-serif",
                  color: '#ffffff',
                  textShadow: `
                    0 4px 8px rgba(0, 0, 0, 0.4),
                    0 2px 4px rgba(0, 0, 0, 0.3),
                    0 0 20px rgba(212, 175, 55, 0.6),
                    0 0 40px rgba(212, 175, 55, 0.3)
                  `,
                  letterSpacing: '0.08em',
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                مزاد
              </span>
            </div>
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

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
