import { brandColors } from '../../finance/styles/brandColors';

interface NotificationBadgeProps {
  count: number;
  animate?: boolean;
}

export function NotificationBadge({ count, animate = true }: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <>
      <div
        className={`absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-xs font-black text-white z-10 ${
          animate ? 'animate-notification-pulse' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
          boxShadow: animate
            ? '0 0 0 0 rgba(239, 68, 68, 0.7), 0 4px 10px rgba(220, 38, 38, 0.5)'
            : '0 2px 8px rgba(220, 38, 38, 0.4)',
          padding: count > 9 ? '0 6px' : '0',
        }}
      >
        {count > 99 ? '99+' : count}
      </div>

      {animate && (
        <div
          className="absolute -top-1 -right-1 w-[20px] h-[20px] rounded-full animate-notification-glow"
          style={{
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, transparent 70%)',
          }}
        />
      )}

      <style>{`
        @keyframes notification-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7), 0 4px 10px rgba(220, 38, 38, 0.5);
          }
          50% {
            transform: scale(1.15);
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0), 0 4px 10px rgba(220, 38, 38, 0.5);
          }
        }

        @keyframes notification-glow {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 0;
            transform: scale(2.5);
          }
        }

        .animate-notification-pulse {
          animation: notification-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-notification-glow {
          animation: notification-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}

interface TabGlowProps {
  hasNotification: boolean;
  color?: 'gold' | 'olive';
}

export function TabGlow({ hasNotification, color = 'gold' }: TabGlowProps) {
  if (!hasNotification) return null;

  const glowColor = color === 'gold' ? brandColors.primary.gold : brandColors.accent.olive;

  return (
    <>
      <div
        className="absolute inset-0 rounded-xl animate-tab-glow opacity-50"
        style={{
          background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`,
          filter: 'blur(8px)',
        }}
      />

      <style>{`
        @keyframes tab-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        .animate-tab-glow {
          animation: tab-glow 2.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
