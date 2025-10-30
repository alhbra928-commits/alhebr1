import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Zap, TrendingUp, ArrowRight, Sparkles, Database } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface GatewayProps {
  onEnter: () => void;
}

interface GatewaySettings {
  enabled: boolean;
  auto_enter_enabled: boolean;
  auto_enter_delay: number;
  welcome_text_ar: string;
  subtitle_text_ar: string;
  description_text_ar: string;
  show_particles: boolean;
  particle_density: 'low' | 'medium' | 'high';
  show_animated_bg: boolean;
  show_crown: boolean;
  show_progress_bar: boolean;
  animation_speed: 'slow' | 'medium' | 'fast';
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  alpha: number;
}

export function UltraModernGateway({ onEnter }: GatewayProps) {
  const [phase, setPhase] = useState<'init' | 'analyze' | 'process' | 'ready' | 'enter'>('init');
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('royal_gateway_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setSettings(data || {
        enabled: true,
        auto_enter_enabled: true,
        auto_enter_delay: 7,
        welcome_text_ar: 'الجيل القادم',
        subtitle_text_ar: 'منصة الزراعة الرقمية المتطورة',
        description_text_ar: 'استثمار ذكي • تقنية متقدمة • نتائج حقيقية',
        show_particles: true,
        particle_density: 'high',
        show_animated_bg: true,
        show_crown: true,
        show_progress_bar: true,
        animation_speed: 'medium',
      });
    } catch (error) {
      setSettings({
        enabled: true,
        auto_enter_enabled: true,
        auto_enter_delay: 7,
        welcome_text_ar: 'الجيل القادم',
        subtitle_text_ar: 'منصة الزراعة الرقمية المتطورة',
        description_text_ar: 'استثمار ذكي • تقنية متقدمة • نتائج حقيقية',
        show_particles: true,
        particle_density: 'high',
        show_animated_bg: true,
        show_crown: true,
        show_progress_bar: true,
        animation_speed: 'medium',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mouse tracking for 3D effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x: e.clientX, y: e.clientY });
      setRotation({ x: y * 10, y: x * 10 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Advanced 3D particle system
  useEffect(() => {
    if (!settings || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = settings.particle_density === 'low' ? 50 : settings.particle_density === 'high' ? 150 : 100;

    const colors = ['#10B981', '#34D399', '#059669', '#3B82F6', '#60A5FA', '#0EA5E9'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: Math.random() * 2 + 1,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      // Update and draw particles
      particles.forEach((p, i) => {
        // 3D movement
        p.z -= p.vz;
        if (p.z <= 0) {
          p.z = 1000;
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
        }

        // Project 3D to 2D
        const scale = 1000 / (1000 + p.z);
        const x2d = canvas.width / 2 + (p.x - canvas.width / 2) * scale;
        const y2d = canvas.height / 2 + (p.y - canvas.height / 2) * scale;
        const size = p.size * scale;

        // Wave effect
        const wave = Math.sin(time + i * 0.1) * 5;
        p.x += p.vx + Math.cos(time) * 0.2;
        p.y += p.vy + wave * 0.1;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = p.alpha * scale;

        // Outer glow
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 4);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(x2d - size * 4, y2d - size * 4, size * 8, size * 8);

        // Core
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Connect nearby particles
        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dz = p.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 150) {
            const scale1 = 1000 / (1000 + p.z);
            const scale2 = 1000 / (1000 + p2.z);
            const x1 = canvas.width / 2 + (p.x - canvas.width / 2) * scale1;
            const y1 = canvas.height / 2 + (p.y - canvas.height / 2) * scale1;
            const x2 = canvas.width / 2 + (p2.x - canvas.width / 2) * scale2;
            const y2 = canvas.height / 2 + (p2.y - canvas.height / 2) * scale2;

            ctx.save();
            ctx.globalAlpha = (1 - dist / 150) * 0.15;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      // Neural network effect
      const gridSize = 80;
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += gridSize) {
        const wave = Math.sin((x / canvas.width) * Math.PI * 4 + time) * 15;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        for (let y = 0; y < canvas.height; y += 20) {
          const waveY = Math.sin((y / canvas.height) * Math.PI * 2 + time) * 10;
          ctx.lineTo(x + wave, y + waveY);
        }
        ctx.stroke();
      }
      ctx.restore();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [settings]);

  // Phase progression
  useEffect(() => {
    if (!settings || loading) return;

    if (!settings.enabled) {
      onEnter();
      return;
    }

    const delay = settings.auto_enter_delay * 1000;

    const timer1 = setTimeout(() => setPhase('analyze'), 1000);
    const timer2 = setTimeout(() => setPhase('process'), 2500);
    const timer3 = setTimeout(() => setPhase('ready'), 4000);

    const timer4 = settings.auto_enter_enabled
      ? setTimeout(() => {
          setPhase('enter');
          setTimeout(() => onEnter(), 600);
        }, delay)
      : null;

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + (100 / (delay / 50)), 100));
    }, 50);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (timer4) clearTimeout(timer4);
      clearInterval(progressInterval);
    };
  }, [settings, loading, onEnter]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#050911] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#10B981] rounded-full animate-ping" />
          <div className="text-[#10B981] text-xl font-bold">تهيئة النظام...</div>
        </div>
      </div>
    );
  }

  if (!settings?.enabled) return null;

  const phaseTexts = {
    init: 'بدء التهيئة',
    analyze: 'تحليل البيانات',
    process: 'معالجة المعلومات',
    ready: 'جاهز للدخول',
    enter: 'جاري الدخول',
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden transition-all duration-700 ${
        phase === 'enter' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, #0a1628 0%, #050911 100%)',
      }}
    >
      {/* 3D Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* Dynamic Gradient Spotlight */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: mousePos.x - 400,
          top: mousePos.y - 400,
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6">

        {/* 3D Holographic Logo */}
        <div
          className={`mb-12 transition-all duration-1000 ${
            phase === 'init' ? 'opacity-0 scale-50 rotate-180' : 'opacity-100 scale-100 rotate-0'
          }`}
          style={{
            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <div className="relative w-40 h-40 sm:w-56 sm:h-56">
            {/* Rotating outer rings */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border opacity-30"
                style={{
                  borderColor: i % 2 === 0 ? '#10B981' : '#3B82F6',
                  borderWidth: 2,
                  transform: `scale(${1 + i * 0.15})`,
                  animation: `spin ${12 + i * 4}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                  boxShadow: `0 0 20px ${i % 2 === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                }}
              />
            ))}

            {/* Center hologram */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-[#10B981]/20 via-[#3B82F6]/20 to-[#10B981]/20 backdrop-blur-2xl border border-[#10B981]/40"
                style={{
                  transform: 'rotateX(20deg) rotateY(-20deg)',
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.5), inset 0 0 30px rgba(16, 185, 129, 0.1)',
                }}
              >
                {/* Animated gradient overlay */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-move 3s ease infinite',
                  }}
                />

                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sprout className="w-14 h-14 sm:w-20 sm:h-20 text-[#10B981] animate-pulse" strokeWidth={1.5} />
                </div>

                {/* Corner accents */}
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#10B981] rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#3B82F6] rounded-bl-lg" />
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#0EA5E9] rounded-tl-lg" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#34D399] rounded-br-lg" />

                {/* Floating data points */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-[#10B981] rounded-full"
                    style={{
                      top: `${Math.sin((i / 8) * Math.PI * 2) * 40 + 50}%`,
                      left: `${Math.cos((i / 8) * Math.PI * 2) * 40 + 50}%`,
                      animation: `ping 2s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Orbiting particles */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2"
                style={{
                  animation: `orbit ${4 + i}s linear infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                <div className="w-full h-full bg-[#10B981] rounded-full shadow-lg shadow-[#10B981]/50" />
              </div>
            ))}
          </div>
        </div>

        {/* Title Section */}
        <div
          className={`text-center max-w-5xl transition-all duration-1000 delay-300 ${
            phase === 'init' ? 'opacity-0 translate-y-20' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 leading-none">
            <span
              className="inline-block bg-gradient-to-r from-[#10B981] via-[#34D399] via-[#0EA5E9] to-[#10B981] bg-clip-text text-transparent"
              style={{
                backgroundSize: '300% 100%',
                animation: 'gradient-x 4s linear infinite',
                textShadow: '0 0 80px rgba(16, 185, 129, 0.3)',
              }}
            >
              {settings.welcome_text_ar}
            </span>
          </h1>

          {/* Subtitle Badge */}
          <div className="inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-10 py-3 sm:py-5 mb-6 rounded-full bg-gradient-to-r from-[#10B981]/10 via-[#10B981]/20 to-[#3B82F6]/10 backdrop-blur-xl border border-[#10B981]/30 shadow-2xl">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#10B981]" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white/90">{settings.subtitle_text_ar}</span>
            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-[#3B82F6]" style={{ animation: 'pulse 2s ease-in-out infinite', animationDelay: '0.5s' }} />
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-[#10B981]/70 font-medium mb-8">
            {settings.description_text_ar}
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { icon: '🤖', text: 'AI-Powered', color: '#10B981' },
              { icon: '📊', text: 'Real-Time Analytics', color: '#3B82F6' },
              { icon: '🔐', text: 'Blockchain Verified', color: '#0EA5E9' },
            ].map((item, i) => (
              <div
                key={i}
                className="px-4 py-2 rounded-full bg-[#0a1628]/50 backdrop-blur-xl border border-[#10B981]/20 text-sm font-bold text-white/80 flex items-center gap-2 hover:scale-105 transition-transform"
                style={{
                  boxShadow: `0 0 20px ${item.color}20`,
                  animation: 'fadeIn 0.5s ease-out forwards',
                  animationDelay: `${i * 0.1 + 0.5}s`,
                  opacity: 0,
                }}
              >
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Progress System */}
        {settings.show_progress_bar && (
          <div
            className={`w-full max-w-2xl transition-all duration-700 delay-500 ${
              phase === 'init' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
            }`}
          >
            {/* Phase Display */}
            <div className="flex items-center justify-center gap-8 mb-8">
              {['init', 'analyze', 'process', 'ready'].map((p, i) => {
                const isActive = ['init', 'analyze', 'process', 'ready'].indexOf(phase) >= i;
                const isCurrent = phase === p;
                return (
                  <div
                    key={p}
                    className="flex flex-col items-center gap-2 transition-all duration-500"
                    style={{
                      opacity: isActive ? 1 : 0.3,
                      transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${isCurrent ? 'animate-ping' : ''}`}
                      style={{
                        backgroundColor: isActive ? '#10B981' : '#334155',
                        boxShadow: isCurrent ? '0 0 20px rgba(16, 185, 129, 0.8)' : 'none',
                      }}
                    />
                    <div className="hidden sm:block text-xs text-[#10B981]/70 font-medium">
                      {phaseTexts[p as keyof typeof phaseTexts]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-[#0a1628] rounded-full border border-[#10B981]/30 overflow-hidden shadow-inner">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #10B981 0%, #34D399 50%, #0EA5E9 100%)',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite',
                  }}
                />
              </div>

              {/* Scanning beam */}
              <div
                className="absolute inset-y-0 w-1 bg-white/80 shadow-lg shadow-white/50"
                style={{
                  left: `${progress}%`,
                  transition: 'left 0.3s ease-out',
                  filter: 'blur(1px)',
                }}
              />
            </div>

            {/* Progress Info */}
            <div className="flex justify-between items-center mt-4 text-sm">
              <span className="text-[#10B981]/70 font-medium">{phaseTexts[phase]}</span>
              <span className="text-[#10B981] font-bold tabular-nums">{Math.round(progress)}%</span>
            </div>

            {/* Data Visualization */}
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-[#10B981] rounded-full"
                  style={{
                    height: `${Math.random() * 30 + 10}px`,
                    opacity: 0.3 + Math.random() * 0.5,
                    animation: `pulse 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        {phase === 'ready' && !settings.auto_enter_enabled && (
          <button
            onClick={onEnter}
            className="mt-12 group relative overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#0EA5E9] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />

            {/* Button */}
            <div className="relative flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-[#10B981] to-[#0EA5E9] rounded-2xl border border-white/20 shadow-2xl">
              <Sparkles className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-xl font-black text-white">دخول المنصة</span>
              <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          </button>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(120px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(120px) rotate(-360deg);
          }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes gradient-move {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}
