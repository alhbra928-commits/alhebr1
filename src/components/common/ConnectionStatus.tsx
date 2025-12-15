import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const { error } = await supabase
        .from('platform_texts')
        .select('id')
        .limit(1)
        .maybeSingle();

      setIsOnline(!error);
      setLastCheckTime(new Date());
    } catch (error) {
      setIsOnline(false);
      setLastCheckTime(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();

    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50
        bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl
        flex items-center gap-3 animate-pulse"
      style={{
        direction: 'rtl',
      }}
    >
      <WifiOff className="w-5 h-5" />
      <span className="font-semibold">انقطع الاتصال بالإنترنت</span>
      <button
        onClick={checkConnection}
        disabled={isChecking}
        className="p-1 hover:bg-red-600 rounded-full transition-colors disabled:opacity-50"
        title="إعادة المحاولة"
      >
        <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}

export function QuietConnectionMonitor() {
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const checkConnection = async () => {
    try {
      const { error } = await supabase
        .from('platform_texts')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (error) {
        setIsOnline(false);
        setRetryCount(prev => prev + 1);
      } else {
        setIsOnline(true);
        setRetryCount(0);
      }
    } catch (error) {
      setIsOnline(false);
      setRetryCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    checkConnection();

    const interval = setInterval(() => {
      if (!isOnline) {
        checkConnection();
      }
    }, 5000); // Check every 5 seconds when offline

    return () => clearInterval(interval);
  }, [isOnline]);

  if (isOnline) {
    return (
      <div
        className="fixed top-4 right-4 z-50
          bg-green-500 text-white px-4 py-2 rounded-full shadow-lg
          flex items-center gap-2 text-sm"
        style={{ direction: 'rtl' }}
      >
        <Wifi className="w-4 h-4" />
        <span>متصل</span>
      </div>
    );
  }

  return (
    <div
      className="fixed top-4 right-4 z-50
        bg-red-500 text-white px-4 py-2 rounded-full shadow-lg
        flex items-center gap-2 text-sm animate-pulse"
      style={{ direction: 'rtl' }}
    >
      <WifiOff className="w-4 h-4" />
      <span>غير متصل ({retryCount} محاولة)</span>
    </div>
  );
}
