import React, { useState, useEffect } from 'react';
import { Sparkles, Crown, ChevronDown, Leaf } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface RoyalGatewayProps {
  onEnter: () => void;
}

interface GatewaySettings {
  enabled: boolean;
  auto_enter_enabled: boolean;
  auto_enter_delay: number;
  welcome_text_ar: string;
  subtitle_text_ar: string;
  description_text_ar: string;
  show_particles: boolean;
  particle_density: 'low' | 'medium' | 'high';
  show_animated_bg: boolean;
  show_crown: boolean;
  show_progress_bar: boolean;
  animation_speed: 'slow' | 'medium' | 'fast';
}

export function LuxuryRoyalGateway({ onEnter }: RoyalGatewayProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'init' | 'reveal' | 'ready' | 'exit'>('init');
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [loading, setLoading] = useState(true);

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
        auto_enter_delay: 4,
        welcome_text_ar: 'مرحباً بك في منصة الاستثمار الزراعي',
        subtitle_text_ar: 'استثمر في أشجار النخيل والزيتون',
        description_text_ar: 'رحلتك نحو الاستثمار الآمن تبدأ هنا',
        show_particles: true,
        particle_density: 'medium',
        show_animated_bg: true,
        show_crown: true,
        show_progress_bar: true,
        animation_speed: 'medium',
      });
    } catch (error) {
      console.error('Error loading gateway settings:', error);
      setSettings({
        enabled: true,
        auto_enter_enabled: true,
        auto_enter_delay: 4,
        welcome_text_ar: 'مرحباً بك في منصة الاستثمار الزراعي',
        subtitle_text_ar: 'استثمر في أشجار النخيل والزيتون',
        description_text_ar: 'رحلتك نحو الاستثمار الآمن تبدأ هنا',
        show_particles: true,
        particle_density: 'medium',
        show_animated_bg: true,
        show_crown: true,
        show_progress_bar: true,
        animation_speed: 'medium',
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
    const revealTimer = setTimeout(() => setPhase('reveal'), 400);
    const readyTimer = setTimeout(() => setPhase('ready'), 1800);

    const exitTimer = settings.auto_enter_enabled
      ? setTimeout(() => {
          setPhase('exit');
          setTimeout(() => onEnter(), 1000);
        }, delay)
      : null;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (delay / 50));
      });
    }, 50);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(readyTimer);
      if (exitTimer) clearTimeout(exitTimer);
      clearInterval(progressInterval);
    };
  }, [settings, loading, onEnter]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0a0806] via-[#1a1510] to-[#0a0806] flex items-center justify-center">
        <div className="text-[#C89B3C] text-xl font-bold animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  if (!settings?.enabled) {
    return null;
  }

  const particleCount = settings.particle_density === 'low' ? 15 : settings.particle_density === 'high' ? 60 : 35;
  const animSpeed = settings.animation_speed === 'slow' ? 1.5 : settings.animation_speed === 'fast' ? 0.7 : 1;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden transition-all duration-1000 ${
        phase === 'exit' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* خلفية فاخرة متحركة */}
      <div className="absolute inset-0">
        {/* Base Gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 30% 40%, rgba(200, 155, 60, 0.08) 0%, transparent 60%),
              radial-gradient(circle at 70% 60%, rgba(61, 91, 75, 0.06) 0%, transparent 60%),
              linear-gradient(135deg, #0a0806 0%, #1a1510 30%, #0f0c08 60%, #1a1510 90%, #0a0806 100%)
            `,
            backgroundSize: '200% 200%',
            animation: `gradientShift ${12 * animSpeed}s ease infinite`,
          }}
        />

        {/* Animated Orbs */}
        {settings.show_animated_bg && (
          <div className="absolute inset-0 overflow-hidden opacity-40">
            {[...Array(4)].map((_, i) => (
              <div
                key={`orb-${i}`}
                className="absolute rounded-full blur-3xl"
                style={{
                  width: `${250 + i * 100}px`,
                  height: `${250 + i * 100}px`,
                  background: `radial-gradient(circle, ${
                    i % 2 === 0 ? 'rgba(200, 155, 60, 0.15)' : 'rgba(61, 91, 75, 0.12)'
                  } 0%, transparent 70%)`,
                  left: `${15 + i * 20}%`,
                  top: `${20 + i * 15}%`,
                  animation: `float ${(10 + i * 3) * animSpeed}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(200, 155, 60, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(200, 155, 60, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Shimmer Wave */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.4) 50%, transparent 100%)',
            animation: `shimmerWave ${4 * animSpeed}s ease-in-out infinite`,
          }}
        />

        {/* Particle System */}
        {settings.show_particles && (
          <div className="absolute inset-0">
            {[...Array(particleCount)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${2 + Math.random() * 3}px`,
                  height: `${2 + Math.random() * 3}px`,
                  background: i % 3 === 0 ? '#C89B3C' : i % 3 === 1 ? '#D4AF37' : '#3D5B4B',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.3 + Math.random() * 0.4,
                  animation: `particleFloat ${(8 + Math.random() * 8) * animSpeed}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                  boxShadow: '0 0 10px currentColor',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">

        {/* Royal Emblem */}
        <div
          className={`transition-all duration-1000 ${
            phase === 'init'
              ? 'opacity-0 scale-50 -translate-y-32 rotate-12'
              : 'opacity-100 scale-100 translate-y-0 rotate-0'
          }`}
        >
          <div className="relative">
            {/* Rotating Halo Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="absolute w-56 h-56 rounded-full border border-[#C89B3C]/30"
                style={{
                  animation: `spin ${25 * animSpeed}s linear infinite`,
                  boxShadow: '0 0 30px rgba(200, 155, 60, 0.2)',
                }}
              />
              <div
                className="absolute w-48 h-48 rounded-full border-2 border-[#D4AF37]/25"
                style={{
                  animation: `spinReverse ${20 * animSpeed}s linear infinite`,
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.15)',
                }}
              />
              <div
                className="absolute w-40 h-40 rounded-full border border-[#3D5B4B]/20"
                style={{
                  animation: `spin ${15 * animSpeed}s linear infinite`,
                }}
              />
            </div>

            {/* Central Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-40 h-40 rounded-full blur-3xl animate-pulse"
                style={{
                  background: 'radial-gradient(circle, rgba(200, 155, 60, 0.3) 0%, rgba(61, 91, 75, 0.2) 50%, transparent 70%)',
                }}
              />
            </div>

            {/* Main Emblem Container */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#2C2C2C]/70 via-[#3D5B4B]/50 to-[#2C2C2C]/70 backdrop-blur-xl p-12 rounded-full border-2 border-[#C89B3C]/40 shadow-2xl">
                <div className="flex flex-col items-center gap-4">

                  {/* Crown Icon */}
                  {settings.show_crown && (
                    <div className="transform -translate-y-3 animate-bounce" style={{ animationDuration: `${3 * animSpeed}s` }}>
                      <Crown className="w-14 h-14 text-[#C89B3C] drop-shadow-2xl" strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Tree Icons */}
                  <div className="flex items-center gap-8">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-[#C89B3C]/20 rounded-full blur-2xl animate-pulse" />
                      <span className="relative text-6xl drop-shadow-2xl transition-transform group-hover:scale-110">🌴</span>
                    </div>

                    <div className="w-1 h-12 bg-gradient-to-b from-transparent via-[#C89B3C]/60 to-transparent" />

                    <div className="relative group">
                      <div className="absolute inset-0 bg-[#3D5B4B]/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                      <span className="relative text-6xl drop-shadow-2xl transition-transform group-hover:scale-110">🫒</span>
                    </div>
                  </div>

                  {/* Leaf Decoration */}
                  <div className="transform translate-y-2 opacity-70">
                    <Leaf className="w-10 h-10 text-[#3D5B4B]" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Sparkles */}
            <div className="absolute -top-10 -right-10 animate-bounce" style={{ animationDuration: `${2.5 * animSpeed}s` }}>
              <Sparkles className="w-9 h-9 text-[#D4AF37]" />
            </div>
            <div className="absolute -bottom-10 -left-10 animate-bounce" style={{ animationDuration: `${2.5 * animSpeed}s`, animationDelay: '0.5s' }}>
              <Sparkles className="w-9 h-9 text-[#C89B3C]" />
            </div>
            <div className="absolute top-0 left-20 animate-bounce" style={{ animationDuration: `${2.5 * animSpeed}s`, animationDelay: '1s' }}>
              <Sparkles className="w-7 h-7 text-[#E8E1D3]" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div
          className={`mt-20 text-center max-w-3xl transition-all duration-1000 delay-300 ${
            phase === 'init'
              ? 'opacity-0 translate-y-16'
              : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Main Title */}
          <div className="relative mb-8">
            {/* Glow Effect */}
            <div className="absolute inset-0 blur-2xl opacity-60">
              <h1 className="text-5xl md:text-7xl font-black text-[#C89B3C]">
                {settings.welcome_text_ar}
              </h1>
            </div>

            {/* Actual Text */}
            <h1
              className="relative text-5xl md:text-7xl font-black bg-gradient-to-r from-[#E8E1D3] via-[#D4AF37] to-[#E8E1D3] bg-clip-text text-transparent"
              style={{
                backgroundSize: '200% 100%',
                animation: `shimmerText ${3 * animSpeed}s linear infinite`,
              }}
            >
              {settings.welcome_text_ar}
            </h1>
          </div>

          {/* Subtitle */}
          <div className="space-y-4">
            <p className="text-2xl md:text-3xl text-[#F4EBDD] font-bold flex items-center justify-center gap-4 flex-wrap">
              <span className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#C89B3C]" />
              <span>{settings.subtitle_text_ar}</span>
              <span className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#C89B3C]" />
            </p>
            <p className="text-lg md:text-xl text-[#E8E1D3]/80 font-medium">
              {settings.description_text_ar}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {settings.show_progress_bar && (
          <div
            className={`mt-20 transition-all duration-700 delay-500 ${
              phase === 'init'
                ? 'opacity-0 scale-90'
                : 'opacity-100 scale-100'
            }`}
          >
            <div className="w-80 md:w-[32rem]">
              {/* Progress Label */}
              <div className="flex items-center justify-between mb-4 text-sm text-[#C89B3C] font-bold">
                <span>جاري تحضير التجربة</span>
                <span className="tabular-nums">{Math.round(progress)}%</span>
              </div>

              {/* Progress Track */}
              <div className="relative h-2 bg-[#2C2C2C]/60 rounded-full overflow-hidden border border-[#C89B3C]/30 shadow-inner">
                {/* Progress Fill */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #C89B3C 0%, #D4AF37 50%, #C89B3C 100%)',
                    backgroundSize: '200% 100%',
                    animation: `shimmerProgress ${2 * animSpeed}s linear infinite`,
                    boxShadow: '0 0 20px rgba(200, 155, 60, 0.6)',
                  }}
                />

                {/* Progress Glow */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full blur-sm opacity-70"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #C89B3C 0%, #D4AF37 100%)',
                  }}
                />
              </div>

              {/* Loading Dots */}
              <div className="flex items-center justify-center gap-2 mt-5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#C89B3C]/70 animate-bounce"
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: `${1 * animSpeed}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ready Status */}
        <div
          className={`mt-12 transition-all duration-500 ${
            phase === 'ready'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex items-center gap-3 px-8 py-4 rounded-full bg-[#3D5B4B]/30 backdrop-blur-sm border border-[#3D5B4B]/50">
            <div className="w-3 h-3 bg-[#3D5B4B] rounded-full animate-pulse shadow-lg shadow-[#3D5B4B]/50" />
            <span className="text-[#F4EBDD] font-bold text-lg">جاهز للدخول</span>
            <div className="w-3 h-3 bg-[#3D5B4B] rounded-full animate-pulse shadow-lg shadow-[#3D5B4B]/50" />
          </div>
        </div>

        {/* Manual Enter Button */}
        {!settings.auto_enter_enabled && phase === 'ready' && (
          <div className="mt-8">
            <button
              onClick={onEnter}
              className="group px-10 py-5 bg-gradient-to-r from-[#3D5B4B] to-[#4A6F5C] text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-[#3D5B4B]/50 transition-all hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-3">
                <span>دخول المنصة</span>
                <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      {/* Animations */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translate(40px, -40px) scale(1.1);
            opacity: 0.7;
          }
        }

        @keyframes shimmerWave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes shimmerText {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmerProgress {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(0) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh) translateX(${Math.random() * 100 - 50}px) scale(1);
            opacity: 0;
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
