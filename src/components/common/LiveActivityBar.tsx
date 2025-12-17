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
  const [errorCount, setErrorCount] = useState(0);

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

  if (!isEnabled || activities.length === 0) {
    return null;
  }

  // شريط ثابت بدون حركة
  return (
    <div
      className="w-full"
      style={{
        background: 'linear-gradient(135deg, #2C5F2D 0%, #1E4620 50%, #2C5F2D 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        borderTop: '2px solid rgba(212, 175, 55, 0.3)',
        borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
        height: '48px',
      }}
    >
      <div className="h-full flex items-center justify-center gap-8 px-4">
        {activities.map((activity, index) => {
          const IconComponent = iconMap[activity.icon] || Sparkles;
          return (
            <div
              key={`activity-${index}`}
              className="flex items-center gap-3"
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
                className="font-semibold text-base whitespace-nowrap"
                style={{
                  color: '#F5F5DC',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '0.3px',
                }}
              >
                {activity.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
