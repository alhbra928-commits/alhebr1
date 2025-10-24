import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface ModuleCard3DProps {
  id: string;
  title: string;
  subtitle: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  onClick: () => void;
  isActive?: boolean;
}

export function ModuleCard3D({
  id,
  title,
  subtitle,
  value,
  icon: Icon,
  gradient,
  iconBg,
  onClick,
  isActive = false
}: ModuleCard3DProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      className="relative cursor-pointer group"
      style={{
        perspective: '1500px',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      <div
        className={`relative transition-all duration-500 ease-out ${
          isActive ? 'scale-105' : ''
        }`}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) ${
            isHovered ? 'scale(1.05) translateZ(20px)' : 'scale(1)'
          }`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className={`relative overflow-hidden rounded-3xl p-8 shadow-2xl transition-all duration-500 ${
            isActive ? 'ring-4 ring-amber-400 ring-opacity-50' : ''
          }`}
          style={{
            background: gradient,
            transform: 'translateZ(30px)',
            boxShadow: isHovered
              ? '0 30px 60px -15px rgba(0, 0, 0, 0.3), 0 0 50px rgba(251, 191, 36, 0.2)'
              : '0 20px 40px -15px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16 transition-transform duration-700 group-hover:scale-150" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}
                style={{
                  background: iconBg,
                  transform: 'translateZ(40px)',
                }}
              >
                <Icon className="h-8 w-8 text-white" />
              </div>
              {isActive && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-white/80 font-medium">نشط</span>
                </div>
              )}
            </div>

            <div className="mb-4" style={{ transform: 'translateZ(20px)' }}>
              <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
              <p className="text-sm text-white/70">{subtitle}</p>
            </div>

            <div
              className="flex items-baseline gap-2"
              style={{ transform: 'translateZ(25px)' }}
            >
              <AnimatedCounter
                end={value}
                duration={2000}
                className="text-4xl font-black text-white"
              />
              <span className="text-lg text-white/60">عنصر</span>
            </div>

            <div
              className="mt-6 flex items-center justify-between text-white/80"
              style={{ transform: 'translateZ(15px)' }}
            >
              <span className="text-sm">اضغط للعرض</span>
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>

      <div
        className="absolute inset-0 rounded-3xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
          filter: 'blur(20px)',
          transform: 'translateZ(-10px)',
          opacity: isHovered ? 0.8 : 0,
        }}
      />
    </div>
  );
}
