import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { InlineSpinner } from './Skeletons';
import { createProject, createTask, updateTask, ApiError } from '@/lib/api';
import type { Task, TaskPriority, TaskStatus, Project } from '@/types';
import { PROJECT_COLORS, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';
import { FolderPlus, CheckCircle2, AlertCircle, Sparkles, Plus } from 'lucide-react';

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export function AddProjectModal({ open, onClose, onCreated }: AddProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [saving, setSaving] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setColor('blue');
      setGeneralError(null);
      setFieldErrors({});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFieldErrors({ name: 'Project name is required' });
      return;
    }

    setSaving(true);
    setGeneralError(null);
    setFieldErrors({});

    try {
      const newProj = await createProject(name.trim(), description.trim(), color);
      onCreated(newProj);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setGeneralError(err.message);
        if (err.details) {
          setFieldErrors(err.details);
        }
      } else {
        setGeneralError((err as Error).message || 'Failed to create project');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Project"
      description="Define a new project workspace to organize tasks and track deliverables."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {generalError && (
          <div className="flex items-start gap-2 p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
            <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{generalError}</p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="project-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. CloudPulse Monitoring Engine"
            maxLength={200}
            autoFocus
            className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white transition-colors focus:outline-none ${
              fieldErrors.name
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100'
            }`}
          />
          {fieldErrors.name && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="project-desc" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Description <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="project-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Summary of scope, milestones, or architecture objectives..."
            rows={3}
            maxLength={1000}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white transition-colors focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Accent Theme</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Object.entries(PROJECT_COLORS).map(([key, cfg]) => {
              const isSelected = color === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 text-slate-900 font-medium'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${cfg.bar} mb-1`} />
                  <span className="text-[11px] truncate max-w-full">{cfg.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <InlineSpinner />
                <span>Creating Project...</span>
              </>
            ) : (
              <span>Create Project</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  editingTask: Task | null;
  onSaved: (task: Task) => void;
}

export function AddTaskModal({ open, onClose, projectId, editingTask, onSaved }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [saving, setSaving] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description || '');
        setStatus(editingTask.status);
        setPriority(editingTask.priority);
      } else {
        setTitle('');
        setDescription('');
        setStatus('todo');
        setPriority('medium');
      }
      setGeneralError(null);
      setFieldErrors({});
    }
  }, [open, editingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFieldErrors({ title: 'Task title is required' });
      return;
    }

    setSaving(true);
    setGeneralError(null);
    setFieldErrors({});

    try {
      let savedTask: Task;
      if (editingTask) {
        savedTask = await updateTask(editingTask.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
        });
      } else {
        savedTask = await createTask(projectId, title.trim(), description.trim(), status, priority);
      }
      onSaved(savedTask);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setGeneralError(err.message);
        if (err.details) {
          setFieldErrors(err.details);
        }
      } else {
        setGeneralError((err as Error).message || 'Failed to save task');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingTask ? 'Edit Task' : 'Add New Task'}
      description="Add details to track progress across the Kanban board columns."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {generalError && (
          <div className="flex items-start gap-2 p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
            <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{generalError}</p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="e.g. Implement loading skeletons for network calls"
            maxLength={500}
            autoFocus
            className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white transition-colors focus:outline-none ${
              fieldErrors.title
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100'
            }`}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="task-desc" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Description <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Implementation notes, AC (acceptance criteria), or references..."
            rows={3}
            maxLength={2000}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white transition-colors focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-status" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Column Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
            >
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-priority" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
            >
              {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_CONFIG[p].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <InlineSpinner />
                <span>{editingTask ? 'Saving Changes...' : 'Creating Task...'}</span>
              </>
            ) : (
              <span>{editingTask ? 'Save Changes' : 'Create Task'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
            isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          {isLoading && <InlineSpinner />}
          <span>{confirmLabel}</span>
        </button>
      </div>
    </Modal>
  );
}

interface EmptyStateProps {
  icon?: 'folder' | 'task';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'folder', title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-xl border border-dashed border-slate-300">
      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
        {icon === 'folder' ? <FolderPlus size={24} /> : <CheckCircle2 size={24} />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus size={14} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
