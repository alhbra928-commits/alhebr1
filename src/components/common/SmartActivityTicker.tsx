import { useState, useEffect, useMemo, useRef } from 'react';
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
    mode: 'real',
    scrollSpeed: 'medium',
    itemsPerCycle: 10,
    showTimestamps: true,
  });

  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

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

  // Debug Mode: يظهر فقط عند ?debug=1 (للاختبار الفني فقط)
  useEffect(() => {
    // ✅ لا يظهر إلا بـ ?debug=1
    const debugOn = new URLSearchParams(window.location.search).get("debug") === "1";
    if (!debugOn) {
      // إزالة Debug إذا كان موجوداً
      const existingDebug = document.getElementById("ticker-debug");
      if (existingDebug) existingDebug.remove();
      return;
    }

    // للاختبار فقط: إنشاء شريط Debug
    const el = document.getElementById("ticker-debug") || document.createElement("div");
    el.id = "ticker-debug";
    el.style.cssText =
      "position:fixed;left:8px;top:88px;z-index:2147483647;background:#000a;color:#fff;padding:6px 8px;border-radius:8px;font:12px system-ui;";
    if (!document.getElementById("ticker-debug")) {
      document.body.appendChild(el);
    }

    const group = groupRef.current;
    const track = trackRef.current;
    const mask = maskRef.current;
    const count = group ? group.querySelectorAll(".activity-card-agricultural").length : 0;
    const gw = group ? Math.round(group.getBoundingClientRect().width) : 0;
    const mw = mask ? Math.round(mask.getBoundingClientRect().width) : 0;
    const dur = track ? track.style.getPropertyValue("--ticker-speed") : "N/A";

    el.textContent = `items=${count} groupW=${gw}px maskW=${mw}px dur=${dur}`;

    return () => {
      // Cleanup عند unmount
      if (debugOn) {
        const debugEl = document.getElementById("ticker-debug");
        if (debugEl) debugEl.remove();
      }
    };
  }, [activities]);

  // المرحلة 3: Auto-Fill قاطع - منع الفراغ نهائياً (التكرار لملء 3× عرض الشاشة)
  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;
    const mask = maskRef.current;
    if (!track || !group || !mask || activities.length === 0) return;

    // احذف أي نسخ قديمة
    track.querySelectorAll("[data-clone='1']").forEach(n => n.remove());

    const groupW = group.getBoundingClientRect().width;
    const maskW = mask.getBoundingClientRect().width;

    if (groupW <= 0 || maskW <= 0) return;

    // ضع المتغيرات على track نفسه (محلية - ليس :root)
    track.style.setProperty("--group-w", `${groupW}px`);

    // احسب duration مخصص لهذا الجهاز (ديناميكي حسب groupW)
    const baseDuration = 14; // ثانية
    const duration = Math.max(10, Math.min(20, baseDuration * (groupW / 1800)));
    track.style.setProperty("--ticker-speed", `${duration}s`);

    // ✅ المطلوب: كرر المجموعة لتغطي 3× عرض الشاشة (منع الفراغ نهائياً)
    const targetW = maskW * 3;
    const needed = Math.ceil(targetW / groupW);

    for (let i = 0; i < needed; i++) {
      const clone = group.cloneNode(true) as HTMLDivElement;
      clone.dataset.clone = "1";
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    }
  }, [activities]);

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
          .is('deleted_at', null)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(settings.itemsPerCycle);

        if (realActivities) {
          items.push(...realActivities.map((act: any) => ({
            id: act.id,
            icon: act.activity_data?.icon || '✨',
            titleAr: act.activity_data?.title_ar || 'نشاط جديد',
            titleEn: act.activity_data?.title_en || 'New activity',
            timestamp: new Date(act.created_at),
            priority: act.priority || 10,
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
          id: 'no-activities',
          icon: '🌟',
          titleAr: 'ابدأ الآن وكن أول من يحجز في منصة مزادات',
          titleEn: 'Start now and be the first to book on Mazadat Platform',
          priority: 1,
          activityType: 'welcome',
        });
      }

      const sorted = items.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      setActivities(sorted);
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

  // المرحلة 2: نفس المحتوى على جميع الشاشات (لا إخفاء)
  const activityCards = useMemo(() => {
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
        /* Container - ثابت لجميع الشاشات */
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

        /* المرحلة 3(C): Animation دقيق بمقدار عرض المجموعة
         * المتغيرات --group-w و --ticker-speed محلية على .marquee-track
         * تُحسب في JS لكل جهاز منفصل (لا تعارض بين desktop/mobile)
         */
        @keyframes marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(calc(-1 * var(--group-w, -50%)), 0, 0);
          }
        }

        /* Mask Container */
        .marquee-mask {
          overflow: hidden;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
        }

        /* Track - موحد للجميع */
        .marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: marquee var(--ticker-speed, 14s) linear infinite;
          animation-delay: 0s;
          animation-play-state: running;
          transform: translateZ(0);
          backface-visibility: hidden;
          padding: 0 !important;
          margin: 0 !important;
          contain: layout style paint;
          -webkit-transform: translateZ(0);
          -webkit-backface-visibility: hidden;
        }

        /* Group Container */
        .marquee-group {
          display: flex;
          flex: 0 0 auto;
          width: max-content;
          gap: 10px;
          padding-inline: 10px;
          align-items: center;
        }

        /* Activity Card - موحد */
        .activity-card-agricultural {
          position: relative;
          padding: 8px 12px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.2) 100%);
          border: 1.5px solid rgba(34, 197, 94, 0.3);
          backdrop-filter: blur(10px);
          min-width: 180px;
          max-width: 180px;
          flex: 0 0 auto;
          white-space: nowrap;
          margin: 0 !important;
          transition: all 0.3s ease;
          cursor: default;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .activity-card-agricultural:hover {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(21, 128, 61, 0.3) 100%);
          border-color: rgba(34, 197, 94, 0.5);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
        }

        .card-hover-effect {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.03) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .activity-card-agricultural:hover .card-hover-effect {
          opacity: 1;
        }

        .card-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .card-icon-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .icon-glow {
          position: absolute;
          inset: -4px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .activity-card-agricultural:hover .icon-glow {
          opacity: 1;
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(21, 128, 61, 0.3) 100%);
          border-radius: 8px;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .icon-svg {
          width: 18px;
          height: 18px;
          color: #22c55e;
          filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.3));
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }

        .card-title {
          font-size: 13px;
          font-weight: 600;
          color: #d4f1e8;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .card-time {
          font-size: 10px;
          color: rgba(212, 241, 232, 0.6);
          font-weight: 500;
          white-space: nowrap;
        }

        /* Golden wave animation */
        @keyframes golden-wave {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .golden-wave {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(212, 175, 55, 0.4) 25%,
            rgba(212, 175, 55, 0.7) 50%,
            rgba(212, 175, 55, 0.4) 75%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: golden-wave 3s ease-in-out infinite;
        }

        /* Smooth animation optimization */
        @media (prefers-reduced-motion: no-preference) {
          .marquee-track {
            animation-timing-function: linear;
          }
        }

        /* Mobile Responsive - التنسيق البصري فقط */
        @media (max-width: 768px) {
          .activity-card-agricultural {
            padding: 6px 10px;
            min-width: 160px;
            max-width: 160px;
          }

          .icon-container {
            width: 28px;
            height: 28px;
          }

          .icon-svg {
            width: 16px;
            height: 16px;
          }

          .card-title {
            font-size: 12px;
          }

          .card-time {
            font-size: 9px;
          }

          .marquee-group {
            gap: 8px;
          }
        }

        /* Ultra compact for very small screens */
        @media (max-width: 480px) {
          .activity-card-agricultural {
            padding: 5px 8px;
            min-width: 150px;
            max-width: 150px;
          }

          .card-title {
            font-size: 11px;
          }

          .marquee-group {
            gap: 6px;
          }
        }
      `}</style>

      <div className="ticker-agricultural" dir="rtl">
        <div className="absolute top-0 left-0 right-0 h-[3px] golden-wave" />

        {/* المرحلة 3(A): Mask > Track > Group (التكرار التلقائي في useEffect) */}
        <div className="marquee-mask" ref={maskRef}>
          <div className="marquee-track" ref={trackRef}>
            <div className="marquee-group" ref={groupRef}>
              {activityCards}
            </div>
            {/* التكرار التلقائي يتم عبر JS في useEffect - يملأ 3× عرض الشاشة */}
          </div>
        </div>
      </div>
    </>
  );
}
