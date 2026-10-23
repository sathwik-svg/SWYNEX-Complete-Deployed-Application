import { useState, useMemo } from 'react';
import type { ProjectWithTaskCount, Task } from '@/types';
import { Download, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';
import { InlineSpinner } from './Skeletons';

interface AnalyticsViewProps {
  projects: ProjectWithTaskCount[];
  tasks: Task[];
  onRefreshData: () => void;
  onRestoreData?: (importedProjects: any[], importedTasks: any[]) => void;
}

export default function AnalyticsView({
  projects,
  tasks,
  onRefreshData,
}: AnalyticsViewProps) {
  const [downloading, setDownloading] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Compute distribution metrics
  const totalTasks = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  const highPriorityCount = tasks.filter((t) => t.priority === 'high').length;
  const mediumPriorityCount = tasks.filter((t) => t.priority === 'medium').length;
  const lowPriorityCount = tasks.filter((t) => t.priority === 'low').length;

  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  // Project health breakdown
  const projectHealth = useMemo(() => {
    return projects.map((p) => {
      const pRate = p.task_count > 0 ? Math.round((p.done_count / p.task_count) * 100) : 0;
      return {
        ...p,
        rate: pRate,
      };
    });
  }, [projects]);

  const handleExportJson = () => {
    setDownloading(true);
    try {
      const exportData = {
        app: 'SWYNEX TaskFlow',
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        projects,
        tasks,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swynex_taskflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportMessage('Database backup exported to JSON successfully.');
      setTimeout(() => setExportMessage(null), 3000);
    } catch {
      setExportMessage('Failed to export dataset.');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportCsv = () => {
    setDownloading(true);
    try {
      const headers = ['Task ID', 'Title', 'Description', 'Status', 'Priority', 'Project ID', 'Created At'];
      const rows = tasks.map((t) => [
        `"${t.id}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${t.status}"`,
        `"${t.priority}"`,
        `"${t.project_id}"`,
        `"${t.created_at}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swynex_tasks_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportMessage('Tasks CSV exported successfully.');
      setTimeout(() => setExportMessage(null), 3000);
    } catch {
      setExportMessage('Failed to export CSV.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Analytics &amp; Telemetry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated lifecycle metrics, workload velocity, and database export utilities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRefreshData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw size={13} />
            <span>Sync Metrics</span>
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs disabled:opacity-50"
          >
            {downloading ? <InlineSpinner /> : <Download size={13} />}
            <span>Export Backup (.JSON)</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Top Distribution Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Task Lifecycle Progression</h3>
            <span className="text-xs font-mono tabular-nums text-slate-500">{completionRate}% Completed</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-mono tabular-nums">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG.done.dot}`} />
                  <span>{STATUS_CONFIG.done.label}</span>
                </span>
                <span>
                  {doneCount} / {totalTasks} ({totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${totalTasks > 0 ? (doneCount / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-mono tabular-nums">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG.in_progress.dot}`} />
                  <span>{STATUS_CONFIG.in_progress.label}</span>
                </span>
                <span>
                  {inProgressCount} / {totalTasks} (
                  {totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${totalTasks > 0 ? (inProgressCount / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-mono tabular-nums">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG.todo.dot}`} />
                  <span>{STATUS_CONFIG.todo.label}</span>
                </span>
                <span>
                  {todoCount} / {totalTasks} ({totalTasks > 0 ? Math.round((todoCount / totalTasks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full transition-all duration-300"
                  style={{ width: `${totalTasks > 0 ? (todoCount / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Workload by Priority</h3>
            <span className="text-xs font-mono tabular-nums text-slate-500">{totalTasks} Total Tasks</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-mono tabular-nums">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>{PRIORITY_CONFIG.high.label}</span>
                </span>
                <span>
                  {highPriorityCount} tasks ({totalTasks > 0 ? Math.round((highPriorityCount / totalTasks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-600 rounded-full transition-all duration-300"
                  style={{ width: `${totalTasks > 0 ? (highPriorityCount / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-mono tabular-nums">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{PRIORITY_CONFIG.medium.label}</span>
                </span>
                <span>
                  {mediumPriorityCount} tasks ({totalTasks > 0 ? Math.round((mediumPriorityCount / totalTasks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${totalTasks > 0 ? (mediumPriorityCount / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-mono tabular-nums">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>{PRIORITY_CONFIG.low.label}</span>
                </span>
                <span>
                  {lowPriorityCount} tasks ({totalTasks > 0 ? Math.round((lowPriorityCount / totalTasks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full transition-all duration-300"
                  style={{ width: `${totalTasks > 0 ? (lowPriorityCount / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Velocity Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Project Delivery Health</h3>
          <p className="text-xs text-slate-500 mt-0.5">Completion status per active workspace</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Project Workspace</th>
                <th className="px-6 py-3 font-mono">Tasks Total</th>
                <th className="px-6 py-3 font-mono">Completed</th>
                <th className="px-6 py-3 font-mono">In Progress</th>
                <th className="px-6 py-3 font-mono">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {projectHealth.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-sans font-medium text-slate-900">{p.name}</td>
                  <td className="px-6 py-3 text-slate-600">{p.task_count}</td>
                  <td className="px-6 py-3 text-emerald-600 font-semibold">{p.done_count}</td>
                  <td className="px-6 py-3 text-blue-600 font-semibold">{p.in_progress_count}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all duration-300"
                          style={{ width: `${p.rate}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700">{p.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
