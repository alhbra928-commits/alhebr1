import React, { useEffect, useState } from 'react';
import { X, AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { versionTrackingService, UpdateNotification } from '../../services/versionTrackingService';

interface UpdateNotificationBannerProps {
  userRole?: string;
}

export const UpdateNotificationBanner: React.FC<UpdateNotificationBannerProps> = ({ userRole = 'admin' }) => {
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadNotifications();

    // Subscribe to new notifications
    const unsubscribe = versionTrackingService.subscribeToUpdateNotifications((notification) => {
      if (notification.target_roles.includes(userRole)) {
        setNotifications((prev) => [notification, ...prev]);
      }
    });

    return unsubscribe;
  }, [userRole]);

  const loadNotifications = async () => {
    const data = await versionTrackingService.getUnreadNotifications(userRole);
    setNotifications(data);
  };

  const handleDismiss = async (notificationId: string) => {
    setDismissedIds((prev) => new Set(prev).add(notificationId));
    await versionTrackingService.markNotificationAsRead(notificationId);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }, 300);
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: AlertCircle,
          iconColor: 'text-red-500',
        };
      case 'high':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          icon: AlertTriangle,
          iconColor: 'text-orange-500',
        };
      case 'medium':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: Info,
          iconColor: 'text-blue-500',
        };
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-500',
        };
    }
  };

  const visibleNotifications = notifications.filter((n) => !dismissedIds.has(n.id));

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="space-y-2">
        {visibleNotifications.map((notification) => {
          const config = getPriorityConfig(notification.priority);
          const Icon = config.icon;

          return (
            <div
              key={notification.id}
              className={`${config.bg} ${config.border} border-2 rounded-xl p-4 shadow-lg transition-all duration-300 ${
                dismissedIds.has(notification.id) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
                  <Icon size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg ${config.text} mb-1`}>
                    {notification.title_ar}
                  </h3>
                  <p className={`text-sm ${config.text} leading-relaxed`}>
                    {notification.message_ar}
                  </p>

                  {notification.version && (
                    <div className="mt-2 text-xs opacity-70">
                      <span>الإصدار: {notification.version.version}</span>
                      {notification.version.build_number && (
                        <span className="mr-3">البناء: {notification.version.build_number}</span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDismiss(notification.id)}
                  className={`${config.text} hover:bg-white hover:bg-opacity-50 rounded-lg p-1.5 transition-colors flex-shrink-0`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
