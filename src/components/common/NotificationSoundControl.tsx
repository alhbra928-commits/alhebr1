import { useState, useEffect } from 'react';
import {
  Volume2, VolumeX, Bell, BellOff, Play, Settings, X,
  Check, AlertCircle, DollarSign, Zap
} from 'lucide-react';
import { notificationSoundService, bookingNotificationMonitor } from '../../services/notificationSoundService';

export function NotificationSoundControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [settings, setSettings] = useState(notificationSoundService.getSettings());

  useEffect(() => {
    setIsMonitoring(bookingNotificationMonitor.isActive());
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  };

  const handleToggleMonitoring = async () => {
    if (isMonitoring) {
      bookingNotificationMonitor.stopMonitoring();
      setIsMonitoring(false);
    } else {
      // طلب إذن الإشعارات أولاً
      const granted = await bookingNotificationMonitor.requestNotificationPermission();
      setHasPermission(granted);

      bookingNotificationMonitor.startMonitoring();
      setIsMonitoring(true);
    }
  };

  const handleToggleSound = (type: string) => {
    const newSettings = { ...settings };
    newSettings[type].enabled = !newSettings[type].enabled;
    notificationSoundService.enableSound(type, newSettings[type].enabled);
    setSettings(newSettings);
  };

  const handleVolumeChange = (type: string, volume: number) => {
    const newSettings = { ...settings };
    newSettings[type].volume = volume;
    notificationSoundService.setVolume(type, volume);
    setSettings(newSettings);
  };

  const handleTestSound = (type: string) => {
    switch (type) {
      case 'new_booking':
        notificationSoundService.playNewBookingSound();
        break;
      case 'payment_received':
        notificationSoundService.playPaymentReceivedSound();
        break;
      case 'urgent':
        notificationSoundService.playUrgentSound();
        break;
      case 'success':
        notificationSoundService.playSuccessSound();
        break;
    }
  };

  const soundTypes = [
    {
      key: 'new_booking',
      label: 'حجز جديد',
      description: 'يشتغل عند قيام مستثمر بحجز جديد',
      icon: Bell,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      key: 'payment_received',
      label: 'دفعة مستلمة',
      description: 'يشتغل عند استلام دفعة',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      key: 'urgent',
      label: 'تنبيه عاجل',
      description: 'يشتغل للإشعارات المهمة',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      key: 'success',
      label: 'نجاح',
      description: 'يشتغل عند إتمام عملية',
      icon: Check,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <>
      {/* زر التحكم العائم */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 left-6 z-40 p-4 rounded-full shadow-2xl transition-all hover:scale-110 ${
          isMonitoring
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse'
            : 'bg-gradient-to-r from-gray-600 to-gray-700'
        }`}
        title={isMonitoring ? 'الإشعارات الصوتية مفعلة' : 'الإشعارات الصوتية متوقفة'}
      >
        {isMonitoring ? (
          <Volume2 className="h-6 w-6 text-white" />
        ) : (
          <VolumeX className="h-6 w-6 text-white" />
        )}
      </button>

      {/* نافذة الإعدادات */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Volume2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">الإشعارات الصوتية</h3>
                    <p className="text-blue-100 text-sm">إدارة أصوات التنبيهات</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* التحكم الرئيسي */}
              <div className="mt-6 flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Zap className={`h-5 w-5 ${isMonitoring ? 'animate-pulse' : ''}`} />
                  <div>
                    <div className="font-bold">مراقبة الحجوزات المباشرة</div>
                    <div className="text-xs text-blue-100">
                      {isMonitoring ? 'يتم الآن مراقبة الحجوزات الجديدة' : 'متوقف'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleToggleMonitoring}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    isMonitoring ? 'bg-green-500' : 'bg-white/30'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${
                      isMonitoring ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* تنبيه الإذن */}
              {!hasPermission && (
                <div className="mt-4 bg-yellow-500/20 border border-yellow-300/50 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-200 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-100">
                    <div className="font-bold">إذن الإشعارات مطلوب</div>
                    <div className="text-xs">اضغط على زر التفعيل للسماح بإشعارات المتصفح</div>
                  </div>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {soundTypes.map((sound) => {
                  const Icon = sound.icon;
                  const isEnabled = settings[sound.key]?.enabled;
                  const volume = settings[sound.key]?.volume || 0.5;

                  return (
                    <div
                      key={sound.key}
                      className={`rounded-2xl p-4 border-2 transition-all ${
                        isEnabled
                          ? 'border-blue-200 bg-blue-50/50'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 ${sound.bgColor} rounded-xl flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 ${sound.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">{sound.label}</div>
                            <div className="text-xs text-gray-600">{sound.description}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* زر التجربة */}
                          <button
                            onClick={() => handleTestSound(sound.key)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="تجربة الصوت"
                          >
                            <Play className="h-4 w-4 text-gray-600" />
                          </button>

                          {/* زر التفعيل/الإيقاف */}
                          <button
                            onClick={() => handleToggleSound(sound.key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              isEnabled ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                                isEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* التحكم في مستوى الصوت */}
                      {isEnabled && (
                        <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                          <Volume2 className="h-4 w-4 text-gray-500" />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume * 100}
                            onChange={(e) => handleVolumeChange(sound.key, parseInt(e.target.value) / 100)}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
                            }}
                          />
                          <span className="text-sm font-bold text-gray-700 w-12 text-right">
                            {Math.round(volume * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  الأصوات المفعلة: {Object.values(settings).filter(s => s.enabled).length} / {Object.keys(settings).length}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-bold"
                >
                  تم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
