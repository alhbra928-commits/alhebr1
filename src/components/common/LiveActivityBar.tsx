import { useEffect, useState, useRef } from 'react';
import {
  TrendingUp, UserPlus, ShoppingCart, Award, TreePine,
  Sparkles, DollarSign, User
} from 'lucide-react';
import { ActivityBarService } from '../../services/activityBarService';

const iconMap: Record<string, any> = {
  TrendingUp,
  UserPlus,
  ShoppingCart,
  Award,
  TreePine,
  Sparkles,
  DollarSign,
  User,
};

interface Activity {
  message: string;
  icon: string;
}

export function LiveActivityBar() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [scrollSpeed, setScrollSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const positionRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActivities = async () => {
    try {
      const settings = await ActivityBarService.getSettings();
      if (settings) {
        setIsEnabled(settings.is_enabled);
        setScrollSpeed(settings.scroll_speed);
      }

      const data = await ActivityBarService.getActivitiesToDisplay();
      if (data.length > 0) {
        setActivities(data);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  useEffect(() => {
    if (!isEnabled || activities.length === 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const speedInPxPerSecond = {
      slow: 30,
      medium: 50,
      fast: 80
    }[scrollSpeed];

    const animate = (currentTime: number) => {
      if (!trackRef.current || !containerRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      positionRef.current += speedInPxPerSecond * deltaTime;

      // ✅ التكرار 5x، لذلك نقسم على 5 لـ seamless loop
      const trackWidth = trackRef.current.offsetWidth / 5;

      // ✅ سكرول سلس بدون توقف - يعود للبداية بسلاسة
      if (positionRef.current >= trackWidth) {
        positionRef.current = positionRef.current % trackWidth;
      }

      trackRef.current.style.transform = `translateX(-${positionRef.current}px)`;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = 0;
    positionRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isEnabled, activities, scrollSpeed]);

  if (!isEnabled || activities.length === 0) {
    return null;
  }

  // ✅ تكرار 5x لضمان عدم وجود فراغات أبداً
  const seamlessActivities = [
    ...activities,
    ...activities,
    ...activities,
    ...activities,
    ...activities
  ];

  // ✅ ثبات جذري 100% - نفس تقنية Farm Detail Page
  return (
    <>
      <style>{`
        /* ============ RELATIVE WRAPPER - داخل الهيدر الثابت ============ */
        .live-activity-bar-wrapper {
          position: relative;
          width: 100%;
          height: 48px;
          pointer-events: none;
          overflow: hidden;

          /* GPU Layer منفصل */
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          will-change: transform;
          isolation: isolate;
        }

        /* ============ MAIN ACTIVITY BAR - relative داخل الهيدر ============ */
        .live-activity-bar {
          position: relative;
          width: 100%;
          height: 48px;
          overflow: hidden;
          background: linear-gradient(135deg, #2C5F2D 0%, #1E4620 50%, #2C5F2D 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border-radius: 12px;
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          pointer-events: auto;

          /* GPU Layer + Isolation */
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          will-change: transform;
          isolation: isolate;
        }

        /* ============ INNER CONTENT - محتوى السكرول ============ */
        .live-activity-bar-inner {
          height: 100%;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        /* ✅ Track بدون Gap - استخدام padding للعناصر بدلاً من gap */
        .live-activity-bar-track {
          display: flex;
          align-items: center;
          gap: 0;
          min-width: max-content;
          will-change: transform;
          position: relative;
        }

        /* ✅ Activity Item - متصلة بدون فراغات */
        .activity-bar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          white-space: nowrap;
          padding: 0 20px;
          min-width: max-content;
        }

        /* ✅ Separator - فاصل بصري بين العناصر */
        .activity-separator {
          width: 1.5px;
          height: 1.5px;
          border-radius: 50%;
          margin: 0 16px;
          flex-shrink: 0;
          background: linear-gradient(135deg, #D4AF37 0%, #C4941F 100%);
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.6);
        }
      `}</style>

      {/* 🎯 Wrapper داخل الهيدر الثابت */}
      <div className="live-activity-bar-wrapper">
        <div
          ref={containerRef}
          className="live-activity-bar"
        >
          <div className="live-activity-bar-inner">
            <div
              ref={trackRef}
              className="live-activity-bar-track"
            >
              {seamlessActivities.map((activity, index) => {
                const IconComponent = iconMap[activity.icon] || Sparkles;
                return (
                  <div
                    key={`activity-${index}`}
                    className="activity-bar-item"
                  >
                    <div
                      className="flex-shrink-0 p-2 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(196, 148, 31, 0.15) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                      }}
                    >
                      <IconComponent className="h-5 w-5" style={{ color: '#D4AF37' }} />
                    </div>
                    <span
                      className="font-semibold text-base"
                      style={{
                        color: '#F5F5DC',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {activity.message}
                    </span>
                    <div className="activity-separator" />
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.5) 50%, transparent 100%)',
            }}
          />
        </div>
      </div>
    </>
  );
}
