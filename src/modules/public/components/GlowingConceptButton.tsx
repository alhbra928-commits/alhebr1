import React, { useState, useEffect } from 'react';

interface TextRotation {
  icon: string;
  text: string;
}

interface GlowingConceptButtonProps {
  onClick: () => void;
}

export const GlowingConceptButton: React.FC<GlowingConceptButtonProps> = ({ onClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);

  const texts: TextRotation[] = [
    { icon: '🌴', text: 'اكتشف فكرة تأجير مزارع النخيل' },
    { icon: '🌳', text: 'تعرف على تأجير مزارع الزيتون' }
  ];

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, 5000);

    return () => clearInterval(textInterval);
  }, []);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 5000);

    return () => clearInterval(pulseInterval);
  }, []);

  const handleClick = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {
      console.log('Audio play failed');
    }
    onClick();
  };

  return (
    <div className="w-full flex justify-center items-center py-6 px-4 bg-gradient-to-r from-transparent via-amber-50/30 to-transparent relative" style={{ zIndex: 10 }}>
      <button
        onClick={handleClick}
        className={`
          glowing-concept-button
          relative overflow-hidden
          px-6 py-4 md:px-10 md:py-5
          rounded-full
          font-bold text-base md:text-xl text-white
          transition-all duration-500
          ${isPulsing ? 'scale-105' : 'scale-100'}
          hover:scale-110 active:scale-95
          shadow-2xl
        `}
        style={{
          zIndex: 10,
          fontFamily: 'Tajawal, sans-serif',
          background: 'linear-gradient(135deg, #D4AF37 0%, #F8E45F 25%, #B8960A 50%, #8B7500 75%, #6B5D00 100%)',
          border: '3px solid rgba(212, 175, 55, 0.6)',
          boxShadow: '0 8px 32px rgba(212, 175, 55, 0.4), 0 4px 16px rgba(212, 175, 55, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="relative z-10 flex items-center gap-3 justify-center">
          <span className="text-2xl md:text-3xl animate-bounce">
            {texts[currentIndex].icon}
          </span>
          <span
            className="whitespace-nowrap"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3), 0 0 10px rgba(212, 175, 55, 0.5)'
            }}
          >
            {texts[currentIndex].text}
          </span>
        </div>

        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s linear infinite'
          }}
        ></div>
      </button>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .glowing-concept-button:hover {
          background: linear-gradient(135deg, #F8E45F 0%, #FFD700 25%, #D4AF37 50%, #B8960A 75%, #8B7500 100%) !important;
          box-shadow:
            0 12px 48px rgba(255, 215, 0, 0.6),
            0 8px 24px rgba(212, 175, 55, 0.5),
            inset 0 2px 4px rgba(255, 255, 255, 0.4),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2) !important;
          border-color: rgba(255, 215, 0, 0.8) !important;
        }

        @media (max-width: 768px) {
          .glowing-concept-button {
            font-size: 0.9rem;
            padding: 0.75rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};
