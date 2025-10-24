import { ReactNode } from 'react';

interface FloatingButtonsContainerProps {
  children: ReactNode;
}

export function FloatingButtonsContainer({ children }: FloatingButtonsContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
      {children}

      {/* Connecting Line Effect */}
      <div className="absolute top-0 right-7 bottom-0 w-0.5 -z-10">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, #D4AF37 20%, #D4AF37 80%, transparent 100%)'
          }}
        />
      </div>

      <style>{`
        @keyframes float-pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.4;
            transform: scaleY(1.05);
          }
        }
      `}</style>
    </div>
  );
}
