import React, { useEffect, useState } from 'react';
import { Activity, TickerSettings, liveActivityTickerService } from '../../services/liveActivityTickerService';

export const LiveActivityTicker: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<TickerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    const unsubscribe = liveActivityTickerService.subscribeToRealtime(() => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!settings) return;

    if (settings.simulation_enabled && (settings.mode === 'simulation' || settings.mode === 'hybrid')) {
      const interval = setInterval(() => {
        refreshActivities();
      }, settings.simulation_interval_seconds * 1000);

      return () => clearInterval(interval);
    }
  }, [settings]);

  const loadData = async () => {
    try {
      const [activitiesData, settingsData] = await Promise.all([
        liveActivityTickerService.getActivities(),
        liveActivityTickerService.getSettings()
      ]);

      setActivities(activitiesData);
      setSettings(settingsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading ticker data:', error);
      setIsLoading(false);
    }
  };

  const refreshActivities = async () => {
    try {
      const newActivities = await liveActivityTickerService.getActivities();
      setActivities(newActivities);
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  };

  if (isLoading || !settings || activities.length === 0) {
    return null;
  }

  const speedDuration = liveActivityTickerService.getSpeedDuration(settings.scroll_speed);
  const duplicatedActivities = [...activities, ...activities, ...activities];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        background: `linear-gradient(135deg, ${settings.background_color} 0%, ${adjustColor(settings.background_color, -20)} 100%)`,
        borderBottom: `1px solid ${adjustColor(settings.background_color, 30)}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        height: '48px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          animation: `scroll-ticker ${speedDuration}s linear infinite`,
          whiteSpace: 'nowrap',
          paddingRight: '100vw'
        }}
      >
        {duplicatedActivities.map((activity, index) => (
          <div
            key={`${activity.id}-${index}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '0 32px',
              borderRight: `1px solid ${adjustColor(settings.background_color, 40)}`,
              minWidth: 'fit-content'
            }}
          >
            <span
              style={{
                fontSize: '20px',
                color: settings.icon_color,
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
              }}
            >
              {activity.icon}
            </span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: settings.text_color,
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                letterSpacing: '0.3px'
              }}
            >
              {activity.title}
            </span>
            {settings.show_timestamps && activity.timestamp && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: adjustColor(settings.text_color, -30),
                  opacity: 0.8
                }}
              >
                {formatTimestamp(activity.timestamp)}
              </span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll-ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
};

function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'الآن';
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}
