import { useEffect, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { aiAdaptiveInterface, ElementState } from '../../services/aiAdaptiveInterfaceService';

interface AdaptiveSmartButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

/**
 * 🤖 الزر الذكي المتكيف
 *
 * مدمج مع AI Adaptive Interface Layer
 * - يتكيف تلقائياً مع جميع الأجهزة
 * - يتجنب التعارض مع العناصر الأخرى
 * - تصميم زجاجي أخضر متألق
 */
export function AdaptiveSmartButton({
  phoneNumber = '966500000000',
  defaultMessage = 'مرحباً! أود الاستفسار عن المنصة'
}: AdaptiveSmartButtonProps) {
  const [elementState, setElementState] = useState<ElementState | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Subscribe to element state updates
    const unsubscribe = aiAdaptiveInterface.subscribe('smart-whatsapp-button', (state) => {
      setElementState(state);
    });

    // Get initial state
    const initialState = aiAdaptiveInterface.getElementState('smart-whatsapp-button');
    if (initialState) {
      setElementState(initialState);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  if (!mounted || !elementState || !elementState.visible) {
    return null;
  }

  const { position, interacting } = elementState;
  const deviceInfo = aiAdaptiveInterface.getDeviceInfo();

  const handleSendMessage = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setExpanded(false);
  };

  const handleToggle = () => {
    setExpanded(!expanded);
    aiAdaptiveInterface.updateElement('smart-whatsapp-button', {
      interacting: !expanded
    });
  };

  return (
    <>
      {/* Main Button */}
      <button
        data-interface-element="smart-whatsapp-button"
        onClick={handleToggle}
        className={`
          fixed transition-all duration-300 ease-out
          ${expanded ? 'scale-95' : 'scale-100'}
          ${interacting ? 'scale-90' : ''}
          active:scale-90
        `}
        style={{
          bottom: `${position.bottom}px`,
          right: `${position.right}px`,
          zIndex: position.zIndex,
          transform: `scale(${position.scale}) ${expanded ? 'scale(0.95)' : ''}`,
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-label="فتح واتساب"
      >
        {/* Glow Effect */}
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
            filter: 'blur(12px)',
            transform: 'scale(1.3)',
          }}
        />

        {/* Glass Button */}
        <div
          className="relative w-16 h-16 rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: `
              0 8px 32px rgba(16, 185, 129, 0.4),
              inset 0 1px 2px rgba(255, 255, 255, 0.3),
              0 0 0 1px rgba(16, 185, 129, 0.3)
            `,
          }}
        >
          {/* Glass Reflection */}
          <div
            className="absolute top-0 left-0 right-0 h-8 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)'
            }}
          />

          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {expanded ? (
              <X
                size={28}
                className="text-white"
                strokeWidth={2.5}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                }}
              />
            ) : (
              <MessageCircle
                size={28}
                className="text-white"
                strokeWidth={2.5}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                }}
              />
            )}
          </div>

          {/* Pulse Ring */}
          {!expanded && (
            <div
              className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"
              style={{
                animationDuration: '2s'
              }}
            />
          )}
        </div>
      </button>

      {/* Expanded Panel */}
      {expanded && (
        <div
          className="fixed transition-all duration-300 ease-out"
          style={{
            bottom: `${position.bottom + 80}px`,
            right: `${position.right}px`,
            zIndex: position.zIndex - 1,
            width: deviceInfo?.isMobile ? 'calc(100vw - 40px)' : '360px',
            maxWidth: '360px',
          }}
        >
          {/* Glass Panel */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(16, 185, 129, 0.25)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                borderBottom: '1px solid rgba(16, 185, 129, 0.1)'
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)',
                  }}
                >
                  <MessageCircle size={20} className="text-emerald-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-emerald-800">تواصل عبر واتساب</h3>
                  <p className="text-xs text-emerald-600">سنرد عليك في أقرب وقت</p>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="w-full px-4 py-3 rounded-xl resize-none focus:outline-none"
                rows={4}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  color: '#059669',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="w-full mt-3 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: message.trim()
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)'
                    : 'rgba(16, 185, 129, 0.3)',
                  boxShadow: message.trim()
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                    : 'none',
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Send size={18} strokeWidth={2.5} />
                  <span>إرسال الرسالة</span>
                </div>
              </button>
            </div>

            {/* Quick Messages */}
            <div className="px-4 pb-4">
              <p className="text-xs text-emerald-600 mb-2 font-semibold">رسائل سريعة:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'استفسار عن الأسعار',
                  'كيف يمكنني الحجز؟',
                  'تواصل مع الدعم'
                ].map((quickMsg) => (
                  <button
                    key={quickMsg}
                    onClick={() => setMessage(quickMsg)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 transition-all duration-200 active:scale-95"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    {quickMsg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
