import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  Wallet,
  Users,
  Award,
  Settings,
  Shield,
  Building,
  TrendingUp,
  Sprout,
  MessageCircle,
  X
} from 'lucide-react';
import { usePermissions } from '../../contexts/PermissionsContext';

interface MobileSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, color: 'text-blue-600' },
  { id: 'owners', label: 'أصحاب المزارع', icon: Building, color: 'text-amber-600' },
  { id: 'farms', label: 'المزارع', icon: MapPin, color: 'text-green-600' },
  { id: 'reservations', label: 'الحجوزات', icon: Calendar, color: 'text-orange-600' },
  { id: 'investors', label: 'المستثمرون', icon: Users, color: 'text-purple-600' },
  { id: 'finance', label: 'النظام المالي', icon: Wallet, color: 'text-emerald-600' },
  { id: 'agriculture', label: 'الخدمات الزراعية', icon: Sprout, color: 'text-green-600' },
  { id: 'documentation', label: 'التوثيق', icon: Award, color: 'text-blue-600' },
  { id: 'whatsapp', label: 'إدارة الواتساب', icon: MessageCircle, color: 'text-green-600' },
  { id: 'wallets', label: 'المحافظ', icon: Wallet, color: 'text-purple-600' },
  { id: 'permissions', label: 'الصلاحيات', icon: Shield, color: 'text-red-600' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, color: 'text-gray-600' },
];

export function MobileSidebar({ activeModule, onModuleChange, isOpen, onClose }: MobileSidebarProps) {
  const { canAccessModule, isAdmin, loading } = usePermissions();

  const handleModuleChange = (module: string) => {
    onModuleChange(module);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-amber-900 via-amber-800 to-orange-900 text-white shadow-2xl z-50 overflow-y-auto safe-area-top safe-area-bottom lg:hidden">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold">النخيل والزيتون</h1>
                <p className="text-xs text-amber-300">نظام الإدارة</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              if (item.id === 'dashboard') {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleModuleChange(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 btn-touch
                      ${isActive
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg'
                        : 'text-amber-100 hover:bg-amber-700 active:bg-amber-600'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <div className="mr-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </button>
                );
              }

              const hasAccess = isAdmin || canAccessModule(item.id);

              if (!hasAccess && !loading) {
                return null;
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleModuleChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 btn-touch
                    ${isActive
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg'
                      : 'text-amber-100 hover:bg-amber-700 active:bg-amber-600'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <div className="mr-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 bg-amber-950 border-t border-amber-700 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">م</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">مسؤول النظام</p>
              <p className="text-xs text-amber-300 truncate">admin@platform.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
