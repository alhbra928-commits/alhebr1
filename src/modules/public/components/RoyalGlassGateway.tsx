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
        <div className="mb-8 animate-bounce-slow">
          <Crown className="w-16 h-16 text-amber-600" strokeWidth={1.5} />
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
            <div className="flex items-center justify-center gap-8 mb-8">
              {/* Palm Tree */}
              <div className="relative group">
                <div className="absolute inset-0 bg-green-400/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500" />
                <Palmtree
                  className="relative w-20 h-20 sm:w-24 sm:h-24 text-green-700 group-hover:scale-110 transition-transform duration-300"
                  strokeWidth={1.5}
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(34, 197, 94, 0.3))',
                    animation: 'sway 3s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Divider */}
              <div className="h-24 w-px bg-gradient-to-b from-transparent via-amber-400 to-transparent" />

              {/* Olive Tree */}
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500" />
                <Leaf
                  className="relative w-20 h-20 sm:w-24 sm:h-24 text-emerald-700 group-hover:scale-110 transition-transform duration-300"
                  strokeWidth={1.5}
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))',
                    animation: 'sway 3s ease-in-out infinite 0.5s',
                  }}
                />
              </div>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 bg-clip-text text-transparent">
                {settings.welcome_text_ar}
              </h1>

              <p className="text-xl sm:text-2xl text-amber-800/90 font-semibold mb-3">
                {settings.subtitle_text_ar}
              </p>

              <p className="text-base sm:text-lg text-amber-700/80">
                {settings.description_text_ar}
              </p>
            </div>

            {/* Progress Bar */}
            {settings.auto_enter_enabled && (
              <div className="mb-6">
                <div className="relative h-2 bg-amber-200/50 rounded-full overflow-hidden backdrop-blur-sm border border-amber-300/30">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm text-amber-700/70">
                  <span>جاري الدخول...</span>
                  <span className="font-mono">{Math.round(progress)}%</span>
                </div>
              </div>
            )}

            {/* Enter Button */}
            <button
              onClick={onEnter}
              className="group relative w-full py-4 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105"
            >
              {/* Button Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 opacity-90 group-hover:opacity-100 transition-opacity" />

              {/* Button Content */}
              <div className="relative flex items-center justify-center gap-3 text-amber-900">
                <span className="text-xl font-bold">دخول المنصة</span>
                <ArrowLeft className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
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
          <p className="text-sm text-amber-700/60 font-medium">
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
