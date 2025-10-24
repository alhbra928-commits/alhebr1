import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Wallet,
  Users,
  Building2,
  Heart,
  TrendingUp,
  CheckCircle,
  Clock,
  Sparkles,
  DollarSign,
  Activity
} from 'lucide-react';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { Phase1FinanceService, FarmFinancePhase1 } from '../services/phase1FinanceService';
import { SettlementService } from '../services/settlementService';
import { LiveFinancialSystem } from '../../../services/liveFinancialSystem';
import { CompactLiveStatusIndicator } from '../../../components/common/LiveStatusIndicator';

interface FarmFinancialFullPageProps {
  farmId: string;
  onBack: () => void;
}

export function FarmFinancialFullPage({ farmId, onBack }: FarmFinancialFullPageProps) {
  const [farmData, setFarmData] = useState<FarmFinancePhase1 | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadFarmData();

    const unsubscribe = LiveFinancialSystem.subscribe((state) => {
      setIsLiveConnected(state.isConnected);
      setLastLiveUpdate(state.lastUpdate);

      const updatedFarm = state.farmFinances.get(farmData?.farm_code || '');
      if (updatedFarm && farmData) {
        setFarmData(updatedFarm);

        if (Number(updatedFarm.completion_percentage_visual) >= 100 &&
            updatedFarm.settlement_status === 'ready_for_settlement') {
          setShowCelebration(true);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [farmId, farmData?.farm_code]);

  const loadFarmData = async () => {
    try {
      setLoading(true);
      const data = await Phase1FinanceService.getAllFarmFinances();
      const farm = data.find(f => f.farm_id === farmId);

      if (farm) {
        setFarmData(farm);

        if (Number(farm.completion_percentage_visual) >= 100 &&
            farm.settlement_status === 'ready_for_settlement') {
          setShowCelebration(true);
        }
      }
    } catch (error) {
      console.error('Error loading farm data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettlement = async () => {
    if (!farmData) return;

    try {
      setIsSettling(true);
      await SettlementService.executeSettlement(farmData.farm_code);
      await loadFarmData();
      alert('✅ تمت التسوية بنجاح! المزرعة أصبحت الآن مملوكة للمنصة.');
    } catch (error) {
      console.error('Error executing settlement:', error);
      alert('❌ حدث خطأ أثناء تنفيذ التسوية');
    } finally {
      setIsSettling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-black text-slate-800">جاري تحميل البيانات المالية...</p>
        </div>
      </div>
    );
  }

  if (!farmData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
        <div className="text-center">
          <p className="text-xl font-black text-slate-800">لم يتم العثور على بيانات المزرعة</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-bold hover:scale-105 transition-transform"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const collectedAmount = Number(farmData.collected_from_investors) || 0;
  const actualAmount = Number(farmData.actual_amount) || 0;
  const remainingForOwner = Number(farmData.remaining_for_owner) || 0;
  const grossProfit = Number(farmData.platform_profit) || 0;
  const charityAmount = Number(farmData.charity_amount) || 0;
  const netPlatformProfit = grossProfit - charityAmount;
  const completionPercentage = Number(farmData.completion_percentage_visual) || 0;
  const isFullyFunded = completionPercentage >= 100;
  const isSettled = farmData.owner_payment_approved;
  const isProfitDistributed = farmData.profit_distributed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 animate-fade-in">
      {/* Celebration Flash */}
      {showCelebration && !isSettled && (
        <div className="fixed inset-0 pointer-events-none z-50 animate-celebration-flash">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-white/30 to-green-700/20"></div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-green-800 via-yellow-600 to-green-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all text-white font-bold"
            >
              <ArrowLeft className="w-5 h-5" />
              الرجوع
            </button>

            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-3 mb-1">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                <h1 className="text-3xl font-black text-white">
                  {farmData.farm_name}
                </h1>
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              </div>
              <div className="flex items-center justify-center gap-4">
                <p className="text-sm text-yellow-200 font-bold">
                  كود المزرعة: {farmData.farm_code}
                </p>
                <CompactLiveStatusIndicator
                  isConnected={isLiveConnected}
                  lastUpdate={lastLiveUpdate}
                />
              </div>
            </div>

            <div className="w-32">
              <StatusBadge
                isFullyFunded={isFullyFunded}
                isSettled={isSettled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Alert */}
      {showCelebration && !isSettled && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-2xl p-6 shadow-2xl animate-pulse-slow border-4 border-yellow-500">
            <div className="flex items-center justify-center gap-4">
              <Sparkles className="w-10 h-10 text-yellow-700 animate-spin-slow" />
              <p className="text-2xl font-black text-yellow-900 text-center">
                ✨ تم بلوغ القيمة الكاملة للمزرعة — جاهزة للتسوية ✨
              </p>
              <Sparkles className="w-10 h-10 text-yellow-700 animate-spin-slow" />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Four Wallets System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Wallet 1: Investors */}
          <WalletCard
            title="محفظة المستثمرين"
            icon={<Users className="w-8 h-8" />}
            amount={collectedAmount}
            gradient="from-blue-600 to-blue-800"
            description={`المبلغ المجمع: ${completionPercentage.toFixed(1)}%`}
            showProgress={true}
            progress={completionPercentage}
            isActive={!isSettled}
          />

          {/* Wallet 2: Farm Owner */}
          <WalletCard
            title="محفظة صاحب المزرعة"
            icon={<Building2 className="w-8 h-8" />}
            amount={isSettled ? actualAmount : remainingForOwner}
            gradient="from-green-600 to-green-800"
            description={isSettled ? "تمت التسوية ✅" : `متبقي: ${remainingForOwner.toLocaleString()} ريال`}
            isActive={!isSettled}
            isClosed={isSettled}
          />

          {/* Wallet 3: Platform */}
          <WalletCard
            title="محفظة المنصة"
            icon={<Wallet className="w-8 h-8" />}
            amount={isSettled ? netPlatformProfit : 0}
            gradient="from-purple-600 to-purple-800"
            description={isSettled ? "الربح الصافي (بعد استقطاع 25%)" : "في انتظار التسوية"}
            isActive={isSettled}
            showDistribution={isSettled && isProfitDistributed}
          />

          {/* Wallet 4: Charity */}
          <WalletCard
            title="محفظة الخير"
            icon={<Heart className="w-8 h-8" />}
            amount={isSettled ? charityAmount : 0}
            gradient="from-pink-600 to-pink-800"
            description={isSettled ? "25% من الأرباح الإجمالية" : "في انتظار التسوية"}
            isActive={isSettled}
            showDistribution={isSettled && isProfitDistributed}
          />
        </div>

        {/* Settlement Button */}
        {isFullyFunded && !isSettled && (
          <div className="mb-8">
            <button
              onClick={handleSettlement}
              disabled={isSettling}
              className="w-full py-6 rounded-2xl font-black text-white text-xl flex items-center justify-center gap-4
                       shadow-2xl transform hover:scale-105 transition-all duration-300
                       relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #556B2F 0%, #D4AF37 50%, #FFD700 100%)',
                boxShadow: '0 10px 40px rgba(212, 175, 55, 0.6)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                            transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <CheckCircle className="w-8 h-8 relative z-10" />
              <span className="relative z-10">
                {isSettling ? '⏳ جاري تنفيذ التسوية...' : '✅ تنفيذ التسوية مع صاحب المزرعة'}
              </span>
            </button>
          </div>
        )}

        {/* Overview Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <Activity className="w-7 h-7 text-green-600" />
            نظرة عامة
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="المبلغ التسويقي" value={Number(farmData.marketing_amount)} color="text-purple-600" />
            <StatBox label="المبلغ الفعلي" value={actualAmount} color="text-blue-600" />
            <StatBox label="عدد المستثمرين" value={farmData.total_investors} color="text-green-600" isNumber />
            <StatBox label="نسبة التمويل" value={`${completionPercentage.toFixed(1)}%`} color="text-yellow-600" isPercentage />
          </div>
        </div>

        {/* Success Messages */}
        {isSettled && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 shadow-2xl text-white text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-black mb-2">
                🎉 تمت التسوية بنجاح!
              </h3>
              <p className="text-lg">
                المزرعة أصبحت الآن مملوكة للمنصة
              </p>
            </div>

            {isProfitDistributed && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Heart className="w-10 h-10 text-yellow-600" />
                  <h3 className="text-2xl font-black text-yellow-900">
                    توزيع الأرباح
                  </h3>
                  <Heart className="w-10 h-10 text-yellow-600" />
                </div>

                <div className="space-y-3 text-center">
                  <div className="bg-white/50 rounded-xl p-4">
                    <p className="text-lg font-bold text-slate-700 mb-2">
                      الأرباح الإجمالية: <span className="text-purple-700">{grossProfit.toLocaleString()} ريال</span>
                    </p>
                    <div className="h-px bg-yellow-400 my-3"></div>
                    <p className="text-base font-bold text-green-700">
                      💰 محفظة المنصة: {netPlatformProfit.toLocaleString()} ريال (75%)
                    </p>
                    <p className="text-base font-bold text-pink-700 mt-2">
                      🤍 محفظة الخير: {charityAmount.toLocaleString()} ريال (25%)
                    </p>
                  </div>

                  <p className="text-lg font-black text-yellow-800 mt-4">
                    🤲 جزاكم الله خيرًا
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface WalletCardProps {
  title: string;
  icon: React.ReactNode;
  amount: number;
  gradient: string;
  description: string;
  showProgress?: boolean;
  progress?: number;
  isActive?: boolean;
  isClosed?: boolean;
  showDistribution?: boolean;
}

function WalletCard({
  title,
  icon,
  amount,
  gradient,
  description,
  showProgress,
  progress = 0,
  isActive = true,
  isClosed = false,
  showDistribution = false
}: WalletCardProps) {
  return (
    <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-2xl
                    ${isActive ? 'animate-scale-in' : 'opacity-60'}
                    ${isClosed ? 'border-4 border-red-500' : ''}`}>
      {isClosed && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          مغلقة
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
        <TrendingUp className="w-6 h-6 opacity-50" />
      </div>

      <h3 className="text-xl font-bold mb-2">{title}</h3>

      <div className="text-3xl font-black mb-3">
        <AnimatedCounter value={amount} decimals={0} /> ريال
      </div>

      {showProgress && (
        <div className="mb-3">
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      <p className="text-sm opacity-90">{description}</p>
    </div>
  );
}

interface StatusBadgeProps {
  isFullyFunded: boolean;
  isSettled: boolean;
}

function StatusBadge({ isFullyFunded, isSettled }: StatusBadgeProps) {
  if (isSettled) {
    return (
      <div className="bg-green-500 text-white px-4 py-2 rounded-xl text-center font-bold text-sm">
        <CheckCircle className="w-4 h-4 inline-block mr-1" />
        مملوكة للمنصة
      </div>
    );
  }

  if (isFullyFunded) {
    return (
      <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl text-center font-bold text-sm animate-pulse">
        <Sparkles className="w-4 h-4 inline-block mr-1" />
        جاهزة للتسوية
      </div>
    );
  }

  return (
    <div className="bg-blue-500 text-white px-4 py-2 rounded-xl text-center font-bold text-sm">
      <Clock className="w-4 h-4 inline-block mr-1" />
      تحت التجميع
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: number | string;
  color: string;
  isNumber?: boolean;
  isPercentage?: boolean;
}

function StatBox({ label, value, color, isNumber, isPercentage }: StatBoxProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
      <p className="text-sm text-slate-600 mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>
        {isNumber || isPercentage ? value : (
          <><AnimatedCounter value={Number(value)} decimals={0} /> ريال</>
        )}
      </p>
    </div>
  );
}
