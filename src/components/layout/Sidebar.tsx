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
  Sprout,
  MessageCircle
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
  { id: 'whatsapp', label: 'إدارة الواتساب', icon: MessageCircle, color: 'text-green-600' },
  { id: 'marketing', label: 'التسويق', icon: TrendingUp, color: 'text-pink-600' },
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
    <div className="hidden lg:block h-screen w-64 bg-gradient-to-b from-amber-900 via-amber-800 to-orange-900 text-white fixed right-0 top-0 shadow-2xl overflow-y-auto" dir="rtl">
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

        {/* رسالة التشخيص - تظهر لجميع الموظفين */}
        {(() => {
          console.log('🟦🟦🟦 [Sidebar] BLUE BOX CHECK:');
          console.log('🟦 currentAdminPhone:', currentAdminPhone);
          console.log('🟦 isAdmin:', isAdmin);
          console.log('🟦 Condition (phone && !isAdmin):', !!(currentAdminPhone && !isAdmin));
          return null;
        })()}
        {currentAdminPhone && !isAdmin && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white shadow-lg border-2 border-blue-400">
            {console.log('✅✅✅ BLUE BOX IS RENDERING NOW!')}
            <div className="font-bold text-lg mb-2 flex items-center gap-2">
              🔍 معلومات الحساب
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>الرقم:</span>
                <span className="font-bold">{currentAdminPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>مدير النظام:</span>
                <span className="font-bold">{isAdmin ? '✅ نعم' : '❌ لا'}</span>
              </div>
              <div className="flex justify-between">
                <span>عدد الصلاحيات:</span>
                <span className="font-bold bg-white text-blue-600 px-2 py-0.5 rounded">{permissions?.length || 0}</span>
              </div>
            </div>
            {permissions && permissions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-400">
                <div className="font-bold mb-2">📋 الأقسام المتاحة:</div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {permissions.map(p => (
                    <div key={p.module_id} className="bg-blue-800 bg-opacity-50 p-2 rounded text-xs">
                      <div className="font-bold">{p.module_name_ar}</div>
                      <div className="flex gap-2 mt-1 text-[10px]">
                        <span>عرض: {p.can_view ? '✅' : '❌'}</span>
                        <span>إضافة: {p.can_create ? '✅' : '❌'}</span>
                        <span>تعديل: {p.can_edit ? '✅' : '❌'}</span>
                        <span>حذف: {p.can_delete ? '✅' : '❌'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(!permissions || permissions.length === 0) && (
              <div className="mt-3 pt-3 border-t border-blue-400 text-center text-sm bg-red-500 bg-opacity-30 p-2 rounded">
                ⚠️ لا توجد صلاحيات! تواصل مع المدير
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
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative
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
