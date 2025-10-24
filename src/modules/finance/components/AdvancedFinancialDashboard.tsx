import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  Download,
  Database,
  Heart,
  Building2,
  AlertCircle,
  ArrowRight,
  X,
  BarChart3,
  Users,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { BackButton } from '../../../components/common/BackButton';
import { FarmFinanceService, FarmFinancialSummary } from '../services/farmFinanceService';
import { brandColors, brandGradients } from '../styles/brandColors';
import { supabase } from '../../../lib/supabase';

interface AdvancedFinancialDashboardProps {
  onBack?: () => void;
}

interface FarmFinancialData {
  barcode: string;
  summary: FarmFinancialSummary;
}

interface InsightMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  timestamp: Date;
}

export function AdvancedFinancialDashboard({ onBack }: AdvancedFinancialDashboardProps) {
  const [farms, setFarms] = useState<FarmFinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightMessage[]>([]);
  const [todaySummary, setTodaySummary] = useState<any>(null);

  const [overallStats, setOverallStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalProfit: 0,
    activeFarms: 0,
    totalInvestors: 0,
    charityAmount: 0,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('🔍 بدء تحميل البيانات المالية...');

      const { data: wallets, error: walletsError } = await supabase
        .from('farm_wallets')
        .select(`
          farm_barcode,
          owner_payment_due,
          owner_payment_paid,
          owner_payment_status
        `)
        .eq('status', 'active');

      console.log('📊 نتيجة جلب المحافظ:', { wallets, walletsError });

      if (walletsError) {
        console.error('❌ خطأ في جلب المحافظ:', walletsError);
        throw walletsError;
      }

      if (!wallets || wallets.length === 0) {
        console.warn('⚠️ لا توجد محافظ نشطة');
        return;
      }

      const farmsData: FarmFinancialData[] = [];
      let totalBalance = 0;
      let totalIncome = 0;
      let totalExpense = 0;
      let totalInvestors = 0;
      let totalPlatformProfit = 0;

      console.log(`🏗️ جاري تحميل بيانات ${wallets.length} محفظة...`);

      for (const wallet of wallets) {
        try {
          console.log(`📥 جلب ملخص مالي لـ ${wallet.farm_barcode}...`);
          const summary = await FarmFinanceService.getFarmFinancialSummary(wallet.farm_barcode);

          console.log(`📊 نتيجة الملخص لـ ${wallet.farm_barcode}:`, summary);

          if (!summary) {
            console.warn(`⚠️ لا يوجد ملخص للمزرعة ${wallet.farm_barcode}`);
            continue;
          }

          // حساب ربح المنصة فقط إذا تم تسديد المالك
          const { data: farmData } = await supabase
            .from('farms')
            .select('total_marketing_price, total_actual_price')
            .eq('barcode', wallet.farm_barcode)
            .maybeSingle();

          if (farmData && wallet.owner_payment_status === 'completed') {
            const marketingPrice = Number(farmData.total_marketing_price) || 0;
            const actualPrice = Number(farmData.total_actual_price) || 0;
            const farmProfit = marketingPrice - actualPrice;
            if (farmProfit > 0) {
              totalPlatformProfit += farmProfit;
            }
          }

          farmsData.push({
            barcode: wallet.farm_barcode,
            summary,
          });

          totalBalance += Number(summary.wallet.balance);
          totalIncome += Number(summary.wallet.total_income);
          totalExpense += Number(summary.wallet.total_expense);
          totalInvestors += summary.investorsCount;

          console.log(`✅ تم معالجة ${wallet.farm_barcode} - الرصيد: ${summary.wallet.balance}`);
        } catch (error) {
          console.error(`❌ خطأ في تحميل ${wallet.farm_barcode}:`, error);
        }
      }

      console.log(`✅ انتهى التحميل - ${farmsData.length} مزرعة`);
      console.log('📈 الإحصائيات:', { totalBalance, totalIncome, totalExpense, totalPlatformProfit });

      const totalProfit = totalIncome - totalExpense;
      const charityAmount = totalPlatformProfit > 0 ? totalPlatformProfit * 0.25 : 0;

      setFarms(farmsData);
      setOverallStats({
        totalBalance,
        totalIncome,
        totalExpense,
        totalProfit,
        activeFarms: farmsData.length,
        totalInvestors,
        charityAmount,
      });

      generateInsights(farmsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const generateInsights = (farmsData?: FarmFinancialData[]) => {
    const data = farmsData || farms;
    if (data.length === 0) return;

    const newInsights: InsightMessage[] = [];

    data.forEach((farm) => {
      const profit =
        Number(farm.summary.wallet.total_income) - Number(farm.summary.wallet.total_expense);
      const avgProfit =
        data.reduce(
          (sum, f) =>
            sum + (Number(f.summary.wallet.total_income) - Number(f.summary.wallet.total_expense)),
          0
        ) / data.length;

      if (profit > avgProfit * 1.2) {
        newInsights.push({
          id: `insight-${Date.now()}-${farm.barcode}`,
          message: `🌿 ${farm.barcode} حققت أرباحاً أعلى من المتوسط بنسبة ${Math.round(
            ((profit - avgProfit) / avgProfit) * 100
          )}%`,
          type: 'success',
          timestamp: new Date(),
        });
      }

      const expenseRatio =
        Number(farm.summary.wallet.total_expense) / Number(farm.summary.wallet.total_income);
      if (expenseRatio > 0.7) {
        newInsights.push({
          id: `insight-${Date.now()}-${farm.barcode}-expense`,
          message: `⚠️ نسبة المصروفات في ${farm.barcode} عالية (${Math.round(
            expenseRatio * 100
          )}%)`,
          type: 'warning',
          timestamp: new Date(),
        });
      }
    });

    if (overallStats.charityAmount > 0) {
      newInsights.push({
        id: `insight-charity-${Date.now()}`,
        message: `💡 يمكن تحويل ${overallStats.charityAmount.toLocaleString(
          'ar-SA'
        )} ريال للاستقطاع الخيري`,
        type: 'info',
        timestamp: new Date(),
      });
    }

    setInsights((prev) => [...newInsights, ...prev].slice(0, 5));
  };

  const getPerformanceColor = (profit: number, income: number) => {
    if (income === 0) return brandColors.status.neutral;
    const ratio = profit / income;
    if (ratio > 0.3) return brandColors.status.excellent;
    if (ratio > 0) return brandColors.status.good;
    return brandColors.status.warning;
  };

  const handleQuickBackup = async () => {
    try {
      for (const farm of farms) {
        await FarmFinanceService.createManualBackup(farm.barcode);
      }
      alert('تم إنشاء نسخ احتياطية لجميع المزارع بنجاح');
    } catch (error) {
      alert('حدث خطأ أثناء إنشاء النسخ الاحتياطية');
    }
  };

  const generateDailySummary = () => {
    const today = new Date().toLocaleDateString('ar-SA');
    const content = `
ملخص اليوم المالي - ${today}
=====================================

الإحصائيات العامة:
- عدد المزارع النشطة: ${overallStats.activeFarms}
- إجمالي الأرصدة: ${overallStats.totalBalance.toLocaleString('ar-SA')} ريال
- إجمالي الدخل: ${overallStats.totalIncome.toLocaleString('ar-SA')} ريال
- إجمالي المصروفات: ${overallStats.totalExpense.toLocaleString('ar-SA')} ريال
- صافي الربح: ${overallStats.totalProfit.toLocaleString('ar-SA')} ريال
- الاستقطاع الخيري (25%): ${overallStats.charityAmount.toLocaleString('ar-SA')} ريال
- عدد المستثمرين: ${overallStats.totalInvestors}

أفضل 3 مزارع أداءً:
${farms
  .sort(
    (a, b) =>
      Number(b.summary.wallet.total_income) -
      Number(b.summary.wallet.total_expense) -
      (Number(a.summary.wallet.total_income) - Number(a.summary.wallet.total_expense))
  )
  .slice(0, 3)
  .map(
    (f, i) =>
      `${i + 1}. ${f.barcode} - ربح: ${(
        Number(f.summary.wallet.total_income) - Number(f.summary.wallet.total_expense)
      ).toLocaleString('ar-SA')} ريال`
  )
  .join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily_summary_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: brandGradients.beige }}
      >
        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: brandColors.primary.gold, borderTopColor: 'transparent' }}
          />
          <p className="text-lg font-bold" style={{ color: brandColors.text.primary }}>
            جاري تحميل لوحة الإدارة المالية...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-20"
      dir="rtl"
      style={{ background: brandGradients.beige }}
    >
      <div className="max-w-[1800px] mx-auto px-8 pt-8">
        <BackButton onClick={onBack} />

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className="text-5xl font-black mb-2"
              style={{
                background: brandGradients.gold,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              لوحة الإدارة المالية المتطورة
            </h1>
            <p className="text-lg" style={{ color: brandColors.text.secondary }}>
              نظام إدارة مالي ذكي وشامل لمنصة النخيل والزيتون
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} style={{ color: brandColors.primary.gold }} />
            <span className="font-bold" style={{ color: brandColors.text.primary }}>{refreshing ? 'جاري التحديث...' : 'تحديث'}</span>
          </button>
        </div>

        <div
          className="rounded-3xl p-8 mb-8 shadow-xl"
          style={{
            background: brandGradients.gold,
            boxShadow: `0 20px 60px ${brandColors.shadow.gold}`,
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-8 w-8" style={{ color: brandColors.text.white }} />
            <h2 className="text-2xl font-black" style={{ color: brandColors.text.white }}>
              الملخّص العام للمنصة
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<Wallet className="h-6 w-6" />}
              label="إجمالي الأرصدة"
              value={overallStats.totalBalance.toLocaleString('ar-SA')}
              suffix="ريال"
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="إجمالي الدخل"
              value={overallStats.totalIncome.toLocaleString('ar-SA')}
              suffix="ريال"
            />
            <StatCard
              icon={<TrendingDown className="h-6 w-6" />}
              label="إجمالي المصروفات"
              value={overallStats.totalExpense.toLocaleString('ar-SA')}
              suffix="ريال"
            />
            <StatCard
              icon={<BarChart3 className="h-6 w-6" />}
              label="صافي الربح"
              value={overallStats.totalProfit.toLocaleString('ar-SA')}
              suffix="ريال"
              highlight={overallStats.totalProfit > 0}
            />
          </div>

          <div className="grid grid-cols-3 gap-6 mt-6">
            <StatCard
              icon={<Building2 className="h-6 w-6" />}
              label="المزارع النشطة"
              value={overallStats.activeFarms.toString()}
              suffix="مزرعة"
            />
            <StatCard
              icon={<Users className="h-6 w-6" />}
              label="المستثمرون"
              value={overallStats.totalInvestors.toString()}
              suffix="مستثمر"
            />
            <StatCard
              icon={<Heart className="h-6 w-6" />}
              label="الاستقطاع الخيري"
              value={overallStats.charityAmount.toLocaleString('ar-SA')}
              suffix="ريال"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-3">
            <h3
              className="text-2xl font-black mb-6"
              style={{ color: brandColors.text.primary }}
            >
              المزارع المالية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {farms.map((farm) => (
                <FarmFinancialCard
                  key={farm.barcode}
                  farm={farm}
                  onClick={() => setSelectedFarm(farm.barcode)}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <AIInsightBar insights={insights} onDismiss={(id) => setInsights((prev) => prev.filter((i) => i.id !== id))} />
          </div>
        </div>

        <div
          className="rounded-3xl p-6 shadow-lg"
          style={{
            background: brandColors.background.card,
            border: `2px solid ${brandColors.border.light}`,
          }}
        >
          <h3
            className="text-xl font-black mb-4"
            style={{ color: brandColors.text.primary }}
          >
            الأدوات والإجراءات السريعة
          </h3>
          <div className="flex flex-wrap gap-4">
            <ActionButton
              icon={<Database className="h-5 w-5" />}
              label="نسخ احتياطي فوري"
              onClick={handleQuickBackup}
            />
            <ActionButton
              icon={<Download className="h-5 w-5" />}
              label="ملخص اليوم المالي"
              onClick={generateDailySummary}
            />
            <ActionButton
              icon={<BarChart3 className="h-5 w-5" />}
              label="تقرير شامل"
              onClick={() => alert('قيد التطوير')}
            />
          </div>
        </div>
      </div>

      {selectedFarm && (
        <FarmMiniPanel
          barcode={selectedFarm}
          onClose={() => setSelectedFarm(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4 backdrop-blur-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color: brandColors.text.white }}>
        {icon}
        <p className="text-sm font-bold opacity-90">{label}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <p
          className={`text-3xl font-black ${highlight ? 'animate-pulse' : ''}`}
          style={{ color: brandColors.text.white }}
        >
          {value}
        </p>
        {suffix && (
          <p className="text-sm opacity-80" style={{ color: brandColors.text.white }}>
            {suffix}
          </p>
        )}
      </div>
    </div>
  );
}

function FarmFinancialCard({
  farm,
  onClick,
}: {
  farm: FarmFinancialData;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const profit =
    Number(farm.summary.wallet.total_income) - Number(farm.summary.wallet.total_expense);
  const performanceColor = profit > 0 ? brandColors.status.good : brandColors.status.warning;

  return (
    <div
      className="rounded-2xl p-6 cursor-pointer transition-all duration-300"
      style={{
        background: brandColors.background.card,
        border: `2px solid ${isHovered ? brandColors.border.gold : brandColors.border.light}`,
        boxShadow: isHovered
          ? `0 20px 40px ${brandColors.shadow.gold}`
          : `0 4px 12px ${brandColors.shadow.dark}`,
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold mb-1" style={{ color: brandColors.text.secondary }}>
            رقم الباركود
          </p>
          <p className="text-lg font-black" style={{ color: brandColors.text.primary }}>
            {farm.barcode}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: brandGradients.gold }}
        >
          <Building2 className="h-6 w-6" style={{ color: brandColors.text.white }} />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-bold mb-1" style={{ color: brandColors.text.secondary }}>
          الرصيد الحالي
        </p>
        <p
          className="text-3xl font-black"
          style={{
            background: brandGradients.gold,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {Number(farm.summary.wallet.balance).toLocaleString('ar-SA')}
        </p>
        <p className="text-xs" style={{ color: brandColors.text.secondary }}>
          ريال سعودي
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(143, 166, 90, 0.1)' }}
        >
          <p className="text-xs font-bold mb-1" style={{ color: brandColors.accent.olive }}>
            الأرباح
          </p>
          <p className="text-lg font-black" style={{ color: brandColors.accent.olive }}>
            {profit > 0 ? '+' : ''}
            {profit.toLocaleString('ar-SA')}
          </p>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(184, 184, 184, 0.1)' }}
        >
          <p className="text-xs font-bold mb-1" style={{ color: brandColors.text.secondary }}>
            المصاريف
          </p>
          <p className="text-lg font-black" style={{ color: brandColors.text.secondary }}>
            {Number(farm.summary.wallet.total_expense).toLocaleString('ar-SA')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" style={{ color: brandColors.text.secondary }} />
          <span className="text-sm font-bold" style={{ color: brandColors.text.secondary }}>
            {farm.summary.investorsCount} مستثمر
          </span>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: performanceColor,
            color: brandColors.text.white,
          }}
        >
          {farm.summary.state.current_state === 'active' ? 'نشطة' : farm.summary.state.current_state}
        </div>
      </div>

      {isHovered && (
        <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${brandColors.border.light}` }}>
          <button
            className="w-full py-2 rounded-xl font-bold text-sm transition-all"
            style={{
              background: brandGradients.gold,
              color: brandColors.text.white,
            }}
          >
            إدارة مالية <ArrowRight className="inline h-4 w-4 mr-1" />
          </button>
        </div>
      )}
    </div>
  );
}

