import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface LoaderSettings {
  enabled: boolean;
  logo_url?: string;
  main_title: string;
  subtitle: string;
  auto_enter: boolean;
  min_display_time: number;
  fade_duration: number;
  animation_speed: 'slow' | 'normal' | 'fast';
  show_progress_bar: boolean;
  show_sparkles: boolean;
  logo_animation: 'none' | 'bounce' | 'spin' | 'pulse' | 'float';
  background_color_from: string;
  background_color_to: string;
  text_color: string;
  progress_bar_color: string;
  loading_text_1: string;
  loading_text_2: string;
  loading_text_3: string;
  loading_text_4: string;
  loading_text_5: string;
}

interface InnovativeLoaderGatewayProps {
  onComplete: () => void;
}

// ✅ إعدادات افتراضية - أخضر فاتح ومريح للعين
const DEFAULT_SETTINGS: LoaderSettings = {
  enabled: true,
  main_title: '🌾 مزاد',
  subtitle: 'منصة الاستثمار الزراعي',
  auto_enter: true,
  min_display_time: 2000,
  fade_duration: 800,
  animation_speed: 'normal',
  show_progress_bar: true,
  show_sparkles: true,
  logo_animation: 'pulse',
  background_color_from: '#064e3b', // أخضر داكن
  background_color_to: '#047857',   // أخضر متوسط
  text_color: '#ffffff',
  progress_bar_color: '#10b981',    // أخضر فاتح
  loading_text_1: 'جاري تحميل المنصة...',
  loading_text_2: 'تحميل المزارع المتاحة...',
  loading_text_3: 'تجهيز البيانات...',
  loading_text_4: 'جاري الاتصال بالخادم...',
  loading_text_5: 'تقريباً جاهز...',
};

export function InnovativeLoaderGateway({ onComplete }: InnovativeLoaderGatewayProps) {
  const [settings, setSettings] = useState<LoaderSettings>(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // بدء اللودر فوراً بالإعدادات الافتراضية
    startLoader(settings);

    // تحميل الإعدادات من قاعدة البيانات في الخلفية (اختياري)
    loadSettings();

    // Prevent body scroll on iOS when loader is visible
    document.body.classList.add('loader-active');

    return () => {
      document.body.classList.remove('loader-active');
    };
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('loader_settings')
        .select('*')
        .single();

      if (error) throw error;

      console.log('[Loader] ✅ Settings loaded from DB:', data);

      // تحديث الإعدادات فقط إذا كانت مختلفة
      // (اللودر يعمل بالفعل بالإعدادات الافتراضية)
      if (data && data.enabled !== false) {
        setSettings(data as LoaderSettings);
      } else if (data && !data.enabled) {
        // إذا كان معطلاً في DB، أدخل فوراً
        console.log('[Loader] ⚠️ Loader disabled in DB - skipping...');
        onComplete();
      }
    } catch (error) {
      console.warn('[Loader] ⚠️ Could not load settings from DB, using defaults:', error);
      // لا مشكلة - نستمر بالإعدادات الافتراضية
    }
  };

  const startLoader = (config: LoaderSettings) => {
    const duration = config.min_display_time;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const loadingTexts = [
      config.loading_text_1,
      config.loading_text_2,
      config.loading_text_3,
      config.loading_text_4,
      config.loading_text_5,
    ];

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / steps) * 100;
      setProgress(newProgress);

      // تحديث النص الديناميكي
      const textIndex = Math.floor((newProgress / 100) * loadingTexts.length);
      if (textIndex < loadingTexts.length) {
        setCurrentTextIndex(textIndex);
      }

      if (currentStep >= steps) {
        clearInterval(timer);

        if (config.auto_enter) {
          // اختفاء تدريجي ثم دخول
          setIsVisible(false);
          setTimeout(() => {
            onComplete();
          }, config.fade_duration);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  };

  // ✅ تم إزالة fallback loader البرتقالي/الأحمر!
  // نستخدم الإعدادات الافتراضية مباشرة

  if (!settings.enabled) {
    return null;
  }

  const loadingTexts = [
    settings.loading_text_1,
    settings.loading_text_2,
    settings.loading_text_3,
    settings.loading_text_4,
    settings.loading_text_5,
  ];

  const animationDuration = settings.animation_speed === 'slow' ? 2000 : settings.animation_speed === 'fast' ? 500 : 1000;

  const logoAnimationClasses = {
    none: '',
    bounce: 'animate-bounce',
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    float: 'animate-bounce',
  };

  return (
    <>
      <style>{`
        /* iOS Safari Loading Screen Fix */
        .ios-loader-container {
          position: fixed;
          inset: 0;
          z-index: 9999;

          /* iOS viewport fix */
          width: 100vw;
          height: 100vh;
          height: 100dvh; /* Dynamic Viewport Height for iOS */
          min-height: -webkit-fill-available;

          /* Prevent scrolling */
          overflow: hidden;

          /* GPU acceleration */
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);

          /* iOS safe area */
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }

        /* Prevent body scroll when loader is visible */
        body.loader-active {
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.2);
          }
        }
      `}</style>
      <div
        className={`ios-loader-container transition-opacity duration-${animationDuration}`}
        style={{
          background: `linear-gradient(135deg, ${settings.background_color_from} 0%, ${settings.background_color_to} 100%)`,
          opacity: isVisible ? 1 : 0,
        }}
      >
      {/* Sparkles Background */}
      {settings.show_sparkles && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-yellow-300 opacity-20"
              size={Math.random() * 30 + 10}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `sparkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        {/* Logo */}
        {settings.logo_url && (
          <div className={`mb-8 ${logoAnimationClasses[settings.logo_animation]}`}>
            <img
              src={settings.logo_url}
              alt="Logo"
              className="w-32 h-32 object-contain drop-shadow-2xl"
            />
          </div>
        )}

        {/* Title */}
        <h1
          className="text-4xl md:text-6xl font-black mb-4 text-center drop-shadow-lg"
          style={{ color: settings.text_color }}
        >
          {settings.main_title}
        </h1>

        {/* Subtitle */}
        <p
          className="text-xl md:text-2xl font-medium mb-12 text-center opacity-90"
          style={{ color: settings.text_color }}
        >
          {settings.subtitle}
        </p>

        {/* Progress Bar */}
        {settings.show_progress_bar && (
          <div className="w-full max-w-md">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm mb-4">
              <div
                className="h-full transition-all duration-300 ease-out rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: settings.progress_bar_color,
                  boxShadow: `0 0 20px ${settings.progress_bar_color}`,
                }}
              />
            </div>

            {/* Percentage */}
            <div className="text-center">
              <span
                className="text-2xl font-bold"
                style={{ color: settings.text_color }}
              >
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Loading Text */}
        <div className="mt-8 text-center min-h-[2rem]">
          <p
            className="text-lg font-medium animate-pulse"
            style={{ color: settings.text_color }}
          >
            {loadingTexts[currentTextIndex]}
          </p>
        </div>

        {/* Skip Button (if auto_enter is false) */}
        {!settings.auto_enter && progress >= 100 && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onComplete, settings.fade_duration);
            }}
            className="mt-8 px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-bold transition-all hover:scale-105"
            style={{ color: settings.text_color }}
          >
            ادخل للمنصة
          </button>
        )}
      </div>
    </div>
    </>
  );
}
