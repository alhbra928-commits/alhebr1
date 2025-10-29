import React, { useState, useEffect } from 'react';
import { Sparkles, Crown, Leaf } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface RoyalGatewayProps {
  onEnter: () => void;
}

export function RoyalGateway({ onEnter }: RoyalGatewayProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'init' | 'reveal' | 'ready' | 'exit'>('init');
  const [settings, setSettings] = useState<any>(null);
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
        auto_enter_delay: 3,
        show_progress_bar: true,
        particle_density: 'medium',
        animation_speed: 'medium',
        welcome_text_ar: 'مرحباً بك في عالم الاستثمار الزراعي',
        subtitle_text_ar: 'تملك أشجار النخيل والزيتون',
        description_text_ar: 'استثمارك الآمن يبدأ الآن',
        theme_color: 'amber',
        show_crown: true,
        show_sparkles: true,
        show_particles: true,
        show_rings: true,
        show_geometric_pattern: true,
        show_shimmer_effect: true,
      });
    } catch (error) {
      console.error('Error loading gateway settings:', error);
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
    const timeline = setTimeout(() => setPhase('reveal'), 300);
    const readyTimer = setTimeout(() => setPhase('ready'), 1500);
    const exitTimer = settings.auto_enter_enabled ? setTimeout(() => {
      setPhase('exit');
      setTimeout(() => onEnter(), 800);
    }, delay) : null;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => {
      clearTimeout(timeline);
      clearTimeout(readyTimer);
      if (exitTimer) clearTimeout(exitTimer);
      clearInterval(progressInterval);
    };
  }, [settings, loading, onEnter]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-950 flex items-center justify-center">
        <div className="text-amber-200 text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!settings?.enabled) {
    return null;
  }

  const particleCount = settings.particle_density === 'low' ? 10 : settings.particle_density === 'high' ? 50 : 30;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden transition-all duration-800 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Advanced Animated Background */}
      <div className="absolute inset-0">
        {/* Base Gradient with Animation */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(217, 119, 6, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(245, 158, 11, 0.2) 0%, transparent 50%),
              linear-gradient(135deg, #1a0f0a 0%, #2d1810 25%, #1f1108 50%, #2d1810 75%, #1a0f0a 100%)
            `,
            backgroundSize: '200% 200%',
            animation: 'gradientFlow 8s ease infinite',
          }}
        />

        {/* Glowing Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full blur-3xl animate-float-slow"
              style={{
                width: `${200 + i * 50}px`,
                height: `${200 + i * 50}px`,
                background: `radial-gradient(circle, ${
                  i % 2 === 0 ? 'rgba(251, 191, 36, 0.15)' : 'rgba(245, 158, 11, 0.1)'
                } 0%, transparent 70%)`,
                left: `${20 + i * 15}%`,
                top: `${10 + i * 20}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${8 + i * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Geometric Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(30deg, #fbbf24 12%, transparent 12.5%, transparent 87%, #fbbf24 87.5%, #fbbf24),
              linear-gradient(150deg, #fbbf24 12%, transparent 12.5%, transparent 87%, #fbbf24 87.5%, #fbbf24),
              linear-gradient(30deg, #fbbf24 12%, transparent 12.5%, transparent 87%, #fbbf24 87.5%, #fbbf24),
              linear-gradient(150deg, #fbbf24 12%, transparent 12.5%, transparent 87%, #fbbf24 87.5%, #fbbf24)
            `,
            backgroundSize: '80px 140px',
            backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px',
          }}
        />

        {/* Shimmer Effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.3) 50%, transparent 100%)',
            transform: 'translateX(-100%)',
            animation: 'shimmer 3s infinite',
          }}
        />

        {/* Particle System */}
        {settings.show_particles && [...Array(particleCount)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-amber-400 rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Royal Emblem */}
        <div
          className={`transition-all duration-1000 ${
            phase === 'init'
              ? 'opacity-0 scale-50 -translate-y-20'
              : 'opacity-100 scale-100 translate-y-0'
          }`}
        >
          <div className="relative">
            {/* Rotating Rings */}
            {settings.show_rings && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="absolute w-48 h-48 rounded-full border-2 border-amber-500/20"
                  style={{
                    animation: 'rotate 20s linear infinite',
                  }}
                />
                <div
                  className="absolute w-40 h-40 rounded-full border-2 border-yellow-400/30"
                  style={{
                    animation: 'rotate-reverse 15s linear infinite',
                  }}
                />
                <div
                  className="absolute w-32 h-32 rounded-full border border-amber-300/40"
                  style={{
                    animation: 'rotate 10s linear infinite',
                  }}
                />
              </div>
            )}

            {/* Glowing Center */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-400/30 via-yellow-500/40 to-amber-600/30 rounded-full blur-2xl animate-pulse" />
              </div>

              {/* Emblem Container */}
              <div className="relative bg-gradient-to-br from-amber-900/40 via-yellow-900/30 to-amber-950/40 backdrop-blur-sm p-10 rounded-full border border-amber-500/30 shadow-2xl">
                <div className="flex flex-col items-center gap-3">
                  {/* Crown */}
                  {settings.show_crown && (
                    <div className="transform -translate-y-2">
                      <Crown className="w-12 h-12 text-amber-400 animate-pulse" strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Icons */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl animate-pulse" />
                      <span className="relative text-5xl drop-shadow-2xl">🌴</span>
                    </div>

                    <div className="w-1 h-8 bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />

                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse delay-500" />
                      <span className="relative text-5xl drop-shadow-2xl">🫒</span>
                    </div>
                  </div>

                  {/* Decorative Leaf */}
                  <div className="transform translate-y-1">
                    <Leaf className="w-8 h-8 text-amber-500/60" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sparkles */}
            {settings.show_sparkles && (
              <>
                <div className="absolute -top-8 -right-8 animate-bounce-slow">
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                </div>
                <div className="absolute -bottom-8 -left-8 animate-bounce-slow delay-700">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Welcome Text */}
        <div
          className={`mt-16 text-center transition-all duration-1000 delay-300 ${
            phase === 'init'
              ? 'opacity-0 translate-y-10'
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="relative">
            {/* Text Glow */}
            <div className="absolute inset-0 blur-xl opacity-50">
              <h1 className="text-4xl md:text-6xl font-black text-amber-400">
                {settings.welcome_text_ar}
              </h1>
            </div>

            {/* Main Text */}
            <h1 className="relative text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent animate-shimmer-text">
              {settings.welcome_text_ar}
            </h1>
          </div>

          <div className="space-y-3 mt-6">
            <p className="text-xl md:text-2xl text-amber-100/90 font-bold flex items-center justify-center gap-3">
              <span className="w-8 h-0.5 bg-gradient-to-r from-transparent to-amber-400/50" />
              <span>{settings.subtitle_text_ar}</span>
              <span className="w-8 h-0.5 bg-gradient-to-l from-transparent to-amber-400/50" />
            </p>
            <p className="text-lg text-yellow-200/70 font-medium">
              {settings.description_text_ar}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {settings.show_progress_bar && (
          <div
            className={`mt-16 transition-all duration-700 delay-500 ${
              phase === 'init'
                ? 'opacity-0 scale-95'
                : 'opacity-100 scale-100'
            }`}
          >
            <div className="w-64 md:w-96">
            {/* Progress Label */}
            <div className="flex items-center justify-between mb-3 text-sm text-amber-200/70 font-medium">
              <span>جاري التحميل</span>
              <span>{Math.round(progress)}%</span>
            </div>

            {/* Progress Track */}
            <div className="relative h-1.5 bg-amber-950/50 rounded-full overflow-hidden backdrop-blur-sm border border-amber-500/20">
              {/* Progress Fill */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-full transition-all duration-300 shadow-lg shadow-amber-500/50"
                style={{
                  width: `${progress}%`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer-progress 2s infinite',
                }}
              />

              {/* Progress Glow */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full blur-md opacity-60"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Loading Dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Status Text */}
        <div
          className={`mt-8 transition-all duration-500 ${
            phase === 'ready'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span>جاهز للدخول</span>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      {/* CSS Animations */}
      <style>{`
        @keyframes gradientFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.3;
          }
          50% {
            transform: translate(30px, -30px);
            opacity: 0.6;
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes shimmer-text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer-progress {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes particle {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1);
            opacity: 0;
          }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotate-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float-slow {
          animation: float-slow ease-in-out infinite;
        }

        .animate-shimmer-text {
          background-size: 200% 100%;
          animation: shimmer-text 3s linear infinite;
        }

        .animate-particle {
          animation: particle linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
}
