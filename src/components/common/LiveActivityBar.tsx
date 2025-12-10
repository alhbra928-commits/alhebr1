import { useState, useEffect, useRef } from 'react';
import {
  TreePine, Calendar, UserPlus, CheckCircle, Award,
  Sprout, Target, Trophy, Sparkles, Gem, Gift, Shield, Star, Zap
} from 'lucide-react';
import { liveActivityBarService, ActivityEvent, ActivityBarSettings } from '../../services/liveActivityBarService';

const iconMap: Record<string, any> = {
  TreePine, Calendar, UserPlus, CheckCircle, Award,
  Sprout, Target, Trophy, Sparkles, Gem, Gift, Shield, Star, Zap
};

export function LiveActivityBar() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [settings, setSettings] = useState<ActivityBarSettings | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const animationRef = useRef<number>();
  const isPausedRef = useRef(false);
  const singleLoopWidthRef = useRef(0);

  useEffect(() => {
    const unsubscribeEvents = liveActivityBarService.subscribeToEvents(setEvents);
    const unsubscribeSettings = liveActivityBarService.subscribeToSettings(setSettings);

    return () => {
      unsubscribeEvents();
      unsubscribeSettings();
    };
  }, []);

  useEffect(() => {
    if (settings) {
      setIsVisible(settings.enabled);
    }
  }, [settings]);

  // حساب عرض loop واحدة بدقة
  useEffect(() => {
    if (wrapperRef.current && events.length > 0) {
      // انتظار render كامل
      setTimeout(() => {
        if (wrapperRef.current) {
          // العرض الحقيقي = نصف scrollWidth (لأن لدينا نسختين)
          singleLoopWidthRef.current = wrapperRef.current.scrollWidth / 2;
        }
      }, 100);
    }
  }, [events]);

  // نظام Seamless Infinite Scroll الحقيقي - بدون gaps مطلقاً
  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current || events.length === 0 || !settings) return;

    const container = containerRef.current;
    const speed = settings.speed / 10;

    const animate = () => {
      if (!isPausedRef.current && container && singleLoopWidthRef.current > 0) {
        // تحريك مستمر
        positionRef.current -= speed;

        // الحل الجذري: عندما نصل لنهاية loop، نعيد تموضع بإضافة loopWidth
        // هذا يحافظ على السلاسة التامة بدون أي قفزة
        const loopWidth = singleLoopWidthRef.current;

        // بدلاً من reset إلى 0، نضيف loopWidth (يعطي نفس النتيجة لكن بسلاسة)
        while (positionRef.current <= -loopWidth) {
          positionRef.current += loopWidth;
        }

        container.style.transform = `translateX(${positionRef.current}px)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [events, settings]);

  if (!isVisible || !settings || events.length === 0) {
    return null;
  }

  // نسختين فقط كافيتان مع الحساب الصحيح
  const doubledEvents = [...events, ...events];

  const EventItem = ({ event, index }: { event: ActivityEvent; index: number }) => {
    const IconComponent = iconMap[event.icon] || CheckCircle;

    return (
      <div
        className="flex items-center gap-4 px-8 whitespace-nowrap group relative"
        style={{ color: settings.text_color }}
      >
        {/* أيقونة مبتكرة بتصميم 3D متقدم */}
        <div className="relative flex-shrink-0">
          {/* طبقة التوهج الخارجية - متحركة */}
          <div
            className="absolute -inset-2 rounded-full blur-xl opacity-50 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${settings.text_color}60, transparent)`,
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />

          {/* طبقة التوهج المتوسطة */}
          <div
            className="absolute -inset-1 rounded-full blur-md opacity-60"
            style={{
              background: `linear-gradient(135deg, ${settings.text_color}80, ${settings.text_color}40)`,
            }}
          />

          {/* الأيقونة الرئيسية */}
          <div
            className="relative rounded-xl p-2.5 backdrop-blur-md shadow-2xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 ease-out"
            style={{
              background: `linear-gradient(135deg,
                ${settings.text_color}30,
                ${settings.text_color}15,
                ${settings.text_color}25
              )`,
              border: `1.5px solid ${settings.text_color}50`,
              boxShadow: `
                0 4px 15px ${settings.text_color}30,
                inset 0 1px 2px ${settings.text_color}40,
                0 0 20px ${settings.text_color}20
              `
            }}
          >
            <IconComponent
              className="h-5 w-5 drop-shadow-2xl relative z-10"
              style={{
                filter: `drop-shadow(0 0 8px ${settings.text_color})`
              }}
            />

            {/* بريق داخلي */}
            <div
              className="absolute inset-0 rounded-xl opacity-40"
              style={{
                background: `linear-gradient(45deg, transparent, ${settings.text_color}20, transparent)`,
              }}
            />
          </div>

          {/* شرارات متحركة */}
          <div className="absolute -top-1 -right-1 w-2 h-2">
            <Sparkles
              className="w-3 h-3 animate-ping opacity-75"
              style={{ color: settings.text_color }}
            />
          </div>
        </div>

        {/* النص بتأثيرات متقدمة */}
        <div className="relative">
          <span
            className="font-bold text-base drop-shadow-lg group-hover:scale-105 transition-transform duration-300 inline-block relative z-10"
            style={{
              textShadow: `
                0 0 20px ${settings.text_color}60,
                0 2px 4px ${settings.text_color}40,
                0 4px 8px ${settings.text_color}20
              `,
              color: settings.text_color
            }}
          >
            {event.message}
          </span>

          {/* خط سفلي متحرك */}
          <div
            className="absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
            style={{
              background: `linear-gradient(90deg, transparent, ${settings.text_color}, transparent)`,
              boxShadow: `0 0 10px ${settings.text_color}`
            }}
          />
        </div>

        {/* فاصل مبتكر مع أنيميشن */}
        <div className="flex items-center gap-2 mx-4 relative">
          {/* خط فاصل */}
          <div
            className="h-8 w-px"
            style={{
              background: `linear-gradient(to bottom, transparent, ${settings.text_color}60, transparent)`
            }}
          />

          {/* نجمة وسطية */}
          <div className="relative">
            <Star
              className="h-4 w-4 animate-spin"
              style={{
                color: settings.text_color,
                animationDuration: '3s'
              }}
            />
            <div
              className="absolute inset-0 animate-ping opacity-50"
              style={{
                background: settings.text_color,
                borderRadius: '50%',
                filter: 'blur(4px)'
              }}
            />
          </div>

          {/* خط فاصل */}
          <div
            className="h-8 w-px"
            style={{
              background: `linear-gradient(to bottom, transparent, ${settings.text_color}60, transparent)`
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] overflow-hidden shadow-2xl"
      style={{
        backgroundColor: settings.background_color,
        height: settings.height,
        backdropFilter: 'blur(16px)',
        borderBottom: `2px solid ${settings.text_color}30`,
        boxShadow: `
          0 4px 20px ${settings.text_color}20,
          inset 0 1px 0 ${settings.text_color}10
        `
      }}
    >
      {/* خلفية متحركة */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              ${settings.text_color}00 0px,
              ${settings.text_color}20 50px,
              ${settings.text_color}00 100px
            )
          `,
          animation: 'shimmer 3s linear infinite'
        }}
      />

      {/* المحتوى */}
      <div className="relative h-full flex items-center overflow-hidden">
        <div
          ref={containerRef}
          className="flex items-center h-full"
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            perspective: '1000px'
          }}
          onMouseEnter={() => {
            isPausedRef.current = true;
          }}
          onMouseLeave={() => {
            isPausedRef.current = false;
          }}
        >
          <div
            ref={wrapperRef}
            className="flex items-center h-full"
          >
            {doubledEvents.map((event, index) => (
              <EventItem key={`${event.id}-${index}`} event={event} index={index} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(0); }
          100% { transform: translateX(100px); }
        }

        /* تحسينات الأداء */
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
