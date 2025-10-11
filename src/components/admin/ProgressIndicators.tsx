interface ProgressBarProps {
  value: number; // 0-100
  darkMode: boolean;
  color?: string;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  darkMode,
  color = '#C8A963',
  showLabel = false,
  label,
  size = 'md'
}: ProgressBarProps) {
  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
            {label}
          </span>
          <span className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            {value}%
          </span>
        </div>
      )}
      
      <div 
        className={`w-full ${heights[size]} rounded-full overflow-hidden relative`}
        style={{
          background: darkMode 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.06)'
        }}
      >
        {/* Progress fill */}
        <div
          className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`
          }}
        >
          {/* Animated shimmer effect */}
          <div 
            className="absolute inset-0 animate-shimmer-bg opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              backgroundSize: '200% 100%'
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  darkMode: boolean;
  showLabel?: boolean;
  label?: string;
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
  color = '#C8A963',
  darkMode,
  showLabel = true,
  label
}: CircularProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 0 4px ${color}40)`
            }}
          />
        </svg>
        
        {/* Center label */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className="font-semibold"
              style={{ 
                fontSize: size / 4,
                color: darkMode ? '#F1F5F9' : '#0F172A'
              }}
            >
              {Math.round(normalizedValue)}%
            </span>
          </div>
        )}
      </div>
      
      {label && (
        <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
          {label}
        </span>
      )}
    </div>
  );
}

interface LoadingBarProps {
  darkMode: boolean;
  color?: string;
}

export function LoadingBar({ darkMode, color = '#C8A963' }: LoadingBarProps) {
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[101] h-1 overflow-hidden"
      style={{
        background: darkMode 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(0, 0, 0, 0.03)'
      }}
    >
      <div
        className="h-full animate-loading-bar"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          width: '50%'
        }}
      />
    </div>
  );
}

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  darkMode: boolean;
}

export function StepIndicator({ steps, currentStep, darkMode }: StepIndicatorProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCurrent ? 'animate-pulse-glow' : ''
                  }`}
                  style={{
                    background: isCompleted || isCurrent
                      ? 'linear-gradient(135deg, #C8A963 0%, #b89850 100%)'
                      : darkMode
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                    border: isCurrent
                      ? '2px solid #C8A963'
                      : 'none',
                    boxShadow: isCompleted || isCurrent
                      ? '0 4px 16px rgba(200, 169, 99, 0.3)'
                      : 'none'
                  }}
                >
                  {isCompleted ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M16.6668 5L7.50016 14.1667L3.3335 10"
                        stroke="#0C2340"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span 
                      className="text-sm"
                      style={{
                        color: isCompleted || isCurrent ? '#0C2340' : darkMode ? '#94A3B8' : '#64748B'
                      }}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>
                
                {/* Step label */}
                <span 
                  className={`text-xs mt-2 text-center whitespace-nowrap ${
                    darkMode ? 'text-white/70' : 'text-gray-600'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div 
                  className="flex-1 h-0.5 mx-2 transition-all duration-300"
                  style={{
                    background: isCompleted
                      ? 'linear-gradient(90deg, #C8A963 0%, #b89850 100%)'
                      : darkMode
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Pulse loader for inline loading states
export function PulseLoader({ darkMode, color = '#C8A963' }: { darkMode: boolean; color?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            background: color,
            animationDelay: `${i * 150}ms`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
}
