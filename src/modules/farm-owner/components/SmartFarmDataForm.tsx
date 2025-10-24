import React, { useState, useEffect } from 'react';
import { farmOwnerService, FarmVariety } from '../services/farmOwnerService';
import { Save, Plus, Trash2, MapPin } from 'lucide-react';

interface SmartFarmDataFormProps {
  profileId: string;
  onSuccess: () => void;
  initialData?: any;
}

type FarmType = 'نخيل' | 'زيتون' | 'مختلط';

export const SmartFarmDataForm: React.FC<SmartFarmDataFormProps> = ({ profileId, onSuccess, initialData }) => {
  // القسم (أ) - بيانات المالك
  const [fullName, setFullName] = useState(initialData?.full_name || '');
  const [nationalId, setNationalId] = useState(initialData?.national_id || '');
  const [region, setRegion] = useState(initialData?.region || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [deedNumber, setDeedNumber] = useState(initialData?.deed_number || '');
  const [totalArea, setTotalArea] = useState<number>(initialData?.total_farm_area || 0);
  const [areaUnit, setAreaUnit] = useState(initialData?.farm_area_unit || 'متر');

  // القسم (ب) - نوع المزرعة والأصناف
  const [farmType, setFarmType] = useState<FarmType>(initialData?.farm_type || 'نخيل');
  const [varieties, setVarieties] = useState<Array<{ type: 'نخيل' | 'زيتون'; name: string; count: number }>>([]);

  // القسم (ج) - التسعير
  const [totalPrice, setTotalPrice] = useState<number>(initialData?.actual_total_price || 0);
  const [pricePerTree, setPricePerTree] = useState<number>(initialData?.price_per_tree || 0);
  const [gracePeriod, setGracePeriod] = useState<number>(initialData?.payment_grace_period || 6);
  const [additionalNotes, setAdditionalNotes] = useState(initialData?.additional_notes || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData?.id) {
      loadVarieties();
    }
  }, [initialData]);

  const loadVarieties = async () => {
    const data = await farmOwnerService.getVarieties(profileId);
    setVarieties(data.map(v => ({ type: v.variety_type, name: v.variety_name, count: v.variety_count })));
  };

  const addVariety = () => {
    setVarieties([...varieties, { type: farmType === 'مختلط' ? 'نخيل' : farmType, name: '', count: 0 }]);
  };

  const removeVariety = (index: number) => {
    setVarieties(varieties.filter((_, i) => i !== index));
  };

  const updateVariety = (index: number, field: 'name' | 'count' | 'type', value: any) => {
    const updated = [...varieties];
    updated[index] = { ...updated[index], [field]: value };
    setVarieties(updated);
  };

  const getTotalTrees = () => {
    return varieties.reduce((sum, v) => sum + (v.count || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // التحقق من البيانات
    if (!fullName.trim() || !nationalId.trim() || !region.trim() || !city.trim() || !deedNumber.trim()) {
      setError('جميع الحقول مطلوبة');
      setLoading(false);
      return;
    }

    if (totalArea <= 0 || totalPrice <= 0 || pricePerTree <= 0) {
      setError('الأرقام يجب أن تكون أكبر من صفر');
      setLoading(false);
      return;
    }

    if (varieties.length === 0) {
      setError('يجب إضافة صنف واحد على الأقل');
      setLoading(false);
      return;
    }

    const invalidVariety = varieties.find(v => !v.name.trim() || v.count <= 0);
    if (invalidVariety) {
      setError('جميع الأصناف يجب أن تحتوي على اسم وعدد صحيح');
      setLoading(false);
      return;
    }

    const result = await farmOwnerService.submitForReview(profileId, {
      full_name: fullName,
      national_id: nationalId,
      region,
      city,
      deed_number: deedNumber,
      total_farm_area: totalArea,
      farm_area_unit: areaUnit,
      farm_type: farmType,
      actual_total_price: totalPrice,
      price_per_tree: pricePerTree,
      payment_grace_period: gracePeriod,
      additional_notes: additionalNotes,
      varieties
    });

    if (result.success) {
      alert(`✅ تم إرسال طلبك بنجاح!\n\nإجمالي الأشجار: ${result.total_trees}\n\nسيتم مراجعة الطلب من قبل الإدارة وإشعارك قريباً.`);
      onSuccess();
    } else {
      setError(result.error || 'حدث خطأ في الإرسال');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* القسم (أ) - بيانات المالك */}
      <div className="bg-white rounded-3xl p-6 border-2" style={{ borderColor: '#8BC34A' }}>
        <h3 className="text-xl font-black mb-6 flex items-center gap-2" style={{ color: '#8BC34A' }}>
          <span>👤</span> بيانات المالك
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">الاسم الكامل *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="أدخل الاسم الكامل"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">رقم الهوية *</label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              required
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="10 أرقام"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">المنطقة *</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors"
            >
              <option value="">اختر المنطقة</option>
              <option value="الرياض">الرياض</option>
              <option value="مكة المكرمة">مكة المكرمة</option>
              <option value="المدينة المنورة">المدينة المنورة</option>
              <option value="الشرقية">الشرقية</option>
              <option value="القصيم">القصيم</option>
              <option value="الجوف">الجوف</option>
              <option value="حائل">حائل</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">المدينة *</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="أدخل المدينة"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">رقم الصك *</label>
            <input
              type="text"
              value={deedNumber}
              onChange={(e) => setDeedNumber(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="رقم الصك"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">المساحة الكلية *</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={totalArea}
                onChange={(e) => setTotalArea(Number(e.target.value))}
                required
                min="1"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors"
                placeholder="المساحة"
              />
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors"
              >
                <option value="متر">متر</option>
                <option value="هكتار">هكتار</option>
                <option value="دونم">دونم</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* القسم (ب) - نوع المزرعة والأصناف */}
      <div className="bg-white rounded-3xl p-6 border-2" style={{ borderColor: '#F59E0B' }}>
        <h3 className="text-xl font-black mb-6 flex items-center gap-2" style={{ color: '#F59E0B' }}>
          <span>🌳</span> نوع المزرعة والأصناف
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-3 text-gray-700">نوع المزرعة *</label>
          <div className="grid grid-cols-3 gap-4">
            {(['نخيل', 'زيتون', 'مختلط'] as FarmType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setFarmType(type);
                  setVarieties([]);
                }}
                className="px-6 py-4 rounded-xl font-bold transition-all"
                style={{
                  background: farmType === type ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'white',
                  color: farmType === type ? 'white' : '#4B5563',
                  border: `2px solid ${farmType === type ? '#F59E0B' : '#E5E7EB'}`,
                  transform: farmType === type ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-700">الأصناف</h4>
            <button
              type="button"
              onClick={addVariety}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #8BC34A, #689F38)' }}
            >
              <Plus size={18} />
              إضافة صنف
            </button>
          </div>

          {varieties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لم يتم إضافة أصناف بعد. اضغط "إضافة صنف" للبدء.
            </div>
          ) : (
            <div className="space-y-3">
              {varieties.map((variety, index) => (
                <div key={index} className="flex gap-3 items-end">
                  {farmType === 'مختلط' && (
                    <div className="flex-1">
                      <label className="block text-xs font-bold mb-1 text-gray-600">النوع</label>
                      <select
                        value={variety.type}
                        onChange={(e) => updateVariety(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none"
                      >
                        <option value="نخيل">نخيل</option>
                        <option value="زيتون">زيتون</option>
                      </select>
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="block text-xs font-bold mb-1 text-gray-600">اسم الصنف</label>
                    <input
                      type="text"
                      value={variety.name}
                      onChange={(e) => updateVariety(index, 'name', e.target.value)}
                      placeholder={variety.type === 'نخيل' ? 'مثال: سكري' : 'مثال: إسباني'}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-bold mb-1 text-gray-600">العدد</label>
                    <input
                      type="number"
                      value={variety.count || ''}
                      onChange={(e) => updateVariety(index, 'count', Number(e.target.value))}
                      min="1"
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeVariety(index)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}

              <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(139, 195, 74, 0.1)' }}>
                <p className="font-bold" style={{ color: '#689F38' }}>
                  إجمالي الأشجار: {getTotalTrees()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* القسم (ج) - التسعير والشروط */}
      <div className="bg-white rounded-3xl p-6 border-2" style={{ borderColor: '#D4AF37' }}>
        <h3 className="text-xl font-black mb-6 flex items-center gap-2" style={{ color: '#D4AF37' }}>
          <span>💰</span> التسعير والشروط
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">السعر الإجمالي (ريال) *</label>
            <input
              type="number"
              value={totalPrice}
              onChange={(e) => setTotalPrice(Number(e.target.value))}
              required
              min="1"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:outline-none transition-colors"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">السعر لكل شجرة (ريال) *</label>
            <input
              type="number"
              value={pricePerTree}
              onChange={(e) => setPricePerTree(Number(e.target.value))}
              required
              min="1"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:outline-none transition-colors"
              placeholder="0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-2 text-gray-700">مدة السماح (شهور) *</label>
            <div className="grid grid-cols-4 gap-3">
              {[3, 6, 9, 12].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setGracePeriod(months)}
                  className="px-4 py-3 rounded-xl font-bold transition-all"
                  style={{
                    background: gracePeriod === months ? 'linear-gradient(135deg, #D4AF37, #C4941F)' : 'white',
                    color: gracePeriod === months ? 'white' : '#4B5563',
                    border: `2px solid ${gracePeriod === months ? '#D4AF37' : '#E5E7EB'}`
                  }}
                >
                  {months} شهور
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-2 text-gray-700">ملاحظات إضافية</label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:outline-none transition-colors resize-none"
              placeholder="أي معلومات إضافية تود إضافتها..."
            />
          </div>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="p-4 rounded-xl text-center font-bold" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          color: '#DC2626'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* القسم (د) - زر الحفظ والإرسال */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 rounded-3xl font-black text-xl text-white transition-all duration-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: loading
            ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
            : 'linear-gradient(135deg, #D4AF37 0%, #F4E4A7 50%, #D4AF37 100%)',
          boxShadow: loading ? 'none' : '0 20px 60px rgba(212, 175, 55, 0.6), inset 0 0 40px rgba(255, 255, 255, 0.2)',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
          transform: loading ? 'none' : 'perspective(1000px) rotateX(5deg)'
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="inline-block w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            جاري الإرسال...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-3">
            <Save size={24} />
            💾 حفظ وإرسال لإدارة المنصة
          </span>
        )}
      </button>
    </form>
  );
};
