import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bell, BellOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  isAutoResponse?: boolean;
  isAdminResponse?: boolean;
  adminName?: string;
  intent?: string;
  sentiment?: string;
  confidence?: number;
  suggestions?: SmartSuggestion[];
}

interface SmartSuggestion {
  id: string;
  text: string;
  type: 'quick_reply' | 'action' | 'link';
  action_data: any;
}

interface SmartFloatingButtonProps {
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

export const SmartFloatingButton: React.FC<SmartFloatingButtonProps> = ({
  externalOpen,
  onExternalOpenChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [userType, setUserType] = useState<'visitor' | 'investor' | 'owner'>('visitor');
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [showAiInfo, setShowAiInfo] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);
  const [currentSentiment, setCurrentSentiment] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isIPhone, setIsIPhone] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSession();
    detectUserType();
    loadSoundPreference();
    detectDevice();

    // Pulse animation every 5 seconds
    const pulseInterval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 5000);

    return () => clearInterval(pulseInterval);
  }, []);

  const detectDevice = () => {
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);

    // IMPORTANT: Also check window width for dev tools responsive mode
    const isMobileWidth = window.innerWidth <= 768;
    const isMobileMode = isMobileDevice || isMobileWidth;

    setIsIPhone(isIOS);
    setIsMobile(isMobileMode);

    // Prevent body scroll on mobile when modal is open
    if (isMobileMode && isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  };

  // Simple - just prevent body scroll on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (isOpen && sessionToken) {
      subscribeToMessages();
      loadRecentMessages();
      setHasNewMessage(false);
    }
  }, [isOpen, sessionToken]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect mobile on mount and window resize
  useEffect(() => {
    detectDevice();

    const handleResize = () => {
      detectDevice();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Handle keyboard appearance on mobile
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyboardResize = () => {
      // When keyboard appears, scroll input into view
      if (inputRef.current && document.activeElement === inputRef.current) {
        setTimeout(() => {
          inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };

    const handleFocus = () => {
      // Scroll to input when focused
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Also scroll messages to bottom
        scrollToBottom();
      }, 300);
    };

    window.addEventListener('resize', handleKeyboardResize);
    inputRef.current?.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('resize', handleKeyboardResize);
      inputRef.current?.removeEventListener('focus', handleFocus);
    };
  }, [isOpen]);

  const initializeSession = () => {
    let token = localStorage.getItem('smart_button_session');
    if (!token) {
      token = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('smart_button_session', token);
    }
    setSessionToken(token);
  };

  const loadSoundPreference = () => {
    const savedPref = localStorage.getItem('smart_button_sound');
    setSoundEnabled(savedPref !== 'false');
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('smart_button_sound', String(newValue));
  };

  const playNotificationSound = () => {
    if (!soundEnabled) return;

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSlzw+zdjkMKEnC63u+rXRcJPJfe8b9pIQUreMTv34xAChJqt+futV8ZCTuV3/K0ZyEGLnnB7dqJPgkSZ7Tt76pZFgk7ldvy0HcpBSx4w+3aijwJEmaw7O6pWBYJOpPa8s92KQUqdsLs2Yk+CRJlrureqVcWCTmP2PG8aiEGKnLB69yJPwkSZK7p3KlYFgk5jtnyw3cqBSp1wevaiT4JEmOt6dyoVxYKOIvY8sFzKgUqcsHr2ow+CRJiruncqFcWCTiJ1vHCcywFKnHC69uNPgkSYa3n3KhWFgk3h9Xzw3QrBSpwwuvbjT4JEmCr5tynVhUJN4TW88N0KwUqcMLr240+CRJfq+XcplgWCTaD1fPDdSsFKm/C69uOPgkSXqvl3KdZFgk2gtXyw3YrBSpvwevcjT4IEl6q5dynWRYJNoHV88N2KwUqb8Lr3I0+CBJdquTbp1gXCTV/1fPDdy0FKm7A69yNPggSXarl26dYFwk1f9b0w3gtBSpuwevcjj4IEl2q5NunWBcJNX/V88N4LQUqbsHr3I4+CBJdquXbp1gXCTR+1vPDeCwFKm3B69uNPggSXKvj26dXFwkxfdTzw3YrBSptwera jj4IElup49qnVxYJM3zU8sN0KwUqbMHq2ow9').split(',')[1];
      }
      audioRef.current.play().catch(e => console.log('Could not play sound:', e));
    } catch (e) {
      console.log('Sound not supported:', e);
    }
  };

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const detectUserType = () => {
    const path = window.location.pathname;

    if (path.includes('/investor')) {
      setUserType('investor');
      const investorData = sessionStorage.getItem('investor_session');
      if (investorData) {
        try {
          const data = JSON.parse(investorData);
          setUserId(data.userId);
        } catch (e) {
          console.error('Failed to parse investor session:', e);
        }
      }
    } else if (path.includes('/farm-owner')) {
      setUserType('owner');
      const ownerData = sessionStorage.getItem('owner_session');
      if (ownerData) {
        try {
          const data = JSON.parse(ownerData);
          setUserId(data.userId);
        } catch (e) {
          console.error('Failed to parse owner session:', e);
        }
      }
    } else {
      setUserType('visitor');
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`smart_button_${sessionToken}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `source_type=eq.smart_button,session_token=eq.${sessionToken}`
        },
        (payload) => {
          const newMessage = payload.new as any;
          const metadata = newMessage.metadata || {};

          // This message is for this session only
          if (true) {
            const msg: Message = {
              id: newMessage.id,
              content: newMessage.content,
              direction: newMessage.direction,
              timestamp: newMessage.created_at,
              isAutoResponse: metadata.auto_response,
              isAdminResponse: metadata.admin_response,
              adminName: metadata.admin_name
            };

            setMessages(prev => [...prev, msg]);

            // If window is closed and it's an outbound message, show notification
            if (!isOpen && newMessage.direction === 'outbound') {
              setHasNewMessage(true);
              playNotificationSound();

              if (metadata.admin_response) {
                setNotification(`💬 رد جديد من ${metadata.admin_name || 'الإدارة'}`);
              } else {
                setNotification('💬 لديك رسالة جديدة');
              }

              // Clear notification after 5 seconds
              setTimeout(() => setNotification(null), 5000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Sync with external control
  useEffect(() => {
    if (externalOpen !== undefined) {
      setIsOpen(externalOpen);
      if (externalOpen) {
        setHasNewMessage(false);
        setNotification(null);
      }
    }
  }, [externalOpen]);

  const handleOpen = async () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onExternalOpenChange) {
      onExternalOpenChange(newState);
    }
    setHasNewMessage(false);
    setNotification(null);

    // Track button click
    if (newState) {
      try {
        await supabase.rpc('track_smart_button_click', {
          p_session_token: sessionToken,
          p_user_type: userType
        });
      } catch (err) {
        console.error('Failed to track click:', err);
      }
    }
  };

  const loadRecentMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('source_type', 'smart_button')
        .eq('session_token', sessionToken)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        setMessages(
          data.reverse().map(msg => ({
            id: msg.id,
            content: msg.content,
            direction: msg.direction,
            timestamp: msg.created_at,
            isAutoResponse: msg.metadata?.auto_response,
            isAdminResponse: msg.metadata?.admin_response,
            adminName: msg.metadata?.admin_name
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    setSending(true);

    try {
      console.log('📤 Sending message to smart button...', {
        message: inputMessage.trim(),
        userType,
        sessionToken
      });

      const { data, error } = await supabase.rpc('handle_smart_button_ai_v2', {
        p_session_token: sessionToken,
        p_message: inputMessage.trim(),
        p_user_type: userType,
        p_user_id: userId,
        p_phone_number: null,
        p_page_url: window.location.href,
        p_ip_address: null
      });

      console.log('📥 Response received:', { data, error });

      if (error) {
        console.error('❌ RPC Error:', error);
        throw error;
      }

      if (data?.rate_limited) {
        alert(data.error || 'تم تجاوز الحد المسموح. يرجى الانتظار قليلاً.');
        setSending(false);
        return;
      }

      // Add user message to UI
      const userMessage: Message = {
        id: `temp_${Date.now()}`,
        content: inputMessage.trim(),
        direction: 'inbound',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Update AI info
      if (data?.intent) setCurrentIntent(data.intent);
      if (data?.sentiment) setCurrentSentiment(data.sentiment);
      if (data?.message_count) setMessageCount(parseInt(data.message_count));
      if (data?.suggestions) setSuggestions(data.suggestions);

      // If there's an auto response (including smart replies), add it
      if (data?.auto_response && data?.response) {
        // Debug log
        console.log('🔍 Smart Button Response Data:', {
          response: data.response
        });

        setTimeout(() => {
          const autoMessage: Message = {
            id: `auto_${Date.now()}`,
            content: data.response,
            direction: 'outbound',
            timestamp: new Date().toISOString(),
            isAutoResponse: true,
            intent: data.intent,
            sentiment: data.sentiment,
            confidence: data.confidence ? parseFloat(data.confidence) : undefined,
            suggestions: data.suggestions || []
          };

          setMessages(prev => [...prev, autoMessage]);
        }, 500);
      } else if (data?.message) {
        // Show fallback message
        setTimeout(() => {
          const fallbackMessage: Message = {
            id: `fallback_${Date.now()}`,
            content: data.message,
            direction: 'outbound',
            timestamp: new Date().toISOString(),
            isAutoResponse: true,
            intent: data.intent,
            sentiment: data.sentiment,
            suggestions: data.suggestions || []
          };
          setMessages(prev => [...prev, fallbackMessage]);
          if (data.suggestions) setSuggestions(data.suggestions);
        }, 500);
      }

      setInputMessage('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'investor':
        return 'مستثمر';
      case 'owner':
        return 'صاحب مزرعة';
      default:
        return 'زائر';
    }
  };

  const getMessageSenderLabel = (message: Message) => {
    if (message.direction === 'inbound') return 'أنت';
    if (message.isAdminResponse && message.adminName) return message.adminName;
    if (message.isAutoResponse) return 'مساعد ذكي 🤖';
    return 'الدعم';
  };

  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    if (suggestion.type === 'quick_reply' && suggestion.action_data?.message) {
      setInputMessage(suggestion.action_data.message);
    } else if (suggestion.type === 'action') {
      // Handle actions
      console.log('Action:', suggestion.action_data);
    } else if (suggestion.type === 'link' && suggestion.action_data?.url) {
      window.open(suggestion.action_data.url, '_blank');
    }
  };

  const getSentimentEmoji = () => {
    switch (currentSentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  const getIntentLabel = () => {
    const intents: Record<string, string> = {
      greeting: 'تحية',
      booking: 'حجز',
      pricing: 'أسعار',
      certificate: 'شهادة',
      payment: 'دفع',
      profits: 'أرباح',
      refund: 'استرداد',
      technical_issue: 'مشكلة تقنية',
      how_to: 'استفسار',
      timing: 'موعد',
      thanks: 'شكر',
      goodbye: 'وداع',
      question: 'سؤال',
      unknown: 'غير معروف'
    };
    return intents[currentIntent || ''] || currentIntent;
  };

  return (
    <>
      {/* Chat Popup - Mobile Optimized with Keyboard Support */}
      {isOpen && (
        <>
          {/* Backdrop - like MobileSidebar */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/60 z-[9998]"
              onClick={() => {
                setIsOpen(false);
                if (onExternalOpenChange) {
                  onExternalOpenChange(false);
                }
              }}
            />
          )}

          <div
            ref={chatContainerRef}
            className={`fixed bg-gray-900 shadow-2xl flex flex-col ${
              isMobile
                ? 'inset-0 top-0 left-0 right-0 bottom-0 z-[9999] rounded-none w-full h-full'
                : 'bottom-24 right-6 w-[420px] max-h-[650px] z-[9999] rounded-2xl overflow-hidden'
            }`}
            style={isMobile ? {
              position: 'fixed',
              zIndex: 9999,
              width: '100vw',
              height: '100vh',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            } : undefined}
            dir="rtl"
          >
          {/* Header - Compact */}
          <div
            className={`flex items-center justify-between flex-shrink-0 ${
              isMobile ? 'px-4 py-4 pt-safe sticky top-0 z-[10000]' : 'px-3 py-2'
            }`}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              ...(isMobile ? {
                paddingTop: 'max(1rem, env(safe-area-inset-top))',
                minHeight: '64px',
                position: 'sticky',
                top: 0,
                zIndex: 10000
              } : {})
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 ${
                isMobile ? 'w-10 h-10' : 'w-8 h-8'
              }`}>
                <span className={isMobile ? 'text-2xl' : 'text-xl'}>🤖</span>
              </div>
              <div className="min-w-0">
                <h3 className={`text-white font-bold truncate ${
                  isMobile ? 'text-lg' : 'text-sm'
                }`}>المساعد الذكي</h3>
                {isMobile && (
                  <p className="text-white/70 text-xs">متصل الآن</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={toggleSound}
                className={`rounded-full bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center transition-all ${
                  isMobile ? 'w-10 h-10' : 'w-7 h-7'
                }`}
                title={soundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
              >
                {soundEnabled ? (
                  <Bell className={isMobile ? 'w-5 h-5' : 'w-3.5 h-3.5'} style={{ color: 'white' }} />
                ) : (
                  <BellOff className={isMobile ? 'w-5 h-5' : 'w-3.5 h-3.5'} style={{ color: 'white' }} />
                )}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onExternalOpenChange) {
                    onExternalOpenChange(false);
                  }
                }}
                className={`rounded-full active:scale-95 flex items-center justify-center transition-all font-bold ${
                  isMobile
                    ? 'w-12 h-12 bg-red-500/90 hover:bg-red-600 shadow-lg'
                    : 'w-7 h-7 bg-white/20 hover:bg-white/30'
                }`}
                title="إغلاق"
              >
                <X className={isMobile ? 'w-6 h-6' : 'w-3.5 h-3.5'} style={{
                  color: 'white',
                  strokeWidth: isMobile ? 3 : 2
                }} />
              </button>
            </div>
          </div>

          {/* User Type Badge - Compact */}
          <div className={`bg-gray-800 border-b border-gray-700 flex-shrink-0 ${
            isMobile ? 'px-4 py-2' : 'px-3 py-1.5'
          }`}>
            <div className={`flex items-center justify-between ${
              isMobile ? 'text-sm' : 'text-xs'
            }`}>
              <span className="text-gray-400 truncate">
                <span className="text-emerald-400 font-semibold">{getUserTypeLabel()}</span>
              </span>
              {messages.length > 0 && (
                <span className="text-gray-500">{messages.length} رسالة</span>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div
            className={`flex-1 overflow-y-auto bg-gray-800/50 overscroll-contain ${
              isMobile ? 'p-4 space-y-2' : 'p-2 space-y-1.5'
            }`}
            style={{
              WebkitOverflowScrolling: 'touch',
              minHeight: isMobile ? '200px' : '150px'
            }}
          >
            {messages.length === 0 ? (
              <div className={`text-center ${
                isMobile ? 'py-20' : 'py-12'
              }`}>
                <div className={`rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border-2 border-emerald-500/30 ${
                  isMobile ? 'w-24 h-24' : 'w-20 h-20'
                }`}>
                  <span className={isMobile ? 'text-5xl' : 'text-4xl'}>🤖</span>
                </div>
                <p className={`text-white font-bold mb-3 ${
                  isMobile ? 'text-xl' : 'text-base'
                }`}>ابدأ محادثة جديدة</p>
                <p className={`text-gray-400 ${
                  isMobile ? 'text-base' : 'text-sm'
                }`}>نحن هنا للإجابة على استفساراتك</p>
                <div className={`mt-6 flex items-center justify-center gap-2 text-emerald-400 ${
                  isMobile ? 'text-sm' : 'text-xs'
                }`}>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span>متصل الآن</span>
                </div>
              </div>
            ) : (
              messages.slice(-15).map((message) => {
                return (
                <div
                  key={message.id}
                  className={`flex ${message.direction === 'inbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-xl shadow-lg ${
                      isMobile ? 'max-w-[80%] px-4 py-3' : 'max-w-[85%] px-3 py-2'
                    } ${
                      message.direction === 'inbound'
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
                        : message.isAutoResponse
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border border-blue-400/30'
                        : message.isAdminResponse
                        ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white border border-amber-400/30'
                        : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white'
                    }`}
                  >
                    {message.direction === 'outbound' && (
                      <p className={`font-bold opacity-90 mb-1 flex items-center gap-1 ${
                        isMobile ? 'text-xs' : 'text-[10px]'
                      }`}>
                        {message.isAutoResponse && <span>🤖</span>}
                        {message.isAdminResponse && <span>👤</span>}
                        <span>{getMessageSenderLabel(message)}</span>
                      </p>
                    )}
                    <p className={`leading-relaxed whitespace-pre-wrap break-words ${
                      isMobile ? 'text-sm' : 'text-xs'
                    }`}>{message.content}</p>

                    <p className={`opacity-70 mt-1.5 ${
                      isMobile ? 'text-xs' : 'text-[10px]'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
              })
            )}
            <div ref={conversationEndRef} />
          </div>

          {/* Smart Suggestions - More compact */}
          {suggestions.length > 0 && (
            <div className="px-3 py-3 bg-gradient-to-b from-gray-800 to-gray-900 border-t border-emerald-500/20 flex-shrink-0">
              <p className="text-xs font-bold text-emerald-400 mb-2.5 flex items-center gap-1.5">
                <span>✨</span>
                <span>اقتراحات ذكية</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-medium rounded-xl transition-all border-2 border-emerald-400/20 hover:border-emerald-400/40 active:scale-95 shadow-lg hover:shadow-emerald-500/30"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className={`bg-gray-900 border-t border-gray-700 flex-shrink-0 ${
            isMobile ? 'p-4' : 'p-2'
          }`}>
            <div className={`flex items-stretch ${
              isMobile ? 'gap-3' : 'gap-1.5'
            }`}>
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/966569335257"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-shrink-0 rounded-xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg ${
                  isMobile ? 'w-12 h-12' : 'w-9 h-9'
                }`}
                title="واتساب"
              >
                <svg className={`text-white ${
                  isMobile ? 'w-6 h-6' : 'w-4 h-4'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>

              {/* Input Field */}
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="اكتب رسالتك..."
                disabled={sending}
                className={`flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 ${
                  isMobile ? 'px-4 py-3 text-base' : 'px-2 py-2 text-xs'
                }`}
                autoComplete="off"
              />

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sending}
                className={`flex-shrink-0 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${
                  isMobile ? 'w-12 h-12' : 'w-9 h-9'
                }`}
                style={{
                  background: inputMessage.trim() && !sending
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : '#374151',
                  boxShadow: inputMessage.trim() && !sending
                    ? '0 4px 16px rgba(16, 185, 129, 0.5)'
                    : '0 2px 6px rgba(0, 0, 0, 0.2)'
                }}
              >
                {sending ? (
                  <div className={`border-2 border-white border-t-transparent rounded-full animate-spin ${
                    isMobile ? 'w-6 h-6' : 'w-4 h-4'
                  }`} />
                ) : (
                  <Send className={`text-white ${
                    isMobile ? 'w-6 h-6' : 'w-4 h-4'
                  }`} />
                )}
              </button>
            </div>

            {/* Helper Text */}
            <p className="text-xs text-gray-500 mt-2.5 text-center leading-relaxed">
              {soundEnabled ? '🔔' : '🔕'} تواصل مباشرة عبر الزر الأخضر
            </p>
          </div>
        </div>
        </>
      )}
    </>
  );
};
