/**
 * 🤖 AI Adaptive Interface Service
 *
 * المحرك الذكي للواجهة المتكيفة - يدير جميع العناصر التفاعلية
 * ويضمن عملها بانسجام على جميع الأجهزة
 */

export interface DeviceInfo {
  type: 'ios' | 'android' | 'desktop' | 'tablet';
  isIPhone: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  hasNotch: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  viewport: {
    width: number;
    height: number;
    visualHeight: number;
  };
  orientation: 'portrait' | 'landscape';
}

export interface InterfacePosition {
  bottom: number;
  right: number;
  zIndex: number;
  scale: number;
}

export interface ElementState {
  id: string;
  visible: boolean;
  position: InterfacePosition;
  interacting: boolean;
}

class AIAdaptiveInterfaceService {
  private deviceInfo: DeviceInfo | null = null;
  private elements: Map<string, ElementState> = new Map();
  private listeners: Map<string, Set<(state: ElementState) => void>> = new Map();
  private scrollPosition: number = 0;
  private keyboardVisible: boolean = false;
  private lastUpdate: number = 0;
  private updateThrottle: number = 50; // ms

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * تهيئة النظام واكتشاف الجهاز
   */
  private initialize(): void {
    this.detectDevice();
    this.setupListeners();
    this.registerElements();
  }

  /**
   * اكتشاف نوع وخصائص الجهاز
   */
  private detectDevice(): void {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isMobile = /Mobile/.test(ua) || isIOS || isAndroid;
    const isTablet = /iPad|Android/.test(ua) && !/Mobile/.test(ua);

    // iPhone models with notch (X and later)
    const hasNotch = isIOS && (
      window.screen.height >= 812 || // iPhone X, XS, 11 Pro, 12 mini, 13 mini
      window.screen.height >= 896 || // iPhone XR, XS Max, 11, 11 Pro Max
      window.screen.height >= 926    // iPhone 12, 12 Pro, 13, 13 Pro, 14
    );

    // Get safe area insets
    const style = getComputedStyle(document.documentElement);
    const safeAreaInsets = {
      top: parseInt(style.getPropertyValue('--sat') || '0') || (hasNotch ? 44 : 20),
      bottom: parseInt(style.getPropertyValue('--sab') || '0') || (hasNotch ? 34 : 0),
      left: parseInt(style.getPropertyValue('--sal') || '0') || 0,
      right: parseInt(style.getPropertyValue('--sar') || '0') || 0,
    };

    // Get viewport info
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      visualHeight: window.visualViewport?.height || window.innerHeight,
    };

    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

    this.deviceInfo = {
      type: isIOS ? 'ios' : isAndroid ? 'android' : isTablet ? 'tablet' : 'desktop',
      isIPhone: isIOS && /iPhone/.test(ua),
      isAndroid,
      isMobile,
      isTablet,
      hasNotch,
      safeAreaInsets,
      viewport,
      orientation,
    };

