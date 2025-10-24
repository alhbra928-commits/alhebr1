import { useState, useEffect } from 'react';
import {
  MessageCircle, Search, Filter, Download, RefreshCw,
  CheckCheck, Send, Clock, AlertCircle, Eye, X, Calendar
} from 'lucide-react';
import { whatsappService, WhatsAppMessage } from '../services/whatsappService';

export function MessagesLog() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRecipientType, setSelectedRecipientType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);

  useEffect(() => {
    loadMessages();
  }, [selectedStatus, selectedType, selectedRecipientType, dateFrom, dateTo]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (selectedStatus !== 'all') filters.status = selectedStatus;
      if (selectedType !== 'all') filters.message_type = selectedType;
      if (selectedRecipientType !== 'all') filters.recipient_type = selectedRecipientType;
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;

      const data = await whatsappService.getMessages({ ...filters, limit: 100 });
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

  const getStatusBadge = (status: string) => {
    const badges = {
      delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'مستلم', icon: CheckCheck },
      sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'مرسل', icon: Send },
      read: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'مقروء', icon: Eye },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'فاشل', icon: AlertCircle },
      pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'قيد الإرسال', icon: Clock }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      auto: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'تلقائي' },
      broadcast: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'بث جماعي' },
      manual: { bg: 'bg-green-50', text: 'text-green-600', label: 'يدوي' },
      reply: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'رد' }
    };
    return badges[type as keyof typeof badges] || badges.auto;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-bold">جاري تحميل الرسائل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">سجل الرسائل</h2>
            <p className="text-gray-600">عرض جميع الرسائل المرسلة والمستلمة</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadMessages}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
            <span className="font-bold text-gray-700">تحديث</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            <Download className="h-5 w-5" />
            تصدير CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث برقم أو اسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none font-bold"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الإرسال</option>
            <option value="sent">مرسل</option>
            <option value="delivered">مستلم</option>
            <option value="read">مقروء</option>
            <option value="failed">فاشل</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none font-bold"
          >
            <option value="all">جميع الأنواع</option>
            <option value="auto">تلقائي</option>
            <option value="broadcast">بث جماعي</option>
            <option value="manual">يدوي</option>
            <option value="reply">رد</option>
          </select>

          {/* Recipient Type Filter */}
          <select
            value={selectedRecipientType}
            onChange={(e) => setSelectedRecipientType(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none font-bold"
          >
            <option value="all">جميع الفئات</option>
            <option value="investor">مستثمر</option>
            <option value="farm_owner">صاحب مزرعة</option>
            <option value="admin">مشرف</option>
          </select>

          {/* Date From */}
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
          <div className="text-sm text-gray-600">
            عرض <span className="font-bold text-gray-900">{filteredMessages.length}</span> رسالة
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
              }}
              className="text-sm text-red-600 hover:text-red-700 font-bold"
            >
              إعادة تعيين الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
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
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-bold">لا توجد رسائل</p>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => {
                  const statusBadge = getStatusBadge(message.status);
                  const typeBadge = getTypeBadge(message.message_type);
                  const StatusIcon = statusBadge.icon;

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
                          {message.recipient_type === 'investor' ? 'مستثمر' :
                           message.recipient_type === 'farm_owner' ? 'صاحب مزرعة' :
                           message.recipient_type === 'admin' ? 'مشرف' : '-'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-mono text-sm text-gray-900 font-bold direction-ltr text-right">
                          {message.recipient_phone}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${typeBadge.bg} ${typeBadge.text}`}>
                          {typeBadge.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${statusBadge.text}`} />
                          <span className={`text-sm font-bold ${statusBadge.text}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedMessage(message)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold"
                        >
                          <Eye className="h-4 w-4" />
                          عرض
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <MessageDetailsModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
}

// مكون Modal لتفاصيل الرسالة
function MessageDetailsModal({
  message,
  onClose
}: {
  message: WhatsAppMessage;
  onClose: () => void;
}) {
  const statusBadge = {
    delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'مستلم' },
    sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'مرسل' },
    read: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'مقروء' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'فاشل' },
    pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'قيد الإرسال' }
  }[message.status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: 'غير معروف' };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black">تفاصيل الرسالة</h3>
                <p className="text-blue-100 text-sm">{message.recipient_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الحالة</label>
            <span className={`inline-block px-4 py-2 rounded-xl font-bold ${statusBadge.bg} ${statusBadge.text}`}>
              {statusBadge.label}
            </span>
          </div>

          {/* Recipient Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الاسم</label>
              <div className="p-3 bg-gray-50 rounded-xl border-2 border-gray-200 font-bold">
                {message.recipient_name || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
              <div className="p-3 bg-gray-50 rounded-xl border-2 border-gray-200 font-mono direction-ltr text-right font-bold">
                {message.recipient_phone}
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">محتوى الرسالة</label>
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 whitespace-pre-wrap">
              {message.message_content}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الإنشاء</label>
              <div className="p-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-sm">
                {new Date(message.created_at).toLocaleString('ar-SA')}
              </div>
            </div>
            {message.sent_at && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الإرسال</label>
                <div className="p-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-sm">
                  {new Date(message.sent_at).toLocaleString('ar-SA')}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {message.error_message && (
            <div>
              <label className="block text-sm font-bold text-red-700 mb-2">رسالة الخطأ</label>
              <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200 text-red-700">
                {message.error_message}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 p-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
