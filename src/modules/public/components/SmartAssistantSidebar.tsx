import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { supabase } from '../../../lib/supabase';

interface SmartAssistantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface QuickQuestion {
  id: string;
  text: string;
  keywords: string[];
}

const quickQuestions: QuickQuestion[] = [
  { id: '1', text: 'ما هي أنواع المزارع المتاحة؟', keywords: ['أنواع', 'مزارع', 'متاحة'] },
  { id: '2', text: 'كيف يمكنني حجز أشجار؟', keywords: ['حجز', 'أشجار', 'طريقة'] },
  { id: '3', text: 'ما هي أسعار الأشجار؟', keywords: ['أسعار', 'سعر', 'تكلفة'] },
  { id: '4', text: 'متى يتم تسليم الشهادات؟', keywords: ['شهادات', 'تسليم', 'متى'] },
];

export function SmartAssistantSidebar({
  isOpen,
  onClose,
}: SmartAssistantSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // رسالة ترحيبية عند الفتح
      const welcomeMessage: Message = {
        id: '0',
        text: 'مرحباً بك في المساعد الذكي لمنصة المزاد! 🌿\n\nكيف يمكنني مساعدتك اليوم؟',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findMatchingResponse = async (userMessage: string): Promise<string> => {
    try {
      // البحث في قاعدة البيانات عن رد مناسب
      const { data: responses, error } = await supabase
        .from('whatsapp_auto_responses')
        .select('*')
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('priority', { ascending: false });

      if (error || !responses || responses.length === 0) {
        return 'شكراً على تواصلك! فريق الدعم سيساعدك قريباً. 🌟';
      }

      const userMessageLower = userMessage.toLowerCase();

      // البحث عن تطابق في الكلمات المفتاحية
      for (const response of responses) {
        const keyword = response.keyword?.toLowerCase() || '';

        if (keyword && userMessageLower.includes(keyword)) {
          // تحديث عداد الاستخدام
          await supabase
            .from('whatsapp_auto_responses')
            .update({
              usage_count: (response.usage_count || 0) + 1,
              last_used_at: new Date().toISOString()
            })
            .eq('id', response.id);

          return response.response_ar || response.response_en || 'شكراً على تواصلك!';
        }
      }

      // استخدام الرد الافتراضي fallback
      const fallbackResponse = responses.find((r: any) => r.is_default_fallback && r.fallback_enabled);
      if (fallbackResponse) {
        return fallbackResponse.response_ar || fallbackResponse.response_en || 'شكراً على سؤالك!';
      }

      return 'شكراً على سؤالك! يمكنك التواصل مع فريق الدعم للحصول على إجابة دقيقة. 💬\n\nأو استخدم الأسئلة الشائعة أعلاه للحصول على إجابات سريعة.';
    } catch (error) {
      console.error('Error finding response:', error);
      return 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى. 🔄';
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // محاكاة تأخير الكتابة
    setTimeout(async () => {
      const botResponseText = await findMatchingResponse(inputValue);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickQuestion = (question: QuickQuestion) => {
    setInputValue(question.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        style={{ zIndex: 9999998 }}
        onClick={onClose}
      />

      {/* Chat Sidebar */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md flex flex-col animate-slideInRight shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #f5f3ee 0%, #ffffff 100%)',
          zIndex: 9999999
        }}
      >
        {/* Header */}
        <div
          className="p-6 border-b"
          style={{
            background: brandGradients.gold,
            borderColor: brandColors.border.light,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse text-3xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                🤖
              </div>
              <div>
                <h3 className="text-xl font-black" style={{ color: brandColors.text.white }}>
                  المساعد الذكي
                </h3>
                <p className="text-xs opacity-90" style={{ color: brandColors.text.white }}>
                  متاح دائماً للإجابة على أسئلتك
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" style={{ color: brandColors.text.white }} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-fadeInUp ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'bot' ? 'animate-pulse text-base' : ''
                }`}
                style={{
                  background: message.sender === 'bot'
                    ? brandGradients.gold
                    : brandColors.primary.green,
                }}
              >
                {message.sender === 'bot' ? (
                  '🤖'
                ) : (
                  <User className="h-4 w-4" style={{ color: brandColors.text.white }} />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[75%] p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'rounded-tr-none'
                    : 'rounded-tl-none'
                }`}
                style={{
                  background: message.sender === 'user'
                    ? brandColors.primary.green
                    : 'rgba(245, 243, 238, 0.9)',
                  border: message.sender === 'bot'
                    ? `1px solid ${brandColors.border.light}`
                    : 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    color: message.sender === 'user'
                      ? brandColors.text.white
                      : brandColors.text.primary,
                  }}
                >
                  {message.text}
                </p>
                <p
                  className="text-xs mt-2 opacity-70"
                  style={{
                    color: message.sender === 'user'
                      ? brandColors.text.white
                      : brandColors.text.secondary,
                  }}
                >
                  {message.timestamp.toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-fadeInUp">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center animate-pulse text-base"
                style={{ background: brandGradients.gold }}
              >
                🤖
              </div>
              <div
                className="p-4 rounded-2xl rounded-tl-none"
                style={{
                  background: 'rgba(245, 243, 238, 0.9)',
                  border: `1px solid ${brandColors.border.light}`,
                }}
              >
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: brandColors.primary.gold,
                      animationDelay: '0ms',
                    }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: brandColors.primary.gold,
                      animationDelay: '150ms',
                    }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: brandColors.primary.gold,
                      animationDelay: '300ms',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs font-bold mb-2" style={{ color: brandColors.text.secondary }}>
              أسئلة شائعة:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 py-2 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: `1px solid ${brandColors.border.light}`,
                    color: brandColors.text.primary,
                  }}
                >
                  {question.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div
          className="p-4 border-t"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderColor: brandColors.border.light,
          }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب سؤالك هنا..."
              className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
              style={{
                background: 'white',
                border: `1px solid ${brandColors.border.light}`,
                color: brandColors.text.primary,
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: inputValue.trim() ? brandGradients.gold : brandColors.border.light,
              }}
            >
              <Send className="h-5 w-5" style={{ color: brandColors.text.white }} />
            </button>
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: brandColors.text.secondary }}>
            اضغط Enter للإرسال
          </p>
        </div>
      </div>
    </>
  );
}
