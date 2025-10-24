import React, { useState } from 'react';
import { ArrowRight, Home } from 'lucide-react';

interface BackButtonProps {
  onClick?: () => void;
  onBack?: () => void;
  label?: string;
}

export function BackButton({ onClick, onBack, label = 'العودة للوحة التحكم' }: BackButtonProps) {
  const handleClick = onClick || onBack || (() => {});
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`
        group relative
        px-6 py-3.5
        bg-gradient-to-br from-[#C89B3C] to-[#D4AF37]
        rounded-2xl
        flex items-center gap-3
        transition-all duration-300 ease-out
        overflow-hidden
        ${isPressed ? 'scale-95' : isHovered ? 'scale-105' : 'scale-100'}
        ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
        border-2 border-white/20
        backdrop-blur-sm
      `}
      style={{
        transform: isPressed
          ? 'translateY(2px)'
          : isHovered
            ? 'translateY(-4px) rotateX(5deg)'
            : 'translateY(0)',
      }}
    >
      <div className={`
        absolute inset-0
        bg-gradient-to-r from-white/0 via-white/30 to-white/0
        opacity-0 group-hover:opacity-100
        transition-all duration-1000
        ${isHovered ? 'translate-x-full' : '-translate-x-full'}
      `}></div>

      <div className={`
        absolute inset-0
        bg-gradient-to-br from-[#E8C170] to-[#C89B3C]
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300
      `}></div>

      <div className="relative z-10 flex items-center gap-3">
        <div className={`
          w-10 h-10
          bg-white/20 backdrop-blur-sm
          rounded-xl
          flex items-center justify-center
          transition-all duration-300
          ${isHovered ? 'rotate-[-15deg] scale-110' : 'rotate-0 scale-100'}
        `}>
          <ArrowRight className={`
            h-5 w-5 text-white
            transition-transform duration-300
            ${isHovered ? 'translate-x-1' : 'translate-x-0'}
          `} />
        </div>

        <div className="flex flex-col items-start">
          <span className="text-white font-bold text-base leading-none">
            {label}
          </span>
          <span className="text-white/80 text-xs mt-1">
            لوحة التحكم الرئيسية
          </span>
        </div>

        <Home className={`
          h-5 w-5 text-white/80
          transition-all duration-300
          ${isHovered ? 'scale-125 rotate-12' : 'scale-100'}
        `} />
      </div>

      <div className={`
        absolute bottom-0 left-0 right-0
        h-0.5 bg-white/40
        transition-all duration-300
        ${isHovered ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
      `}></div>

      <div className={`
        absolute top-1 right-1
        w-16 h-16
        bg-white/10
        rounded-full
        blur-xl
        transition-all duration-500
        ${isHovered ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}
      `}></div>
    </button>
  );
}
