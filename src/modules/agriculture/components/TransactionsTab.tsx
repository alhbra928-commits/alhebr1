import React from 'react';
import { FileText, AlertCircle, Calendar } from 'lucide-react';

export function TransactionsTab() {
  return (
    <div className="space-y-6">
      <div className="text-center py-20">
        <div className="inline-block p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 mb-6">
          <FileText className="h-24 w-24 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-[#2C2C2C] mb-3">
            المعاملات الزراعية
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-green-300 shadow-lg">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <p className="text-lg text-[#2C2C2C] font-bold text-right leading-relaxed">
                  هذا القسم مخصص لتشغيل المزارع بعد التملك – سيتم تفعيله لاحقًا بإذن الله.
                </p>
              </div>

              <div className="pt-4 border-t-2 border-green-200">
                <p className="text-sm text-[#2C2C2C]/70 font-bold mb-3">
                  سيشمل هذا القسم:
                </p>
                <ul className="text-right space-y-2 text-[#2C2C2C]/80">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>إدارة عمليات الري والتسميد</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>متابعة صيانة المزارع</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>تسجيل المعاملات الزراعية اليومية</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>تقارير الإنتاجية والمحاصيل</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-700">
                <Calendar className="h-4 w-4" />
                <span className="font-bold">قريباً جداً بإذن الله</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
