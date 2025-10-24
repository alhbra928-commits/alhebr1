import React, { useState, useEffect, useRef } from 'react';
import {
  DollarSign,
  TrendingUp,
  Building2,
  Heart,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Eye,
  CheckCircle,
  BarChart3,
  Send,
  Settings,
  Receipt,
  Bot,
  ChevronRight,
  Zap
} from 'lucide-react';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { BackButton } from '../../../components/common/BackButton';
import { Phase1FinanceService, FarmFinancePhase1 } from '../services/phase1FinanceService';
import { AdvancedAnalyticsService, PlatformKPIs } from '../services/advancedAnalyticsService';
import { ExpandableFinancialCard } from './ExpandableFinancialCard';
import { FarmFinancialFullPage } from './FarmFinancialFullPage';
import { LiveFinancialSystem } from '../../../services/liveFinancialSystem';
import { LiveStatusIndicator } from '../../../components/common/LiveStatusIndicator';

interface ModernFinancialInterfaceProps {
  onBack?: () => void;
}

export function ModernFinancialInterface({ onBack }: ModernFinancialInterfaceProps) {
  console.log('🎉 ModernFinancialInterface component loaded!');

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<PlatformKPIs | null>(null);
  const [farms, setFarms] = useState<FarmFinancePhase1[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<FarmFinancePhase1 | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [fullPageFarmId, setFullPageFarmId] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<Date | null>(null);

  const revenueRef = useRef<HTMLDivElement>(null);
  const settlementsRef = useRef<HTMLDivElement>(null);
  const walletsRef = useRef<HTMLDivElement>(null);
  const profitsRef = useRef<HTMLDivElement>(null);
  const charityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();

    LiveFinancialSystem.initialize();

    const unsubscribe = LiveFinancialSystem.subscribe((state) => {
      console.log('📊 Live Financial Update:', state);
      setIsLiveConnected(state.isConnected);
      setLastLiveUpdate(state.lastUpdate);

      const farmsArray = Array.from(state.farmFinances.values());
      if (farmsArray.length > 0) {
        setFarms(farmsArray);
      }

      if (state.platformWallet || state.charityWallet) {
        loadKPIs();
      }
    });

    return () => {
      unsubscribe();
      LiveFinancialSystem.cleanup();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpisData, farmsData, insightsData] = await Promise.all([
        AdvancedAnalyticsService.getPlatformKPIs(),
        Phase1FinanceService.getAllFarmFinances(),
        AdvancedAnalyticsService.getAIInsights()
      ]);

      setKpis(kpisData);
      setFarms(farmsData);
      setAiInsights(insightsData.map(i => i.description_ar));
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadKPIs = async () => {
    try {
      const kpisData = await AdvancedAnalyticsService.getPlatformKPIs();
      setKpis(kpisData);
    } catch (error) {
      console.error('Error loading KPIs:', error);
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, section: string) => {
    setActiveSection(section);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (fullPageFarmId) {
    return (
      <FarmFinancialFullPage
        farmId={fullPageFarmId}
        onBack={() => setFullPageFarmId(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f4f0 0%, #e8ebe9 100%)' }}>
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-black text-slate-800" style={{ fontFamily: 'Tajawal' }}>
            جاري تحميل الواجهة المالية المتطورة...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedFarm && (
        <ExpandableFinancialCard
          finance={selectedFarm}
          isExpanded={true}
          onToggle={() => {}}
          onClose={() => setSelectedFarm(null)}
        />
      )}

      <div
        className="min-h-screen"
        style={{
          background: 'linear-gradient(135deg, #f0f4f0 0%, #e8ebe9 100%)',
          fontFamily: 'Tajawal',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23D4AF37" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      >
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Live Status Indicator */}
          <div className="mb-6 flex items-center justify-between">
            {onBack && <BackButton onClick={onBack} />}
            <div className="flex-1 flex justify-center">
              <LiveStatusIndicator
                isConnected={isLiveConnected}
                lastUpdate={lastLiveUpdate}
                showDetails={true}
              />
            </div>
            {onBack && <div className="w-32"></div>}
          </div>

          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)',
                  }}
                >
                  <DollarSign className="w-12 h-12 text-white relative z-10" />
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-3xl opacity-20 blur-xl animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl font-black text-slate-800 mb-2 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text">
              الإدارة المالية المتطورة
            </h1>
            <p className="text-lg text-slate-600">منصة ذكية لإدارة الأموال والأرباح بسهولة وفخامة</p>
          </div>

          {/* Quick Access Bar */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 mb-8 border border-slate-200/50 sticky top-4 z-30">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              <QuickAccessButton
                icon={<TrendingUp className="w-5 h-5" />}
                label="الإيرادات"
                onClick={() => scrollToSection(revenueRef, 'revenue')}
                active={activeSection === 'revenue'}
                color="from-green-500 to-emerald-600"
              />
              <QuickAccessButton
                icon={<CheckCircle className="w-5 h-5" />}
                label="التسويات"
                onClick={() => scrollToSection(settlementsRef, 'settlements')}
                active={activeSection === 'settlements'}
                color="from-blue-500 to-cyan-600"
              />
              <QuickAccessButton
                icon={<Wallet className="w-5 h-5" />}
                label="المحافظ"
                onClick={() => scrollToSection(walletsRef, 'wallets')}
                active={activeSection === 'wallets'}
                color="from-purple-500 to-violet-600"
              />
              <QuickAccessButton
                icon={<Building2 className="w-5 h-5" />}
                label="الأرباح"
                onClick={() => scrollToSection(profitsRef, 'profits')}
                active={activeSection === 'profits'}
                color="from-yellow-500 to-amber-600"
              />
              <QuickAccessButton
                icon={<Heart className="w-5 h-5" />}
                label="الخير"
                onClick={() => scrollToSection(charityRef, 'charity')}
                active={activeSection === 'charity'}
                color="from-pink-500 to-rose-600"
              />
              <QuickAccessButton
                icon={<Settings className="w-5 h-5" />}
                label="الإعدادات"
                onClick={() => {}}
                active={false}
                color="from-slate-500 to-gray-600"
              />
            </div>
          </div>

          {/* KPIs Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPISummaryCard
              icon={<DollarSign className="w-8 h-8" />}
              title="إجمالي الإيرادات"
              value={kpis?.total_revenue_from_investors || 0}
              gradient="from-green-500 via-emerald-500 to-teal-600"
              trend="+12%"
              onClick={() => scrollToSection(revenueRef, 'revenue')}
            />
            <KPISummaryCard
              icon={<Building2 className="w-8 h-8" />}
              title="المستحقات للمزارع"
              value={kpis?.total_owed_to_owners || 0}
              gradient="from-blue-500 via-cyan-500 to-sky-600"
              trend="+8%"
              onClick={() => scrollToSection(settlementsRef, 'settlements')}
            />
            <KPISummaryCard
              icon={<Sparkles className="w-8 h-8" />}
              title="أرباح المنصة"
              value={kpis?.platform_net_profit || 0}
              gradient="from-yellow-500 via-amber-500 to-orange-600"
              trend="+15%"
              onClick={() => scrollToSection(profitsRef, 'profits')}
            />
            <KPISummaryCard
              icon={<Heart className="w-8 h-8" />}
              title="مبالغ الخير"
              value={kpis?.charity_amount || 0}
              gradient="from-pink-500 via-rose-500 to-red-600"
              trend="25%"
              onClick={() => scrollToSection(charityRef, 'charity')}
            />
          </div>

          {/* Farm Cards Grid */}
          <div ref={revenueRef} className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-green-600" />
              البطاقات المالية للمزارع
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map((farm, index) => (
                <FarmFinancialCard
                  key={farm.farm_code}
                  farm={farm}
                  index={index}
                  onClick={() => setFullPageFarmId(farm.farm_id)}
                />
              ))}
            </div>
          </div>

          {/* Wallets Section */}
          <div ref={walletsRef} className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <Wallet className="w-8 h-8 text-purple-600" />
              المحافظ المالية الفاخرة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <LuxuryWalletCard
                title="محفظة المستثمرين"
                icon={<DollarSign className="w-7 h-7" />}
                balance={kpis?.total_revenue_from_investors || 0}
                transactions={kpis?.total_investors || 0}
                gradient="from-blue-600 via-cyan-500 to-teal-500"
                trend="up"
              />
              <LuxuryWalletCard
                title="محفظة أصحاب المزارع"
                icon={<Building2 className="w-7 h-7" />}
                balance={0}
                transactions={0}
                gradient="from-green-600 via-emerald-500 to-lime-500"
                trend="neutral"
                locked={true}
              />
              <LuxuryWalletCard
                title="محفظة المنصة"
                icon={<Sparkles className="w-7 h-7" />}
                balance={kpis?.platform_net_profit || 0}
                transactions={kpis?.ready_for_settlement || 0}
                gradient="from-yellow-600 via-amber-500 to-orange-500"
                trend="up"
              />
              <LuxuryWalletCard
                title="محفظة الخير"
                icon={<Heart className="w-7 h-7" />}
                balance={kpis?.charity_amount || 0}
                transactions={1}
                gradient="from-pink-600 via-rose-500 to-red-500"
                trend="up"
              />
            </div>
          </div>

          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 rounded-3xl shadow-2xl p-8 border-2 border-purple-400/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Bot className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    المساعد المالي الذكي
                    <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
                  </h3>
                  <p className="text-purple-100 text-sm">تحليلات مدعومة بالذكاء الاصطناعي</p>
                </div>
              </div>

              <div className="space-y-3">
                {aiInsights.slice(0, 3).map((insight, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all"
                  >
                    <p className="text-white leading-relaxed flex items-start gap-3">
                      <Zap className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface QuickAccessButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active: boolean;
  color: string;
}

function QuickAccessButton({ icon, label, onClick, active, color }: QuickAccessButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all
        ${active
          ? `bg-gradient-to-r ${color} text-white shadow-lg scale-105`
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }
      `}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

interface KPISummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  gradient: string;
  trend: string;
  onClick: () => void;
}

function KPISummaryCard({ icon, title, value, gradient, trend, onClick }: KPISummaryCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative bg-gradient-to-br ${gradient} rounded-2xl shadow-xl p-6 text-white
        cursor-pointer transform hover:scale-105 transition-all duration-300
        overflow-hidden group
      `}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            {icon}
          </div>
          <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
            {trend}
          </span>
        </div>

        <p className="text-sm opacity-90 mb-2">{title}</p>
        <p className="text-3xl font-black">
          <AnimatedCounter end={value} duration={2000} />
          <span className="text-lg mr-2">ريال</span>
        </p>
      </div>
    </div>
  );
}

interface FarmFinancialCardProps {
  farm: FarmFinancePhase1;
  index: number;
  onClick: () => void;
}

function FarmFinancialCard({ farm, index, onClick }: FarmFinancialCardProps) {
  const percentage = farm.completion_percentage_visual || 0;
  const isReady = farm.settlement_status === 'ready_for_settlement';

  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${index * 0.1}s` }}
      className={`
        bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 cursor-pointer
        transform hover:scale-105 transition-all duration-300
        border-2 ${isReady ? 'border-yellow-400 animate-golden-pulse' : 'border-slate-200'}
        animate-fadeInUp relative overflow-hidden group
      `}
    >
      {isReady && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 px-3 py-1 rounded-bl-xl text-xs font-bold">
          جاهز للتسوية ✨
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-black text-slate-800 mb-1">{farm.farm_name}</h3>
        <p className="text-sm text-slate-600">كود: {farm.farm_code}</p>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">نسبة التمويل</span>
          <span className="text-2xl font-black text-green-600">{percentage.toFixed(1)}%</span>
        </div>

        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-green-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-shimmer" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs text-green-600 mb-1">مجمع</p>
          <p className="text-lg font-black text-green-800">
            {(farm.collected_from_investors / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-600 mb-1">متبقي</p>
          <p className="text-lg font-black text-slate-800">
            {((farm.actual_amount - farm.collected_from_investors) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>
    </div>
  );
}

interface LuxuryWalletCardProps {
  title: string;
  icon: React.ReactNode;
  balance: number;
  transactions: number;
  gradient: string;
  trend: 'up' | 'down' | 'neutral';
  locked?: boolean;
}

function LuxuryWalletCard({ title, icon, balance, transactions, gradient, trend, locked }: LuxuryWalletCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group`}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            {icon}
          </div>
          {locked ? (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">مغلقة 🔒</span>
          ) : (
            <Activity className="w-5 h-5 opacity-80" />
          )}
        </div>

        <h4 className="text-sm opacity-90 mb-3">{title}</h4>

        <p className="text-3xl font-black mb-1">
          <AnimatedCounter end={balance} duration={2000} />
          <span className="text-sm mr-1">ريال</span>
        </p>

        <div className="flex items-center justify-between text-sm opacity-80">
          <span>{transactions} عملية</span>
          <div className="flex items-center gap-1">
            {trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
            {trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
            {trend === 'neutral' && <Activity className="w-4 h-4" />}
          </div>
        </div>

        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className={`h-full bg-white/40 rounded-full ${trend === 'up' ? 'w-3/4' : 'w-1/2'} transition-all`} />
        </div>
      </div>
    </div>
  );
}
