export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithTaskCount extends Project {
  task_count: number;
  todo_count: number;
  in_progress_count: number;
  done_count: number;
}

export interface ApiValidationError {
  error: string;
  details?: Record<string, string>;
  status?: number;
}

export interface NetworkLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  requestBody?: unknown;
  responseBody?: unknown;
  error?: string;
}

export const PROJECT_COLORS: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string; gradient: string; bar: string }
> = {
  blue: {
    label: 'Cobalt Blue',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    gradient: 'from-blue-600 to-indigo-600',
    bar: 'bg-blue-600',
  },
  emerald: {
    label: 'Emerald Green',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    gradient: 'from-emerald-600 to-teal-600',
    bar: 'bg-emerald-600',
  },
  amber: {
    label: 'Warm Amber',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    gradient: 'from-amber-600 to-orange-600',
    bar: 'bg-amber-600',
  },
  rose: {
    label: 'Rose Red',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    gradient: 'from-rose-600 to-pink-600',
    bar: 'bg-rose-600',
  },
  violet: {
    label: 'Royal Violet',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
    gradient: 'from-violet-600 to-purple-600',
    bar: 'bg-violet-600',
  },
  slate: {
    label: 'Slate Gray',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-500',
    gradient: 'from-slate-700 to-slate-900',
    bar: 'bg-slate-700',
  },
};

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string; dot: string; border: string }
> = {
  todo: {
    label: 'To Do',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    dot: 'bg-slate-400',
    border: 'border-slate-200',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
  },
  done: {
    label: 'Completed',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
};

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; bg: string; indicator: string }
> = {
  low: {
    label: 'Low',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    indicator: 'bg-slate-300',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    indicator: 'bg-amber-400',
  },
  high: {
    label: 'High Priority',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    indicator: 'bg-rose-500',
  },
};
