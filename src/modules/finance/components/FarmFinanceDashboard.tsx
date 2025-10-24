import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Sparkles } from 'lucide-react';
import { BackButton } from '../../../components/common/BackButton';
import {
  FarmFinanceService,
  FarmWallet,
  FarmFinancialState,
} from '../services/farmFinanceService';
import { FarmFinancialCard3D } from './FarmFinancialCard3D';
import { FarmFinancialPanelEnhanced } from './FarmFinancialPanelEnhanced';

interface FarmFinanceDashboardProps {
  onBack?: () => void;
}

interface FarmFinancialData {
  wallet: FarmWallet;
  state: FarmFinancialState;
  investorsCount: number;
  totalInvestment: number;
  expenseTotal: number;
}

export function FarmFinanceDashboard({ onBack }: FarmFinanceDashboardProps) {
  const [farms, setFarms] = useState<FarmFinancialData[]>([]);
  const [filteredFarms, setFilteredFarms] = useState<FarmFinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'balance' | 'profit' | 'expense'>('balance');
  const [selectedBarcode, setSelectedBarcode] = useState<string | null>(null);

  useEffect(() => {
    loadFarms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [farms, searchTerm, filterState, sortBy]);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const wallets = await FarmFinanceService.getAllFarmWallets();

      const farmsData = await Promise.all(
        wallets.map(async (wallet) => {
          const [state, investors] = await Promise.all([
            FarmFinanceService.getFarmFinancialState(wallet.farm_barcode),
            FarmFinanceService.getFarmInvestors(wallet.farm_barcode),
          ]);

          const totalInvestment = investors.reduce(
            (sum, inv) => sum + Number(inv.investment_amount),
            0
          );

          return {
            wallet,
            state: state!,
            investorsCount: investors.length,
            totalInvestment,
            expenseTotal: Number(wallet.total_expense),
          };
        })
      );

      setFarms(farmsData);
    } catch (error) {
      console.error('Error loading farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...farms];

    if (searchTerm) {
      filtered = filtered.filter((farm) =>
        farm.wallet.farm_barcode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterState !== 'all') {
      filtered = filtered.filter((farm) => farm.state.current_state === filterState);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'balance') {
        return Number(b.wallet.balance) - Number(a.wallet.balance);
      } else if (sortBy === 'profit') {
        const profitA = Number(a.wallet.total_income) - Number(a.wallet.total_expense);
        const profitB = Number(b.wallet.total_income) - Number(b.wallet.total_expense);
        return profitB - profitA;
      } else {
        return Number(b.wallet.total_expense) - Number(a.wallet.total_expense);
      }
    });

    setFilteredFarms(filtered);
  };

  if (selectedBarcode) {
    return (
      <FarmFinancialPanelEnhanced
        barcode={selectedBarcode}
        onBack={() => setSelectedBarcode(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg font-bold text-gray-700">جاري تحميل النظام المالي...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalBalance: farms.reduce((sum, f) => sum + Number(f.wallet.balance), 0),
    totalIncome: farms.reduce((sum, f) => sum + Number(f.wallet.total_income), 0),
    totalExpense: farms.reduce((sum, f) => sum + Number(f.wallet.total_expense), 0),
    activeFarms: farms.filter((f) => f.state.current_state === 'active').length,
  };

  return (
    <div
      className="min-h-screen pb-20"
      dir="rtl"
      style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      }}
    >
      <div className="max-w-[1800px] mx-auto px-8 pt-8">
        {onBack && (
          <div className="mb-6">
            <BackButton onBack={onBack} />
          </div>
        )}

        <div className="mb-8 text-center">
          <div className="inline-block relative">
            <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              النظام المالي الذكي للمزارع
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <p className="text-lg font-medium">كل مزرعة ككيان مالي مستقل</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">إجمالي الأرصدة</p>
            <p className="text-3xl font-black text-blue-600">
              {stats.totalBalance.toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">إجمالي الدخل</p>
            <p className="text-3xl font-black text-green-600">
              {stats.totalIncome.toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">إجمالي المصروفات</p>
            <p className="text-3xl font-black text-red-600">
              {stats.totalExpense.toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">المزارع النشطة</p>
            <p className="text-3xl font-black text-purple-600">{stats.activeFarms}</p>
            <p className="text-xs text-gray-500 mt-1">من {farms.length} مزرعة</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث بالباركود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
              />
            </div>

            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm appearance-none bg-white"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشطة ماليًا</option>
                <option value="settling">قيد التسوية</option>
                <option value="completed">مكتملة</option>
                <option value="frozen">مجمدة</option>
              </select>
            </div>

            <div className="relative">
              <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm appearance-none bg-white"
              >
                <option value="balance">الأعلى رصيدًا</option>
                <option value="profit">الأعلى ربحًا</option>
                <option value="expense">الأعلى مصروفًا</option>
              </select>
            </div>
          </div>
        </div>

        {filteredFarms.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-bold text-gray-400">لا توجد مزارع تطابق البحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredFarms.map((farm) => (
              <FarmFinancialCard3D
                key={farm.wallet.id}
                wallet={farm.wallet}
                state={farm.state}
                investorsCount={farm.investorsCount}
                totalInvestment={farm.totalInvestment}
                expenseTotal={farm.expenseTotal}
                onManage={() => setSelectedBarcode(farm.wallet.farm_barcode)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
