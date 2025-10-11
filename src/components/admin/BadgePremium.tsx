import { LucideIcon } from "lucide-react";

interface BadgePremiumProps {
  children: React.ReactNode;
  variant?: 'default' | 'live' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  pulse?: boolean;
  darkMode?: boolean;
  className?: string;
}

export function BadgePremium({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  pulse = false,
  darkMode = false,
  className = ''
}: BadgePremiumProps) {
  const variants = {
    default: {
      bg: 'linear-gradient(135deg, #C8A963 0%, #b89850 100%)',
      text: '#0C2340',
      border: 'rgba(200, 169, 99, 0.3)',
      shadow: '0 2px 8px rgba(200, 169, 99, 0.25)'
    },
    live: {
      bg: 'linear-gradient(135deg, #E01E37 0%, #c01a30 100%)',
      text: '#FFFFFF',
      border: 'rgba(224, 30, 55, 0.3)',
      shadow: '0 2px 8px rgba(224, 30, 55, 0.3)'
    },
    success: {
      bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      text: '#FFFFFF',
      border: 'rgba(16, 185, 129, 0.3)',
      shadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
    },
    warning: {
      bg: 'linear-gradient(135deg, #F97316 0%, #ea580c 100%)',
      text: '#FFFFFF',
      border: 'rgba(249, 115, 22, 0.3)',
      shadow: '0 2px 8px rgba(249, 115, 22, 0.25)'
    },
    error: {
      bg: 'linear-gradient(135deg, #EF4444 0%, #dc2626 100%)',
      text: '#FFFFFF',
      border: 'rgba(239, 68, 68, 0.3)',
      shadow: '0 2px 8px rgba(239, 68, 68, 0.25)'
    },
    info: {
      bg: 'linear-gradient(135deg, #0C2340 0%, #1e3a5f 100%)',
      text: '#FFFFFF',
      border: 'rgba(12, 35, 64, 0.3)',
      shadow: '0 2px 8px rgba(12, 35, 64, 0.25)'
    },
    purple: {
      bg: 'linear-gradient(135deg, #8B5CF6 0%, #7c3aed 100%)',
      text: '#FFFFFF',
      border: 'rgba(139, 92, 246, 0.3)',
      shadow: '0 2px 8px rgba(139, 92, 246, 0.25)'
    },
    pink: {
      bg: 'linear-gradient(135deg, #EC4899 0%, #db2777 100%)',
      text: '#FFFFFF',
      border: 'rgba(236, 72, 153, 0.3)',
      shadow: '0 2px 8px rgba(236, 72, 153, 0.25)'
    }
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  // Fallback to default if variant is invalid
  const config = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizes[size]} ${
        pulse ? 'animate-pulse-glow' : ''
      } ${className}`}
      style={{
        background: config.bg,
        color: config.text,
        borderColor: config.border,
        boxShadow: config.shadow,
        transition: 'all var(--transition-base)'
      }}
    >
      {Icon && <Icon size={iconSizes[size]} />}
      <span className="font-medium">{children}</span>
    </span>
  );
}

// Dot badge for status indicators
export function DotBadge({
  color = '#10B981',
  pulse = false,
  size = 8
}: {
  color?: string;
  pulse?: boolean;
  size?: number;
}) {
  return (
    <span className="relative inline-flex">
      <span
        className={`inline-flex rounded-full ${pulse ? 'animate-pulse' : ''}`}
        style={{
          width: size,
          height: size,
          background: color,
          boxShadow: `0 0 8px ${color}80`
        }}
      />
      {pulse && (
        <span
          className="absolute inline-flex rounded-full opacity-75 animate-ping"
          style={{
            width: size,
            height: size,
            background: color
          }}
        />
      )}
    </span>
  );
}

// Count badge for notifications
export function CountBadge({
  count,
  max = 99,
  variant = 'live',
  darkMode = false
}: {
  count: number;
  max?: number;
  variant?: 'live' | 'success' | 'warning' | 'info';
  darkMode?: boolean;
}) {
  const displayCount = count > max ? `${max}+` : count;

  if (count === 0) return null;

  const variants = {
    live: {
      bg: 'linear-gradient(135deg, #E01E37 0%, #c01a30 100%)',
      shadow: '0 2px 8px rgba(224, 30, 55, 0.4)'
    },
    success: {
      bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      shadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
    },
    warning: {
      bg: 'linear-gradient(135deg, #F97316 0%, #ea580c 100%)',
      shadow: '0 2px 8px rgba(249, 115, 22, 0.4)'
    },
    info: {
      bg: 'linear-gradient(135deg, #0C2340 0%, #1e3a5f 100%)',
      shadow: '0 2px 8px rgba(12, 35, 64, 0.4)'
    }
  };

  // Fallback to live if variant is invalid
  const config = variants[variant] || variants.live;

  return (
    <span
      className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs text-white animate-scale-in"
      style={{
        background: config.bg,
        boxShadow: config.shadow,
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      {displayCount}
    </span>
  );
}
