import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface FarmVariety {
  id?: string;
  tree_type: 'نخيل' | 'زيتون';
  variety_name: string;
  tree_count: number;
  price_per_tree: number | null;
}

interface FarmVarietiesManagerProps {
  farmType: string;
  varieties: FarmVariety[];
  onChange: (varieties: FarmVariety[]) => void;
  basePrice?: number;
}

export function FarmVarietiesManager({ farmType, varieties, onChange, basePrice = 0 }: FarmVarietiesManagerProps) {
  const [newVariety, setNewVariety] = useState<FarmVariety>({
    tree_type: farmType === 'نخيل' ? 'نخيل' : 'زيتون',
    variety_name: '',
    tree_count: 0,
    price_per_tree: null
  });

  const handleAddVariety = () => {
    if (!newVariety.variety_name.trim()) {
      alert('الرجاء إدخال اسم الصنف');
      return;
    }
    if (newVariety.tree_count <= 0) {
      alert('الرجاء إدخال عدد صحيح من الأشجار');
      return;
    }

    onChange([...varieties, { ...newVariety }]);
    setNewVariety({
      tree_type: farmType === 'نخيل' ? 'نخيل' : 'زيتون',
      variety_name: '',
      tree_count: 0,
      price_per_tree: null
    });
  };

  const handleRemoveVariety = (index: number) => {
    const updated = varieties.filter((_, i) => i !== index);
    onChange(updated);
  };

  const getTotalTrees = () => {
    return varieties.reduce((sum, v) => sum + v.tree_count, 0);
  };

  const treeTypeIcon = farmType === 'نخيل' ? '🌴' : farmType === 'زيتون' ? '🫒' : '🌿';
  const treeTypeLabel = farmType === 'نخيل' ? 'النخيل' : farmType === 'زيتون' ? 'الزيتون' : 'الأشجار';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{treeTypeIcon}</span>
          <div>
            <h3 className="text-lg font-bold text-emerald-900">أصناف {treeTypeLabel}</h3>
            <p className="text-sm text-emerald-700">إجمالي الأشجار: <span className="font-bold">{getTotalTrees()}</span></p>
          </div>
        </div>

        {varieties.length > 0 && (
          <div className="space-y-3 mb-4">
            {varieties.map((variety, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{variety.tree_type === 'نخيل' ? '🌴' : '🫒'}</span>
                    <div>
                      <p className="font-bold text-gray-800">{variety.variety_name}</p>
                      <p className="text-sm text-gray-600">
                        عدد الأشجار: <span className="font-semibold text-emerald-600">{variety.tree_count}</span>
                        {variety.price_per_tree && (
                          <span className="mr-3">
                            | السعر: <span className="font-semibold text-emerald-600">{variety.price_per_tree}</span> ريال
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVariety(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg p-4 border-2 border-dashed border-emerald-300">
          <p className="text-sm font-semibold text-emerald-800 mb-3">إضافة صنف جديد</p>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={newVariety.variety_name}
                onChange={(e) => setNewVariety({ ...newVariety, variety_name: e.target.value })}
                placeholder="اسم الصنف (مثال: خلاص، سكري، أربيكينا)"
                className="px-4 py-2 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <input
                type="number"
                min="1"
                value={newVariety.tree_count || ''}
                onChange={(e) => setNewVariety({ ...newVariety, tree_count: parseInt(e.target.value) || 0 })}
                placeholder="عدد الأشجار"
                className="px-4 py-2 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={newVariety.price_per_tree || ''}
                onChange={(e) => setNewVariety({ ...newVariety, price_per_tree: parseFloat(e.target.value) || null })}
                placeholder={`السعر (افتراضي: ${basePrice} ريال)`}
                className="px-4 py-2 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddVariety}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              إضافة الصنف
            </button>
          </div>
        </div>

        {varieties.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">لم يتم إضافة أي أصناف بعد</p>
            <p className="text-xs text-gray-400 mt-1">قم بإضافة أصناف الأشجار المتوفرة في المزرعة</p>
          </div>
        )}
      </div>
    </div>
  );
}
