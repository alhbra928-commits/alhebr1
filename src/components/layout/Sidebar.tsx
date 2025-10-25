import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  Wallet,
  Users,
  FileText,
  Settings,
  Shield,
  Building,
  Award,
  TrendingUp,
  Sprout
} from 'lucide-react';
import { usePermissions } from '../../contexts/PermissionsContext';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
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
  { id: 'finance', label: 'النظام المالي الذكي', icon: Wallet, color: 'text-emerald-600' },
  { id: 'agriculture', label: 'الخدمات الزراعية', icon: Sprout, color: 'text-green-600' },
  { id: 'documentation', label: 'التوثيق', icon: Award, color: 'text-blue-600' },
  { id: 'marketing', label: 'التسويق', icon: TrendingUp, color: 'text-pink-600' },
  { id: 'whatsapp', label: 'واتساب', icon: Shield, color: 'text-green-600' },
  { id: 'wallets', label: 'المحافظ', icon: Wallet, color: 'text-purple-600' },
  { id: 'permissions', label: 'إدارة الصلاحيات', icon: Shield, color: 'text-red-600' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, color: 'text-gray-600' },
];

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  const { canAccessModule, isAdmin, loading, permissions, currentAdminPhone } = usePermissions();

  console.log('🔍🔍🔍 [Sidebar] Rendering...');
  console.log('🔍 [Sidebar] Current Admin Phone:', currentAdminPhone);
  console.log('🔍 [Sidebar] isAdmin:', isAdmin);
  console.log('🔍 [Sidebar] loading:', loading);
  console.log('🔍 [Sidebar] permissions count:', permissions?.length || 0);
  if (permissions && permissions.length > 0) {
    console.log('🔍 [Sidebar] Available modules:', permissions.map(p => p.module_id));
    console.log('🔍 [Sidebar] Full permissions:', JSON.stringify(permissions, null, 2));
  }

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-amber-900 via-amber-800 to-orange-900 text-white fixed right-0 top-0 shadow-2xl overflow-y-auto" dir="rtl">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <MapPin className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">منصة النخيل والزيتون</h1>
            <p className="text-xs text-gray-400">نظام الإدارة المتكامل</p>
          </div>
        </div>

        {/* رسالة التشخيص للموظف 0510101010 */}
        {currentAdminPhone === '0510101010' && (
          <div className="mb-4 p-3 bg-blue-500 rounded-lg text-white text-xs">
            <div className="font-bold mb-1">🔍 معلومات التشخيص:</div>
            <div>الرقم: {currentAdminPhone}</div>
            <div>Admin: {isAdmin ? 'نعم' : 'لا'}</div>
            <div>الصلاحيات: {permissions?.length || 0}</div>
            {permissions && permissions.length > 0 && (
              <div className="mt-2">
                <div className="font-bold">الأقسام المتاحة:</div>
                {permissions.map(p => (
                  <div key={p.module_id} className="text-[10px]">
                    ✅ {p.module_name_ar} (View: {p.can_view ? '✅' : '❌'})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            if (item.id === 'dashboard') {
              console.log(`✅ [Sidebar] ${item.id}: Dashboard - Always shown`);
              return (
                <button
                  key={item.id}
                  onClick={() => onModuleChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg transform scale-105'
                      : 'text-amber-100 hover:bg-amber-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? item.color : ''}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="mr-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </button>
              );
            }

            const hasAccess = isAdmin || canAccessModule(item.id);
            console.log(`🔍 [Sidebar] ${item.id}: isAdmin=${isAdmin}, canAccess=${hasAccess}, loading=${loading}`);

            if (!hasAccess && !loading) {
              console.log(`❌ [Sidebar] ${item.id}: HIDDEN (no access)`);
              return null;
            }

            console.log(`✅ [Sidebar] ${item.id}: SHOWN`);
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg transform scale-105'
                    : 'text-amber-100 hover:bg-amber-700 hover:text-white'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? item.color : ''}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="mr-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 right-0 left-0 p-6 bg-amber-950 border-t border-amber-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">م</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">مسؤول النظام</p>
            <p className="text-xs text-amber-300">admin@platform.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
