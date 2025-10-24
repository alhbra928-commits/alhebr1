import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { FinancialNotificationService, FinancialNotification } from '../../services/financialNotificationService';

interface FinancialNotificationBellProps {
  onNavigate?: (url: string) => void;
}

export const FinancialNotificationBell: React.FC<FinancialNotificationBellProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<FinancialNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotifications();

    const unsubscribe = FinancialNotificationService.subscribeToFinancialNotifications((notification) => {
      setNotifications((prev) => [notification, ...prev]);

      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizcIHmm+7+ihUhELTKXh8Ldl');
      audio.play().catch(() => {});
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    const data = await FinancialNotificationService.getUnreadFinancialCompletionNotifications();
    setNotifications(data);
    setIsLoading(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await FinancialNotificationService.markAsRead(notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await FinancialNotificationService.markAllAsRead();
    setNotifications([]);
    setShowDropdown(false);
  };

  const handleNotificationClick = (notification: FinancialNotification) => {
    handleMarkAsRead(notification.id);
    if (onNavigate && notification.action_url) {
      onNavigate(notification.action_url);
    }
    setShowDropdown(false);
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`
          relative p-3 rounded-full transition-all duration-300
          ${unreadCount > 0
            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg animate-pulse-slow hover:scale-110'
            : 'bg-gray-100 hover:bg-gray-200'
          }
        `}
      >
        <Bell
          className={`w-6 h-6 ${unreadCount > 0 ? 'text-white' : 'text-gray-600'}`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-yellow-200 z-50 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-3 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'Tajawal' }}>
              🔔 إشعارات الاكتمال المالي
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                style={{ fontFamily: 'Tajawal' }}
              >
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-3 text-gray-500 text-sm" style={{ fontFamily: 'Tajawal' }}>
                  جاري التحميل...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500" style={{ fontFamily: 'Tajawal' }}>
                  لا توجد إشعارات جديدة
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="p-4 hover:bg-yellow-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className="text-sm font-bold text-gray-800 mb-1"
                          style={{ fontFamily: 'Tajawal' }}
                        >
                          {notification.title_ar}
                        </h4>
                        <p
                          className="text-xs text-gray-600 leading-relaxed"
                          style={{ fontFamily: 'Tajawal' }}
                        >
                          {notification.message_ar}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px 10px rgba(251, 191, 36, 0); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
