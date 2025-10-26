import React, { useState, useEffect } from 'react';
import { FarmOwnerLoginPage } from './FarmOwnerLoginPage';
import { FarmOwnerDashboard } from './FarmOwnerDashboard';
import { farmOwnerService } from '../services/farmOwnerService';

export const FarmOwnerRouter: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showPublicPlatform, setShowPublicPlatform] = useState(false);
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);

  useEffect(() => {
    // التحقق من الجلسة عند التحميل
    const session = farmOwnerService.getSession();
    if (session?.profile_id) {
      setProfileId(session.profile_id);
      setStatus(session.status);
      setIsLoggedIn(true);

      // تحميل بيانات المالك
      loadProfile(session.profile_id);
    }
    setLoading(false);
  }, []);

  const loadProfile = async (id: string) => {
    try {
      const data = await farmOwnerService.getProfile(id);
      setProfile(data);
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    }
  };

  const handleLoginSuccess = (newProfileId: string, newStatus: string) => {
    setProfileId(newProfileId);
    setStatus(newStatus);
    setIsLoggedIn(true);
    loadProfile(newProfileId);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setProfileId(null);
    setStatus('');
    setShowPublicPlatform(false);
  };

  const handleBackToPublic = () => {
    setShowPublicPlatform(true);
  };

  const handleBackToDashboard = () => {
    setShowPublicPlatform(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #1C2E0F 0%, #0F1A08 50%, #1C2E0F 100%)'
      }}>
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: '#8BC34A', borderTopColor: 'transparent' }} />
          <p className="mt-4 text-lg font-semibold" style={{ color: '#8BC34A' }}>
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !profileId) {
    return <FarmOwnerLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // إذا كان المستخدم يريد رؤية المنصة العامة
  if (showPublicPlatform) {
    return (
      <>
        {/* شريط علوي يظهر أن الجلسة مفتوحة */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-2 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-bold">
                جلسة صاحب المزرعة مفتوحة - {profile?.full_name || 'صاحب المزرعة'}
              </span>
            </div>
            <button
              onClick={handleBackToDashboard}
              className="px-4 py-1.5 bg-white text-emerald-600 rounded-lg font-bold text-sm hover:bg-emerald-50 transition-all hover:scale-105"
            >
              العودة للوحة التحكم
            </button>
          </div>
        </div>

        {/* المنصة العامة مع مسافة للشريط العلوي */}
        <div className="pt-10">
          {/* هنا يمكن وضع المنصة العامة - سنفتحها في تبويب جديد بدلاً */}
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
              <div className="text-6xl mb-4">🌳</div>
              <h2 className="text-2xl font-black text-gray-800 mb-3">المنصة الرئيسية</h2>
              <p className="text-gray-600 mb-6">
                لعرض المنصة الرئيسية، سيتم فتحها في تبويب جديد للحفاظ على جلستك مفتوحة.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.open('/', '_blank')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:scale-105 transition-all"
                >
                  فتح المنصة في تبويب جديد
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  العودة للوحة التحكم
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <FarmOwnerDashboard
      profileId={profileId}
      onLogout={handleLogout}
      onBackToPublic={handleBackToPublic}
    />
  );
};
