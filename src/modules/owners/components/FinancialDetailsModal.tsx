import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Download,
  Eye,
  BarChart3
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';

interface FarmOwnerData {
  id: string;
  owner_full_name: string;
  owner_phone: string;
  farm_location: string;
  bank_iban: string;
}

interface FinancialDetailsModalProps {
  owner: FarmOwnerData;
  onClose: () => void;
}

interface FinancialData {
  totalRevenue: number;
  totalPaidToOwner: number;
  pendingAmount: number;
  platformFees: number;
  totalInvestors: number;
  totalTrees: number;
  availableTrees: number;
  reservedTrees: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  status: string;
}

interface Settlement {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

export function FinancialDetailsModal({ owner, onClose }: FinancialDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalRevenue: 0,
    totalPaidToOwner: 0,
    pendingAmount: 0,
    platformFees: 0,
    totalInvestors: 0,
    totalTrees: 0,
    availableTrees: 0,
    reservedTrees: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'settlements'>('overview');

  useEffect(() => {
    loadFinancialData();
  }, [owner.id]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);

      // Get financial data from smart_farm_finances
      const { data: financeData } = await supabase
        .from('smart_farm_finances')
        .select('*')
        .eq('farm_owner_id', owner.id)
        .single();

      // Get transactions
      const { data: transactionsData } = await supabase
        .from('financial_transactions_log')
        .select('*')
        .eq('farm_owner_id', owner.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Get settlements
      const { data: settlementsData } = await supabase
        .from('owner_settlements')
        .select('*')
        .eq('farm_owner_id', owner.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get reservations for investor count
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select('investor_id')
        .eq('farm_owner_id', owner.id)
        .is('deleted_at', null);

      const uniqueInvestors = new Set(reservationsData?.map(r => r.investor_id)).size;

      setFinancialData({
        totalRevenue: financeData?.total_revenue || 0,
        totalPaidToOwner: financeData?.total_paid_to_farm_owner || 0,
        pendingAmount: financeData?.pending_to_farm_owner || 0,
        platformFees: financeData?.platform_fees_collected || 0,
        totalInvestors: uniqueInvestors,
        totalTrees: financeData?.total_trees || 0,
        availableTrees: financeData?.available_trees || 0,
        reservedTrees: financeData?.reserved_trees || 0
      });

      setTransactions(transactionsData || []);
      setSettlements(settlementsData || []);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'investor_payment':
      case 'revenue':
        return <ArrowDownRight className="h-5 w-5 text-emerald-600" />;
      case 'owner_payment':
      case 'settlement':
        return <ArrowUpRight className="h-5 w-5 text-blue-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'investor_payment':
      case 'revenue':
        return 'text-emerald-600';
      case 'owner_payment':
      case 'settlement':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'emerald', text: 'مكتمل', icon: CheckCircle },
      pending: { color: 'amber', text: 'قيد المعالجة', icon: Clock },
      failed: { color: 'red', text: 'فشل', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-1 px-3 py-1 bg-${config.color}-50 border border-${config.color}-200 rounded-lg`}>
        <Icon className={`h-4 w-4 text-${config.color}-600`} />
        <span className={`text-xs font-bold text-${config.color}-700`}>{config.text}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <Wallet className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-black mb-1">البيانات المالية</h2>
              <p className="text-emerald-100 font-bold text-lg">{owner.owner_full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 border-b-2 border-gray-200 px-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-bold transition-all border-b-4 ${
                activeTab === 'overview'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-emerald-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                نظرة عامة
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 font-bold transition-all border-b-4 ${
                activeTab === 'transactions'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-emerald-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                المعاملات ({transactions.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settlements')}
              className={`px-6 py-3 font-bold transition-all border-b-4 ${
                activeTab === 'settlements'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-emerald-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                التسويات ({settlements.length})
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600 font-bold">جاري تحميل البيانات المالية...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Main Financial Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Revenue */}
                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <DollarSign className="h-10 w-10" />
                        <TrendingUp className="h-6 w-6 text-emerald-200" />
                      </div>
                      <p className="text-emerald-100 text-sm font-bold mb-1">إجمالي الإيرادات</p>
                      <p className="text-3xl font-black">
                        <AnimatedCounter value={financialData.totalRevenue} duration={1500} />
                        <span className="text-xl mr-1">ر.س</span>
                      </p>
                    </div>

                    {/* Paid to Owner */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <Wallet className="h-10 w-10" />
                        <CheckCircle className="h-6 w-6 text-blue-200" />
                      </div>
                      <p className="text-blue-100 text-sm font-bold mb-1">المدفوع للمالك</p>
                      <p className="text-3xl font-black">
                        <AnimatedCounter value={financialData.totalPaidToOwner} duration={1500} />
                        <span className="text-xl mr-1">ر.س</span>
                      </p>
                    </div>

                    {/* Pending Amount */}
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <Clock className="h-10 w-10" />
                        <AlertCircle className="h-6 w-6 text-amber-200" />
                      </div>
                      <p className="text-amber-100 text-sm font-bold mb-1">قيد الانتظار</p>
                      <p className="text-3xl font-black">
                        <AnimatedCounter value={financialData.pendingAmount} duration={1500} />
                        <span className="text-xl mr-1">ر.س</span>
                      </p>
                    </div>

                    {/* Platform Fees */}
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <Calculator className="h-10 w-10" />
                        <TrendingDown className="h-6 w-6 text-purple-200" />
                      </div>
                      <p className="text-purple-100 text-sm font-bold mb-1">عمولة المنصة</p>
                      <p className="text-3xl font-black">
                        <AnimatedCounter value={financialData.platformFees} duration={1500} />
                        <span className="text-xl mr-1">ر.س</span>
                      </p>
                    </div>
                  </div>

                  {/* Bank Info */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="h-6 w-6 text-emerald-600" />
                      معلومات الحساب البنكي
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 border-2 border-emerald-100">
                        <p className="text-sm font-bold text-gray-600 mb-2">رقم الآيبان</p>
                        <p className="text-lg font-mono font-black text-gray-900" dir="ltr">
                          {owner.bank_iban}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border-2 border-emerald-100">
                        <p className="text-sm font-bold text-gray-600 mb-2">رقم الجوال</p>
                        <p className="text-lg font-bold text-gray-900" dir="ltr">
                          {owner.owner_phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trees Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-6 border-2 border-emerald-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600">إجمالي الأشجار</p>
                          <p className="text-2xl font-black text-gray-900">
                            <AnimatedCounter value={financialData.totalTrees} duration={1500} />
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600">محجوز</p>
                          <p className="text-2xl font-black text-gray-900">
                            <AnimatedCounter value={financialData.reservedTrees} duration={1500} />
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <Eye className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600">متاح</p>
                          <p className="text-2xl font-black text-gray-900">
                            <AnimatedCounter value={financialData.availableTrees} duration={1500} />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transactions Tab */}
              {activeTab === 'transactions' && (
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                      <p className="font-bold">لا توجد معاملات مسجلة</p>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:border-emerald-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{transaction.description || 'معاملة مالية'}</p>
                              <p className="text-sm text-gray-600">{formatDate(transaction.created_at)}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className={`text-2xl font-black ${getTransactionColor(transaction.type)}`}>
                              {formatPrice(transaction.amount)}
                            </p>
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Settlements Tab */}
              {activeTab === 'settlements' && (
                <div className="space-y-4">
                  {settlements.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <CreditCard className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                      <p className="font-bold">لا توجد تسويات مسجلة</p>
                    </div>
                  ) : (
                    settlements.map((settlement) => (
                      <div
                        key={settlement.id}
                        className="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:border-emerald-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                              <CreditCard className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">تسوية مالية</p>
                              <p className="text-sm text-gray-600">
                                تم الإنشاء: {formatDate(settlement.created_at)}
                              </p>
                              {settlement.completed_at && (
                                <p className="text-xs text-emerald-600 font-bold">
                                  اكتملت: {formatDate(settlement.completed_at)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-2xl font-black text-emerald-600">
                              {formatPrice(settlement.amount)}
                            </p>
                            {getStatusBadge(settlement.status)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t-2 border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 hover:border-emerald-300 text-gray-700 rounded-xl font-bold transition-all">
              <Download className="h-4 w-4" />
              تصدير التقرير
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
