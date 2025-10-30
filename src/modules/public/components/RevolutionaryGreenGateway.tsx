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
  welcome_text_ar: string;
  subtitle_text_ar: string;
  description_text_ar: string;
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
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
        welcome_text_ar: 'مرحباً بكم في عالم الاستثمار الأخضر',
        subtitle_text_ar: 'منصة التطوير الزراعي المتقدمة',
        description_text_ar: 'تكنولوجيا زراعية حديثة لمستقبل مستدام',
      });
    } catch (error) {
      console.error('Error loading gateway settings:', error);
      setSettings({
        enabled: true,
        auto_enter_enabled: true,
        auto_enter_delay: 5,
        welcome_text_ar: 'مرحباً بكم في عالم الاستثمار الأخضر',
        subtitle_text_ar: 'منصة التطوير الزراعي المتقدمة',
        description_text_ar: 'تكنولوجيا زراعية حديثة لمستقبل مستدام',
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
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-emerald-700 text-xl font-bold animate-pulse">جاري التحميل...</div>
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
        `
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
      <div className="absolute top-20 left-20 opacity-10">
        <TreePine className="w-64 h-64 text-emerald-600 animate-pulse" style={{ animationDuration: '4s' }} />
      </div>
      <div className="absolute bottom-20 right-20 opacity-10">
        <Leaf className="w-56 h-56 text-teal-600 animate-pulse" style={{ animationDuration: '5s' }} />
      </div>
      <div className="absolute top-1/2 left-10 opacity-10">
        <Sprout className="w-40 h-40 text-green-600 animate-bounce" style={{ animationDuration: '6s' }} />
      </div>

      {/* Main Content Container */}
      <div className="relative h-full flex items-center justify-center p-8">
        {/* Glass Morphism Card */}
        <div
          className="relative max-w-4xl w-full"
          style={{
            animation: 'scaleIn 0.8s ease-out'
          }}
        >
          {/* Main Glass Card */}
          <div
            className="relative backdrop-blur-2xl bg-white/30 rounded-[3rem] p-12 shadow-[0_8px_32px_0_rgba(16,185,129,0.37)] border border-white/40"
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
              <div className="flex justify-center mb-8">
                <div className="relative">
                  {/* Rotating Ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-400/30 animate-spin" style={{ animationDuration: '8s' }}></div>
                  <div className="absolute inset-2 rounded-full border-4 border-teal-400/30 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>

                  {/* Center Icon */}
                  <div className="relative bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 p-8 rounded-full shadow-2xl">
                    <Leaf className="w-20 h-20 text-white" strokeWidth={2.5} />
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-full animate-bounce">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Orbiting Icons */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mt-4">
                    <div className="bg-emerald-100/80 backdrop-blur-sm p-3 rounded-full shadow-lg animate-bounce" style={{ animationDuration: '2s', animationDelay: '0s' }}>
                      <Sun className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2">
                    <div className="bg-teal-100/80 backdrop-blur-sm p-3 rounded-full shadow-lg animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.3s' }}>
                      <Droplets className="w-6 h-6 text-teal-600" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2">
                    <div className="bg-green-100/80 backdrop-blur-sm p-3 rounded-full shadow-lg animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.6s' }}>
                      <Wind className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Welcome Text */}
              <div className="text-center space-y-6 mb-10">
                <h1
                  className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 bg-clip-text text-transparent leading-tight"
                  style={{
                    animation: 'fadeInUp 0.8s ease-out 0.2s both',
                    textShadow: '0 2px 20px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {settings.welcome_text_ar}
                </h1>

                <p
                  className="text-2xl md:text-3xl font-semibold text-emerald-800/90"
                  style={{
                    animation: 'fadeInUp 0.8s ease-out 0.4s both'
                  }}
                >
                  {settings.subtitle_text_ar}
                </p>

                <p
                  className="text-lg md:text-xl text-emerald-700/80 max-w-2xl mx-auto"
                  style={{
                    animation: 'fadeInUp 0.8s ease-out 0.6s both'
                  }}
                >
                  {settings.description_text_ar}
                </p>
              </div>

              {/* Features Pills */}
              <div
                className="flex flex-wrap justify-center gap-3 mb-10"
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
                    className="group bg-white/40 backdrop-blur-sm px-6 py-3 rounded-full border border-emerald-300/50 hover:bg-white/60 hover:border-emerald-400 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <feature.icon className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
                      <span className="text-emerald-800 font-semibold text-sm">{feature.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enter Button */}
              <div
                className="flex justify-center mb-8"
                style={{
                  animation: 'fadeInUp 0.8s ease-out 1s both'
                }}
              >
                <button
                  onClick={onEnter}
                  className="group relative px-12 py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-2xl font-bold text-xl shadow-[0_8px_32px_0_rgba(16,185,129,0.5)] hover:shadow-[0_12px_48px_0_rgba(16,185,129,0.6)] transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                  <div className="relative flex items-center gap-3">
                    <span>ادخل إلى المنصة</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Progress Bar */}
              {settings.auto_enter_enabled && (
                <div
                  className="space-y-3"
                  style={{
                    animation: 'fadeInUp 0.8s ease-out 1.2s both'
                  }}
                >
                  <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>الدخول التلقائي خلال {settings.auto_enter_delay} ثوانٍ</span>
                  </div>

                  <div className="relative h-2 bg-white/40 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
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
