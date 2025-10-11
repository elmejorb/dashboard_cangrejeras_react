import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useState, useEffect } from "react";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
  darkMode?: boolean;
}

export function Toast({ message, type, duration = 3000, onClose, darkMode = false }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: {
      bg: 'bg-[#10B981]/90',
      border: 'border-[#10B981]/30',
      text: 'text-white',
      shadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
    },
    error: {
      bg: 'bg-[#E01E37]/90',
      border: 'border-[#E01E37]/30',
      text: 'text-white',
      shadow: '0 8px 24px rgba(224, 30, 55, 0.3)'
    },
    warning: {
      bg: 'bg-[#F97316]/90',
      border: 'border-[#F97316]/30',
      text: 'text-white',
      shadow: '0 8px 24px rgba(249, 115, 22, 0.3)'
    },
    info: {
      bg: 'bg-[#0C2340]/90',
      border: 'border-[#C8A963]/30',
      text: 'text-white',
      shadow: '0 8px 24px rgba(12, 35, 64, 0.3)'
    }
  };

  const config = colors[type];

  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-sm w-full px-4 py-3 rounded-xl border flex items-center gap-3 ${config.bg} ${config.border} ${config.text} ${
        isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
      }`}
      style={{
        backdropFilter: 'blur(var(--glass-blur))',
        boxShadow: config.shadow,
        transition: 'all var(--transition-base)'
      }}
      role="alert"
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      
      <p className="flex-1 text-sm">{message}</p>
      
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-all duration-200"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast Container for managing multiple toasts
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  darkMode?: boolean;
}

export function ToastContainer({ darkMode = false }: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Expose global function to show toasts
  useEffect(() => {
    (window as any).showToast = (message: string, type: ToastType = 'info') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type }]);
    };

    return () => {
      delete (window as any).showToast;
    };
  }, []);

  return (
    <div className="fixed top-0 right-0 z-[100] p-4 pointer-events-none">
      <div className="space-y-3">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
              darkMode={darkMode}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
