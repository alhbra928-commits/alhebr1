import { useEffect, useState, useCallback } from 'react';
import { ShoppingCart, Award, TreePine, Sparkles } from 'lucide-react';
import { LiveActivityService, LiveActivity, LiveActivitySettings } from '../../services/liveActivityService';

const iconMap: Record<string, any> = {
  ShoppingCart,
  Award,
  TreePine,
  Sparkles,
  TrendingUp: Sparkles,
  Users: Sparkles,
  Zap: Sparkles,
  Star: Award,
};

export function LiveActivityBar() {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [settings, setSettings] = useState<LiveActivitySettings | null>(null);
  const [renderKey, setRenderKey] = useState(0);

  const loadSettings = useCallback(async () => {
    try {
      const loadedSettings = await LiveActivityService.getSettings();
      if (loadedSettings) {
        console.log('🔄 Live Activity Bar: Settings loaded', {
          enabled: loadedSettings.is_enabled,
          mode: loadedSettings.content_mode,
          speed: loadedSettings.animation_speed,
          height: loadedSettings.height
        });
        setSettings(loadedSettings);
        setRenderKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    try {
      const data = await LiveActivityService.getLiveActivities();
      console.log('📊 Live Activity Bar: Activities loaded', {
        count: data.length,
        types: data.map(a => a.type),
        sources: data.map(a => a.source)
      });
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadActivities();
  }, [loadSettings, loadActivities]);

  useEffect(() => {
    if (!settings) return;

    const refreshInterval = setInterval(() => {
      loadActivities();
    }, settings.refresh_interval * 1000);

    return () => clearInterval(refreshInterval);
  }, [settings, loadActivities]);

  useEffect(() => {
    const unsubscribe = LiveActivityService.subscribeToChanges(() => {
      loadSettings();
      loadActivities();
    });

    const handleSettingsUpdate = ((event: CustomEvent) => {
      const newSettings = event.detail;
      console.log('⚡ Live Activity Bar: Settings updated via event!', {
        mode: newSettings.content_mode,
        speed: newSettings.animation_speed,
        height: newSettings.height,
        colors: { text: newSettings.text_color, icon: newSettings.icon_color }
      });
      setSettings(newSettings);
      setRenderKey(prev => prev + 1);
      setTimeout(() => loadActivities(), 100);
    }) as EventListener;

    window.addEventListener('live-activity-settings-updated', handleSettingsUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('live-activity-settings-updated', handleSettingsUpdate);
    };
  }, [loadSettings, loadActivities]);

  if (!settings || !settings.is_enabled || activities.length === 0) {
    return null;
  }

  const speedDuration = {
    slow: '40s',
    medium: '25s',
    fast: '12s'
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
        @keyframes smooth-scroll-left-${renderKey} {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .modern-live-activity-container-${renderKey} {
          position: relative;
          width: 100%;
          height: ${settings.height}px;
          overflow: hidden;
          background: ${getBackgroundStyle()};
          backdrop-filter: ${settings.background_style === 'glass' ? 'blur(10px)' : 'none'};
          z-index: 999;
        }

        .modern-live-activity-track-${renderKey} {
          display: flex;
          align-items: center;
          height: 100%;
          animation: smooth-scroll-left-${renderKey} ${speedDuration[settings.animation_speed]} linear infinite;
          will-change: transform;
          ${settings.pause_on_hover ? 'cursor: pointer;' : ''}
        }

        ${settings.pause_on_hover ? `.modern-live-activity-track-${renderKey}:hover { animation-play-state: paused; }` : ''}

        .modern-live-activity-group-${renderKey} {
          display: flex;
          align-items: center;
          height: 100%;
          flex-shrink: 0;
        }

        .modern-live-activity-item-${renderKey} {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 24px;
          height: 100%;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .modern-live-activity-icon-${renderKey} {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: ${settings.icon_color}33;
          border: 1px solid ${settings.icon_color}55;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .modern-live-activity-icon-${renderKey}:hover {
          background: ${settings.icon_color}55;
          transform: scale(1.1);
        }

        .modern-live-activity-text-${renderKey} {
          font-size: 14px;
          font-weight: 600;
          color: ${settings.text_color};
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .modern-live-activity-separator-${renderKey} {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: ${settings.icon_color}80;
          margin: 0 16px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .modern-live-activity-container-${renderKey} {
            height: ${Math.max(46, settings.height - 4)}px;
          }

          .modern-live-activity-item-${renderKey} {
            padding: 0 18px;
            gap: 8px;
          }

          .modern-live-activity-icon-${renderKey} {
            width: 30px;
            height: 30px;
          }

          .modern-live-activity-text-${renderKey} {
            font-size: 13px;
          }
        }
      `}</style>

      <div className={`modern-live-activity-container-${renderKey}`} style={getBorderStyle()}>
        <div className={`modern-live-activity-track-${renderKey}`}>
          <div className={`modern-live-activity-group-${renderKey}`}>
            {activities.map((activity, idx) => {
              const Icon = iconMap[activity.icon] || Sparkles;
              return (
                <div key={`a-${idx}-${activity.id}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <div className={`modern-live-activity-item-${renderKey}`}>
                    <div className={`modern-live-activity-icon-${renderKey}`}>
                      <Icon size={18} style={{ color: settings.icon_color }} />
                    </div>
                    <span className={`modern-live-activity-text-${renderKey}`}>{activity.message}</span>
                  </div>
                  {settings.show_separator && idx < activities.length - 1 && (
                    <div className={`modern-live-activity-separator-${renderKey}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className={`modern-live-activity-group-${renderKey}`}>
            {activities.map((activity, idx) => {
              const Icon = iconMap[activity.icon] || Sparkles;
              return (
                <div key={`b-${idx}-${activity.id}`} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <div className={`modern-live-activity-item-${renderKey}`}>
                    <div className={`modern-live-activity-icon-${renderKey}`}>
                      <Icon size={18} style={{ color: settings.icon_color }} />
                    </div>
                    <span className={`modern-live-activity-text-${renderKey}`}>{activity.message}</span>
                  </div>
                  {settings.show_separator && idx < activities.length - 1 && (
                    <div className={`modern-live-activity-separator-${renderKey}`} />
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
