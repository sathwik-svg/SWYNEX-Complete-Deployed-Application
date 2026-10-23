import type {
  Project,
  ProjectWithTaskCount,
  Task,
  TaskPriority,
  TaskStatus,
  NetworkLog,
  ApiValidationError,
} from '@/types';

// API Configuration & Simulation State
export interface SimulationOptions {
  errorMode: 'none' | '500' | '400';
  delayMs: number;
}

export const simulationState: SimulationOptions = {
  errorMode: 'none',
  delayMs: 0,
};

type LogListener = (log: NetworkLog) => void;
const logListeners: Set<LogListener> = new Set();

export function subscribeNetworkLogs(listener: LogListener): () => void {
  logListeners.add(listener);
  return () => {
    logListeners.delete(listener);
  };
}

function broadcastLog(log: NetworkLog) {
  logListeners.forEach((fn) => {
    try {
      fn(log);
    } catch (err) {
      console.error('Error broadcasting network log', err);
    }
  });
}

export class ApiError extends Error implements ApiValidationError {
  status: number;
  details?: Record<string, string>;
  error: string;

  constructor(message: string, status: number, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.error = message;
  }
}

// Client-side Local Storage Database Fallback (for static hosting like GitHub Pages)
const LOCAL_STORAGE_KEY = 'swynex_taskflow_db';

interface LocalDb {
  projects: Project[];
  tasks: Task[];
}

function getInitialLocalDb(): LocalDb {
  const p1 = 'a1111111-2222-4333-8444-555555555551';
  const p2 = 'a2222222-3333-4444-8555-666666666662';
  const p3 = 'a3333333-4444-4555-8666-777777777773';

  return {
    projects: [
      {
        id: p1,
        name: 'SWYNEX CloudPulse Platform',
        description: 'Cloud resource telemetry and full-stack monitoring system demonstrating Task 1-3 architecture.',
        color: 'blue',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: p2,
        name: 'Client Mobile Portal',
        description: 'High-performance React interface for real-time resource tracking and approval workflows.',
        color: 'emerald',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: p3,
        name: 'Data Pipeline & ETL Engine',
        description: 'Data ingestion jobs streaming system metrics to cloud storage and analytics workers.',
        color: 'violet',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
    tasks: [
      {
        id: 'b1111111-1111-4111-8111-111111111111',
        title: 'Design API contract & schema validation',
        description: 'Define TypeScript interfaces, payload constraints, and HTTP response codes.',
        status: 'done',
        priority: 'high',
        project_id: p1,
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2.5).toISOString(),
      },
      {
        id: 'b1111111-1111-4111-8111-111111111112',
        title: 'Integrate frontend with REST endpoints',
        description: 'Connect UI components with loading skeletons and real-time error catching.',
        status: 'in_progress',
        priority: 'high',
        project_id: p1,
        created_at: new Date(Date.now() - 86400000 * 2.8).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
      },
      {
        id: 'b1111111-1111-4111-8111-111111111113',
        title: 'Configure automated test suite for endpoints',
        description: 'Ensure 400 Bad Request and 404 Not Found branches trigger expected responses.',
        status: 'todo',
        priority: 'medium',
        project_id: p1,
        created_at: new Date(Date.now() - 86400000 * 2.2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2.2).toISOString(),
      },
      {
        id: 'b2222222-2222-4222-8222-222222222221',
        title: 'Implement accessible color palettes & typography',
        description: 'WCAG AA verified contrast ratios and responsive desktop layout.',
        status: 'done',
        priority: 'medium',
        project_id: p2,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1.8).toISOString(),
      },
      {
        id: 'b2222222-2222-4222-8222-222222222222',
        title: 'Audit mobile touch response & drawer navigation',
        description: 'Ensure interactive elements have at least 44px hit targets.',
        status: 'in_progress',
        priority: 'low',
        project_id: p2,
        created_at: new Date(Date.now() - 86400000 * 1.9).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1.2).toISOString(),
      },
      {
        id: 'b3333333-3333-4333-8333-333333333331',
        title: 'Build telemetry stream batch buffer',
        description: 'Throttle high-frequency metric packets to protect database write limits.',
        status: 'todo',
        priority: 'high',
        project_id: p3,
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
  };
}

function loadLocalDb(): LocalDb {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const fresh = getInitialLocalDb();
  saveLocalDb(fresh);
  return fresh;
}

function saveLocalDb(db: LocalDb) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
  } catch {}
}

let isStaticHostDetected: boolean | null = null;

