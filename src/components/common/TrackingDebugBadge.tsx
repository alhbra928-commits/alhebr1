import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle, XCircle, Radio } from 'lucide-react';

interface TrackingStatus {
  sessionStatus: 'pending' | 'sent' | 'failed';
  lastEvent: string;
  eventStatus: 'pending' | 'sent' | 'failed';
  lastHttpCode: number | null;
  lastError: string | null;
  sessionId: string | null;
  eventsCount: number;
}

export function TrackingDebugBadge() {
  const [status, setStatus] = useState<TrackingStatus>({
    sessionStatus: 'pending',
    lastEvent: 'none',
    eventStatus: 'pending',
    lastHttpCode: null,
    lastError: null,
    sessionId: null,
    eventsCount: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Listen to tracking events
    const updateStatus = (event: CustomEvent) => {
      const { type, success, httpCode, error, eventName, sessionId } = event.detail;

      setStatus(prev => {
        const updated = { ...prev };

        if (type === 'session') {
          updated.sessionStatus = success ? 'sent' : 'failed';
          updated.sessionId = sessionId || prev.sessionId;
          updated.lastHttpCode = httpCode || null;
          updated.lastError = error || null;
        } else if (type === 'event') {
          updated.eventStatus = success ? 'sent' : 'failed';
          updated.lastEvent = eventName || 'unknown';
          updated.lastHttpCode = httpCode || null;
          updated.lastError = error || null;
          if (success) {
            updated.eventsCount = prev.eventsCount + 1;
          }
        }

        return updated;
      });
    };

    window.addEventListener('tracking-status' as any, updateStatus);

    // Check localStorage for session
    const checkSession = () => {
      const sessionId = localStorage.getItem('analytics_session_id');
      if (sessionId && !status.sessionId) {
        setStatus(prev => ({
          ...prev,
          sessionId,
          sessionStatus: 'sent',
        }));
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 2000);

    return () => {
      window.removeEventListener('tracking-status' as any, updateStatus);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (s: 'pending' | 'sent' | 'failed') => {
    if (s === 'sent') return 'bg-green-500';
    if (s === 'failed') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getStatusIcon = (s: 'pending' | 'sent' | 'failed') => {
    if (s === 'sent') return <CheckCircle className="w-3 h-3" />;
    if (s === 'failed') return <XCircle className="w-3 h-3" />;
    return <Radio className="w-3 h-3 animate-pulse" />;
  };

  return (
    <div className="fixed bottom-4 left-4 z-[99999]" dir="ltr">
      {/* Compact Badge */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-2xl border border-white/20 hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          <span className="text-xs font-mono">
            S:{status.sessionStatus[0].toUpperCase()} E:{status.eventsCount}
          </span>
        </button>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-black/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-white/20 w-80 font-mono text-xs">
          <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="font-bold">Tracking Debug</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Session Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Session:</span>
              <div className="flex items-center gap-1">
                {getStatusIcon(status.sessionStatus)}
                <span className={`px-2 py-1 rounded ${getStatusColor(status.sessionStatus)} text-white text-xs`}>
                  {status.sessionStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {status.sessionId && (
              <div className="text-white/50 text-[10px] truncate">
                ID: {status.sessionId.slice(0, 12)}...
              </div>
            )}

            {/* Event Status */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-white/70">Last Event:</span>
              <div className="flex items-center gap-1">
                {getStatusIcon(status.eventStatus)}
                <span className="text-green-400">{status.lastEvent}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/70">Events Count:</span>
              <span className="text-blue-400 font-bold">{status.eventsCount}</span>
            </div>

            {/* HTTP Status */}
            {status.lastHttpCode && (
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-white/70">HTTP Code:</span>
                <span className={`${status.lastHttpCode === 200 || status.lastHttpCode === 201 ? 'text-green-400' : 'text-red-400'}`}>
                  {status.lastHttpCode}
                </span>
              </div>
            )}

            {/* Error */}
            {status.lastError && (
              <div className="pt-2 border-t border-white/10">
                <div className="text-red-400 text-[10px]">
                  Error: {status.lastError}
                </div>
              </div>
            )}

            {/* Network Proof */}
            <div className="pt-2 border-t border-white/10 text-center">
              <button
                onClick={() => {
                  console.log('%c🔍 TRACKING DEBUG STATUS', 'background: #000; color: #0f0; font-size: 14px; padding: 4px;');
                  console.log('Session ID:', status.sessionId);
                  console.log('Session Status:', status.sessionStatus);
                  console.log('Events Count:', status.eventsCount);
                  console.log('Last Event:', status.lastEvent);
                  console.log('Last HTTP Code:', status.lastHttpCode);
                  console.log('Last Error:', status.lastError);
                }}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                View in Console
              </button>
            </div>
          </div>

          {/* Hint */}
          <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-white/40 text-center">
            Check Network tab (F12) for requests to Supabase
          </div>
        </div>
      )}
    </div>
  );
}
