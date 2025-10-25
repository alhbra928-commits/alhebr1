import { ReactNode } from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface ProtectedViewProps {
  moduleId: string;
  children: ReactNode;
  requiredAction?: 'view' | 'create' | 'edit' | 'delete';
}

export function ProtectedView({ moduleId, children, requiredAction = 'view' }: ProtectedViewProps) {
  const { hasPermission, canAccessModule, loading, isAdmin } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4" />
          <p className="text-xl font-bold text-gray-700">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  if (!canAccessModule(moduleId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="max-w-md w-full">
          <div
            className="rounded-2xl p-8 text-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #fb923c 100%)',
                boxShadow: '0 10px 40px rgba(239, 68, 68, 0.3)',
              }}
            >
              <Lock className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-black text-red-600 mb-3">
              ⛔ ليس لديك صلاحية
            </h2>

            <p className="text-lg text-gray-700 mb-6">
              عذراً، ليس لديك صلاحية للوصول إلى هذا القسم.
              الرجاء التواصل مع المشرف لمنحك الصلاحية المناسبة.
            </p>

            <div
              className="p-4 rounded-xl mb-4"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <div className="flex items-center gap-2 justify-center">
                <Shield className="w-5 h-5 text-red-500" />
                <span className="font-bold text-red-600">القسم: {moduleId}</span>
              </div>
            </div>

            <button
              onClick={() => window.history.back()}
              className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #fb923c 100%)',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
              }}
            >
              العودة للصفحة السابقة
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requiredAction !== 'view' && !hasPermission(moduleId, requiredAction)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50 p-4">
        <div className="max-w-md w-full">
          <div
            className="rounded-2xl p-8 text-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)',
              border: '2px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)',
              }}
            >
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-black text-amber-600 mb-3">
              ⚠️ صلاحيات محدودة
            </h2>

            <p className="text-lg text-gray-700 mb-6">
              يمكنك عرض هذا القسم، لكن ليس لديك صلاحية لتنفيذ إجراء{' '}
              <span className="font-bold text-amber-600">"{requiredAction}"</span>.
            </p>

            <div
              className="p-4 rounded-xl mb-4"
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}
            >
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2 justify-center">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>القسم: {moduleId}</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>الإجراء المطلوب: {requiredAction}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.history.back()}
              className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
              }}
            >
              العودة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
