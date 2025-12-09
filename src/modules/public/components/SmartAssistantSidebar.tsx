import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // تعطيل التمرير في الخلفية عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      // حفظ الموضع الحالي
      const scrollY = window.scrollY;

      // تعطيل التمرير
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // إعادة تفعيل التمرير عند الإغلاق
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

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

  if (!isOpen || !mounted) return null;

  const chatContent = (
    <>
      {/* Backdrop - طبقة خلفية داكنة */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999998,
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
        onClick={onClose}
      />

      {/* Chat Container - نافذة الشات المستقلة */}
      <div
        style={{
          position: 'fixed',
          top: '5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90vw',
          maxWidth: '500px',
          height: '90vh',
          zIndex: 9999999,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #f5f3ee 0%, #ffffff 100%)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          // تثبيت خاص لـ iPhone
          WebkitTransform: 'translateX(-50%)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          willChange: 'transform'
        }}
      >
        {/* Header - ثابت في الأعلى */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '20px',
            background: brandGradients.gold,
            borderBottom: `1px solid ${brandColors.border.light}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              >
                🤖
              </div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: brandColors.text.white,
                  margin: 0
                }}>
                  المساعد الذكي
                </h3>
                <p style={{
                  fontSize: '12px',
                  opacity: 0.9,
                  color: brandColors.text.white,
                  margin: 0
                }}>
                  متاح دائماً للإجابة على أسئلتك
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
                minWidth: '40px',
                minHeight: '40px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X style={{ width: '20px', height: '20px', color: brandColors.text.white }} />
            </button>
          </div>
        </div>

        {/* Messages Area - قابلة للتمرير */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            minHeight: '300px',
            maxHeight: 'calc(90vh - 220px)',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: '12px',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                animation: 'fadeInUp 0.3s ease-out'
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: message.sender === 'bot' ? '16px' : '12px',
                  background: message.sender === 'bot'
                    ? brandGradients.gold
                    : brandColors.primary.green,
                  animation: message.sender === 'bot' ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                }}
              >
                {message.sender === 'bot' ? (
                  '🤖'
                ) : (
                  <User style={{ width: '16px', height: '16px', color: brandColors.text.white }} />
                )}
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: '75%',
                  padding: message.sender === 'user' ? '18px 20px' : '16px',
                  borderRadius: '16px',
                  borderTopLeftRadius: message.sender === 'user' ? '16px' : '4px',
                  borderTopRightRadius: message.sender === 'user' ? '4px' : '16px',
                  background: message.sender === 'user'
                    ? 'linear-gradient(135deg, #2d5f3f 0%, #1e8449 100%)'
                    : 'rgba(245, 243, 238, 0.9)',
                  border: message.sender === 'bot' ? `1px solid ${brandColors.border.light}` : 'none',
                  boxShadow: message.sender === 'user'
                    ? '0 4px 12px rgba(29, 132, 73, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.65',
                  whiteSpace: 'pre-wrap',
                  color: message.sender === 'user' ? '#ffffff' : brandColors.text.primary,
                  fontWeight: message.sender === 'user' ? 600 : 400,
                  margin: 0,
                  textShadow: message.sender === 'user' ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none'
                }}>
                  {message.text}
                </p>
                <p style={{
                  fontSize: '11px',
                  marginTop: '8px',
                  opacity: message.sender === 'user' ? 0.95 : 0.7,
                  color: message.sender === 'user' ? '#f0f0f0' : brandColors.text.secondary,
                  fontWeight: message.sender === 'user' ? 500 : 400,
                  margin: '8px 0 0 0'
                }}>
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
            <div style={{ display: 'flex', gap: '12px', animation: 'fadeInUp 0.3s ease-out' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  background: brandGradients.gold,
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              >
                🤖
              </div>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  borderTopLeftRadius: '4px',
                  background: 'rgba(245, 243, 238, 0.9)',
                  border: `1px solid ${brandColors.border.light}`
                }}
              >
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[0, 150, 300].map((delay) => (
                    <div
                      key={delay}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: brandColors.primary.gold,
                        animation: `bounce 1s infinite`,
                        animationDelay: `${delay}ms`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 16px 8px 16px' }}>
            <p style={{
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '8px',
              color: brandColors.text.secondary
            }}>
              أسئلة شائعة:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleQuickQuestion(question)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: `1px solid ${brandColors.border.light}`,
                    color: brandColors.text.primary,
                    cursor: 'pointer',
                    transition: 'transform 0.3s',
                    minHeight: '36px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {question.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area - ثابت في الأسفل */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 100,
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTop: `1px solid ${brandColors.border.light}`,
            minHeight: '90px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب سؤالك هنا..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '16px',
                background: 'white',
                border: `1px solid ${brandColors.border.light}`,
                color: brandColors.text.primary,
                outline: 'none',
                minHeight: '48px'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              style={{
                width: '48px',
                height: '48px',
                minWidth: '48px',
                minHeight: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: inputValue.trim() ? brandGradients.gold : brandColors.border.light,
                border: 'none',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                opacity: inputValue.trim() ? 1 : 0.5,
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => inputValue.trim() && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Send style={{ width: '20px', height: '20px', color: brandColors.text.white }} />
            </button>
          </div>
          <p style={{
            fontSize: '11px',
            marginTop: '8px',
            textAlign: 'center',
            color: brandColors.text.secondary
          }}>
            اضغط Enter للإرسال
          </p>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-6px);
          }
        }

        /* تثبيت خاص لـ iPhone Safari */
        @supports (-webkit-touch-callout: none) {
          /* الخلفية ثابتة تماماً */
          div[style*="z-index: 9999998"] {
            position: fixed !important;
            width: 100vw !important;
            height: 100vh !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
          }

          /* نافذة الشات ثابتة تماماً */
          div[style*="z-index: 9999999"] {
            position: fixed !important;
            top: 5vh !important;
            height: 90vh !important;
            -webkit-transform: translateX(-50%) !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
            will-change: transform !important;
          }

          /* منع تكبير Safari عند التركيز على الـ input */
          input {
            font-size: 16px !important;
            -webkit-text-size-adjust: 100%;
          }

          /* تمرير سلس على iOS */
          div[style*="overflowY"] {
            -webkit-overflow-scrolling: touch !important;
          }
        }

        /* منع التمرير في الخلفية */
        body.modal-open {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
        }
      `}</style>
    </>
  );

  // استخدام Portal لوضع الشات في document.body مباشرة
  return createPortal(chatContent, document.body);
}
