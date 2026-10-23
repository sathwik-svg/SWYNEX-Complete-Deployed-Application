import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  ListTodo,
  AlertTriangle,
  Search,
  Plus,
  RefreshCw,
  ArrowLeft,
  Filter,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import type { ProjectWithTaskCount, Task, TaskStatus, TaskPriority, Project } from '@/types';
import {
  fetchProjects,
  fetchTasks,
  updateTaskStatus,
  deleteProject,
  deleteTask,
  ApiError,
} from '@/lib/api';
import TopNav from '@/components/TopNav';
import ProjectCard from '@/components/ProjectCard';
import TaskCard from '@/components/TaskCard';
import { AddProjectModal, AddTaskModal, ConfirmDialog, EmptyState } from '@/components/forms';
import { ProjectGridSkeleton, KanbanBoardSkeleton, StatsSkeleton } from '@/components/Skeletons';
import ApiInspectorDrawer from '@/components/ApiInspectorDrawer';
import SubmissionKitModal from '@/components/SubmissionKitModal';
import AnalyticsView from '@/components/AnalyticsView';
import { ToastContainer, type ToastItem } from '@/components/Toast';
import { PROJECT_COLORS, STATUS_CONFIG } from '@/types';

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<'projects' | 'tasks' | 'analytics'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Data State
  const [projects, setProjects] = useState<ProjectWithTaskCount[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set());

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('all');

  // Error & Toast State
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Modals
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showInspector, setShowInspector] = useState(false);
  const [showSubmissionKit, setShowSubmissionKit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'project' | 'task';
    id: string;
    name?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to add toast
  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all projects
  const loadProjects = useCallback(async (selectIdAfter?: string) => {
    setLoadingProjects(true);
    setGlobalError(null);
    try {
      const data = await fetchProjects();
      setProjects(data);
      if (selectIdAfter) {
        setSelectedProjectId(selectIdAfter);
      } else if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load projects';
      setGlobalError(msg);
      addToast({
        type: 'error',
        title: 'Network Error',
        message: msg,
        onRetry: () => loadProjects(selectIdAfter),
      });
    } finally {
      setLoadingProjects(false);
    }
  }, [addToast, selectedProjectId]);

  // Fetch tasks for current selected project
  const loadTasks = useCallback(
    async (projectId: string) => {
      setLoadingTasks(true);
      try {
        const data = await fetchTasks(projectId);
        setTasks(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load tasks';
        addToast({
          type: 'error',
          title: 'Tasks Loading Error',
          message: msg,
          onRetry: () => loadTasks(projectId),
        });
      } finally {
        setLoadingTasks(false);
      }
    },
    [addToast]
  );

  // Initial load
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Load tasks whenever selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
    } else {
      setTasks([]);
    }
  }, [selectedProjectId, loadTasks]);

  // Active project object
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesColor = colorFilter === 'all' || project.color === colorFilter;
      return matchesSearch && matchesColor;
    });
  }, [projects, searchQuery, colorFilter]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesPriority = taskPriorityFilter === 'all' || t.priority === taskPriorityFilter;
      return matchesPriority;
    });
  }, [tasks, taskPriorityFilter]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalTasks = projects.reduce((acc, p) => acc + p.task_count, 0);
    const completedTasks = projects.reduce((acc, p) => acc + p.done_count, 0);
    const activeTasks = projects.reduce((acc, p) => acc + p.in_progress_count, 0);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalProjects, totalTasks, completedTasks, activeTasks, completionRate };
  }, [projects]);

  // Handlers for Project actions
  const handleOpenProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentTab('tasks');
  };

  const handleProjectCreated = (newProject: Project) => {
    addToast({
      type: 'success',
      title: 'Project Created',
      message: `"${newProject.name}" has been created successfully.`,
    });
    loadProjects(newProject.id);
  };

  const handleDeleteProject = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteProject(id);
      addToast({
        type: 'success',
        title: 'Project Deleted',
        message: 'The project and its tasks have been removed.',
      });
      setConfirmDelete(null);
      await loadProjects();
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
        setCurrentTab('projects');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete project';
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: msg,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handlers for Task actions (with Optimistic UI & Rollback on API error)
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const previousTasks = [...tasks];
    const previousProjectCounts = [...projects];

    // Optimistically update task
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t))
    );

    // Optimistically update project task count
    if (selectedProjectId) {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== selectedProjectId) return p;
          const currentTask = previousTasks.find((t) => t.id === taskId);
          if (!currentTask) return p;
          const oldStatus = currentTask.status;

          return {
            ...p,
            todo_count: p.todo_count + (newStatus === 'todo' ? 1 : oldStatus === 'todo' ? -1 : 0),
            in_progress_count:
              p.in_progress_count +
              (newStatus === 'in_progress' ? 1 : oldStatus === 'in_progress' ? -1 : 0),
            done_count: p.done_count + (newStatus === 'done' ? 1 : oldStatus === 'done' ? -1 : 0),
          };
        })
      );
    }

    setUpdatingTaskIds((prev) => new Set(prev).add(taskId));

    try {
      await updateTaskStatus(taskId, newStatus);
      addToast({
        type: 'success',
        title: 'Task Status Updated',
        message: `Task moved to ${STATUS_CONFIG[newStatus].label}.`,
      });
    } catch (err) {
      // Rollback on failure
      setTasks(previousTasks);
      setProjects(previousProjectCounts);
      const msg = err instanceof Error ? err.message : 'Failed to update task status';
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        message: `${msg}. Rolled back changes.`,
        onRetry: () => handleStatusChange(taskId, newStatus),
      });
    } finally {
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    setIsDeleting(true);
    const previousTasks = [...tasks];

    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTask(id);
      addToast({
        type: 'success',
        title: 'Task Deleted',
        message: 'Task removed from project board.',
      });
      setConfirmDelete(null);
      // Refresh project counts in background
      loadProjects();
    } catch (err) {
      // Rollback
      setTasks(previousTasks);
      const msg = err instanceof Error ? err.message : 'Failed to delete task';
      addToast({
        type: 'error',
        title: 'Task Deletion Failed',
        message: `${msg}. Reverted task removal.`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTaskSaved = (_savedTask: Task) => {
    addToast({
      type: 'success',
      title: editingTask ? 'Task Updated' : 'Task Created',
      message: editingTask
        ? 'Changes saved successfully.'
        : 'New task added to project board.',
    });
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
      loadProjects();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Nav Bar adhering to 3-Zone Contract */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'tasks' && !selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
          }
        }}
        onOpenInspector={() => setShowInspector(true)}
        onOpenSubmissionKit={() => setShowSubmissionKit(true)}
        onNewProject={() => setShowNewProjectModal(true)}
        activeProjectName={currentProject?.name}
      />

      {/* Global Error Banner if API is unreachable */}
      {globalError && (
        <div className="bg-rose-50 border-b border-rose-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-rose-600 shrink-0" />
              <span>
                <strong>API Request Error:</strong> {globalError}
              </span>
            </div>
            <button
              type="button"
              onClick={() => loadProjects()}
              className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-rose-950"
            >
              <RefreshCw size={12} /> Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {/* KPI & Metrics Bar */}
        <section aria-label="System Metrics" className="mb-8">
          {loadingProjects && projects.length === 0 ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <p className="text-xs text-slate-500 font-medium">Active Projects</p>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                  {stats.totalProjects}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Managed workspaces</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <p className="text-xs text-slate-500 font-medium">Total Tasks</p>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                  {stats.totalTasks}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Across all projects</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <p className="text-xs text-slate-500 font-medium">In Progress</p>
                <p className="text-2xl font-bold text-blue-600 mt-1 font-mono tabular-nums">
                  {stats.activeTasks}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Actively executing</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <p className="text-xs text-slate-500 font-medium">Overall Completion</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">
                  {stats.completionRate}%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {stats.completedTasks} tasks closed
                </p>
              </div>
            </div>
          )}
        </section>

        {/* TAB 1: ALL PROJECTS */}
        {currentTab === 'projects' && (
          <div>
            {/* Toolbar: Search & Color Segmented Control */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter projects by title or description..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors"
                />
              </div>

              {/* Functional segmented filter tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-lg text-xs overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setColorFilter('all')}
                  className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    colorFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Colors
                </button>
                {Object.keys(PROJECT_COLORS).map((cKey) => (
                  <button
                    key={cKey}
                    type="button"
                    onClick={() => setColorFilter(cKey)}
                    className={`px-2.5 py-1.5 font-medium rounded-md whitespace-nowrap shrink-0 capitalize transition-colors ${
                      colorFilter === cKey
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Grid or Loading Skeleton */}
            {loadingProjects ? (
              <ProjectGridSkeleton />
            ) : filteredProjects.length === 0 ? (
              <EmptyState
                icon="folder"
                title={searchQuery ? 'No matching projects' : 'No projects created yet'}
                message={
                  searchQuery
                    ? 'No project matches your search query. Try clearing filters.'
                    : 'Get started by creating your first project workspace to organize and track tasks.'
                }
                actionLabel="Create Project"
                onAction={() => setShowNewProjectModal(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={() => handleOpenProject(project.id)}
                    onDelete={() =>
                      setConfirmDelete({
                        type: 'project',
                        id: project.id,
                        name: project.name,
                      })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KANBAN BOARD */}
        {currentTab === 'tasks' && (
          <div>
            {/* Project Switcher & Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentTab('projects')}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
                  title="Back to All Projects"
                >
                  <ArrowLeft size={16} />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {currentProject ? currentProject.name : 'Select a Project'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentProject?.description || 'Manage tasks across lifecycle columns.'}
                  </p>
                </div>
              </div>

              {/* Project selector dropdown & Add Task CTA */}
              <div className="flex items-center gap-3">
                <select
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-slate-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      Project: {p.name}
                    </option>
                  ))}
                </select>

                {currentProject && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(null);
                      setShowTaskModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Plus size={14} />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
            </div>

            {/* Kanban Columns */}
            {loadingTasks ? (
              <KanbanBoardSkeleton />
            ) : !currentProject ? (
              <EmptyState
                icon="folder"
                title="No project selected"
                message="Select an existing project or create one to start managing tasks."
                actionLabel="Create Project"
                onAction={() => setShowNewProjectModal(true)}
              />
            ) : tasks.length === 0 ? (
              <EmptyState
                icon="task"
                title="No tasks in this project"
                message="Your board is currently empty. Add your first task to start tracking progress."
                actionLabel="Add First Task"
                onAction={() => {
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((colStatus) => {
                  const colConfig = STATUS_CONFIG[colStatus];
                  const colTasks = filteredTasks.filter((t) => t.status === colStatus);

                  return (
                    <div
                      key={colStatus}
                      className="bg-slate-100/70 rounded-xl p-4 border border-slate-200 flex flex-col"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${colConfig.dot}`} />
                          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                            {colConfig.label}
                          </h3>
                        </div>
                        <span className="text-xs font-mono tabular-nums font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {colTasks.length}
                        </span>
                      </div>

                      {/* Task Cards in Column */}
                      <div className="space-y-3 flex-1">
                        {colTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            isUpdating={updatingTaskIds.has(task.id)}
                            onStatusChange={handleStatusChange}
                            onEdit={(t) => {
                              setEditingTask(t);
                              setShowTaskModal(true);
                            }}
                            onDelete={(id) =>
                              setConfirmDelete({
                                type: 'task',
                                id,
                                name: task.title,
                              })
                            }
                          />
                        ))}

                        {colTasks.length === 0 && (
                          <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs text-center px-4">
                            <p>No tasks in {colConfig.label.toLowerCase()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANALYTICS & METRICS */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            projects={projects}
            tasks={tasks}
            onRefreshData={() => {
              loadProjects();
              if (selectedProjectId) loadTasks(selectedProjectId);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SWYNEX Internship</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Task 4: Complete Deployed Application</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowInspector(true)}
              className="hover:text-slate-800 underline underline-offset-2 transition-colors"
            >
              API Telemetry & Edge Simulator
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => setShowSubmissionKit(true)}
              className="hover:text-slate-800 underline underline-offset-2 transition-colors"
            >
              Task 4 Submission Kit
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      <AddProjectModal
        open={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreated={handleProjectCreated}
      />

      {currentProject && (
        <AddTaskModal
          open={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          projectId={currentProject.id}
          editingTask={editingTask}
          onSaved={handleTaskSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={confirmDelete?.type === 'project' ? 'Delete Project' : 'Delete Task'}
        message={
          confirmDelete?.type === 'project'
            ? `Are you sure you want to delete "${confirmDelete.name}"? This action will cascade and delete all associated tasks. This cannot be undone.`
            : `Are you sure you want to delete the task "${confirmDelete?.name}"?`
        }
        confirmLabel={confirmDelete?.type === 'project' ? 'Delete Project' : 'Delete Task'}
        isLoading={isDeleting}
        onConfirm={() => {
          if (!confirmDelete) return;
          if (confirmDelete.type === 'project') {
            handleDeleteProject(confirmDelete.id);
          } else {
            handleDeleteTask(confirmDelete.id);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />

      <ApiInspectorDrawer
        open={showInspector}
        onClose={() => setShowInspector(false)}
        onResetData={() => {
          loadProjects();
          addToast({
            type: 'info',
            title: 'Sample Data Reset',
            message: 'Default projects and tasks have been restored.',
          });
        }}
      />

      <SubmissionKitModal
        open={showSubmissionKit}
        onClose={() => setShowSubmissionKit(false)}
      />

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
