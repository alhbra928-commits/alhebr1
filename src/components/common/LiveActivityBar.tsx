import { useEffect, useState } from 'react';
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

  if (!isEnabled || activities.length === 0) {
    return null;
  }

  const speedDuration = {
    slow: '90s',
    medium: '60s',
    fast: '40s'
  }[scrollSpeed];

  // كرر المحتوى 5 مرات لضمان ملء أي شاشة
  const repeatedActivities = [
    ...activities,
    ...activities,
    ...activities,
    ...activities,
    ...activities
  ];

  return (
    <>
      <style>{`
        @keyframes seamless-ticker {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-20%, 0, 0);
          }
        }

        .ticker-track {
          animation: seamless-ticker ${speedDuration} linear infinite;
          will-change: transform;
        }
      `}</style>

      <div
        className="fixed top-0 left-0 right-0 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2C5F2D 0%, #1E4620 50%, #2C5F2D 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
          height: '48px',
          zIndex: 9999,
          WebkitBackdropFilter: 'blur(10px)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="h-full flex items-center">
          <div
            className="ticker-track flex items-center gap-6"
            style={{
              minWidth: 'max-content',
              paddingRight: '2rem',
            }}
          >
            {repeatedActivities.map((activity, index) => {
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
    </>
  );
}
