import { useState, useEffect } from 'react';
import {
  Home, FileText, Trees, Award, Wallet, Clock, Bell, LogOut, Loader,
  CheckCircle2, AlertCircle, XCircle, Download, Wifi, Upload, FileCheck
} from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { InvestorService, InvestorStats, InvestorReservation, InvestorTimeline } from '../services/investorService';
import { useRealtimeTables } from '../../../lib/realtimeSync';
import { PaymentReceiptUploadModal } from './PaymentReceiptUploadModal';
import { PaymentReceiptService } from '../services/paymentReceiptService';
import { ProgressTracker } from './ProgressTracker';
import { NotificationBadge, TabGlow } from './NotificationBadge';
import { NotificationBadgeService, BadgeNotifications } from '../services/notificationBadgeService';
import { ConnectionStatus } from './ConnectionStatus';
import { EnhancedNotificationService, Notification, ConnectionStatus as ConnStatus } from '../services/enhancedNotificationService';
import { CertificateModal } from './CertificateModal';
import { SmartWelcomeModal } from './SmartWelcomeModal';
// BottomNavBar removed - ready for new development

interface InvestorDashboardProps {
  phone: string;
  onLogout: () => void;
  isFirstTimeLogin?: boolean;
}

type TabType = 'home' | 'reservations' | 'farms' | 'certificates' | 'financials' | 'timeline' | 'notifications';

