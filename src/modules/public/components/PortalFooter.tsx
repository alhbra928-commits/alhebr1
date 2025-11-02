import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Home, TreePine, MessageCircle, User } from 'lucide-react';

interface PortalFooterProps {
  activeTab?: string;
  onTabChange: (tabId: string) => void;
  onWhatsAppClick?: () => void;
}

export const PortalFooter: React.FC<PortalFooterProps> = ({
  activeTab,
  onTabChange,
  onWhatsAppClick
}) => {
  const [footerRoot, setFooterRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create footer container OUTSIDE React root
    let container = document.getElementById('footer-portal');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'footer-portal';
      container.style.cssText = `
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        z-index: 999999 !important;
        pointer-events: auto !important;
      `;
      document.body.appendChild(container);
    }

    setFooterRoot(container);

    return () => {
      // Don't remove on unmount - keep it
    };
  }, []);

  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: 'الرئيسية',
      action: () => {
        onTabChange('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      id: 'farms',
      icon: TreePine,
      label: 'المزارع',
      action: () => {
        onTabChange('farms');
      }
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'تواصل',
      action: () => {
        if (onWhatsAppClick) {
          onWhatsAppClick();
        }
      }
    },
    {
      id: 'login',
      icon: User,
      label: 'حسابي',
      action: () => onTabChange('login')
    }
  ];

  const footerContent = (
    <div
      style={{
        position: 'relative',
        width: '100%',
        background: 'linear-gradient(180deg, rgba(209, 250, 229, 0.98) 0%, rgba(134, 239, 172, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '2px solid rgba(74, 222, 128, 0.5)',
        boxShadow: '0 -8px 32px rgba(34, 197, 94, 0.2)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '12px 16px',
          gap: '8px',
          maxWidth: '100%',
          margin: '0 auto'
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.action}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                minWidth: '70px',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isActive ? 'translateY(-4px) scale(1.05)' : 'translateY(0)',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.5) 0%, rgba(74, 222, 128, 0.4) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(209, 250, 229, 0.3) 100%)',
                  boxShadow: isActive
                    ? '0 8px 20px rgba(34, 197, 94, 0.3)'
                    : '0 4px 12px rgba(34, 197, 94, 0.1)',
                  border: isActive
                    ? '2px solid rgba(74, 222, 128, 0.6)'
                    : '1px solid rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Icon
                  size={24}
                  style={{
                    color: isActive ? '#ffffff' : 'rgba(22, 163, 74, 0.9)',
                    strokeWidth: 2.5
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#16a34a' : '#059669',
                  letterSpacing: '0.02em'
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Use Portal to render OUTSIDE React tree
  return footerRoot ? createPortal(footerContent, footerRoot) : null;
};
