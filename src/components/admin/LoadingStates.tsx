interface LoadingStateProps {
  darkMode: boolean;
}

export function AdminLoadingFallback({ darkMode }: LoadingStateProps) {
  return (
    <div className="min-h-[400px] relative animate-fade-in">
      {/* Subtle top loading bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden"
        style={{
          background: darkMode 
            ? 'rgba(200, 169, 99, 0.2)' 
            : 'rgba(12, 35, 64, 0.1)'
        }}
      >
        <div 
          className="h-full animate-loading-bar"
          style={{
            background: darkMode
              ? 'linear-gradient(90deg, transparent, #C8A963, transparent)'
              : 'linear-gradient(90deg, transparent, #0C2340, transparent)',
            width: '33%'
          }}
        ></div>
      </div>

      {/* Minimal content skeleton that appears instantly */}
      <div className="space-y-6 p-2">
        <div 
          className="h-12 rounded-xl animate-pulse"
          style={{
            background: darkMode 
              ? 'rgba(30, 41, 59, 0.3)' 
              : 'rgba(0, 0, 0, 0.03)'
          }}
        ></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-32 rounded-2xl animate-pulse"
              style={{
                background: darkMode 
                  ? 'rgba(30, 41, 59, 0.3)' 
                  : 'rgba(0, 0, 0, 0.03)',
                animationDelay: `${i * 50}ms`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableLoadingSkeleton({ darkMode, rows = 5 }: LoadingStateProps & { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div 
        className="glass-card rounded-xl p-4 border animate-pulse"
        style={{
          background: darkMode ? 'var(--glass-bg-dark)' : 'var(--glass-bg-light)',
          borderColor: darkMode ? 'var(--glass-border-dark)' : 'var(--glass-border-light)',
          boxShadow: darkMode ? 'var(--shadow-sm-dark)' : 'var(--shadow-sm-light)'
        }}
      >
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-4 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
          ))}
        </div>
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="glass-card rounded-xl p-4 border animate-pulse relative overflow-hidden"
          style={{
            background: darkMode ? 'var(--glass-bg-dark)' : 'var(--glass-bg-light)',
            borderColor: darkMode ? 'var(--glass-border-dark)' : 'var(--glass-border-light)',
            boxShadow: darkMode ? 'var(--shadow-sm-dark)' : 'var(--shadow-sm-light)',
            animationDelay: `${i * 100}ms`
          }}
        >
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
              <div className={`h-4 w-24 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`h-4 w-20 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
            <div className={`h-4 w-16 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
            <div className="flex gap-2 justify-end">
              <div className={`h-8 w-8 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
              <div className={`h-8 w-8 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
            </div>
          </div>

          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 -translate-x-full animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
            }}
          ></div>
        </div>
      ))}
    </div>
  );
}

export function StatsCardSkeleton({ darkMode }: LoadingStateProps) {
  return (
    <div
      className="glass-card rounded-2xl p-6 border animate-pulse relative overflow-hidden"
      style={{
        background: darkMode ? 'var(--glass-bg-dark)' : 'var(--glass-bg-light)',
        borderColor: darkMode ? 'var(--glass-border-dark)' : 'var(--glass-border-light)',
        boxShadow: darkMode ? 'var(--shadow-md-dark)' : 'var(--shadow-md-light)'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        <div className={`h-6 w-16 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
      </div>
      
      <div className={`h-8 w-24 rounded mb-2 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
      <div className={`h-4 w-32 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>

      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
        }}
      ></div>
    </div>
  );
}

export function FormLoadingSkeleton({ darkMode }: LoadingStateProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} style={{ animationDelay: `${i * 100}ms` }}>
          <div className={`h-5 w-24 rounded mb-2 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
          <div 
            className={`h-12 w-full rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'}`}
          ></div>
        </div>
      ))}
      
      <div className="flex gap-3 pt-4">
        <div className={`h-11 w-32 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        <div className={`h-11 w-24 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
      </div>
    </div>
  );
}

// Inline spinner for buttons
export function InlineSpinner({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
