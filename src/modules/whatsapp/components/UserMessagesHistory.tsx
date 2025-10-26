import React, { useState, useEffect } from 'react';
import { MessageCircle, Check, CheckCheck, Clock, X, RefreshCw } from 'lucide-react';
import { userMessagesService, UserMessage } from '../services/userMessagesService';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

interface UserMessagesHistoryProps {
  userId: string;
  userType: 'investor' | 'owner';
  userPhone?: string;
}

export const UserMessagesHistory: React.FC<UserMessagesHistoryProps> = ({
  userId,
  userType,
  userPhone
}) => {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, [userId, userType]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await userMessagesService.getMessagesByUserId(userId, userType);
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (message: UserMessage) => {
    switch (message.status) {
      case 'sent':
        return <Check className="w-4 h-4" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-400" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <SmartErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        error={error || ''}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">سجل الرسائل</h3>
          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
            {messages.length} رسالة
          </span>
        </div>
        <button
          onClick={loadMessages}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
          title="تحديث"
        >
          <RefreshCw className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700/50">
          <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">لا توجد رسائل</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`bg-gray-800/50 rounded-lg p-4 border transition-all hover:border-green-500/30 ${
                message.direction === 'outbound'
                  ? 'border-gray-700/50'
                  : 'border-blue-500/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.direction === 'outbound'
                      ? 'bg-green-500/20'
                      : 'bg-blue-500/20'
                  }`}
                >
                  <MessageCircle
                    className={`w-5 h-5 ${
                      message.direction === 'outbound' ? 'text-green-400' : 'text-blue-400'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  {message.event_type && (
                    <div className="mb-2">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {userMessagesService.getEventTypeLabel(message.event_type)}
                      </span>
                    </div>
                  )}

                  <p className="text-white whitespace-pre-wrap mb-2">{message.content}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <span>
                        {new Date(message.created_at).toLocaleString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={userMessagesService.getStatusColor(message.status)}
                      >
                        {userMessagesService.getStatusLabel(message.status)}
                      </span>
                      {getStatusIcon(message)}
                    </div>

                    {message.direction === 'inbound' && (
                      <span className="text-blue-400">وارد</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
