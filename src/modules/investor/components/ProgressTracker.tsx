import { CheckCircle2, Clock, CreditCard, Award, FileCheck, ShieldCheck } from 'lucide-react';
import { brandColors } from '../../finance/styles/brandColors';

interface ProgressTrackerProps {
  bookingStatus: 'temporary' | 'approved' | 'pending_verification' | 'verified' | 'ownership_completed' | 'documented';
  className?: string;
}

interface Stage {
  id: string;
  label: string;
  icon: any;
  status: 'completed' | 'active' | 'pending';
  color: string;
  glowColor: string;
}

export function ProgressTracker({ bookingStatus, className = '' }: ProgressTrackerProps) {
  const getStages = (): Stage[] => {
    const stages = [
      {
        id: 'temporary',
        label: 'حجز مؤقت',
        icon: Clock,
        status: 'pending' as const,
        color: 'from-gray-400 to-gray-600',
        glowColor: 'shadow-gray-500/50'
      },
      {
        id: 'approved',
        label: 'معتمد',
        icon: CheckCircle2,
        status: 'pending' as const,
        color: 'from-amber-400 to-amber-600',
        glowColor: 'shadow-amber-500/50'
      },
      {
        id: 'pending_verification',
        label: 'قيد التحقق المالي',
        icon: CreditCard,
        status: 'pending' as const,
        color: 'from-green-500 to-green-700',
        glowColor: 'shadow-green-500/50'
      },
      {
        id: 'verified',
        label: 'تم التحقق من السداد',
        icon: ShieldCheck,
        status: 'pending' as const,
        color: 'from-yellow-400 to-yellow-600',
        glowColor: 'shadow-yellow-500/50'
      },
      {
        id: 'ownership_completed',
        label: 'اكتمال الحجز',
        icon: Award,
        status: 'pending' as const,
        color: 'from-amber-500 to-amber-700',
        glowColor: 'shadow-amber-600/70'
      },
      {
        id: 'documented',
        label: 'موثق',
        icon: FileCheck,
        status: 'pending' as const,
        color: 'from-blue-500 to-blue-700',
        glowColor: 'shadow-blue-500/50'
      }
    ];

    const statusOrder = ['temporary', 'approved', 'pending_verification', 'verified', 'ownership_completed', 'documented'];
    const currentIndex = statusOrder.indexOf(bookingStatus);

    return stages.map((stage, index) => {
      let status: 'completed' | 'active' | 'pending' = 'pending';

      if (index < currentIndex) {
        status = 'completed';
      } else if (index === currentIndex) {
        status = 'active';
      }

      return { ...stage, status };
    });
  };

  const stages = getStages();

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <div className="flex items-center justify-between relative">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.id} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      relative z-10 rounded-full p-2 transition-all duration-500
                      ${stage.status === 'completed'
                        ? `bg-gradient-to-br ${stage.color} shadow-lg ${stage.glowColor}`
                        : stage.status === 'active'
                        ? `bg-gradient-to-br ${stage.color} shadow-lg ${stage.glowColor} animate-pulse`
                        : 'bg-gray-300'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        w-5 h-5 transition-colors duration-300
                        ${stage.status === 'completed' || stage.status === 'active'
                          ? 'text-white'
                          : 'text-gray-500'
                        }
                      `}
                    />
                  </div>

                  <span
                    className={`
                      mt-2 text-xs font-semibold text-center transition-colors duration-300
                      ${stage.status === 'completed'
                        ? 'text-amber-600'
                        : stage.status === 'active'
                        ? 'text-green-600'
                        : 'text-gray-400'
                      }
                    `}
                    style={{ maxWidth: '90px' }}
                  >
                    {stage.label}
                  </span>
                </div>

                {!isLast && (
                  <div
                    className="absolute top-5 right-1/2 w-full h-1 -z-0"
                    style={{ transform: 'translateX(50%)' }}
                  >
                    <div className="relative w-full h-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`
                          absolute inset-0 transition-all duration-700 ease-out
                          ${stage.status === 'completed'
                            ? 'w-full bg-gradient-to-r from-amber-400 to-amber-600'
                            : 'w-0 bg-gray-200'
                          }
                        `}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
