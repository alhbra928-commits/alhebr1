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

export const SmartFloatingButton: React.FC = () => {
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
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    initializeSession();
    detectUserType();
    loadSoundPreference();

    // Pulse animation every 5 seconds
    const pulseInterval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 5000);

    return () => clearInterval(pulseInterval);
  }, []);

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
          filter: `source_type=eq.smart_button`
        },
        (payload) => {
          const newMessage = payload.new as any;
          const metadata = newMessage.metadata || {};

          // Check if this message is for this session
          if (metadata.thread_id || newMessage.direction === 'outbound') {
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

  const handleOpen = async () => {
    setIsOpen(true);
    setHasNewMessage(false);
    setNotification(null);

    // Track button click
    try {
      await supabase.rpc('track_smart_button_click', {
        p_session_token: sessionToken,
        p_user_type: userType
      });
    } catch (err) {
      console.error('Failed to track click:', err);
    }
  };

  const loadRecentMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('source_type', 'smart_button')
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
      const { data, error } = await supabase.rpc('handle_smart_button_ai_v2', {
        p_session_token: sessionToken,
        p_message: inputMessage.trim(),
        p_user_type: userType,
        p_user_id: userId,
        p_phone_number: null,
        p_page_url: window.location.href,
        p_ip_address: null
      });

      if (error) throw error;

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
      {/* Floating Notification */}
      {notification && !isOpen && (
        <div
          className="fixed bottom-32 right-6 z-50 bg-gradient-to-r from-[#8B7355] to-[#A0916A] text-white px-6 py-3 rounded-xl shadow-2xl animate-bounce"
          style={{ minWidth: '200px' }}
        >
          <p className="text-sm font-semibold text-center">{notification}</p>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isPulsing && !isOpen ? 'animate-pulse' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, #8B7355 0%, #A0916A 100%)',
          boxShadow: hasNewMessage
            ? '0 4px 30px rgba(139, 115, 85, 0.8), 0 0 20px rgba(255, 215, 0, 0.6)'
            : '0 4px 20px rgba(139, 115, 85, 0.4)'
        }}
        title="مركز التواصل الذكي"
      >
        <MessageCircle className="w-8 h-8 text-white" />

        {/* Notification badge */}
        {hasNewMessage && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-ping">
            <div className="absolute w-6 h-6 bg-red-500 rounded-full"></div>
          </div>
        )}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div
          className="fixed bottom-32 right-6 z-50 w-96 h-[550px] bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 140px)' }}
          dir="rtl"
        >
          {/* Header */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, #8B7355 0%, #A0916A 100%)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">مركز التواصل الذكي 🌿</h3>
                <p className="text-white/80 text-xs">نحن هنا لمساعدتك</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                title={soundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
              >
                {soundEnabled ? (
                  <Bell className="w-4 h-4 text-white" />
                ) : (
                  <BellOff className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* User Type Badge */}
          <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                متصل كـ: <span className="text-[#A0916A] font-semibold">{getUserTypeLabel()}</span>
              </span>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {messages.length} رسالة
                  </span>
                )}
                {messageCount > 0 && (
                  <button
                    onClick={() => setShowAiInfo(!showAiInfo)}
                    className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                    title="معلومات الذكاء الاصطناعي"
                  >
                    🤖 AI
                  </button>
                )}
              </div>
            </div>
            {showAiInfo && currentIntent && (
              <div className="mt-2 p-2 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">النية: <span className="text-blue-300">{getIntentLabel()}</span></span>
                  <span className="text-gray-400">المشاعر: <span className="text-yellow-300">{getSentimentEmoji()} {currentSentiment}</span></span>
                </div>
                <div className="text-xs text-gray-500 mt-1">رسائل الجلسة: {messageCount}</div>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-800/50">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">ابدأ محادثة جديدة</p>
                <p className="text-gray-500 text-xs mt-2">نحن هنا للإجابة على استفساراتك</p>
              </div>
            ) : (
              messages.slice(-15).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === 'inbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.direction === 'inbound'
                        ? 'bg-[#8B7355] text-white'
                        : message.isAutoResponse
                        ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                        : message.isAdminResponse
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {message.direction === 'outbound' && (
                      <p className="text-xs opacity-70 mb-1">
                        {getMessageSenderLabel(message)}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={conversationEndRef} />
          </div>

          {/* Smart Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
              <p className="text-xs text-gray-400 mb-2">اقتراحات ذكية:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 bg-blue-500/20 text-blue-200 text-xs rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-gray-900 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="اكتب رسالتك..."
                disabled={sending}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A0916A] disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sending}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: inputMessage.trim() && !sending
                    ? 'linear-gradient(135deg, #8B7355 0%, #A0916A 100%)'
                    : '#374151'
                }}
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {soundEnabled ? '🔔' : '🔕'} سيتم الرد عليك في أقرب وقت ممكن
            </p>
          </div>
        </div>
      )}
    </>
  );
};
