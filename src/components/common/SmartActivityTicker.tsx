import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, Users, MapPin, Award, Sparkles, Calendar,
  TreePine, Leaf, Home, CheckCircle, DollarSign, Star
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
  glow: string;
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

    // Realtime subscription
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

    const speeds = { slow: 40, medium: 60, fast: 80 };
    const speed = speeds[settings.scrollSpeed] || 60;

    const animate = () => {
      setScrollPosition((prev) => {
        const newPosition = prev + 0.8;
        const maxScroll = scrollContainer.scrollWidth / 2;
        return newPosition >= maxScroll ? 0 : newPosition;
      });
    };

    const animationId = setInterval(animate, speed);
    return () => clearInterval(animationId);
  }, [activities, settings.scrollSpeed]);

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

      // Load real activities
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
              color: getColorForType(act.activity_type),
              glow: getGlowForType(act.activity_type),
            }))
          );
        }
      }

      // Load simulated activities
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
              color: getColorForCategory(act.activity_category),
              glow: getGlowForCategory(act.activity_category),
            }))
          );
        }
      }

      // Shuffle and triple for seamless continuous scroll on mobile
      const shuffled = items.sort(() => Math.random() - 0.5);
      setActivities([...shuffled, ...shuffled, ...shuffled]);
    } catch (error) {
      console.error('[Ticker] Error loading activities:', error);
    }
  };

  const getColorForType = (type: string) => {
    const colors: Record<string, string> = {
      booking: 'from-emerald-500 to-teal-500',
      investor_join: 'from-blue-500 to-cyan-500',
      farm_added: 'from-green-500 to-lime-500',
      certificate: 'from-amber-500 to-orange-500',
      payment: 'from-purple-500 to-pink-500',
      trending: 'from-rose-500 to-red-500',
      milestone: 'from-yellow-500 to-amber-500',
      stats: 'from-indigo-500 to-blue-500',
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  const getGlowForType = (type: string) => {
    const glows: Record<string, string> = {
      booking: 'shadow-emerald-500/50',
      investor_join: 'shadow-blue-500/50',
      farm_added: 'shadow-green-500/50',
      certificate: 'shadow-amber-500/50',
      payment: 'shadow-purple-500/50',
      trending: 'shadow-rose-500/50',
      milestone: 'shadow-yellow-500/50',
      stats: 'shadow-indigo-500/50',
    };
    return glows[type] || 'shadow-gray-500/50';
  };

  const getColorForCategory = (category: string) => {
    const colors: Record<string, string> = {
      booking: 'from-emerald-500 to-teal-500',
      trending: 'from-rose-500 to-red-500',
      stats: 'from-indigo-500 to-blue-500',
      milestone: 'from-yellow-500 to-amber-500',
      interest: 'from-purple-500 to-pink-500',
    };
    return colors[category] || 'from-gray-500 to-slate-500';
  };

  const getGlowForCategory = (category: string) => {
    const glows: Record<string, string> = {
      booking: 'shadow-emerald-500/50',
      trending: 'shadow-rose-500/50',
      stats: 'shadow-indigo-500/50',
      milestone: 'shadow-yellow-500/50',
      interest: 'shadow-purple-500/50',
    };
    return glows[category] || 'shadow-gray-500/50';
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'الآن';
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
    return `منذ ${Math.floor(seconds / 86400)} يوم`;
  };

  if (activities.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }

        .ticker-glass {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.05) 100%
          );
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow:
            0 -10px 40px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .activity-card {
          transform-style: preserve-3d;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.25) 0%,
            rgba(255, 255, 255, 0.1) 100%
          );
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .activity-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow:
            0 15px 50px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }

        .shimmer-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
          pointer-events: none;
        }

        .gradient-border {
          position: relative;
          background: linear-gradient(90deg,
            rgba(16, 185, 129, 0.5),
            rgba(59, 130, 246, 0.5),
            rgba(168, 85, 247, 0.5),
            rgba(239, 68, 68, 0.5)
          );
          background-size: 200% 100%;
          animation: gradient-shift 3s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Mobile Responsive - No Gaps */
        @media (max-width: 768px) {
          .ticker-glass {
            border-radius: 0 !important;
            left: 0 !important;
            right: 0 !important;
            margin: 0 !important;
            width: 100vw !important;
            height: 56px !important;
          }

          .ticker-spacer {
            height: 56px !important;
          }

          .activity-card {
            min-width: 200px !important;
            padding: 8px 10px !important;
          }
        }

        /* iOS Safe Area */
        @supports (padding: max(0px)) {
          .ticker-glass {
            padding-bottom: max(8px, env(safe-area-inset-bottom));
          }
        }
      `}</style>

      {/* Fixed Ticker Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 ticker-glass z-40"
        style={{
          height: '70px',
        }}
        dir="rtl"
      >
        {/* Animated Gradient Border */}
        <div
          className="gradient-border absolute top-0 left-0 right-0"
          style={{ height: '3px' }}
        />

        {/* Scrolling Content */}
        <div className="relative h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

          <div
            ref={scrollContainerRef}
            className="flex items-center h-full gap-2 sm:gap-3 px-1 sm:px-2"
            style={{
              transform: `translateX(-${scrollPosition}px)`,
              willChange: 'transform',
            }}
          >
            {activities.map((activity, index) => {
              const IconComponent = iconMap[activity.icon] || Sparkles;

              return (
                <div
                  key={`${activity.id}-${index}`}
                  className="activity-card rounded-xl sm:rounded-2xl p-2 sm:p-3 min-w-[240px] sm:min-w-[280px] relative overflow-hidden group flex-shrink-0"
                  style={{
                    animation: `float ${2.5 + (index % 3) * 0.5}s ease-in-out infinite`,
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {/* Shimmer Effect */}
                  <div className="shimmer-effect" />

                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${activity.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                  />

                  <div className="relative flex items-center gap-2 sm:gap-3">
                    {/* Icon */}
                    <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br ${activity.color} ${activity.glow} shadow-lg flex-shrink-0`}>
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate drop-shadow-sm">
                          {activity.titleAr}
                        </span>
                      </div>
                      {settings.showTimestamps && activity.timestamp && (
                        <div className="text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      )}
                    </div>

                    <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse flex-shrink-0" />
                  </div>

                  {/* Bottom Glow Line */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${activity.color} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Decorative Particles */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                left: `${i * 16.67}%`,
                top: '50%',
                animation: `float ${2 + (i % 2)}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Spacer - Responsive */}
      <div className="ticker-spacer h-[70px] md:h-[70px]" style={{ flexShrink: 0 }} />
    </>
  );
}
