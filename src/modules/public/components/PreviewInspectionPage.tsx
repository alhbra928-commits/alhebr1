import React, { useState, useEffect } from 'react';
import {
  Play,
  MapPin,
  FileText,
  Sprout,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { PublicFarm } from '../types/farm.types';
import { PublicFarmService } from '../services/publicFarmService';
import { BackButton } from '../../../components/common/BackButton';

interface PreviewInspectionPageProps {
  barcode: string;
  onBack: () => void;
  onOwn: () => void;
}

type TabType = 'video' | 'map' | 'details';

export function PreviewInspectionPage({ barcode, onBack, onOwn }: PreviewInspectionPageProps) {
  const [farm, setFarm] = useState<PublicFarm | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('video');
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  useEffect(() => {
    console.log('PreviewInspectionPage useEffect - barcode:', barcode);
    loadFarmData();
  }, [barcode]);

  const loadFarmData = async () => {
    try {
      console.log('PreviewInspectionPage loadFarmData - barcode:', barcode);
      setLoading(true);
      const farmData = await PublicFarmService.getFarmByBarcode(barcode);
      console.log('PreviewInspectionPage farmData loaded:', farmData);
      setFarm(farmData);
    } catch (error) {
      console.error('PreviewInspectionPage Error loading farm:', error);
    } finally {
      setLoading(false);
      console.log('PreviewInspectionPage loading finished');
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: brandGradients.beige }}
      >
        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: brandColors.primary.gold, borderTopColor: 'transparent' }}
          />
          <p className="text-lg font-bold" style={{ color: brandColors.text.primary }}>
            جاري تحميل المعاينة...
          </p>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: brandGradients.beige }}
      >
        <div className="text-center">
          <p className="text-xl font-bold mb-4" style={{ color: brandColors.text.primary }}>
            المزرعة غير موجودة
          </p>
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-xl font-bold"
            style={{
              background: brandGradients.gold,
              color: brandColors.text.white,
            }}
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24"
      dir="rtl"
      style={{ background: brandGradients.beige }}
    >
      <div className="max-w-[1400px] mx-auto px-8 pt-8">
        <BackButton onClick={onBack} />

        <div className="mb-8 flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: brandGradients.gold }}
          >
            <MapPin className="h-8 w-8" style={{ color: brandColors.text.white }} />
          </div>
          <div>
            <h1
              className="text-5xl font-black"
              style={{
                background: brandGradients.gold,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              معاينة المزرعة
            </h1>
            <p className="text-lg mt-1" style={{ color: brandColors.text.secondary }}>
              {farm.farm_name} - {farm.barcode}
            </p>
          </div>
        </div>

        {farm.status === 'almost_full' && (
          <div
            className="rounded-2xl p-4 mb-6 flex items-center gap-3 animate-pulse"
            style={{
              background: brandColors.status.warning,
              boxShadow: `0 10px 30px rgba(229, 115, 115, 0.3)`,
            }}
          >
            <AlertCircle className="h-6 w-6" style={{ color: brandColors.text.white }} />
            <p className="text-lg font-bold" style={{ color: brandColors.text.white }}>
              ⚠️ الحجز على وشك الاكتمال! - متبقي {farm.available_trees} شجرة فقط
            </p>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          {[
            { key: 'video', icon: <Play className="h-5 w-5" />, label: '🎥 الفيديو' },
            { key: 'map', icon: <MapPin className="h-5 w-5" />, label: '🗺️ الخريطة' },
            { key: 'details', icon: <FileText className="h-5 w-5" />, label: '🧾 التفاصيل' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className="flex-1 py-4 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                background: activeTab === tab.key ? brandGradients.gold : brandColors.background.card,
                color: activeTab === tab.key ? brandColors.text.white : brandColors.text.primary,
                border: `2px solid ${activeTab === tab.key ? brandColors.primary.gold : brandColors.border.light}`,
                boxShadow: activeTab === tab.key ? `0 10px 30px ${brandColors.shadow.gold}` : 'none',
                transform: activeTab === tab.key ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className="rounded-3xl overflow-hidden mb-6"
          style={{
            background: brandColors.background.card,
            border: `2px solid ${brandColors.border.light}`,
            boxShadow: `0 20px 60px ${brandColors.shadow.dark}`,
            minHeight: '600px',
          }}
        >
          {activeTab === 'video' && (
            <div className="p-8">
              {farm.video_url ? (
                <div className="aspect-video rounded-2xl overflow-hidden relative group">
                  <iframe
                    src={farm.video_url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div
                  className="aspect-video rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundImage: farm.aerial_image
                      ? `url(${farm.aerial_image})`
                      : 'url("https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1200")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <div className="relative z-10 text-center">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: brandGradients.gold }}
                    >
                      <Play className="h-12 w-12 mr-2" style={{ color: brandColors.text.white }} />
                    </div>
                    <p className="text-2xl font-black mb-2" style={{ color: brandColors.text.white }}>
                      الفيديو قريباً
                    </p>
                    <p className="text-lg" style={{ color: brandColors.primary.goldLight }}>
                      سيتم إضافة فيديو المزرعة قريباً
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="p-8 relative">
              <div
                className="rounded-2xl overflow-hidden relative"
                style={{
                  height: isMapExpanded ? '800px' : '600px',
                  transition: 'height 0.3s ease',
                }}
              >
                {farm.latitude && farm.longitude ? (
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${farm.longitude}!3d${farm.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2ssa!4v1234567890`}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      backgroundImage: 'url("https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1200")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="text-center p-8 rounded-2xl backdrop-blur-lg"
                      style={{ background: 'rgba(245, 243, 238, 0.9)' }}>
                      <MapPin className="h-16 w-16 mx-auto mb-4" style={{ color: brandColors.primary.gold }} />
                      <p className="text-xl font-black mb-2" style={{ color: brandColors.text.primary }}>
                        الخريطة التفاعلية
                      </p>
                      <p style={{ color: brandColors.text.secondary }}>
                        {farm.location_city} - {farm.location_region}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="absolute top-12 left-12 p-3 rounded-full transition-all hover:scale-110"
                style={{
                  background: brandColors.background.card,
                  border: `2px solid ${brandColors.border.gold}`,
                  color: brandColors.text.primary,
                }}
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailCard
                  title="معلومات المزرعة"
                  items={[
                    { label: 'اسم المزرعة', value: farm.farm_name },
                    { label: 'رقم الباركود', value: farm.barcode },
                    { label: 'نوع الأشجار', value: farm.tree_type === 'palm' ? 'نخيل' : farm.tree_type === 'olive' ? 'زيتون' : 'مختلط' },
                    { label: 'عدد الأشجار الإجمالي', value: farm.total_trees.toString() },
                  ]}
                />
                <DetailCard
                  title="التفاصيل المالية"
                  items={[
                    { label: 'الأشجار المتاحة', value: farm.available_trees.toString() },
                    { label: 'السعر للشجرة الواحدة', value: `${farm.base_price.toLocaleString('ar-SA')} ريال` },
                    { label: 'نسبة الحجز', value: `${farm.completion_percentage}%` },
                    { label: 'الحالة', value: farm.status === 'open' ? 'متاحة للحجز' : farm.status === 'almost_full' ? 'قريبة من الاكتمال' : 'مكتملة' },
                  ]}
                />
                <DetailCard
                  title="الموقع"
                  items={[
                    { label: 'المدينة', value: farm.location_city },
                    { label: 'المنطقة', value: farm.location_region },
                    { label: 'نوع التربة', value: farm.soil_type || 'تربة زراعية خصبة' },
                  ]}
                />
                <DetailCard
                  title="معلومات إضافية"
                  items={[
                    { label: 'مدة التحصيل', value: farm.harvest_duration || 'سنوياً' },
                    { label: 'الخدمات المتاحة', value: farm.services_available?.join(', ') || 'ري، صيانة، حصاد' },
                  ]}
                />
              </div>

              {farm.description && (
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: `2px solid ${brandColors.border.light}`,
                  }}
                >
                  <h3 className="text-xl font-black mb-3" style={{ color: brandColors.text.primary }}>
                    📝 وصف المزرعة
                  </h3>
                  <p className="leading-relaxed text-lg" style={{ color: brandColors.text.secondary }}>
                    {farm.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 p-6 backdrop-blur-lg z-50"
        style={{
          background: 'rgba(245, 243, 238, 0.95)',
          borderTop: `2px solid ${brandColors.border.light}`,
          boxShadow: `0 -10px 40px ${brandColors.shadow.dark}`,
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <button
            onClick={onOwn}
            disabled={farm.status === 'full'}
            className="w-full py-5 rounded-2xl font-black text-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{
              background: farm.status === 'full' ? brandColors.status.neutral : brandGradients.gold,
              color: brandColors.text.white,
              boxShadow: farm.status !== 'full' ? `0 10px 40px ${brandColors.shadow.gold}` : 'none',
            }}
          >
            <Sprout className="h-7 w-7" />
            {farm.status === 'full' ? '🔒 المزرعة مكتملة' : '🌴 تملّك الآن'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: brandColors.background.card,
        border: `2px solid ${brandColors.border.light}`,
      }}
    >
      <h3 className="text-xl font-black mb-4" style={{ color: brandColors.text.primary }}>
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: brandColors.text.secondary }}>
              {item.label}
            </span>
            <span className="text-base font-black" style={{ color: brandColors.text.primary }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
