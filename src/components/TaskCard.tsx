import React, { useState } from 'react';
import { MoreVertical, Pencil, Trash2, CheckCircle2, Clock, Circle, ArrowRight } from 'lucide-react';
import type { Task, TaskPriority, TaskStatus } from '@/types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

export default function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdating = false,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const statusCfg = STATUS_CONFIG[task.status];
  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const isDone = task.status === 'done';

  const nextStatusLabel = STATUS_CONFIG[NEXT_STATUS[task.status]].label;

  return (
    <div
      className={`group relative bg-white rounded-lg border border-slate-200 p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-200 ${
        isUpdating ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4
          className={`text-sm font-medium leading-snug break-words ${
            isDone ? 'line-through text-slate-400' : 'text-slate-800'
          }`}
        >
          {task.title}
        </h4>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Task options"
          >
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMenu(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-7 z-30 bg-white rounded-lg shadow-lg border border-slate-200 py-1 w-36 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <Pencil size={13} className="text-slate-400" /> Edit Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(task.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <Trash2 size={13} /> Delete Task
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Unboxed Metadata row */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 font-mono tabular-nums">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.indicator}`} />
            <span className="text-[11px] font-medium text-slate-600">{priorityCfg.label}</span>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-[11px] text-slate-400">
            {new Date(task.created_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
          </span>
        </div>

        {/* Quick status transition button */}
        <button
          type="button"
          onClick={() => onStatusChange(task.id, NEXT_STATUS[task.status])}
          title={`Advance to ${nextStatusLabel}`}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          <span>Move to {nextStatusLabel}</span>
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}
