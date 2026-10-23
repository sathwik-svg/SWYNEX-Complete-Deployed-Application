export function InlineSpinner({ className = 'w-4 h-4 text-white' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function ProjectGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading projects">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs animate-pulse flex flex-col justify-between h-56"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100" />
              <div className="w-16 h-4 bg-slate-100 rounded" />
            </div>
            <div className="w-3/4 h-5 bg-slate-100 rounded mb-2" />
            <div className="w-full h-3 bg-slate-100 rounded mb-1.5" />
            <div className="w-2/3 h-3 bg-slate-100 rounded" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <div className="w-20 h-3 bg-slate-100 rounded" />
              <div className="w-8 h-3 bg-slate-100 rounded" />
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function KanbanBoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading tasks board">
      {[1, 2, 3].map((col) => (
        <div key={col} className="bg-slate-100/70 rounded-xl p-4 border border-slate-200/80">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60">
            <div className="w-24 h-4 bg-slate-200 rounded" />
            <div className="w-6 h-4 bg-slate-200 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((card) => (
              <div key={card} className="bg-white rounded-lg p-4 border border-slate-200/80 animate-pulse space-y-2.5">
                <div className="flex justify-between items-start">
                  <div className="w-3/4 h-4 bg-slate-100 rounded" />
                  <div className="w-4 h-4 bg-slate-100 rounded" />
                </div>
                <div className="w-full h-3 bg-slate-100 rounded" />
                <div className="flex gap-2 pt-2">
                  <div className="w-16 h-4 bg-slate-100 rounded" />
                  <div className="w-12 h-4 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="w-20 h-3 bg-slate-100 rounded" />
              <div className="w-12 h-6 bg-slate-100 rounded" />
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
