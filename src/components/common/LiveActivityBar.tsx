import { useState, useEffect } from 'react';
import {
  TreePine, Calendar, UserPlus, CheckCircle, Award,
  Sprout, Target, Trophy, Sparkles, Gem, Gift, Shield
} from 'lucide-react';
import { liveActivityBarService, ActivityEvent, ActivityBarSettings } from '../../services/liveActivityBarService';

const iconMap: Record<string, any> = {
  TreePine,
  Calendar,
  UserPlus,
  CheckCircle,
  Award,
  Sprout,
  Target,
  Trophy,
  Sparkles,
  Gem,
  Gift,
  Shield
};

export function LiveActivityBar() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [settings, setSettings] = useState<ActivityBarSettings | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // الاشتراك في الأحداث والإعدادات
    const unsubscribeEvents = liveActivityBarService.subscribeToEvents(setEvents);
    const unsubscribeSettings = liveActivityBarService.subscribeToSettings(setSettings);

    return () => {
      unsubscribeEvents();
      unsubscribeSettings();
    };
  }, []);

  // إخفاء الشريط إذا كان معطلاً
  useEffect(() => {
    if (settings) {
      setIsVisible(settings.enabled);
    }
  }, [settings]);

  if (!isVisible || !settings || events.length === 0) {
    return null;
  }

  // حساب مدة الحركة بناءً على السرعة
  const animationDuration = Math.max(15, 60 - settings.speed);

  // مكون الحدث الواحد
  const EventItem = ({ event }: { event: ActivityEvent }) => {
    const IconComponent = iconMap[event.icon] || CheckCircle;

    return (
      <div
        className="flex items-center gap-3 px-6 py-1 whitespace-nowrap group relative"
        style={{ color: settings.text_color }}
      >
        {/* حاوية الأيقونة مع تأثيرات 3D */}
        <div className="relative flex-shrink-0">
          {/* توهج خلفي */}
          <div
            className="absolute inset-0 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300"
            style={{
              backgroundColor: settings.text_color,
              transform: 'scale(1.5)'
            }}
          />

          {/* خلفية الأيقونة */}
          <div
            className="relative rounded-full p-2 backdrop-blur-sm shadow-lg transform group-hover:scale-110 transition-transform duration-300"
            style={{
              background: `linear-gradient(135deg, ${settings.text_color}20, ${settings.text_color}10)`,
              border: `1px solid ${settings.text_color}30`
            }}
          >
            <IconComponent className="h-4 w-4 drop-shadow-lg" />
          </div>
        </div>

        {/* النص */}
        <span
          className="font-medium text-sm drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300"
          style={{
            textShadow: `0 0 10px ${settings.text_color}40`
          }}
        >
          {event.message}
        </span>

        {/* فاصل مبتكر */}
        <div className="flex items-center gap-1 mx-3 opacity-50">
          <div
            className="w-1 h-1 rounded-full animate-pulse"
            style={{ backgroundColor: settings.text_color }}
          />
          <div
            className="w-1 h-1 rounded-full animate-pulse"
            style={{
              backgroundColor: settings.text_color,
              animationDelay: '0.2s'
            }}
          />
          <div
            className="w-1 h-1 rounded-full animate-pulse"
            style={{
              backgroundColor: settings.text_color,
              animationDelay: '0.4s'
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] overflow-hidden shadow-2xl border-b"
      style={{
        backgroundColor: settings.background_color,
        height: settings.height,
        backdropFilter: 'blur(12px)',
        borderColor: `${settings.text_color}20`
      }}
    >
      {/* Dual Marquee - نسختين متطابقتين تتحركان بشكل متزامن لضمان عدم وجود فجوات */}
      <div className="relative h-full flex items-center">
        {/* المجموعة الأولى */}
        <div
          className="flex items-center h-full animate-scroll-seamless"
          style={{
            animationDuration: `${animationDuration}s`,
            minWidth: 'fit-content'
          }}
        >
          {events.map((event) => (
            <EventItem key={`group1-${event.id}`} event={event} />
          ))}
        </div>

        {/* المجموعة الثانية - نسخة متطابقة */}
        <div
          className="flex items-center h-full animate-scroll-seamless"
          style={{
            animationDuration: `${animationDuration}s`,
            minWidth: 'fit-content'
          }}
        >
          {events.map((event) => (
            <EventItem key={`group2-${event.id}`} event={event} />
          ))}
        </div>

        {/* المجموعة الثالثة - لضمان ملء الشاشة */}
        <div
          className="flex items-center h-full animate-scroll-seamless"
          style={{
            animationDuration: `${animationDuration}s`,
            minWidth: 'fit-content'
          }}
        >
          {events.map((event) => (
            <EventItem key={`group3-${event.id}`} event={event} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll-seamless {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }

        .animate-scroll-seamless {
          animation: scroll-seamless linear infinite;
          animation-play-state: running;
          will-change: transform;
        }

        /* إيقاف مؤقت عند التحويم */
        .fixed:hover .animate-scroll-seamless {
          animation-play-state: paused;
        }

        /* تحسين الأداء */
        .animate-scroll-seamless {
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
