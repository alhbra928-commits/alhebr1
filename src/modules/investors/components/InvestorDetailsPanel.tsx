import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Briefcase,
  Award,
  Home,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { Investor, InvestorsService } from '../investorsService';

interface InvestorDetailsPanelProps {
  investor: Investor | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvestorDetailsPanel({
  investor,
  isOpen,
  onClose
}: InvestorDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'bookings' | 'certificates' | 'farms'>('basic');
  const [bookings, setBookings] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && investor) {
      loadInvestorData();
    }
  }, [isOpen, investor]);

  const loadInvestorData = async () => {
    if (!investor) return;

    try {
      setLoading(true);
      const [bookingsData, certificatesData, farmsData] = await Promise.all([
        InvestorsService.getInvestorBookings(investor.id),
        InvestorsService.getInvestorCertificates(investor.id),
        InvestorsService.getInvestorFarms(investor.id)
      ]);

      setBookings(bookingsData);
      setCertificates(certificatesData);
      setFarms(farmsData);
    } catch (error) {
      console.error('Error loading investor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !investor) return null;

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getBookingStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      documented: 'bg-purple-100 text-purple-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed top-0 left-0 h-full w-full md:w-[700px] bg-white shadow-2xl z-50 overflow-y-auto" dir="rtl">
        <div className="sticky top-0 bg-gradient-to-r from-[#C89B3C] to-[#D4B574] p-6 shadow-lg z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
                <User className="h-7 w-7" />
                تفاصيل المستثمر
              </h2>
              <p className="text-white/90 font-bold">{investor.full_name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        <div className="sticky top-[110px] bg-white border-b-2 border-gray-200 z-10">
          <div className="flex gap-2 p-4">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'basic'
                  ? 'bg-[#C89B3C] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              البيانات الأساسية
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'bookings'
                  ? 'bg-[#C89B3C] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              الحجوزات ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'certificates'
                  ? 'bg-[#C89B3C] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              الشهادات ({certificates.length})
            </button>
            <button
              onClick={() => setActiveTab('farms')}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'farms'
                  ? 'bg-[#C89B3C] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              المزارع ({farms.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div className={`p-4 rounded-xl ${getStatusColor(investor.status)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">الحالة:</span>
                  <span className="text-lg font-black">
                    {investor.status === 'active' ? 'نشط ✅' : investor.status === 'suspended' ? 'مجمد 🧊' : 'قيد المراجعة ⏳'}
                  </span>
                </div>
              </div>

              <section className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-200">
                <h3 className="text-lg font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  البيانات الشخصية
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#2C2C2C]/70">الاسم الكامل:</span>
                    <span className="font-bold">{investor.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      رقم الجوال:
                    </span>
                    <span className="font-mono font-bold">{investor.mobile_number || investor.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      البريد:
                    </span>
                    <span className="font-mono text-sm">{investor.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      رقم الهوية:
                    </span>
                    <span className="font-mono font-bold">{investor.national_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2C2C2C]/70 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      تاريخ التسجيل:
                    </span>
                    <span className="font-mono text-sm">
                      {new Date(investor.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              </section>

              <section className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
                <h3 className="text-lg font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  الإحصائيات
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">الحجوزات</p>
                    <p className="text-2xl font-black text-blue-600">{investor.bookings_count || 0}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">الشهادات</p>
                    <p className="text-2xl font-black text-purple-600">{investor.certificates_count || 0}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">إجمالي الاستثمار</p>
                    <p className="text-lg font-black text-green-600">
                      {(investor.total_invested || 0).toLocaleString('ar-SA')} ريال
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">الأشجار</p>
                    <p className="text-2xl font-black text-amber-600">{investor.total_trees_owned || 0}</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-3">
              {loading ? (
                <p className="text-center text-gray-500 py-8">جاري التحميل...</p>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">لا توجد حجوزات</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono font-bold text-[#C89B3C]">{booking.booking_code}</p>
                        <p className="text-sm text-gray-600">{booking.farm?.name_ar || 'مزرعة غير معروفة'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getBookingStatusColor(booking.booking_status)}`}>
                        {booking.booking_status === 'pending' && 'بانتظار'}
                        {booking.booking_status === 'approved' && 'معتمد'}
                        {booking.booking_status === 'documented' && 'موثّق'}
                        {booking.booking_status === 'rejected' && 'مرفوض'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">الأشجار:</span>
                        <span className="font-bold mr-1">{booking.reserved_trees}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">المبلغ:</span>
                        <span className="font-bold mr-1">{booking.total_price.toLocaleString('ar-SA')} ريال</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-3">
              {loading ? (
                <p className="text-center text-gray-500 py-8">جاري التحميل...</p>
              ) : certificates.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">لا توجد شهادات</p>
                </div>
              ) : (
                certificates.map((cert) => (
                  <div key={cert.id} className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono font-bold text-[#C89B3C] text-lg">{cert.certificate_code}</p>
                        <p className="text-sm text-gray-600">{cert.farm?.name_ar || 'مزرعة غير معروفة'}</p>
                      </div>
                      <Award className="h-8 w-8 text-[#C89B3C]" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">الأشجار:</span>
                        <span className="font-bold mr-1">{cert.reserved_trees}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">القيمة:</span>
                        <span className="font-bold mr-1">{cert.total_price.toLocaleString('ar-SA')} ريال</span>
                      </div>
                    </div>
                    {cert.certificate_pdf_url && (
                      <a
                        href={cert.certificate_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                        عرض الشهادة
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'farms' && (
            <div className="space-y-3">
              {loading ? (
                <p className="text-center text-gray-500 py-8">جاري التحميل...</p>
              ) : farms.length === 0 ? (
                <div className="text-center py-12">
                  <Home className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">لا توجد مزارع مملوكة</p>
                </div>
              ) : (
                farms.map((farm: any, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                        <Home className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#2C2C2C] mb-1">{farm.name_ar}</h4>
                        <p className="text-xs text-gray-600 font-mono">{farm.farm_code}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-600">
                          <span>{farm.farm_type}</span>
                          <span>•</span>
                          <span>{farm.region}</span>
                          <span>•</span>
                          <span>{farm.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
