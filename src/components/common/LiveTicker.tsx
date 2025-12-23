import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

interface TickerMessage {
  id: string;
  message_ar: string;
  icon: string;
  priority: number;
}

export function LiveTicker() {
  const [messages, setMessages] = useState<TickerMessage[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();

    // Setup Realtime subscription
    const channel = supabase
      .channel('live_ticker_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ticker_messages' },
        (payload) => {
          console.log('[LiveTicker] Realtime event:', payload.eventType);
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-clone للتكرار السلس
  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;
    const mask = maskRef.current;
    if (!track || !group || !mask || messages.length === 0) return;

    // Remove old clones
    track.querySelectorAll("[data-clone='1']").forEach(n => n.remove());

    const groupW = group.getBoundingClientRect().width;
    const maskW = mask.getBoundingClientRect().width;

    if (groupW <= 0 || maskW <= 0) return;

    // Set CSS variables
    track.style.setProperty("--group-w", `${groupW}px`);
    const duration = Math.max(10, Math.min(20, 14 * (groupW / 1800)));
    track.style.setProperty("--ticker-speed", `${duration}s`);

    // Clone groups to fill 3x screen width
    const targetW = maskW * 3;
    const needed = Math.ceil(targetW / groupW);

    for (let i = 0; i < needed; i++) {
      const clone = group.cloneNode(true) as HTMLDivElement;
      clone.dataset.clone = "1";
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('ticker_messages')
        .select('id, message_ar, icon, priority')
        .is('deleted_at', null)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[LiveTicker] Error loading messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('[LiveTicker] Load error:', error);
    }
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 py-2 shadow-md">
      <div
        ref={maskRef}
        className="overflow-hidden"
        style={{ maskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)' }}
      >
        <div
          ref={trackRef}
          className="flex gap-0"
          style={{
            animation: 'ticker-scroll var(--ticker-speed, 14s) linear infinite',
            willChange: 'transform',
          }}
        >
          <div ref={groupRef} className="flex gap-8 px-4" style={{ whiteSpace: 'nowrap' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-center gap-2 text-white"
              >
                <span className="text-lg">{msg.icon}</span>
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
      `}</style>
    </div>
  );
}
