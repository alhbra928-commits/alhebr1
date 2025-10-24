import React, { useState, useEffect } from 'react';
import { FarmOwnerLoginPage } from './FarmOwnerLoginPage';
import { FarmOwnerDashboard } from './FarmOwnerDashboard';
import { farmOwnerService } from '../services/farmOwnerService';

export const FarmOwnerRouter: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // التحقق من الجلسة عند التحميل
    const session = farmOwnerService.getSession();
    if (session?.profile_id) {
      setProfileId(session.profile_id);
      setStatus(session.status);
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (newProfileId: string, newStatus: string) => {
    setProfileId(newProfileId);
    setStatus(newStatus);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setProfileId(null);
    setStatus('');
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

  return <FarmOwnerDashboard profileId={profileId} onLogout={handleLogout} />;
};