// Fallback executor for static hosting environments (like GitHub Pages)
async function executeLocalFallback<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || 'GET';
  const db = loadLocalDb();

  // Apply simulated delay if configured
  if (simulationState.delayMs > 0) {
    await new Promise((r) => setTimeout(r, simulationState.delayMs));
  }

  // Apply simulated errors if configured
  if (simulationState.errorMode === '500') {
    throw new ApiError('Simulated Internal Server Error (500)', 500, {
      simulation: 'Client requested x-simulate-error: 500',
    });
  }
  if (simulationState.errorMode === '400') {
    throw new ApiError('Simulated Bad Request (400)', 400, {
      simulation: 'Client requested x-simulate-error: 400',
    });
  }

  const cleanPath = path.replace(/^\/api/, '');

  if (cleanPath === '/health') {
    return {
      status: 'healthy',
      version: '1.0.0 (Client-Synced)',
      counts: { projects: db.projects.length, tasks: db.tasks.length },
    } as unknown as T;
  }

  if (cleanPath === '/reset-data' && method === 'POST') {
    const fresh = getInitialLocalDb();
    saveLocalDb(fresh);
    return { message: 'Demo dataset reset successfully', projectCount: fresh.projects.length } as unknown as T;
  }

  if (cleanPath === '/projects') {
    if (method === 'GET') {
      const res: ProjectWithTaskCount[] = db.projects.map((p) => {
        const pTasks = db.tasks.filter((t) => t.project_id === p.id);
        return {
          ...p,
          task_count: pTasks.length,
          todo_count: pTasks.filter((t) => t.status === 'todo').length,
          in_progress_count: pTasks.filter((t) => t.status === 'in_progress').length,
          done_count: pTasks.filter((t) => t.status === 'done').length,
        };
      });
      return res as unknown as T;
    }
    if (method === 'POST') {
      const body = options.body ? JSON.parse(options.body as string) : {};
      if (!body.name || !body.name.trim()) {
        throw new ApiError('Validation failed', 400, { name: 'name is required and must be a non-empty string' });
      }
      const newP: Project = {
        id: crypto.randomUUID(),
        name: body.name.trim(),
        description: body.description?.trim() || null,
        color: body.color || 'blue',
        created_at: new Date().toISOString(),
      };
      db.projects.unshift(newP);
      saveLocalDb(db);
      return newP as unknown as T;
    }
  }

  if (cleanPath.startsWith('/projects/') && method === 'DELETE') {
    const id = cleanPath.split('/projects/')[1];
    db.projects = db.projects.filter((p) => p.id !== id);
    db.tasks = db.tasks.filter((t) => t.project_id !== id);
    saveLocalDb(db);
    return undefined as unknown as T;
  }

  if (cleanPath.startsWith('/tasks')) {
    if (method === 'GET') {
      const urlObj = new URL(path, 'http://localhost');
      const projectId = urlObj.searchParams.get('projectId');
      const res = db.tasks
        .filter((t) => t.project_id === projectId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return res as unknown as T;
    }
    if (method === 'POST') {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const errors: Record<string, string> = {};
      if (!body.title || !body.title.trim()) errors.title = 'title is required and must be a non-empty string';
      if (!body.project_id) errors.project_id = 'project_id is required';
      if (Object.keys(errors).length > 0) throw new ApiError('Validation failed', 400, errors);

      const newTask: Task = {
        id: crypto.randomUUID(),
        title: body.title.trim(),
        description: body.description?.trim() || null,
        status: body.status || 'todo',
        priority: body.priority || 'medium',
        project_id: body.project_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.tasks.unshift(newTask);
      saveLocalDb(db);
      return newTask as unknown as T;
    }
  }

  if (cleanPath.startsWith('/tasks/')) {
    const id = cleanPath.split('/tasks/')[1].split('?')[0];
    if (method === 'PUT') {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const task = db.tasks.find((t) => t.id === id);
      if (!task) throw new ApiError('Task not found', 404);
      if (body.title !== undefined) task.title = body.title.trim();
      if (body.description !== undefined) task.description = body.description?.trim() || null;
      if (body.status !== undefined) task.status = body.status;
      if (body.priority !== undefined) task.priority = body.priority;
      task.updated_at = new Date().toISOString();
      saveLocalDb(db);
      return task as unknown as T;
    }
    if (method === 'DELETE') {
      db.tasks = db.tasks.filter((t) => t.id !== id);
      saveLocalDb(db);
      return undefined as unknown as T;
    }
  }

  throw new ApiError('Not found', 404);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const startTime = performance.now();
  const method = options.method || 'GET';
  const url = path.startsWith('/api') ? path : `/api${path}`;

  let parsedReqBody: unknown = undefined;
  if (options.body && typeof options.body === 'string') {
    try {
      parsedReqBody = JSON.parse(options.body);
    } catch {
      parsedReqBody = options.body;
    }
  }

  // If we already know the environment is a static host without an Express backend:
  if (isStaticHostDetected) {
    try {
      const result = await executeLocalFallback<T>(path, options);
      const durationMs = Math.round(performance.now() - startTime);
      broadcastLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        method,
        url,
        status: options.method === 'POST' ? 201 : options.method === 'DELETE' ? 204 : 200,
        durationMs,
        requestBody: parsedReqBody,
        responseBody: result,
      });
      return result;
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      broadcastLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        method,
        url,
        status: err.status || 500,
        durationMs,
        requestBody: parsedReqBody,
        error: err.message,
      });
      throw err;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (simulationState.errorMode !== 'none') {
    headers['x-simulate-error'] = simulationState.errorMode;
  }
  if (simulationState.delayMs > 0) {
    headers['x-simulate-delay'] = String(simulationState.delayMs);
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    // Detect static host or network disconnect
    isStaticHostDetected = true;
    const result = await executeLocalFallback<T>(path, options);
    const durationMs = Math.round(performance.now() - startTime);
    broadcastLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      method,
      url,
      status: 200,
      durationMs,
      requestBody: parsedReqBody,
      responseBody: result,
    });
    return result;
  }

  const durationMs = Math.round(performance.now() - startTime);

  // If response is HTML or 404 from a static file server (GitHub Pages serving 404.html):
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json') && res.status !== 204) {
    isStaticHostDetected = true;
    return executeLocalFallback<T>(path, options);
  }

  if (res.status === 204) {
    broadcastLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      method,
      url,
      status: 204,
      durationMs,
      requestBody: parsedReqBody,
      responseBody: null,
    });
    return undefined as unknown as T;
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  const networkLog: NetworkLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toLocaleTimeString(),
    method,
    url,
    status: res.status,
    durationMs,
    requestBody: parsedReqBody,
    responseBody: data,
    error: !res.ok ? (typeof data === 'object' && data?.error ? data.error : `HTTP ${res.status}`) : undefined,
  };
  broadcastLog(networkLog);

  if (!res.ok) {
    const errorMsg =
      (typeof data === 'object' && data && data.error) ||
      `Request failed with status ${res.status}`;
    const details = typeof data === 'object' && data ? data.details : undefined;
    throw new ApiError(errorMsg, res.status, details);
  }

  return data as T;
}

