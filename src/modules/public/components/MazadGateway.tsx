import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import { PublicFarmService } from '../services/publicFarmService';

interface MazadGatewayProps {
  onEnter: () => void;
}

interface GatewaySettings {
  enabled: boolean;
  auto_enter_enabled: boolean;
  auto_enter_delay: number;
  show_logo: boolean;
  fade_duration: number;
  animation_speed: 'slow' | 'normal' | 'fast';
  show_sparkles: boolean;
  show_particles: boolean;
  button_glow_enabled: boolean;
  show_progress_bar: boolean;
  background_pattern_enabled: boolean;
  title_animation_enabled: boolean;
  title_line1: string;
  title_line2: string;
  subtitle: string;
  button_text: string;
  show_title: boolean;
  show_subtitle: boolean;
}

export function MazadGateway({ onEnter }: MazadGatewayProps) {
  const [settings, setSettings] = useState<GatewaySettings>({
    enabled: true,
    auto_enter_enabled: true,
    auto_enter_delay: 3,
    show_logo: true,
    fade_duration: 400,
    animation_speed: 'normal',
    show_sparkles: true,
    show_particles: true,
    button_glow_enabled: true,
    show_progress_bar: true,
    background_pattern_enabled: true,
    title_animation_enabled: true,
    title_line1: 'بوابة',
    title_line2: 'مزاد',
    subtitle: 'منصة استثمار زراعي متطورة',
    button_text: 'ادخل إلى المنصة',
    show_title: true,
    show_subtitle: true,
  });
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [farmsPreloaded, setFarmsPreloaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // تحميل المزارع مسبقاً في الخلفية
  useEffect(() => {
    const preloadFarms = async () => {
      try {
        await PublicFarmService.getAllFarms();
        setFarmsPreloaded(true);
      } catch (error) {
        console.error('Error preloading farms:', error);
        setFarmsPreloaded(true); // استمر حتى لو فشل
      }
    };
    preloadFarms();
  }, []);

  // إزالة الشاشة البيضاء بعد تحميل الإعدادات
  useEffect(() => {
    if (settingsLoaded) {
      // انتظر 200ms إضافية للتأكد من رسم البوابة
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [settingsLoaded]);

  // تحميل الإعدادات من قاعدة البيانات
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // إضافة timestamp لكسر أي cache
        const timestamp = Date.now();
        console.log('[MazadGateway] 🔄 Force loading settings with timestamp:', timestamp);

        const { supabase } = await import('../../../lib/supabase');
        const { data, error } = await supabase
          .from('mazad_gateway_settings')
          .select('*')
          .eq('id', 'd06bd962-d0a4-411a-a510-7deedb987839')
          .maybeSingle();

        if (error) {
          console.error('[MazadGateway] ❌ Database error:', error);
          throw error;
        }

        console.log('[MazadGateway] 🔵 Settings loaded from DB:', data);
        console.log('[MazadGateway] 📝 Title Line 1:', data?.title_line1);
        console.log('[MazadGateway] 📝 Title Line 2:', data?.title_line2);
        console.log('[MazadGateway] 📝 Button Text:', data?.button_text);
        console.log('[MazadGateway] ⏰ Updated At:', data?.updated_at);

        if (data) {
          const newSettings = {
            enabled: data.enabled ?? true,
            auto_enter_enabled: data.auto_enter_enabled ?? true,
            auto_enter_delay: data.auto_enter_delay ?? 3,
            show_logo: data.show_logo ?? true,
            fade_duration: data.fade_duration ?? 400,
            animation_speed: data.animation_speed ?? 'normal',
            show_sparkles: data.show_sparkles ?? true,
            show_particles: data.show_particles ?? true,
            button_glow_enabled: data.button_glow_enabled ?? true,
            show_progress_bar: data.show_progress_bar ?? true,
            background_pattern_enabled: data.background_pattern_enabled ?? true,
            title_animation_enabled: data.title_animation_enabled ?? true,
            title_line1: data.title_line1 || 'بوابة',
            title_line2: data.title_line2 || 'مزاد',
            subtitle: data.subtitle || 'منصة استثمار زراعي متطورة',
            button_text: data.button_text || 'ادخل إلى المنصة',
            show_title: data.show_title ?? true,
            show_subtitle: data.show_subtitle ?? true,
          };

          console.log('[MazadGateway] ✅ Settings applied:', newSettings);
          setSettings(newSettings);
          console.log('[Gateway] auto_enter_enabled:', data.auto_enter_enabled);
        } else {
          console.log('[Gateway] ⚠️ No settings in DB, using defaults');
        }
        setSettingsLoaded(true);
      } catch (error) {
        console.error('[Gateway] ❌ Error loading settings:', error);
        setSettingsLoaded(true);
      }
    };

    loadSettings();

    // الاشتراك في التحديثات المباشرة
    const setupRealtimeSubscription = async () => {
      try {
        const { supabase } = await import('../../../lib/supabase');

        console.log('[MazadGateway] 🔌 Setting up Realtime subscription...');

        const channel = supabase
          .channel('mazad_gateway_settings_changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'mazad_gateway_settings',
              filter: `id=eq.d06bd962-d0a4-411a-a510-7deedb987839`
            },
            (payload) => {
              console.log('[MazadGateway] 🔴🔴🔴 REALTIME UPDATE RECEIVED! 🔴🔴🔴');
              console.log('[MazadGateway] 📦 Payload:', payload);
              console.log('[MazadGateway] 📝 New Data:', payload.new);
              const data = payload.new as any;

              console.log('[MazadGateway] 🔄 Applying new settings...');
              console.log('[MazadGateway] 📝 New Title Line 1:', data.title_line1);
              console.log('[MazadGateway] 📝 New Title Line 2:', data.title_line2);
              console.log('[MazadGateway] 📝 New Button Text:', data.button_text);

              setSettings({
                enabled: data.enabled ?? true,
                auto_enter_enabled: data.auto_enter_enabled ?? true,
                auto_enter_delay: data.auto_enter_delay ?? 3,
                show_logo: data.show_logo ?? true,
                fade_duration: data.fade_duration ?? 400,
                animation_speed: data.animation_speed ?? 'normal',
                show_sparkles: data.show_sparkles ?? true,
                show_particles: data.show_particles ?? true,
                button_glow_enabled: data.button_glow_enabled ?? true,
                show_progress_bar: data.show_progress_bar ?? true,
                background_pattern_enabled: data.background_pattern_enabled ?? true,
                title_animation_enabled: data.title_animation_enabled ?? true,
                title_line1: data.title_line1 || 'بوابة',
                title_line2: data.title_line2 || 'مزاد',
                subtitle: data.subtitle || 'منصة استثمار زراعي متطورة',
                button_text: data.button_text || 'ادخل إلى المنصة',
                show_title: data.show_title ?? true,
                show_subtitle: data.show_subtitle ?? true,
              });

              console.log('[MazadGateway] ✅✅✅ Settings updated successfully in realtime! ✅✅✅');
            }
          )
          .subscribe((status) => {
            console.log('[MazadGateway] 📡 Subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('[MazadGateway] ✅ Realtime subscription ACTIVE and READY!');
            }
          });

        console.log('[MazadGateway] ✅ Realtime subscription setup complete!');

        return () => {
          console.log('[MazadGateway] 🔌 Unsubscribing from Realtime...');
          channel.unsubscribe();
        };
      } catch (error) {
        console.error('[MazadGateway] ❌ Realtime subscription error:', error);
      }
    };

    setupRealtimeSubscription();
  }, []);

  // تتبع أي تغييرات في settings
  useEffect(() => {
    console.log('[MazadGateway] 🔄 Settings state changed!');
    console.log('[MazadGateway] 📝 Current title_line1:', settings.title_line1);
    console.log('[MazadGateway] 📝 Current title_line2:', settings.title_line2);
    console.log('[MazadGateway] 📝 Current button_text:', settings.button_text);
  }, [settings]);

  // العد التنازلي التلقائي - يبدأ فقط بعد إخفاء الـ loader
  useEffect(() => {
    console.log('[Gateway] Auto-enter check:', {
      settingsLoaded,
      auto_enter_enabled: settings.auto_enter_enabled,
      isInitializing,
      should_start: settingsLoaded && settings.auto_enter_enabled && !isInitializing
    });

    if (!settingsLoaded || !settings.auto_enter_enabled || isInitializing) return;

    console.log('[Gateway] ✅ Starting auto-enter countdown:', settings.auto_enter_delay, 'seconds');

    const duration = settings.auto_enter_delay * 1000;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        console.log('[Gateway] ⏱️ Countdown finished, entering platform...');
        handleEnter();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [settingsLoaded, settings.auto_enter_enabled, settings.auto_enter_delay, isInitializing]);

  const handleEnter = () => {
    // انتظر حتى تنتهي المزارع من التحميل
    if (!farmsPreloaded) {
      console.log('[Gateway] ⏳ Waiting for farms to preload...');
      setTimeout(handleEnter, 100); // حاول مرة أخرى بعد 100ms
      return;
    }
    console.log('[Gateway] ✅ Farms preloaded, entering platform now!');
    setIsVisible(false);
    setTimeout(() => onEnter(), settings.fade_duration);
  };

  if (!settings.enabled) {
    onEnter();
    return null;
  }

  // حساب سرعة الأنيميشن
  const getAnimationDuration = () => {
    switch (settings.animation_speed) {
      case 'slow': return '4s';
      case 'fast': return '2s';
      default: return '3s';
    }
  };

  // إظهار loader أثناء التحميل الأولي
  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Crown className="w-16 h-16 text-emerald-600 animate-pulse" />
            <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full animate-pulse" />
          </div>
          <div className="text-emerald-600 font-bold text-lg animate-pulse">
            جاري التحميل...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-emerald-50 via-white to-green-50
                  flex items-center justify-center transition-opacity overflow-hidden
                  ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{
        transitionDuration: `${settings.fade_duration}ms`,
        minHeight: '-webkit-fill-available' // iOS Safari fix
      }}
    >
      {/* Background Pattern */}
      {settings.background_pattern_enabled && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0"
               style={{
                 backgroundImage: `radial-gradient(circle at 2px 2px, #059669 1px, transparent 0)`,
                 backgroundSize: '40px 40px'
               }}
          />
        </div>
      )}

      {/* Main Content - متجاوب مع الشاشات الصغيرة */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md mx-auto px-6 py-8 sm:py-12">
        {/* Crown Logo - أصغر على الموبايل */}
        {settings.show_logo && (
          <div
            className="relative mb-4 sm:mb-6 md:mb-8"
            style={{ animation: `float ${getAnimationDuration()} ease-in-out infinite` }}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 blur-3xl bg-emerald-500/30 rounded-full scale-150" />

            {/* Crown Container - حجم أكبر */}
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full
                            bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600
                            flex items-center justify-center shadow-2xl border-4 border-white/20
                            transform hover:scale-110 transition-transform duration-300">
                <Crown className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 text-white" strokeWidth={2.5} />
              </div>

              {/* Sparkles - أصغر على الموبايل */}
              {settings.show_sparkles && (
                <>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full animate-ping opacity-75" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-300 rounded-full animate-pulse" />
                </>
              )}
            </div>
          </div>
        )}

        {/* Title - خط متجاوب */}
        {settings.show_title && (settings.title_line1 || settings.title_line2) && (
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-center mb-2 sm:mb-3 md:mb-4 leading-tight
                         ${settings.title_animation_enabled ? 'animate-fade-in-up' : ''}`}>
            {console.log('[MazadGateway] 🎨 Rendering title_line1:', settings.title_line1)}
            {settings.title_line1 && (
              <>
                <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700
                               bg-clip-text text-transparent drop-shadow-sm">
                  {settings.title_line1}
                </span>
                {settings.title_line2 && <br />}
              </>
            )}
            {settings.title_line2 && (
              <span className="bg-gradient-to-r from-green-700 via-emerald-800 to-green-900
                             bg-clip-text text-transparent drop-shadow-sm">
                {settings.title_line2}
              </span>
            )}
          </h1>
        )}

        {/* Subtitle - خط متجاوب */}
        {settings.show_subtitle && settings.subtitle && (
          <p className={`text-emerald-700/80 text-base sm:text-lg md:text-xl text-center mb-6 sm:mb-8 md:mb-12 font-medium px-4
                        ${settings.title_animation_enabled ? 'animate-fade-in' : ''}`}>
            {settings.subtitle}
          </p>
        )}

        {/* Enter Button - حجم متجاوب */}
        <button
          onClick={handleEnter}
          className="group relative px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4
                   bg-gradient-to-r from-emerald-600 to-green-600
                   text-white rounded-2xl font-bold text-base sm:text-lg shadow-xl
                   hover:shadow-2xl hover:scale-105 transition-all duration-300
                   active:scale-95 w-full max-w-xs"
        >
          {/* Button Glow */}
          {settings.button_glow_enabled && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-400
                          opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300" />
          )}

          <span className="relative z-10">{settings.button_text}</span>

          {/* Progress Bar */}
          {settings.auto_enter_enabled && settings.show_progress_bar && (
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full overflow-hidden w-full">
              <div
                className="h-full bg-white/80 transition-all duration-50 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </button>

        {/* Auto Enter Text - خط متجاوب */}
        {settings.auto_enter_enabled && (
          <p className="text-emerald-600/60 text-xs sm:text-sm mt-3 sm:mt-4 animate-pulse">
            الدخول التلقائي بعد {settings.auto_enter_delay} ثواني...
          </p>
        )}
      </div>

      {/* Decorative Particles */}
      {settings.show_particles && (
        <>
          <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-200/30 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-green-200/30 rounded-full blur-3xl animate-pulse"
               style={{ animationDelay: '1s' }} />
        </>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}
