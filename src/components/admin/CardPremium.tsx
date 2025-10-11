import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface CardPremiumProps {
  children: ReactNode;
  darkMode: boolean;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function CardPremium({
  children,
  darkMode,
  className = '',
  onClick,
  hover = false
}: CardPremiumProps) {
  return (
    <div
      className={`glass-card rounded-2xl p-6 border ${
        hover ? 'card-interactive' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: darkMode ? 'var(--glass-bg-dark)' : 'var(--glass-bg-light)',
        borderColor: darkMode ? 'var(--glass-border-dark)' : 'var(--glass-border-light)',
        boxShadow: darkMode ? 'var(--shadow-md-dark)' : 'var(--shadow-md-light)'
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  darkMode: boolean;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = '#C8A963',
  iconBg = 'rgba(200, 169, 99, 0.15)',
  trend,
  darkMode,
  onClick
}: StatsCardProps) {
  return (
    <CardPremium darkMode={darkMode} hover={!!onClick} onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{
            background: iconBg,
            border: `1px solid ${iconColor}30`
          }}
        >
          <Icon size={24} style={{ color: iconColor }} />
        </div>

        {/* Trend */}
        {trend && (
          <div
            className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1`}
            style={{
              background: trend.isPositive
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
              color: trend.isPositive ? '#10B981' : '#EF4444',
              border: trend.isPositive
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span className="font-medium">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <div
          className={`text-3xl mb-1 bg-gradient-to-br from-current to-current/70 bg-clip-text text-transparent`}
          style={{
            color: darkMode ? '#F1F5F9' : '#0F172A'
          }}
        >
          {value}
        </div>
      </div>

      {/* Title */}
      <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
        {title}
      </p>

      {/* Trend label */}
      {trend && (
        <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
          {trend.label}
        </p>
      )}
    </CardPremium>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  darkMode: boolean;
  onClick: () => void;
  badge?: string;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  iconColor = '#C8A963',
  darkMode,
  onClick,
  badge
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="glass-card card-interactive w-full text-left rounded-2xl p-5 border group"
      style={{
        background: darkMode ? 'var(--glass-bg-dark)' : 'var(--glass-bg-light)',
        borderColor: darkMode ? 'var(--glass-border-dark)' : 'var(--glass-border-light)',
        boxShadow: darkMode ? 'var(--shadow-md-dark)' : 'var(--shadow-md-light)'
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
          style={{
            background: `${iconColor}15`,
            border: `1px solid ${iconColor}30`
          }}
        >
          <Icon size={24} style={{ color: iconColor }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            {badge && (
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: `${iconColor}20`,
                  color: iconColor,
                  border: `1px solid ${iconColor}30`
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
          >
            <path
              d="M7.5 15L12.5 10L7.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}

interface InfoCardProps {
  title: string;
  items: Array<{
    label: string;
    value: string | ReactNode;
    icon?: LucideIcon;
  }>;
  darkMode: boolean;
  actions?: ReactNode;
}

export function InfoCard({ title, items, darkMode, actions }: InfoCardProps) {
  return (
    <CardPremium darkMode={darkMode}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
      }}>
        <h3 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        {actions}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.icon && (
                <item.icon
                  size={16}
                  className={darkMode ? 'text-white/40' : 'text-gray-400'}
                />
              )}
              <span className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </div>
            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </CardPremium>
  );
}
