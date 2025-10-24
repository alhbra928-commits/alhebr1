import React from 'react';
import { Filter } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface FarmFiltersProps {
  activeFilter: 'all' | 'open' | 'almost_full' | 'full';
  onFilterChange: (filter: 'all' | 'open' | 'almost_full' | 'full') => void;
  counts: {
    all: number;
    open: number;
    almost_full: number;
    full: number;
  };
}

export function FarmFilters({ activeFilter, onFilterChange, counts }: FarmFiltersProps) {
  const filters = [
    { id: 'all', label: 'الكل', color: brandColors.primary.gold, count: counts.all },
    { id: 'open', label: 'الجاهزة', color: '#10B981', count: counts.open },
    { id: 'almost_full', label: 'وشك الانتهاء', color: '#F59E0B', count: counts.almost_full },
    { id: 'full', label: 'المكتملة', color: '#6B7280', count: counts.full },
  ] as const;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="h-5 w-5" style={{ color: brandColors.primary.gold }} />
        <h3 className="text-lg font-bold" style={{ color: brandColors.text.primary }}>
          تصفية المزارع
        </h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: isActive
                  ? filter.color
                  : 'rgba(255, 255, 255, 0.5)',
                color: isActive
                  ? brandColors.text.white
                  : brandColors.text.primary,
                border: `2px solid ${filter.color}`,
                boxShadow: isActive
                  ? `0 10px 30px ${filter.color}40`
                  : 'none',
              }}
            >
              <span>{filter.label}</span>
              <span
                className="mr-2 px-2 py-1 rounded-full text-xs font-black"
                style={{
                  background: isActive
                    ? 'rgba(255, 255, 255, 0.3)'
                    : `${filter.color}20`,
                  color: isActive ? brandColors.text.white : filter.color,
                }}
              >
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
