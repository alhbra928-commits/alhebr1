import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface LiveStatusIndicatorProps {
  isConnected: boolean;
  lastUpdate: Date | null;
  showDetails?: boolean;
}

export function LiveStatusIndicator({
  isConnected,
  lastUpdate,
  showDetails = true
}: LiveStatusIndicatorProps) {
  const getStatus = () => {
    if (!isConnected) {
      return {
        color: 'bg-red-500',
        icon: <WifiOff className="w-4 h-4" />,
        text: 'غير متصل',
        textColor: 'text-red-700',
        borderColor: 'border-red-500'
      };
    }

    if (!lastUpdate) {
      return {
        color: 'bg-yellow-500',
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'جاري التحميل',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-500'
      };
    }

    const timeSinceUpdate = Date.now() - lastUpdate.getTime();

    if (timeSinceUpdate > 30000) {
      return {
        color: 'bg-yellow-500',
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'تأخير في المزامنة',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-500'
      };
    }

    return {
      color: 'bg-green-500',
      icon: <Wifi className="w-4 h-4" />,
      text: 'متصل - تحديث لحظي',
      textColor: 'text-green-700',
      borderColor: 'border-green-500'
    };
  };

  const status = getStatus();

  const formatLastUpdate = () => {
    if (!lastUpdate) return '';

    const now = new Date();
    const diff = now.getTime() - lastUpdate.getTime();

    if (diff < 1000) return 'الآن';
    if (diff < 60000) return `قبل ${Math.floor(diff / 1000)} ثانية`;
    if (diff < 3600000) return `قبل ${Math.floor(diff / 60000)} دقيقة`;

    return lastUpdate.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border-2 ${status.borderColor} bg-white/80 backdrop-blur-sm shadow-lg`}>
      <div className="flex items-center gap-2">
        <div className={`${status.color} p-1.5 rounded-full animate-pulse`}>
          {status.icon}
        </div>
        <div className="flex flex-col">
          <span className={`text-sm font-bold ${status.textColor}`}>
            {status.text}
          </span>
          {showDetails && lastUpdate && (
            <span className="text-xs text-slate-600">
              آخر تحديث: {formatLastUpdate()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function CompactLiveStatusIndicator({
  isConnected,
  lastUpdate
}: LiveStatusIndicatorProps) {
  const getStatusColor = () => {
    if (!isConnected) return 'bg-red-500';
    if (!lastUpdate) return 'bg-yellow-500';

    const timeSinceUpdate = Date.now() - lastUpdate.getTime();
    if (timeSinceUpdate > 30000) return 'bg-yellow-500';

    return 'bg-green-500';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 ${getStatusColor()} rounded-full animate-pulse`}></div>
      <span className="text-xs font-bold text-slate-700">
        {isConnected ? 'مباشر' : 'غير متصل'}
      </span>
    </div>
  );
}
