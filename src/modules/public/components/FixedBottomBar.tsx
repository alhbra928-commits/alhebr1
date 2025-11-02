import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { getPlatformTextsBySection, subscribeToPlatformTextsChanges } from '../../../services/platformTextsService';

interface FixedBottomBarProps {
  onIntroClick?: () => void;
}

export function FixedBottomBar({ onIntroClick }: FixedBottomBarProps) {
  const [contactTexts, setContactTexts] = useState({
    call_us_label: 'اتصل بنا',
    phone_number: '920000000',
    email_label: 'راسلنا',
    email_address: 'info@palmolive.sa',
    location_label: 'الموقع',
    location_text: 'الرياض، السعودية',
    hours_label: 'ساعات العمل',
    hours_text: '8 صباحاً - 8 مساءً',
    cta_message: '🌴 استثمر في مستقبل مستدام 🌳'
  });

  useEffect(() => {
    const loadTexts = async () => {
      console.log('🔄 Loading contact bar texts...');
      const texts = await getPlatformTextsBySection('contact_bar');
      console.log('📦 Loaded contact bar texts:', texts);

      if (texts && Object.keys(texts).length > 0) {
        const newTexts = {
          call_us_label: texts.call_us_label?.ar || 'اتصل بنا',
          phone_number: texts.phone_number?.ar || '920000000',
          email_label: texts.email_label?.ar || 'راسلنا',
          email_address: texts.email_address?.ar || 'info@palmolive.sa',
          location_label: texts.location_label?.ar || 'الموقع',
          location_text: texts.location_text?.ar || 'الرياض، السعودية',
          hours_label: texts.hours_label?.ar || 'ساعات العمل',
          hours_text: texts.hours_text?.ar || '8 صباحاً - 8 مساءً',
          cta_message: texts.cta_message?.ar || '🌴 استثمر في مستقبل مستدام 🌳'
        };
        console.log('✅ Contact bar texts set:', newTexts);
        setContactTexts(newTexts);
      } else {
        console.warn('⚠️ No contact bar texts found, using defaults');
      }
    };

    loadTexts();

    const unsubscribe = subscribeToPlatformTextsChanges('contact_bar', (texts) => {
      if (texts && Object.keys(texts).length > 0) {
        setContactTexts({
          call_us_label: texts.call_us_label?.ar || 'اتصل بنا',
          phone_number: texts.phone_number?.ar || '920000000',
          email_label: texts.email_label?.ar || 'راسلنا',
          email_address: texts.email_address?.ar || 'info@palmolive.sa',
          location_label: texts.location_label?.ar || 'الموقع',
          location_text: texts.location_text?.ar || 'الرياض، السعودية',
          hours_label: texts.hours_label?.ar || 'ساعات العمل',
          hours_text: texts.hours_text?.ar || '8 صباحاً - 8 مساءً',
          cta_message: texts.cta_message?.ar || '🌴 استثمر في مستقبل مستدام 🌳'
        });
        console.log('✅ Contact bar texts updated:', texts);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      id="fixed-bottom-bar"
      className="border-t-2 border-emerald-400 shadow-2xl"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 9999,
        paddingBottom: 'env(safe-area-inset-bottom)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        background: 'linear-gradient(to right, rgb(5, 150, 105), rgb(22, 163, 74), rgb(5, 150, 105))',
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-lg bg-white/20 border border-white/30">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] opacity-90">{contactTexts.call_us_label}</span>
                <span className="text-sm font-bold">{contactTexts.phone_number}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/30"></div>

            <div className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-lg bg-white/20 border border-white/30">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] opacity-90">{contactTexts.email_label}</span>
                <span className="text-sm font-bold">{contactTexts.email_address}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/30"></div>

            <div className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-lg bg-white/20 border border-white/30">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] opacity-90">{contactTexts.location_label}</span>
                <span className="text-sm font-bold">{contactTexts.location_text}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white bg-white/20 px-4 py-2 rounded-lg border border-white/30">
            <Clock className="h-4 w-4 text-white animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] opacity-90">{contactTexts.hours_label}</span>
              <span className="text-sm font-bold">{contactTexts.hours_text}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-emerald-900 bg-white px-5 py-2 rounded-lg shadow-lg">
            <span className="text-sm font-black">{contactTexts.cta_message}</span>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-between gap-2">
          <a href={`tel:${contactTexts.phone_number}`} className="flex items-center gap-1.5 text-white bg-white/20 px-2 py-1.5 rounded-lg border border-white/30 flex-1">
            <Phone className="h-3.5 w-3.5 text-white" />
            <div className="flex flex-col">
              <span className="text-[9px] opacity-90">{contactTexts.call_us_label}</span>
              <span className="text-[11px] font-bold">{contactTexts.phone_number}</span>
            </div>
          </a>

          <a href={`mailto:${contactTexts.email_address}`} className="flex items-center gap-1.5 text-white bg-white/20 px-2 py-1.5 rounded-lg border border-white/30 flex-1">
            <Mail className="h-3.5 w-3.5 text-white" />
            <div className="flex flex-col">
              <span className="text-[9px] opacity-90">{contactTexts.email_label}</span>
              <span className="text-[11px] font-bold truncate">{contactTexts.email_address.split('@')[0]}</span>
            </div>
          </a>

          <div className="flex items-center gap-1.5 text-white bg-white/20 px-2 py-1.5 rounded-lg border border-white/30">
            <Clock className="h-3.5 w-3.5 text-white animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] opacity-90">{contactTexts.hours_label}</span>
              <span className="text-[11px] font-bold">{contactTexts.hours_text.split(' - ')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </div>
    </div>
  );
}
