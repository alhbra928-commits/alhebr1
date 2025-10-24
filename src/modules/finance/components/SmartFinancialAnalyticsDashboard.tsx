import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Building2,
  Heart,
  Wallet,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingDown,
  DollarSign,
  Lock,
  Activity
} from 'lucide-react';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { BackButton } from '../../../components/common/BackButton';
import {
  AdvancedAnalyticsService,
  PlatformKPIs,
  FarmAnalytics,
  WalletOverview,
  FinancialAlert,
  AIInsight,
  ChartData
} from '../services/advancedAnalyticsService';
import { ExpandableFinancialCard } from './ExpandableFinancialCard';
import { Phase1FinanceService, FarmFinancePhase1 } from '../services/phase1FinanceService';
import { SimplePieChart, SimpleLineChart, SimpleBarChart, SimpleTimeline } from './SimpleCharts';

interface SmartFinancialAnalyticsDashboardProps {
  onBack?: () => void;
}

export function SmartFinancialAnalyticsDashboard({ onBack }: SmartFinancialAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpis, setKpis] = useState<PlatformKPIs | null>(null);
  const [farms, setFarms] = useState<FarmAnalytics[]>([]);
  const [wallets, setWallets] = useState<WalletOverview[]>([]);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [expandedFarmCode, setExpandedFarmCode] = useState<string | null>(null);
  const [selectedFarmFinance, setSelectedFarmFinance] = useState<FarmFinancePhase1 | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState<'normal' | 'warning' | 'error'>('normal');
  const [distributionData, setDistributionData] = useState<ChartData>({ labels: [], values: [] });
  const [revenueData, setRevenueData] = useState<ChartData>({ labels: [], values: [] });
  const [topFarmsData, setTopFarmsData] = useState<ChartData>({ labels: [], values: [] });

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        kpisData,
        farmsData,
        walletsData,
        alertsData,
        insightsData,
        distributionChartData,
        revenueChartData,
        topFarmsChartData
      ] = await Promise.all([
        AdvancedAnalyticsService.getPlatformKPIs(),
        AdvancedAnalyticsService.getAllFarmsAnalytics(),
        AdvancedAnalyticsService.getWalletsOverview(),
        AdvancedAnalyticsService.getFinancialAlerts(),
        AdvancedAnalyticsService.getAIInsights(),
        AdvancedAnalyticsService.getDistributionChartData(),
        AdvancedAnalyticsService.getRevenueTimelineData(30),
        AdvancedAnalyticsService.getTopPerformingFarms(5)
      ]);

      setKpis(kpisData);
      setFarms(farmsData);
      setWallets(walletsData);
      setAlerts(alertsData);
      setInsights(insightsData);
      setDistributionData(distributionChartData);
      setRevenueData(revenueChartData);
      setTopFarmsData(topFarmsChartData);
      setSystemStatus(farmsData.some(f => f.flash_status === 'ready') ? 'warning' : 'normal');
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setSystemStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleFarmClick = async (farmCode: string) => {
    const finance = await Phase1FinanceService.getFarmFinanceByCode(farmCode);
    if (finance) {
      setSelectedFarmFinance(finance);
      setExpandedFarmCode(farmCode);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8faf9 0%, #e8ebe9 100%)' }}>
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Tajawal' }}>
            جاري تحميل لوحة التحليل المالي الذكي...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedFarmFinance && expandedFarmCode && (
        <ExpandableFinancialCard
          finance={selectedFarmFinance}
          isExpanded={true}
          onToggle={() => {}}
          onClose={() => {
            setExpandedFarmCode(null);
            setSelectedFarmFinance(null);
          }}
        />
      )}

      <div
        className="min-h-screen p-8"
        style={{
          background: 'linear-gradient(135deg, #f8faf9 0%, #e8ebe9 100%)',
          fontFamily: 'Tajawal'
        }}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-40 mb-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 border-2 border-yellow-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <BackButton onClick={onBack} />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse-gold">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-800">
                    لوحة التحليل المالي الذكي
                  </h1>
                  <p className="text-sm text-slate-600">نظرة شاملة على النظام المالي للمنصة</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-bold text-slate-800">
                  {currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm text-slate-600">
                  {currentTime.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg hover:scale-105 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              <button className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-lg hover:scale-105">
                <Download className="w-5 h-5" />
              </button>

              <div className={`
                px-4 py-2 rounded-xl font-bold text-sm shadow-lg
                ${systemStatus === 'normal' ? 'bg-green-100 text-green-800' : ''}
                ${systemStatus === 'warning' ? 'bg-yellow-100 text-yellow-800 animate-pulse' : ''}
                ${systemStatus === 'error' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {systemStatus === 'normal' && '🟢 النظام طبيعي'}
                {systemStatus === 'warning' && '🟡 يوجد تنبيهات'}
                {systemStatus === 'error' && '🔴 خطأ'}
              </div>
            </div>
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPICard
            icon={<DollarSign className="w-8 h-8" />}
            title="إجمالي الإيرادات"
            value={kpis?.total_revenue_from_investors || 0}
            color="from-yellow-400 to-amber-500"
            suffix="ريال"
          />
          <KPICard
            icon={<Users className="w-8 h-8" />}
            title="مستحقات أصحاب المزارع"
            value={kpis?.total_owed_to_owners || 0}
            color="from-green-600 to-emerald-700"
            suffix="ريال"
          />
          <KPICard
            icon={<Building2 className="w-8 h-8" />}
            title="أرباح المنصة الصافية"
            value={kpis?.platform_net_profit || 0}
            color="from-blue-500 to-cyan-600"
            suffix="ريال"
          />
          <KPICard
            icon={<Heart className="w-8 h-8" />}
            title="مبالغ الخير (25%)"
            value={kpis?.charity_amount || 0}
            color="from-purple-500 to-pink-600"
            suffix="ريال"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Farms */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <Building2 className="w-7 h-7 text-blue-500" />
                  المزارع النشطة
                </h2>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-bold text-sm">
                  {farms.length} مزرعة
                </span>
              </div>

              <div className="space-y-3">
                {farms.map(farm => (
                  <FarmRow
                    key={farm.farm_code}
                    farm={farm}
                    onClick={() => handleFarmClick(farm.farm_code)}
                  />
                ))}
              </div>
            </div>

            {/* Wallets Overview */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-slate-200">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <Wallet className="w-7 h-7 text-green-500" />
                المحافظ المالية
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wallets.map(wallet => (
                  <WalletCard key={wallet.wallet_type} wallet={wallet} />
                ))}
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-slate-200">
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                  التوزيع المالي
                </h3>
                <SimplePieChart
                  data={distributionData}
                  colors={['#10b981', '#3b82f6', '#8b5cf6']}
                />
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-slate-200">
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-green-500" />
                  أفضل المزارع أداءً
                </h3>
                <SimpleBarChart
                  data={topFarmsData}
                  color="#10b981"
                />
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-slate-200">
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                الإيرادات اليومية (آخر 30 يوم)
              </h3>
              <SimpleLineChart
                data={revenueData}
                color="#3b82f6"
              />
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-slate-200">
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-500" />
                المخطط الزمني للعمليات المالية
              </h3>
              <SimpleTimeline
                events={[
                  {
                    date: new Date().toLocaleDateString('ar-SA'),
                    title: 'تمويل مزرعة الزيتونة مكتمل',
                    description: 'تم الوصول إلى 100% من التمويل المستهدف',
                    status: 'completed'
                  },
                  {
                    date: new Date().toLocaleDateString('ar-SA'),
                    title: 'جاهز للتسوية المالية',
                    description: 'المزرعة جاهزة لبدء عملية التسوية وتوزيع الأرباح',
                    status: 'current'
                  },
                  {
                    date: 'قريباً',
                    title: 'التسوية النهائية',
                    description: 'تحويل المستحقات لأصحاب المزارع واحتساب أرباح المنصة',
                    status: 'upcoming'
                  }
                ]}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Alerts */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-slate-200">
              <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                التنبيهات المالية
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                التحليل الذكي
              </h3>

              <div className="space-y-4">
                {insights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface KPICardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  suffix?: string;
}

function KPICard({ icon, title, value, color, suffix }: KPICardProps) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <p className="text-sm opacity-90 mb-2 font-medium">{title}</p>
      <p className="text-3xl font-black">
        <AnimatedCounter end={value} duration={2000} />
        {suffix && <span className="text-lg mr-2">{suffix}</span>}
      </p>
    </div>
  );
}

interface FarmRowProps {
  farm: FarmAnalytics;
  onClick: () => void;
}

function FarmRow({ farm, onClick }: FarmRowProps) {
  const getIcon = (type: string) => {
    if (type.includes('نخيل')) return '🌴';
    if (type.includes('زيتون')) return '🫒';
    return '🌳';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      collecting: { bg: 'bg-blue-100', text: 'text-blue-800', label: '🔵 تحت التجميع' },
      ready_for_settlement: { bg: 'bg-yellow-100 animate-pulse', text: 'text-yellow-800', label: '🟡 جاهزة للتسوية' },
      settled: { bg: 'bg-green-100', text: 'text-green-800', label: '🟢 مكتملة' }
    };
    return badges[status] || badges.collecting;
  };

  const badge = getStatusBadge(farm.settlement_status);

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-xl border-2 transition-all cursor-pointer
        ${farm.flash_status === 'ready' ? 'bg-yellow-50 border-yellow-400 animate-golden-pulse' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}
        hover:shadow-lg
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{getIcon(farm.tree_type)}</span>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800">{farm.farm_name}</h4>
            <p className="text-sm text-slate-600">{farm.tree_type}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-600">المجمع / الفعلي</p>
            <p className="font-bold text-slate-800">
              {(farm.collected_amount / 1000).toFixed(0)}K / {(farm.actual_amount / 1000).toFixed(0)}K
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-600">النسبة</p>
            <p className="text-2xl font-black text-blue-600">
              {farm.completion_percentage.toFixed(1)}%
            </p>
          </div>

          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>

          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition-all">
            📊 التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
}

interface WalletCardProps {
  wallet: WalletOverview;
}

function WalletCard({ wallet }: WalletCardProps) {
  const getIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      investors: <Users className="w-6 h-6" />,
      owners: <Building2 className="w-6 h-6" />,
      platform: <TrendingUp className="w-6 h-6" />,
      charity: <Heart className="w-6 h-6" />
    };
    return icons[type] || <Wallet className="w-6 h-6" />;
  };

  const getColor = (type: string) => {
    const colors: Record<string, string> = {
      investors: 'from-blue-500 to-cyan-600',
      owners: 'from-green-600 to-emerald-700',
      platform: 'from-yellow-500 to-amber-600',
      charity: 'from-purple-500 to-pink-600'
    };
    return colors[type] || 'from-slate-500 to-gray-600';
  };

  return (
    <div className={`bg-gradient-to-br ${getColor(wallet.wallet_type)} rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
          {getIcon(wallet.wallet_type)}
        </div>
        {wallet.status === 'locked' && <Lock className="w-5 h-5 opacity-80" />}
        {wallet.status === 'active' && <Activity className="w-5 h-5 opacity-80" />}
      </div>
      <h4 className="text-sm opacity-90 mb-2 font-medium">{wallet.wallet_name}</h4>
      <p className="text-2xl font-black">
        <AnimatedCounter end={wallet.current_balance} duration={1500} />
        <span className="text-sm mr-1">ريال</span>
      </p>
    </div>
  );
}

interface AlertItemProps {
  alert: FinancialAlert;
}

function AlertItem({ alert }: AlertItemProps) {
  const getIcon = () => {
    if (alert.severity === 'success') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (alert.severity === 'warning') return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    if (alert.severity === 'error') return <AlertCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
      {getIcon()}
      <div className="flex-1">
        <p className="text-sm text-slate-800 font-medium">{alert.message_ar}</p>
        <p className="text-xs text-slate-500 mt-1">
          {new Date(alert.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

interface InsightCardProps {
  insight: AIInsight;
}

function InsightCard({ insight }: InsightCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <h4 className="font-bold mb-2 flex items-center gap-2">
        {insight.title_ar}
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
          {(insight.confidence_score * 100).toFixed(0)}%
        </span>
      </h4>
      <p className="text-sm opacity-90 leading-relaxed">
        {insight.description_ar}
      </p>
    </div>
  );
}
