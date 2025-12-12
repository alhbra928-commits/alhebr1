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

  // حساب مدة الأنيميشن بناءً على السرعة وعدد العناصر
  const speedValues = {
    slow: 80,
    medium: 50,
    fast: 30
  };

  const durationSeconds = activities.length * speedValues[scrollSpeed];

  return (
    <>
      <style>{`
        /* Animation Definition */
        @keyframes continuous-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Main Container */
        .modern-activity-bar-container {
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
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);

          /* GPU Acceleration */
          transform: translate3d(0, 0, 0);
          will-change: auto;
        }

        /* Scrolling Track */
        .modern-activity-track {
          display: flex;
          align-items: center;
          height: 100%;
          width: fit-content;

          /* CSS Animation - سلس وثابت */
          animation: continuous-scroll ${durationSeconds}s linear infinite;
          animation-play-state: running;

          /* GPU Layer */
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }

        .modern-activity-track:hover {
          animation-play-state: paused;
        }

        /* Activity Group - مجموعة واحدة من الأنشطة */
        .modern-activity-group {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          height: 100%;
        }

        /* Single Activity Item */
        .modern-activity-item {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 0 24px;
          white-space: nowrap;
          height: 100%;
          flex-shrink: 0;
        }

        /* Icon Container */
        .modern-activity-icon {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: linear-gradient(135deg,
            rgba(212, 175, 55, 0.25) 0%,
            rgba(196, 148, 31, 0.18) 100%
          );
          border: 1px solid rgba(212, 175, 55, 0.35);
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.15);
          transition: all 0.3s ease;
        }

        .modern-activity-item:hover .modern-activity-icon {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
        }

        /* Text */
        .modern-activity-text {
          font-size: 15px;
          font-weight: 600;
          color: #F5F5DC;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          letter-spacing: 0.3px;
        }

        /* Separator Dot */
        .modern-activity-separator {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37 0%, #C4941F 100%);
          margin: 0 20px;
          flex-shrink: 0;
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
        }

        /* Bottom Accent Line */
        .modern-activity-accent {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(212, 175, 55, 0.6) 50%,
            transparent 100%
          );
          pointer-events: none;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .modern-activity-bar-container {
            height: 44px;
          }

          .modern-activity-item {
            padding: 0 20px;
            gap: 10px;
          }

          .modern-activity-icon {
            width: 32px;
            height: 32px;
          }

          .modern-activity-text {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="modern-activity-bar-container">
        <div className="modern-activity-track">
          {/* المجموعة الأولى */}
          <div className="modern-activity-group">
            {activities.map((activity, index) => {
              const IconComponent = iconMap[activity.icon] || Sparkles;
              return (
                <div key={`group1-${index}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <div className="modern-activity-item">
                    <div className="modern-activity-icon">
                      <IconComponent size={20} style={{ color: '#D4AF37' }} />
                    </div>
                    <span className="modern-activity-text">{activity.message}</span>
                  </div>
                  {index < activities.length - 1 && (
                    <div className="modern-activity-separator" />
                  )}
                </div>
              );
            })}
          </div>

          {/* المجموعة الثانية - نسخة مطابقة للأولى */}
          <div className="modern-activity-group">
            {activities.map((activity, index) => {
              const IconComponent = iconMap[activity.icon] || Sparkles;
              return (
                <div key={`group2-${index}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <div className="modern-activity-item">
                    <div className="modern-activity-icon">
                      <IconComponent size={20} style={{ color: '#D4AF37' }} />
                    </div>
                    <span className="modern-activity-text">{activity.message}</span>
                  </div>
                  {index < activities.length - 1 && (
                    <div className="modern-activity-separator" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modern-activity-accent" />
      </div>
    </>
  );
}
