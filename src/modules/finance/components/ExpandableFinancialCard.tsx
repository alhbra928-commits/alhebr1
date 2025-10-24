import React, { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ArrowLeft,
  Activity,
  Receipt,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { FarmFinancePhase1 } from '../services/phase1FinanceService';
import { LiveFinancialStatsCard } from './LiveFinancialStatsCard';
import { ManualSettlementPanel } from './ManualSettlementPanel';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { supabase } from '../../../lib/supabase';

interface ExpandableFinancialCardProps {
  finance: FarmFinancePhase1;
  isExpanded: boolean;
  onToggle: () => void;
  onClose: () => void;
}

interface InvestorDetail {
  id: string;
  investor_name: string;
  investor_phone: string;
  total_amount: number;
  reserved_trees: number;
  booking_status: string;
  created_at: string;
}

interface FinancialTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  from_wallet: string;
  to_wallet: string;
  description_ar: string;
  created_at: string;
  status: string;
}

export const ExpandableFinancialCard: React.FC<ExpandableFinancialCardProps> = ({
  finance,
  isExpanded,
  onToggle,
  onClose
}) => {
  const [showSettlementPanel, setShowSettlementPanel] = useState(false);
  const [investors, setInvestors] = useState<InvestorDetail[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'investors' | 'transactions'>('overview');

  const settlementStatus = finance.settlement_status || 'collecting';
  const isReadyForSettlement = settlementStatus === 'ready_for_settlement';
  const visualPercentage = finance.completion_percentage_visual || 0;
  const healthStatus = (finance.financial_health_status || 'low') as 'low' | 'medium' | 'high' | 'complete';

  useEffect(() => {
    if (isExpanded) {
      loadDetails();
    }
  }, [isExpanded]);

  const loadDetails = async () => {
    setLoadingDetails(true);
    try {
      const [investorsData, transactionsData] = await Promise.all([
        loadInvestors(),
        loadTransactions()
      ]);
      setInvestors(investorsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadInvestors = async (): Promise<InvestorDetail[]> => {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        investor_name,
        investor_phone,
        total_amount,
        reserved_trees,
        booking_status,
        created_at
      `)
      .eq('farm_id', finance.farm_id)
      .eq('booking_status', 'approved')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading investors:', error);
      return [];
    }

    return data || [];
  };

  const loadTransactions = async (): Promise<FinancialTransaction[]> => {
    const { data, error } = await supabase
      .from('settlement_transactions')
      .select('*')
      .eq('farm_code', finance.farm_code)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading transactions:', error);
      return [];
    }

    return data || [];
  };

  const getTreeTypeIcon = (type?: string) => {
    if (!type) return '🌳';
    if (type.includes('نخيل')) return '🌴';
    if (type.includes('زيتون')) return '🫒';
    return '🌳';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      collecting: 'from-blue-500 to-cyan-600',
      ready_for_settlement: 'from-yellow-500 to-amber-600',
      settling: 'from-orange-500 to-red-600',
      settled: 'from-green-500 to-emerald-600',
      owned_by_platform: 'from-purple-500 to-violet-600'
    };
    return colors[status] || 'from-gray-500 to-slate-600';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      collecting: 'جمع إيرادات',
      ready_for_settlement: '✨ جاهزة للتسوية',
      settling: '⏳ قيد التسوية',
      settled: '✅ تمت التسوية',
      owned_by_platform: '🏛️ مملوكة للمنصة'
    };
    return labels[status] || status;
  };

  if (!isExpanded) {
    return (
      <div
        onClick={onToggle}
        className={`
          group relative overflow-hidden rounded-3xl bg-white shadow-xl
          transition-all duration-500 cursor-pointer
          hover:scale-[1.02] hover:shadow-2xl
          ${isReadyForSettlement ? 'ring-4 ring-yellow-400 ring-opacity-50 animate-golden-pulse' : ''}
        `}
        style={{
          background: 'linear-gradient(135deg, #f8faf9 0%, #ffffff 100%)',
          border: '2px solid',
          borderColor: isReadyForSettlement ? '#fbbf24' : '#d4af37'
        }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{getTreeTypeIcon(finance.tree_type)}</span>
                <div>
                  <h3 className="text-xl font-black text-slate-800" style={{ fontFamily: 'Tajawal' }}>
                    {finance.farm_name}
                  </h3>
                  <p className="text-sm font-mono text-slate-500">{finance.farm_code}</p>
                </div>
              </div>
            </div>

            <div
              className={`
                px-4 py-2 rounded-xl font-bold text-sm
                bg-gradient-to-r ${getStatusColor(settlementStatus)}
                text-white shadow-lg
              `}
              style={{ fontFamily: 'Tajawal' }}
            >
              {getStatusLabel(settlementStatus)}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <span className="text-sm text-green-800 font-medium" style={{ fontFamily: 'Tajawal' }}>
                💰 المبلغ المجمع
              </span>
              <span className="text-lg font-black text-green-700">
                <AnimatedCounter end={finance.collected_from_investors || 0} duration={1000} />
                <span className="text-sm mr-1">ريال</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
              <span className="text-sm text-blue-800 font-medium" style={{ fontFamily: 'Tajawal' }}>
                🎯 المتبقي للمالك
              </span>
              <span className="text-lg font-black text-blue-700">
                <AnimatedCounter end={finance.remaining_for_owner || 0} duration={1000} />
                <span className="text-sm mr-1">ريال</span>
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-600 font-bold" style={{ fontFamily: 'Tajawal' }}>
                  نسبة التمويل
                </span>
                <span className="text-lg font-black text-slate-800">
                  {visualPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${
                    visualPercentage >= 100
                      ? 'from-yellow-400 to-amber-500 animate-golden-shimmer'
                      : visualPercentage >= 70
                      ? 'from-green-400 to-emerald-500'
                      : visualPercentage >= 40
                      ? 'from-blue-400 to-cyan-500'
                      : 'from-slate-400 to-gray-500'
                  } transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min(visualPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {finance.total_investors} مستثمر
            </span>
            <span className="flex items-center gap-2 text-blue-600 font-bold group-hover:text-blue-700">
              عرض التفاصيل
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSettlementPanel && (
        <ManualSettlementPanel
          farmCode={finance.farm_code}
          farmName={finance.farm_name}
          ownerName={finance.owner_name || 'غير محدد'}
          actualAmount={finance.actual_amount}
          collectedAmount={finance.collected_from_investors || 0}
          settlementStatus={settlementStatus}
          onSettlementComplete={() => {
            setShowSettlementPanel(false);
            window.location.reload();
          }}
          onClose={() => setShowSettlementPanel(false)}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
        <div
          className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-scale-in"
          style={{
            background: 'linear-gradient(135deg, #f8faf9 0%, #ffffff 100%)'
          }}
        >
          {/* Header */}
          <div
            className={`sticky top-0 z-10 p-6 bg-gradient-to-r ${getStatusColor(settlementStatus)} text-white rounded-t-3xl`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{getTreeTypeIcon(finance.tree_type)}</span>
                <div>
                  <h2 className="text-3xl font-black mb-1" style={{ fontFamily: 'Tajawal' }}>
                    {finance.farm_name}
                  </h2>
                  <p className="text-white/80 font-mono">{finance.farm_code}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-bold transition-all"
                style={{ fontFamily: 'Tajawal' }}
              >
                <ArrowLeft className="w-5 h-5" />
                عودة
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="sticky top-[88px] z-10 bg-white border-b border-slate-200 px-6">
            <div className="flex gap-4">
              {[
                { id: 'overview', label: '📊 نظرة عامة', icon: Activity },
                { id: 'investors', label: '👥 المستثمرين', icon: Users },
                { id: 'transactions', label: '🧾 العمليات المالية', icon: Receipt }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-bold border-b-4 transition-all
                    ${activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                    }
                  `}
                  style={{ fontFamily: 'Tajawal' }}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab
                finance={finance}
                isReadyForSettlement={isReadyForSettlement}
                onOpenSettlement={() => setShowSettlementPanel(true)}
              />
            )}

            {activeTab === 'investors' && (
              <InvestorsTab
                investors={investors}
                loading={loadingDetails}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsTab
                transactions={transactions}
                loading={loadingDetails}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Overview Tab Component
interface OverviewTabProps {
  finance: FarmFinancePhase1;
  isReadyForSettlement: boolean;
  onOpenSettlement: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ finance, isReadyForSettlement, onOpenSettlement }) => (
  <div className="space-y-6">
    {isReadyForSettlement && (
      <div className="rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 p-6 text-white shadow-xl animate-golden-continuous-flash">
        <div className="flex items-center gap-4">
          <Sparkles className="w-12 h-12 animate-spin-slow" />
          <div className="flex-1">
            <h4 className="text-2xl font-black mb-2" style={{ fontFamily: 'Tajawal' }}>
              ✨ جاهزة للتسوية – الرجاء اعتماد التحويل لصاحب المزرعة
            </h4>
            <p className="text-white/90" style={{ fontFamily: 'Tajawal' }}>
              المبلغ المجمع: {(finance.collected_from_investors || 0).toLocaleString()} ريال – جاهز للتحويل
            </p>
          </div>
          <button
            onClick={onOpenSettlement}
            className="bg-white text-yellow-600 px-8 py-4 rounded-xl font-black hover:bg-yellow-50 transition-all shadow-lg hover:scale-105"
            style={{ fontFamily: 'Tajawal' }}
          >
            ⚡ بدء التسوية
          </button>
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="💰 السعر التسويقي"
        value={finance.marketing_amount}
        color="from-blue-500 to-cyan-600"
      />
      <StatCard
        title="🎯 السعر الفعلي"
        value={finance.actual_amount}
        color="from-green-500 to-emerald-600"
      />
      <StatCard
        title="📈 إجمالي الأشجار"
        value={finance.total_trees}
        suffix="شجرة"
        color="from-purple-500 to-violet-600"
      />
    </div>

    <LiveFinancialStatsCard
      farmCode={finance.farm_code}
      collectedFromInvestors={finance.collected_from_investors || 0}
      remainingForOwner={finance.remaining_for_owner || 0}
      actualAmount={finance.actual_amount}
      visualPercentage={finance.completion_percentage_visual || 0}
      healthStatus={(finance.financial_health_status || 'low') as any}
      flashShown={finance.completion_flash_shown || false}
    />
  </div>
);

// Investors Tab Component
interface InvestorsTabProps {
  investors: InvestorDetail[];
  loading: boolean;
}

const InvestorsTab: React.FC<InvestorsTabProps> = ({ investors, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-slate-600" style={{ fontFamily: 'Tajawal' }}>جاري تحميل بيانات المستثمرين...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-black text-slate-800 mb-6" style={{ fontFamily: 'Tajawal' }}>
        👥 قائمة المستثمرين ({investors.length})
      </h3>

      {investors.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p style={{ fontFamily: 'Tajawal' }}>لا يوجد مستثمرين حالياً</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {investors.map((investor) => (
            <div
              key={investor.id}
              className="p-5 rounded-xl bg-white border-2 border-slate-200 hover:border-yellow-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: 'Tajawal' }}>
                    {investor.investor_name}
                  </h4>
                  <p className="text-sm text-slate-500 mb-2">{investor.investor_phone}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-700 font-bold">
                      💰 {investor.total_amount.toLocaleString()} ريال
                    </span>
                    <span className="text-blue-700 font-bold">
                      🌳 {investor.reserved_trees} شجرة
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                    ✓ معتمد
                  </span>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(investor.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Transactions Tab Component
interface TransactionsTabProps {
  transactions: FinancialTransaction[];
  loading: boolean;
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-slate-600" style={{ fontFamily: 'Tajawal' }}>جاري تحميل العمليات المالية...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-black text-slate-800 mb-6" style={{ fontFamily: 'Tajawal' }}>
        🧾 سجل العمليات المالية ({transactions.length})
      </h3>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Receipt className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p style={{ fontFamily: 'Tajawal' }}>لا توجد عمليات مالية بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-5 rounded-xl bg-white border-2 border-slate-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {tx.transaction_type === 'settlement_to_owner' ? '💰' : '📊'}
                    </span>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Tajawal' }}>
                        {tx.description_ar}
                      </h4>
                      <p className="text-sm text-slate-500">
                        من: {tx.from_wallet} ← إلى: {tx.to_wallet}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-700 mb-1">
                    {tx.amount.toLocaleString()} ريال
                  </p>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                      tx.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {tx.status === 'completed' ? '✓ مكتملة' : '⏳ معلقة'}
                  </span>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(tx.created_at).toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, suffix, color }) => (
  <div className={`p-6 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
    <h4 className="text-sm font-bold mb-3 opacity-90" style={{ fontFamily: 'Tajawal' }}>
      {title}
    </h4>
    <p className="text-3xl font-black">
      <AnimatedCounter end={value} duration={1500} />
      {suffix && <span className="text-lg mr-2">{suffix}</span>}
    </p>
  </div>
);
