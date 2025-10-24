import { useState } from 'react';
import {
  BarChart3, Edit2, Trash2, Copy, Eye, EyeOff, MoveUp, MoveDown,
  TrendingUp, TrendingDown, Save, X, Plus, Check, Monitor, Smartphone,
  AlertCircle, DollarSign, Users, FileText, Calendar, Award, Target
} from 'lucide-react';
import { TickerSettings, TickerItem } from '../services/tickerService';

// ========================================
// Setting Toggle Component
// ========================================

export function SettingToggle({
  icon,
  label,
  description,
  checked,
  onChange,
  color = 'blue'
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: 'blue' | 'green' | 'red' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="text-gray-700">{icon}</div>
        <div>
          <div className="font-bold text-gray-900">{label}</div>
          <div className="text-xs text-gray-600">{description}</div>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
          checked ? colors[color] : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// ========================================
// Slider Setting Component
// ========================================

export function SliderSetting({
  icon,
  label,
  description,
  value,
  min,
  max,
  unit,
  onChange
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-gray-700">{icon}</div>
        <div className="flex-1">
          <div className="font-bold text-gray-900">{label}</div>
          <div className="text-xs text-gray-600">{description}</div>
        </div>
        <div className="text-2xl font-black text-blue-600">
          {value} {unit}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

// ========================================
// Select Setting Component
// ========================================

export function SelectSetting({
  icon,
  label,
  description,
  value,
  onChange,
  options
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: number;
  onChange: (value: string) => void;
  options: { value: number; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-gray-700">{icon}</div>
        <div>
          <div className="font-bold text-gray-900">{label}</div>
          <div className="text-xs text-gray-600">{description}</div>
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ========================================
// Item Card Component (List View)
// ========================================

export function ItemCard({
  item,
  index,
  totalItems,
  onEdit,
  onDelete,
  onToggle,
  onDuplicate,
  onMoveUp,
  onMoveDown
}: {
  item: TickerItem;
  index: number;
  totalItems: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all hover:shadow-xl ${
        item.is_active
          ? 'border-green-200 hover:border-green-300'
          : 'border-gray-200 opacity-60 hover:opacity-100'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Move Controls */}
        <div className="flex flex-col gap-1">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="تحريك لأعلى"
          >
            <MoveUp className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === totalItems - 1}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="تحريك لأسفل"
          >
            <MoveDown className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
          style={{ backgroundColor: `${item.color}20`, color: item.color }}
        >
          <BarChart3 className="h-7 w-7" />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-xl font-black text-gray-900">{item.label}</h4>
            {item.label_en && (
              <span className="text-sm text-gray-500 font-medium">{item.label_en}</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              المصدر: <span className="font-bold">{getDataSourceLabel(item.data_source)}</span>
            </span>
            <span className="flex items-center gap-1">
              القيمة: <span className="font-bold text-gray-900">{item.custom_value.toLocaleString('ar-SA')}</span>
            </span>
            <span className="flex items-center gap-1">
              الترتيب: <span className="font-bold text-gray-900">#{item.sort_order + 1}</span>
            </span>
          </div>
        </div>

        {/* Percentage Badge */}
        {item.show_percentage && (
          <div
            className="px-4 py-2 rounded-xl text-lg font-black flex items-center gap-2"
            style={{
              backgroundColor: item.percentage_value.startsWith('+') ? '#10b98120' : '#ef444420',
              color: item.percentage_value.startsWith('+') ? '#10b981' : '#ef4444'
            }}
          >
            {item.percentage_value.startsWith('+') ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            {item.percentage_value}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`p-3 rounded-xl transition-all ${
              item.is_active
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title={item.is_active ? 'إخفاء' : 'إظهار'}
          >
            {item.is_active ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>

          <button
            onClick={onDuplicate}
            className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors"
            title="نسخ"
          >
            <Copy className="h-5 w-5" />
          </button>

          <button
            onClick={onEdit}
            className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
            title="تعديل"
          >
            <Edit2 className="h-5 w-5" />
          </button>

          <button
            onClick={onDelete}
            className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
            title="حذف"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// Item Card Compact (Grid View)
// ========================================

export function ItemCardCompact({
  item,
  onEdit,
  onDelete,
  onToggle,
  onDuplicate
}: {
  item: TickerItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all hover:shadow-xl ${
        item.is_active ? 'border-green-200' : 'border-gray-200 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
          style={{ backgroundColor: `${item.color}20`, color: item.color }}
        >
          <BarChart3 className="h-6 w-6" />
        </div>
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg ${
            item.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}
        >
          {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>

      <h4 className="text-lg font-black text-gray-900 mb-1">{item.label}</h4>
      <p className="text-sm text-gray-600 mb-4">{getDataSourceLabel(item.data_source)}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl font-black text-gray-900">
          {item.custom_value.toLocaleString('ar-SA')}
        </div>
        {item.show_percentage && (
          <div
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{
              backgroundColor: item.percentage_value.startsWith('+') ? '#10b98120' : '#ef444420',
              color: item.percentage_value.startsWith('+') ? '#10b981' : '#ef4444'
            }}
          >
            {item.percentage_value}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
        >
          <Edit2 className="h-4 w-4" />
          تعديل
        </button>
        <button
          onClick={onDuplicate}
          className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
          title="نسخ"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
          title="حذف"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ========================================
// Design Settings Tab
// ========================================

export function DesignSettingsTab({
  settings,
  onUpdate
}: {
  settings: TickerSettings;
  onUpdate: (updates: Partial<TickerSettings>) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Colors */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <h3 className="text-xl font-black text-gray-900 mb-6">الألوان والخلفية</h3>

        <div className="space-y-4">
          <ColorPicker
            label="لون الخلفية"
            value={settings.background_color}
            onChange={(color) => onUpdate({ background_color: color })}
          />

          <ColorPicker
            label="لون النص"
            value={settings.text_color}
            onChange={(color) => onUpdate({ text_color: color })}
          />

          <ColorPicker
            label="لون الحدود"
            value={settings.border_color}
            onChange={(color) => onUpdate({ border_color: color })}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <h3 className="text-xl font-black text-gray-900 mb-6">معاينة التصميم</h3>

        <div
          className="rounded-xl overflow-hidden shadow-lg"
          style={{
            height: `${settings.height}px`,
            backgroundColor: settings.background_color,
            border: `2px solid ${settings.border_color}`
          }}
        >
          <div className="flex items-center h-full px-6">
            <span
              className="font-bold text-2xl"
              style={{ color: settings.text_color }}
            >
              نموذج للشريط المتحرك
            </span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-bold mb-1">نصيحة تصميمية:</p>
              <p>استخدم ألواناً متباينة بين الخلفية والنص لسهولة القراءة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// Preview Testing Tab
// ========================================

export function PreviewTestingTab({
  settings,
  items
}: {
  settings: TickerSettings;
  items: TickerItem[];
}) {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="space-y-6">
      {/* Device Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900">معاينة على الأجهزة</h3>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                deviceView === 'desktop' ? 'bg-white shadow' : ''
              }`}
            >
              <Monitor className="h-4 w-4" />
              الكمبيوتر
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                deviceView === 'mobile' ? 'bg-white shadow' : ''
              }`}
            >
              <Smartphone className="h-4 w-4" />
              الجوال
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className={`mx-auto transition-all ${deviceView === 'mobile' ? 'max-w-sm' : 'w-full'}`}>
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 shadow-2xl">
          <div
            className="rounded-xl overflow-hidden shadow-xl"
            style={{
              height: `${settings.height}px`,
              backgroundColor: settings.background_color,
              border: `2px solid ${settings.border_color}`
            }}
          >
            <div className="flex items-center h-full px-6 gap-8 overflow-hidden">
              <div className="flex items-center gap-8 animate-scroll">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 whitespace-nowrap">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <span
                      className="font-bold text-lg"
                      style={{ color: settings.text_color }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-2xl font-black"
                      style={{ color: settings.text_color }}
                    >
                      {item.custom_value.toLocaleString('ar-SA')}
                    </span>
                    {item.show_percentage && (
                      <span
                        className="px-2 py-1 rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: item.percentage_value.startsWith('+') ? '#10b98120' : '#ef444420',
                          color: item.percentage_value.startsWith('+') ? '#10b981' : '#ef4444'
                        }}
                      >
                        {item.percentage_value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-3xl font-black text-blue-600 mb-2">{items.length}</div>
          <div className="text-sm text-blue-900 font-medium">عناصر نشطة</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-3xl font-black text-green-600 mb-2">{settings.speed}s</div>
          <div className="text-sm text-green-900 font-medium">مدة الدورة</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="text-3xl font-black text-purple-600 mb-2">{settings.height}px</div>
          <div className="text-sm text-purple-900 font-medium">الارتفاع</div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// Color Picker Component
// ========================================

export function ColorPicker({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="font-bold text-gray-900">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

// ========================================
// Item Form Modal
// ========================================

export function ItemFormModal({
  onSave,
  onCancel
}: {
  onSave: (item: any) => void;
  onCancel: () => void;
}) {
  const [newItem, setNewItem] = useState({
    label: '',
    label_en: '',
    icon: 'TrendingUp',
    color: '#10b981',
    data_source: 'custom' as const,
    custom_value: 0,
    show_percentage: true,
    percentage_value: '+0.0%',
    sort_order: 999,
    is_active: true,
  });

  const iconOptions = [
    { value: 'TrendingUp', label: 'اتجاه صاعد', icon: TrendingUp },
    { value: 'TrendingDown', label: 'اتجاه هابط', icon: TrendingDown },
    { value: 'DollarSign', label: 'دولار', icon: DollarSign },
    { value: 'Users', label: 'مستخدمون', icon: Users },
    { value: 'FileText', label: 'ملف', icon: FileText },
    { value: 'Calendar', label: 'تقويم', icon: Calendar },
    { value: 'Award', label: 'جائزة', icon: Award },
    { value: 'Target', label: 'هدف', icon: Target }
  ];

  const handleSubmit = () => {
    if (!newItem.label) {
      alert('الرجاء إدخال التسمية');
      return;
    }
    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Plus className="h-8 w-8 text-green-600" />
            إضافة عنصر جديد
          </h3>
          <button
            onClick={onCancel}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">التسمية بالعربية *</label>
              <input
                type="text"
                value={newItem.label}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="مثال: المزارع النشطة"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">التسمية بالإنجليزية</label>
              <input
                type="text"
                value={newItem.label_en}
                onChange={(e) => setNewItem({ ...newItem, label_en: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Active Farms"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">اللون</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={newItem.color}
                  onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                  className="w-20 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={newItem.color}
                  onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">مصدر البيانات</label>
              <select
                value={newItem.data_source}
                onChange={(e) => setNewItem({ ...newItem, data_source: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="farms">المزارع</option>
                <option value="reservations">الحجوزات</option>
                <option value="investors">المستثمرون</option>
                <option value="trees">الأشجار</option>
                <option value="custom">قيمة مخصصة</option>
              </select>
            </div>

            {newItem.data_source === 'custom' && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">القيمة المخصصة</label>
                <input
                  type="number"
                  value={newItem.custom_value}
                  onChange={(e) => setNewItem({ ...newItem, custom_value: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">نسبة التغيير</label>
              <input
                type="text"
                value={newItem.percentage_value}
                onChange={(e) => setNewItem({ ...newItem, percentage_value: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="+5.7%"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
            <input
              type="checkbox"
              checked={newItem.show_percentage}
              onChange={(e) => setNewItem({ ...newItem, show_percentage: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label className="font-medium text-blue-900">عرض نسبة التغيير</label>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg"
            >
              <Check className="h-6 w-6" />
              إضافة العنصر
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// Item Edit Modal
// ========================================

export function ItemEditModal({
  item,
  onSave,
  onCancel
}: {
  item: TickerItem;
  onSave: (item: TickerItem) => void;
  onCancel: () => void;
}) {
  const [editedItem, setEditedItem] = useState(item);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Edit2 className="h-8 w-8 text-blue-600" />
            تعديل العنصر
          </h3>
          <button
            onClick={onCancel}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">التسمية بالعربية</label>
              <input
                type="text"
                value={editedItem.label}
                onChange={(e) => setEditedItem({ ...editedItem, label: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">اللون</label>
              <input
                type="color"
                value={editedItem.color}
                onChange={(e) => setEditedItem({ ...editedItem, color: e.target.value })}
                className="w-full h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">القيمة المخصصة</label>
              <input
                type="number"
                value={editedItem.custom_value}
                onChange={(e) => setEditedItem({ ...editedItem, custom_value: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">نسبة التغيير</label>
              <input
                type="text"
                value={editedItem.percentage_value}
                onChange={(e) => setEditedItem({ ...editedItem, percentage_value: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              onClick={() => onSave(editedItem)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-bold text-lg"
            >
              <Save className="h-6 w-6" />
              حفظ التعديلات
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// Helper Functions
// ========================================

function getDataSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    farms: 'المزارع',
    reservations: 'الحجوزات',
    investors: 'المستثمرون',
    trees: 'الأشجار',
    custom: 'مخصص'
  };
  return labels[source] || source;
}
