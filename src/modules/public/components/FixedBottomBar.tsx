import { useState, useEffect } from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
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
    hours_label: 'ساعات العمل',
    hours_text: '8 صباحاً - 8 مساءً',
    cta_message: '🌴 استثمر في مستقبل مستدام 🌳'
  });

  useEffect(() => {
    const loadTexts = async () => {
      const texts = await getPlatformTextsBySection('contact_bar');
      if (texts && Object.keys(texts).length > 0) {
        setContactTexts({
          call_us_label: texts.call_us_label?.ar || 'اتصل بنا',
          phone_number: texts.phone_number?.ar || '920000000',
          email_label: texts.email_label?.ar || 'راسلنا',
          email_address: texts.email_address?.ar || 'info@palmolive.sa',
          hours_label: texts.hours_label?.ar || 'ساعات العمل',
          hours_text: texts.hours_text?.ar || '8 صباحاً - 8 مساءً',
          cta_message: texts.cta_message?.ar || '🌴 استثمر في مستقبل مستدام 🌳'
        });
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
          hours_label: texts.hours_label?.ar || 'ساعات العمل',
          hours_text: texts.hours_text?.ar || '8 صباحاً - 8 مساءً',
          cta_message: texts.cta_message?.ar || '🌴 استثمر في مستقبل مستدام 🌳'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'linear-gradient(to right, #059669, #16a34a, #059669)',
        borderTop: '2px solid #34d399',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 16px' }}>
        {/* Desktop Layout */}
        <div style={{ display: 'none' }} className="md:flex md:items-center md:justify-between md:gap-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <div style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <Phone style={{ width: '16px', height: '16px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', opacity: 0.9 }}>{contactTexts.call_us_label}</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{contactTexts.phone_number}</span>
              </div>
            </div>

            <div style={{ height: '32px', width: '1px', background: 'rgba(255, 255, 255, 0.3)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <div style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <Mail style={{ width: '16px', height: '16px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', opacity: 0.9 }}>{contactTexts.email_label}</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{contactTexts.email_address}</span>
              </div>
            </div>

            <div style={{ height: '32px', width: '1px', background: 'rgba(255, 255, 255, 0.3)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <div style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <Clock style={{ width: '16px', height: '16px' }} className="animate-pulse" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', opacity: 0.9 }}>{contactTexts.hours_label}</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{contactTexts.hours_text}</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#064e3b',
            background: 'white',
            padding: '8px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }} className="hidden lg:flex">
            <span style={{ fontSize: '14px', fontWeight: '900' }}>{contactTexts.cta_message}</span>
          </div>
        </div>

        {/* Mobile Layout */}
        <div style={{ display: 'flex' }} className="md:hidden items-center justify-between gap-2">
          <a
            href={`tel:${contactTexts.phone_number}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'white',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '6px 8px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              flex: 1,
              textDecoration: 'none'
            }}
          >
            <Phone style={{ width: '14px', height: '14px' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '9px', opacity: 0.9 }}>{contactTexts.call_us_label}</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{contactTexts.phone_number}</span>
            </div>
          </a>

          <a
            href={`mailto:${contactTexts.email_address}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'white',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '6px 8px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              flex: 1,
              textDecoration: 'none'
            }}
          >
            <Mail style={{ width: '14px', height: '14px' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '9px', opacity: 0.9 }}>{contactTexts.email_label}</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{contactTexts.email_address.split('@')[0]}</span>
            </div>
          </a>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'white',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 8px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <Clock style={{ width: '14px', height: '14px' }} className="animate-pulse" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '9px', opacity: 0.9 }}>{contactTexts.hours_label}</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{contactTexts.hours_text.split(' - ')[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
