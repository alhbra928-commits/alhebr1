import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SimpleLoader } from '../../../components/common/SimpleLoader';
import { BackButton } from '../../../components/common/BackButton';

interface FarmFinancialDetails {
  farm_code: string;
  farm_name: string;
  owner_name: string;
  owner_card: {
    actual_amount: number;
    paid: number;
    remaining: number;
    transactions: Transaction[];
  };
  investors_card: {
    total_investors: number;
    total_collected: number;
    total_pending: number;
    transactions: Transaction[];
  };
  platform_card: {
    platform_profit: number;
    charity_amount: number;
    net_profit: number;
    transactions: Transaction[];
  };
}

interface Transaction {
  id: string;
  type: 'income' | 'outcome';
  amount: number;
  description: string;
  date: string;
  status: string;
}

interface FarmFinancialDetailsPageProps {
  farmCode: string;
  onBack: () => void;
}

export function FarmFinancialDetailsPage({ farmCode, onBack }: FarmFinancialDetailsPageProps) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<FarmFinancialDetails | null>(null);

  useEffect(() => {
    loadDetails();
  }, [farmCode]);

  const loadDetails = async () => {
    try {
      console.log('🔍 Loading financial details for farm:', farmCode);

      // جلب البيانات المالية للمزرعة
      const { data: finance, error: financeError } = await supabase
        .from('smart_farm_finances')
        .select('*')
        .eq('farm_code', farmCode)
        .single();

      console.log('📊 Finance data:', finance);
      console.log('❌ Finance error:', financeError);

      if (!finance || financeError) {
        console.error('Finance not found or error:', financeError);
        throw new Error('المزرعة غير موجودة');
      }

      // جلب معاملات صاحب المزرعة
      const { data: ownerTransactions } = await supabase
        .from('owner_payment_tracking')
        .select('*')
        .eq('farm_code', farmCode)
        .order('payment_date', { ascending: false });

      // جلب معاملات المستثمرين (الحجوزات)
      const { data: investorTransactions } = await supabase
        .from('reservations')
        .select('*, investors(name, phone)')
        .eq('farm_code', farmCode)
        .order('created_at', { ascending: false });

      // جلب معاملات المنصة (الأرباح والخير)
      const { data: platformTransactions } = await supabase
        .from('farm_financial_transactions')
        .select('*')
        .eq('farm_code', farmCode)
        .order('transaction_date', { ascending: false });

      // بناء البطاقات الثلاث
      const ownerPaid = ownerTransactions?.reduce((sum, t) => sum + Number(t.amount_paid || 0), 0) || 0;

      const investorsCollected = investorTransactions?.filter(t => t.booking_status === 'approved')
        .reduce((sum, t) => sum + Number(t.total_price || 0), 0) || 0;

      const investorsPending = investorTransactions?.filter(t => t.booking_status === 'pending')
        .reduce((sum, t) => sum + Number(t.total_price || 0), 0) || 0;

      setDetails({
        farm_code: farmCode,
        farm_name: finance.farm_name || 'مزرعة',
        owner_name: finance.owner_name || 'صاحب المزرعة',
        owner_card: {
          actual_amount: Number(finance.actual_amount || 0),
          paid: ownerPaid,
          remaining: Number(finance.actual_amount || 0) - ownerPaid,
          transactions: (ownerTransactions || []).map(t => ({
            id: t.id,
            type: 'outcome',
            amount: Number(t.amount_paid),
            description: `دفعة لصاحب المزرعة - ${t.payment_method}`,
            date: t.payment_date,
            status: t.payment_status
          }))
        },
        investors_card: {
          total_investors: finance.total_investors,
          total_collected: investorsCollected,
          total_pending: investorsPending,
          transactions: (investorTransactions || []).map(t => ({
            id: t.id,
            type: 'income',
            amount: Number(t.total_price || 0),
            description: `حجز ${t.reserved_trees} شجرة - ${t.investors?.name || 'مستثمر'}`,
            date: t.created_at,
            status: t.booking_status
          }))
        },
        platform_card: {
          platform_profit: Number(finance.platform_profit),
          charity_amount: Number(finance.charity_amount),
          net_profit: Number(finance.net_platform_profit),
          transactions: (platformTransactions || []).map(t => ({
            id: t.id,
            type: t.transaction_type === 'credit' ? 'income' : 'outcome',
            amount: Number(t.amount),
            description: t.description || 'حركة مالية',
            date: t.transaction_date,
            status: 'completed'
          }))
        }
      });

      console.log('✅ Details loaded successfully:', details);
    } catch (error) {
      console.error('❌ Error loading financial details:', error);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SimpleLoader message="جاري تحميل التفاصيل المالية..." />;
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">لم يتم العثور على البيانات المالية</h2>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* الرأس */}
        <div className="mb-6">
          <BackButton onClick={onBack} />

          <div className="mt-6 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl p-6 shadow-2xl">
            <h1 className="text-3xl font-bold text-white mb-2">
              {details.farm_name}
            </h1>
            <p className="text-amber-100 text-lg">{details.farm_code}</p>
          </div>
        </div>

        {/* البطاقات الثلاث */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1️⃣ بطاقة صاحب المزرعة */}
          <FinancialCard
            title="بطاقة صاحب المزرعة"
            subtitle={details.owner_name}
            icon={<User className="text-blue-300" size={32} />}
            color="from-blue-600 to-blue-700"
            stats={[
              { label: 'المبلغ المستحق', value: details.owner_card.actual_amount, color: 'text-blue-100' },
              { label: 'المدفوع', value: details.owner_card.paid, color: 'text-green-300' },
              { label: 'المتبقي', value: details.owner_card.remaining, color: 'text-red-300' }
            ]}
            transactions={details.owner_card.transactions}
          />

          {/* 2️⃣ بطاقة المستثمرين */}
          <FinancialCard
            title="بطاقة المستثمرين"
            subtitle={`${details.investors_card.total_investors} مستثمر`}
            icon={<Users className="text-green-300" size={32} />}
            color="from-green-600 to-green-700"
            stats={[
              { label: 'المحصل', value: details.investors_card.total_collected, color: 'text-green-300' },
              { label: 'قيد المعالجة', value: details.investors_card.total_pending, color: 'text-yellow-300' },
              { label: 'الإجمالي', value: details.investors_card.total_collected + details.investors_card.total_pending, color: 'text-green-100' }
            ]}
            transactions={details.investors_card.transactions}
          />

          {/* 3️⃣ بطاقة المنصة */}
          <FinancialCard
            title="بطاقة المنصة"
            subtitle="الأرباح والاستقطاعات"
            icon={<Building2 className="text-yellow-300" size={32} />}
            color="from-yellow-600 to-amber-700"
            stats={[
              { label: 'إجمالي الربح', value: details.platform_card.platform_profit, color: 'text-yellow-100' },
              { label: 'استقطاع الخير', value: details.platform_card.charity_amount, color: 'text-pink-300' },
              { label: 'الربح الصافي', value: details.platform_card.net_profit, color: 'text-green-300' }
            ]}
            transactions={details.platform_card.transactions}
          />
        </div>
      </div>
    </div>
  );
}

