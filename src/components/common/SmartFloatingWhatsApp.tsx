import { useState, useEffect } from 'react';
import { MessageCircle, X, Phone, DollarSign, Headphones, ShoppingCart, UserCog, Sparkles, Zap } from 'lucide-react';
import { floatingWhatsAppService, ContactNumber, UserContext } from '../../services/floatingWhatsAppService';

interface SmartFloatingWhatsAppProps {
  context: UserContext;
}

export function SmartFloatingWhatsApp({ context }: SmartFloatingWhatsAppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [contacts, setContacts] = useState<ContactNumber[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    loadSettings();
    loadContacts();
    initializeSession();

    return () => {
      floatingWhatsAppService.stopActivityTracking();
    };
  }, [context.userType]);

  const loadSettings = async () => {
    const data = await floatingWhatsAppService.getSettings();
    if (data) {
      setSettings(data);
      setIsEnabled(data.is_enabled);
    }
  };

  const loadContacts = async () => {
    const data = await floatingWhatsAppService.getContactNumbers(context.userType);
    setContacts(data);
  };

  const initializeSession = async () => {
    await floatingWhatsAppService.createOrUpdateSession({
      session_id: context.sessionId,
      user_type: context.userType,
      user_id: context.userId,
      user_name: context.userName,
      user_phone: context.userPhone,
      user_email: context.userEmail,
      current_page: context.currentPage,
      current_farm_code: context.currentFarmCode,
      current_farm_name: context.currentFarmName
    });
  };

  const handleContactClick = async (contact: ContactNumber) => {
    await floatingWhatsAppService.openWhatsApp(context, contact);
    setIsOpen(false);
  };

  const getIcon = (iconName?: string) => {
    const icons: Record<string, any> = {
      'ShoppingCart': ShoppingCart,
      'Headphones': Headphones,
      'DollarSign': DollarSign,
      'UserCog': UserCog,
      'MessageCircle': MessageCircle,
      'Phone': Phone
    };
    const IconComponent = icons[iconName || 'MessageCircle'];
    return <IconComponent className="h-5 w-5" />;
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* Decorative Connecting Line */}
      <div className="fixed bottom-20 right-[38px] w-1 h-8 z-30 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-[#D4AF37]/0 via-[#D4AF37]/30 to-[#556B2F]/20 rounded-full" />
      </div>

      {/* Main Button */}
      <div
        className="fixed bottom-24 right-6 z-40"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="relative group"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#556B2F] to-[#D4AF37] rounded-full blur-xl opacity-75 animate-pulse" />

            {/* Button */}
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#556B2F] via-[#6B8E23] to-[#D4AF37] rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-110 cursor-pointer border-3 border-white/30">
              <MessageCircle className="h-7 w-7 text-white" />

              {/* Pulse Ring */}
              {settings?.pulse_enabled && (
                <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37] animate-ping opacity-75" />
              )}

              {/* Sparkle */}
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-300 animate-pulse" />
            </div>
          </button>
        )}

        {/* Tooltip */}
        {showTooltip && !isOpen && (
          <div className="absolute bottom-20 right-0 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap animate-fade-in border-2 border-[#D4AF37]/30">
            <div className="text-sm font-bold">{settings?.tooltip_text_ar || 'تحدث معنا مباشرة'}</div>
            <div className="text-xs opacity-90">الرد خلال دقائق!</div>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[#556B2F] transform rotate-45" />
          </div>
        )}
      </div>

      {/* Options Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:justify-end md:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full md:w-96 bg-gradient-to-br from-white via-green-50/30 to-yellow-50/30 rounded-t-3xl md:rounded-3xl shadow-2xl animate-slide-up md:animate-scale-in border-t-4 md:border-4 border-[#D4AF37]">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#556B2F] via-[#6B8E23] to-[#D4AF37] p-6 rounded-t-3xl md:rounded-t-2xl">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-xl font-black">تواصل معنا</h3>
                    <p className="text-sm text-green-100">اختر القسم المناسب</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Contact Options */}
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {contacts.map((contact, index) => (
                <button
                  key={contact.id}
                  onClick={() => handleContactClick(contact)}
                  className="w-full group relative overflow-hidden bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50 rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-gray-100 hover:border-[#D4AF37]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#556B2F]/5 to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#556B2F] to-[#D4AF37] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <div className="text-white">
                        {getIcon(contact.icon)}
                      </div>
                    </div>

                    <div className="flex-1 text-right">
                      <div className="font-bold text-gray-900 group-hover:text-[#556B2F] transition-colors">
                        {contact.department_name_ar}
                      </div>
                      <div className="text-sm text-gray-600">
                        {contact.phone_number.replace(/(\d{3})(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4')}
                      </div>
                    </div>

                    <Zap className="h-5 w-5 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}

              {contacts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>لا توجد خيارات متاحة حالياً</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-green-50/30 border-t-2 border-gray-100 rounded-b-3xl md:rounded-b-2xl">
              <div className="text-center text-xs text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#D4AF37]" />
                  نرد على استفساراتك خلال دقائق
                </span>
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
      `}</style>
    </>
  );
}
