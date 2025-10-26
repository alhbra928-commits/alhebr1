import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  isAutoResponse?: boolean;
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

  useEffect(() => {
    initializeSession();
    detectUserType();

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
    }
  }, [isOpen, sessionToken]);

  const initializeSession = () => {
    let token = localStorage.getItem('smart_button_session');
    if (!token) {
      token = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('smart_button_session', token);
    }
    setSessionToken(token);
  };

  const detectUserType = () => {
    const path = window.location.pathname;

    if (path.includes('/investor')) {
      setUserType('investor');
      // Try to get investor ID from session storage or context
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
      .channel('smart_button_messages')
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

          // Only show messages related to this session
          const metadata = newMessage.metadata || {};
          if (metadata.session_id || newMessage.direction === 'outbound') {
            setMessages(prev => [...prev, {
              id: newMessage.id,
              content: newMessage.content,
              direction: newMessage.direction,
              timestamp: newMessage.created_at,
              isAutoResponse: metadata.auto_response
            }]);
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

    // Track button click
    try {
      await supabase.rpc('track_smart_button_click', {
        p_session_token: sessionToken,
        p_user_type: userType
      });
    } catch (err) {
      console.error('Failed to track click:', err);
    }

    // Load recent messages
    loadRecentMessages();
  };

  const loadRecentMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('source_type', 'smart_button')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setMessages(
          data.reverse().map(msg => ({
            id: msg.id,
            content: msg.content,
            direction: msg.direction,
            timestamp: msg.created_at,
            isAutoResponse: msg.metadata?.auto_response
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
      const { data, error } = await supabase.rpc('handle_smart_button_message', {
        p_session_token: sessionToken,
        p_message: inputMessage.trim(),
        p_user_type: userType,
        p_user_id: userId,
        p_phone_number: null,
        p_page_url: window.location.href
      });

      if (error) throw error;

      // Add user message to UI immediately
      const userMessage: Message = {
        id: `temp_${Date.now()}`,
        content: inputMessage.trim(),
        direction: 'inbound',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // If there's an auto response, add it
      if (data?.auto_response && data?.response) {
        const autoMessage: Message = {
          id: `auto_${Date.now()}`,
          content: data.response,
          direction: 'outbound',
          timestamp: new Date().toISOString(),
          isAutoResponse: true
        };
        setTimeout(() => {
          setMessages(prev => [...prev, autoMessage]);
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

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isPulsing ? 'animate-pulse' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, #8B7355 0%, #A0916A 100%)',
          boxShadow: '0 4px 20px rgba(139, 115, 85, 0.4)'
        }}
        title="مركز التواصل الذكي"
      >
        <MessageCircle className="w-8 h-8 text-white" />

        {/* Notification badge */}
        {messages.filter(m => m.direction === 'outbound' && !m.isAutoResponse).length > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {messages.filter(m => m.direction === 'outbound' && !m.isAutoResponse).length}
          </div>
        )}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
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
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* User Type Badge */}
          <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
            <span className="text-xs text-gray-400">
              متصل كـ: <span className="text-[#A0916A] font-semibold">{getUserTypeLabel()}</span>
            </span>
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
              messages.slice(-10).map((message) => (
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
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.isAutoResponse && (
                      <p className="text-xs text-blue-300 mt-1">رد تلقائي 🤖</p>
                    )}
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
          </div>

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
              سيتم الرد عليك في أقرب وقت ممكن
            </p>
          </div>
        </div>
      )}
    </>
  );
};
