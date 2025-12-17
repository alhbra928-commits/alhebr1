import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, MapPin, Award, Sparkles, Leaf, TreePine } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StatsData {
  totalFarms: number;
  totalInvestors: number;
  totalTrees: number;
  totalRevenue: number;
  activeFarms: number;
  pendingBookings: number;
}

export function AdvancedStatsFooter() {
  const [stats, setStats] = useState<StatsData>({
    totalFarms: 0,
    totalInvestors: 0,
    totalTrees: 0,
    totalRevenue: 0,
    activeFarms: 0,
    pendingBookings: 0,
  });
  const [isVisible, setIsVisible] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const animate = () => {
      setScrollPosition((prev) => {
        const newPosition = prev + 1;
        const maxScroll = scrollContainer.scrollWidth / 2;
        return newPosition >= maxScroll ? 0 : newPosition;
      });
    };

    const animationId = setInterval(animate, 50);
    return () => clearInterval(animationId);
  }, []);

  const loadStats = async () => {
    try {
      const [farmsResult, investorsResult, treesResult, bookingsResult] = await Promise.all([
        supabase.from('farms').select('id, status', { count: 'exact' }),
        supabase.from('investors').select('id', { count: 'exact' }).is('deleted_at', null),
        supabase.from('farms').select('total_trees'),
        supabase.from('reservations').select('id, booking_status', { count: 'exact' }),
      ]);

      const totalTrees = treesResult.data?.reduce((sum, farm) => sum + (farm.total_trees || 0), 0) || 0;
      const activeFarms = farmsResult.data?.filter(f => f.status === 'open' || f.status === 'almost_full').length || 0;
      const pendingBookings = bookingsResult.data?.filter(b => b.booking_status === 'pending_approval').length || 0;

      setStats({
        totalFarms: farmsResult.count || 0,
        totalInvestors: investorsResult.count || 0,
        totalTrees,
        totalRevenue: 0,
        activeFarms,
        pendingBookings,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statsItems = [
    {
      icon: TreePine,
      label: 'إجمالي المزارع',
      value: stats.totalFarms.toLocaleString('ar-SA'),
      color: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/50',
    },
    {
      icon: Users,
      label: 'المستثمرين',
      value: stats.totalInvestors.toLocaleString('ar-SA'),
      color: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/50',
    },
    {
      icon: Leaf,
      label: 'الأشجار المزروعة',
      value: stats.totalTrees.toLocaleString('ar-SA'),
      color: 'from-green-500 to-lime-500',
      glow: 'shadow-green-500/50',
    },
    {
      icon: TrendingUp,
      label: 'المزارع النشطة',
      value: stats.activeFarms.toLocaleString('ar-SA'),
      color: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/50',
    },
    {
      icon: Award,
      label: 'حجوزات قيد المراجعة',
      value: stats.pendingBookings.toLocaleString('ar-SA'),
      color: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/50',
    },
    {
      icon: MapPin,
      label: 'المواقع المتاحة',
      value: stats.activeFarms.toLocaleString('ar-SA'),
      color: 'from-rose-500 to-red-500',
      glow: 'shadow-rose-500/50',
    },
  ];

  const allStats = [...statsItems, ...statsItems];

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .stats-footer-glass {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.05) 100%
          );
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow:
            0 -10px 40px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .stat-card-3d {
          transform-style: preserve-3d;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.25) 0%,
            rgba(255, 255, 255, 0.1) 100%
          );
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .stat-card-3d:hover {
          transform: translateY(-5px) rotateX(5deg);
          box-shadow:
            0 15px 50px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }

        .shimmer-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
          pointer-events: none;
        }

        .icon-glow {
          filter: drop-shadow(0 0 10px currentColor);
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .scroll-container {
          display: flex;
          gap: 1rem;
          will-change: transform;
        }

        .gradient-border {
          position: relative;
          background: linear-gradient(90deg,
            rgba(16, 185, 129, 0.5),
            rgba(59, 130, 246, 0.5),
            rgba(168, 85, 247, 0.5),
            rgba(239, 68, 68, 0.5)
          );
          background-size: 200% 100%;
          animation: gradient-shift 3s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .number-animation {
          display: inline-block;
          transition: all 0.3s ease;
        }

        .stat-card-3d:hover .number-animation {
          transform: scale(1.1);
          color: #fff;
          text-shadow: 0 0 20px currentColor;
        }
      `}</style>

      <div
        className="fixed bottom-0 left-0 right-0 stats-footer-glass z-50"
        style={{
          height: '90px',
        }}
      >
        {/* خط متحرك بألوان متدرجة في الأعلى */}
        <div
          className="gradient-border absolute top-0 left-0 right-0"
          style={{ height: '3px' }}
        />

        {/* المحتوى المتحرك */}
        <div className="relative h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

          <div
            ref={scrollContainerRef}
            className="scroll-container h-full items-center px-4"
            style={{
              transform: `translateX(-${scrollPosition}px)`,
              transition: 'transform 0.05s linear',
              paddingTop: '8px',
              paddingBottom: '8px',
            }}
          >
            {allStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={`${stat.label}-${index}`}
                  className="stat-card-3d rounded-2xl p-4 min-w-[280px] relative overflow-hidden group"
                  style={{
                    animation: `float ${3 + (index % 3)}s ease-in-out infinite`,
                    animationDelay: `${index * 0.2}s`,
                  }}
                >
                  {/* تأثير التألق */}
                  <div className="shimmer-effect" />

                  {/* الخلفية المتدرجة */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                  />

                  <div className="relative flex items-center gap-4">
                    {/* الأيقونة */}
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} ${stat.glow} shadow-lg`}>
                      <Icon className="w-6 h-6 text-white icon-glow" strokeWidth={2.5} />
                    </div>

                    {/* البيانات */}
                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </span>
                        <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
                      </div>
                      <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent number-animation`}>
                        {stat.value}
                      </div>
                    </div>
                  </div>

                  {/* خط مضيء في الأسفل */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Decorative particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-40"
              style={{
                left: `${(i * 12.5)}%`,
                top: '50%',
                animation: `float ${2 + (i % 2)}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Spacer للمحتوى */}
      <div style={{ height: '90px' }} />
    </>
  );
}
