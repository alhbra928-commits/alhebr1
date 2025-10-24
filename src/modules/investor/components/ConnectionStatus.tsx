import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { brandColors } from '../../finance/styles/brandColors';

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected';
  lastUpdate: Date;
  className?: string;
}

export function ConnectionStatus({ status, lastUpdate, className = '' }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          label: 'متزامن',
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          emoji: '🟢'
        };
      case 'connecting':
        return {
          icon: RefreshCw,
          label: 'يعيد المحاولة',
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          emoji: '🟡'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          label: 'غير متصل',
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          emoji: '🔴'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const timeSinceUpdate = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${className}`}
      style={{
        background: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}30`
      }}
    >
      <Icon
        className={`w-3.5 h-3.5 ${status === 'connecting' ? 'animate-spin' : ''}`}
        style={{ color: config.color }}
      />
      <span>{config.label}</span>
      <span className="opacity-75">{config.emoji}</span>

      {timeSinceUpdate > 30 && (
        <span className="text-xs opacity-60">
          ({timeSinceUpdate}ث)
        </span>
      )}
    </div>
  );
}
