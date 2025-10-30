// نظام الثيم الموحد للبوابة الملكية الخضراء

export const royalGreenTheme = {
  // الألوان الأساسية
  colors: {
    // التدرج الأخضر الرئيسي
    primary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },

    // الزمردي
    emerald: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },

    // الأخضر
    green: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },

    // التيل (أزرق مخضر)
    teal: {
      50: '#F0FDFA',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',
    },

    // الذهبي (للتفاصيل)
    gold: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },

    // الرمادي
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  // التدرجات
  gradients: {
    primary: 'from-emerald-500 via-green-500 to-teal-500',
    primaryHover: 'from-emerald-600 via-green-600 to-teal-600',
    background: 'from-emerald-50 via-green-50 to-teal-50',
    glass: 'from-emerald-500/10 via-green-500/10 to-teal-500/10',
    overlay: 'from-emerald-900/20 via-green-900/20 to-teal-900/20',
    card: 'from-white via-emerald-50/30 to-white',
    shine: 'from-transparent via-white/30 to-transparent',
  },

  // الظلال
  shadows: {
    sm: '0 1px 2px 0 rgb(16 185 129 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(16 185 129 / 0.1), 0 1px 2px -1px rgb(16 185 129 / 0.1)',
    md: '0 4px 6px -1px rgb(16 185 129 / 0.1), 0 2px 4px -2px rgb(16 185 129 / 0.1)',
    lg: '0 10px 15px -3px rgb(16 185 129 / 0.1), 0 4px 6px -4px rgb(16 185 129 / 0.1)',
    xl: '0 20px 25px -5px rgb(16 185 129 / 0.1), 0 8px 10px -6px rgb(16 185 129 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(16 185 129 / 0.25)',
    glow: '0 0 30px rgb(16 185 129 / 0.3)',
    glowStrong: '0 0 50px rgb(16 185 129 / 0.5)',
  },

  // الحدود
  borders: {
    light: 'border-emerald-100',
    DEFAULT: 'border-emerald-200',
    dark: 'border-emerald-300',
    glow: 'border-emerald-400 shadow-glow',
  },

  // الخلفيات
  backgrounds: {
    primary: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500',
    light: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
    glass: 'bg-white/80 backdrop-blur-xl',
    card: 'bg-white',
    hover: 'hover:bg-emerald-50',
  },

  // النصوص
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-600',
    light: 'text-gray-500',
    accent: 'text-emerald-600',
    gradient: 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent',
  },

  // الأزرار
  buttons: {
    primary: 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300',
    secondary: 'bg-white text-emerald-600 border-2 border-emerald-200 hover:bg-emerald-50 transition-all duration-300',
    ghost: 'text-emerald-600 hover:bg-emerald-50 transition-all duration-300',
    outline: 'border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-300',
  },

  // البطاقات
  cards: {
    default: 'bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300',
    premium: 'bg-gradient-to-br from-white via-emerald-50/30 to-white rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300',
    glass: 'bg-white/80 backdrop-blur-xl rounded-2xl border border-emerald-100/50 shadow-lg',
    glow: 'bg-white rounded-2xl border border-emerald-200 shadow-glow hover:shadow-glowStrong transition-all duration-300',
  },

  // المسافات (Spacing)
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
  },

  // الانحناءات (Border Radius)
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    full: '9999px',
  },

  // التأثيرات الخاصة
  effects: {
    shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
    float: 'animate-float',
    pulse: 'animate-pulse',
    glow: 'animate-glow',
  },

  // الرسوم المتحركة
  animations: {
    float: 'float 3s ease-in-out infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    glow: 'glow 2s ease-in-out infinite',
    spin: 'spin 1s linear infinite',
    bounce: 'bounce 1s infinite',
  },
};

// دوال مساعدة للوصول السريع
export const getGradient = (type: keyof typeof royalGreenTheme.gradients = 'primary') => {
  return royalGreenTheme.gradients[type];
};

export const getColor = (color: string, shade: number = 500) => {
  const [colorName] = color.split('-');
  const colors = royalGreenTheme.colors as any;
  return colors[colorName]?.[shade] || color;
};

export const getButtonClass = (variant: keyof typeof royalGreenTheme.buttons = 'primary') => {
  return royalGreenTheme.buttons[variant];
};

export const getCardClass = (variant: keyof typeof royalGreenTheme.cards = 'default') => {
  return royalGreenTheme.cards[variant];
};

// CSS Variables لاستخدامها في أي مكان
export const injectThemeVariables = () => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Primary Colors
  root.style.setProperty('--color-primary-50', royalGreenTheme.colors.primary[50]);
  root.style.setProperty('--color-primary-500', royalGreenTheme.colors.primary[500]);
  root.style.setProperty('--color-primary-600', royalGreenTheme.colors.primary[600]);
  root.style.setProperty('--color-primary-700', royalGreenTheme.colors.primary[700]);

  // Emerald Colors
  root.style.setProperty('--color-emerald-50', royalGreenTheme.colors.emerald[50]);
  root.style.setProperty('--color-emerald-500', royalGreenTheme.colors.emerald[500]);
  root.style.setProperty('--color-emerald-600', royalGreenTheme.colors.emerald[600]);

  // Green Colors
  root.style.setProperty('--color-green-50', royalGreenTheme.colors.green[50]);
  root.style.setProperty('--color-green-500', royalGreenTheme.colors.green[500]);
  root.style.setProperty('--color-green-600', royalGreenTheme.colors.green[600]);

  // Teal Colors
  root.style.setProperty('--color-teal-50', royalGreenTheme.colors.teal[50]);
  root.style.setProperty('--color-teal-500', royalGreenTheme.colors.teal[500]);
  root.style.setProperty('--color-teal-600', royalGreenTheme.colors.teal[600]);
};

// تصدير كـ default أيضاً
export default royalGreenTheme;
