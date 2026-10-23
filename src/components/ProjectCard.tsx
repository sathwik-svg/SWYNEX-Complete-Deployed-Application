import React from 'react';
import { Folder, Trash2, ArrowRight } from 'lucide-react';
import type { ProjectWithTaskCount } from '@/types';
import { PROJECT_COLORS } from '@/types';

interface ProjectCardProps {
  project: ProjectWithTaskCount;
  onOpen: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const colors = PROJECT_COLORS[project.color] || PROJECT_COLORS.blue;
  const completion =
    project.task_count > 0 ? Math.round((project.done_count / project.task_count) * 100) : 0;

  return (
    <div
      onClick={onOpen}
      className="group relative cursor-pointer bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200"
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg ${colors.bg} ${colors.text} shrink-0`}>
              <Folder size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-base truncate group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-slate-400">
                Created {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete project"
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 size={15} />
          </button>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-5 min-h-[2.5rem]">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100">
        {/* Unboxed metadata with typographic separators */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3 font-mono tabular-nums">
          <div className="flex items-center gap-2">
            <span>{project.todo_count} To Do</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-blue-600 font-medium">{project.in_progress_count} Active</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-emerald-600 font-medium">{project.done_count} Done</span>
          </div>
          <span className="font-semibold text-slate-700">{completion}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full ${colors.bar} rounded-full transition-all duration-300`}
            style={{ width: `${completion}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono tabular-nums">{project.task_count} total tasks</span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
            Open Board <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}
