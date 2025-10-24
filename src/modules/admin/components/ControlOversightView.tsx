import { useState, useEffect } from 'react';
import { Shield, Users, Activity, FileText, Zap, User, Briefcase } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { AdminUsersManager } from './AdminUsersManager';
import { AdvancedLiveSessionsMonitor } from './AdvancedLiveSessionsMonitor';
import { ActionLogsViewer } from './ActionLogsViewer';
import { DailyPulseDashboard } from './DailyPulseDashboard';
import { AdvancedPermissionsManager } from './AdvancedPermissionsManager';
import { BackButton } from '../../../components/common/BackButton';
import { AdminSessionService } from '../services/adminSessionService';

type TabType = 'pulse' | 'users' | 'sessions' | 'logs' | 'permissions';

interface ControlOversightViewProps {
  onBack: () => void;
}

export function ControlOversightView({ onBack }: ControlOversightViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pulse');
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  useEffect(() => {
    const session = AdminSessionService.getCurrentSession();
    if (session?.admin) {
      setCurrentAdmin(session.admin);
    }
  }, []);

  const tabs = [
    {
      id: 'pulse' as TabType,
      label: 'النبض الإداري',
      icon: Zap,
      color: '#EC4899',
    },
    {
      id: 'users' as TabType,
      label: 'المستخدمون',
      icon: Users,
      color: '#D4AF37',
    },
    {
      id: 'sessions' as TabType,
      label: 'الجلسات الحية',
      icon: Activity,
      color: '#10B981',
    },
    {
      id: 'logs' as TabType,
      label: 'سجل الإجراءات',
      icon: FileText,
      color: '#3B82F6',
    },
    {
      id: 'permissions' as TabType,
      label: 'الصلاحيات',
      icon: Shield,
      color: '#EF4444',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'pulse':
        return <DailyPulseDashboard />;
      case 'users':
        return <AdminUsersManager />;
      case 'sessions':
        return <AdvancedLiveSessionsMonitor />;
      case 'logs':
        return <ActionLogsViewer />;
      case 'permissions':
        return <AdvancedPermissionsManager />;
      default:
        return <DailyPulseDashboard />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 100%)' }}>
      <BackButton onClick={onBack} />

      <div className="pb-6 pt-6">
        <div className="mx-auto max-w-7xl px-6">
          {currentAdmin && (
            <div
              className="mb-6 overflow-hidden rounded-2xl border-2 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(170, 138, 46, 0.1) 100%)',
                borderColor: 'rgba(212, 175, 55, 0.3)',
                boxShadow: '0 10px 40px rgba(212, 175, 55, 0.2)',
              }}
            >
              <div className="flex items-center gap-6 p-6">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: brandGradients.gold,
                    boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                  }}
                >
                  <User className="h-10 w-10 text-white" />
                </div>

                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h2 className="text-3xl font-black text-white">
                      {currentAdmin.name}
                    </h2>
                    <div
                      className="rounded-full px-4 py-1 text-sm font-bold"
                      style={{
                        background: brandGradients.gold,
                        color: 'white',
                      }}
                    >
                      {currentAdmin.roleAr}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-white/80">
                    {currentAdmin.jobTitle && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" style={{ color: brandColors.gold }} />
                        <span className="font-medium">{currentAdmin.jobTitle}</span>
                      </div>
                    )}
                    {currentAdmin.department && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" style={{ color: brandColors.gold }} />
                        <span className="font-medium">{currentAdmin.department}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" style={{ color: brandColors.emerald }} />
                      <span className="font-medium text-emerald-300">متصل الآن</span>
                    </div>
                  </div>
                </div>

                <div
                  className="shrink-0 rounded-xl px-6 py-4"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium text-white/60">رقم الجوال</div>
                    <div className="mt-1 text-lg font-bold text-white">{currentAdmin.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl animate-pulse"
                style={{ background: brandGradients.gold }}
              >
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white md:text-5xl">
              🛡️ مركز الرقابة والصلاحيات
            </h1>
            <p className="mt-3 text-lg text-white/70">
              نظام مركزي ذكي لإدارة المستخدمين والجلسات والصلاحيات
            </p>
          </div>

          <div
            className="mb-6 rounded-2xl p-2"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="group relative overflow-hidden rounded-xl px-4 py-4 font-black text-white transition-all duration-300 hover:scale-105"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${tab.color}CC 0%, ${tab.color}99 100%)`
                        : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: isActive
                        ? `0 8px 32px ${tab.color}60`
                        : 'none',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="relative flex flex-col items-center gap-2">
                      <Icon
                        className="h-6 w-6 transition-transform group-hover:scale-110"
                        style={{ color: isActive ? 'white' : tab.color }}
                      />
                      <span className="text-sm">{tab.label}</span>
                    </div>

                    {isActive && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
                        style={{ background: tab.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-in">
        {renderContent()}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
