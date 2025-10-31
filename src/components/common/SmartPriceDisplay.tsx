import React from 'react';

interface SmartPriceDisplayProps {
  farmType: string;
  unitPrice: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function SmartPriceDisplay({
  farmType,
  unitPrice,
  showLabel = true,
  size = 'medium'
}: SmartPriceDisplayProps) {
  const getPriceLabel = () => {
    switch (farmType) {
      case 'نخيل':
        return 'سعر شجرة النخيل';
      case 'زيتون':
        return 'سعر شجرة الزيتون';
      case 'مختلط':
        return 'سعر الشجرة';
      default:
        return 'سعر الشجرة';
    }
  };

  const getIcon = () => {
    switch (farmType) {
      case 'نخيل':
        return '🌴';
      case 'زيتون':
        return '🌳';
      case 'مختلط':
        return '🌾';
      default:
        return '🌱';
    }
  };

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const priceClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className={`text-[#2C2C2C]/70 ${sizeClasses[size]}`}>
          {getIcon()} {getPriceLabel()}:
        </span>
      )}
      <span className={`font-black text-[#C9A962] ${priceClasses[size]}`}>
        {unitPrice.toLocaleString('ar-SA')} ريال
      </span>
    </div>
  );
}
