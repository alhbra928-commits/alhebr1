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

  // حساب السرعة بالثواني - ثابت وبسيط
  const speedMap = {
    slow: '60s',
    medium: '40s',
    fast: '25s'
  };

  const animationDuration = speedMap[scrollSpeed];

  return (
    <>
      <style>{`
        @keyframes seamless-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .live-activity-bar-wrapper {
          position: relative;
          width: 100%;
          height: 48px;
          overflow: hidden;
          background: linear-gradient(135deg,
            rgba(44, 95, 45, 0.98) 0%,
            rgba(30, 70, 32, 0.98) 50%,
            rgba(44, 95, 45, 0.98) 100%
          );
          border-bottom: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 0;
          margin: 0;
          padding: 0;
        }

        .live-activity-scrolltrack {
          display: flex;
          align-items: center;
          height: 100%;
          width: max-content;
          animation: seamless-scroll ${animationDuration} linear infinite;
          will-change: transform;
        }

        .live-activity-scrolltrack:hover {
          animation-play-state: paused;
        }

        .live-activity-content-group {
          display: flex;
          align-items: center;
          height: 100%;
          padding: 0;
          margin: 0;
        }

        .live-activity-single-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 28px;
          height: 100%;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .live-activity-icon-box {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: linear-gradient(135deg,
            rgba(212, 175, 55, 0.25),
            rgba(196, 148, 31, 0.15)
          );
          border: 1px solid rgba(212, 175, 55, 0.4);
          flex-shrink: 0;
        }

        .live-activity-message-text {
          font-size: 15px;
          font-weight: 600;
          color: #F5F5DC;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .live-activity-dot-separator {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.6);
          margin: 0 18px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .live-activity-bar-wrapper {
            height: 44px;
          }

          .live-activity-single-item {
            padding: 0 20px;
            gap: 10px;
          }

          .live-activity-icon-box {
            width: 32px;
            height: 32px;
          }

          .live-activity-message-text {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="live-activity-bar-wrapper">
        <div className="live-activity-scrolltrack">
          {/* المجموعة الأولى */}
          <div className="live-activity-content-group">
            {activities.map((activity, idx) => {
              const IconComponent = iconMap[activity.icon] || Sparkles;
              return (
                <div key={`g1-${idx}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <div className="live-activity-single-item">
                    <div className="live-activity-icon-box">
                      <IconComponent size={20} style={{ color: '#D4AF37', flexShrink: 0 }} />
                    </div>
                    <span className="live-activity-message-text">{activity.message}</span>
                  </div>
                  {idx < activities.length - 1 && <div className="live-activity-dot-separator" />}
                </div>
              );
            })}
          </div>

          {/* المجموعة الثانية - نسخة مطابقة */}
          <div className="live-activity-content-group">
            {activities.map((activity, idx) => {
              const IconComponent = iconMap[activity.icon] || Sparkles;
              return (
                <div key={`g2-${idx}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <div className="live-activity-single-item">
                    <div className="live-activity-icon-box">
                      <IconComponent size={20} style={{ color: '#D4AF37', flexShrink: 0 }} />
                    </div>
                    <span className="live-activity-message-text">{activity.message}</span>
                  </div>
                  {idx < activities.length - 1 && <div className="live-activity-dot-separator" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
