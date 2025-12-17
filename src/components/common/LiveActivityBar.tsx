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
  const [activities, setActivities] = useState<Activity[]>([
    { message: 'مرحباً بكم في منصة الحبر للاستثمار الزراعي', icon: 'Sparkles' },
    { message: 'استثمر في مستقبلك الآن', icon: 'TrendingUp' }
  ]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [scrollSpeed, setScrollSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [errorCount, setErrorCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const positionRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadActivities = async () => {
    if (errorCount >= 3) {
      return;
    }

    try {
      const settings = await ActivityBarService.getSettings();
      if (settings) {
        setIsEnabled(settings.is_enabled);
        setScrollSpeed(settings.scroll_speed);
      }

      const data = await ActivityBarService.getActivitiesToDisplay();
      if (data.length > 0) {
        setActivities(data);
        setErrorCount(0);
      }
    } catch (error) {
      setErrorCount(prev => prev + 1);
      if (errorCount === 0) {
        console.warn('Activity Bar: استخدام البيانات الافتراضية');
      }
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

      const trackWidth = trackRef.current.offsetWidth / 2;

      if (positionRef.current >= trackWidth) {
        positionRef.current = positionRef.current - trackWidth;
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

  const duplicatedActivities = [...activities, ...activities];

  // 🔧 فصل الشريط كطبقة مستقلة تماماً - Standalone Overlay Layer
  return (
    <>
      <style>{`
        /* 🎯 STANDALONE WRAPPER LAYER - تحت الهيدر مباشرة */
        .live-activity-bar-wrapper {
          position: fixed;
          top: 80px;
          left: 0;
          width: 100vw;
          height: 48px;
          z-index: 40;
          pointer-events: none;
        }

        /* 🎨 MAIN ACTIVITY BAR - الشريط الرئيسي */
        .live-activity-bar {
          position: fixed;
          top: 80px;
          left: 0;
          right: 0;
          width: 100%;
          overflow: hidden;
          background: linear-gradient(135deg, #2C5F2D 0%, #1E4620 50%, #2C5F2D 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border-bottom: 2px solid rgba(212, 175, 55, 0.3);
          height: 48px;
          z-index: 40;
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          pointer-events: auto;
        }

        .live-activity-bar-inner {
          height: 100%;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .live-activity-bar-track {
          display: flex;
          align-items: center;
          gap: 24px;
          min-width: max-content;
          will-change: transform;
        }

        /* 🍎 iPhone specific fixes - نفس طريقة الإصلاح للايقونات الجانبية */
        @supports (-webkit-touch-callout: none) {
          .live-activity-bar-wrapper,
          .live-activity-bar {
            position: fixed;
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            will-change: transform;
          }

          .live-activity-bar-wrapper {
            top: calc(80px + env(safe-area-inset-top, 0px));
            height: 48px;
          }

          .live-activity-bar {
            top: calc(80px + env(safe-area-inset-top, 0px));
            padding-top: 0;
            height: 48px;
          }

          .live-activity-bar-inner,
          .live-activity-bar-track {
            position: relative;
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
          }
        }

        /* 📱 Additional iPhone Safari overscroll/bounce fixes */
        @media only screen
          and (max-width: 768px)
          and (-webkit-min-device-pixel-ratio: 2) {

          .live-activity-bar-wrapper {
            position: fixed !important;
            will-change: transform;
            -webkit-overflow-scrolling: touch;
          }

          .live-activity-bar {
            position: fixed !important;
            will-change: transform;
            -webkit-overflow-scrolling: touch;
          }

          .live-activity-bar-inner,
          .live-activity-bar-track {
            position: relative !important;
          }

          /* منع Safari من إعادة حساب الموضع عند التمرير */
          body {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>

      {/* 🎯 Standalone Wrapper - خارج Flow الصفحة تماماً */}
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
              {duplicatedActivities.map((activity, index) => {
                const IconComponent = iconMap[activity.icon] || Sparkles;
                return (
                  <div
                    key={`activity-${index}`}
                    className="flex items-center gap-3 whitespace-nowrap px-4"
                    style={{
                      minWidth: 'max-content',
                    }}
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
                    <div
                      className="w-1.5 h-1.5 rounded-full mx-3 flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #D4AF37 0%, #C4941F 100%)',
                        boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)',
                      }}
                    />
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
