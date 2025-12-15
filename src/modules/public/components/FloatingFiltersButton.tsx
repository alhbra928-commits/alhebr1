import { useState, useEffect } from 'react';
import { Filter, X, ChevronUp } from 'lucide-react';

interface FloatingFiltersButtonProps {
  activeFilter: 'all' | 'open' | 'almost_full' | 'full';
  onFilterChange: (filter: 'all' | 'open' | 'almost_full' | 'full') => void;
  counts: {
    all: number;
    open: number;
    almost_full: number;
    full: number;
  };
}

export function FloatingFiltersButton({
  activeFilter,
  onFilterChange,
  counts
}: FloatingFiltersButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filters = [
    { id: 'all', label: 'جميع المزارع', icon: '📊', color: 'from-amber-500 to-yellow-500', border: 'border-amber-500', bg: 'bg-amber-50' },
    { id: 'open', label: 'المتاحة للحجز', icon: '✅', color: 'from-emerald-500 to-green-500', border: 'border-emerald-500', bg: 'bg-emerald-50' },
    { id: 'almost_full', label: 'قرب الاكتمال', icon: '⚠️', color: 'from-orange-500 to-amber-500', border: 'border-orange-500', bg: 'bg-orange-50' },
    { id: 'full', label: 'اكتملت', icon: '🔒', color: 'from-gray-500 to-slate-500', border: 'border-gray-500', bg: 'bg-gray-50' },
  ] as const;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && !target.closest('.floating-filters-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleFilterClick = (filterId: 'all' | 'open' | 'almost_full' | 'full') => {
    onFilterChange(filterId);
    setIsOpen(false);
  };

  const activeFilterData = filters.find(f => f.id === activeFilter);

  return (
    <div className="floating-filters-container fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      {/* القائمة المنسدلة للأعلى */}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-200 p-4 min-w-[320px] max-w-[90vw]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-amber-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-amber-900">تصفية المزارع</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter.id)}
                  className={`group relative overflow-hidden px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                    isActive
                      ? `bg-gradient-to-r ${filter.color} shadow-lg`
                      : `${filter.bg} hover:shadow-md border-2 ${filter.border} border-opacity-30`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{filter.icon}</span>
                      <span className={`font-bold text-sm ${
                        isActive ? 'text-white' : 'text-gray-700'
                      }`}>
                        {filter.label}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                      isActive
                        ? 'bg-white/30 text-white'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}>
                      <span className="text-xs font-black">
                        {counts[filter.id]}
                      </span>
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                      <div className="w-1.5 h-8 bg-white/50 rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Arrow pointing down to button */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="w-4 h-4 bg-white border-b-2 border-r-2 border-amber-200 transform rotate-45"></div>
        </div>
      </div>

      {/* الزر العائم الثابت */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative overflow-hidden px-6 py-4 rounded-2xl font-bold text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 ${
          isOpen ? 'scale-105' : ''
        }`}
        style={{
          background: activeFilterData
            ? `linear-gradient(to right, ${activeFilterData.color.split(' ')[1]}, ${activeFilterData.color.split(' ')[3]})`
            : 'linear-gradient(to right, #d97706, #eab308)',
        }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

        {/* Content */}
        <div className="relative flex items-center gap-3">
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronUp className="w-5 h-5" />
          </div>
          <Filter className="w-5 h-5" />
          <span className="text-base">الفلاتر</span>

          {/* Active Filter Badge */}
          {activeFilter !== 'all' && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center animate-pulse shadow-lg">
              1
            </div>
          )}
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
        </div>
      </button>

      {/* Overlay when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
