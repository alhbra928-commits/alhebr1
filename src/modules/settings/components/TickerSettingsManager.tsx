import { useState, useEffect } from 'react';
import {
  BarChart3, Plus, Trash2, Edit2, Save, X,
  Power, Zap, Palette, Clock, TrendingUp, Check,
  MoveUp, MoveDown, Eye, EyeOff
} from 'lucide-react';
import { tickerService, TickerSettings, TickerItem } from '../services/tickerService';
import { Card3D } from '../../../components/ui/Card3D';

export function TickerSettingsManager() {
  const [settings, setSettings] = useState<TickerSettings | null>(null);
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<TickerItem | null>(null);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // =====================================
  // تحميل البيانات
  // =====================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [settingsData, itemsData] = await Promise.all([
      tickerService.getSettings(),
      tickerService.getItems()
    ]);
    setSettings(settingsData);
    setItems(itemsData);
    setLoading(false);
  };

  // =====================================
  // تحديث الإعدادات
  // =====================================

  const handleUpdateSettings = async (updates: Partial<TickerSettings>) => {
    if (!settings) return;

    setSaving(true);
    const success = await tickerService.updateSettings(updates);
    if (success) {
      setSettings({ ...settings, ...updates });
    }
    setSaving(false);
  };

  // =====================================
  // حذف عنصر
  // =====================================

  const handleDeleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    const success = await tickerService.deleteItem(id);
    if (success) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // =====================================
  // تفعيل/إيقاف عنصر
  // =====================================

  const handleToggleItem = async (id: string, isActive: boolean) => {
    const success = await tickerService.toggleItemActive(id, isActive);
    if (success) {
      setItems(items.map(item =>
        item.id === id ? { ...item, is_active: isActive } : item
      ));
    }
  };

  // =====================================
  // نقل عنصر لأعلى أو أسفل
  // =====================================

  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    // تحديث sort_order
    const updates = newItems.map((item, idx) => ({
      id: item.id,
      sort_order: idx
    }));

    const success = await tickerService.reorderItems(updates);
    if (success) {
      setItems(newItems.map((item, idx) => ({ ...item, sort_order: idx })));
    }
  };

  // =====================================
  // حفظ عنصر معدّل
  // =====================================

  const handleSaveItem = async (item: TickerItem) => {
    const success = await tickerService.updateItem(item.id, item);
    if (success) {
      setItems(items.map(i => i.id === item.id ? item : i));
      setEditingItem(null);
    }
  };

  // =====================================
  // إضافة عنصر جديد
  // =====================================

  const handleCreateItem = async (item: Omit<TickerItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newItem = await tickerService.createItem(item);
    if (newItem) {
      setItems([...items, newItem]);
      setShowNewItemForm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-20 text-gray-500">
        لم يتم العثور على إعدادات الشريط
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===================================== */}
      {/* الإعدادات الأساسية */}
      {/* ===================================== */}

      <Card3D interactive={false}>
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">إعدادات الشريط المتحرك</h3>
                <p className="text-sm text-gray-600">التحكم في مظهر وسلوك الشريط</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* تفعيل/إيقاف الشريط */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Power className="h-5 w-5 text-gray-700" />
                <div>
                  <div className="font-bold text-gray-900">حالة الشريط</div>
                  <div className="text-xs text-gray-600">تفعيل أو إيقاف الشريط</div>
                </div>
              </div>
              <button
                onClick={() => handleUpdateSettings({ is_enabled: !settings.is_enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.is_enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.is_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* البيانات التجريبية */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-gray-700" />
                <div>
                  <div className="font-bold text-gray-900">البيانات التجريبية</div>
                  <div className="text-xs text-gray-600">أرقام متحركة تجريبية</div>
                </div>
              </div>
              <button
                onClick={() => handleUpdateSettings({ show_demo_data: !settings.show_demo_data })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.show_demo_data ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.show_demo_data ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* سرعة الحركة */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-gray-700" />
                <div>
                  <div className="font-bold text-gray-900">سرعة الحركة</div>
                  <div className="text-xs text-gray-600">من 10 إلى 60 ثانية</div>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={settings.speed}
                onChange={(e) => handleUpdateSettings({ speed: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-center mt-2 text-sm font-bold text-gray-700">
                {settings.speed} ثانية
              </div>
            </div>

            {/* ارتفاع الشريط */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Palette className="h-5 w-5 text-gray-700" />
                <div>
                  <div className="font-bold text-gray-900">ارتفاع الشريط</div>
                  <div className="text-xs text-gray-600">من 40 إلى 100 بكسل</div>
                </div>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={settings.height}
                onChange={(e) => handleUpdateSettings({ height: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-center mt-2 text-sm font-bold text-gray-700">
                {settings.height} بكسل
              </div>
            </div>

            {/* تحديث البيانات */}
            <div className="p-4 bg-gray-50 rounded-xl md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-gray-700" />
                <div>
                  <div className="font-bold text-gray-900">تحديث البيانات التلقائي</div>
                  <div className="text-xs text-gray-600">كل كم ثانية يتم تحديث البيانات</div>
                </div>
              </div>
              <select
                value={settings.update_interval}
                onChange={(e) => handleUpdateSettings({ update_interval: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="5000">5 ثواني</option>
                <option value="10000">10 ثواني</option>
                <option value="15000">15 ثانية</option>
                <option value="30000">30 ثانية</option>
                <option value="60000">دقيقة واحدة</option>
              </select>
            </div>
          </div>
        </div>
      </Card3D>

      {/* ===================================== */}
      {/* إدارة العناصر */}
      {/* ===================================== */}

      <Card3D interactive={false}>
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900">العناصر المعروضة</h3>
            <button
              onClick={() => setShowNewItemForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              إضافة عنصر
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  item.is_active
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                {editingItem?.id === item.id ? (
                  <ItemEditor
                    item={editingItem}
                    onSave={handleSaveItem}
                    onCancel={() => setEditingItem(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <MoveUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMoveItem(index, 'down')}
                          disabled={index === items.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <MoveDown className="h-4 w-4" />
                        </button>
                      </div>

                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}20`, color: item.color }}
                      >
                        <BarChart3 className="h-5 w-5" />
                      </div>

                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-600">
                          المصدر: {item.data_source} | الترتيب: {item.sort_order}
                        </div>
                      </div>

                      <div
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: item.show_percentage
                            ? item.percentage_value.startsWith('+')
                              ? '#10b98120'
                              : '#ef444420'
                            : '#e5e7eb',
                          color: item.show_percentage
                            ? item.percentage_value.startsWith('+')
                              ? '#10b981'
                              : '#ef4444'
                            : '#6b7280',
                        }}
                      >
                        {item.percentage_value}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleItem(item.id, !item.is_active)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title={item.is_active ? 'إخفاء' : 'إظهار'}
                      >
                        {item.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </button>

                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                لا توجد عناصر. اضغط "إضافة عنصر" للبدء
              </div>
            )}
          </div>
        </div>
      </Card3D>

      {/* نموذج إضافة عنصر جديد */}
      {showNewItemForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">إضافة عنصر جديد</h3>
              <button
                onClick={() => setShowNewItemForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NewItemForm
              onSave={handleCreateItem}
              onCancel={() => setShowNewItemForm(false)}
            />
          </div>
        </div>
      )}

      {saving && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <Check className="h-5 w-5" />
          تم الحفظ بنجاح
        </div>
      )}
    </div>
  );
}

// =====================================
// محرر العنصر
// =====================================

function ItemEditor({
  item,
  onSave,
  onCancel,
}: {
  item: TickerItem;
  onSave: (item: TickerItem) => void;
  onCancel: () => void;
}) {
  const [editedItem, setEditedItem] = useState(item);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          value={editedItem.label}
          onChange={(e) => setEditedItem({ ...editedItem, label: e.target.value })}
          placeholder="التسمية"
          className="px-3 py-2 border rounded-lg"
        />
        <input
          type="text"
          value={editedItem.icon}
          onChange={(e) => setEditedItem({ ...editedItem, icon: e.target.value })}
          placeholder="الأيقونة"
          className="px-3 py-2 border rounded-lg"
        />
        <input
          type="color"
          value={editedItem.color}
          onChange={(e) => setEditedItem({ ...editedItem, color: e.target.value })}
          className="px-3 py-2 border rounded-lg h-10"
        />
        <select
          value={editedItem.data_source}
          onChange={(e) => setEditedItem({ ...editedItem, data_source: e.target.value as any })}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="farms">المزارع</option>
          <option value="reservations">الحجوزات</option>
          <option value="investors">المستثمرون</option>
          <option value="trees">الأشجار</option>
          <option value="custom">مخصص</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onSave(editedItem)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Save className="h-4 w-4" />
          حفظ
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          <X className="h-4 w-4" />
          إلغاء
        </button>
      </div>
    </div>
  );
}

// =====================================
// نموذج العنصر الجديد
// =====================================

function NewItemForm({
  onSave,
  onCancel,
}: {
  onSave: (item: Omit<TickerItem, 'id' | 'created_at' | 'updated_at'>) => void;
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

  const handleSubmit = () => {
    if (!newItem.label) {
      alert('الرجاء إدخال التسمية');
      return;
    }
    onSave(newItem);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">التسمية بالعربية</label>
          <input
            type="text"
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="مثال: المزارع النشطة"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الأيقونة</label>
          <input
            type="text"
            value={newItem.icon}
            onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="TrendingUp"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">اللون</label>
          <input
            type="color"
            value={newItem.color}
            onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg h-10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">مصدر البيانات</label>
          <select
            value={newItem.data_source}
            onChange={(e) => setNewItem({ ...newItem, data_source: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-lg"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">القيمة المخصصة</label>
            <input
              type="number"
              value={newItem.custom_value}
              onChange={(e) => setNewItem({ ...newItem, custom_value: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">نسبة التغيير</label>
          <input
            type="text"
            value={newItem.percentage_value}
            onChange={(e) => setNewItem({ ...newItem, percentage_value: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="+5.7%"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t">
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold"
        >
          <Plus className="h-5 w-5" />
          إضافة العنصر
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
        >
          <X className="h-5 w-5" />
          إلغاء
        </button>
      </div>
    </div>
  );
}
