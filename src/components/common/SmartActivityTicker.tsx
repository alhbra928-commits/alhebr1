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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

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

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || activities.length === 0) return;

    const isMobile = window.innerWidth <= 768;
    let animationId: number;
    let lastTimestamp = 0;

    if (isMobile) {
      // سرعة البكسلات في الثانية للموبايل
      const pixelsPerSecond = settings.scrollSpeed === 'fast' ? 120 :
                              settings.scrollSpeed === 'medium' ? 80 : 50;

      const animate = (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        setScrollPosition((prev) => {
          // حساب المسافة بناءً على الوقت الفعلي
          const distance = (pixelsPerSecond * deltaTime) / 1000;
          // عرض نصف المحتوى للدورة السلسة
          const contentWidth = scrollContainer.scrollWidth / 2;
          const newPosition = prev + distance;
          return newPosition >= contentWidth ? newPosition - contentWidth : newPosition;
        });

        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    } else {
      const pixelsPerSecond = settings.scrollSpeed === 'fast' ? 80 :
                              settings.scrollSpeed === 'medium' ? 50 : 30;

      const animate = (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        setScrollPosition((prev) => {
          const distance = (pixelsPerSecond * deltaTime) / 1000;
          const contentWidth = scrollContainer.scrollWidth / 3;
          const newPosition = prev + distance;
          return newPosition >= contentWidth ? newPosition - contentWidth : newPosition;
        });

        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
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
        const { data: realActivities, error } = await supabase
          .from('platform_activities')
          .select('*')
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(settings.itemsPerCycle);

        if (error) {
          console.error('[Ticker] Error loading activities:', error);
        } else if (realActivities && realActivities.length > 0) {
          console.log('[Ticker] Loaded activities:', realActivities.length);
          items.push(
            ...realActivities.map((act) => ({
              id: act.id,
              icon: act.activity_data?.icon || '✨',
              titleAr: act.activity_data?.title_ar || act.activity_data?.farm_name || 'نشاط',
              titleEn: act.activity_data?.title_en || 'Activity',
              timestamp: act.created_at ? new Date(act.created_at) : undefined,
              priority: act.priority || 5,
              activityType: act.activity_type,
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
              activityType: act.activity_category,
              timestamp: undefined,
            }))
          );
        }
      }

      if (items.length === 0) {
        items.push({
          id: 'default-1',
          icon: '🌴',
          titleAr: 'أهلاً بكم في منصة الحبر الزراعية',
          titleEn: 'Welcome to Al-Hubr Platform',
          priority: 10,
          activityType: 'welcome',
        });
      }

      const shuffled = items.sort(() => Math.random() - 0.5);
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // تكرار مرتين فقط للموبايل - سنستخدم حساب الدورة للحركة السلسة
        const mobileRepeated = [...shuffled, ...shuffled];
        setActivities(mobileRepeated);
      } else {
        const desktopRepeated = [...shuffled, ...shuffled, ...shuffled];
        setActivities(desktopRepeated);
      }
    } catch (error) {
      console.error('[Ticker] Error loading activities:', error);
    }
  };

  const getColorForType = (type: string): string => {
    const colors: Record<string, string> = {
      booking: '#16a34a',
      new_booking: '#16a34a',
      investor_join: '#0891b2',
      farm_added: '#22c55e',
      certificate: '#f59e0b',
      payment: '#dc2626',
      trending: '#ef4444',
      milestone: '#eab308',
      stats: '#8b5cf6',
      welcome: '#D4AF37',
    };
    return colors[type] || '#16a34a';
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
        @keyframes slide-in-ticker {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.4); }
          50% { box-shadow: 0 0 25px rgba(212, 175, 55, 0.6); }
        }

        .ticker-agricultural {
          background: linear-gradient(135deg, rgba(44, 95, 45, 0.95) 0%, rgba(30, 70, 32, 0.98) 50%, rgba(44, 95, 45, 0.95) 100%);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-top: 3px solid rgba(212, 175, 55, 0.5);
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(212, 175, 55, 0.2);

          /* CRITICAL iOS FIX: تثبيت الارتفاع بشكل جذري */
          height: var(--footer-h) !important;
          min-height: var(--footer-h) !important;
          max-height: var(--footer-h) !important;
          overflow: hidden !important;
          display: flex !important;
          align-items: center !important;
          line-height: 1 !important;

          /* منع أي تغيير في الطبقة */
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .activity-card-agricultural {
          animation: slide-in-ticker 0.5s ease-out backwards;
          border-radius: 16px;
          border: 2px solid rgba(212, 175, 55, 0.5);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%);
          box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 20px rgba(212, 175, 55, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .activity-card-agricultural:hover {
          transform: translate3d(0, -3px, 0) scale(1.03);
          box-shadow: 0 15px 35px -4px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(212, 175, 55, 0.6) inset, 0 0 30px rgba(212, 175, 55, 0.3);
          border-color: rgba(212, 175, 55, 0.8);
        }

        .golden-accent {
          background: linear-gradient(135deg, #D4AF37 0%, #C49423 100%);
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
        }

        .golden-text {
          color: #D4AF37;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
        }

        .beige-text {
          color: #F5F5DC;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        /* تحسينات الأداء للموبايل */
        @media (max-width: 768px) {
          .scroll-container {
            -webkit-overflow-scrolling: touch;
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
          }

          .activity-card-agricultural {
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
          }
        }

        @media (max-width: 768px) {
          .activity-card-agricultural {
            min-width: 165px !important;
            max-width: 165px !important;
            padding: 6px 8px !important;
            border-radius: 8px !important;
            margin: 0 1px !important;
            flex-shrink: 0 !important;
          }

          .card-icon-wrapper {
            width: 24px !important;
            height: 24px !important;
          }

          .card-icon-wrapper svg {
            width: 13px !important;
            height: 13px !important;
          }

          .card-title {
            font-size: 11px !important;
            line-height: 1.25 !important;
          }

          .card-time {
            font-size: 9px !important;
          }
        }

        .scroll-container {
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          -webkit-transform: translate3d(0, 0, 0);
          perspective: 1000px;
          -webkit-perspective: 1000px;
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
      `}</style>

      {/* الشريط المتحرك - يأخذ الثبات من appFooter */}
      <div className="relative w-full h-full ticker-agricultural" dir="rtl">
        <div className="absolute top-0 left-0 right-0 h-[3px] golden-wave" />

        <div className="relative h-full overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="scroll-container flex items-center h-full gap-0 px-0"
            style={{ transform: `translate3d(-${scrollPosition}px, 0, 0)` }}
          >
            {activities.map((activity, index) => {
              const IconComponent = iconMap[activity.icon] || Sparkles;

              return (
                <div
                  key={`${activity.id}-${index}`}
                  className="activity-card-agricultural relative overflow-hidden flex-shrink-0"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    minWidth: '240px',
                    padding: '10px 12px',
                  }}
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

                    <div className="flex-shrink-0 card-sparkle">
                      <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" fill="currentColor" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 golden-accent opacity-80" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
