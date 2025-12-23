import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

interface TickerMessage {
  id: string;
  message_ar: string;
  icon: string;
  priority: number;
  is_active: boolean;
}

export function SmartActivityTicker() {
  const [messages, setMessages] = useState<TickerMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  // تحميل الرسائل من قاعدة البيانات
  useEffect(() => {
    loadMessages();

    // الاشتراك في التحديثات اللحظية
    const channel = supabase
      .channel('ticker_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticker_messages'
        },
        (payload) => {
          console.log('[Ticker] 🔴 تحديث لحظي:', payload.eventType);
          loadMessages(); // إعادة تحميل الرسائل فوراً
        }
      )
      .subscribe((status) => {
        console.log('[Ticker] حالة الاتصال:', status);
      });

    return () => {
      console.log('[Ticker] إلغاء الاشتراك في التحديثات');
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-clone للتكرار السلس بدون فجوات
  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;
    const mask = maskRef.current;

    if (!track || !group || !mask || messages.length === 0) return;

    // إزالة النسخ القديمة
    track.querySelectorAll("[data-clone='1']").forEach(n => n.remove());

    const groupW = group.getBoundingClientRect().width;
    const maskW = mask.getBoundingClientRect().width;

    if (groupW <= 0 || maskW <= 0) return;

    // Set CSS variables
    track.style.setProperty("--group-w", `${groupW}px`);

    // سرعة مناسبة للجوال والديسكتوب
    const duration = Math.max(10, Math.min(20, 14 * (groupW / 1800)));
    track.style.setProperty("--ticker-speed", `${duration}s`);

    // نسخ المجموعات لملء 3x عرض الشاشة (للسلاسة)
    const targetW = maskW * 3;
    const needed = Math.ceil(targetW / groupW) + 1; // +1 للتأكد

    for (let i = 0; i < needed; i++) {
      const clone = group.cloneNode(true) as HTMLDivElement;
      clone.dataset.clone = "1";
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('ticker_messages')
        .select('id, message_ar, icon, priority, is_active')
        .is('deleted_at', null)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Ticker] ❌ خطأ في تحميل الرسائل:', error);
        return;
      }

      console.log('[Ticker] ✅ تم تحميل', data?.length || 0, 'رسالة');
      setMessages(data || []);
    } catch (error) {
      console.error('[Ticker] ❌ خطأ غير متوقع:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // إذا لا توجد رسائل، لا نعرض الشريط
  if (isLoading) {
    return null; // يمكن عرض loader بسيط هنا
  }

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 py-2.5 shadow-lg"
      style={{
        // ثبات كامل في الجوال - لا يتأثر بالسكرول
        position: 'fixed',
        willChange: 'auto', // منع التحسينات التي قد تسبب مشاكل
      }}
    >
      <div
        ref={maskRef}
        className="overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)'
        }}
      >
        <div
          ref={trackRef}
          className="flex gap-0"
          style={{
            animation: 'ticker-scroll var(--ticker-speed, 14s) linear infinite',
            willChange: 'transform',
          }}
        >
          <div
            ref={groupRef}
            className="flex gap-8 px-4"
            style={{
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-center gap-2 text-white"
                style={{ display: 'inline-flex' }}
              >
                <span className="text-lg" role="img" aria-label="icon">{msg.icon}</span>
                <span className="text-sm font-medium">{msg.message_ar}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-1 * var(--group-w, 1000px)));
          }
        }

        /* منع توقف الشريط في الجوال */
        @media (max-width: 768px) {
          .fixed {
            position: fixed !important;
            transform: translateZ(0); /* تفعيل hardware acceleration */
          }
        }
      `}</style>
    </div>
  );
}
