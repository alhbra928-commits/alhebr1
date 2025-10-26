import { useEffect, useState } from 'react';
import { MessageCircle, Bell } from 'lucide-react';
import { whatsappRealtimeService, WhatsAppStats } from '../services/whatsappRealtimeService';

interface WhatsAppNotificationBadgeProps {
  variant?: 'icon' | 'full';
  className?: string;
  onClick?: () => void;
  showPulse?: boolean;
}

export function WhatsAppNotificationBadge({
  variant = 'icon',
  className = '',
  onClick,
  showPulse = true
}: WhatsAppNotificationBadgeProps) {
  const [stats, setStats] = useState<WhatsAppStats>({
    total_messages: 0,
    pending_count: 0,
    sent_count: 0,
    delivered_count: 0,
    read_count: 0,
    failed_count: 0,
    today_sent: 0,
    unread_count: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    whatsappRealtimeService.connect();

    const unsubscribeStats = whatsappRealtimeService.onStatsUpdate((newStats) => {
      setStats(newStats);
      setIsConnected(true);
    });

    const unsubscribeMessages = whatsappRealtimeService.onNewMessage(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    });

    return () => {
      unsubscribeStats();
      unsubscribeMessages();
    };
  }, []);

  const hasUnread = stats.unread_count > 0 || stats.pending_count > 0;
  const totalUnread = stats.unread_count + stats.pending_count;

  if (variant === 'icon') {
    return (
      <button
        onClick={onClick}
        className={`relative ${className}`}
        title={`رسائل واتساب جديدة: ${totalUnread}`}
      >
        <div className="relative">
          <MessageCircle className={`h-6 w-6 ${hasUnread ? 'text-green-600' : 'text-gray-600'}`} />

          {hasUnread && (
            <div className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center px-1.5 shadow-lg">
              <span className="text-white text-xs font-bold">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            </div>
          )}

          {showPulse && hasUnread && (
            <>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </>
          )}
        </div>

        {showNotification && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap z-50 animate-bounce">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-bold">رسالة واتساب جديدة!</span>
            </div>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={onClick}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer
          ${hasUnread
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 shadow-lg shadow-green-200'
            : 'bg-white border-2 border-gray-200 hover:border-green-300'
          }
        `}
      >
        <div className="relative">
          <MessageCircle className={`h-6 w-6 ${hasUnread ? 'text-green-600' : 'text-gray-600'}`} />
          {showPulse && hasUnread && (
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm ${hasUnread ? 'text-green-700' : 'text-gray-700'}`}>
              واتساب
            </span>
            {isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">متصل</span>
              </div>
            )}
          </div>

          {hasUnread && (
            <p className="text-xs text-green-600 font-medium">
              {totalUnread} رسالة جديدة
            </p>
          )}
        </div>

        {hasUnread && (
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full shadow-lg">
              <span className="text-sm font-bold">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            </div>
            {showPulse && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
            )}
          </div>
        )}
      </div>

      {showNotification && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-xl shadow-2xl z-50 animate-slide-down">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 animate-bounce" />
            <div>
              <p className="font-bold text-sm">رسالة واتساب جديدة!</p>
              <p className="text-xs opacity-90">تم استلام رسالة جديدة الآن</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
