import React, { useState, useEffect } from 'react';
import { Leaf, Sparkles, ArrowRight, Sprout, TreePine, Droplets, Sun, Wind } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { AdminCrownButton } from './AdminCrownButton';

interface GatewayProps {
  onEnter: () => void;
  onAdminLogin?: () => void;
  onFarmOwnerLogin?: () => void;
}

interface GatewaySettings {
  enabled: boolean;
  auto_enter_enabled: boolean;
  auto_enter_delay: number;
  main_title: string;
  subtitle: string;
  button_text: string;
  enable_repeated_gateway: boolean;
  gateway_reappear_duration: number;
  show_logo: boolean;
  theme_style: string;
}

export function RevolutionaryGreenGateway({ onEnter, onAdminLogin, onFarmOwnerLogin }: GatewayProps) {
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    loadSettings();
    generateParticles();
  }, []);

  useEffect(() => {
    // تحسين الأداء: throttle للـ mousemove
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const generateParticles = () => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  };

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
        main_title: 'مرحباً بكم في عالم الاستثمار الأخضر',
        subtitle: 'منصة التطوير الزراعي المتقدمة',
        button_text: 'ادخل إلى المنصة',
        enable_repeated_gateway: false,
        gateway_reappear_duration: 1800,
        show_logo: true,
        theme_style: 'green',
      });
    } catch (error) {
      console.error('Error loading gateway settings:', error);
      setSettings({
        enabled: true,
        auto_enter_enabled: true,
        auto_enter_delay: 5,
        main_title: 'مرحباً بكم في عالم الاستثمار الأخضر',
        subtitle: 'منصة التطوير الزراعي المتقدمة',
        button_text: 'ادخل إلى المنصة',
        enable_repeated_gateway: false,
        gateway_reappear_duration: 1800,
        show_logo: true,
        theme_style: 'green',
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)'
        }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-emerald-400/20"
              style={{
                width: Math.random() * 100 + 50 + 'px',
                height: Math.random() * 100 + 50 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: Math.random() * 2 + 's'
              }}
            />
          ))}
        </div>

        {/* Logo and text */}
        <div className="relative z-10 text-center px-6">
          <div className="text-8xl mb-6 animate-bounce">👑</div>
          <div
            className="text-4xl font-black mb-3"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            منصة النخيل والزيتون
          </div>
          <div className="text-emerald-300 text-lg font-semibold mb-8">
            استثمار راقٍ يثمر خيرًا
          </div>
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-emerald-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-20px) translateX(10px); }
          }
        `}</style>
      </div>
    );
  }

  if (!settings?.enabled) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100"
      style={{
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
          linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #a7f3d0 50%, #6ee7b7 75%, #34d399 100%)
        `,
        willChange: 'background',
        transform: 'translateZ(0)',
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(30deg, #10b981 12%, transparent 12.5%, transparent 87%, #10b981 87.5%, #10b981),
            linear-gradient(150deg, #10b981 12%, transparent 12.5%, transparent 87%, #10b981 87.5%, #10b981),
            linear-gradient(30deg, #10b981 12%, transparent 12.5%, transparent 87%, #10b981 87.5%, #10b981),
            linear-gradient(150deg, #10b981 12%, transparent 12.5%, transparent 87%, #10b981 87.5%, #10b981),
            linear-gradient(60deg, #059669 25%, transparent 25.5%, transparent 75%, #059669 75%, #059669),
            linear-gradient(60deg, #059669 25%, transparent 25.5%, transparent 75%, #059669 75%, #059669)
          `,
          backgroundSize: '80px 140px',
          backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px',
          animation: 'slide 20s linear infinite'
        }}></div>
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-emerald-400/40 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `float ${8 + particle.delay}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Decorative Elements */}
      <div className="absolute top-10 sm:top-20 left-4 sm:left-20 opacity-10">
        <TreePine className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 text-emerald-600 animate-pulse" style={{ animationDuration: '4s' }} />
      </div>
      <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-20 opacity-10">
        <Leaf className="w-28 h-28 sm:w-40 sm:h-40 md:w-56 md:h-56 text-teal-600 animate-pulse" style={{ animationDuration: '5s' }} />
      </div>
      <div className="absolute top-1/2 left-2 sm:left-10 opacity-10">
        <Sprout className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 text-green-600 animate-bounce" style={{ animationDuration: '6s' }} />
      </div>

      {/* Main Content Container */}
      <div className="relative h-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* Glass Morphism Card */}
        <div
          className="relative max-w-4xl w-full my-auto"
          style={{
            animation: 'scaleIn 0.8s ease-out'
          }}
        >
          {/* Main Glass Card */}
          <div
            className="relative backdrop-blur-2xl bg-white/30 rounded-2xl sm:rounded-3xl md:rounded-[3rem] p-6 sm:p-8 md:p-10 lg:p-12 shadow-[0_8px_32px_0_rgba(16,185,129,0.37)] border border-white/40"
            style={{
              boxShadow: `
                0 8px 32px 0 rgba(16, 185, 129, 0.37),
                inset 0 0 80px rgba(255, 255, 255, 0.5)
              `
            }}
          >
            {/* Animated Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 rounded-[3rem] blur-xl opacity-40 animate-pulse"></div>

            {/* Content */}
            <div className="relative">
              {/* Logo/Icon Area */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="relative scale-75 sm:scale-90 md:scale-100">
                  {/* Rotating Ring */}
                  <div className="absolute inset-0 rounded-full border-2 sm:border-3 md:border-4 border-emerald-400/30 animate-spin" style={{ animationDuration: '8s' }}></div>
                  <div className="absolute inset-2 rounded-full border-2 sm:border-3 md:border-4 border-teal-400/30 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>

                  {/* Center Icon */}
                  <div className="relative bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 p-5 sm:p-6 md:p-8 rounded-full shadow-2xl">
                    <Leaf className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white" strokeWidth={2.5} />
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-br from-yellow-400 to-amber-500 p-1.5 sm:p-2 rounded-full animate-bounce">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  </div>

                  {/* Orbiting Icons */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mt-2 sm:mt-4">
                    <div className="bg-emerald-100/80 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg animate-bounce" style={{ animationDuration: '2s', animationDelay: '0s' }}>
                      <Sun className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2">
                    <div className="bg-teal-100/80 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.3s' }}>
                      <Droplets className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-teal-600" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2">
                    <div className="bg-green-100/80 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.6s' }}>
                      <Wind className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Welcome Text */}
              <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-10 px-4">
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 bg-clip-text text-transparent leading-snug sm:leading-tight break-words"
                  style={{
                    animation: 'fadeInUp 0.8s ease-out 0.2s both',
                    textShadow: '0 2px 20px rgba(16, 185, 129, 0.3)',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}
                >
                  {settings.main_title}
                </h1>

                {settings.subtitle && (
                  <p
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-emerald-800/90 break-words px-2"
                    style={{
                      animation: 'fadeInUp 0.8s ease-out 0.4s both',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {settings.subtitle}
                  </p>
                )}

                <p
                  className="text-base sm:text-lg md:text-xl text-emerald-700/80 max-w-2xl mx-auto break-words px-2"
                  style={{
                    animation: 'fadeInUp 0.8s ease-out 0.6s both',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  استثمارك الآمن يبدأ الآن
                </p>
              </div>

              {/* Features Pills */}
              <div
                className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 md:mb-10 px-2"
                style={{
                  animation: 'fadeInUp 0.8s ease-out 0.8s both'
                }}
              >
                {[
                  { icon: TreePine, text: 'تكنولوجيا متقدمة' },
                  { icon: Sprout, text: 'استثمار مستدام' },
                  { icon: Leaf, text: 'بيئة صحية' },
                  { icon: Droplets, text: 'ري ذكي' },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group bg-white/40 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-full border border-emerald-300/50 hover:bg-white/60 hover:border-emerald-400 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
                      <span className="text-emerald-800 font-semibold text-xs sm:text-sm">{feature.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enter Button */}
              <div
                className="flex justify-center mb-6 sm:mb-8 px-4"
                style={{
                  animation: 'fadeInUp 0.8s ease-out 1s both'
                }}
              >
                <button
                  onClick={onEnter}
                  className="group relative w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 md:px-12 md:py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg md:text-xl shadow-[0_8px_32px_0_rgba(16,185,129,0.5)] hover:shadow-[0_12px_48px_0_rgba(16,185,129,0.6)] transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                  <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                    <span>{settings.button_text || 'ادخل إلى المنصة'}</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Progress Bar */}
              {settings.auto_enter_enabled && (
                <div
                  className="space-y-2 sm:space-y-3 px-4"
                  style={{
                    animation: 'fadeInUp 0.8s ease-out 1.2s both'
                  }}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-emerald-600 text-xs sm:text-sm">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                    <span>الدخول التلقائي خلال {settings.auto_enter_delay} ثوانٍ</span>
                  </div>

                  <div className="relative h-1.5 sm:h-2 bg-white/40 backdrop-blur-sm rounded-full overflow-hidden shadow-inner max-w-md mx-auto">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-full transition-all duration-100 ease-linear shadow-lg"
                      style={{
                        width: `${progress}%`,
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute -top-6 -right-6 bg-gradient-to-br from-emerald-400 to-green-500 text-white px-6 py-3 rounded-full shadow-2xl animate-float">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm">تصميم ثوري</span>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-teal-400 to-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              <span className="font-bold text-sm">صديق للبيئة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes slide {
          0% {
            background-position: 0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px;
          }
          100% {
            background-position: 80px 140px, 80px 140px, 120px 210px, 120px 210px, 80px 140px, 120px 210px;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Admin Crown Button */}
      <AdminCrownButton
        onAdminLogin={onAdminLogin}
        onFarmOwnerLogin={onFarmOwnerLogin}
      />
    </div>
  );
}
