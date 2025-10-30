import { useState, useEffect } from 'react';
import {
  Sparkles, Star, Zap, Crown, TrendingUp, Activity,
  Award, Gem, Heart, MessageCircle, Shield, Target
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TickerItem {
  id: string;
  content_ar: string;
  content_en?: string;
  icon_name: string;
  icon_color: string;
  background_gradient: string;
  is_active: boolean;
  sort_order: number;
  animation_type: 'float' | 'pulse' | 'bounce' | 'spin' | 'glow';
  enable_3d: boolean;
}

export function Advanced3DTicker() {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load ticker items from database
  useEffect(() => {
    loadTickerItems();

    // Realtime subscription
    const channel = supabase
      .channel('ticker_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ticker_items' },
        () => {
          console.log('🔄 Ticker items changed, reloading...');
          loadTickerItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTickerItems = async () => {
    try {
      const { data, error } = await supabase
        .from('ticker_items')
        .select('*')
        .eq('ticker_type', 'main')
        .eq('is_active', true)
        .order('sort_order');

      if (!error && data) {
        console.log('✅ Loaded ticker items:', data.length);
        setTickerItems(data);
      }
    } catch (err) {
      console.error('Error loading ticker items:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Sparkles, Star, Zap, Crown, TrendingUp, Activity,
      Award, Gem, Heart, MessageCircle, Shield, Target
    };
    return icons[iconName] || Star;
  };

  const getAnimationClass = (type: string) => {
    const animations: Record<string, string> = {
      float: 'animate-float',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce',
      spin: 'animate-spin-slow',
      glow: 'animate-glow'
    };
    return animations[type] || 'animate-float';
  };

  if (loading || tickerItems.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden py-4"
      style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.08) 50%, rgba(16, 185, 129, 0.05) 100%)',
        borderBottom: '1px solid rgba(16, 185, 129, 0.1)'
      }}
    >
      {/* Advanced 3D Ticker Container */}
      <div className="ticker-3d-container">
        <div className="ticker-3d-content">
          {/* First loop */}
          {tickerItems.map((item) => {
            const IconComponent = getIconComponent(item.icon_name);
            const animationClass = getAnimationClass(item.animation_type);

            return (
              <div
                key={item.id}
                className="ticker-3d-item group"
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* 3D Card Container */}
                <div
                  className={`ticker-3d-card ${item.enable_3d ? 'enable-3d-transform' : ''}`}
                  style={{
                    background: item.background_gradient || 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.15))',
                    transform: item.enable_3d ? 'rotateY(-5deg) rotateX(2deg)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Animated 3D Icon */}
                  <div className={`ticker-3d-icon ${animationClass}`}>
                    <div
                      className="icon-3d-wrapper"
                      style={{
                        transform: 'translateZ(20px)',
                        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
                      }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: item.icon_color }}
                      />
                    </div>
                  </div>

                  {/* 3D Text */}
                  <div className="ticker-3d-text">
                    <span
                      className="text-sm font-bold"
                      style={{
                        transform: 'translateZ(10px)',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        color: '#059669'
                      }}
                    >
                      {item.content_ar}
                    </span>
                  </div>

                  {/* 3D Shine Effect */}
                  <div className="ticker-3d-shine"></div>

                  {/* 3D Depth Layer */}
                  {item.enable_3d && (
                    <div
                      className="ticker-3d-depth"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
                        transform: 'translateZ(-5px)',
                        borderRadius: 'inherit'
                      }}
                    />
                  )}
                </div>

                {/* Floating Particles */}
                <div className="ticker-particles">
                  <div className="particle particle-1"></div>
                  <div className="particle particle-2"></div>
                  <div className="particle particle-3"></div>
                </div>
              </div>
            );
          })}

          {/* Second loop for seamless animation */}
          {tickerItems.map((item) => {
            const IconComponent = getIconComponent(item.icon_name);
            const animationClass = getAnimationClass(item.animation_type);

            return (
              <div
                key={`dup-${item.id}`}
                className="ticker-3d-item group"
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div
                  className={`ticker-3d-card ${item.enable_3d ? 'enable-3d-transform' : ''}`}
                  style={{
                    background: item.background_gradient || 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.15))',
                    transform: item.enable_3d ? 'rotateY(-5deg) rotateX(2deg)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className={`ticker-3d-icon ${animationClass}`}>
                    <div
                      className="icon-3d-wrapper"
                      style={{
                        transform: 'translateZ(20px)',
                        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
                      }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: item.icon_color }}
                      />
                    </div>
                  </div>

                  <div className="ticker-3d-text">
                    <span
                      className="text-sm font-bold"
                      style={{
                        transform: 'translateZ(10px)',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        color: '#059669'
                      }}
                    >
                      {item.content_ar}
                    </span>
                  </div>

                  <div className="ticker-3d-shine"></div>

                  {item.enable_3d && (
                    <div
                      className="ticker-3d-depth"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
                        transform: 'translateZ(-5px)',
                        borderRadius: 'inherit'
                      }}
                    />
                  )}
                </div>

                <div className="ticker-particles">
                  <div className="particle particle-1"></div>
                  <div className="particle particle-2"></div>
                  <div className="particle particle-3"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white via-white/50 to-transparent pointer-events-none z-10" />

      {/* CSS Styles */}
      <style>{`
        .ticker-3d-container {
          width: 100%;
          overflow: hidden;
        }

        .ticker-3d-content {
          display: flex;
          gap: 2rem;
          animation: ticker-scroll 30s linear infinite;
          will-change: transform;
        }

        .ticker-3d-item {
          flex-shrink: 0;
          position: relative;
        }

        .ticker-3d-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(16, 185, 129, 0.2);
          box-shadow:
            0 4px 12px rgba(16, 185, 129, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
          transform-style: preserve-3d;
          transition: all 0.3s ease;
        }

        .ticker-3d-card.enable-3d-transform:hover {
          transform: rotateY(0deg) rotateX(0deg) translateY(-2px) !important;
          box-shadow:
            0 8px 24px rgba(16, 185, 129, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.8) inset;
        }

        .ticker-3d-icon {
          position: relative;
          transform-style: preserve-3d;
        }

        .icon-3d-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .ticker-3d-card:hover .icon-3d-wrapper {
          transform: translateZ(30px) scale(1.1);
        }

        .ticker-3d-text {
          transform-style: preserve-3d;
          white-space: nowrap;
        }

        .ticker-3d-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          transform: translateX(-100%);
          animation: shine 3s infinite;
          pointer-events: none;
          border-radius: inherit;
        }

        .ticker-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.6), transparent);
          border-radius: 50%;
          opacity: 0;
        }

        .ticker-3d-card:hover .particle {
          animation: particle-float 2s ease-out infinite;
        }

        .particle-1 {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }

        .particle-2 {
          top: 50%;
          left: 50%;
          animation-delay: 0.5s;
        }

        .particle-3 {
          top: 70%;
          left: 70%;
          animation-delay: 1s;
        }

        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes shine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
        }

        @keyframes particle-float {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-30px) scale(1);
            opacity: 0;
          }
        }

        @keyframes animate-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        @keyframes animate-glow {
          0%, 100% { filter: drop-shadow(0 0 4px currentColor); }
          50% { filter: drop-shadow(0 0 12px currentColor); }
        }

        .animate-float {
          animation: animate-float 2s ease-in-out infinite;
        }

        .animate-glow {
          animation: animate-glow 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .ticker-3d-content {
            animation: ticker-scroll 20s linear infinite;
            gap: 1rem;
          }

          .ticker-3d-card {
            padding: 0.5rem 1rem;
            gap: 0.5rem;
          }

          .icon-3d-wrapper {
            width: 16px;
            height: 16px;
          }

          .ticker-3d-text span {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
