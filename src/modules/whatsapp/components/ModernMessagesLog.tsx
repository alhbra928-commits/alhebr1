import { useState, useEffect } from 'react';
import {
  MessageCircle, Search, Download, RefreshCw, CheckCheck, Send,
  Clock, AlertCircle, Eye, X, Calendar, Filter, TrendingUp, Users,
  Zap, BarChart3, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { whatsappService, WhatsAppMessage } from '../services/whatsappService';
import { whatsappRealtimeService } from '../services/whatsappRealtimeService';

export function ModernMessagesLog() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRecipientType, setSelectedRecipientType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('timeline');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  useEffect(() => {
    loadMessages();

    whatsappRealtimeService.connect();

    const unsubscribeMessages = whatsappRealtimeService.onNewMessage(async (newMessage) => {
      setMessages(prev => [newMessage as any, ...prev]);
      setIsRealtimeConnected(true);
    });

    const unsubscribeStatus = whatsappRealtimeService.onStatusChange(async ({ messageId, newStatus }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, status: newStatus as any } : msg
        )
      );
    });

    return () => {
      unsubscribeMessages();
      unsubscribeStatus();
    };
  }, [selectedStatus, selectedType, selectedRecipientType, dateFrom, dateTo]);

  const loadMessages = async () => {
    try {
      if (!loading) setLoading(true);
      const filters: any = {};

      if (selectedStatus !== 'all') filters.status = selectedStatus;
      if (selectedType !== 'all') filters.message_type = selectedType;
      if (selectedRecipientType !== 'all') filters.recipient_type = selectedRecipientType;
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;

      const data = await whatsappService.getMessages({ ...filters, limit: 500 });
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(message =>
    message.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.recipient_phone.includes(searchTerm) ||
    message.message_content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: filteredMessages.length,
    delivered: filteredMessages.filter(m => m.status === 'delivered').length,
    sent: filteredMessages.filter(m => m.status === 'sent').length,
    read: filteredMessages.filter(m => m.status === 'read').length,
    failed: filteredMessages.filter(m => m.status === 'failed').length,
    pending: filteredMessages.filter(m => m.status === 'pending').length,
  };

  const successRate = stats.total > 0
    ? Math.round(((stats.delivered + stats.read) / stats.total) * 100)
    : 0;

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusConfig = (status: string) => {
    const configs = {
      delivered: {
        bg: 'bg-emerald-500',
        text: 'text-emerald-700',
        lightBg: 'bg-emerald-50',
        label: 'مستلم',
        icon: CheckCheck,
        gradient: 'from-emerald-500 to-green-600'
      },
      sent: {
        bg: 'bg-blue-500',
        text: 'text-blue-700',
        lightBg: 'bg-blue-50',
        label: 'مرسل',
        icon: Send,
        gradient: 'from-blue-500 to-cyan-600'
      },
      read: {
        bg: 'bg-purple-500',
        text: 'text-purple-700',
        lightBg: 'bg-purple-50',
        label: 'مقروء',
        icon: Eye,
        gradient: 'from-purple-500 to-pink-600'
      },
      failed: {
        bg: 'bg-red-500',
        text: 'text-red-700',
        lightBg: 'bg-red-50',
        label: 'فاشل',
        icon: AlertCircle,
        gradient: 'from-red-500 to-rose-600'
      },
      pending: {
        bg: 'bg-amber-500',
        text: 'text-amber-700',
        lightBg: 'bg-amber-50',
        label: 'قيد الإرسال',
        icon: Clock,
        gradient: 'from-amber-500 to-orange-600'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      auto: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'تلقائي', icon: Zap },
      broadcast: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'بث جماعي', icon: Users },
      manual: { bg: 'bg-green-50', text: 'text-green-700', label: 'يدوي', icon: MessageCircle },
      reply: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'رد', icon: TrendingUp }
    };
    return configs[type as keyof typeof configs] || configs.auto;
  };

  const exportToCSV = () => {
    const csv = [
      ['التاريخ', 'المستلم', 'رقم الهاتف', 'النوع', 'الحالة', 'الرسالة'],
      ...filteredMessages.map(msg => [
        new Date(msg.created_at).toLocaleString('ar-SA'),
        msg.recipient_name || '-',
        msg.recipient_phone,
        msg.message_type,
        msg.status,
        msg.message_content.replace(/\n/g, ' ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `whatsapp-messages-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">جاري تحميل السجل...</p>
          <p className="text-sm text-gray-600 mt-2">استرجاع جميع الرسائل</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 rounded-3xl p-8 shadow-2xl">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                  سجل الرسائل المتقدم
                  <Sparkles className="h-7 w-7 text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-blue-100 text-lg">تتبع وإدارة جميع رسائل WhatsApp</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadMessages}
                disabled={loading}
                className="px-6 py-3 bg-white/20 backdrop-blur-xl text-white rounded-xl hover:bg-white/30 transition-all border-2 border-white/30 font-bold shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-5 w-5 inline mr-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </button>

              <button
                onClick={exportToCSV}
                className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold shadow-lg hover:scale-105"
              >
                <Download className="h-5 w-5 inline mr-2" />
                تصدير Excel
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
              <div className="text-white/80 text-sm mb-1">الإجمالي</div>
              <div className="text-3xl font-black text-white">{stats.total}</div>
            </div>

            <div className="bg-emerald-500/20 backdrop-blur-xl rounded-xl p-4 border border-emerald-300/30">
              <div className="text-emerald-100 text-sm mb-1">مستلم</div>
              <div className="text-3xl font-black text-white">{stats.delivered}</div>
            </div>

            <div className="bg-blue-500/20 backdrop-blur-xl rounded-xl p-4 border border-blue-300/30">
              <div className="text-blue-100 text-sm mb-1">مرسل</div>
              <div className="text-3xl font-black text-white">{stats.sent}</div>
            </div>

            <div className="bg-purple-500/20 backdrop-blur-xl rounded-xl p-4 border border-purple-300/30">
              <div className="text-purple-100 text-sm mb-1">مقروء</div>
              <div className="text-3xl font-black text-white">{stats.read}</div>
            </div>

            <div className="bg-red-500/20 backdrop-blur-xl rounded-xl p-4 border border-red-300/30">
              <div className="text-red-100 text-sm mb-1">فاشل</div>
              <div className="text-3xl font-black text-white">{stats.failed}</div>
            </div>

            <div className="bg-amber-500/20 backdrop-blur-xl rounded-xl p-4 border border-amber-300/30">
              <div className="text-amber-100 text-sm mb-1">معدل النجاح</div>
              <div className="text-3xl font-black text-white">{successRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-black text-gray-900">البحث والتصفية</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث برقم، اسم أو محتوى..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold transition-colors"
          >
            <option value="all">📊 جميع الحالات</option>
            <option value="pending">⏳ قيد الإرسال</option>
            <option value="sent">📤 مرسل</option>
            <option value="delivered">✅ مستلم</option>
            <option value="read">👁️ مقروء</option>
            <option value="failed">❌ فاشل</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold transition-colors"
          >
            <option value="all">🔖 جميع الأنواع</option>
            <option value="auto">⚡ تلقائي</option>
            <option value="broadcast">📢 بث جماعي</option>
            <option value="manual">✍️ يدوي</option>
            <option value="reply">↩️ رد</option>
          </select>

          {/* Recipient Type Filter */}
          <select
            value={selectedRecipientType}
            onChange={(e) => setSelectedRecipientType(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold transition-colors"
          >
            <option value="all">👥 جميع الفئات</option>
            <option value="investor">💼 مستثمر</option>
            <option value="farm_owner">🌾 صاحب مزرعة</option>
            <option value="admin">👑 مشرف</option>
          </select>

          {/* Date From */}
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-gray-100">
          <div className="text-sm text-gray-600">
            عرض <span className="font-black text-gray-900 text-lg">{filteredMessages.length}</span> من {messages.length} رسالة
          </div>

          {(selectedStatus !== 'all' || selectedType !== 'all' || selectedRecipientType !== 'all' || dateFrom || dateTo || searchTerm) && (
            <button
              onClick={() => {
                setSelectedStatus('all');
                setSelectedType('all');
                setSelectedRecipientType('all');
                setDateFrom('');
                setDateTo('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-sm text-red-600 hover:text-red-700 font-bold hover:underline"
            >
              ✖ إعادة تعيين جميع الفلاتر
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t-2 border-gray-100">
          <span className="text-sm font-bold text-gray-700">طريقة العرض:</span>
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Timeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 جدول
            </button>
          </div>
        </div>
      </div>

      {/* Messages Display */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-16 text-center">
          <MessageCircle className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-gray-900 mb-3">لا توجد رسائل</h3>
          <p className="text-gray-600 text-lg">
            {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
              ? 'لم يتم العثور على رسائل تطابق معايير البحث'
              : 'لم يتم إرسال أي رسائل بعد'}
          </p>
        </div>
      ) : viewMode === 'timeline' ? (
        <TimelineView
          messages={paginatedMessages}
          onViewDetails={setSelectedMessage}
          getStatusConfig={getStatusConfig}
          getTypeConfig={getTypeConfig}
        />
      ) : (
        <TableView
          messages={paginatedMessages}
          onViewDetails={setSelectedMessage}
          getStatusConfig={getStatusConfig}
          getTypeConfig={getTypeConfig}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              صفحة <span className="font-bold text-gray-900">{currentPage}</span> من {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Details Modal */}
      {selectedMessage && (
        <ModernMessageDetailsModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          getStatusConfig={getStatusConfig}
          getTypeConfig={getTypeConfig}
        />
      )}
    </div>
  );
}

// Timeline View Component
function TimelineView({
  messages,
  onViewDetails,
  getStatusConfig,
  getTypeConfig
}: {
  messages: WhatsAppMessage[];
  onViewDetails: (msg: WhatsAppMessage) => void;
  getStatusConfig: (status: string) => any;
  getTypeConfig: (type: string) => any;
}) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const statusConfig = getStatusConfig(message.status);
        const typeConfig = getTypeConfig(message.message_type);
        const StatusIcon = statusConfig.icon;
        const TypeIcon = typeConfig.icon;

        return (
          <div
            key={message.id}
            className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-all group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-4">
              {/* Status Badge */}
              <div className={`w-14 h-14 bg-gradient-to-r ${statusConfig.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <StatusIcon className="h-7 w-7 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-black text-gray-900">
                        {message.recipient_name || 'غير محدد'}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeConfig.bg} ${typeConfig.text} flex items-center gap-1`}>
                        <TypeIcon className="h-3 w-3" />
                        {typeConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-mono">{message.recipient_phone}</span>
                      <span>•</span>
                      <span>{new Date(message.created_at).toLocaleString('ar-SA')}</span>
                      {message.recipient_type && (
                        <>
                          <span>•</span>
                          <span>
                            {message.recipient_type === 'investor' ? '💼 مستثمر' :
                             message.recipient_type === 'farm_owner' ? '🌾 صاحب مزرعة' :
                             message.recipient_type === 'admin' ? '👑 مشرف' : message.recipient_type}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className={`px-4 py-2 rounded-xl font-bold ${statusConfig.lightBg} ${statusConfig.text} flex items-center gap-2 whitespace-nowrap`}>
                    <StatusIcon className="h-4 w-4" />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Message Preview */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-3 border-2 border-gray-100">
                  <p className="text-gray-700 line-clamp-2">
                    {message.message_content}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {message.sent_at && (
                      <span>📤 أُرسل: {new Date(message.sent_at).toLocaleTimeString('ar-SA')}</span>
                    )}
                    {message.error_message && (
                      <span className="text-red-600 font-bold">⚠️ خطأ</span>
                    )}
                  </div>

                  <button
                    onClick={() => onViewDetails(message)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all font-bold group-hover:scale-105"
                  >
                    <Eye className="h-4 w-4" />
                    التفاصيل
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Table View Component
function TableView({
  messages,
  onViewDetails,
  getStatusConfig,
  getTypeConfig
}: {
  messages: WhatsAppMessage[];
  onViewDetails: (msg: WhatsAppMessage) => void;
  getStatusConfig: (status: string) => any;
  getTypeConfig: (type: string) => any;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-right text-sm font-black text-gray-900">التاريخ والوقت</th>
              <th className="px-6 py-4 text-right text-sm font-black text-gray-900">المستلم</th>
              <th className="px-6 py-4 text-right text-sm font-black text-gray-900">رقم الهاتف</th>
              <th className="px-6 py-4 text-right text-sm font-black text-gray-900">النوع</th>
              <th className="px-6 py-4 text-right text-sm font-black text-gray-900">الحالة</th>
              <th className="px-6 py-4 text-right text-sm font-black text-gray-900">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {messages.map((message) => {
              const statusConfig = getStatusConfig(message.status);
              const typeConfig = getTypeConfig(message.message_type);
              const StatusIcon = statusConfig.icon;
              const TypeIcon = typeConfig.icon;

              return (
                <tr key={message.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-bold">
                      {new Date(message.created_at).toLocaleDateString('ar-SA')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleTimeString('ar-SA')}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">
                      {message.recipient_name || '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {message.recipient_type === 'investor' ? '💼 مستثمر' :
                       message.recipient_type === 'farm_owner' ? '🌾 صاحب مزرعة' :
                       message.recipient_type === 'admin' ? '👑 مشرف' : '-'}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-mono text-sm text-gray-900 font-bold">
                      {message.recipient_phone}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${typeConfig.bg} ${typeConfig.text}`}>
                      <TypeIcon className="h-3 w-3" />
                      {typeConfig.label}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${statusConfig.text}`} />
                      <span className={`text-sm font-bold ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewDetails(message)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold"
                    >
                      <Eye className="h-4 w-4" />
                      عرض
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Modern Message Details Modal
function ModernMessageDetailsModal({
  message,
  onClose,
  getStatusConfig,
  getTypeConfig
}: {
  message: WhatsAppMessage;
  onClose: () => void;
  getStatusConfig: (status: string) => any;
  getTypeConfig: (type: string) => any;
}) {
  const statusConfig = getStatusConfig(message.status);
  const typeConfig = getTypeConfig(message.message_type);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className={`bg-gradient-to-r ${statusConfig.gradient} p-8 text-white relative overflow-hidden`}>
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2">تفاصيل الرسالة</h3>
                <p className="text-white/90 text-lg">{message.recipient_name || 'غير محدد'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xl border border-white/30`}>
                    <StatusIcon className="h-3 w-3 inline mr-1" />
                    {statusConfig.label}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xl border border-white/30`}>
                    <TypeIcon className="h-3 w-3 inline mr-1" />
                    {typeConfig.label}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
          {/* Recipient Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الاسم</label>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 font-bold text-gray-900">
                {message.recipient_name || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 font-mono text-gray-900 font-bold">
                {message.recipient_phone}
              </div>
            </div>
          </div>

          {/* Message Content - WhatsApp Style */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">محتوى الرسالة</label>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-1 shadow-lg">
              <div className="bg-white rounded-xl p-5 border-2 border-green-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-2 font-bold">
                      WhatsApp Business • {new Date(message.created_at).toLocaleTimeString('ar-SA')}
                    </div>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {message.message_content}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-3 text-gray-400">
                      <span className="text-xs">{new Date(message.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الإنشاء</label>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200">
                <div className="text-sm font-bold text-gray-900">
                  {new Date(message.created_at).toLocaleString('ar-SA')}
                </div>
              </div>
            </div>
            {message.sent_at && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الإرسال</label>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <div className="text-sm font-bold text-green-900">
                    {new Date(message.sent_at).toLocaleString('ar-SA')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {message.error_message && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border-2 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-sm font-bold text-red-900 mb-2">رسالة الخطأ</div>
                  <p className="text-red-700">{message.error_message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">نوع الرسالة</div>
                <div className="font-bold text-gray-900 flex items-center gap-2">
                  <TypeIcon className="h-4 w-4" />
                  {typeConfig.label}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">فئة المستلم</div>
                <div className="font-bold text-gray-900">
                  {message.recipient_type === 'investor' ? '💼 مستثمر' :
                   message.recipient_type === 'farm_owner' ? '🌾 صاحب مزرعة' :
                   message.recipient_type === 'admin' ? '👑 مشرف' : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 p-6 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
