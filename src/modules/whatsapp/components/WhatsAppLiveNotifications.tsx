import { useEffect, useState } from 'react';
import { MessageCircle, X, CheckCheck, AlertCircle } from 'lucide-react';
import { whatsappRealtimeService, WhatsAppRealtimeMessage } from '../services/whatsappRealtimeService';

interface NotificationItem {
  id: string;
  message: WhatsAppRealtimeMessage;
  timestamp: Date;
}

export function WhatsAppLiveNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    whatsappRealtimeService.connect();

    const unsubscribe = whatsappRealtimeService.onNewMessage((message) => {
      const notification: NotificationItem = {
        id: message.id,
        message,
        timestamp: new Date()
      };

      setNotifications(prev => [notification, ...prev].slice(0, 5));

      setTimeout(() => {
        dismissNotification(message.id);
      }, 10000);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const dismissNotification = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  };

  const visibleNotifications = notifications.filter(n => !dismissed.has(n.id));

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-6 z-[9999] space-y-3 max-w-md">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            transform transition-all duration-300 ease-out
            ${dismissed.has(notification.id)
              ? 'translate-x-[-120%] opacity-0'
              : 'translate-x-0 opacity-100'
            }
          `}
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-4 border-2 border-green-400 animate-slide-in">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">رسالة واتساب جديدة</p>
                  {notification.message.message_type === 'auto' && (
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      تلقائية
                    </span>
                  )}
                </div>

                <p className="text-sm opacity-90 mb-2 line-clamp-2">
                  {notification.message.recipient_name || notification.message.recipient_phone}
                </p>

                <div className="flex items-center gap-4 text-xs opacity-75">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(notification.message.status)}
                    <span>{getStatusText(notification.message.status)}</span>
                  </div>
                  <span>{formatTime(notification.timestamp)}</span>
                </div>
              </div>

              <button
                onClick={() => dismissNotification(notification.id)}
                className="flex-shrink-0 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'sent':
    case 'delivered':
      return <CheckCheck className="h-3 w-3" />;
    case 'failed':
      return <AlertCircle className="h-3 w-3" />;
    default:
      return <MessageCircle className="h-3 w-3" />;
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'pending':
      return 'قيد الإرسال';
    case 'sent':
      return 'تم الإرسال';
    case 'delivered':
      return 'تم التوصيل';
    case 'read':
      return 'تم القراءة';
    case 'failed':
      return 'فشل الإرسال';
    default:
      return status;
  }
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'الآن';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} دقيقة`;
  } else {
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  }
}
