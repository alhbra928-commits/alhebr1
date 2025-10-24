interface SimpleLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function SimpleLoader({ size = 'md', color = '#C89B3C' }: SimpleLoaderProps) {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div
      className={`${sizeMap[size]} border-t-transparent rounded-full animate-spin`}
      style={{ borderColor: color, borderTopColor: 'transparent' }}
    />
  );
}