export function InvestorDashboard({ phone, onLogout, isFirstTimeLogin = false }: InvestorDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InvestorStats | null>(null);
  const [reservations, setReservations] = useState<InvestorReservation[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<InvestorTimeline[]>([]);
  const [investorName, setInvestorName] = useState('');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<InvestorReservation | null>(null);
  const [receiptsMap, setReceiptsMap] = useState<{ [key: string]: any[] }>({});
  const [showWelcome, setShowWelcome] = useState(isFirstTimeLogin);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [badgeCounts, setBadgeCounts] = useState<BadgeNotifications>({
    reservations: 0,
    certificates: 0,
    financials: 0,
    notifications: 0
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnStatus>({
    status: 'connecting',
    lastUpdate: new Date()
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [realtimeNotifications, setRealtimeNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadAllData();

    const unsubscribeNotifications = NotificationBadgeService.subscribeToUpdates(
      phone,
      (counts) => {
        console.log('🔔 Notification counts updated:', counts);
        setBadgeCounts(counts);
      }
    );

    EnhancedNotificationService.subscribeToNotifications(
      phone,
      (notification) => {
        console.log('🔔 New realtime notification:', notification);
        setRealtimeNotifications(prev => [notification, ...prev]);
        loadAllData();
      },
      (status) => {
        setConnectionStatus(status);
      }
    );

    EnhancedNotificationService.subscribeToReservationUpdates(
      phone,
      (reservation) => {
        console.log('🔄 Reservation updated via realtime:', reservation);
        loadAllData();
      }
    );

    const unsubscribe = useRealtimeTables([
      {
        name: 'reservations',
        callbacks: {
          onInsert: () => {
            console.log('🔄 New reservation detected, reloading investor data...');
            loadAllData();
          },
          onUpdate: () => {
            console.log('🔄 Reservation updated, reloading investor data...');
            loadAllData();
          }
        },
        filter: `customer_phone=eq.${phone}`
      },
      {
        name: 'payment_receipts',
        callbacks: {
          onInsert: () => {
            console.log('🔄 New receipt uploaded, reloading...');
            loadAllData();
          },
          onUpdate: () => {
            console.log('🔄 Receipt status updated, reloading...');
            loadAllData();
          }
        }
      },
      {
        name: 'investors',
        callbacks: {
          onUpdate: () => {
            console.log('🔄 Investor data updated, reloading...');
            loadAllData();
          }
        },
        filter: `phone=eq.${phone}`
      }
    ]);

    return () => {
      unsubscribe();
      unsubscribeNotifications.then(unsub => unsub());
      EnhancedNotificationService.unsubscribeAll();
    };
  }, [phone]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('🚀 [InvestorDashboard] START loadAllData for phone:', phone);

      const [statsData, reservationsData, farmsData, timelineData, investorData, certificatesData, notificationsData] = await Promise.all([
        InvestorService.getInvestorStats(phone),
        InvestorService.getInvestorReservations(phone),
        InvestorService.getInvestorFarms(phone),
        InvestorService.getInvestorTimeline(phone),
        InvestorService.getInvestorByPhone(phone),
        InvestorService.getInvestorCertificates(phone),
        EnhancedNotificationService.getUnreadNotifications(phone)
      ]);

      console.log('📊 [InvestorDashboard] Loaded data for phone:', phone);
      console.log('📦 Reservations:', reservationsData);
      console.log('📦 Reservations count:', reservationsData?.length || 0);
      console.log('📦 Reservations type:', typeof reservationsData);
      console.log('📦 Is Array?', Array.isArray(reservationsData));
      console.log('📊 Stats:', statsData);

      setStats(statsData);
      setReservations(reservationsData);
      setFarms(farmsData);
      setTimeline(timelineData);
      setInvestorName(investorData?.customer_name || phone);
      setCertificates(certificatesData);
      setNotifications(notificationsData);

      const receiptsPromises = reservationsData.map(res =>
        PaymentReceiptService.getReceiptsByReservation(res.id)
      );
      const receiptsResults = await Promise.all(receiptsPromises);
      const newReceiptsMap: { [key: string]: any[] } = {};
      reservationsData.forEach((res, idx) => {
        newReceiptsMap[res.id] = receiptsResults[idx];
      });
      setReceiptsMap(newReceiptsMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReceipt = (reservation: InvestorReservation) => {
    setSelectedReservation(reservation);
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    loadAllData();
  };

  const getStatusInfo = (bookingStatus: string, reservationId?: string) => {
    switch (bookingStatus) {
      case 'temporary':
        return { label: '🕓 حجز مؤقت', color: '#6b7280', icon: Clock };
      case 'approved':
        return { label: '✅ معتمد - يرجى رفع الإيصال', color: '#d4af37', icon: CheckCircle2 };
      case 'pending_verification':
        return { label: '📩 قيد التحقق المالي', color: '#16a34a', icon: Clock };
      case 'verified':
        return { label: '💳 تم التحقق من السداد', color: '#10b981', icon: CheckCircle2 };
      case 'ownership_completed':
        return { label: '🏆 اكتمال التملك', color: '#d4af37', icon: Award };
      case 'documented':
        return { label: '📜 موثق', color: '#3b82f6', icon: FileCheck };
      case 'cancelled':
        return { label: 'ملغي', color: '#ef4444', icon: XCircle };
      default:
        return { label: bookingStatus, color: '#6b7280', icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: brandGradients.beige }}
      >
        <div className="text-center">
          <Loader
            className="h-12 w-12 animate-spin mx-auto mb-4"
            style={{ color: brandColors.primary.gold }}
          />
          <p className="text-xl font-bold" style={{ color: brandColors.text.primary }}>
            جاري تحميل لوحة المستثمر...
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'reservations', label: 'حجوزاتي', icon: FileText },
    { id: 'farms', label: 'مزارعي', icon: Trees },
    { id: 'certificates', label: 'الشهادات', icon: Award },
    { id: 'financials', label: 'المالية', icon: Wallet },
    { id: 'timeline', label: 'الجدول الزمني', icon: Clock },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: brandGradients.beige }}
      dir="rtl"
    >
      {showWelcome && (
        <SmartWelcomeModal
          onClose={() => setShowWelcome(false)}
          investorName={investorName}
        />
      )}

      <div
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          background: 'rgba(245, 240, 230, 0.9)',
          borderColor: brandColors.primary.gold + '20',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4">
          {/* Header Row 1: Title & Logout */}
          <div className="flex items-center justify-between mb-2 sm:mb-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black truncate" style={{ color: brandColors.primary.gold }}>
                لوحة المستثمر
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm truncate" style={{ color: brandColors.text.secondary }}>
                مرحباً، {investorName}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-bold sm:font-black text-xs sm:text-sm md:text-base transition-all active:scale-95 sm:hover:scale-105 touch-manipulation flex-shrink-0"
              style={{
                color: 'white',
                background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                boxShadow: '0 2px 10px rgba(220, 38, 38, 0.2)',
              }}
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">الخروج</span>
              <span className="sm:hidden">خروج</span>
            </button>
          </div>

          {/* Header Row 2: Status & Connection (Hidden on mobile, shown on tablet+) */}
          <div className="hidden sm:flex items-center justify-between gap-2 mt-2">
            <ConnectionStatus
              status={connectionStatus.status}
              lastUpdate={connectionStatus.lastUpdate}
              className="flex-shrink-0"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 bg-green-50 rounded-md sm:rounded-lg border border-green-200">
                <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-600 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-bold text-green-600">متزامن</span>
              </div>
              <div className="text-left">
                <p className="text-[9px] sm:text-[10px] leading-tight" style={{ color: brandColors.text.secondary }}>
                  جلسة نشطة
                </p>
                <p className="text-[10px] sm:text-xs font-bold leading-tight" style={{ color: brandColors.primary.gold }}>
                  {phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-6 lg:py-8">
        <div className="flex gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-4 sm:mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            const badgeCount =
              tab.id === 'reservations' ? badgeCounts.reservations :
              tab.id === 'certificates' ? badgeCounts.certificates :
              tab.id === 'financials' ? badgeCounts.financials :
              tab.id === 'notifications' ? badgeCounts.notifications :
              0;

            const hasNotification = badgeCount > 0 && !isActive;

            const handleTabClick = () => {
              setActiveTab(tab.id as TabType);
              NotificationBadgeService.saveLastViewed(tab.id);

              setTimeout(async () => {
                const newCounts = await NotificationBadgeService.getNotificationCounts(phone);
                setBadgeCounts(newCounts);
              }, 300);
            };

            return (
              <button
                key={tab.id}
                onClick={handleTabClick}
                className="relative flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all whitespace-nowrap touch-manipulation flex-shrink-0"
                style={{
                  background: isActive ? brandGradients.gold : 'white',
                  color: isActive ? 'white' : brandColors.text.primary,
                  boxShadow: isActive ? '0 4px 20px rgba(212,175,55,0.3)' : '0 2px 10px rgba(0,0,0,0.05)',
                }}
              >
                {hasNotification && <TabGlow hasNotification={true} color="gold" />}

                <div className="relative">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <NotificationBadge count={badgeCount} animate={!isActive} />
                </div>

                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-[10px]">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'home' && stats && (
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-3 sm:mb-4 md:mb-6" style={{ color: brandColors.text.primary }}>
              نظرة عامة
            </h2>

            {stats.totalReservations === 0 && (
              <div
                className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 mb-4 sm:mb-6 md:mb-8 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                  border: `2px solid ${brandColors.primary.gold}30`,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                }}
              >
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 sm:mb-4 md:mb-6 flex items-center justify-center"
                  style={{
                    background: brandGradients.gold,
                    boxShadow: '0 10px 30px rgba(212,175,55,0.3)',
                  }}
                >
                  <span className="text-3xl sm:text-4xl md:text-5xl">🌴</span>
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-2 sm:mb-3 md:mb-4" style={{ color: brandColors.text.primary }}>
                  مرحباً بك في لوحة المستثمر!
                </h3>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 md:mb-6" style={{ color: brandColors.text.secondary }}>
                  ابدأ رحلتك الاستثمارية في مزارع النخيل والزيتون
                </p>

                <div className="space-y-2 sm:space-y-3 md:space-y-4 max-w-xl mx-auto">
                  <div className="text-right p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl" style={{ background: 'rgba(255,255,255,0.5)' }}>
                    <p className="font-bold mb-1 sm:mb-1.5 md:mb-2 text-xs sm:text-sm md:text-base" style={{ color: brandColors.text.primary }}>
                      🌿 استثمر في مزارع حقيقية
                    </p>
                    <p className="text-[10px] sm:text-xs md:text-sm" style={{ color: brandColors.text.secondary }}>
                      اختر من بين مزارعنا المتنوعة وابدأ الاستثمار
                    </p>
                  </div>

                  <div className="text-right p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl" style={{ background: 'rgba(255,255,255,0.5)' }}>
                    <p className="font-bold mb-1 sm:mb-1.5 md:mb-2 text-xs sm:text-sm md:text-base" style={{ color: brandColors.text.primary }}>
                      📊 تابع استثماراتك
                    </p>
                    <p className="text-[10px] sm:text-xs md:text-sm" style={{ color: brandColors.text.secondary }}>
                      راقب أرباحك وعوائدك بشكل مباشر
                    </p>
                  </div>

                  <div className="text-right p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl" style={{ background: 'rgba(255,255,255,0.5)' }}>
                    <p className="font-bold mb-1 sm:mb-1.5 md:mb-2 text-xs sm:text-sm md:text-base" style={{ color: brandColors.text.primary }}>
                      🏆 احصل على شهادات الملكية
                    </p>
                    <p className="text-[10px] sm:text-xs md:text-sm" style={{ color: brandColors.text.secondary }}>
                      وثّق استثماراتك بشهادات رسمية
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = '/'}
                  className="mt-4 sm:mt-6 md:mt-8 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base md:text-lg lg:text-xl text-white transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
                  style={{
                    background: brandGradients.gold,
                    boxShadow: '0 10px 40px rgba(212,175,55,0.3)',
                  }}
                >
                  تصفح المزارع المتاحة 🌾
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
              <div
                className="rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                  border: `2px solid ${brandColors.primary.gold}30`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <Trees className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-1.5 sm:mb-2 md:mb-3" style={{ color: brandColors.primary.gold }} />
                <p className="text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-1.5 md:mb-2" style={{ color: brandColors.text.secondary }}>
                  مزارعي
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black" style={{ color: brandColors.primary.gold }}>
                  {stats.totalFarms}
                </p>
              </div>

              <div
                className="rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                  border: `2px solid rgba(59,130,246,0.3)`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-1.5 sm:mb-2 md:mb-3 text-blue-500" />
                <p className="text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-1.5 md:mb-2" style={{ color: brandColors.text.secondary }}>
                  الحجوزات
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-blue-500">
                  {stats.totalReservations}
                </p>
              </div>

              <div
                className="rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                  border: `2px solid rgba(16,185,129,0.3)`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <Award className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-1.5 sm:mb-2 md:mb-3 text-green-500" />
                <p className="text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-1.5 md:mb-2" style={{ color: brandColors.text.secondary }}>
                  الأشجار
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-green-500">
                  {stats.totalTrees.toLocaleString('ar-SA')}
                </p>
              </div>

              <div
                className="rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                  border: `2px solid rgba(168,85,247,0.3)`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-1.5 sm:mb-2 md:mb-3 text-purple-500" />
                <p className="text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-1.5 md:mb-2" style={{ color: brandColors.text.secondary }}>
                  الاستثمار
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-purple-500">
                  {stats.totalAmount.toLocaleString('ar-SA')} <span className="text-sm sm:text-base md:text-lg">ر.س</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className="rounded-2xl p-6"
                style={{
                  background: 'white',
                  border: `2px solid ${brandColors.primary.gold}30`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <h3 className="text-xl font-black mb-4" style={{ color: brandColors.text.primary }}>
                  آخر الحجوزات
                </h3>
                <div className="space-y-3">
                  {reservations.slice(0, 3).map((reservation) => {
                    const statusInfo = getStatusInfo((reservation as any).booking_status || reservation.status, reservation.id);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <div
                        key={reservation.id}
                        className="p-4 rounded-xl flex items-center justify-between"
                        style={{ background: brandColors.background.beige }}
                      >
                        <div className="flex-1">
                          <p className="font-bold mb-1" style={{ color: brandColors.text.primary }}>
                            {reservation.farm_name}
                          </p>
                          <p className="text-sm" style={{ color: brandColors.text.secondary }}>
                            {reservation.number_of_trees} شجرة - {reservation.total_amount.toLocaleString('ar-SA')} ر.س
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-5 h-5" style={{ color: statusInfo.color }} />
                          <span className="text-sm font-bold" style={{ color: statusInfo.color }}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className="rounded-2xl p-6"
                style={{
                  background: 'white',
                  border: `2px solid ${brandColors.primary.gold}30`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <h3 className="text-xl font-black mb-4" style={{ color: brandColors.text.primary }}>
                  الإحصائيات
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span style={{ color: brandColors.text.secondary }}>حجوزات قيد المعالجة</span>
                    <span className="text-xl font-black text-blue-500">{stats.pendingReservations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: brandColors.text.secondary }}>حجوزات مكتملة</span>
                    <span className="text-xl font-black text-green-500">{stats.completedReservations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: brandColors.text.secondary }}>معدل السعر للشجرة</span>
                    <span className="text-xl font-black" style={{ color: brandColors.primary.gold }}>
                      {stats.totalTrees > 0 ? Math.round(stats.totalAmount / stats.totalTrees).toLocaleString('ar-SA') : 0} ر.س
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div>
            <h2 className="text-3xl font-black mb-6" style={{ color: brandColors.text.primary }}>
              حجوزاتي الحالية
            </h2>

            {reservations.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: brandColors.text.secondary }} />
                <p className="text-xl" style={{ color: brandColors.text.secondary }}>
                  لا توجد حجوزات حالياً
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reservations.map((reservation) => {
                  const bookingStatus = (reservation as any).booking_status || 'temporary';
                  const statusInfo = getStatusInfo(bookingStatus, reservation.id);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={reservation.id}
                      className="rounded-2xl p-6 transition-all hover:scale-[1.02]"
                      style={{
                        background: 'white',
                        border: `2px solid ${statusInfo.color}30`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-black" style={{ color: brandColors.text.primary }}>
                          {reservation.farm_name}
                        </h3>
                        <div
                          className="px-3 py-1 rounded-full flex items-center gap-2"
                          style={{ background: `${statusInfo.color}20` }}
                        >
                          <StatusIcon className="w-4 h-4" style={{ color: statusInfo.color }} />
                          <span className="text-sm font-bold" style={{ color: statusInfo.color }}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                            نوع المزرعة
                          </span>
                          <span className="font-bold" style={{ color: brandColors.text.primary }}>
                            {reservation.farm_type}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                            عدد الأشجار
                          </span>
                          <span className="font-bold" style={{ color: brandColors.text.primary }}>
                            {reservation.number_of_trees.toLocaleString('ar-SA')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                            المبلغ الإجمالي
                          </span>
                          <span className="font-black text-lg" style={{ color: brandColors.primary.gold }}>
                            {reservation.total_amount.toLocaleString('ar-SA')} ر.س
                          </span>
                        </div>

                        <div
                          className="pt-3 mt-3"
                          style={{ borderTop: `1px solid ${brandColors.primary.gold}20` }}
                        >
                          <p className="text-xs" style={{ color: brandColors.text.secondary }}>
                            تاريخ الحجز: {new Date(reservation.created_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>

                        <div className="mt-4">
                          <ProgressTracker bookingStatus={bookingStatus} />
                        </div>

                        {bookingStatus === 'temporary' && (
                          <div className="mt-4">
                            <div
                              className="p-4 rounded-xl text-center"
                              style={{
                                background: 'linear-gradient(135deg, rgba(107,114,128,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                                border: '2px solid rgba(107,114,128,0.3)',
                              }}
                            >
                              <p className="text-sm font-bold text-gray-700 leading-relaxed">
                                ⏳ حجزك قيد المراجعة من قبل الإدارة<br/>
                                سيتم إشعارك فور الموافقة عليه بإذن الله.
                              </p>
                            </div>
                          </div>
                        )}

                        {bookingStatus === 'pending_verification' && (
                          <div className="mt-4">
                            <div
                              className="p-4 rounded-xl text-center"
                              style={{
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                                border: '2px solid rgba(16,185,129,0.3)',
                              }}
                            >
                              <p className="text-sm font-bold text-green-700 leading-relaxed">
                                🌿 شكرًا لإتمامك الخطوة الثانية!<br/>
                                تم استلام إيصال السداد، وسيتم التحقق منه خلال 24 ساعة بإذن الله.
                              </p>
                            </div>
                          </div>
                        )}

                        {bookingStatus === 'ownership_completed' && (
                          <div className="mt-4">
                            <div
                              className="p-4 rounded-xl text-center mb-3"
                              style={{
                                background: brandGradients.gold,
                                boxShadow: '0 8px 25px rgba(212,175,55,0.3)',
                              }}
                            >
                              <p className="text-base font-bold text-white leading-relaxed">
                                🎉 مبروك! اكتملت رحلة التملك وتم إصدار الشهادة بنجاح.
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveTab('certificates')}
                              className="w-full px-4 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                              style={{
                                background: brandGradients.gold,
                                boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
                              }}
                            >
                              <Award className="w-5 h-5" />
                              📜 عرض الشهادة الذهبية
                            </button>
                          </div>
                        )}

                        {bookingStatus === 'documented' && (
                          <div className="mt-4">
                            <div
                              className="p-4 rounded-xl text-center"
                              style={{
                                background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                                border: '2px solid rgba(59,130,246,0.3)',
                              }}
                            >
                              <p className="text-sm font-bold text-blue-700 leading-relaxed">
                                📜 تم توثيق ملكيتك بشكل نهائي. يمكنك تحميل المستندات الرسمية.
                              </p>
                            </div>
                          </div>
                        )}

                        {bookingStatus === 'approved' && (
                          <div className="mt-4 space-y-3">
                            {receiptsMap[reservation.id]?.length > 0 ? (
                              <div className="space-y-3">
                                {receiptsMap[reservation.id].map(receipt => (
                                  <div key={receipt.id} className="space-y-3">
                                    {receipt.status === 'rejected' && (
                                      <div className="mb-3">
                                        <ProgressTracker bookingStatus="approved" />
                                      </div>
                                    )}
                                    {receipt.status === 'pending' && (
                                      <div className="mb-3">
                                        <ProgressTracker bookingStatus="pending_verification" />
                                      </div>
                                    )}
                                    {receipt.status === 'verified' && (
                                      <div className="mb-3">
                                        <ProgressTracker bookingStatus="verified" />
                                      </div>
                                    )}

                                    <div
                                      className="p-3 rounded-xl flex items-center justify-between"
                                      style={{
                                        background: `${PaymentReceiptService.getStatusColor(receipt.status)}10`,
                                        border: `1px solid ${PaymentReceiptService.getStatusColor(receipt.status)}30`
                                      }}
                                    >
                                      <div className="flex-1">
                                        <span
                                          className="text-sm font-bold"
                                          style={{ color: PaymentReceiptService.getStatusColor(receipt.status) }}
                                        >
                                          {PaymentReceiptService.getStatusLabel(receipt.status)}
                                        </span>
                                        {receipt.status === 'rejected' && receipt.verification_notes && (
                                          <p className="text-xs mt-1" style={{ color: '#DC2626' }}>
                                            السبب: {receipt.verification_notes}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-xs" style={{ color: brandColors.text.secondary }}>
                                        {new Date(receipt.created_at).toLocaleDateString('ar-SA')}
                                      </span>
                                    </div>

                                    {receipt.status === 'rejected' && (
                                      <div className="mt-3 space-y-2">
                                        <div
                                          className="p-3 rounded-xl text-sm"
                                          style={{
                                            background: '#FEF3C7',
                                            border: '1px solid #FCD34D'
                                          }}
                                        >
                                          <p className="font-bold" style={{ color: '#92400E' }}>
                                            ⚠️ تنبيه
                                          </p>
                                          <p className="text-xs mt-1" style={{ color: '#92400E' }}>
                                            تم رفض إيصال الدفع. يرجى معالجة الملاحظات ورفع إيصال جديد.
                                          </p>
                                        </div>

                                        <button
                                          onClick={() => handleUploadReceipt(reservation)}
                                          className="w-full px-4 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                          style={{
                                            background: brandGradients.gold,
                                            boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
                                          }}
                                        >
                                          <Upload className="w-5 h-5" />
                                          رفع إيصال سداد جديد
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                <div className="mb-4">
                                  <ProgressTracker bookingStatus="approved" />
                                </div>

                                <div
                                  className="p-4 rounded-xl text-center animate-fade-in"
                                  style={{
                                    background: brandGradients.gold,
                                    boxShadow: '0 8px 25px rgba(212,175,55,0.25)',
                                  }}
                                >
                                  <p
                                    className="text-base font-semibold leading-relaxed"
                                    style={{
                                      color: 'white',
                                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                      fontFamily: 'Cairo, Noto Sans Arabic, sans-serif'
                                    }}
                                  >
                                    🌟 مبروك! تمت الموافقة على حجزك رسميًا — يمكنك الآن استكمال التملك برفع إيصال السداد.
                                  </p>
                                </div>

                                <button
                                  onClick={() => handleUploadReceipt(reservation)}
                                  className="w-full px-4 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                  style={{
                                    background: brandGradients.gold,
                                    boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
                                  }}
                                >
                                  <Upload className="w-5 h-5" />
                                  رفع إيصال السداد البنكي
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'farms' && (
          <div>
            <h2 className="text-3xl font-black mb-6" style={{ color: brandColors.text.primary }}>
              مزارعي
            </h2>

            {farms.length === 0 ? (
              <div className="text-center py-12">
                <Trees className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: brandColors.text.secondary }} />
                <p className="text-xl" style={{ color: brandColors.text.secondary }}>
                  لا توجد مزارع حالياً
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farms.map((farm) => (
                  <div
                    key={farm.farm_id}
                    className="rounded-2xl p-6 transition-all hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                      border: `2px solid ${brandColors.primary.gold}30`,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Trees className="w-12 h-12 mb-4" style={{ color: brandColors.primary.gold }} />

                    <h3 className="text-2xl font-black mb-4" style={{ color: brandColors.text.primary }}>
                      {farm.farm_name}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span style={{ color: brandColors.text.secondary }}>نوع المزرعة</span>
                        <span className="font-bold" style={{ color: brandColors.text.primary }}>
                          {farm.farm_type}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span style={{ color: brandColors.text.secondary }}>الأشجار المملوكة</span>
                        <span className="text-2xl font-black" style={{ color: brandColors.accent.olive }}>
                          {farm.total_trees.toLocaleString('ar-SA')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span style={{ color: brandColors.text.secondary }}>قيمة الاستثمار</span>
                        <span className="text-xl font-black" style={{ color: brandColors.primary.gold }}>
                          {farm.total_amount.toLocaleString('ar-SA')} ر.س
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div>
            <h2 className="text-3xl font-black mb-6" style={{ color: brandColors.text.primary }}>
              شهادات التملك
            </h2>

            {certificates.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: brandColors.text.secondary }} />
                <p className="text-xl mb-2" style={{ color: brandColors.text.secondary }}>
                  لا توجد شهادات حالياً
                </p>
                <p className="text-sm" style={{ color: brandColors.text.secondary }}>
                  سيتم إصدار الشهادات فور اعتماد الحجوزات
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert: any) => (
                  <div
                    key={cert.id}
                    className="rounded-2xl p-6 transform transition-all hover:scale-[1.02]"
                    style={{
                      background: brandGradients.gold,
                      border: `2px solid ${brandColors.primary.gold}`,
                      boxShadow: '0 8px 30px rgba(212,175,55,0.2)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Award className="w-10 h-10" style={{ color: brandColors.primary.gold }} />
                        <div>
                          <p className="text-sm font-bold" style={{ color: brandColors.text.secondary }}>
                            رقم الشهادة
                          </p>
                          <p className="text-xl font-black" style={{ color: brandColors.text.primary }}>
                            {cert.certificate_code}
                          </p>
                        </div>
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: brandColors.status.success,
                          color: 'white'
                        }}
                      >
                        موثق
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                          المزرعة
                        </span>
                        <span className="font-bold" style={{ color: brandColors.text.primary }}>
                          {cert.farm_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                          عدد الأشجار
                        </span>
                        <span className="font-bold" style={{ color: brandColors.text.primary }}>
                          {cert.reserved_trees.toLocaleString('ar-SA')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                          القيمة الإجمالية
                        </span>
                        <span className="font-bold" style={{ color: brandColors.primary.gold }}>
                          {parseFloat(cert.total_price).toLocaleString('ar-SA')} ر.س
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                          تاريخ الإصدار
                        </span>
                        <span className="text-sm font-bold" style={{ color: brandColors.text.primary }}>
                          {new Date(cert.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCertificate(cert);
                        setCertificateModalOpen(true);
                      }}
                      className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                      style={{ background: brandColors.primary.gold }}
                    >
                      <Award className="w-5 h-5" />
                      عرض الشهادة
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'financials' && stats && (
          <div>
            <h2 className="text-3xl font-black mb-6" style={{ color: brandColors.text.primary }}>
              حسابي المالي
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="rounded-2xl p-8"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                  border: `2px solid rgba(168,85,247,0.3)`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <Wallet className="w-12 h-12 mb-4 text-purple-500" />
                <p className="text-sm mb-2" style={{ color: brandColors.text.secondary }}>
                  إجمالي الاستثمار
                </p>
                <p className="text-5xl font-black text-purple-500 mb-4">
                  {stats.totalAmount.toLocaleString('ar-SA')}
                </p>
                <p className="text-sm" style={{ color: brandColors.text.secondary }}>
                  ريال سعودي
                </p>
              </div>

              <div
                className="rounded-2xl p-8"
                style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                  border: `2px solid rgba(16,185,129,0.3)`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <Award className="w-12 h-12 mb-4 text-green-500" />
                <p className="text-sm mb-2" style={{ color: brandColors.text.secondary }}>
                  إجمالي الأشجار
                </p>
                <p className="text-5xl font-black text-green-500 mb-4">
                  {stats.totalTrees.toLocaleString('ar-SA')}
                </p>
                <p className="text-sm" style={{ color: brandColors.text.secondary }}>
                  شجرة
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <h2 className="text-3xl font-black mb-6" style={{ color: brandColors.text.primary }}>
              الجدول الزمني
            </h2>

            {timeline.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: brandColors.text.secondary }} />
                <p className="text-xl" style={{ color: brandColors.text.secondary }}>
                  لا توجد أحداث
                </p>
              </div>
            ) : (
              <div className="relative">
                <div
                  className="absolute right-6 top-0 bottom-0 w-0.5"
                  style={{ background: brandColors.primary.gold + '30' }}
                />

                <div className="space-y-6">
                  {timeline.map((event) => (
                    <div key={event.id} className="relative pr-16">
                      <div
                        className="absolute right-0 w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: brandGradients.gold }}
                      >
                        <span className="text-2xl">{event.icon}</span>
                      </div>

                      <div
                        className="rounded-2xl p-6"
                        style={{
                          background: 'white',
                          border: `2px solid ${brandColors.primary.gold}30`,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        }}
                      >
                        <p className="text-sm mb-2" style={{ color: brandColors.text.secondary }}>
                          {new Date(event.date).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <h3 className="text-xl font-black mb-2" style={{ color: brandColors.text.primary }}>
                          {event.title}
                        </h3>
                        <p style={{ color: brandColors.text.secondary }}>
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-3xl font-black mb-6" style={{ color: brandColors.text.primary }}>
              الإشعارات
            </h2>

            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: brandColors.text.secondary }} />
                <p className="text-xl" style={{ color: brandColors.text.secondary }}>
                  لا توجد إشعارات جديدة
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notification => {
                  const isRejection = notification.type === 'receipt_rejected';
                  const relatedReservation = reservations.find(r => r.id === notification.reservation_id);

                  return (
                    <div
                      key={notification.id}
                      className="p-4 rounded-xl"
                      style={{
                        background: isRejection ? '#FEF2F2' : '#F0FDF4',
                        border: `2px solid ${isRejection ? '#FEE2E2' : '#D1FAE5'}`
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg" style={{ background: isRejection ? '#DC2626' : brandColors.primary }}>
                          {isRejection ? (
                            <XCircle className="h-5 w-5 text-white" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-base" style={{ color: isRejection ? '#991B1B' : brandColors.text.primary }}>
                            {notification.title_ar}
                          </h3>
                          <p className="text-sm mt-1 leading-relaxed" style={{ color: isRejection ? '#7F1D1D' : brandColors.text.secondary }}>
                            {notification.message_ar}
                          </p>
                          <p className="text-xs mt-2" style={{ color: brandColors.text.secondary }}>
                            {new Date(notification.created_at).toLocaleString('ar-SA')}
                          </p>

                          {isRejection && relatedReservation && (
                            <button
                              onClick={() => {
                                setSelectedReservation(relatedReservation);
                                setUploadModalOpen(true);
                              }}
                              className="mt-3 px-4 py-2 rounded-lg font-bold text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
                              style={{ background: brandColors.primary.gold }}
                            >
                              <Upload className="w-4 h-4" />
                              رفع إيصال جديد
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {uploadModalOpen && selectedReservation && (
        <PaymentReceiptUploadModal
          reservationId={selectedReservation.id}
          reservationAmount={selectedReservation.total_amount}
          farmName={selectedReservation.farm_name}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedReservation(null);
          }}
          onSuccess={handleUploadSuccess}
        />
      )}

      {certificateModalOpen && selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          isOpen={certificateModalOpen}
          onClose={() => {
            setCertificateModalOpen(false);
            setSelectedCertificate(null);
          }}
        />
      )}

      {/* Bottom Navigation Bar removed - ready for new development */}
    </div>
  );
}
