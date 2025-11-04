import React, { useState } from 'react';
import { Save, MapPin, TreePine, DollarSign, Hash, FileText, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface FarmDataSubmissionFormProps {
  profileId: string;
  onSuccess: () => void;
}

export const FarmDataSubmissionForm: React.FC<FarmDataSubmissionFormProps> = ({ profileId, onSuccess }) => {
  // معلومات المزرعة الأساسية
  const [farmType, setFarmType] = useState<'نخيل' | 'زيتون' | 'نخيل وزيتون'>('نخيل');
  const [farmArea, setFarmArea] = useState('');
  const [farmAreaUnit, setFarmAreaUnit] = useState('دونم');
  const [deedNumber, setDeedNumber] = useState('');

  // الموقع
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [coordinates, setCoordinates] = useState('');

  // الأشجار والأسعار
  const [totalPalmTrees, setTotalPalmTrees] = useState('');
  const [palmTotalPrice, setPalmTotalPrice] = useState('');
  const [totalOliveTrees, setTotalOliveTrees] = useState('');
  const [oliveTotalPrice, setOliveTotalPrice] = useState('');

  // معلومات إضافية
  const [expectedReturn, setExpectedReturn] = useState('');
  const [farmDescription, setFarmDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // التحقق من البيانات
    if (!region || !city) {
      setMessage({ type: 'error', text: 'يرجى إدخال المنطقة والمدينة' });
      return;
    }

    if (!farmArea || parseFloat(farmArea) <= 0) {
      setMessage({ type: 'error', text: 'يرجى إدخال مساحة المزرعة' });
      return;
    }

    // التحقق من الأشجار حسب النوع
    if (farmType === 'نخيل' || farmType === 'نخيل وزيتون') {
      if (!totalPalmTrees || parseInt(totalPalmTrees) <= 0) {
        setMessage({ type: 'error', text: 'يرجى إدخال عدد أشجار النخيل' });
        return;
      }
      if (!palmTotalPrice || parseFloat(palmTotalPrice) <= 0) {
        setMessage({ type: 'error', text: 'يرجى إدخال السعر الإجمالي لأشجار النخيل' });
        return;
      }
    }

    if (farmType === 'زيتون' || farmType === 'نخيل وزيتون') {
      if (!totalOliveTrees || parseInt(totalOliveTrees) <= 0) {
        setMessage({ type: 'error', text: 'يرجى إدخال عدد أشجار الزيتون' });
        return;
      }
      if (!oliveTotalPrice || parseFloat(oliveTotalPrice) <= 0) {
        setMessage({ type: 'error', text: 'يرجى إدخال السعر الإجمالي لأشجار الزيتون' });
        return;
      }
    }

    setLoading(true);

    try {
      const formData = {
        farm_type: farmType,
        farm_area: parseFloat(farmArea),
        farm_area_unit: farmAreaUnit,
        deed_number: deedNumber,
        farm_location_region: region,
        farm_location_city: city,
        farm_address: farmAddress || null,
        farm_coordinates: coordinates || null,
        farm_description: farmDescription || null,
        total_palm_trees: farmType !== 'زيتون' ? parseInt(totalPalmTrees) : 0,
        available_palm_trees: farmType !== 'زيتون' ? parseInt(totalPalmTrees) : 0,
        palm_tree_price: farmType !== 'زيتون' ? parseFloat(palmTotalPrice) / parseInt(totalPalmTrees) : null,
        total_olive_trees: farmType !== 'نخيل' ? parseInt(totalOliveTrees) : 0,
        available_olive_trees: farmType !== 'نخيل' ? parseInt(totalOliveTrees) : 0,
        olive_tree_price: farmType !== 'نخيل' ? parseFloat(oliveTotalPrice) / parseInt(totalOliveTrees) : null,
        expected_annual_return: expectedReturn ? parseFloat(expectedReturn) : null
      };

      // حفظ البيانات في farm_owners
      const { error } = await supabase
        .from('farm_owners')
        .update(formData)
        .eq('id', profileId);

      if (error) throw error;

      setMessage({ type: 'success', text: '✅ تم حفظ بيانات المزرعة بنجاح! سيتم مراجعتها قريباً' });
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting farm data:', error);
      setMessage({ type: 'error', text: error.message || 'حدث خطأ أثناء الحفظ' });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    const palmValue = (farmType !== 'زيتون' && palmTotalPrice)
      ? parseFloat(palmTotalPrice)
      : 0;
    const oliveValue = (farmType !== 'نخيل' && oliveTotalPrice)
      ? parseFloat(oliveTotalPrice)
      : 0;
    return palmValue + oliveValue;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* نوع المزرعة */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
        <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
          <TreePine className="w-5 h-5" />
          نوع المزرعة
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {['نخيل', 'زيتون', 'نخيل وزيتون'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFarmType(type as any)}
              className={`p-4 rounded-xl border-2 font-bold transition-all ${
                farmType === type
                  ? 'bg-green-600 text-white border-green-600 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* معلومات المزرعة الأساسية */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          معلومات المزرعة الأساسية
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المنطقة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
              placeholder="مثال: الرياض"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المدينة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
              placeholder="مثال: الخرج"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المساحة <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={farmArea}
                onChange={(e) => setFarmArea(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
                placeholder="مثال: 50"
                required
                step="0.01"
                min="0"
              />
              <select
                value={farmAreaUnit}
                onChange={(e) => setFarmAreaUnit(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
              >
                <option>دونم</option>
                <option>هكتار</option>
                <option>متر مربع</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الصك
            </label>
            <input
              type="text"
              value={deedNumber}
              onChange={(e) => setDeedNumber(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
              placeholder="رقم صك المزرعة"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان التفصيلي
            </label>
            <input
              type="text"
              value={farmAddress}
              onChange={(e) => setFarmAddress(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
              placeholder="مثال: طريق الملك فهد، بجوار مزرعة الأمير"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الإحداثيات (اختياري)
            </label>
            <input
              type="text"
              value={coordinates}
              onChange={(e) => setCoordinates(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
              placeholder="مثال: 24.7136,46.6753"
            />
          </div>
        </div>
      </div>

      {/* أشجار النخيل */}
      {(farmType === 'نخيل' || farmType === 'نخيل وزيتون') && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-200">
          <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
            <TreePine className="w-5 h-5" />
            أشجار النخيل
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الأشجار <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={totalPalmTrees}
                onChange={(e) => setTotalPalmTrees(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                placeholder="مثال: 200"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر الإجمالي (ر.س) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={palmTotalPrice}
                onChange={(e) => setPalmTotalPrice(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                placeholder="مثال: 300000"
                required
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* أشجار الزيتون */}
      {(farmType === 'زيتون' || farmType === 'نخيل وزيتون') && (
        <div className="bg-gradient-to-br from-green-50 to-lime-50 rounded-2xl p-6 border-2 border-green-300">
          <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
            <TreePine className="w-5 h-5" />
            أشجار الزيتون
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الأشجار <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={totalOliveTrees}
                onChange={(e) => setTotalOliveTrees(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
                placeholder="مثال: 150"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر الإجمالي (ر.س) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={oliveTotalPrice}
                onChange={(e) => setOliveTotalPrice(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
                placeholder="مثال: 180000"
                required
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          معلومات إضافية
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العائد السنوي المتوقع (%)
            </label>
            <input
              type="number"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="مثال: 12"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف المزرعة
            </label>
            <textarea
              value={farmDescription}
              onChange={(e) => setFarmDescription(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
              rows={4}
              placeholder="اكتب وصفاً تفصيلياً عن المزرعة، مميزاتها، نظام الري، الخدمات المتوفرة..."
            />
          </div>
        </div>
      </div>

      {/* زر الإرسال */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        <Save className="w-6 h-6" />
        {loading ? 'جاري الحفظ...' : 'حفظ بيانات المزرعة'}
      </button>
    </form>
  );
};
