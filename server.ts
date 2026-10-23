import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory persistent database for SWYNEX TaskFlow
interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  project_id: string;
  created_at: string;
  updated_at: string;
}

const VALID_COLORS = ['blue', 'emerald', 'amber', 'rose', 'violet', 'slate'];
const VALID_STATUSES = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Initial demo seed data
function getInitialData(): { projects: Project[]; tasks: Task[] } {
  const p1 = 'a1111111-2222-4333-8444-555555555551';
  const p2 = 'a2222222-3333-4444-8555-666666666662';
  const p3 = 'a3333333-4444-4555-8666-777777777773';

  const projects: Project[] = [
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
  ];

  const tasks: Task[] = [
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
  ];

  return { projects, tasks };
}

let db = getInitialData();

// Helper to send standardized errors matching SWYNEX API format
function sendError(res: Response, status: number, message: string, details?: unknown) {
  return res.status(status).json({
    error: message,
    details: details || null,
    timestamp: new Date().toISOString(),
  });
}

// Simulation & logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  // Check for test simulation headers
  const simulateError = req.headers['x-simulate-error'];
  const simulateDelay = Number(req.headers['x-simulate-delay'] || 0);

  const proceed = () => {
    if (simulateError === '500') {
      return sendError(res, 500, 'Simulated Internal Server Error (500)', {
        reason: 'Client requested x-simulate-error: 500 for testing error state UI',
      });
    }
    if (simulateError === '400') {
      return sendError(res, 400, 'Simulated Bad Request (400)', {
        simulation: 'Client requested x-simulate-error: 400',
      });
    }
    next();
  };

  if (simulateDelay > 0 && !isNaN(simulateDelay)) {
    setTimeout(proceed, Math.min(simulateDelay, 5000));
  } else {
    proceed();
  }
});

// --- API ROUTES ---

// Health & telemetry info
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    app: 'SWYNEX TaskFlow API',
    uptime: process.uptime(),
    counts: {
      projects: db.projects.length,
      tasks: db.tasks.length,
    },
  });
});

// Reset demo data
app.post('/api/reset-data', (_req: Request, res: Response) => {
  db = getInitialData();
  res.json({ message: 'Demo dataset reset successfully', projectCount: db.projects.length });
});

// GET /api/projects - list projects with task counts
app.get('/api/projects', (_req: Request, res: Response) => {
  const result = db.projects.map((project) => {
    const projectTasks = db.tasks.filter((t) => t.project_id === project.id);
    return {
      ...project,
      task_count: projectTasks.length,
      todo_count: projectTasks.filter((t) => t.status === 'todo').length,
      in_progress_count: projectTasks.filter((t) => t.status === 'in_progress').length,
      done_count: projectTasks.filter((t) => t.status === 'done').length,
    };
  });
  res.json(result);
});

