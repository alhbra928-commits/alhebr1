import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowDown, Waves } from 'lucide-react';
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

export function InnovativeGateway({ onEnter }: GatewayProps) {
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'ready' | 'exit'>('intro');
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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
        auto_enter_delay: 5,
        welcome_text_ar: 'استثمر في المستقبل',
        subtitle_text_ar: 'منصة الاستثمار الزراعي الذكية',
        description_text_ar: 'انضم لثورة الزراعة الرقمية',
        show_particles: true,
        particle_density: 'medium',
        show_animated_bg: true,
        show_crown: true,
        show_progress_bar: true,
        animation_speed: 'medium',
      });
    } catch (error) {
      setSettings({
        enabled: true,
        auto_enter_enabled: true,
        auto_enter_delay: 5,
        welcome_text_ar: 'استثمر في المستقبل',
        subtitle_text_ar: 'منصة الاستثمار الزراعي الذكية',
        description_text_ar: 'انضم لثورة الزراعة الرقمية',
        show_particles: true,
        particle_density: 'medium',
        show_animated_bg: true,
        show_crown: true,
        show_progress_bar: true,
        animation_speed: 'medium',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Canvas animation
  useEffect(() => {
    if (!settings || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const particleCount = settings.particle_density === 'low' ? 30 : settings.particle_density === 'high' ? 100 : 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: ['#C89B3C', '#D4AF37', '#3D5B4B'][Math.floor(Math.random() * 3)],
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.fill();

        // Connect nearby particles
        particles.slice(i + 1).forEach((p2) => {
          const dx = particle.x - p2.x;
          const dy = particle.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (1 - dist / 120) * 0.2;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [settings]);

  useEffect(() => {
    if (!settings || loading) return;

    if (!settings.enabled) {
      onEnter();
      return;
    }

    const delay = settings.auto_enter_delay * 1000;
    const revealTimer = setTimeout(() => setPhase('reveal'), 600);
    const readyTimer = setTimeout(() => setPhase('ready'), 2000);

    const exitTimer = settings.auto_enter_enabled
      ? setTimeout(() => {
          setPhase('exit');
          setTimeout(() => onEnter(), 800);
        }, delay)
      : null;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + (100 / (delay / 50));
      });
    }, 50);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(readyTimer);
      if (exitTimer) clearTimeout(exitTimer);
      clearInterval(progressInterval);
    };
  }, [settings, loading, onEnter]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0a0806] flex items-center justify-center">
        <div className="text-[#C89B3C] text-xl font-bold animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  if (!settings?.enabled) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden transition-all duration-700 ${
        phase === 'exit' ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 50%, #1a1510 0%, #0a0806 100%)',
      }}
    >
      {/* Canvas Background */}
      {settings.show_particles && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 opacity-60"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(200, 155, 60, 0.15) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6">

        {/* Hero Section */}
        <div
          className={`text-center max-w-4xl transition-all duration-1000 ${
            phase === 'intro' ? 'opacity-0 translate-y-20 scale-90' : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          {/* Animated Icons */}
          <div className="mb-8 sm:mb-12 flex justify-center items-center gap-4 sm:gap-8">
            <div
              className="relative group transition-all duration-500 hover:scale-110"
              style={{
                transform: `translateY(${Math.sin(Date.now() / 1000) * 10}px)`,
              }}
            >
              <div className="absolute inset-0 bg-[#C89B3C] rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative text-6xl sm:text-8xl filter drop-shadow-2xl">🌴</div>
            </div>

            <div className="relative">
              <div className="w-16 sm:w-24 h-16 sm:h-24 rounded-full border-4 border-[#C89B3C]/40 flex items-center justify-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-[#C89B3C] to-[#D4AF37] flex items-center justify-center">
                  <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 text-white animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </div>
              <div className="absolute inset-0 bg-[#D4AF37] rounded-full blur-2xl opacity-30 animate-pulse" />
            </div>

            <div
              className="relative group transition-all duration-500 hover:scale-110"
              style={{
                transform: `translateY(${Math.sin(Date.now() / 1000 + Math.PI) * 10}px)`,
              }}
            >
              <div className="absolute inset-0 bg-[#3D5B4B] rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative text-6xl sm:text-8xl filter drop-shadow-2xl">🫒</div>
            </div>
          </div>

          {/* Main Title with Glassmorphism */}
          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C89B3C]/10 to-transparent blur-3xl" />
            <h1
              className="relative text-4xl sm:text-6xl md:text-8xl font-black leading-tight mb-4"
              style={{
                background: 'linear-gradient(135deg, #E8E1D3 0%, #D4AF37 25%, #C89B3C 50%, #D4AF37 75%, #E8E1D3 100%)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientFlow 4s ease infinite',
                textShadow: '0 0 80px rgba(200, 155, 60, 0.5)',
              }}
            >
              {settings.welcome_text_ar}
            </h1>
          </div>

          {/* Subtitle */}
          <div className="relative mb-6 sm:mb-8">
            <div className="inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-full bg-gradient-to-r from-[#3D5B4B]/30 via-[#3D5B4B]/50 to-[#3D5B4B]/30 backdrop-blur-xl border border-[#3D5B4B]/50 shadow-2xl">
              <p className="text-xl sm:text-3xl md:text-4xl font-black text-[#F4EBDD] tracking-wide">
                {settings.subtitle_text_ar}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-base sm:text-xl md:text-2xl text-[#E8E1D3]/90 font-medium max-w-2xl mx-auto px-4">
            {settings.description_text_ar}
          </p>

          {/* Animated Waves */}
          <div className="mt-8 sm:mt-12 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <Waves
                key={i}
                className="w-6 sm:w-8 h-6 sm:h-8 text-[#3D5B4B] opacity-50"
                style={{
                  animation: `wave 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress Section */}
        {settings.show_progress_bar && (
          <div
            className={`mt-12 sm:mt-16 w-full max-w-md px-4 transition-all duration-700 delay-300 ${
              phase === 'intro' ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Progress Circle */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-8">
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="rgba(61, 91, 75, 0.3)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 - (282.7 * progress) / 100}
                  style={{
                    transition: 'stroke-dashoffset 0.3s ease',
                    filter: 'drop-shadow(0 0 8px rgba(200, 155, 60, 0.8))',
                  }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C89B3C" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#3D5B4B" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-black text-[#C89B3C]">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center">
              <p className="text-sm sm:text-base text-[#E8E1D3]/70 font-medium mb-4">جاري تحضير تجربتك الفريدة</p>

              {/* Dots */}
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#C89B3C]"
                    style={{
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ready Badge */}
        {phase === 'ready' && (
          <div
            className="mt-8 animate-bounce"
            style={{ animationDuration: '2s' }}
          >
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#3D5B4B] to-[#4A6F5C] shadow-2xl shadow-[#3D5B4B]/50">
              <div className="w-3 h-3 rounded-full bg-[#C89B3C] animate-ping" />
              <span className="text-lg font-black text-white">جاهز للدخول</span>
              <ArrowDown className="w-5 h-5 text-white animate-bounce" />
            </div>
          </div>
        )}

        {/* Manual Enter Button */}
        {!settings.auto_enter_enabled && phase === 'ready' && (
          <button
            onClick={onEnter}
            className="mt-8 group relative px-12 py-5 bg-gradient-to-r from-[#C89B3C] to-[#D4AF37] rounded-full font-black text-xl text-white shadow-2xl hover:shadow-[#C89B3C]/50 transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <span className="relative flex items-center gap-3">
              دخول المنصة
              <ArrowDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
            </span>
          </button>
        )}
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0806] to-transparent pointer-events-none" />

      {/* Animations */}
      <style>{`
        @keyframes gradientFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes wave {
          0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.5; }
          50% { transform: translateY(-10px) scaleY(1.2); opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