// ---- Projects API ----

export async function fetchProjects(): Promise<ProjectWithTaskCount[]> {
  return request<ProjectWithTaskCount[]>('/api/projects');
}

export async function createProject(name: string, description: string, color: string): Promise<Project> {
  return request<Project>('/api/projects', {
    method: 'POST',
    body: JSON.stringify({ name, description, color }),
  });
}

export async function deleteProject(id: string): Promise<void> {
  return request<void>(`/api/projects/${id}`, {
    method: 'DELETE',
  });
}

// ---- Tasks API ----

export async function fetchTasks(projectId: string): Promise<Task[]> {
  return request<Task[]>(`/api/tasks?projectId=${encodeURIComponent(projectId)}`);
}

export async function getTask(id: string): Promise<Task> {
  return request<Task>(`/api/tasks/${id}`);
}

export async function createTask(
  projectId: string,
  title: string,
  description: string,
  status: TaskStatus,
  priority: TaskPriority,
): Promise<Task> {
  return request<Task>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title,
      description,
      status,
      priority,
      project_id: projectId,
    }),
  });
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  return request<Task>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function updateTask(
  id: string,
  fields: { title?: string; description?: string; status?: TaskStatus; priority?: TaskPriority },
): Promise<Task> {
  return request<Task>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(fields),
  });
}

export async function deleteTask(id: string): Promise<void> {
  return request<void>(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
}

export async function resetDemoData(): Promise<{ message: string; projectCount: number }> {
  return request<{ message: string; projectCount: number }>('/api/reset-data', {
    method: 'POST',
  });
}

export async function checkHealth(): Promise<{
  status: string;
  version: string;
  counts: { projects: number; tasks: number };
}> {
  return request('/api/health');
}