function AIInsightBar({
  insights,
  onDismiss,
}: {
  insights: InsightMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="text-xl font-black mb-4" style={{ color: brandColors.text.primary }}>
        💡 الذكاء المالي
      </h3>
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-xl p-4 relative animate-slideIn"
            style={{
              background: brandColors.background.card,
              border: `1px solid ${brandColors.border.light}`,
              boxShadow: `0 4px 12px ${brandColors.shadow.dark}`,
            }}
          >
            <button
              onClick={() => onDismiss(insight.id)}
              className="absolute top-2 left-2 p-1 rounded-full hover:bg-opacity-20 transition-all"
              style={{ background: 'rgba(0,0,0,0.1)' }}
            >
              <X className="h-3 w-3" style={{ color: brandColors.text.secondary }} />
            </button>
            <p className="text-sm font-bold pr-4" style={{ color: brandColors.text.primary }}>
              {insight.message}
            </p>
            <p className="text-xs mt-2" style={{ color: brandColors.text.secondary }}>
              {insight.timestamp.toLocaleTimeString('ar-SA')}
            </p>
          </div>
        ))}
        {insights.length === 0 && (
          <div
            className="rounded-xl p-6 text-center"
            style={{
              background: brandColors.background.card,
              border: `1px solid ${brandColors.border.light}`,
            }}
          >
            <AlertCircle className="h-8 w-8 mx-auto mb-2" style={{ color: brandColors.text.secondary }} />
            <p className="text-sm" style={{ color: brandColors.text.secondary }}>
              لا توجد تنبيهات حالياً
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
      style={{
        background: isHovered ? brandGradients.gold : brandColors.background.card,
        color: isHovered ? brandColors.text.white : brandColors.text.primary,
        border: `2px solid ${brandColors.border.gold}`,
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 8px 20px ${brandColors.shadow.gold}` : 'none',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function FarmMiniPanel({ barcode, onClose }: { barcode: string; onClose: () => void }) {
  const [summary, setSummary] = useState<FarmFinancialSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'expenses' | 'investors' | 'charity' | 'reports'>('transactions');
  const [ownerPaymentStatus, setOwnerPaymentStatus] = useState<string>('pending');
  const [farmPrices, setFarmPrices] = useState<{ marketing: number; actual: number }>({ marketing: 0, actual: 0 });

  useEffect(() => {
    loadData();
  }, [barcode]);

  const loadData = async () => {
    try {
      const data = await FarmFinanceService.getFarmFinancialSummary(barcode);
      setSummary(data);

      const { data: walletData } = await supabase
        .from('farm_wallets')
        .select('owner_payment_status')
        .eq('farm_barcode', barcode)
        .maybeSingle();

      if (walletData) {
        setOwnerPaymentStatus(walletData.owner_payment_status);
      }

      const { data: farmData } = await supabase
        .from('farms')
        .select('total_marketing_price, total_actual_price')
        .eq('barcode', barcode)
        .maybeSingle();

      if (farmData) {
        setFarmPrices({
          marketing: Number(farmData.total_marketing_price) || 0,
          actual: Number(farmData.total_actual_price) || 0,
        });
      }
    } catch (error) {
      console.error('Error loading farm data:', error);
    }
  };

  if (!summary) {
    return null;
  }

  const profit = Number(summary.wallet.total_income) - Number(summary.wallet.total_expense);
  const platformProfit = ownerPaymentStatus === 'completed' && farmPrices.marketing > farmPrices.actual
    ? farmPrices.marketing - farmPrices.actual
    : 0;
  const charityAmount = platformProfit > 0 ? platformProfit * 0.25 : 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-8"
      onClick={onClose}
    >
      <div
        className="rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          background: brandColors.background.card,
          boxShadow: `0 30px 80px ${brandColors.shadow.dark}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-3xl font-black"
              style={{
                background: brandGradients.gold,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              لوحة المزرعة المالية
            </h2>
            <p className="text-lg mt-1" style={{ color: brandColors.text.secondary }}>
              {barcode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full transition-all"
            style={{
              background: brandColors.background.hover,
              color: brandColors.text.primary,
            }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'transactions', label: '💵 المعاملات' },
            { key: 'expenses', label: '💸 المصاريف' },
            { key: 'investors', label: '👥 المستثمرون' },
            { key: 'charity', label: '❤️ الاستقطاع' },
            { key: 'reports', label: '📊 التقارير' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap"
              style={{
                background: activeTab === tab.key ? brandGradients.gold : brandColors.background.hover,
                color: activeTab === tab.key ? brandColors.text.white : brandColors.text.primary,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'transactions' && (
            <div className="space-y-3">
              <h3 className="text-xl font-black mb-4" style={{ color: brandColors.text.primary }}>
                آخر المعاملات
              </h3>
              {summary.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: brandColors.background.hover,
                    border: `1px solid ${brandColors.border.light}`,
                  }}
                >
                  <div>
                    <p className="font-bold" style={{ color: brandColors.text.primary }}>
                      {tx.description || tx.transaction_type}
                    </p>
                    <p className="text-sm" style={{ color: brandColors.text.secondary }}>
                      {new Date(tx.transaction_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <p
                    className="text-xl font-black"
                    style={{
                      color: tx.transaction_type.includes('income') ? brandColors.status.good : brandColors.status.warning,
                    }}
                  >
                    {tx.transaction_type.includes('income') ? '+' : '-'}
                    {Number(tx.amount).toLocaleString('ar-SA')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'expenses' && (
            <div>
              <h3 className="text-xl font-black mb-4" style={{ color: brandColors.text.primary }}>
                المصاريف حسب التصنيف
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(summary.totalExpensesByCategory).map(([category, amount]) => (
                  <div
                    key={category}
                    className="p-4 rounded-xl text-center"
                    style={{
                      background: brandColors.background.hover,
                      border: `2px solid ${brandColors.border.light}`,
                    }}
                  >
                    <p className="text-sm font-bold mb-2" style={{ color: brandColors.text.secondary }}>
                      {category === 'irrigation' ? 'ري' : category === 'labor' ? 'عمالة' : category === 'planting' ? 'زراعة' : category === 'transport' ? 'نقل' : 'إداري'}
                    </p>
                    <p className="text-2xl font-black" style={{ color: brandColors.text.primary }}>
                      {Number(amount).toLocaleString('ar-SA')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'investors' && (
            <div>
              <h3 className="text-xl font-black mb-4" style={{ color: brandColors.text.primary }}>
                المستثمرون
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-6 rounded-xl text-center"
                  style={{
                    background: brandGradients.gold,
                  }}
                >
                  <Users className="h-8 w-8 mx-auto mb-2" style={{ color: brandColors.text.white }} />
                  <p className="text-sm font-bold mb-1" style={{ color: brandColors.text.white }}>
                    عدد المستثمرين
                  </p>
                  <p className="text-4xl font-black" style={{ color: brandColors.text.white }}>
                    {summary.investorsCount}
                  </p>
                </div>
                <div
                  className="p-6 rounded-xl text-center"
                  style={{
                    background: brandGradients.olive,
                  }}
                >
                  <DollarSign className="h-8 w-8 mx-auto mb-2" style={{ color: brandColors.text.white }} />
                  <p className="text-sm font-bold mb-1" style={{ color: brandColors.text.white }}>
                    إجمالي الاستثمار
                  </p>
                  <p className="text-3xl font-black" style={{ color: brandColors.text.white }}>
                    {summary.totalInvestment.toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'charity' && (
            <div>
              <h3 className="text-xl font-black mb-4" style={{ color: brandColors.text.primary }}>
                الاستقطاع الخيري
              </h3>
              {profit > 0 ? (
                <div
                  className="p-8 rounded-2xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, #E57373 0%, #F06292 100%)',
                  }}
                >
                  <Heart className="h-12 w-12 mx-auto mb-4" style={{ color: brandColors.text.white }} />
                  <p className="text-sm font-bold mb-2" style={{ color: brandColors.text.white }}>
                    الاستقطاع الخيري (25% من أرباح المنصة)
                  </p>
                  <p className="text-5xl font-black mb-4" style={{ color: brandColors.text.white }}>
                    {charityAmount.toLocaleString('ar-SA')}
                  </p>
                  <p className="text-lg" style={{ color: brandColors.text.white }}>
                    ريال سعودي
                  </p>
                </div>
              ) : (
                <div
                  className="p-8 rounded-2xl text-center"
                  style={{
                    background: brandColors.background.hover,
                  }}
                >
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: brandColors.text.secondary }} />
                  <p style={{ color: brandColors.text.secondary }}>
                    لا يوجد استقطاع خيري (لا توجد أرباح حالياً)
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4" style={{ color: brandColors.primary.gold }} />
              <p className="text-lg font-bold mb-4" style={{ color: brandColors.text.primary }}>
                التقارير المالية
              </p>
              <button
                className="px-8 py-4 rounded-xl font-bold"
                style={{
                  background: brandGradients.gold,
                  color: brandColors.text.white,
                }}
                onClick={() => alert('سيتم تنزيل التقرير')}
              >
                <Download className="inline h-5 w-5 ml-2" />
                تحميل تقرير شامل
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
