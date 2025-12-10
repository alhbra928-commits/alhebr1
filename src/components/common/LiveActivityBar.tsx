import { useState, useEffect, useRef } from 'react';
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
  const marqueeRef = useRef<HTMLDivElement>(null);

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

  // دمج الأحداث للعرض المستمر (تكرارها 4 مرات لضمان عدم وجود فراغات)
  const displayEvents = [...events, ...events, ...events, ...events];

  // حساب مدة الحركة بناءً على السرعة (سرعة أفضل)
  const animationDuration = `${Math.max(20, 80 - settings.speed)}s`;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] overflow-hidden shadow-lg"
      style={{
        backgroundColor: settings.background_color,
        height: settings.height,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        ref={marqueeRef}
        className="flex items-center h-full"
        style={{
          animation: `marquee ${animationDuration} linear infinite`,
          width: 'fit-content',
        }}
      >
        {displayEvents.map((event, index) => {
          const IconComponent = iconMap[event.icon] || CheckCircle;

          return (
            <div
              key={`${event.id}-${index}`}
              className="flex items-center gap-3 px-8 whitespace-nowrap"
              style={{
                color: settings.text_color,
              }}
            >
              <IconComponent className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium text-sm">{event.message}</span>
              <span className="text-xs opacity-70 mx-4">•</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-25%);
          }
        }

        /* الحركة تستمر بدون توقف - سلسة تماماً */
        .fixed > div {
          will-change: transform;
        }

        /* إيقاف الحركة عند التحويم */
        .fixed:hover > div {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
