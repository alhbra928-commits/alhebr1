import { useState, useEffect, useMemo } from 'react';
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

  const getAnimationDuration = () => {
    switch (settings.scrollSpeed) {
      case 'fast': return '12s';
      case 'medium': return '16s';
      case 'slow': return '24s';
      default: return '16s';
    }
  };

  // إنشاء المحتوى مرة واحدة فقط واستخدامه مرتين (1:1 Copy)
  const tickerContent = useMemo(() => {
    return activities.map((activity) => {
      const IconComponent = iconMap[activity.icon] || Sparkles;

      return (
        <div
          key={activity.id}
          className="activity-card-agricultural"
        >
          <div className="card-hover-effect" />

          <div className="card-inner">
            <div className="card-icon-wrapper">
              <div className="icon-glow" />
              <div className="icon-container">
                <IconComponent className="icon-svg" strokeWidth={2.5} />
              </div>
            </div>

            <div className="card-content">
              <div className="card-title">
                {activity.titleAr}
              </div>
              {settings.showTimestamps && activity.timestamp && (
                <div className="card-time">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });
  }, [activities, settings.showTimestamps]);

  if (!settings || activities.length === 0) return null;

  return (
    <>
      <style>{`
        /* قفل الـ container */
        .ticker-agricultural {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(44, 95, 45, 0.95) 0%, rgba(30, 70, 32, 0.98) 100%);
          border-top: 3px solid rgba(212, 175, 55, 0.5);
          overflow: hidden;
          -webkit-text-size-adjust: 100%;
          padding: 0 !important;
          margin: 0 !important;
          contain: layout style paint;
          isolation: isolate;
        }

        /* CSS Marquee - Desktop Animation */
        @keyframes marquee-desktop {
          0% {
            transform: translateX(0) translateZ(0);
          }
          100% {
            transform: translateX(-50%) translateZ(0);
          }
        }

        /* CSS Marquee - Mobile Animation (منفصل تماماً - أسرع) */
        @keyframes marquee-mobile {
          0% {
            transform: translateX(0) translateZ(0);
          }
          100% {
            transform: translateX(-10%) translateZ(0);
          }
        }

        /* Smooth animation optimization */
        @media (prefers-reduced-motion: no-preference) {
          .marquee-track-desktop,
          .marquee-track-mobile {
            animation-timing-function: linear;
          }
        }

        /* فصل الشاشات - Desktop فقط */
        .ticker-desktop {
          display: flex;
        }

        .ticker-mobile {
          display: none;
        }

        .ticker-overflow-container {
          position: relative;
          height: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Desktop Track - Animation منفصلة */
        .marquee-track-desktop {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: marquee-desktop ${getAnimationDuration()} linear infinite;
          transform: translateZ(0);
          backface-visibility: hidden;
          padding: 0 !important;
          margin: 0 !important;
          contain: layout style paint;
          -webkit-transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Mobile Track - Animation منفصلة تماماً (أسرع 40%) */
        .marquee-track-mobile {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: marquee-mobile 10s linear infinite;
          transform: translateZ(0);
          backface-visibility: hidden;
          padding: 0 !important;
          margin: 0 !important;
          contain: layout style paint;
          -webkit-transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          perspective: 1000px;
        }

        .marquee-group {
          display: flex;
          flex: 0 0 auto;
          width: max-content;
          gap: 6px;
          padding: 0 !important;
          margin: 0 !important;
          contain: layout style paint;
        }

        /* البطاقة - قفل الأبعاد */
        .activity-card-agricultural {
          flex: 0 0 auto;
          position: relative;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%);
          border: 2px solid rgba(212, 175, 55, 0.5);
          border-radius: 10px;
          padding: 8px 12px;
          white-space: nowrap;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          margin: 0 !important;
          overflow: hidden;
          min-width: fit-content;
        }

        .activity-card-agricultural:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
          border-color: rgba(212, 175, 55, 0.8);
        }

        .card-hover-effect {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s;
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(67, 160, 71, 0.2) 100%);
          pointer-events: none;
        }

        .activity-card-agricultural:hover .card-hover-effect {
          opacity: 1;
        }

        .card-inner {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-icon-wrapper {
          position: relative;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }

        .icon-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #D4AF37 0%, #C49423 100%);
          border-radius: 6px;
          filter: blur(6px);
          opacity: 0.5;
          animation: pulse 2s ease-in-out infinite;
        }

        .icon-container {
          position: relative;
          width: 28px;
          height: 28px;
          padding: 5px;
          border-radius: 6px;
          background: linear-gradient(135deg, #D4AF37 0%, #C49423 100%);
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-svg {
          width: 14px;
          height: 14px;
          color: white;
        }

        .card-content {
          flex: 1;
          min-width: 0;
          text-align: right;
        }

        .card-title {
          font-weight: 800;
          font-size: 13px;
          line-height: 1.2;
          margin-bottom: 3px;
          color: #F5F5DC;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .card-time {
          font-size: 11px;
          font-weight: 700;
          color: #D4AF37;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }

        /* الموجة الذهبية */
        @keyframes golden-wave {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .golden-wave {
          background: linear-gradient(90deg, rgba(212, 175, 55, 0.3), rgba(196, 148, 31, 0.5), rgba(212, 175, 55, 0.3));
          background-size: 200% 100%;
          animation: golden-wave 3s ease infinite;
        }

        /* Mobile Optimization - عرض Mobile وإخفاء Desktop */
        @media (max-width: 768px) {
          /* إخفاء Desktop وإظهار Mobile */
          .ticker-desktop {
            display: none !important;
          }

          .ticker-mobile {
            display: flex !important;
          }

          .marquee-group {
            gap: 2px !important;
            padding: 0 !important;
          }

          .activity-card-agricultural {
            padding: 6px 9px;
            border-radius: 8px;
            min-width: 175px;
            max-width: 175px;
          }

          .card-inner {
            gap: 8px;
          }

          .card-icon-wrapper {
            width: 26px !important;
            height: 26px !important;
          }

          .icon-container {
            width: 26px !important;
            height: 26px !important;
            padding: 4px !important;
          }

          .icon-svg {
            width: 13px !important;
            height: 13px !important;
          }

          .card-title {
            font-size: 12px !important;
            line-height: 1.1 !important;
          }

          .card-time {
            font-size: 10px !important;
          }
        }

        /* Ultra compact for very small screens */
        @media (max-width: 480px) {
          .marquee-group {
            gap: 1px !important;
            padding: 0 !important;
          }

          .activity-card-agricultural {
            padding: 5px 8px;
            min-width: 170px;
            max-width: 170px;
          }

          .card-title {
            font-size: 11px !important;
          }
        }
      `}</style>

      <div className="ticker-agricultural" dir="rtl">
        <div className="absolute top-0 left-0 right-0 h-[3px] golden-wave" />

        {/* Desktop Ticker - مخفي على الموبايل */}
        <div className="ticker-overflow-container ticker-desktop">
          <div className="marquee-track marquee-track-desktop">
            {/* Group 1 - المحتوى الأصلي */}
            <div className="marquee-group">
              {tickerContent}
            </div>

            {/* Group 2 - نسخة مطابقة 1:1 */}
            <div className="marquee-group" aria-hidden="true">
              {tickerContent}
            </div>
          </div>
        </div>

        {/* Mobile Ticker - مخفي على الكمبيوتر */}
        <div className="ticker-overflow-container ticker-mobile">
          <div className="marquee-track marquee-track-mobile">
            {/* تكرار 10 مرات للموبايل - حلقة سلسة 100% */}
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="marquee-group" aria-hidden={index > 0}>
                {tickerContent}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
