import { useEffect, useState } from 'react';
import { Bell, X, User } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface LoginNotificationProps {
  adminName: string;
  adminPhone: string;
  module: string;
  onClose: () => void;
}

export function LoginNotification({ adminName, adminPhone, module, onClose }: LoginNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const timer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className="fixed left-6 top-6 z-50 w-80 transition-all duration-300"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-120%)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className="rounded-2xl p-4 shadow-2xl"
        style={{
          background: 'white',
          border: `2px solid ${brandColors.primary.gold}`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: brandGradients.gold }}
          >
            <Bell className="h-5 w-5 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold" style={{ color: brandColors.text.primary }}>
                دخول جديد للنظام
              </h3>
              <button
                onClick={handleClose}
                className="rounded-lg p-1 transition-colors hover:bg-gray-100"
                style={{ color: brandColors.text.secondary }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" style={{ color: brandColors.primary.gold }} />
                <span className="text-sm font-bold" style={{ color: brandColors.text.primary }}>
                  {adminName}
                </span>
              </div>
              <p className="text-xs" style={{ color: brandColors.text.secondary }}>
                {adminPhone}
              </p>
              <p className="text-xs" style={{ color: brandColors.text.secondary }}>
                القسم: <span className="font-bold">{module}</span>
              </p>
            </div>

            <div className="mt-2 text-xs" style={{ color: brandColors.text.secondary }}>
              {new Date().toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 h-1 animate-shrink"
          style={{
            background: brandGradients.gold,
            width: '100%',
            borderRadius: '0 0 16px 16px',
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-shrink {
          animation: shrink 10s linear;
        }
      `}</style>
    </div>
  );
}
