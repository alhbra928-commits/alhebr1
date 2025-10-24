import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export function FloatingWhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const whatsappNumber = '966500000000'; // رقم الواتساب للمنصة
  const defaultMessage = 'مرحباً، أحتاج مساعدة في...';

  const handleSend = () => {
    const finalMessage = message || defaultMessage;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMessage)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <>
      {/* الزر العائم */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group"
        title="تواصل معنا عبر الواتساب"
      >
        {isOpen ? (
          <X className="h-8 w-8 text-white" />
        ) : (
          <MessageCircle className="h-8 w-8 text-white group-hover:animate-bounce" />
        )}
      </button>

      {/* نافذة الدردشة */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black">دعم الواتساب</h3>
                <p className="text-sm text-green-100">نحن هنا لمساعدتك 🌴</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              مرحباً بك في منصة مزارع النخيل! 👋
            </p>
            <p className="text-gray-600 text-sm mb-6">
              أرسل لنا رسالة وسنرد عليك في أقرب وقت ممكن
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={defaultMessage}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none"
              rows={4}
            />
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-100 p-4">
            <button
              onClick={handleSend}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <Send className="h-5 w-5" />
              إرسال عبر الواتساب
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              سيتم فتح تطبيق الواتساب
            </p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
