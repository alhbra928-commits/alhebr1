import { useEffect, useState } from 'react';
import { TrendingUp, Users, Calendar, BarChart3 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface TickerStats {
  totalFarms: number;
  totalReservations: number;
  totalInvestors: number;
  availableTrees: number;
}

export function StockTicker() {
  const [stats, setStats] = useState<TickerStats>({
    totalFarms: 0,
    totalReservations: 0,
    totalInvestors: 0,
    availableTrees: 0,
  });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const [farmsResult, reservationsResult, investorsResult, treesResult] = await Promise.all([
        supabase.from('farms').select('id', { count: 'exact', head: true }),
        supabase.from('reservations').select('id', { count: 'exact', head: true }),
        supabase.from('investors').select('id', { count: 'exact', head: true }),
        supabase.from('farms').select('available_trees'),
      ]);

      const totalAvailableTrees = treesResult.data?.reduce((sum, farm) => sum + (farm.available_trees || 0), 0) || 0;

      setStats({
        totalFarms: farmsResult.count || 0,
        totalReservations: reservationsResult.count || 0,
        totalInvestors: investorsResult.count || 0,
        availableTrees: totalAvailableTrees,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // بيانات تجريبية متحركة
  const [demoStats, setDemoStats] = useState({
    farms: 12,
    reservations: 245,
    investors: 89,
    trees: 1540,
  });

  useEffect(() => {
    const demoInterval = setInterval(() => {
      setDemoStats(prev => ({
        farms: prev.farms + Math.floor(Math.random() * 3) - 1,
        reservations: prev.reservations + Math.floor(Math.random() * 5) - 2,
        investors: prev.investors + Math.floor(Math.random() * 3) - 1,
        trees: prev.trees + Math.floor(Math.random() * 10) - 5,
      }));
    }, 2000);

    return () => clearInterval(demoInterval);
  }, []);

  const tickerItems = [
    { icon: BarChart3, label: 'المزارع النشطة', value: demoStats.farms, color: '#10b981', change: '+2.4%' },
    { icon: Calendar, label: 'إجمالي الحجوزات', value: demoStats.reservations, color: '#3b82f6', change: '+5.7%' },
    { icon: Users, label: 'المستثمرون', value: demoStats.investors, color: '#f59e0b', change: '+3.1%' },
    { icon: TrendingUp, label: 'الأشجار المتاحة', value: demoStats.trees, color: '#8b5cf6', change: '-1.2%' },
  ];

  return (
    <div className="fixed top-16 md:top-20 left-0 right-0 w-full overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-y border-slate-700/50 shadow-2xl z-40">
      <div className="relative h-12 md:h-14 flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-amber-500/5 animate-pulse"></div>

        <div className="ticker-wrapper w-full">
          <div className="ticker-content flex items-center gap-8 animate-ticker">
            {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-1.5 md:py-2 rounded-lg backdrop-blur-sm whitespace-nowrap"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div
                    className="p-1.5 md:p-2 rounded-lg"
                    style={{
                      background: `${item.color}15`,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    <Icon size={16} className="md:w-[18px] md:h-[18px]" style={{ color: item.color }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs text-gray-400 font-medium">{item.label}</span>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span
                        className="text-sm md:text-lg font-bold transition-all duration-300"
                        style={{ color: item.color }}
                      >
                        {item.value.toLocaleString('ar-SA')}
                      </span>
                      <span
                        className="text-[9px] md:text-[10px] font-semibold px-1 md:px-1.5 py-0.5 rounded"
                        style={{
                          color: item.change.startsWith('+') ? '#10b981' : '#ef4444',
                          background: item.change.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        }}
                      >
                        {item.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .ticker-wrapper {
          position: relative;
          overflow: hidden;
        }

        .ticker-content {
          display: flex;
          width: max-content;
        }

        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-ticker {
          animation: ticker 30s linear infinite;
        }

        .ticker-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
