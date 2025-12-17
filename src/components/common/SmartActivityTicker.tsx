import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, Users, MapPin, Award, Sparkles, Calendar,
  TreePine, Leaf, Home, CheckCircle, DollarSign, Star, Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Activity {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  timestamp?: Date;
  priority: number;
  color: string;
  bgGradient: string;
  textColor: string;
}

interface TickerSettings {
  mode: 'simulation' | 'real' | 'hybrid';
  scrollSpeed: 'slow' | 'medium' | 'fast';
  itemsPerCycle: number;
  showTimestamps: boolean;
  backgroundColor: string;
  textColor: string;
  iconColor: string;
}

const iconMap: Record<string, any> = {
  '🌴': TreePine,
  '🫒': Leaf,
  '👤': Users,
  '👥': Users,
  '📈': TrendingUp,
  '📜': Award,
  '🏡': Home,
  '✨': Sparkles,
  '⭐': Star,
  '🔥': TrendingUp,
  '💳': DollarSign,
  '🔍': MapPin,
  '📊': TrendingUp,
};

export function SmartActivityTicker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<TickerSettings>({
    mode: 'hybrid',
    scrollSpeed: 'medium',
    itemsPerCycle: 10,
    showTimestamps: true,
    backgroundColor: '#1a4d2e',
    textColor: '#f4e5c2',
    iconColor: '#d4af37',
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    loadSettings();
    loadActivities();

    const channel = supabase
      .channel('ticker_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'platform_activities' },
        () => loadActivities()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_ticker_settings' },
        () => loadSettings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || activities.length === 0) return;

    const isMobile = window.innerWidth <= 768;

    // ═══════════════════════════════════════════════════════════
    // 📱 نظام الجوال - منفصل تماماً ومستقل - الأولوية #1
    // ═══════════════════════════════════════════════════════════
    if (isMobile) {
      const mobileSpeed = settings.scrollSpeed === 'fast' ? 20 :
                         settings.scrollSpeed === 'medium' ? 30 : 50;

      const mobilePixelsPerFrame = settings.scrollSpeed === 'fast' ? 2.5 :
                                   settings.scrollSpeed === 'medium' ? 1.8 : 1.0;

      const animate = () => {
        setScrollPosition((prev) => {
          // الجوال: المحتوى مكرر 10 مرات
          const contentWidth = scrollContainer.scrollWidth / 10;
          const newPosition = prev + mobilePixelsPerFrame;

          // reset سلس بدون فراغات
          return newPosition >= contentWidth ? 0 : newPosition;
        });
      };

      const animationId = setInterval(animate, mobileSpeed);
      return () => clearInterval(animationId);
    }

    // ═══════════════════════════════════════════════════════════
    // 💻 نظام الكمبيوتر - منفصل تماماً ومستقل
    // ═══════════════════════════════════════════════════════════
    else {
      const desktopSpeed = settings.scrollSpeed === 'fast' ? 30 :
                          settings.scrollSpeed === 'medium' ? 50 : 80;

      const desktopPixelsPerFrame = settings.scrollSpeed === 'fast' ? 1.5 :
                                    settings.scrollSpeed === 'medium' ? 1.0 : 0.5;

      const animate = () => {
        setScrollPosition((prev) => {
          // الكمبيوتر: المحتوى مكرر 3 مرات فقط
          const contentWidth = scrollContainer.scrollWidth / 3;
          const newPosition = prev + desktopPixelsPerFrame;

          // reset سلس
          return newPosition >= contentWidth ? 0 : newPosition;
        });
      };

      const animationId = setInterval(animate, desktopSpeed);
      return () => clearInterval(animationId);
    }
  }, [activities.length, settings.scrollSpeed]);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('activity_ticker_settings')
        .select('*')
        .single();

      if (data) {
        setSettings({
          mode: data.mode,
          scrollSpeed: data.scroll_speed,
          itemsPerCycle: data.items_per_cycle,
          showTimestamps: data.show_timestamps,
          backgroundColor: data.background_color,
          textColor: data.text_color,
          iconColor: data.icon_color,
        });
      }
    } catch (error) {
      console.error('[Ticker] Error loading settings:', error);
    }
  };

  const loadActivities = async () => {
    try {
      const items: Activity[] = [];

      if (settings.mode === 'real' || settings.mode === 'hybrid') {
        const { data: realActivities } = await supabase
          .from('platform_activities')
          .select('*')
          .eq('is_visible', true)
          .order('priority', { ascending: false })
          .order('timestamp', { ascending: false })
          .limit(settings.itemsPerCycle);

        if (realActivities) {
          items.push(
            ...realActivities.map((act) => ({
              id: act.id,
              icon: act.icon,
              titleAr: act.activity_title_ar,
              titleEn: act.activity_title_en,
              timestamp: new Date(act.timestamp),
              priority: act.priority,
              ...getStylesForType(act.activity_type),
            }))
          );
        }
      }

      if (settings.mode === 'simulation' || settings.mode === 'hybrid') {
        const { data: simActivities } = await supabase
          .from('simulated_activities')
          .select('*')
          .eq('is_active', true)
          .order('weight', { ascending: false })
          .limit(Math.floor(settings.itemsPerCycle / 2));

        if (simActivities) {
          items.push(
            ...simActivities.map((act) => ({
              id: act.id,
              icon: act.icon,
              titleAr: act.template_ar,
              titleEn: act.template_en,
              priority: act.weight / 10,
              ...getStylesForCategory(act.activity_category),
            }))
          );
        }
      }

      const shuffled = items.sort(() => Math.random() - 0.5);

      // فصل تام بين الجوال والكمبيوتر - الجوال أولاً!
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // الجوال: تكرار 10 مرات لضمان عدم وجود أي فراغات
        const mobileRepeated = [
          ...shuffled, ...shuffled, ...shuffled, ...shuffled, ...shuffled,
          ...shuffled, ...shuffled, ...shuffled, ...shuffled, ...shuffled
        ];
        setActivities(mobileRepeated);
      } else {
        // الكمبيوتر: تكرار 3 مرات كافي
        const desktopRepeated = [...shuffled, ...shuffled, ...shuffled];
        setActivities(desktopRepeated);
      }
    } catch (error) {
      console.error('[Ticker] Error loading activities:', error);
    }
  };

  const getStylesForType = (type: string) => {
    const styles: Record<string, any> = {
      booking: {
        color: 'from-emerald-500 to-teal-600',
        bgGradient: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40',
        textColor: 'text-emerald-900 dark:text-emerald-100',
      },
      investor_join: {
        color: 'from-blue-500 to-cyan-600',
        bgGradient: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40',
        textColor: 'text-blue-900 dark:text-blue-100',
      },
      farm_added: {
        color: 'from-green-500 to-lime-600',
        bgGradient: 'bg-gradient-to-br from-green-50 to-lime-50 dark:from-green-950/40 dark:to-lime-950/40',
        textColor: 'text-green-900 dark:text-green-100',
      },
      certificate: {
        color: 'from-amber-500 to-orange-600',
        bgGradient: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40',
        textColor: 'text-amber-900 dark:text-amber-100',
      },
      payment: {
        color: 'from-rose-500 to-pink-600',
        bgGradient: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40',
        textColor: 'text-rose-900 dark:text-rose-100',
      },
      trending: {
        color: 'from-red-500 to-rose-600',
        bgGradient: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40',
        textColor: 'text-red-900 dark:text-red-100',
      },
      milestone: {
        color: 'from-yellow-500 to-amber-600',
        bgGradient: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/40',
        textColor: 'text-yellow-900 dark:text-yellow-100',
      },
      stats: {
        color: 'from-violet-500 to-purple-600',
        bgGradient: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40',
        textColor: 'text-violet-900 dark:text-violet-100',
      },
    };
    return styles[type] || {
      color: 'from-gray-500 to-slate-600',
      bgGradient: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/40 dark:to-slate-950/40',
      textColor: 'text-gray-900 dark:text-gray-100',
    };
  };

  const getStylesForCategory = (category: string) => {
    return getStylesForType(category);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'الآن';
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} د`;
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} س`;
    return `منذ ${Math.floor(seconds / 86400)} يوم`;
  };

  if (activities.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }

        .ticker-modern {
          background: linear-gradient(
            180deg,
            rgba(16, 185, 129, 0.08) 0%,
            rgba(5, 150, 105, 0.12) 100%
          );
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border-top: 2px solid rgba(16, 185, 129, 0.3);
          box-shadow:
            0 -8px 32px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .modern-card {
          animation: slide-in 0.5s ease-out backwards;
          border-radius: 16px;
          border: 2px solid;
          box-shadow:
            0 8px 24px -4px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modern-card:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow:
            0 12px 32px -4px rgba(0, 0, 0, 0.2),
            0 0 0 2px rgba(255, 255, 255, 0.2) inset;
        }

        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse-ring {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        .glow-text {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Mobile Optimizations - الجوال أولاً! */
        @media (max-width: 768px) {
          .ticker-modern {
            border-radius: 0 !important;
            height: 58px !important;
            border-top-width: 3px !important;
          }

          .ticker-spacer {
            height: 58px !important;
          }

          .scroll-container {
            gap: 2px !important;
            padding: 0 !important;
          }

          .modern-card {
            min-width: 175px !important;
            max-width: 175px !important;
            padding: 7px 9px !important;
            border-radius: 10px !important;
            margin: 0 !important;
            flex-shrink: 0 !important;
          }

          .card-icon-wrapper {
            width: 28px !important;
            height: 28px !important;
          }

          .card-icon-wrapper svg {
            width: 14px !important;
            height: 14px !important;
          }

          .card-title {
            font-size: 12px !important;
            line-height: 1.3 !important;
          }

          .card-time {
            font-size: 10px !important;
          }

          .card-sparkle {
            width: 12px !important;
            height: 12px !important;
          }
        }

        /* Smooth Scroll Performance */
        .scroll-container {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        /* iOS Safe Area */
        @supports (padding: max(0px)) {
          .ticker-modern {
            padding-bottom: max(12px, env(safe-area-inset-bottom));
          }
        }
      `}</style>

      {/* Modern Ticker Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 ticker-modern z-40"
        style={{ height: '66px' }}
        dir="rtl"
      >
        {/* Animated Top Border */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] animate-[gradient-shift_3s_ease_infinite]" />

        {/* Scrolling Content */}
        <div className="relative h-full overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="scroll-container flex items-center h-full gap-1 px-0"
            style={{
              transform: `translateX(-${scrollPosition}px)`,
            }}
          >
            {activities.map((activity, index) => {
              const IconComponent = iconMap[activity.icon] || Sparkles;

              return (
                <div
                  key={`${activity.id}-${index}`}
                  className={`modern-card ${activity.bgGradient} relative overflow-hidden flex-shrink-0`}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    minWidth: '240px',
                    padding: '10px 12px',
                    borderColor: activity.color.includes('emerald') ? 'rgba(16, 185, 129, 0.4)' :
                                activity.color.includes('blue') ? 'rgba(59, 130, 246, 0.4)' :
                                activity.color.includes('green') ? 'rgba(34, 197, 94, 0.4)' :
                                activity.color.includes('amber') ? 'rgba(245, 158, 11, 0.4)' :
                                activity.color.includes('rose') ? 'rgba(244, 63, 94, 0.4)' :
                                activity.color.includes('red') ? 'rgba(239, 68, 68, 0.4)' :
                                activity.color.includes('yellow') ? 'rgba(234, 179, 8, 0.4)' :
                                'rgba(139, 92, 246, 0.4)',
                  }}
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${activity.color} blur-xl`} />
                  </div>

                  <div className="relative flex items-center gap-2.5">
                    {/* Modern Icon */}
                    <div className="relative card-icon-wrapper flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${activity.color} rounded-lg blur-md opacity-60 pulse-ring`} />
                      <div className={`relative p-1.5 rounded-lg bg-gradient-to-br ${activity.color} shadow-lg flex items-center justify-center`} style={{ width: '32px', height: '32px' }}>
                        <IconComponent className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-right">
                      <div className="card-title font-black text-sm leading-tight mb-1 glow-text" style={{
                        color: activity.color.includes('emerald') ? '#065f46' :
                               activity.color.includes('blue') ? '#1e3a8a' :
                               activity.color.includes('green') ? '#14532d' :
                               activity.color.includes('amber') ? '#78350f' :
                               activity.color.includes('rose') ? '#881337' :
                               activity.color.includes('red') ? '#7f1d1d' :
                               activity.color.includes('yellow') ? '#713f12' :
                               '#4c1d95',
                      }}>
                        {activity.titleAr}
                      </div>
                      {settings.showTimestamps && activity.timestamp && (
                        <div className="card-time text-xs font-bold opacity-70" style={{
                          color: activity.color.includes('emerald') ? '#059669' :
                                 activity.color.includes('blue') ? '#2563eb' :
                                 activity.color.includes('green') ? '#16a34a' :
                                 activity.color.includes('amber') ? '#d97706' :
                                 activity.color.includes('rose') ? '#e11d48' :
                                 activity.color.includes('red') ? '#dc2626' :
                                 activity.color.includes('yellow') ? '#ca8a04' :
                                 '#7c3aed',
                        }}>
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      )}
                    </div>

                    {/* Sparkle */}
                    <div className="flex-shrink-0 card-sparkle">
                      <Zap className="w-3.5 h-3.5 text-yellow-500 animate-pulse" fill="currentColor" />
                    </div>
                  </div>

                  {/* Bottom Accent */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${activity.color} opacity-60`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="ticker-spacer h-[66px]" style={{ flexShrink: 0 }} />
    </>
  );
}