// POST /api/projects - create new project
app.post('/api/projects', (req: Request, res: Response) => {
  const { name, description, color } = req.body || {};
  const errors: Record<string, string> = {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.name = 'name is required and must be a non-empty string';
  } else if (name.trim().length > 200) {
    errors.name = 'name must be 200 characters or fewer';
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.description = 'description must be a string';
  } else if (typeof description === 'string' && description.length > 1000) {
    errors.description = 'description must be 1000 characters or fewer';
  }

  if (color !== undefined && color !== null) {
    if (typeof color !== 'string' || !VALID_COLORS.includes(color)) {
      errors.color = `color must be one of: ${VALID_COLORS.join(', ')}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  const newProject: Project = {
    id: crypto.randomUUID(),
    name: name.trim(),
    description: description?.trim() || null,
    color: color || 'blue',
    created_at: new Date().toISOString(),
  };

  db.projects.unshift(newProject);
  return res.status(201).json(newProject);
});

// DELETE /api/projects/:id - delete project and cascade tasks
app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidUUID(id)) {
    return sendError(res, 400, 'Invalid project ID format (must be UUID)');
  }

  const index = db.projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return sendError(res, 404, 'Project not found');
  }

  // Delete project
  db.projects.splice(index, 1);
  // Cascade delete tasks
  db.tasks = db.tasks.filter((t) => t.project_id !== id);

  return res.status(204).send();
});

// GET /api/tasks?projectId=xxx - list tasks for project
app.get('/api/tasks', (req: Request, res: Response) => {
  const projectId = req.query.projectId as string;
  if (!projectId) {
    return sendError(res, 400, 'Missing required query parameter: projectId');
  }
  if (!isValidUUID(projectId)) {
    return sendError(res, 400, 'Invalid projectId format (must be UUID)');
  }

  const projectExists = db.projects.some((p) => p.id === projectId);
  if (!projectExists) {
    return sendError(res, 404, 'Project not found');
  }

  const tasks = db.tasks
    .filter((t) => t.project_id === projectId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return res.json(tasks);
});

// GET /api/tasks/:id - get single task
app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidUUID(id)) {
    return sendError(res, 400, 'Invalid task ID format (must be UUID)');
  }

  const task = db.tasks.find((t) => t.id === id);
  if (!task) {
    return sendError(res, 404, 'Task not found');
  }

  return res.json(task);
});

// POST /api/tasks - create task
app.post('/api/tasks', (req: Request, res: Response) => {
  const { title, description, status, priority, project_id } = req.body || {};
  const errors: Record<string, string> = {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.title = 'title is required and must be a non-empty string';
  } else if (title.trim().length > 500) {
    errors.title = 'title must be 500 characters or fewer';
  }

  if (!project_id || typeof project_id !== 'string') {
    errors.project_id = 'project_id is required';
  } else if (!isValidUUID(project_id)) {
    errors.project_id = 'project_id must be a valid UUID';
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.description = 'description must be a string';
  } else if (typeof description === 'string' && description.length > 2000) {
    errors.description = 'description must be 2000 characters or fewer';
  }

  if (status !== undefined && status !== null) {
    if (typeof status !== 'string' || !VALID_STATUSES.includes(status)) {
      errors.status = `status must be one of: ${VALID_STATUSES.join(', ')}`;
    }
  }

  if (priority !== undefined && priority !== null) {
    if (typeof priority !== 'string' || !VALID_PRIORITIES.includes(priority)) {
      errors.priority = `priority must be one of: ${VALID_PRIORITIES.join(', ')}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  const projectExists = db.projects.some((p) => p.id === project_id);
  if (!projectExists) {
    return sendError(res, 404, 'Project not found', { project_id });
  }

  const newTask: Task = {
    id: crypto.randomUUID(),
    title: title.trim(),
    description: description?.trim() || null,
    status: status || 'todo',
    priority: priority || 'medium',
    project_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.tasks.unshift(newTask);
  return res.status(201).json(newTask);
});

// PUT /api/tasks/:id - update task
app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidUUID(id)) {
    return sendError(res, 400, 'Invalid task ID format (must be UUID)');
  }

  const task = db.tasks.find((t) => t.id === id);
  if (!task) {
    return sendError(res, 404, 'Task not found');
  }

  const { title, description, status, priority } = req.body || {};
  const errors: Record<string, string> = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      errors.title = 'title must be a non-empty string';
    } else if (title.trim().length > 500) {
      errors.title = 'title must be 500 characters or fewer';
    }
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.description = 'description must be a string or null';
  } else if (typeof description === 'string' && description.length > 2000) {
    errors.description = 'description must be 2000 characters or fewer';
  }

  if (status !== undefined) {
    if (typeof status !== 'string' || !VALID_STATUSES.includes(status)) {
      errors.status = `status must be one of: ${VALID_STATUSES.join(', ')}`;
    }
  }

  if (priority !== undefined) {
    if (typeof priority !== 'string' || !VALID_PRIORITIES.includes(priority)) {
      errors.priority = `priority must be one of: ${VALID_PRIORITIES.join(', ')}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  if (title === undefined && description === undefined && status === undefined && priority === undefined) {
    return sendError(res, 400, 'No fields to update');
  }

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description ? description.trim() : null;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  task.updated_at = new Date().toISOString();

  return res.json(task);
});

// DELETE /api/tasks/:id - delete task
app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isValidUUID(id)) {
    return sendError(res, 400, 'Invalid task ID format (must be UUID)');
  }

  const index = db.tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return sendError(res, 404, 'Task not found');
  }

  db.tasks.splice(index, 1);
  return res.status(204).send();
});

// --- Vite Middleware in Dev or Static in Production ---
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer();
