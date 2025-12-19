import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { shareSettingsService, ShareData } from '../../services/shareSettingsService';

interface ShareButtonProps {
  pageType: string;
  data?: ShareData;
  className?: string;
  variant?: 'icon' | 'text' | 'full';
  size?: 'sm' | 'md' | 'lg';
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  pageType,
  data = {},
  className = '',
  variant = 'full',
  size = 'md'
}) => {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing) return;

    try {
      setSharing(true);
      await shareSettingsService.share(pageType, data);
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setSharing(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        disabled={sharing}
        className={`p-2 rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors disabled:opacity-50 ${className}`}
        title="مشاركة"
      >
        <Share2 className={iconSizeClasses[size]} />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleShare}
        disabled={sharing}
        className={`flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50 ${sizeClasses[size]} ${className}`}
      >
        <Share2 className={iconSizeClasses[size]} />
        <span>مشاركة</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className={`flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 ${sizeClasses[size]} ${className}`}
    >
      <Share2 className={iconSizeClasses[size]} />
      <span>مشاركة</span>
    </button>
  );
};
