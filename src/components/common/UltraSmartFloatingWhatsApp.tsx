import { useState, useEffect } from 'react';
import { MessageCircle, X, Sparkles, Zap, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { SmartWhatsAppStaffService, Department, Staff, UserContext } from '../../services/smartWhatsAppStaffService';
import { brandColors, brandGradients } from '../../modules/finance/styles/brandColors';

interface UltraSmartFloatingWhatsAppProps {
  context: UserContext;
}

export function UltraSmartFloatingWhatsApp({ context }: UltraSmartFloatingWhatsAppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [smartRouting, setSmartRouting] = useState<{
    department?: Department;
    staff?: Staff;
    message?: string;
  }>({});
  const [showTooltip, setShowTooltip] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [context.userType]);

  const loadInitialData = async () => {
    // 1. جلب الأقسام حسب نوع المستخدم
    const depts = await SmartWhatsAppStaffService.getDepartmentsByUserType(context.userType);
    setDepartments(depts);

    // 2. جلب التوجيه الذكي
    const routing = await SmartWhatsAppStaffService.getSmartRouting(context);
    setSmartRouting(routing);

    // 3. إذا كان هناك قسم موصى به، جلب الموظفين المتاحين
    if (routing.department) {
      const staff = await SmartWhatsAppStaffService.getAvailableStaff(routing.department.id);
      setAvailableStaff(staff);
    }
  };

  const handleDepartmentSelect = async (dept: Department) => {
    setLoading(true);
    setSelectedDepartment(dept);
    const staff = await SmartWhatsAppStaffService.getAvailableStaff(dept.id);
    setAvailableStaff(staff);
    setLoading(false);
  };

  const handleStaffSelect = async (staff: Staff) => {
    await SmartWhatsAppStaffService.openWhatsApp(
      context,
      selectedDepartment || undefined,
      staff
    );
    setIsOpen(false);
  };

  const handleQuickConnect = async () => {
    if (smartRouting.staff) {
      await SmartWhatsAppStaffService.openWhatsApp(
        context,
        smartRouting.department,
        smartRouting.staff
      );
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const getIcon = (iconName: string) => {
    // Dynamic icon loading would go here
    return <MessageCircle className="h-5 w-5" />;
  };

  return (
    <>
      {/* Main Floating Button */}
      <div
        className="fixed bottom-20 left-4 sm:bottom-24 sm:left-6 z-40"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {!isOpen && (
          <button
            onClick={handleQuickConnect}
            className="relative group"
          >
            {/* Outer Glow */}
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-75 animate-pulse"
              style={{ background: brandGradients.olive }}
            />

            {/* Main Button */}
            <div
              className="relative w-[70px] h-[70px] rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-110 cursor-pointer border-4 border-white/50"
              style={{ background: brandGradients.olive }}
            >
              <MessageCircle className="h-8 w-8 text-white" strokeWidth={2.5} />

              {/* Pulse Ring */}
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{
                  border: `3px solid ${brandColors.primary.gold}`,
                  animationDuration: '2s',
                }}
              />

              {/* Sparkle */}
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-pulse" />

              {/* Online Badge */}
              {smartRouting.staff && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
          </button>
        )}

        {/* Enhanced Tooltip */}
        {showTooltip && !isOpen && (
          <div
            className="absolute bottom-24 left-0 p-4 rounded-2xl shadow-2xl whitespace-nowrap animate-fade-in border-2"
            style={{
              background: 'linear-gradient(135deg, rgba(85, 107, 47, 0.98) 0%, rgba(107, 142, 35, 0.98) 100%)',
              borderColor: brandColors.primary.gold,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4" style={{ color: brandColors.primary.gold }} />
                <span className="text-sm font-black">اتصال مباشر فوري</span>
              </div>
              <div className="text-xs opacity-90">
                {smartRouting.staff
                  ? `تواصل مع ${smartRouting.staff.job_title}`
                  : 'اختر المساعدة المناسبة'}
              </div>
              {smartRouting.staff && (
                <div className="flex items-center gap-1 mt-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-green-300" />
                  <span className="text-green-200">متاح الآن</span>
                </div>
              )}
            </div>
            <div
              className="absolute -bottom-2 left-6 w-4 h-4 transform rotate-45"
              style={{ background: 'rgba(85, 107, 47, 0.98)' }}
            />
          </div>
        )}
      </div>

      {/* Smart Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:justify-start md:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full md:w-[450px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl animate-slide-up md:animate-scale-in border-t-4 md:border-4"
            style={{ borderColor: brandColors.primary.gold }}
          >
            {/* Header */}
            <div
              className="relative overflow-hidden p-6 rounded-t-3xl md:rounded-t-2xl"
              style={{ background: brandGradients.olive }}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/40"
                    style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <MessageCircle className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-2xl font-black">كيف نساعدك؟</h3>
                    <p className="text-sm text-green-100 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      رد فوري خلال دقائق
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Smart Recommendation */}
            {smartRouting.staff && !selectedDepartment && (
              <div className="p-4">
                <div
                  className="p-4 rounded-2xl border-2 cursor-pointer hover:scale-105 transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${brandColors.primary.gold}15 0%, ${brandColors.primary.olive}15 100%)`,
                    borderColor: brandColors.primary.gold,
                  }}
                  onClick={() => handleStaffSelect(smartRouting.staff!)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5" style={{ color: brandColors.primary.gold }} />
                    <span className="text-sm font-black" style={{ color: brandColors.primary.olive }}>
                      موصى به لك
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg"
                      style={{ background: brandGradients.olive }}
                    >
                      {smartRouting.staff.full_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-gray-900">{smartRouting.staff.full_name}</div>
                      <div className="text-sm text-gray-600">{smartRouting.staff.job_title}</div>
                      {smartRouting.department && (
                        <div className="text-xs font-bold" style={{ color: brandColors.primary.olive }}>
                          {smartRouting.department.name_ar}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5" style={{ color: brandColors.primary.gold }} />
                  </div>
                </div>
              </div>
            )}

            {/* Departments List */}
            {!selectedDepartment && (
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                <h4 className="text-sm font-black text-gray-500 mb-3">أو اختر القسم المناسب:</h4>
                {departments.map((dept, index) => {
                  const Icon = getIcon(dept.icon);
                  return (
                    <button
                      key={dept.id}
                      onClick={() => handleDepartmentSelect(dept)}
                      className="w-full group relative overflow-hidden bg-white hover:bg-gradient-to-r rounded-2xl p-4 transition-all duration-300 hover:scale-102 hover:shadow-xl border-2 border-gray-100"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        borderColor: dept.color + '20',
                      }}
                    >
                      <div className="relative flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                          style={{ background: dept.color }}
                        >
                          {Icon}
                        </div>

                        <div className="flex-1 text-right">
                          <div className="font-black text-gray-900 group-hover:text-gray-900">
                            {dept.name_ar}
                          </div>
                          {dept.description_ar && (
                            <div className="text-xs text-gray-600 mt-1">
                              {dept.description_ar}
                            </div>
                          )}
                        </div>

                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-700 transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Staff List */}
            {selectedDepartment && (
              <div className="p-4">
                <button
                  onClick={() => {
                    setSelectedDepartment(null);
                    setAvailableStaff([]);
                  }}
                  className="flex items-center gap-2 text-sm font-bold mb-4 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: brandColors.primary.olive }}
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  رجوع
                </button>

                <h4 className="text-lg font-black mb-3" style={{ color: selectedDepartment.color }}>
                  {selectedDepartment.name_ar}
                </h4>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto"
                        style={{ borderColor: selectedDepartment.color }}
                      />
                    </div>
                  ) : availableStaff.length > 0 ? (
                    availableStaff.map((staff) => (
                      <button
                        key={staff.id}
                        onClick={() => handleStaffSelect(staff)}
                        className="w-full p-4 rounded-xl border-2 hover:shadow-lg transition-all hover:scale-102"
                        style={{
                          background: `${selectedDepartment.color}05`,
                          borderColor: `${selectedDepartment.color}30`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg"
                            style={{ background: selectedDepartment.color }}
                          >
                            {staff.full_name.charAt(0)}
                          </div>
                          <div className="flex-1 text-right">
                            <div className="font-black text-gray-900">{staff.full_name}</div>
                            <div className="text-sm text-gray-600">{staff.job_title}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                              <span className="text-xs text-green-600 font-bold">متاح الآن</span>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5" style={{ color: selectedDepartment.color }} />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>لا يوجد موظفون متاحون حالياً</p>
                      <p className="text-sm mt-2">سنرد عليك في أقرب وقت</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div
              className="p-4 border-t-2 border-gray-100 rounded-b-3xl md:rounded-b-2xl"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(85, 107, 47, 0.05))' }}
            >
              <div className="text-center text-xs text-gray-600 flex items-center justify-center gap-2">
                <Sparkles className="h-3 w-3" style={{ color: brandColors.primary.gold }} />
                <span>نظام التواصل الذكي - رد فوري ومباشر</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </>
  );
}
