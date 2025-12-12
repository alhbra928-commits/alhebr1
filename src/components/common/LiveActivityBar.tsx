import { useEffect, useState } from 'react';
import { ShoppingCart, Award, TreePine, Sparkles } from 'lucide-react';
import { LiveActivityService, LiveActivity, LiveActivitySettings } from '../../services/liveActivityService';

const iconMap: Record<string, any> = {
  ShoppingCart,
  Award,
  TreePine,
  Sparkles,
};

export function LiveActivityBar() {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [settings, setSettings] = useState<LiveActivitySettings | null>(null);
  const [updateKey, setUpdateKey] = useState(0);

  useEffect(() => {
    loadActivities();

    const unsubscribe = LiveActivityService.subscribeToChanges(() => {
      loadActivities();
    });

    const handleSettingsUpdate = ((event: CustomEvent) => {
      const newSettings = event.detail;
      setSettings(newSettings);
      setUpdateKey(prev => prev + 1);
    }) as EventListener;

    window.addEventListener('live-activity-settings-updated', handleSettingsUpdate);

    const interval = setInterval(() => {
      if (settings) {
        loadActivities();
      }
    }, (settings?.refresh_interval || 30) * 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('live-activity-settings-updated', handleSettingsUpdate);
    };
  }, [settings?.refresh_interval]);

  const loadActivities = async () => {
    try {
      const loadedSettings = await LiveActivityService.getSettings();
      if (loadedSettings) {
        setSettings(loadedSettings);
      }

      const data = await LiveActivityService.getLiveActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  if (!settings || !settings.is_enabled || activities.length === 0) {
    return null;
  }

  const speedDuration = {
    slow: '50s',
    medium: '35s',
    fast: '22s'
  };

  const getBackgroundStyle = () => {
    switch (settings.background_style) {
      case 'gradient':
        return 'linear-gradient(135deg, rgba(30, 70, 32, 0.95) 0%, rgba(44, 95, 45, 0.95) 50%, rgba(30, 70, 32, 0.95) 100%)';
      case 'solid':
        return 'rgba(30, 70, 32, 0.95)';
      case 'glass':
        return 'rgba(30, 70, 32, 0.7)';
      default:
        return 'linear-gradient(135deg, rgba(30, 70, 32, 0.95) 0%, rgba(44, 95, 45, 0.95) 50%, rgba(30, 70, 32, 0.95) 100%)';
    }
  };

  const getBorderStyle = () => {
    const border = '1px solid rgba(212, 175, 55, 0.25)';
    switch (settings.border_style) {
      case 'none': return {};
      case 'bottom': return { borderBottom: border };
      case 'top': return { borderTop: border };
      case 'both': return { borderTop: border, borderBottom: border };
      default: return { borderBottom: border };
    }
  };

  return (
    <>
      <style>{`
        @keyframes smooth-scroll-left-${updateKey} {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .modern-live-activity-container-${updateKey} {
          position: relative;
          width: 100%;
          height: ${settings.height}px;
          overflow: hidden;
          background: ${getBackgroundStyle()};
          backdrop-filter: ${settings.background_style === 'glass' ? 'blur(10px)' : 'none'};
        }

        .modern-live-activity-track-${updateKey} {
          display: flex;
          align-items: center;
          height: 100%;
          animation: smooth-scroll-left-${updateKey} ${speedDuration[settings.animation_speed]} linear infinite;
          will-change: transform;
          ${settings.pause_on_hover ? 'cursor: pointer;' : ''}
        }

        ${settings.pause_on_hover ? `.modern-live-activity-track-${updateKey}:hover { animation-play-state: paused; }` : ''}

        .modern-live-activity-group-${updateKey} {
          display: flex;
          align-items: center;
          height: 100%;
          flex-shrink: 0;
        }

        .modern-live-activity-item-${updateKey} {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 24px;
          height: 100%;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .modern-live-activity-icon-${updateKey} {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: ${settings.icon_color}33;
          border: 1px solid ${settings.icon_color}55;
          flex-shrink: 0;
        }

        .modern-live-activity-text-${updateKey} {
          font-size: 14px;
          font-weight: 600;
          color: ${settings.text_color};
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .modern-live-activity-separator-${updateKey} {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: ${settings.icon_color}80;
          margin: 0 16px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .modern-live-activity-container-${updateKey} {
            height: ${Math.max(46, settings.height - 4)}px;
          }

          .modern-live-activity-item-${updateKey} {
            padding: 0 18px;
            gap: 8px;
          }

          .modern-live-activity-icon-${updateKey} {
            width: 30px;
            height: 30px;
          }

          .modern-live-activity-text-${updateKey} {
            font-size: 13px;
          }
        }
      `}</style>

      <div className={`modern-live-activity-container-${updateKey}`} style={getBorderStyle()}>
        <div className={`modern-live-activity-track-${updateKey}`}>
          <div className={`modern-live-activity-group-${updateKey}`}>
            {activities.map((activity, idx) => {
              const Icon = iconMap[activity.icon] || Sparkles;
              return (
                <div key={`a-${idx}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <div className={`modern-live-activity-item-${updateKey}`}>
                    <div className={`modern-live-activity-icon-${updateKey}`}>
                      <Icon size={18} style={{ color: settings.icon_color }} />
                    </div>
                    <span className={`modern-live-activity-text-${updateKey}`}>{activity.message}</span>
                  </div>
                  {settings.show_separator && idx < activities.length - 1 && (
                    <div className={`modern-live-activity-separator-${updateKey}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className={`modern-live-activity-group-${updateKey}`}>
            {activities.map((activity, idx) => {
              const Icon = iconMap[activity.icon] || Sparkles;
              return (
                <div key={`b-${idx}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <div className={`modern-live-activity-item-${updateKey}`}>
                    <div className={`modern-live-activity-icon-${updateKey}`}>
                      <Icon size={18} style={{ color: settings.icon_color }} />
                    </div>
                    <span className={`modern-live-activity-text-${updateKey}`}>{activity.message}</span>
                  </div>
                  {settings.show_separator && idx < activities.length - 1 && (
                    <div className={`modern-live-activity-separator-${updateKey}`} />
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
