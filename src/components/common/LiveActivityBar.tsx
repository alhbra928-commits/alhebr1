import { useEffect, useState } from 'react';
import { ShoppingCart, Award, TreePine, Sparkles } from 'lucide-react';
import { LiveActivityService, LiveActivity } from '../../services/liveActivityService';

const iconMap: Record<string, any> = {
  ShoppingCart,
  Award,
  TreePine,
  Sparkles,
};

export function LiveActivityBar() {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [speed, setSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');

  useEffect(() => {
    loadActivities();

    const unsubscribe = LiveActivityService.subscribeToChanges(() => {
      loadActivities();
    });

    const interval = setInterval(loadActivities, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadActivities = async () => {
    try {
      const settings = await LiveActivityService.getSettings();
      if (settings) {
        setIsEnabled(settings.is_enabled);
        setSpeed(settings.animation_speed);
      }

      const data = await LiveActivityService.getLiveActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  if (!isEnabled || activities.length === 0) {
    return null;
  }

  const speedDuration = {
    slow: '50s',
    medium: '35s',
    fast: '22s'
  };

  return (
    <>
      <style>{`
        @keyframes smooth-scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .modern-live-activity-container {
          position: relative;
          width: 100%;
          height: 50px;
          overflow: hidden;
          background: linear-gradient(135deg,
            rgba(30, 70, 32, 0.95) 0%,
            rgba(44, 95, 45, 0.95) 50%,
            rgba(30, 70, 32, 0.95) 100%
          );
          border-bottom: 1px solid rgba(212, 175, 55, 0.25);
        }

        .modern-live-activity-track {
          display: flex;
          align-items: center;
          height: 100%;
          animation: smooth-scroll-left ${speedDuration[speed]} linear infinite;
          will-change: transform;
        }

        .modern-live-activity-track:hover {
          animation-play-state: paused;
        }

        .modern-live-activity-group {
          display: flex;
          align-items: center;
          height: 100%;
          flex-shrink: 0;
        }

        .modern-live-activity-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 24px;
          height: 100%;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .modern-live-activity-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(212, 175, 55, 0.2);
          border: 1px solid rgba(212, 175, 55, 0.35);
          flex-shrink: 0;
        }

        .modern-live-activity-text {
          font-size: 14px;
          font-weight: 600;
          color: #F5F5DC;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .modern-live-activity-separator {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.5);
          margin: 0 16px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .modern-live-activity-container {
            height: 46px;
          }

          .modern-live-activity-item {
            padding: 0 18px;
            gap: 8px;
          }

          .modern-live-activity-icon {
            width: 30px;
            height: 30px;
          }

          .modern-live-activity-text {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="modern-live-activity-container">
        <div className="modern-live-activity-track">
          <div className="modern-live-activity-group">
            {activities.map((activity, idx) => {
              const Icon = iconMap[activity.icon] || Sparkles;
              return (
                <div key={`a-${idx}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <div className="modern-live-activity-item">
                    <div className="modern-live-activity-icon">
                      <Icon size={18} style={{ color: '#D4AF37' }} />
                    </div>
                    <span className="modern-live-activity-text">{activity.message}</span>
                  </div>
                  {idx < activities.length - 1 && (
                    <div className="modern-live-activity-separator" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="modern-live-activity-group">
            {activities.map((activity, idx) => {
              const Icon = iconMap[activity.icon] || Sparkles;
              return (
                <div key={`b-${idx}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <div className="modern-live-activity-item">
                    <div className="modern-live-activity-icon">
                      <Icon size={18} style={{ color: '#D4AF37' }} />
                    </div>
                    <span className="modern-live-activity-text">{activity.message}</span>
                  </div>
                  {idx < activities.length - 1 && (
                    <div className="modern-live-activity-separator" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
