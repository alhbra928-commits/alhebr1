import React, { useState, useEffect, useRef } from 'react';
import { Leaf, Zap, TrendingUp, ArrowRight } from 'lucide-react';
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

export function FuturisticAgriGateway({ onEnter }: GatewayProps) {
  const [phase, setPhase] = useState<'loading' | 'scanning' | 'ready' | 'entering'>('loading');
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanLine, setScanLine] = useState(0);
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
        auto_enter_delay: 6,
        welcome_text_ar: 'الزراعة الذكية',
        subtitle_text_ar: 'مستقبل الاستثمار الزراعي',
        description_text_ar: 'تقنية متقدمة • عوائد مستدامة • شفافية كاملة',
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
        auto_enter_delay: 6,
        welcome_text_ar: 'الزراعة الذكية',
        subtitle_text_ar: 'مستقبل الاستثمار الزراعي',
        description_text_ar: 'تقنية متقدمة • عوائد مستدامة • شفافية كاملة',
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

  // Animated grid background
  useEffect(() => {
    if (!settings || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      // Animated grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.lineWidth = 1;

      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        const wave = Math.sin((x / canvas.width) * Math.PI * 2 + time) * 10;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        const wave = Math.cos((y / canvas.height) * Math.PI * 2 + time) * 10;
        ctx.beginPath();
        ctx.moveTo(0, y + wave);
        ctx.lineTo(canvas.width, y + wave);
        ctx.stroke();
      }

      // Data streams
      if (settings.show_particles) {
        const streams = 8;
        for (let i = 0; i < streams; i++) {
          const x = (i / streams) * canvas.width;
          const gradient = ctx.createLinearGradient(x, 0, x, canvas.height);
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.3)');
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          const offset = ((time * 200) % canvas.height);
          ctx.fillRect(x - 1, offset - 100, 2, 100);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [settings]);

  // Scan line animation
  useEffect(() => {
    if (phase !== 'scanning') return;

    const interval = setInterval(() => {
      setScanLine(prev => (prev >= 100 ? 0 : prev + 2));
    }, 20);

    return () => clearInterval(interval);
  }, [phase]);

  // Phase progression
  useEffect(() => {
    if (!settings || loading) return;

    if (!settings.enabled) {
      onEnter();
      return;
    }

    const delay = settings.auto_enter_delay * 1000;

    const timer1 = setTimeout(() => setPhase('scanning'), 800);
    const timer2 = setTimeout(() => setPhase('ready'), 2500);

    const timer3 = settings.auto_enter_enabled
      ? setTimeout(() => {
          setPhase('entering');
          setTimeout(() => onEnter(), 500);
        }, delay)
      : null;

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + (100 / (delay / 50)), 100));
    }, 50);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (timer3) clearTimeout(timer3);
      clearInterval(progressInterval);
    };
  }, [settings, loading, onEnter]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0B1120] flex items-center justify-center">
        <div className="text-[#10B981] text-xl font-bold animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  if (!settings?.enabled) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden transition-all duration-500 ${
        phase === 'entering' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #0B1120 0%, #1a1f35 50%, #0B1120 100%)',
      }}
    >
      {/* Animated Grid Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
        style={{ pointerEvents: 'none' }}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#10B981]/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#3B82F6]/10 to-transparent" />
      </div>

      {/* Scan Line */}
      {phase === 'scanning' && (
        <div
          className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#10B981] to-transparent shadow-[0_0_20px_rgba(16,185,129,0.8)]"
          style={{
            top: `${scanLine}%`,
            transition: 'top 0.02s linear',
          }}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6">

        {/* Tech Logo */}
        <div
          className={`mb-8 sm:mb-12 transition-all duration-1000 ${
            phase === 'loading' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
          }`}
        >
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 -m-8 sm:-m-12">
              <div className="w-full h-full rounded-full border-2 border-[#10B981]/30 animate-spin" style={{ animationDuration: '8s' }} />
            </div>

            {/* Middle pulsing ring */}
            <div className="absolute inset-0 -m-4 sm:-m-6">
              <div className="w-full h-full rounded-full border-2 border-[#3B82F6]/40 animate-pulse" />
            </div>

            {/* Center hexagon */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#10B981] to-[#3B82F6] opacity-20 blur-2xl animate-pulse"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              />

              <div
                className="relative w-full h-full bg-gradient-to-br from-[#10B981]/20 to-[#3B82F6]/20 backdrop-blur-xl border-2 border-[#10B981]/50 flex items-center justify-center shadow-2xl"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              >
                <Leaf className="w-10 h-10 sm:w-14 sm:h-14 text-[#10B981] animate-pulse" />
              </div>
            </div>

            {/* Corner accents */}
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[#10B981]" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[#3B82F6]" />
          </div>
        </div>

        {/* Title Section */}
        <div
          className={`text-center mb-8 sm:mb-12 transition-all duration-1000 delay-300 ${
            phase === 'loading' ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black mb-4 sm:mb-6 leading-none tracking-tight">
            <span
              className="block bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#10B981] bg-clip-text text-transparent"
              style={{
                backgroundSize: '200% auto',
                animation: 'gradient-x 3s linear infinite',
              }}
            >
              {settings.welcome_text_ar}
            </span>
          </h1>

          {/* Tech Badge */}
          <div className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#10B981]/10 via-[#10B981]/20 to-[#10B981]/10 backdrop-blur-xl border border-[#10B981]/30 rounded-full mb-6">
            <Zap className="w-5 h-5 text-[#10B981] animate-pulse" />
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white/90">
              {settings.subtitle_text_ar}
            </span>
            <TrendingUp className="w-5 h-5 text-[#3B82F6] animate-bounce" />
          </div>

          {/* Features */}
          <p className="text-base sm:text-lg md:text-xl text-[#10B981]/80 font-medium max-w-2xl mx-auto">
            {settings.description_text_ar}
          </p>
        </div>

        {/* Status Display */}
        <div
          className={`transition-all duration-700 delay-500 ${
            phase === 'loading' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
          }`}
        >
          {/* Phase Indicator */}
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className={`w-2 h-2 rounded-full transition-all ${phase === 'loading' ? 'bg-[#10B981]' : 'bg-[#10B981]/30'}`} />
            <div className={`w-2 h-2 rounded-full transition-all ${phase === 'scanning' ? 'bg-[#10B981] animate-pulse' : phase === 'loading' ? 'bg-[#10B981]/30' : 'bg-[#10B981]/30'}`} />
            <div className={`w-2 h-2 rounded-full transition-all ${phase === 'ready' || phase === 'entering' ? 'bg-[#10B981] animate-pulse' : 'bg-[#10B981]/30'}`} />
          </div>

          {/* Progress Bar */}
          {settings.show_progress_bar && (
            <div className="w-full max-w-md mx-auto px-4">
              {/* Status Text */}
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-[#10B981]/70 font-medium">
                  {phase === 'loading' && 'تهيئة النظام...'}
                  {phase === 'scanning' && 'فحص البيانات...'}
                  {phase === 'ready' && 'جاهز للدخول'}
                  {phase === 'entering' && 'جاري الدخول...'}
                </span>
                <span className="text-[#10B981] font-bold tabular-nums">{Math.round(progress)}%</span>
              </div>

              {/* Progress Track */}
              <div className="relative h-2 bg-[#0B1120] rounded-full border border-[#10B981]/30 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${progress}%`,
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>

                {/* Scanning effect */}
                {phase === 'scanning' && (
                  <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-60 animate-scan" />
                )}
              </div>

              {/* Data points */}
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="w-1 bg-[#10B981] rounded-full animate-pulse" style={{ height: `${Math.random() * 20 + 10}px` }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ready Button */}
        {phase === 'ready' && (
          <button
            onClick={onEnter}
            className="mt-8 sm:mt-12 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#10B981] to-[#3B82F6] blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />

            <div className="relative flex items-center gap-3 px-10 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full border border-[#10B981]/30 shadow-2xl">
              <span className="text-lg sm:text-xl font-black text-white">
                {settings.auto_enter_enabled ? 'دخول تلقائي...' : 'دخول المنصة'}
              </span>
              <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          </button>
        )}

        {/* Tech Info Cards */}
        <div
          className={`mt-12 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl transition-all duration-1000 delay-700 ${
            phase === 'loading' ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
          }`}
        >
          {[
            { icon: '🌱', label: 'AI-Powered', value: 'ذكاء اصطناعي' },
            { icon: '📊', label: 'Real-Time', value: 'بيانات حية' },
            { icon: '🔒', label: 'Blockchain', value: 'سلسلة كتل' },
          ].map((item, i) => (
            <div
              key={i}
              className="relative group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/20 to-[#3B82F6]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative flex flex-col items-center gap-2 p-3 sm:p-4 bg-[#0B1120]/50 backdrop-blur-xl border border-[#10B981]/30 rounded-xl">
                <div className="text-2xl sm:text-3xl">{item.icon}</div>
                <div className="text-xs sm:text-sm text-[#10B981]/70 font-medium">{item.label}</div>
                <div className="text-xs sm:text-sm text-white/90 font-bold text-center">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(500%); }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-scan {
          animation: scan 2s infinite;
        }
      `}</style>
    </div>
  );
}
