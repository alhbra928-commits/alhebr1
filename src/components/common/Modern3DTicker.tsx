import { useEffect, useState } from 'react';
import {
  Sparkles, TreePine, Leaf, Award, TrendingUp,
  Shield, Users, Target, CheckCircle, Star
} from 'lucide-react';

interface TickerMessage {
  id: string;
  text_ar: string;
  icon_name: string;
  color: string;
  is_active: boolean;
  order_index: number;
}

interface Modern3DTickerProps {
  messages?: TickerMessage[];
  speed?: number;
  height?: string;
  enabled?: boolean;
}

const iconMap: Record<string, any> = {
  sparkles: Sparkles,
  tree: TreePine,
  leaf: Leaf,
  award: Award,
  trending: TrendingUp,
  shield: Shield,
  users: Users,
  target: Target,
  check: CheckCircle,
  star: Star,
};

const defaultMessages: TickerMessage[] = [
  {
    id: '1',
    text_ar: 'استثمر في مستقبل أخضر مستدام',
    icon_name: 'tree',
    color: '#10b981',
    is_active: true,
    order_index: 1
  },
  {
    id: '2',
    text_ar: 'عوائد سنوية مضمونة من أشجارك',
    icon_name: 'trending',
    color: '#059669',
    is_active: true,
    order_index: 2
  },
  {
    id: '3',
    text_ar: 'ملكية موثقة ومضمونة قانونياً',
    icon_name: 'shield',
    color: '#047857',
    is_active: true,
    order_index: 3
  },
  {
    id: '4',
    text_ar: 'تملك أشجار النخيل والزيتون الآن',
    icon_name: 'award',
    color: '#065f46',
    is_active: true,
    order_index: 4
  },
];

export function Modern3DTicker({
  messages = defaultMessages,
  speed = 40,
  height = '80px',
  enabled = true
}: Modern3DTickerProps) {
  const [isPaused, setIsPaused] = useState(false);

  if (!enabled) return null;

  const activeMessages = messages.filter(m => m.is_active).sort((a, b) => a.order_index - b.order_index);

  if (activeMessages.length === 0) return null;

  // حساب العرض الكلي للرسائل لتحديد مدة الحركة المناسبة
  const messageCount = activeMessages.length;
  const adjustedSpeed = speed * Math.max(1, messageCount / 4); // تعديل السرعة حسب عدد الرسائل

  return (
    <div
      className="modern-3d-ticker-wrapper relative overflow-hidden"
      style={{ height }}
    >
      {/* Glass Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/90 via-green-50/90 to-teal-50/90 backdrop-blur-sm border-y border-emerald-200/50"></div>

      {/* 3D Perspective Container */}
      <div
        className="modern-3d-ticker-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`modern-3d-ticker-track ${isPaused ? 'paused' : ''}`}
          style={{
            animationDuration: `${adjustedSpeed}s`
          }}
        >
          {activeMessages.map((message, index) => {
            const IconComponent = iconMap[message.icon_name] || Star;

            return (
              <div
                key={`${message.id}-${index}`}
                className="modern-3d-ticker-item"
              >
                {/* 3D Icon Container */}
                <div
                  className="ticker-icon-3d"
                  style={{
                    '--icon-color': message.color
                  } as React.CSSProperties}
                >
                  {/* Multiple layers for 3D effect */}
                  <div className="icon-layer layer-1">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="icon-layer layer-2">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="icon-layer layer-3">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Glow Effect */}
                  <div className="icon-glow"></div>
                </div>

                {/* Text with 3D Shadow */}
                <span
                  className="ticker-text-3d"
                  style={{
                    '--text-color': message.color
                  } as React.CSSProperties}
                >
                  {message.text_ar}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edge Gradients for fade effect */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-emerald-50/90 to-transparent pointer-events-none z-10"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-emerald-50/90 to-transparent pointer-events-none z-10"></div>

      {/* Styles */}
      <style>{`
        .modern-3d-ticker-wrapper {
          position: relative;
          width: 100%;
          perspective: 1000px;
        }

        .modern-3d-ticker-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .modern-3d-ticker-track {
          display: flex;
          animation: ticker-scroll linear infinite;
          will-change: transform;
        }

        .modern-3d-ticker-track.paused {
          animation-play-state: paused;
        }

        .modern-3d-ticker-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0 3rem;
          white-space: nowrap;
          flex-shrink: 0;
          transform-style: preserve-3d;
        }

        /* 3D Icon Styling */
        .ticker-icon-3d {
          position: relative;
          width: 48px;
          height: 48px;
          transform-style: preserve-3d;
          animation: icon-float 3s ease-in-out infinite;
        }

        .icon-layer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--icon-color);
        }

        .layer-1 {
          transform: translateZ(8px);
          opacity: 1;
          filter: drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3));
        }

        .layer-2 {
          transform: translateZ(4px);
          opacity: 0.6;
        }

        .layer-3 {
          transform: translateZ(0px);
          opacity: 0.3;
        }

        .icon-glow {
          position: absolute;
          inset: -4px;
          background: radial-gradient(circle, var(--icon-color) 0%, transparent 70%);
          opacity: 0.2;
          animation: glow-pulse 2s ease-in-out infinite;
          border-radius: 50%;
        }

        /* 3D Text Styling */
        .ticker-text-3d {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-color);
          text-shadow:
            0 1px 0 rgba(255, 255, 255, 0.5),
            0 2px 0 rgba(16, 185, 129, 0.1),
            0 3px 0 rgba(16, 185, 129, 0.1),
            0 4px 8px rgba(16, 185, 129, 0.2);
          transform: translateZ(4px);
          transition: transform 0.3s ease;
        }

        .modern-3d-ticker-item:hover .ticker-text-3d {
          transform: translateZ(8px) scale(1.05);
        }

        /* Animations */
        @keyframes ticker-scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes icon-float {
          0%, 100% {
            transform: translateY(0px) rotateY(0deg);
          }
          25% {
            transform: translateY(-4px) rotateY(5deg);
          }
          50% {
            transform: translateY(0px) rotateY(0deg);
          }
          75% {
            transform: translateY(-4px) rotateY(-5deg);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.1);
          }
        }

        /* Hover Effects */
        .modern-3d-ticker-item:hover .ticker-icon-3d {
          animation: icon-spin 1s ease-in-out;
        }

        @keyframes icon-spin {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modern-3d-ticker-item {
            padding: 0 2rem;
            gap: 0.75rem;
          }

          .ticker-icon-3d {
            width: 36px;
            height: 36px;
          }

          .ticker-text-3d {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}
