import { useState, useEffect } from 'react';
import {
  TrendingUp, Users, MapPin, Award, Sparkles,
  TreePine, Leaf, Home, DollarSign, Star
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Activity {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  timestamp?: Date;
  priority: number;
  activityType: string;
}

interface TickerSettings {
  mode: 'simulation' | 'real' | 'hybrid';
  scrollSpeed: 'slow' | 'medium' | 'fast';
  itemsPerCycle: number;
  showTimestamps: boolean;
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
  });

  useEffect(() => {
    loadSettings();
    loadActivities();

    const channel = supabase
      .channel('ticker_realtime_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'platform_activities' },
        (payload) => {
          console.log('[Ticker] Real-time platform activities event:', payload.eventType);
          loadActivities();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'simulated_activities' },
        (payload) => {
          console.log('[Ticker] Real-time simulated activities event:', payload.eventType);
          loadActivities();
        }
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
    loadActivities();
  }, [settings.mode, settings.itemsPerCycle]);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('activity_ticker_settings')
        .select('*')
        .single();

      if (data) {
        setSettings({
          mode: data.mode || 'hybrid',
          scrollSpeed: data.scroll_speed || 'medium',
          itemsPerCycle: data.items_per_cycle || 10,
          showTimestamps: data.show_timestamps ?? true,
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
          .order('created_at', { ascending: false })
          .limit(settings.itemsPerCycle);

        if (realActivities) {
          items.push(...realActivities.map((act: any) => ({
            id: act.id,
            icon: act.icon || '✨',
            titleAr: act.title_ar,
            titleEn: act.title_en,
            timestamp: new Date(act.created_at),
            priority: 10,
            activityType: 'real',
          })));
        }
      }

      if (settings.mode === 'simulation' || settings.mode === 'hybrid') {
        const neededCount = settings.itemsPerCycle - items.length;
        if (neededCount > 0) {
          const { data: simActivities } = await supabase
            .from('simulated_activities')
            .select('*')
            .eq('is_active', true)
            .order('priority', { ascending: false })
            .limit(neededCount);

          if (simActivities) {
            items.push(...simActivities.map((act: any) => ({
              id: act.id,
              icon: act.icon || '✨',
              titleAr: act.title_ar,
              titleEn: act.title_en,
              priority: act.priority || 1,
              activityType: 'simulation',
            })));
          }
        }
      }

      if (items.length === 0) {
        items.push({
          id: 'welcome',
          icon: '⭐',
          titleAr: 'مرحباً بك في منصة مزادات',
          titleEn: 'Welcome to Mazadat Platform',
          priority: 1,
          activityType: 'welcome',
        });
      }

      const shuffled = items.sort(() => Math.random() - 0.5);
      setActivities(shuffled);
    } catch (error) {
      console.error('[Ticker] Error loading activities:', error);
    }
  };

  const getColorForType = (type: string): string => {
    const colors: Record<string, string> = {
      real: 'rgba(212, 175, 55, 0.9)',
      simulation: 'rgba(212, 175, 55, 0.7)',
      welcome: 'rgba(212, 175, 55, 0.85)',
    };
    return colors[type] || colors.welcome;
  };

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'الآن';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  // حساب مدة الأنيميشن بناءً على السرعة
  const getAnimationDuration = () => {
    switch (settings.scrollSpeed) {
      case 'fast': return '10s';
      case 'medium': return '14s';
      case 'slow': return '20s';
      default: return '14s';
    }
  };

  if (!settings || activities.length === 0) return null;

  return (
    <>
      <style>{`
        .ticker-agricultural {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(44, 95, 45, 0.95) 0%, rgba(30, 70, 32, 0.98) 100%);
          border-top: 3px solid rgba(212, 175, 55, 0.5);
          overflow: hidden;
          -webkit-text-size-adjust: 100%;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .marquee-track {
          display: flex;
          width: fit-content;
          animation: marquee ${getAnimationDuration()} linear infinite;
          will-change: transform;
        }

        .marquee-group {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
          min-width: 100%;
        }

        .activity-card-agricultural {
          flex-shrink: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%);
          border: 2px solid rgba(212, 175, 55, 0.5);
          border-radius: 12px;
          padding: 10px 14px;
          white-space: nowrap;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .activity-card-agricultural:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
          border-color: rgba(212, 175, 55, 0.8);
        }

        .golden-accent {
          background: linear-gradient(135deg, #D4AF37 0%, #C49423 100%);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
        }

        .beige-text {
          color: #F5F5DC;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .golden-text {
          color: #D4AF37;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }

        @keyframes golden-wave {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .golden-wave {
          background: linear-gradient(90deg, rgba(212, 175, 55, 0.3), rgba(196, 148, 31, 0.5), rgba(212, 175, 55, 0.3));
          background-size: 200% 100%;
          animation: golden-wave 3s ease infinite;
        }

        @media (max-width: 768px) {
          .marquee-group {
            gap: 10px;
          }

          .activity-card-agricultural {
            padding: 8px 12px;
            border-radius: 10px;
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
          }

          .card-time {
            font-size: 10px !important;
          }
        }
      `}</style>

      <div className="relative w-full h-full ticker-agricultural" dir="rtl">
        <div className="absolute top-0 left-0 right-0 h-[3px] golden-wave" />

        <div className="relative h-full overflow-hidden flex items-center">
          <div className="marquee-track">
            {/* Group 1 - المحتوى الأصلي */}
            <div className="marquee-group">
              {activities.map((activity, index) => {
                const IconComponent = iconMap[activity.icon] || Sparkles;

                return (
                  <div
                    key={`group1-${activity.id}-${index}`}
                    className="activity-card-agricultural relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 blur-xl" />
                    </div>

                    <div className="relative flex items-center gap-2.5">
                      <div className="relative card-icon-wrapper flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                        <div className="absolute inset-0 golden-accent rounded-lg blur-md opacity-60 animate-pulse" />
                        <div className="relative p-1.5 rounded-lg golden-accent shadow-lg flex items-center justify-center" style={{ width: '32px', height: '32px' }}>
                          <IconComponent className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 text-right">
                        <div className="card-title font-black text-sm leading-tight mb-1 beige-text">
                          {activity.titleAr}
                        </div>
                        {settings.showTimestamps && activity.timestamp && (
                          <div className="card-time text-xs font-bold golden-text">
                            {formatTimeAgo(activity.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Group 2 - تكرار المحتوى */}
            <div className="marquee-group">
              {activities.map((activity, index) => {
                const IconComponent = iconMap[activity.icon] || Sparkles;

                return (
                  <div
                    key={`group2-${activity.id}-${index}`}
                    className="activity-card-agricultural relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 blur-xl" />
                    </div>

                    <div className="relative flex items-center gap-2.5">
                      <div className="relative card-icon-wrapper flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                        <div className="absolute inset-0 golden-accent rounded-lg blur-md opacity-60 animate-pulse" />
                        <div className="relative p-1.5 rounded-lg golden-accent shadow-lg flex items-center justify-center" style={{ width: '32px', height: '32px' }}>
                          <IconComponent className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 text-right">
                        <div className="card-title font-black text-sm leading-tight mb-1 beige-text">
                          {activity.titleAr}
                        </div>
                        {settings.showTimestamps && activity.timestamp && (
                          <div className="card-time text-xs font-bold golden-text">
                            {formatTimeAgo(activity.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
