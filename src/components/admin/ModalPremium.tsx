import { X, AlertTriangle, Zap, Info } from "lucide-react";
import { useEffect } from "react";

interface ModalPremiumProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  darkMode: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export function ModalPremium({
  isOpen,
  onClose,
  title,
  description,
  children,
  darkMode,
  maxWidth = 'lg',
  showCloseButton = true
}: ModalPremiumProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with glassmorphism */}
      <div
        className="fixed inset-0 animate-fade-in cursor-pointer"
        style={{
          background: darkMode 
            ? 'rgba(15, 23, 42, 0.85)' 
            : 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="glass-card rounded-2xl border overflow-hidden"
          style={{
            background: darkMode 
              ? 'rgba(30, 41, 59, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            borderColor: darkMode 
              ? 'var(--glass-border-dark)' 
              : 'var(--glass-border-light)',
            boxShadow: darkMode
              ? '0 20px 60px rgba(0, 0, 0, 0.6)'
              : '0 20px 60px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))'
          }}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b" style={{
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
          }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className={`text-xl mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </h2>
                {description && (
                  <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    {description}
                  </p>
                )}
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="glass-button ml-4 p-2 rounded-lg transition-all duration-200 group"
                  style={{
                    background: darkMode 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.03)',
                    border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                    color: darkMode ? '#94A3B8' : '#64748B'
                  }}
                  aria-label="Cerrar modal"
                >
                  <X size={20} className="transition-transform duration-200 group-hover:rotate-90" />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>

        {/* Decorative gradient border effect */}
        <div 
          className="absolute -inset-[1px] rounded-2xl pointer-events-none -z-10 opacity-50"
          style={{
            background: 'linear-gradient(135deg, #C8A963 0%, #E01E37 50%, #0C2340 100%)',
            filter: 'blur(8px)'
          }}
        />
      </div>
    </div>
  );
}

// Confirmation Modal variant
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  darkMode: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  darkMode,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  isLoading = false
}: ConfirmModalProps) {
  const variants = {
    danger: {
      Icon: AlertTriangle,
      color: '#E01E37',
      gradient: 'linear-gradient(135deg, #E01E37 0%, #c01a30 100%)'
    },
    warning: {
      Icon: Zap,
      color: '#F97316',
      gradient: 'linear-gradient(135deg, #F97316 0%, #ea580c 100%)'
    },
    info: {
      Icon: Info,
      color: '#0C2340',
      gradient: 'linear-gradient(135deg, #0C2340 0%, #1e3a5f 100%)'
    }
  };

  const config = variants[variant];
  const IconComponent = config.Icon;

  return (
    <ModalPremium
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      darkMode={darkMode}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="text-center py-4">
        {/* Icon */}
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse-glow"
          style={{
            background: `${config.color}20`,
            border: `2px solid ${config.color}30`
          }}
        >
          <IconComponent size={32} style={{ color: config.color }} />
        </div>

        {/* Description */}
        <p className={`text-base mb-6 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
          {description}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="glass-button px-6 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: darkMode 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
              color: darkMode ? '#F1F5F9' : '#0F172A'
            }}
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="glass-button px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            style={{
              background: config.gradient,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              boxShadow: `0 4px 16px ${config.color}40`
            }}
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            <span>{isLoading ? 'Procesando...' : confirmText}</span>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </ModalPremium>
  );
}
