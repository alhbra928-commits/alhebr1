import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Plus,
  Minus,
  CheckCircle2,
  Home,
  User,
  Phone,
  ShoppingCart,
  Sparkles,
  Award,
  X,
  TreeDeciduous,
  TrendingUp,
  Info,
  AlertCircle,
  Calculator,
  Edit3,
  Leaf,
  Star,
  ChevronDown
} from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { FarmDetailService, FarmVariety, CreateReservationData } from '../services/farmDetailService';
import { FarmTypeLoader } from '../../../components/common/FarmTypeLoader';

interface TemporaryBookingPageProps {
  farmId: string;
  farmName: string;
  farmType: 'palm' | 'olive';
  onBack: () => void;
  onSuccess: () => void;
  onGoHome: () => void;
  onGoToInvestor: () => void;
}

interface VarietySelection {
  variety: FarmVariety;
  quantity: number;
}

const oliveTheme = {
  darkest: '#3D4F2F',
  dark: '#556B2F',
  primary: '#6B8E23',
  light: '#8BA644',
  lighter: '#A4BE7B',
  lightest: '#D4E7C5',
  cream: '#F5F7F0',
  accent: '#B8860B',
};

export function TemporaryBookingPage({
  farmId,
  farmName,
  farmType,
  onBack,
  onSuccess,
  onGoHome,
  onGoToInvestor
}: TemporaryBookingPageProps) {
  const [varieties, setVarieties] = useState<FarmVariety[]>([]);
  const [selections, setSelections] = useState<Map<string, VarietySelection>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [investorName, setInvestorName] = useState('');
  const [investorPhone, setInvestorPhone] = useState('');
  const [expandedVariety, setExpandedVariety] = useState<string | null>(null);

  const normalizedFarmType = farmType?.toLowerCase() || '';
  const isPalm = normalizedFarmType === 'palm' || normalizedFarmType === 'نخيل';

  const getFarmIcon = () => isPalm ? '🌴' : '🫒';
  const getFarmColor = () => isPalm ? brandColors.primary.gold : oliveTheme.primary;
  const getFarmGradient = () => isPalm
    ? `linear-gradient(135deg, ${brandColors.primary.gold}, ${brandColors.primary.goldDark})`
    : `linear-gradient(135deg, ${oliveTheme.dark}, ${oliveTheme.darkest})`;

  useEffect(() => {
    loadVarieties();
  }, [farmId]);

  const loadVarieties = async () => {
    const startTime = performance.now();
    console.log('[PERF] TemporaryBookingPage: Loading varieties');

    try {
      setLoading(true);
      const farmDetail = await FarmDetailService.getFarmById(farmId);
      if (farmDetail) {
        setVarieties(farmDetail.varieties);
      }
    } catch (error) {
      console.error('Error loading varieties:', error);
    } finally {
      setLoading(false);
      console.log(`[PERF] TemporaryBookingPage: TOTAL ${(performance.now() - startTime).toFixed(0)}ms`);
    }
  };

  const updateQuantity = (varietyId: string, quantity: number, variety: FarmVariety) => {
    const newSelections = new Map(selections);

    if (quantity <= 0) {
      newSelections.delete(varietyId);
    } else if (quantity > variety.available_quantity) {
      alert(`الحد الأقصى المتاح: ${variety.available_quantity} شجرة`);
      return;
    } else {
      newSelections.set(varietyId, { variety, quantity });
    }

    setSelections(newSelections);
  };

  const calculateTotal = () => {
    let total = 0;
    selections.forEach(({ variety, quantity }) => {
      total += variety.price_per_tree * quantity;
    });
    return total;
  };

  const calculateTotalTrees = () => {
    let total = 0;
    selections.forEach(({ quantity }) => {
      total += quantity;
    });
    return total;
  };

  const handleSubmit = async () => {
    if (selections.size === 0) {
      alert('يرجى اختيار صنف واحد على الأقل');
      return;
    }

    if (!investorName.trim()) {
      alert('يرجى إدخال الاسم الكامل');
      return;
    }

    if (!investorPhone.trim()) {
      alert('يرجى إدخال رقم الجوال');
      return;
    }

    const phoneRegex = /^(5\d{8}|05\d{8})$/;
    const cleanPhone = investorPhone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      alert('يرجى إدخال رقم جوال سعودي صحيح (يبدأ بـ 5 أو 05)');
      return;
    }

    try {
      setSubmitting(true);

      const varietiesArray = Array.from(selections.values());
      const reservationData: CreateReservationData = {
        farm_id: farmId,
        investor_name: investorName.trim(),
        investor_phone: cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone,
        varieties: varietiesArray.map(({ variety, quantity }) => ({
          variety_id: variety.id,
          tree_count: quantity,
          price_per_tree: variety.price_per_tree
        })),
        total_trees: calculateTotalTrees(),
        total_amount: calculateTotal()
      };

      await FarmDetailService.createReservation(reservationData);

      // Store phone for automatic login
      const phoneForLogin = cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone;
      sessionStorage.setItem('pending_investor_phone', phoneForLogin);

      setShowSuccess(true);
    } catch (error: any) {
      console.error('Error submitting reservation:', error);
      alert(error.message || 'حدث خطأ أثناء الحجز، يرجى المحاولة مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <FarmTypeLoader
        type={isPalm ? 'palm' : 'olive'}
        message={isPalm ? 'جاري تحميل أصناف النخيل...' : 'جاري تحميل أصناف الزيتون...'}
      />
    );
  }

  if (showSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-3 sm:p-4"
        style={{
          background: `radial-gradient(circle at center, ${oliveTheme.lightest}, ${oliveTheme.cream})`
        }}
        dir="rtl"
      >
        <div
          className="max-w-2xl w-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-12 text-center relative overflow-hidden"
          style={{
            background: 'white',
            boxShadow: `0 40px 100px ${oliveTheme.primary}30`,
            border: `2px sm:3px solid ${oliveTheme.lighter}`
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-2 sm:h-3 rounded-t-2xl sm:rounded-t-3xl"
            style={{ background: getFarmGradient() }}
          />

          <div className="absolute top-4 sm:top-8 right-4 sm:right-8 opacity-5 sm:opacity-10">
            <Leaf className="w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32" style={{ color: oliveTheme.primary }} />
          </div>
          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 opacity-5 sm:opacity-10">
            <Leaf className="w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 transform rotate-180" style={{ color: oliveTheme.primary }} />
          </div>

          <div
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full mx-auto mb-4 sm:mb-5 md:mb-6 flex items-center justify-center relative shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${oliveTheme.light}, ${oliveTheme.primary})`
            }}
          >
            <CheckCircle2 className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 text-white" strokeWidth={3} />
            <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3">
              <Star className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-yellow-400 animate-pulse" fill="currentColor" />
            </div>
            <div className="absolute -bottom-2 sm:-bottom-3 -left-2 sm:-left-3">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>

          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 relative z-10 leading-tight px-2"
            style={{ color: oliveTheme.darkest }}
          >
            تم تسجيل حجزك بنجاح!
          </h2>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-5 sm:mb-6 md:mb-8 text-gray-700 relative z-10 px-2">
            سيتم التواصل معك قريباً لإكمال إجراءات الحجز
          </p>

          <div
            className="p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl mb-5 sm:mb-6 md:mb-8 relative overflow-hidden z-10"
            style={{
              background: `linear-gradient(135deg, ${oliveTheme.lightest}, white)`,
              border: `2px solid ${oliveTheme.lighter}`
            }}
          >
            <div className="absolute top-0 left-0 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 opacity-10 sm:opacity-20">
              <Leaf className="w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20" style={{ color: oliveTheme.primary }} />
            </div>
            <Award className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 md:mb-4" style={{ color: oliveTheme.primary }} />
            <p className="font-black text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3" style={{ color: oliveTheme.darkest }}>
              رقم جوالك هو مفتاح دخولك
            </p>
            <p className="text-gray-700 text-xs sm:text-sm md:text-base lg:text-lg px-2">
              استخدم رقم جوالك للدخول إلى لوحة المستثمر ومتابعة حجزك
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative z-10">
            <button
              onClick={onGoHome}
              className="flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-black text-base sm:text-lg text-white transition-all active:scale-95 sm:hover:scale-105 shadow-xl touch-manipulation"
              style={{
                background: `linear-gradient(135deg, ${oliveTheme.dark}, ${oliveTheme.darkest})`
              }}
            >
              <Home className="h-5 w-5 sm:h-6 sm:w-6" />
              العودة للرئيسية
            </button>

            <button
              onClick={() => {
                // Mark that we should auto-login
                sessionStorage.setItem('should_auto_login', 'true');
                onGoToInvestor();
              }}
              className="flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-black text-base sm:text-lg transition-all active:scale-95 sm:hover:scale-105 shadow-xl touch-manipulation"
              style={{
                background: 'white',
                color: oliveTheme.primary,
                border: `2px sm:3px solid ${oliveTheme.primary}`
              }}
            >
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
              لوحة المستثمر
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-8"
      style={{
        background: `radial-gradient(circle at top left, ${oliveTheme.lightest}, ${oliveTheme.cream})`
      }}
      dir="rtl"
    >
      <div
        className="sticky top-0 z-50 backdrop-blur-2xl border-b"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderColor: `${oliveTheme.lighter}50`,
          boxShadow: `0 4px 24px ${oliveTheme.primary}10`
        }}
      >
        <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs md:text-sm lg:text-base transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
              style={{
                background: 'white',
                color: oliveTheme.primary,
                boxShadow: `0 2px 8px ${oliveTheme.primary}12`,
                border: `1.5px solid ${oliveTheme.lighter}`
              }}
            >
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span>رجوع</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center text-lg sm:text-xl md:text-2xl lg:text-3xl relative flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${oliveTheme.light}, ${oliveTheme.primary})`,
                  boxShadow: `0 4px 12px ${oliveTheme.primary}20`
                }}
              >
                {getFarmIcon()}
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full animate-pulse" style={{ background: oliveTheme.accent }} />
              </div>
              <div className="text-right min-w-0 flex-1">
                <h3 className="font-black text-[11px] sm:text-xs md:text-sm lg:text-base xl:text-lg leading-tight truncate" style={{ color: oliveTheme.darkest }}>
                  {farmName}
                </h3>
                <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold" style={{ color: oliveTheme.primary }}>
                  حجز مؤقت سريع
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-6 lg:py-8">
        <div
          className="rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 mb-3 sm:mb-4 md:mb-6 lg:mb-8 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${oliveTheme.dark}, ${oliveTheme.darkest})`,
            boxShadow: `0 12px 30px ${oliveTheme.darkest}30`
          }}
        >
          <div className="absolute -top-10 -right-10 w-32 sm:w-40 md:w-60 h-32 sm:h-40 md:h-60 rounded-full opacity-5 sm:opacity-8 md:opacity-10" style={{ background: oliveTheme.lightest }} />
          <div className="absolute -bottom-10 -left-10 w-32 sm:w-40 md:w-60 h-32 sm:h-40 md:h-60 rounded-full opacity-5 sm:opacity-8 md:opacity-10" style={{ background: oliveTheme.lightest }} />
          <div className="absolute top-4 sm:top-6 md:top-10 left-4 sm:left-6 md:left-10 opacity-5 sm:opacity-10 md:opacity-15">
            <Leaf className="w-10 sm:w-14 md:w-20 lg:w-24 h-10 sm:h-14 md:h-20 lg:h-24 text-white animate-pulse" />
          </div>
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-10 right-4 sm:right-6 md:right-10 opacity-5 sm:opacity-10 md:opacity-15">
            <TreeDeciduous className="w-10 sm:w-14 md:w-20 lg:w-24 h-10 sm:h-14 md:h-20 lg:h-24 text-white animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black mb-2 sm:mb-3 md:mb-4 text-white leading-tight px-1">
              احجز أشجارك الآن
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white opacity-90 mb-3 sm:mb-4 md:mb-5 lg:mb-6 px-2">
              اختر الأصناف والكميات المطلوبة واحصل على حجزك الفوري
            </p>
            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 md:gap-3 px-3 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg"
              style={{
                background: 'white',
                border: `2px sm:2.5px md:3px solid ${oliveTheme.accent}`
              }}
            >
              <TreeDeciduous className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ color: oliveTheme.primary }} />
              <span className="font-black text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl" style={{ color: oliveTheme.darkest }}>
                {varieties.length} {varieties.length === 1 ? 'صنف متميز' : 'أصناف متميزة'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div
              className="rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden"
              style={{
                background: 'white',
                border: `1.5px sm:2px md:2.5px lg:3px solid ${oliveTheme.lighter}`,
                boxShadow: `0 8px 24px ${oliveTheme.primary}10`
              }}
            >
              <div
                className="p-8 border-b"
                style={{
                  background: `linear-gradient(to left, ${oliveTheme.lightest}, white)`,
                  borderColor: `${oliveTheme.lighter}`
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${oliveTheme.light}, ${oliveTheme.primary})` }}
                  >
                    <ShoppingCart className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black mb-1" style={{ color: oliveTheme.darkest }}>
                      اختر الأصناف والكميات
                    </h2>
                    <p className="text-gray-600 font-bold">حدد عدد الأشجار لكل صنف</p>
                  </div>
                </div>
              </div>

              <div className="p-2 sm:p-3 md:p-5 lg:p-8 space-y-2 sm:space-y-3 md:space-y-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
                {varieties.map((variety, index) => {
                  const selection = selections.get(variety.id);
                  const quantity = selection?.quantity || 0;
                  const subtotal = quantity * variety.price_per_tree;
                  const isExpanded = expandedVariety === variety.id;

                  return (
                    <div
                      key={variety.id}
                      className="rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 relative overflow-hidden"
                      style={{
                        background: quantity > 0
                          ? `linear-gradient(135deg, ${oliveTheme.lightest}, white)`
                          : 'linear-gradient(135deg, #fafafa, #ffffff)',
                        border: quantity > 0
                          ? `2px sm:2.5px md:3px solid ${oliveTheme.primary}`
                          : '1.5px sm:2px solid #e5e7eb',
                        boxShadow: quantity > 0
                          ? `0 8px 20px ${oliveTheme.primary}20`
                          : '0 2px 6px rgba(0,0,0,0.04)'
                      }}
                    >
                      {quantity > 0 && (
                        <>
                          <div
                            className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 md:h-2 rounded-t-lg sm:rounded-t-xl"
                            style={{ background: `linear-gradient(90deg, ${oliveTheme.light}, ${oliveTheme.accent})` }}
                          />
                          <div className="absolute top-1.5 sm:top-2 md:top-3 left-1.5 sm:left-2 md:left-3">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-pulse" style={{ color: oliveTheme.accent }} fill="currentColor" />
                          </div>
                        </>
                      )}

                      {/* Header - يظهر دائماً */}
                      <button
                        onClick={() => setExpandedVariety(isExpanded ? null : variety.id)}
                        className="w-full p-2.5 sm:p-3 md:p-4 flex items-center justify-between gap-2 touch-manipulation"
                      >
                        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0">
                          <div
                            className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm md:text-base font-black shadow-md flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${oliveTheme.light}, ${oliveTheme.primary})`,
                              color: 'white'
                            }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-black leading-tight truncate" style={{ color: oliveTheme.darkest }}>
                              {variety.variety_name}
                            </h3>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                              <span className="text-[10px] sm:text-xs font-bold text-green-700">{variety.available_quantity} متاح</span>
                              <span className="text-[10px] sm:text-xs font-bold text-gray-400">•</span>
                              <span className="text-[10px] sm:text-xs font-bold" style={{ color: oliveTheme.primary }}>
                                {variety.price_per_tree.toLocaleString()} ر.س
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                          style={{ color: oliveTheme.primary }}
                        />
                      </button>

                      {/* المحتوى المنسدل - يظهر عند التوسع على الجوال، دائماً على Desktop */}
                      <div className={`${isExpanded ? 'block' : 'hidden lg:block'} px-2.5 sm:px-3 md:px-4 pb-2.5 sm:pb-3 md:pb-4`}>
                        {/* أزرار الكمية */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-2 sm:pt-3 border-t" style={{ borderColor: quantity > 0 ? oliveTheme.lighter : '#f3f4f6' }}>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xs sm:text-sm md:text-base font-black text-gray-800 whitespace-nowrap">الكمية:</span>
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
                              <button
                                onClick={() => updateQuantity(variety.id, quantity - 1, variety)}
                                disabled={quantity <= 0}
                                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-white transition-all active:scale-95 sm:hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed shadow-md touch-manipulation"
                                style={{ background: `linear-gradient(135deg, ${oliveTheme.light}, ${oliveTheme.primary})` }}
                              >
                                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                              </button>

                              <input
                                type="number"
                                min="0"
                                max={variety.available_quantity}
                                value={quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  updateQuantity(variety.id, val, variety);
                                }}
                                className="w-14 sm:w-16 md:w-20 h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl text-center font-black text-sm sm:text-base md:text-lg border-2 focus:outline-none transition-all shadow-inner"
                                style={{
                                  borderColor: quantity > 0 ? oliveTheme.primary : '#d1d5db',
                                  color: oliveTheme.darkest,
                                  background: quantity > 0 ? 'white' : '#f9fafb'
                                }}
                              />

                              <button
                                onClick={() => updateQuantity(variety.id, quantity + 1, variety)}
                                disabled={quantity >= variety.available_quantity}
                                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-white transition-all active:scale-95 sm:hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed shadow-md touch-manipulation"
                                style={{ background: `linear-gradient(135deg, ${oliveTheme.light}, ${oliveTheme.primary})` }}
                              >
                                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                              </button>
                            </div>
                          </div>

                          {quantity > 0 && (
                            <div className="text-center sm:text-right bg-gradient-to-r from-transparent to-gray-50 rounded-lg p-2 sm:p-0 sm:bg-none">
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 flex items-center justify-center sm:justify-end gap-1">
                                <Calculator className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                المجموع
                              </p>
                              <p className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: oliveTheme.primary }}>
                                {subtotal.toLocaleString()}
                                <span className="text-xs sm:text-sm md:text-base mr-1">ر.س</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {variety.available_quantity < 10 && (
                        <div
                          className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                            border: '1.5px sm:2px solid #FCD34D'
                          }}
                        >
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-700 flex-shrink-0" />
                          <span className="text-amber-900 text-xs sm:text-sm md:text-base">
                            ⚠️ كمية محدودة! متبقي {variety.available_quantity} فقط
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {varieties.length === 0 && (
                  <div className="text-center py-8 sm:py-12 md:py-16">
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 sm:mb-4 md:mb-5 flex items-center justify-center"
                      style={{ background: oliveTheme.lightest }}
                    >
                      <Info className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" style={{ color: oliveTheme.primary }} />
                    </div>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-gray-600">لا توجد أصناف متاحة حالياً</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28">
              {selections.size > 0 ? (
                <div
                  className="rounded-2xl sm:rounded-3xl overflow-hidden"
                  style={{
                    background: 'white',
                    border: `2px sm:3px solid ${oliveTheme.primary}`,
                    boxShadow: `0 24px 60px ${oliveTheme.primary}30`
                  }}
                >
                  <div
                    className="p-4 sm:p-5 md:p-6 text-center relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${oliveTheme.dark}, ${oliveTheme.darkest})` }}
                  >
                    <div className="absolute top-0 right-0 opacity-10 sm:opacity-20">
                      <Leaf className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 text-white" />
                    </div>
                    <Award className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 text-white relative z-10" />
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-0.5 sm:mb-1 relative z-10">
                      ملخص الطلب
                    </h3>
                    <p className="text-white opacity-90 relative z-10 font-bold text-xs sm:text-sm">
                      مراجعة وإتمام الحجز
                    </p>
                  </div>

                  <div className="p-2.5 sm:p-3 md:p-4 lg:p-5 space-y-2.5 sm:space-y-3 md:space-y-4">
                    <div
                      className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${oliveTheme.lightest}, white)`,
                        border: `1.5px sm:2px solid ${oliveTheme.lighter}`
                      }}
                    >
                      <div className="flex justify-between items-center mb-1.5 sm:mb-2 md:mb-3 pb-1.5 sm:pb-2 md:pb-3 border-b" style={{ borderColor: oliveTheme.lighter }}>
                        <span className="text-gray-700 font-black text-[10px] sm:text-xs md:text-sm">إجمالي الأشجار</span>
                        <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-black" style={{ color: oliveTheme.primary }}>
                          {calculateTotalTrees()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-black text-[10px] sm:text-xs md:text-sm">المبلغ الإجمالي</span>
                        <div className="text-right">
                          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-black block" style={{ color: oliveTheme.darkest }}>
                            {calculateTotal().toLocaleString()}
                          </span>
                          <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 font-bold">ريال سعودي</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-1.5">
                        <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" style={{ color: oliveTheme.primary }} />
                        <h3 className="text-sm sm:text-base md:text-lg font-black" style={{ color: oliveTheme.darkest }}>
                          أدخل بياناتك
                        </h3>
                      </div>

                      <div>
                        <label className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 font-black text-gray-700 text-[10px] sm:text-xs md:text-sm">
                          <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" style={{ color: oliveTheme.primary }} />
                          الاسم الكامل *
                        </label>
                        <input
                          type="text"
                          value={investorName}
                          onChange={(e) => setInvestorName(e.target.value)}
                          placeholder="أدخل اسمك الكامل"
                          className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl border-2 focus:outline-none transition-all font-bold text-xs sm:text-sm md:text-base shadow-inner"
                          style={{
                            borderColor: investorName ? oliveTheme.primary : '#d1d5db',
                            background: investorName ? oliveTheme.cream : 'white'
                          }}
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 font-black text-gray-700 text-[10px] sm:text-xs md:text-sm">
                          <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" style={{ color: oliveTheme.primary }} />
                          رقم الجوال *
                        </label>
                        <div className="flex gap-1.5 sm:gap-2">
                          <div
                            className="px-2 sm:px-2.5 md:px-3 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm md:text-base flex items-center shadow-inner flex-shrink-0"
                            style={{
                              background: oliveTheme.lightest,
                              color: oliveTheme.darkest,
                              border: `1.5px sm:2px solid ${oliveTheme.lighter}`
                            }}
                          >
                            +966
                          </div>
                          <input
                            type="tel"
                            value={investorPhone}
                            onChange={(e) => setInvestorPhone(e.target.value)}
                            placeholder="5xxxxxxxx"
                            className="flex-1 min-w-0 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl border-2 focus:outline-none transition-all font-bold text-xs sm:text-sm md:text-base shadow-inner"
                            style={{
                              borderColor: investorPhone ? oliveTheme.primary : '#d1d5db',
                              background: investorPhone ? oliveTheme.cream : 'white'
                            }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={submitting || !investorName || !investorPhone}
                        className="w-full py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-black text-base sm:text-lg text-white transition-all active:scale-95 sm:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xl mt-3 sm:mt-4 touch-manipulation"
                        style={{
                          background: `linear-gradient(135deg, ${oliveTheme.light}, ${oliveTheme.primary})`
                        }}
                      >
                        {submitting ? (
                          <>
                            <SimpleLoader size="sm" color="#FFFFFF" />
                            <span className="mr-1.5 sm:mr-2">جاري التأكيد...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                            تأكيد الحجز الآن
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 text-center"
                  style={{
                    background: 'white',
                    border: `2px sm:3px dashed ${oliveTheme.lighter}`,
                    boxShadow: `0 12px 32px ${oliveTheme.primary}10`
                  }}
                >
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full mx-auto mb-4 sm:mb-5 md:mb-6 flex items-center justify-center"
                    style={{ background: oliveTheme.lightest }}
                  >
                    <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" style={{ color: oliveTheme.primary }} />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black mb-2 sm:mb-3 px-2" style={{ color: oliveTheme.darkest }}>
                    ابدأ باختيار الأصناف
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg px-2">
                    حدد الكميات المطلوبة من الأصناف لعرض الملخص
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
