import React from 'react';
import { TrendingUp, Users, DollarSign, Award, Share2 } from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { BackButton } from '../../../components/common/BackButton';

interface MarketingViewProps {
  onBack?: () => void;
}

export function MarketingView({ onBack }: MarketingViewProps) {
  const marketers = [
    {
      id: '1',
      name: 'محمد أحمد الشمري',
      referrals: 45,
      sales: 120000,
      commission: 12000,
      performance: 92,
    },
    {
      id: '2',
      name: 'سارة عبدالله القحطاني',
      referrals: 38,
      sales: 95000,
      commission: 9500,
      performance: 88,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {onBack && (
          <div className="mb-6">
            <BackButton onBack={onBack} />
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-[#8B7355] mb-2">
                إدارة التسويق
              </h1>
              <p className="text-[#2C2C2C]/70">متابعة أداء المسوقين والحملات التسويقية</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
              <Users className="h-5 w-5" />
              <span>إضافة مسوق</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card3D interactive={false}>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{marketers.length}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">المسوقين النشطين</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-blue-700">
                  {marketers.reduce((sum, m) => sum + m.referrals, 0)}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">إجمالي الإحالات</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-green-700">
                  {(marketers.reduce((sum, m) => sum + m.sales, 0) / 1000).toFixed(0)}k
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">إجمالي المبيعات</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-orange-700">
                  {(marketers.reduce((sum, m) => sum + m.commission, 0) / 1000).toFixed(0)}k
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">العمولات المستحقة</h3>
            </div>
          </Card3D>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {marketers.map((marketer) => (
            <Card3D key={marketer.id} interactive={false}>
              <div className="p-6 bg-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {marketer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{marketer.name}</h3>
                      <p className="text-sm text-gray-600">مسوق معتمد</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-bold text-green-700">{marketer.performance}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 text-center">
                    <Share2 className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{marketer.referrals}</p>
                    <p className="text-xs text-gray-600">إحالة</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 text-center">
                    <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900">
                      {(marketer.sales / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-gray-600">مبيعات</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 text-center">
                    <TrendingUp className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900">
                      {(marketer.commission / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-gray-600">عمولة</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    عرض التفاصيل
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                    صرف العمولة
                  </button>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </div>
  );
}
