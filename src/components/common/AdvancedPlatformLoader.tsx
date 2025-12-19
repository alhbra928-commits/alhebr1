import { useState, useEffect } from 'react';
import { Leaf, TreeDeciduous, Sparkles, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdvancedPlatformLoaderProps {
  onComplete: () => void;
}

interface LoaderSettings {
  enabled: boolean;
  show_always: boolean;
  min_display_time: number;
  fade_duration: number;

  logo_type: 'emoji' | 'image' | 'text' | 'none';
  logo_emoji: string;
  logo_image_url?: string;
  logo_text: string;
  logo_animation: string;
  logo_size: string;

  main_title: string;
  main_title_size: string;
  subtitle: string;
  subtitle_size: string;
  show_percentage: boolean;
  show_phase_text: boolean;

  show_progress_bar: boolean;
  progress_bar_style: string;
  progress_bar_height: string;
  progress_bar_rounded: boolean;
  show_progress_glow: boolean;

  background_type: string;
  background_color_from: string;
  background_color_to: string;
  background_animation: string;

  show_floating_elements: boolean;
  floating_elements_count: number;
  floating_elements_speed: string;

  show_shimmer_effect: boolean;
  show_sparkles: boolean;
  blur_background: boolean;

  text_color: string;
  accent_color: string;
  secondary_color: string;

  custom_css?: string;
  preload_images: boolean;
  gpu_acceleration: boolean;
}

interface Phase {
  phase_number: number;
  phase_text: string;
  phase_icon: string;
  phase_color: string;
  start_percentage: number;
  end_percentage: number;
}

interface FloatingElement {
  element_type: string;
  element_value: string;
  size_min: number;
  size_max: number;
  animation_type: string;
  animation_duration_min: number;
  animation_duration_max: number;
  opacity_min: number;
  opacity_max: number;
  color?: string;
}

// Default settings fallback
const DEFAULT_SETTINGS: LoaderSettings = {
  enabled: true,
  show_always: true,
  min_display_time: 2500,
  fade_duration: 800,

  logo_type: 'emoji',
  logo_emoji: '🌾',
  logo_text: 'مزادات',
  logo_animation: 'rotate3d',
  logo_size: 'large',

  main_title: 'مزادات',
  main_title_size: 'large',
  subtitle: 'منصة الاستثمار الزراعي الذكية',
  subtitle_size: 'medium',
  show_percentage: true,
  show_phase_text: true,

  show_progress_bar: true,
  progress_bar_style: 'gradient',
  progress_bar_height: 'medium',
  progress_bar_rounded: true,
  show_progress_glow: true,

  background_type: 'gradient',
  background_color_from: '#064e3b',
  background_color_to: '#059669',
  background_animation: 'none',

  show_floating_elements: true,
  floating_elements_count: 30,
  floating_elements_speed: 'normal',

  show_shimmer_effect: true,
  show_sparkles: true,
  blur_background: false,

  text_color: '#ffffff',
  accent_color: '#10b981',
  secondary_color: '#34d399',

  preload_images: true,
  gpu_acceleration: true,
};

const DEFAULT_PHASES: Phase[] = [
  { phase_number: 1, phase_text: 'جاري تحميل المنصة...', phase_icon: '🌾', phase_color: '#10b981', start_percentage: 0, end_percentage: 25 },
  { phase_number: 2, phase_text: 'تحميل المزارع المتاحة...', phase_icon: '🌴', phase_color: '#34d399', start_percentage: 25, end_percentage: 50 },
  { phase_number: 3, phase_text: 'تجهيز بيانات الاستثمار...', phase_icon: '💰', phase_color: '#6ee7b7', start_percentage: 50, end_percentage: 75 },
  { phase_number: 4, phase_text: 'تقريباً جاهز...', phase_icon: '✨', phase_color: '#a7f3d0', start_percentage: 75, end_percentage: 100 },
];

export function AdvancedPlatformLoader({ onComplete }: AdvancedPlatformLoaderProps) {
  const [settings, setSettings] = useState<LoaderSettings>(DEFAULT_SETTINGS);
  const [phases, setPhases] = useState<Phase[]>(DEFAULT_PHASES);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from database
  useEffect(() => {
    // Safety timeout: if loading takes too long, proceed with defaults
    const safetyTimeout = setTimeout(() => {
      console.log('[AdvancedPlatformLoader] Using default settings (safety timeout)');
      setIsLoading(false);
    }, 1000);

    const loadSettings = async () => {
      try {
        // Load main settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('platform_loader_settings')
          .select('*')
          .single();

        if (!settingsError && settingsData) {
          setSettings(settingsData as LoaderSettings);
          console.log('[AdvancedPlatformLoader] Settings loaded from database');
        } else {
          console.log('[AdvancedPlatformLoader] Using default settings');
        }

        // Load phases
        const { data: phasesData, error: phasesError } = await supabase
          .from('loader_content_phases')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (!phasesError && phasesData && phasesData.length > 0) {
          setPhases(phasesData as Phase[]);
        }

        // Load floating elements
        const { data: elementsData, error: elementsError } = await supabase
          .from('loader_background_elements')
          .select('*')
          .eq('is_active', true);

        if (!elementsError && elementsData) {
          setFloatingElements(elementsData as FloatingElement[]);
        }

        clearTimeout(safetyTimeout);
        setIsLoading(false);
      } catch (error) {
        console.error('[AdvancedPlatformLoader] Error loading settings:', error);
        clearTimeout(safetyTimeout);
        setIsLoading(false);
      }
    };

    loadSettings();

    return () => clearTimeout(safetyTimeout);
  }, []);

  // Progress animation
  useEffect(() => {
    if (isLoading || !settings.enabled) return;

    const duration = settings.min_display_time;
    const interval = 30;
    const steps = duration / interval;
    let currentStep = 0;

    // Track analytics
    const sessionId = crypto.randomUUID();
    const startTime = Date.now();

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / steps) * 100;
      setProgress(newProgress);

      // Update phase based on progress
      const activePhase = phases.findIndex(
        p => newProgress >= p.start_percentage && newProgress < p.end_percentage
      );
      if (activePhase !== -1 && activePhase !== currentPhase) {
        setCurrentPhase(activePhase);
      }

      if (currentStep >= steps) {
        clearInterval(timer);

        // Save analytics
        supabase.from('loader_analytics').insert({
          session_id: sessionId,
          duration_ms: Date.now() - startTime,
          completed_naturally: true,
          device_type: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          browser: navigator.userAgent.split('(')[0].trim(),
        }).then(() => {
          console.log('[AdvancedPlatformLoader] Analytics saved');
        });

        // Start exit animation
        setIsExiting(true);
        setTimeout(() => {
          setShowContent(false);
          setTimeout(onComplete, 300);
        }, settings.fade_duration);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isLoading, settings, phases, currentPhase, onComplete]);

  if (!showContent || !settings.enabled) return null;

  const currentPhaseData = phases[currentPhase] || phases[0];

  // Render floating elements
  const renderFloatingElements = () => {
    if (!settings.show_floating_elements || floatingElements.length === 0) return null;

    const elementsToRender = [];
    const count = Math.min(settings.floating_elements_count, 50);

    for (let i = 0; i < count; i++) {
      const element = floatingElements[Math.floor(Math.random() * floatingElements.length)];
      const size = Math.random() * (element.size_max - element.size_min) + element.size_min;
      const duration = Math.random() * (element.animation_duration_max - element.animation_duration_min) + element.animation_duration_min;
      const opacity = Math.random() * (element.opacity_max - element.opacity_min) + element.opacity_min;

      elementsToRender.push(
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${size}px`,
            opacity: opacity,
            animation: `float ${duration}ms ease-in-out infinite`,
            animationDelay: `${Math.random() * 2000}ms`,
            color: element.color || 'inherit',
          }}
        >
          {element.element_value}
        </div>
      );
    }

    return elementsToRender;
  };

  const logoSizeMap = {
    small: 'w-16 h-16 md:w-20 md:h-20',
    medium: 'w-20 h-20 md:w-24 md:h-24',
    large: 'w-24 h-24 md:w-32 md:h-32',
    xlarge: 'w-32 h-32 md:w-40 md:h-40',
  };

  const titleSizeMap = {
    small: 'text-2xl md:text-3xl',
    medium: 'text-3xl md:text-4xl',
    large: 'text-4xl md:text-6xl',
    xlarge: 'text-5xl md:text-7xl',
  };

  const subtitleSizeMap = {
    small: 'text-base md:text-lg',
    medium: 'text-lg md:text-2xl',
    large: 'text-xl md:text-3xl',
  };

  const progressHeightMap = {
    thin: 'h-1',
    medium: 'h-3 md:h-4',
    thick: 'h-4 md:h-6',
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        @keyframes rotate3d {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(360deg); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px ${currentPhaseData.phase_color}80, 0 0 40px ${currentPhaseData.phase_color}50;
          }
          50% {
            box-shadow: 0 0 40px ${currentPhaseData.phase_color}, 0 0 80px ${currentPhaseData.phase_color}80;
          }
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .loader-container {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: linear-gradient(135deg, ${settings.background_color_from} 0%, ${settings.background_color_to} 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: opacity ${settings.fade_duration}ms ease-out, transform ${settings.fade_duration}ms ease-out;
          ${settings.gpu_acceleration ? 'transform: translate3d(0, 0, 0); -webkit-transform: translate3d(0, 0, 0);' : ''}
        }

        .loader-container.exiting {
          opacity: 0;
          transform: scale(1.1);
        }

        @supports (-webkit-touch-callout: none) {
          .loader-container {
            height: 100vh;
            height: 100dvh;
            min-height: -webkit-fill-available;
          }
        }

        ${settings.custom_css || ''}
      `}</style>

      <div className={`loader-container ${isExiting ? 'exiting' : ''}`}>
        {/* Floating Elements Background */}
        {settings.show_floating_elements && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {renderFloatingElements()}
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 md:px-6 w-full max-w-4xl">
          {/* Logo */}
          {settings.logo_type !== 'none' && (
            <div
              className={`mb-8 ${settings.logo_animation === 'rotate3d' ? 'logo-3d' : ''} fade-scale`}
              style={{
                animation: settings.logo_animation !== 'none'
                  ? `${settings.logo_animation} ${settings.logo_animation === 'rotate3d' ? '10s' : '2s'} ${settings.logo_animation === 'rotate3d' ? 'linear' : 'ease-in-out'} infinite`
                  : 'none',
              }}
            >
              {settings.logo_type === 'emoji' && (
                <div
                  className={`${logoSizeMap[settings.logo_size as keyof typeof logoSizeMap]} rounded-3xl flex items-center justify-center shadow-2xl`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15))',
                    backdropFilter: 'blur(20px)',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <span className="text-5xl md:text-6xl">{settings.logo_emoji}</span>
                </div>
              )}
              {settings.logo_type === 'image' && settings.logo_image_url && (
                <img
                  src={settings.logo_image_url}
                  alt="Logo"
                  className={`${logoSizeMap[settings.logo_size as keyof typeof logoSizeMap]} object-contain drop-shadow-2xl`}
                />
              )}
              {settings.logo_type === 'text' && (
                <div
                  className="text-5xl md:text-6xl font-black"
                  style={{ color: settings.text_color }}
                >
                  {settings.logo_text}
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <h1
            className={`${titleSizeMap[settings.main_title_size as keyof typeof titleSizeMap]} font-black mb-4 text-center drop-shadow-lg fade-scale ${settings.show_shimmer_effect ? 'shimmer-text' : ''}`}
            style={{ color: settings.text_color }}
          >
            {settings.main_title}
          </h1>

          {/* Subtitle */}
          <p
            className={`${subtitleSizeMap[settings.subtitle_size as keyof typeof subtitleSizeMap]} font-bold mb-12 text-center slide-in`}
            style={{ color: settings.text_color, opacity: 0.9 }}
          >
            {settings.subtitle}
          </p>

          {/* Progress Container */}
          <div className="w-full max-w-md md:max-w-lg slide-in" style={{ animationDelay: '0.2s' }}>
            {/* Progress Bar */}
            {settings.show_progress_bar && (
              <div
                className={`relative ${progressHeightMap[settings.progress_bar_height as keyof typeof progressHeightMap]} bg-white/10 ${settings.progress_bar_rounded ? 'rounded-full' : ''} overflow-hidden backdrop-blur-sm mb-6 ${settings.show_progress_glow ? 'progress-bar-glow' : ''}`}
              >
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-300 ease-out ${settings.progress_bar_rounded ? 'rounded-full' : ''}`}
                  style={{
                    width: `${progress}%`,
                    background: settings.progress_bar_style === 'gradient'
                      ? `linear-gradient(90deg, ${currentPhaseData.phase_color} 0%, ${settings.accent_color} 50%, ${settings.secondary_color} 100%)`
                      : currentPhaseData.phase_color,
                    boxShadow: settings.show_progress_glow ? `0 0 30px ${currentPhaseData.phase_color}` : 'none',
                  }}
                >
                  {settings.show_shimmer_effect && (
                    <div
                      className="absolute inset-0 opacity-50"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s linear infinite',
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Percentage and Phase */}
            {(settings.show_percentage || settings.show_phase_text) && (
              <div className="flex items-center justify-between mb-4">
                {settings.show_percentage && (
                  <div className="text-3xl md:text-4xl font-black" style={{ color: settings.text_color }}>
                    {Math.round(progress)}%
                  </div>
                )}
                {settings.show_phase_text && (
                  <div className="flex items-center gap-2" style={{ color: settings.text_color }}>
                    <TrendingUp className="w-4 h-4 animate-pulse" />
                    <span className="text-sm md:text-base font-bold opacity-80">جاري التحميل</span>
                  </div>
                )}
              </div>
            )}

            {/* Current Phase */}
            {settings.show_phase_text && currentPhaseData && (
              <div
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/20 shadow-2xl"
                style={{ borderColor: `${currentPhaseData.phase_color}40` }}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl md:text-3xl">{currentPhaseData.phase_icon}</span>
                  <p
                    className="text-base md:text-lg lg:text-xl font-bold text-center animate-pulse"
                    style={{ color: settings.text_color }}
                  >
                    {currentPhaseData.phase_text}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
