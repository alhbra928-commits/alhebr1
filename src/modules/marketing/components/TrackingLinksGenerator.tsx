import React, { useState } from 'react';
import { Link, Copy, Check, ExternalLink } from 'lucide-react';

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  utmSource: string;
}

const PLATFORMS: SocialPlatform[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'bg-black',
    description: 'ضع هذا الرابط في Bio TikTok',
    utmSource: 'tiktok'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'استخدم في Bio أو Stories',
    utmSource: 'instagram'
  },
  {
    id: 'twitter',
    name: 'Twitter (X)',
    icon: '🐦',
    color: 'bg-blue-400',
    description: 'شارك في التغريدات والبروفايل',
    utmSource: 'twitter'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-600',
    description: 'استخدم في المنشورات والصفحة',
    utmSource: 'facebook'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: 'bg-red-600',
    description: 'ضع في وصف الفيديوهات',
    utmSource: 'youtube'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700',
    description: 'شارك في البروفايل والمنشورات',
    utmSource: 'linkedin'
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: '👻',
    color: 'bg-yellow-400',
    description: 'استخدم في القصص والبروفايل',
    utmSource: 'snapchat'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-500',
    description: 'شارك في الحالات والرسائل',
    utmSource: 'whatsapp'
  }
];

export const TrackingLinksGenerator: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState('https://palmolive.sa');
  const [campaignName, setCampaignName] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const generateTrackingLink = (platform: SocialPlatform, includesCampaign: boolean = true): string => {
    const url = new URL(baseUrl);

    // إضافة UTM parameters
    url.searchParams.set('utm_source', platform.utmSource);
    url.searchParams.set('utm_medium', 'social');

    if (includesCampaign && campaignName) {
      url.searchParams.set('utm_campaign', campaignName);
    }

    return url.toString();
  };

  const copyToClipboard = async (platform: SocialPlatform) => {
    const link = generateTrackingLink(platform);

    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(platform.id);

      setTimeout(() => {
        setCopiedLink(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('فشل النسخ. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Link className="w-7 h-7" />
          مولّد الروابط الذكية
        </h2>
        <p className="text-gray-600 mt-1">
          روابط تتبع مخصصة لكل منصة تواصل اجتماعي
        </p>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات الروابط</h3>

        <div className="space-y-4">
          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الرابط الأساسي للمنصة
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://palmolive.sa"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              سيتم إضافة معاملات التتبع (UTM) تلقائياً لهذا الرابط
            </p>
          </div>

          {/* Campaign Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الحملة (اختياري)
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="مثال: summer_sale_2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              إذا كنت تريد تتبع حملة معينة، أدخل اسمها هنا
            </p>
          </div>
        </div>
      </div>

      {/* Platform Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLATFORMS.map((platform) => {
          const isCopied = copiedLink === platform.id;
          const trackingLink = generateTrackingLink(platform);

          return (
            <div
              key={platform.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Platform Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center text-2xl`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{platform.name}</h4>
                    <p className="text-sm text-gray-600">{platform.description}</p>
                  </div>
                </div>
              </div>

              {/* Generated Link */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  الرابط المتتبع:
                </label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <code className="text-xs text-gray-800 break-all">
                    {trackingLink}
                  </code>
                </div>
              </div>

              {/* UTM Parameters Preview */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 mb-2 font-medium">معاملات التتبع:</p>
                <div className="space-y-1">
                  <p className="text-xs text-blue-700">
                    <strong>utm_source:</strong> {platform.utmSource}
                  </p>
                  <p className="text-xs text-blue-700">
                    <strong>utm_medium:</strong> social
                  </p>
                  {campaignName && (
                    <p className="text-xs text-blue-700">
                      <strong>utm_campaign:</strong> {campaignName}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(platform)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isCopied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-[#8B7355] text-white hover:bg-[#6D5A43]'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      تم النسخ!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      نسخ الرابط
                    </>
                  )}
                </button>

                <a
                  href={trackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-[#8B7355] hover:bg-gray-100 rounded-lg transition-colors"
                  title="فتح في نافذة جديدة"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>💡</span>
          كيفية الاستخدام
        </h3>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <p>
              <strong>انسخ الرابط المتتبع</strong> الخاص بالمنصة التي تريدها
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <p>
              <strong>ضع الرابط في Bio أو المنشورات</strong> على المنصة الاجتماعية
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <p>
              <strong>تتبع الزيارات</strong> من خلال صفحة "تحليل الزوار"
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <p>
              <strong>شاهد التحليلات</strong> لمعرفة عدد الزوار من كل منصة
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700">
            <strong>ملاحظة:</strong> يمكنك استخدام نفس الرابط في أماكن متعددة على نفس المنصة.
            سيتم تجميع جميع الزيارات تحت مصدر واحد (مثلاً: كل الزيارات من TikTok ستظهر معاً).
          </p>
        </div>
      </div>

      {/* Example Section */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📚</span>
          مثال عملي
        </h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-700 mb-2">
              <strong>السيناريو:</strong> تريد مشاركة المنصة على TikTok Bio
            </p>
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <p className="text-xs text-gray-600 mb-2">الرابط المولّد:</p>
              <code className="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded block break-all">
                https://palmolive.sa?utm_source=tiktok&utm_medium=social
              </code>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-700">
              <strong>النتيجة:</strong> كل من يزور المنصة من خلال Bio TikTok الخاص بك
              سيتم تسجيله تلقائياً كـ "زيارة من TikTok" في نظام التحليلات.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
