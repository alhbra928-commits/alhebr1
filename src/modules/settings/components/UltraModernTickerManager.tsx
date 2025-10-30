import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit, Eye, EyeOff, Save, X, Move,
  Sparkles, Star, Zap, Crown, TrendingUp, Activity,
  Award, Gem, Heart, MessageCircle, Shield, Target,
  Palette, Box, Layers, Play, RefreshCw, Settings
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface TickerItem {
  id?: string;
  content_ar: string;
  content_en: string;
  icon_name: string;
  icon_color: string;
  background_gradient: string;
  is_active: boolean;
  sort_order: number;
  animation_type: 'float' | 'pulse' | 'bounce' | 'spin' | 'glow';
  enable_3d: boolean;
  ticker_type: string;
}

const icons = [
  { name: 'Star', icon: Star, label: 'نجمة' },
  { name: 'Crown', icon: Crown, label: 'تاج' },
  { name: 'Sparkles', icon: Sparkles, label: 'بريق' },
  { name: 'Zap', icon: Zap, label: 'برق' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'نمو' },
  { name: 'Activity', icon: Activity, label: 'نشاط' },
  { name: 'Award', icon: Award, label: 'جائزة' },
  { name: 'Gem', icon: Gem, label: 'جوهرة' },
  { name: 'Heart', icon: Heart, label: 'قلب' },
  { name: 'MessageCircle', icon: MessageCircle, label: 'رسالة' },
  { name: 'Shield', icon: Shield, label: 'درع' },
  { name: 'Target', icon: Target, label: 'هدف' }
];

const colors = [
  { value: '#10b981', label: 'أخضر زمردي', class: 'bg-emerald-500' },
  { value: '#059669', label: 'أخضر داكن', class: 'bg-emerald-600' },
  { value: '#14b8a6', label: 'تيل', class: 'bg-teal-500' },
  { value: '#3b82f6', label: 'أزرق', class: 'bg-blue-500' },
  { value: '#8b5cf6', label: 'بنفسجي', class: 'bg-violet-500' },
  { value: '#f59e0b', label: 'كهرماني', class: 'bg-amber-500' },
  { value: '#ef4444', label: 'أحمر', class: 'bg-red-500' },
  { value: '#ec4899', label: 'وردي', class: 'bg-pink-500' },
  { value: '#6366f1', label: 'نيلي', class: 'bg-indigo-500' },
  { value: '#eab308', label: 'أصفر', class: 'bg-yellow-500' }
];

const gradients = [
  { value: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.15))', label: 'تدرج أخضر' },
  { value: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.15))', label: 'تدرج أزرق' },
  { value: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.15))', label: 'تدرج بنفسجي' },
  { value: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.15))', label: 'تدرج كهرماني' },
  { value: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(13, 148, 136, 0.15))', label: 'تدرج تيل' },
  { value: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.15))', label: 'تدرج وردي' }
];

const animations = [
  { value: 'float', label: 'طفو' },
  { value: 'pulse', label: 'نبض' },
  { value: 'bounce', label: 'ارتداد' },
  { value: 'spin', label: 'دوران' },
  { value: 'glow', label: 'توهج' }
];

