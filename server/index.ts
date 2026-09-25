import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { initSchema } from './db/index.js';
import { seedDatabase } from './db/seed.js';

import authRoutes from './routes/auth.routes.js';
import problemsRoutes from './routes/problems.routes.js';
import workflowsRoutes from './routes/workflows.routes.js';
import executionsRoutes from './routes/executions.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import approvalsRoutes from './routes/approvals.routes.js';
import aiRoutes from './routes/ai.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import auditRoutes from './routes/audit.routes.js';
import organizationRoutes from './routes/organization.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/workflows', workflowsRoutes);
app.use('/api/executions', executionsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/organization', organizationRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  let dbType = 'PostgreSQL';
  try {
    const { getDb } = await import('./db/index.js');
    const db = await getDb();
    dbType = db.type === 'pg' ? 'Supabase PostgreSQL (Live)' : 'PostgreSQL (In-Memory Engine)';
  } catch {
    dbType = 'Connecting...';
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FlowPilot AI Enterprise Automation Server',
    database: dbType,
    database_url_configured: !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]'),
  });
});

// Serve frontend in production or if built
const clientDistPath = path.resolve(__dirname, '../../dist');
const altClientDistPath = path.resolve(__dirname, '../client/dist');
const targetDist = fs.existsSync(clientDistPath) ? clientDistPath : altClientDistPath;

if (fs.existsSync(targetDist)) {
  app.use(express.static(targetDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(targetDist, 'index.html'));
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error Handler]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR',
  });
});

let dbReady = false;
let initPromise: Promise<void> | null = null;

export async function ensureDatabaseReady() {
  if (dbReady) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        console.log('[Server] Initializing database and verifying tables...');
        await initSchema();
        await seedDatabase();
        dbReady = true;
      } catch (err) {
        initPromise = null;
        console.error('[Database Init Error]', err);
        throw err;
      }
    })();
  }
  return initPromise;
}

// Middleware to ensure DB is initialized on incoming requests
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    try {
      await ensureDatabaseReady();
    } catch (err: any) {
      return res.status(500).json({
        error: err.message || 'Database connection error',
        code: 'DATABASE_ERROR',
      });
    }
  }
  next();
});

export default app;

// Only start standalone HTTP server when run directly (not on Vercel serverless)
if (!process.env.VERCEL) {
  ensureDatabaseReady().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 FlowPilot AI API server is running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('[Server Bootstrap Error]', err);
    process.exit(1);
  });
}
