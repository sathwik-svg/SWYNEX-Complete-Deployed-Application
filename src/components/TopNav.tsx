import { FolderKanban } from 'lucide-react';

interface TopNavProps {
  currentTab: 'projects' | 'tasks' | 'analytics';
  onSelectTab: (tab: 'projects' | 'tasks' | 'analytics') => void;
  onOpenInspector: () => void;
  onOpenSubmissionKit: () => void;
  onNewProject: () => void;
  activeProjectName?: string | null;
}

export default function TopNav({
  currentTab,
  onSelectTab,
  onOpenInspector,
  onOpenSubmissionKit,
  onNewProject,
  activeProjectName,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('projects')}
          className="flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-blue-600 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <FolderKanban size={17} />
          </div>
          <span>SWYNEX TaskFlow</span>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onSelectTab('projects')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'projects'
                ? 'text-slate-900 font-semibold'
                : 'hover:text-slate-900 text-slate-600'
            }`}
          >
            All Projects
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('tasks')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'tasks'
                ? 'text-slate-900 font-semibold'
                : 'hover:text-slate-900 text-slate-600'
            }`}
          >
            {activeProjectName ? `Kanban: ${activeProjectName}` : 'Kanban Board'}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('analytics')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'analytics'
                ? 'text-slate-900 font-semibold'
                : 'hover:text-slate-900 text-slate-600'
            }`}
          >
            Analytics &amp; Metrics
          </button>

          <button
            type="button"
            onClick={onOpenInspector}
            className="whitespace-nowrap shrink-0 text-slate-600 hover:text-slate-900 transition-colors"
          >
            API Inspector
          </button>

          <button
            type="button"
            onClick={onOpenSubmissionKit}
            className="whitespace-nowrap shrink-0 text-slate-600 hover:text-slate-900 transition-colors"
          >
            Task 4 Submission
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onNewProject}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            + New Project
          </button>
        </div>
      </div>
    </header>
  );
}
