import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Settings,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { FarmWallet, FarmFinancialState } from '../services/farmFinanceService';

interface FarmFinancialCard3DProps {
  wallet: FarmWallet;
  state: FarmFinancialState;
  investorsCount: number;
  totalInvestment: number;
  expenseTotal: number;
  onManage: () => void;
}

export function FarmFinancialCard3D({
  wallet,
  state,
  investorsCount,
  totalInvestment,
  expenseTotal,
  onManage,
}: FarmFinancialCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getStateConfig = () => {
    const configs = {
      active: {
        label: 'نشطة ماليًا',
        icon: CheckCircle2,
        color: 'bg-green-100 text-green-800 border-green-200',
        dotColor: 'bg-green-500',
      },
      settling: {
        label: 'قيد التسوية',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        dotColor: 'bg-yellow-500',
      },
      completed: {
        label: 'مكتملة ماليًا',
        icon: CheckCircle2,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        dotColor: 'bg-purple-500',
      },
      frozen: {
        label: 'مجمّدة مؤقتًا',
        icon: Lock,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        dotColor: 'bg-blue-500',
      },
    };
    return configs[state.current_state];
  };

  const stateConfig = getStateConfig();
  const StateIcon = stateConfig.icon;

  const profit = wallet.total_income - wallet.total_expense;
  const profitPercent = wallet.total_income > 0 ? ((profit / wallet.total_income) * 100).toFixed(1) : '0.0';

  const getPerformanceColor = () => {
    if (profit > wallet.total_income * 0.3) return 'from-yellow-400 to-yellow-600';
    if (profit > 0) return 'from-green-400 to-green-600';
    if (profit === 0) return 'from-gray-400 to-gray-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
        isExpanded ? 'col-span-2' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0, 0, 0, 0.12)'
          : '0 4px 16px rgba(0, 0, 0, 0.08)',
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getPerformanceColor()}`}
      />

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getPerformanceColor()} shadow-lg`}
              >
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{wallet.farm_barcode}</h3>
                <p className="text-xs text-gray-500">الباركود المالي</p>
              </div>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-full border ${stateConfig.color} flex items-center gap-1.5`}>
            <div className={`w-2 h-2 rounded-full ${stateConfig.dotColor} animate-pulse`} />
            <StateIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">{stateConfig.label}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-600 mb-1">الرصيد الحالي</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">
              {wallet.balance.toLocaleString('ar-SA')}
            </span>
            <span className="text-lg font-bold text-gray-500">ريال</span>
          </div>
          {wallet.frozen_amount > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
              <Lock className="h-3 w-3" />
              <span>مجمّد: {wallet.frozen_amount.toLocaleString('ar-SA')} ريال</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              <p className="text-xs font-bold text-green-800">الدخل</p>
            </div>
            <p className="text-sm font-black text-green-700">
              {wallet.total_income.toLocaleString('ar-SA')}
            </p>
          </div>

          <div className="bg-red-50 rounded-xl p-3 border border-red-100">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="h-3.5 w-3.5 text-red-600" />
              <p className="text-xs font-bold text-red-800">المصروف</p>
            </div>
            <p className="text-sm font-black text-red-700">
              {wallet.total_expense.toLocaleString('ar-SA')}
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              <p className="text-xs font-bold text-blue-800">مستثمرون</p>
            </div>
            <p className="text-sm font-black text-blue-700">{investorsCount}</p>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">إجمالي استثمارات</p>
                <p className="text-lg font-black text-gray-800">
                  {totalInvestment.toLocaleString('ar-SA')} ريال
                </p>
              </div>

              <div className={`rounded-xl p-3 border ${profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-xs text-gray-600 mb-1">صافي الربح</p>
                <div className="flex items-baseline gap-1">
                  <p className={`text-lg font-black ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {profit.toLocaleString('ar-SA')}
                  </p>
                  <span className={`text-xs font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({profitPercent}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-700 font-bold mb-1">تحليل الأداء</p>
                  <p className="text-xs text-gray-700">
                    {profit > wallet.total_income * 0.3 && '🏆 أداء ذهبي ممتاز'}
                    {profit > 0 && profit <= wallet.total_income * 0.3 && '✅ أداء جيد ومستقر'}
                    {profit === 0 && '⚖️ أداء متوازن'}
                    {profit < 0 && '⚠️ تحتاج مراجعة المصروفات'}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
          >
            {isExpanded ? 'طيّ' : 'توسيع'}
          </button>

          <button
            onClick={onManage}
            disabled={state.current_state === 'completed'}
            className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 ${
              state.current_state === 'completed'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:scale-105'
            }`}
          >
            <Settings className="h-4 w-4" />
            إدارة مالية
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
