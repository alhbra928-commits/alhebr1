import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, Send, Search, Check, CheckCheck, Clock,
  User, Phone, Tag, Archive, X, FileText, Zap
} from 'lucide-react';
import { inboxService, InboxThread, ConversationMessage } from '../services/inboxService';
import { whatsappService, WhatsAppTemplate } from '../../../services/whatsappService';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

export const SmartInboxPage: React.FC = () => {
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [stats, setStats] = useState({
    open_threads: 0,
    unread_messages: 0,
    sent_today: 0
  });

  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    loadStats();

    const messagesSubscription = inboxService.subscribeToNewMessages((message) => {
      if (selectedThread && message.recipient_phone === selectedThread.user_phone) {
        setConversation(prev => [...prev, message]);
        scrollToBottom();
      }
      loadThreads();
      loadStats();
    });

    const threadsSubscription = inboxService.subscribeToThreadUpdates(() => {
      loadThreads();
      loadStats();
    });

    return () => {
      messagesSubscription.unsubscribe();
      threadsSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadConversation(selectedThread.user_phone);
      inboxService.markThreadAsRead(selectedThread.id);
    }
  }, [selectedThread]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [threadsData, templatesData] = await Promise.all([
        inboxService.getThreads(),
        whatsappService.getTemplates()
      ]);
      setThreads(threadsData);
      setTemplates(templatesData.filter(t => t.is_active));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadThreads = async () => {
    try {
      const data = await inboxService.getThreads();
      setThreads(data);
    } catch (err: any) {
      console.error('Failed to load threads:', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await inboxService.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadConversation = async (phone: string) => {
    try {
      const data = await inboxService.getConversation(phone);
      setConversation(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedThread || sending) return;

    try {
      setSending(true);
      await inboxService.sendMessage(
        selectedThread.user_phone,
        messageText,
        selectedThread.user_name
      );
      setMessageText('');
      await loadConversation(selectedThread.user_phone);
      await loadStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSendTemplate = async (template: WhatsAppTemplate) => {
    if (!selectedThread || sending) return;

    const sampleVariables: Record<string, string> = {};
    template.variables.forEach(variable => {
      sampleVariables[variable] = `[${variable}]`;
    });

    if (template.variables.length > 0) {
      const confirmed = confirm(
        `سيتم إرسال القالب "${template.name}" مع القيم الافتراضية. هل تريد المتابعة؟\n\nالمتغيرات: ${template.variables.join(', ')}`
      );
      if (!confirmed) return;
    }

    try {
      setSending(true);
      await inboxService.sendTemplate(
        selectedThread.user_phone,
        template.id,
        sampleVariables,
        selectedThread.user_name
      );
      await loadConversation(selectedThread.user_phone);
      await loadStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadThreads();
      return;
    }

    try {
      const results = await inboxService.searchThreads(searchTerm);
      setThreads(results);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (status: 'open' | 'closed' | 'archived') => {
    if (!selectedThread) return;

    try {
      await inboxService.updateThreadStatus(selectedThread.id, status);
      setSelectedThread({ ...selectedThread, status });
      await loadThreads();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMessageStatusIcon = (message: ConversationMessage) => {
    if (message.direction === 'inbound') return null;

    switch (message.status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-400" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getUserTypeColor = (type?: string) => {
    switch (type) {
      case 'investor': return 'bg-purple-500/20 text-purple-400';
      case 'owner': return 'bg-amber-500/20 text-amber-400';
      case 'visitor': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getUserTypeLabel = (type?: string) => {
    switch (type) {
      case 'investor': return 'مستثمر';
      case 'owner': return 'صاحب مزرعة';
      case 'visitor': return 'زائر';
      default: return 'غير محدد';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" dir="rtl">
      <SmartErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        error={error || ''}
      />

      {/* إحصائيات سريعة في الأعلى */}
      <div className="absolute top-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 p-4 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-green-400" />
            <h1 className="text-xl font-bold text-white">صندوق الوارد الذكي</h1>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400">محادثات مفتوحة:</span>
              <span className="text-white font-bold">{stats.open_threads}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400">غير مقروء:</span>
              <span className="text-white font-bold">{stats.unread_messages}</span>
            </div>
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400">مرسل اليوم:</span>
              <span className="text-white font-bold">{stats.sent_today}</span>
            </div>
          </div>
        </div>
      </div>

      {/* القائمة الجانبية اليسرى - المحادثات */}
      <div className="w-80 bg-gray-800/50 border-l border-gray-700 flex flex-col mt-20">
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="بحث..."
              className="w-full pr-10 pl-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setSelectedThread(thread)}
              className={`w-full p-4 text-right border-b border-gray-700 transition-all hover:bg-gray-700/50 ${
                selectedThread?.id === thread.id ? 'bg-gray-700/70' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-semibold truncate">
                      {thread.user_name || thread.user_phone}
                    </h3>
                    {thread.unread_count > 0 && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {thread.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm truncate mb-1">
                    {thread.last_message || 'لا توجد رسائل'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${getUserTypeColor(thread.user_type)}`}>
                      {getUserTypeLabel(thread.user_type)}
                    </span>
                    {thread.last_message_at && (
                      <span className="text-xs text-gray-500">
                        {new Date(thread.last_message_at).toLocaleString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {threads.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">لا توجد محادثات</p>
            </div>
          )}
        </div>
      </div>

      {/* المنطقة الوسطى - المحادثة */}
      <div className="flex-1 flex flex-col mt-20">
        {selectedThread ? (
          <>
            {/* رأس المحادثة */}
            <div className="bg-gray-800/70 backdrop-blur-sm border-b border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">
                      {selectedThread.user_name || 'مستخدم'}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="w-3 h-3" />
                      {selectedThread.user_phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus('closed')}
                    disabled={selectedThread.status === 'closed'}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30 transition-all disabled:opacity-50"
                  >
                    إنهاء
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('archived')}
                    className="p-2 bg-gray-700 text-gray-400 rounded hover:bg-gray-600 transition-all"
                  >
                    <Archive className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* الرسائل */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === 'outbound' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      message.direction === 'outbound'
                        ? 'bg-green-500/20 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {getMessageStatusIcon(message)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>

            {/* إرسال رسالة */}
            <form onSubmit={handleSendMessage} className="bg-gray-800/70 backdrop-blur-sm border-t border-gray-700 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  إرسال
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">اختر محادثة للبدء</p>
            </div>
          </div>
        )}
      </div>

      {/* الجانب الأيمن - القوالب الجاهزة */}
      <div className="w-80 bg-gray-800/50 border-r border-gray-700 flex flex-col mt-20">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            القوالب الجاهزة
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSendTemplate(template)}
              disabled={!selectedThread || sending}
              className="w-full text-right p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-white font-medium text-sm">{template.name}</h4>
                <Zap className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-gray-400 text-xs line-clamp-2 mb-2">
                {template.content_ar}
              </p>
              {template.variables.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.variables.map(variable => (
                    <span
                      key={variable}
                      className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}

          {templates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">لا توجد قوالب</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