    console.log('🤖 AI Interface: Device detected', this.deviceInfo);
  }

  /**
   * إعداد المستمعات للأحداث
   */
  private setupListeners(): void {
    // Scroll detection
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });

    // Resize and orientation change
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));

    // Visual viewport (for keyboard on iOS)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.handleVisualViewportResize.bind(this));
      window.visualViewport.addEventListener('scroll', this.handleVisualViewportScroll.bind(this));
    }

    // Touch events (for interaction detection)
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

    // Focus detection (for keyboard)
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
  }

  /**
   * تسجيل العناصر الافتراضية
   */
  private registerElements(): void {
    // Smart WhatsApp Button
    this.registerElement('smart-whatsapp-button', {
      id: 'smart-whatsapp-button',
      visible: true,
      position: this.calculateOptimalPosition('smart-whatsapp-button'),
      interacting: false,
    });

    // Admin Access Button
    this.registerElement('admin-access-button', {
      id: 'admin-access-button',
      visible: false, // Will be shown only for authorized users
      position: this.calculateOptimalPosition('admin-access-button'),
      interacting: false,
    });
  }

  /**
   * حساب الموضع الأمثل للعنصر
   */
  private calculateOptimalPosition(elementId: string): InterfacePosition {
    if (!this.deviceInfo) {
      return { bottom: 24, right: 24, zIndex: 9999, scale: 1 };
    }

    const { isMobile, isTablet, safeAreaInsets, viewport, orientation } = this.deviceInfo;

    let position: InterfacePosition = {
      bottom: 24,
      right: 24,
      zIndex: 9999,
      scale: 1,
    };

    if (elementId === 'smart-whatsapp-button') {
      if (isMobile) {
        position.bottom = safeAreaInsets.bottom + 80; // Above any bottom navigation
        position.right = 20;
        position.zIndex = 10000;
        position.scale = 1;
      } else if (isTablet) {
        position.bottom = 32;
        position.right = 32;
        position.zIndex = 9999;
        position.scale = 1.1;
      } else {
        position.bottom = 32;
        position.right = 32;
        position.zIndex = 9999;
        position.scale = 1;
      }
    }

    if (elementId === 'admin-access-button') {
      if (isMobile) {
        position.bottom = safeAreaInsets.bottom + 80;
        position.right = viewport.width - 90; // Left side
        position.zIndex = 10001; // Above WhatsApp button
        position.scale = 0.9;
      } else {
        position.bottom = 32;
        position.right = viewport.width - 100;
        position.zIndex = 9999;
        position.scale = 1;
      }
    }

    // Adjust for keyboard
    if (this.keyboardVisible && isMobile) {
      const keyboardHeight = viewport.height - viewport.visualHeight;
      position.bottom += keyboardHeight;
    }

    return position;
  }

  /**
   * تسجيل عنصر جديد
   */
  public registerElement(id: string, initialState: ElementState): void {
    this.elements.set(id, initialState);
    this.listeners.set(id, new Set());
  }

  /**
   * الاشتراك في تحديثات عنصر
   */
  public subscribe(id: string, callback: (state: ElementState) => void): () => void {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set());
    }

    this.listeners.get(id)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(id)?.delete(callback);
    };
  }

  /**
   * تحديث حالة عنصر
   */
  public updateElement(id: string, updates: Partial<ElementState>): void {
    const current = this.elements.get(id);
    if (!current) return;

    const updated = { ...current, ...updates };
    this.elements.set(id, updated);

    // Notify subscribers
    this.listeners.get(id)?.forEach(callback => callback(updated));
  }

  /**
   * الحصول على حالة عنصر
   */
  public getElementState(id: string): ElementState | null {
    return this.elements.get(id) || null;
  }

  /**
   * الحصول على معلومات الجهاز
   */
  public getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  /**
   * إظهار/إخفاء عنصر
   */
  public setElementVisibility(id: string, visible: boolean): void {
    this.updateElement(id, { visible });
  }

  /**
   * معالجة التمرير
   */
  private handleScroll(): void {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateThrottle) return;

    this.scrollPosition = window.scrollY;
    this.lastUpdate = now;

    // Update all elements based on scroll
    this.elements.forEach((state, id) => {
      const newPosition = this.calculateOptimalPosition(id);
      this.updateElement(id, { position: newPosition });
    });
  }

  /**
   * معالجة تغيير الحجم
   */
  private handleResize(): void {
    this.detectDevice();
    this.updateAllPositions();
  }

  /**
   * معالجة تغيير الاتجاه
   */
  private handleOrientationChange(): void {
    setTimeout(() => {
      this.detectDevice();
      this.updateAllPositions();
    }, 100);
  }

  /**
   * معالجة تغيير visual viewport (لوحة المفاتيح)
   */
  private handleVisualViewportResize(): void {
    if (!this.deviceInfo) return;

    const visualHeight = window.visualViewport?.height || window.innerHeight;
    const heightDiff = this.deviceInfo.viewport.height - visualHeight;

    this.keyboardVisible = heightDiff > 150; // Keyboard likely visible

    if (this.deviceInfo) {
      this.deviceInfo.viewport.visualHeight = visualHeight;
    }

    this.updateAllPositions();
  }

  /**
   * معالجة تمرير visual viewport
   */
  private handleVisualViewportScroll(): void {
    // iOS keyboard scrolling
    this.updateAllPositions();
  }

  /**
   * معالجة بداية اللمس
   */
  private handleTouchStart(e: TouchEvent): void {
    // Detect if touch is on any of our elements
    const target = e.target as HTMLElement;
    this.elements.forEach((state, id) => {
      if (target.closest(`[data-interface-element="${id}"]`)) {
        this.updateElement(id, { interacting: true });
      }
    });
  }

  /**
   * معالجة نهاية اللمس
   */
  private handleTouchEnd(): void {
    this.elements.forEach((state, id) => {
      if (state.interacting) {
        this.updateElement(id, { interacting: false });
      }
    });
  }

  /**
   * معالجة تركيز الحقل (لوحة المفاتيح)
   */
  private handleFocusIn(e: FocusEvent): void {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      this.keyboardVisible = true;
      setTimeout(() => this.updateAllPositions(), 300);
    }
  }

  /**
   * معالجة فقدان التركيز
   */
  private handleFocusOut(e: FocusEvent): void {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      this.keyboardVisible = false;
      setTimeout(() => this.updateAllPositions(), 300);
    }
  }

  /**
   * تحديث جميع المواضع
   */
  private updateAllPositions(): void {
    this.elements.forEach((state, id) => {
      const newPosition = this.calculateOptimalPosition(id);
      this.updateElement(id, { position: newPosition });
    });
  }

  /**
   * التحقق من إمكانية الوصول الإداري
   */
  public async checkAdminAccess(): Promise<boolean> {
    try {
      // Check if user is logged in to admin panel
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        const session = JSON.parse(adminSession);
        const now = Date.now();

        // Check if session is still valid (24 hours)
        if (session.expiresAt && session.expiresAt > now) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
  }

  /**
   * تفعيل/تعطيل زر الإدارة
   */
  public async updateAdminButtonVisibility(): Promise<void> {
    const hasAccess = await this.checkAdminAccess();
    this.setElementVisibility('admin-access-button', hasAccess);
  }

  /**
   * تنظيف الموارد
   */
  public cleanup(): void {
    window.removeEventListener('scroll', this.handleScroll.bind(this));
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('orientationchange', this.handleOrientationChange.bind(this));

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.handleVisualViewportResize.bind(this));
      window.visualViewport.removeEventListener('scroll', this.handleVisualViewportScroll.bind(this));
    }

    document.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    document.removeEventListener('focusin', this.handleFocusIn.bind(this));
    document.removeEventListener('focusout', this.handleFocusOut.bind(this));

    this.elements.clear();
    this.listeners.clear();
  }
}

// Singleton instance
export const aiAdaptiveInterface = new AIAdaptiveInterfaceService();
