import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';

interface MazadGatewayProps {
  onEnter: () => void;
}

interface GatewaySettings {
  enabled: boolean;
  auto_enter_enabled: boolean;
  auto_enter_delay: number;
  show_logo: boolean;
}

export function MazadGateway({ onEnter }: MazadGatewayProps) {
  const [settings, setSettings] = useState<GatewaySettings>({
    enabled: true,
    auto_enter_enabled: true,
    auto_enter_delay: 3,
    show_logo: true,
  });
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // تحميل الإعدادات من قاعدة البيانات
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { supabase } = await import('../../../lib/supabase');
        const { data } = await supabase
          .from('mazad_gateway_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (data) {
          setSettings({
            enabled: data.enabled ?? true,
            auto_enter_enabled: data.auto_enter_enabled ?? true,
            auto_enter_delay: data.auto_enter_delay ?? 3,
            show_logo: data.show_logo ?? true,
          });
        }
      } catch (error) {
        console.error('Error loading gateway settings:', error);
      }
    };

    loadSettings();
  }, []);

  // العد التنازلي التلقائي
  useEffect(() => {
    if (!settings.auto_enter_enabled) return;

    const duration = settings.auto_enter_delay * 1000;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        handleEnter();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [settings.auto_enter_enabled, settings.auto_enter_delay]);

  const handleEnter = () => {
    setIsVisible(false);
    setTimeout(() => onEnter(), 400);
  };

  if (!settings.enabled) {
    onEnter();
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-emerald-50 via-white to-green-50
                  flex flex-col items-center justify-center transition-opacity duration-400
                  ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0"
             style={{
               backgroundImage: `radial-gradient(circle at 2px 2px, #059669 1px, transparent 0)`,
               backgroundSize: '40px 40px'
             }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto px-6">
        {/* Crown Logo */}
        {settings.show_logo && (
          <div className="relative mb-8 animate-float">
            {/* Glow Effect */}
            <div className="absolute inset-0 blur-3xl bg-emerald-500/30 rounded-full scale-150" />

            {/* Crown Container */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600
                            flex items-center justify-center shadow-2xl border-4 border-white/20
                            transform hover:scale-110 transition-transform duration-300">
                <Crown className="w-16 h-16 text-white" strokeWidth={2.5} />
              </div>

              {/* Sparkles */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping opacity-75" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-emerald-300 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-black text-center mb-4 leading-tight">
          <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700
                         bg-clip-text text-transparent drop-shadow-sm">
            بوابة
          </span>
          <br />
          <span className="bg-gradient-to-r from-green-700 via-emerald-800 to-green-900
                         bg-clip-text text-transparent drop-shadow-sm">
            مزاد
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-emerald-700/80 text-lg md:text-xl text-center mb-12 font-medium">
          منصة استثمار زراعي متطورة
        </p>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          className="group relative px-12 py-4 bg-gradient-to-r from-emerald-600 to-green-600
                   text-white rounded-2xl font-bold text-lg shadow-xl
                   hover:shadow-2xl hover:scale-105 transition-all duration-300
                   active:scale-95"
        >
          {/* Button Glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-400
                        opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300" />

          <span className="relative z-10">ادخل إلى المنصة</span>

          {/* Progress Bar */}
          {settings.auto_enter_enabled && (
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full overflow-hidden w-full">
              <div
                className="h-full bg-white/80 transition-all duration-50 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </button>

        {/* Auto Enter Text */}
        {settings.auto_enter_enabled && (
          <p className="text-emerald-600/60 text-sm mt-4 animate-pulse">
            الدخول التلقائي بعد {settings.auto_enter_delay} ثواني...
          </p>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-200/30 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-green-200/30 rounded-full blur-3xl animate-pulse delay-1000" />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
