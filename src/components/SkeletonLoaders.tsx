interface SkeletonProps {
  darkMode: boolean;
}

export function LiveMatchCardSkeleton({ darkMode }: SkeletonProps) {
  return (
    <div
      className="glass-card relative overflow-hidden rounded-2xl p-5 border animate-pulse"
      style={{
        background: darkMode 
          ? 'var(--glass-bg-dark)' 
          : 'var(--glass-bg-light)',
        borderColor: darkMode 
          ? 'var(--glass-border-dark)' 
          : 'var(--glass-border-light)',
        boxShadow: darkMode
          ? 'var(--shadow-lg-dark)'
          : 'var(--shadow-lg-light)'
      }}
    >
      {/* Live indicator skeleton */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-6 w-20 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        <div className={`h-6 w-24 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
      </div>

      {/* Title skeleton */}
      <div className={`h-6 w-3/4 rounded-lg mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>

      {/* Teams skeleton */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
          <div className={`h-8 w-32 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        </div>
        <div className={`h-10 w-20 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        <div className="flex items-center gap-3">
          <div className={`h-8 w-32 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
          <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-200/50'}`}>
            <div className={`h-4 w-16 rounded mb-2 ${darkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
            <div className={`h-6 w-12 rounded ${darkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
          </div>
        ))}
      </div>

      {/* Button skeleton */}
      <div className={`h-12 w-full rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>

      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          animation: 'shimmer 2s infinite'
        }}
      ></div>
    </div>
  );
}

export function VotingSectionSkeleton({ darkMode }: SkeletonProps) {
  return (
    <div
      className="glass-card relative overflow-hidden rounded-2xl p-5 border animate-pulse"
      style={{
        background: darkMode 
          ? 'var(--glass-bg-dark)' 
          : 'var(--glass-bg-light)',
        borderColor: darkMode 
          ? 'var(--glass-border-dark)' 
          : 'var(--glass-border-light)',
        boxShadow: darkMode
          ? 'var(--shadow-lg-dark)'
          : 'var(--shadow-lg-light)'
      }}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-5">
        <div className={`h-6 w-48 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        <div className={`h-6 w-20 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
      </div>

      {/* Players skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <div className="flex items-center justify-between mb-2">
              <div className={`h-5 w-32 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
              <div className={`h-5 w-16 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`h-3 w-24 rounded mb-2 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
            <div className={`h-2.5 w-full rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
          </div>
        ))}
      </div>

      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 -translate-x-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          animation: 'shimmer 2s infinite'
        }}
      ></div>
    </div>
  );
}

export function NextMatchCardSkeleton({ darkMode }: SkeletonProps) {
  return (
    <div
      className="glass-card relative overflow-hidden rounded-2xl p-5 border animate-pulse"
      style={{
        background: darkMode 
          ? 'var(--glass-bg-dark)' 
          : 'var(--glass-bg-light)',
        borderColor: darkMode 
          ? 'var(--glass-border-dark)' 
          : 'var(--glass-border-light)',
        boxShadow: darkMode
          ? 'var(--shadow-lg-dark)'
          : 'var(--shadow-lg-light)'
      }}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className={`h-6 w-32 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        <div className={`h-6 w-20 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
      </div>

      {/* Teams skeleton */}
      <div className="flex items-center justify-center gap-8 mb-5">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full mx-auto mb-2 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
          <div className={`h-5 w-24 rounded mx-auto ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        </div>
        <div className={`h-8 w-12 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full mx-auto mb-2 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
          <div className={`h-5 w-24 rounded mx-auto ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>

      {/* Info skeleton */}
      <div className="space-y-2 mb-4">
        <div className={`h-4 w-full rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        <div className={`h-4 w-3/4 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
      </div>

      {/* Button skeleton */}
      <div className={`h-11 w-full rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>

      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 -translate-x-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          animation: 'shimmer 2s infinite'
        }}
      ></div>
    </div>
  );
}

export function ActionGridSkeleton({ darkMode }: SkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="glass-card relative overflow-hidden rounded-xl p-4 border animate-pulse"
          style={{
            background: darkMode 
              ? 'var(--glass-bg-dark)' 
              : 'var(--glass-bg-light)',
            borderColor: darkMode 
              ? 'var(--glass-border-dark)' 
              : 'var(--glass-border-light)',
            boxShadow: darkMode
              ? 'var(--shadow-md-dark)'
              : 'var(--shadow-md-light)',
            animationDelay: `${i * 100}ms`
          }}
        >
          <div className={`w-12 h-12 rounded-xl mb-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
          <div className={`h-5 w-20 rounded mb-1 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
          <div className={`h-4 w-24 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>

          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 -translate-x-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              animation: 'shimmer 2s infinite'
            }}
          ></div>
        </div>
      ))}
    </div>
  );
}
