import React from 'react';
import { MarketingAnalyticsDashboard } from './MarketingAnalyticsDashboard';
import { BackButton } from '../../../components/common/BackButton';

interface MarketingViewProps {
  onBack?: () => void;
}

export function MarketingView({ onBack }: MarketingViewProps) {
  return (
    <div className="min-h-screen bg-[#F9F8F6] p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {onBack && (
          <div className="mb-6">
            <BackButton onBack={onBack} />
          </div>
        )}

        <MarketingAnalyticsDashboard />
      </div>
    </div>
  );
}
