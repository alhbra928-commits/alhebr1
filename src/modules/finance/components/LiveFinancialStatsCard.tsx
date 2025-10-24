import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Sparkles, Wallet, Users, Heart, Building2 } from 'lucide-react';
import { LiveFinancialUpdatesService } from '../../../services/liveFinancialUpdatesService';
import { supabase } from '../../../lib/supabase';

interface LiveFinancialStatsProps {
  farmCode: string;
  collectedFromInvestors: number;
  remainingForOwner: number;
  actualAmount: number;
  visualPercentage: number;
  healthStatus: 'low' | 'medium' | 'high' | 'complete';
  flashShown: boolean;
  onFlashComplete?: () => void;
}

export const LiveFinancialStatsCard: React.FC<LiveFinancialStatsProps> = ({
  farmCode,
  collectedFromInvestors: initialCollected,
  remainingForOwner: initialRemaining,
  actualAmount,
  visualPercentage: initialPercentage,
  healthStatus: initialHealthStatus,
  flashShown: initialFlashShown,
  onFlashComplete
}) => {
  const [collectedFromInvestors, setCollectedFromInvestors] = useState(initialCollected);
  const [remainingForOwner, setRemainingForOwner] = useState(initialRemaining);
  const [visualPercentage, setVisualPercentage] = useState(initialPercentage);
  const [healthStatus, setHealthStatus] = useState(initialHealthStatus);
  const [flashShown, setFlashShown] = useState(initialFlashShown);
  const [showFlash, setShowFlash] = useState(false);
  const [animatedCollected, setAnimatedCollected] = useState(0);
  const [animatedRemaining, setAnimatedRemaining] = useState(initialRemaining);
  const [walletData, setWalletData] = useState({
    platformProfit: 0,
    charityAmount: 0,
    marketingAmount: 0,
    totalInvestors: 0
  });

  useEffect(() => {
    const unsubscribeRealtime = LiveFinancialUpdatesService.subscribeToRealtimeUpdates(
      farmCode,
      (data) => {
        setCollectedFromInvestors(data.collected_from_investors);
        setRemainingForOwner(data.remaining_for_owner);
        setVisualPercentage(data.completion_percentage_visual);
        setHealthStatus(data.financial_health_status);
        setFlashShown(data.completion_flash_shown);
      }
    );

    const unsubscribePolling = LiveFinancialUpdatesService.startPolling(
      farmCode,
      (data) => {
        setCollectedFromInvestors(data.collected_from_investors);
        setRemainingForOwner(data.remaining_for_owner);
        setVisualPercentage(data.completion_percentage_visual);
        setHealthStatus(data.financial_health_status);
        setFlashShown(data.completion_flash_shown);
      },
      3000
    );

    return () => {
      unsubscribeRealtime();
      unsubscribePolling();
    };
  }, [farmCode]);

  useEffect(() => {
    if (healthStatus === 'complete' && !flashShown) {
      setShowFlash(true);
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizcIHmm+7+ihUhELTKXh8Ldl');
      audio.play().catch(() => {});

      setTimeout(() => {
        setShowFlash(false);
        onFlashComplete?.();
      }, 6000);
    }
  }, [healthStatus, flashShown, onFlashComplete]);

  useEffect(() => {
    let start = animatedCollected;
    const end = collectedFromInvestors;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const current = start + (end - start) * progress;

      setAnimatedCollected(Math.floor(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [collectedFromInvestors]);

  useEffect(() => {
    setAnimatedRemaining(remainingForOwner);
  }, [remainingForOwner]);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const { data, error } = await supabase
          .from('smart_farm_finances')
          .select('net_platform_profit, charity_amount, marketing_amount, actual_amount, total_investors')
          .eq('farm_code', farmCode)
          .is('deleted_at', null)
          .maybeSingle();

        if (!error && data) {
          setWalletData({
            platformProfit: Number(data.net_platform_profit || 0),
            charityAmount: Number(data.charity_amount || 0),
            marketingAmount: Number(data.marketing_amount || 0),
            totalInvestors: Number(data.total_investors || 0)
          });
        }
      } catch (err) {
        console.error('Error fetching wallet data:', err);
      }
    };

    fetchWalletData();
    const interval = setInterval(fetchWalletData, 5000);
    return () => clearInterval(interval);
  }, [farmCode]);

  const getHealthColor = () => {
    switch (healthStatus) {
      case 'complete': return 'from-yellow-400 via-amber-500 to-yellow-600';
      case 'high': return 'from-green-400 via-emerald-500 to-green-600';
      case 'medium': return 'from-blue-400 via-cyan-500 to-blue-600';
      default: return 'from-gray-400 via-slate-500 to-gray-600';
    }
  };

  const getTextColor = () => {
    switch (healthStatus) {
      case 'complete': return 'text-yellow-600';
      case 'high': return 'text-green-600';
      case 'medium': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getPulseAnimation = () => {
    if (healthStatus === 'high') return 'animate-pulse-slow';
    return '';
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg
        ${showFlash ? 'animate-golden-flash' : ''}
        ${healthStatus === 'high' && !showFlash ? 'animate-pulse-gentle' : ''}
      `}
    >
      {showFlash && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-yellow-400/90 via-amber-500/90 to-yellow-600/90 animate-pulse">
          <div className="text-center text-white p-6">
            <Sparkles className="w-16 h-16 mx-auto mb-4 animate-spin-slow" />
            <p className="text-2xl font-bold mb-2" style={{ fontFamily: 'Tajawal' }}>
              ✨ تم بلوغ المبلغ الكامل
            </p>
            <p className="text-lg" style={{ fontFamily: 'Tajawal' }}>
              المزرعة جاهزة للتسوية المالية
            </p>
          </div>
        </div>
      )}

      <div className={`
        bg-gradient-to-br ${getHealthColor()}
        p-4
        ${getPulseAnimation()}
      `}>
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3
              className={`text-lg font-bold ${getTextColor()}`}
              style={{ fontFamily: 'Tajawal' }}
            >
              💹 الحالة المالية الحالية
            </h3>
            {healthStatus === 'complete' && (
              <Sparkles className="w-5 h-5 text-yellow-600 animate-pulse" />
            )}
          </div>

          {/* المحافظ الأربعة */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* محفظة المستثمرين */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold text-blue-900" style={{ fontFamily: 'Tajawal' }}>
                  محفظة المستثمرين
                </span>
              </div>
              <p className="text-2xl font-black text-blue-700" style={{ fontFamily: 'Tajawal' }}>
                {animatedCollected.toLocaleString('ar-SA')}
              </p>
              <p className="text-xs text-blue-600 mt-1" style={{ fontFamily: 'Tajawal' }}>ريال</p>
            </div>

            {/* محفظة صاحب المزرعة */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-xs font-bold text-green-900" style={{ fontFamily: 'Tajawal' }}>
                  محفظة صاحب المزرعة
                </span>
              </div>
              <p className="text-2xl font-black text-green-700" style={{ fontFamily: 'Tajawal' }}>
                {animatedRemaining.toLocaleString('ar-SA')}
              </p>
              <p className="text-xs text-green-600 mt-1" style={{ fontFamily: 'Tajawal' }}>ريال (بعد التسوية)</p>
            </div>

            {/* محفظة ربح المنصة */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-bold text-purple-900" style={{ fontFamily: 'Tajawal' }}>
                  محفظة ربح المنصة
                </span>
              </div>
              <p className="text-2xl font-black text-purple-700" style={{ fontFamily: 'Tajawal' }}>
                {walletData.platformProfit.toLocaleString('ar-SA')}
              </p>
              <p className="text-xs text-purple-600 mt-1" style={{ fontFamily: 'Tajawal' }}>ريال (75% من الربح)</p>
            </div>

            {/* محفظة الخير */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border-2 border-pink-200 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <span className="text-xs font-bold text-pink-900" style={{ fontFamily: 'Tajawal' }}>
                  محفظة الخير
                </span>
              </div>
              <p className="text-2xl font-black text-pink-700" style={{ fontFamily: 'Tajawal' }}>
                {walletData.charityAmount.toLocaleString('ar-SA')}
              </p>
              <p className="text-xs text-pink-600 mt-1" style={{ fontFamily: 'Tajawal' }}>ريال (25% من الربح)</p>
            </div>
          </div>

          {/* نظرة عامة */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200 mb-3">
            <h4 className="text-sm font-bold text-amber-900 mb-3" style={{ fontFamily: 'Tajawal' }}>
              📊 نظرة عامة
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600 mb-1" style={{ fontFamily: 'Tajawal' }}>المبلغ التسويقي</p>
                <p className="text-lg font-bold text-amber-700" style={{ fontFamily: 'Tajawal' }}>
                  {walletData.marketingAmount.toLocaleString('ar-SA')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1" style={{ fontFamily: 'Tajawal' }}>المبلغ الفعلي</p>
                <p className="text-lg font-bold text-amber-700" style={{ fontFamily: 'Tajawal' }}>
                  {actualAmount.toLocaleString('ar-SA')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1" style={{ fontFamily: 'Tajawal' }}>عدد المستثمرين</p>
                <p className="text-lg font-bold text-amber-700" style={{ fontFamily: 'Tajawal' }}>
                  {walletData.totalInvestors}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1" style={{ fontFamily: 'Tajawal' }}>نسبة الإكتمال الفعلية</p>
                <p className="text-lg font-bold text-amber-700" style={{ fontFamily: 'Tajawal' }}>
                  {((animatedCollected / actualAmount) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* شريط التقدم */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1" style={{ fontFamily: 'Tajawal' }}>
              <span>نسبة الإكتمال الحالية</span>
              <span className="font-bold">{visualPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getHealthColor()} transition-all duration-1000 ease-out ${getPulseAnimation()}`}
                style={{ width: `${Math.min(visualPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes golden-flash {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0);
          }
          50% {
            box-shadow: 0 0 40px 10px rgba(251, 191, 36, 0.8);
          }
        }

        @keyframes pulse-gentle {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
          50% {
            box-shadow: 0 0 20px 5px rgba(34, 197, 94, 0.4);
          }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-golden-flash {
          animation: golden-flash 1s ease-in-out 6;
        }

        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