export function UltraModernTickerManager() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<TickerItem | null>(null);
  const [previewMode, setPreviewMode] = useState(true);

  const [formData, setFormData] = useState<TickerItem>({
    content_ar: '',
    content_en: '',
    icon_name: 'Star',
    icon_color: '#10b981',
    background_gradient: gradients[0].value,
    is_active: true,
    sort_order: 0,
    animation_type: 'float',
    enable_3d: true,
    ticker_type: 'main'
  });

  useEffect(() => {
    loadItems();

    // Realtime subscription
    const channel = supabase
      .channel('ticker_manager_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ticker_items' },
        () => {
          console.log('🔄 Ticker items changed, reloading...');
          loadItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('ticker_items')
        .select('*')
        .eq('ticker_type', 'main')
        .order('sort_order');

      if (!error && data) {
        setItems(data);
      }
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem?.id) {
        // Update
        const { error } = await supabase
          .from('ticker_items')
          .update(formData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Insert
        const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) : 0;
        const { error } = await supabase
          .from('ticker_items')
          .insert([{ ...formData, sort_order: maxOrder + 1 }]);

        if (error) throw error;
      }

      resetForm();
      loadItems();
    } catch (err) {
      console.error('Error saving item:', err);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    try {
      const { error } = await supabase
        .from('ticker_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadItems();
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const toggleActive = async (item: TickerItem) => {
    try {
      const { error } = await supabase
        .from('ticker_items')
        .update({ is_active: !item.is_active })
        .eq('id', item.id);

      if (error) throw error;
      loadItems();
    } catch (err) {
      console.error('Error toggling active:', err);
    }
  };

  const handleEdit = (item: TickerItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      content_ar: '',
      content_en: '',
      icon_name: 'Star',
      icon_color: '#10b981',
      background_gradient: gradients[0].value,
      is_active: true,
      sort_order: 0,
      animation_type: 'float',
      enable_3d: true,
      ticker_type: 'main'
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const getIconComponent = (iconName: string) => {
    const iconObj = icons.find(i => i.name === iconName);
    return iconObj?.icon || Star;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الشريط المتحرك ثلاثي الأبعاد</h1>
          <p className="text-gray-600 mt-2">أنشئ وعدّل الشريط المتحرك بتأثيرات ثلاثية الأبعاد مبتكرة</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {previewMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {previewMode ? 'إخفاء المعاينة' : 'إظهار المعاينة'}
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            إضافة عنصر جديد
          </button>
        </div>
      </div>

      {/* Live Preview */}
      {previewMode && (
        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200">
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <Play className="w-4 h-4" />
              معاينة مباشرة
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-700 mb-4">المعاينة الحية للشريط:</h3>

          <div className="relative overflow-hidden py-4 bg-white rounded-xl border border-gray-200">
            <div className="ticker-3d-container">
              <div className="ticker-3d-content">
                {items.filter(i => i.is_active).map((item) => {
                  const IconComponent = getIconComponent(item.icon_name);
                  return (
                    <div
                      key={item.id}
                      className="ticker-3d-item"
                      style={{ perspective: '1000px' }}
                    >
                      <div
                        className="ticker-3d-card"
                        style={{
                          background: item.background_gradient,
                          transform: item.enable_3d ? 'rotateY(-5deg) rotateX(2deg)' : 'none'
                        }}
                      >
                        <div className={`ticker-3d-icon animate-${item.animation_type}`}>
                          <IconComponent className="w-5 h-5" style={{ color: item.icon_color }} />
                        </div>
                        <span className="text-sm font-bold text-emerald-700">{item.content_ar}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingItem ? 'تعديل العنصر' : 'إضافة عنصر جديد'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Text Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">النص بالعربية *</label>
                  <input
                    type="text"
                    value={formData.content_ar}
                    onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                    placeholder="مثال: استثمر في مستقبل أخضر"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">النص بالإنجليزية</label>
                  <input
                    type="text"
                    value={formData.content_en}
                    onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Example: Invest in green future"
                  />
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">اختر الأيقونة</label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {icons.map((icon) => {
                    const IconComp = icon.icon;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon_name: icon.name })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.icon_name === icon.name
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <IconComp className="w-6 h-6 mx-auto" style={{ color: formData.icon_color }} />
                        <p className="text-xs mt-2 text-gray-600">{icon.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">لون الأيقونة</label>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon_color: color.value })}
                      className={`relative w-12 h-12 rounded-lg ${color.class} transition-all ${
                        formData.icon_color === color.value
                          ? 'ring-4 ring-offset-2 ring-emerald-500'
                          : 'hover:scale-110'
                      }`}
                      title={color.label}
                    >
                      {formData.icon_color === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Gradient */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">تدرج الخلفية</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gradients.map((gradient, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, background_gradient: gradient.value })}
                      className={`relative h-16 rounded-lg border-2 transition-all ${
                        formData.background_gradient === gradient.value
                          ? 'border-emerald-500 ring-2 ring-emerald-200'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                      style={{ background: gradient.value }}
                    >
                      <span className="absolute inset-x-0 bottom-2 text-xs font-medium text-center text-gray-700">
                        {gradient.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">نوع الحركة</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {animations.map((anim) => (
                    <button
                      key={anim.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, animation_type: anim.value as any })}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        formData.animation_type === anim.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-emerald-300 text-gray-700'
                      }`}
                    >
                      {anim.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enable_3d}
                    onChange={(e) => setFormData({ ...formData, enable_3d: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">تفعيل التأثير ثلاثي الأبعاد</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">مفعّل</span>
                </label>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-bold text-gray-700 mb-3">معاينة العنصر:</p>
                <div className="flex items-center justify-center">
                  <div
                    className="ticker-3d-card"
                    style={{
                      background: formData.background_gradient,
                      transform: formData.enable_3d ? 'rotateY(-5deg) rotateX(2deg)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    {(() => {
                      const IconComp = getIconComponent(formData.icon_name);
                      return (
                        <div className={`animate-${formData.animation_type}`}>
                          <IconComp className="w-5 h-5" style={{ color: formData.icon_color }} />
                        </div>
                      );
                    })()}
                    <span className="text-sm font-bold text-emerald-700">
                      {formData.content_ar || 'نص تجريبي'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingItem ? 'تحديث' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">العناصر الحالية ({items.length})</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Layers className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>لا توجد عناصر بعد. ابدأ بإضافة عنصر جديد!</p>
            </div>
          ) : (
            items.map((item) => {
              const IconComponent = getIconComponent(item.icon_name);
              return (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div
                      className="ticker-3d-card"
                      style={{
                        background: item.background_gradient,
                        padding: '0.5rem 1rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <IconComponent className="w-4 h-4" style={{ color: item.icon_color }} />
                      <span className="text-sm font-bold text-emerald-700">{item.content_ar}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        الحركة: {animations.find(a => a.value === item.animation_type)?.label}
                        {' • '}
                        ثلاثي الأبعاد: {item.enable_3d ? 'نعم' : 'لا'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.is_active
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={item.is_active ? 'مفعّل' : 'معطّل'}
                      >
                        {item.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id!)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        .ticker-3d-container {
          width: 100%;
          overflow: hidden;
        }

        .ticker-3d-content {
          display: flex;
          gap: 2rem;
          animation: ticker-scroll 30s linear infinite;
        }

        .ticker-3d-item {
          flex-shrink: 0;
        }

        .ticker-3d-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .ticker-3d-icon {
          transform-style: preserve-3d;
        }

        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes animate-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        @keyframes animate-glow {
          0%, 100% { filter: drop-shadow(0 0 4px currentColor); }
          50% { filter: drop-shadow(0 0 12px currentColor); }
        }

        .animate-float {
          animation: animate-float 2s ease-in-out infinite;
        }

        .animate-glow {
          animation: animate-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