interface FinancialCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  stats: { label: string; value: number; color: string }[];
  transactions: Transaction[];
}

function FinancialCard({ title, subtitle, icon, color, stats, transactions }: FinancialCardProps) {
  const [showTransactions, setShowTransactions] = useState(false);

  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl shadow-2xl overflow-hidden`}>
      {/* الرأس */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
            <p className="text-white/80">{subtitle}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="p-6 space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-4">
            <span className="text-white/70 text-sm block mb-1">{stat.label}</span>
            <span className={`text-2xl font-bold ${stat.color}`}>
              {stat.value.toLocaleString('ar-SA')} ر.س
            </span>
          </div>
        ))}
      </div>

      {/* زر الحركات المالية */}
      <div className="p-6 pt-0">
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium rounded-xl transition-all flex items-center justify-between group"
        >
          <span className="flex items-center gap-2">
            <FileText size={20} />
            الحركات المالية ({transactions.length})
          </span>
          <ChevronRight
            size={20}
            className={`transform transition-transform ${showTransactions ? 'rotate-90' : ''}`}
          />
        </button>
      </div>

      {/* قائمة الحركات المالية */}
      {showTransactions && (
        <div className="px-6 pb-6 space-y-2 max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              لا توجد حركات مالية
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white/10 backdrop-blur-md rounded-lg p-4 hover:bg-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {transaction.type === 'income' ? (
                      <TrendingUp className="text-green-300" size={20} />
                    ) : (
                      <TrendingDown className="text-red-300" size={20} />
                    )}
                    <span className={`font-bold ${transaction.type === 'income' ? 'text-green-300' : 'text-red-300'}`}>
                      {transaction.amount.toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    transaction.status === 'approved' || transaction.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                    transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
                <p className="text-white/80 text-sm mb-1">{transaction.description}</p>
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <Calendar size={14} />
                  {new Date(transaction.date).toLocaleDateString('ar-SA')}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
