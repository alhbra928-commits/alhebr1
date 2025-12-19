/**
 * Simple PING Debug Badge
 * شارة بسيطة تعرض حالة الـ PING - sent/failed مع الكود
 */

import { useEffect, useState } from 'react';

interface PingStatus {
  status: 'pending' | 'sent' | 'failed';
  httpCode: number | null;
  error: string | null;
  elapsed: number | null;
  id: string | null;
}

export function PingDebugBadge() {
  const [pingStatus, setPingStatus] = useState<PingStatus>({
    status: 'pending',
    httpCode: null,
    error: null,
    elapsed: null,
    id: null,
  });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handlePingStatus = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;

      if (detail.success) {
        setPingStatus({
          status: 'sent',
          httpCode: detail.httpCode,
          error: null,
          elapsed: detail.elapsed,
          id: detail.id,
        });
      } else {
        setPingStatus({
          status: 'failed',
          httpCode: detail.httpCode,
          error: detail.error,
          elapsed: detail.elapsed || null,
          id: null,
        });
      }
    };

    window.addEventListener('ping-status', handlePingStatus);

    return () => {
      window.removeEventListener('ping-status', handlePingStatus);
    };
  }, []);

  const getStatusColor = () => {
    switch (pingStatus.status) {
      case 'sent':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (pingStatus.status) {
      case 'sent':
        return 'SENT';
      case 'failed':
        return 'FAILED';
      case 'pending':
        return 'PENDING';
    }
  };

  return (
    <div
      className="fixed bottom-4 left-4 z-[99999] font-mono text-xs"
      onClick={() => setExpanded(!expanded)}
      style={{ cursor: 'pointer' }}
    >
      {!expanded ? (
        // Compact Mode
        <div
          className={`${getStatusColor()} text-white px-3 py-2 rounded-lg shadow-lg border-2 border-white`}
        >
          <div className="flex items-center gap-2">
            <span className="animate-pulse">📡</span>
            <span className="font-bold">{getStatusText()}</span>
            {pingStatus.httpCode && (
              <span className="opacity-80">[{pingStatus.httpCode}]</span>
            )}
          </div>
        </div>
      ) : (
        // Expanded Mode
        <div
          className={`${getStatusColor()} text-white p-4 rounded-lg shadow-2xl border-2 border-white min-w-[280px]`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-white/30 pb-2">
              <span className="font-bold text-sm">PING DEBUG</span>
              <span className="text-xl">📡</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="opacity-80">Status:</span>
                <span className="font-bold">{getStatusText()}</span>
              </div>

              {pingStatus.httpCode && (
                <div className="flex justify-between">
                  <span className="opacity-80">HTTP Code:</span>
                  <span className="font-bold">{pingStatus.httpCode}</span>
                </div>
              )}

              {pingStatus.elapsed && (
                <div className="flex justify-between">
                  <span className="opacity-80">Time:</span>
                  <span className="font-bold">{pingStatus.elapsed}ms</span>
                </div>
              )}

              {pingStatus.id && (
                <div className="flex flex-col">
                  <span className="opacity-80">ID:</span>
                  <span className="font-mono text-[9px] break-all">
                    {pingStatus.id}
                  </span>
                </div>
              )}

              {pingStatus.error && (
                <div className="flex flex-col mt-2 pt-2 border-t border-white/30">
                  <span className="opacity-80">Error:</span>
                  <span className="text-[10px] break-all">
                    {pingStatus.error}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] opacity-60 pt-2 border-t border-white/30">
              Click to minimize
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
