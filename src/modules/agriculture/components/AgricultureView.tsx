import React, { useState } from 'react';
import { Sprout, RefreshCw, Clock } from 'lucide-react';
import { BackButton } from '../../../components/common/BackButton';
import { TransactionsTab } from './TransactionsTab';
import { ProductsTab } from './ProductsTab';

interface AgricultureViewProps {
  onBack?: () => void;
}

export function AgricultureView({ onBack }: AgricultureViewProps) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'products'>('transactions');

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-8" dir="rtl">
      <div className="max-w-[1800px] mx-auto">
        {onBack && (
          <div className="mb-6">
            <BackButton onBack={onBack} />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-5xl font-black text-[#C89B3C] mb-2 flex items-center gap-3">
            <Sprout className="h-12 w-12" />
            الخدمات الزراعية
          </h1>
          <p className="text-[#2C2C2C]/70 text-lg">
            إدارة المعاملات الزراعية وخدمات المنتجات بعد التملك
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="border-b-2 border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex-1 px-6 py-4 font-black text-lg transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-[#C89B3C] text-white border-b-4 border-[#B8894E]'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                المعاملات الزراعية
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 px-6 py-4 font-black text-lg transition-all ${
                  activeTab === 'products'
                    ? 'bg-[#C89B3C] text-white border-b-4 border-[#B8894E]'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                خدمات المنتجات الزراعية
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'transactions' && <TransactionsTab />}
            {activeTab === 'products' && <ProductsTab />}
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-900 mb-2">قسم تحت التطوير</h3>
              <p className="text-amber-800 leading-relaxed">
                هذا القسم مخصص لإدارة العمليات الزراعية بعد اكتمال عمليات التملك.
                سيتم تفعيل جميع الوظائف والخدمات تدريجياً وفق خطة التطوير المعتمدة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
