import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { ArrowRight } from 'lucide-react';

export function ReservationsDebugView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = async () => {
    try {
      setLoading(true);
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .limit(10);

      if (error) throw error;

      setData({
        reservations: reservations || [],
        count: reservations?.length || 0
      });
    } catch (err) {
      console.error('Error loading debug data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#C89B3C] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-2">وضع التصحيح - الحجوزات</h1>
          <p className="text-gray-600">عرض البيانات الخام من قاعدة البيانات</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">البيانات الخام</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm" dir="ltr">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
