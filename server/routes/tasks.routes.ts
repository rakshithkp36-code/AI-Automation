import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { CreateTaskSchema, UpdateTaskStatusSchema } from '../../shared/schemas/index.js';
import { ExecutionService } from '../services/execution.service.js';

const router = Router();
router.use(authenticateToken);

// List tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const { status, priority, assignee } = req.query;

    let sql = `
      SELECT t.*, u.full_name as assigned_to_name, w.name as workflow_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to_user_id = u.id
      LEFT JOIN workflows w ON t.workflow_id = w.id
      WHERE t.organization_id = $1
    `;
    const params: any[] = [orgId];

    if (status) {
      params.push(status);
      sql += ` AND t.status = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      sql += ` AND t.priority = $${params.length}`;
    }
    if (assignee === 'me') {
      params.push(req.user!.id);
      sql += ` AND t.assigned_to_user_id = $${params.length}`;
    }

    sql += ' ORDER BY t.created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post('/', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const userId = req.user!.id;
    const body = CreateTaskSchema.parse(req.body);

    const taskId = uuidv4();
    await query(
      `INSERT INTO tasks (
        id, organization_id, workflow_id, execution_id, title, description, 
        assigned_to_user_id, assigned_role, priority, status, due_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        taskId,
        orgId,
        body.workflow_id || null,
        body.execution_id || null,
        body.title,
        body.description || '',
        body.assigned_to_user_id || null,
        body.assigned_role,
        body.priority,
        'TODO',
        body.due_date ? new Date(body.due_date) : null,
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), orgId, userId, 'task_create', 'task', taskId, { title: body.title }]
    );

    const created = await query(
      `SELECT t.*, u.full_name as assigned_to_name, w.name as workflow_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to_user_id = u.id
       LEFT JOIN workflows w ON t.workflow_id = w.id
       WHERE t.id = $1`,
      [taskId]
    );

    res.status(201).json(created.rows[0]);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get task by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const result = await query(
      `SELECT t.*, u.full_name as assigned_to_name, w.name as workflow_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to_user_id = u.id
       LEFT JOIN workflows w ON t.workflow_id = w.id
       WHERE t.id = $1 AND t.organization_id = $2`,
      [req.params.id, orgId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update task status / details
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const taskId = req.params.id;
    const body = req.body;

    const check = await query('SELECT id, comments FROM tasks WHERE id = $1 AND organization_id = $2', [taskId, orgId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const currentComments = typeof check.rows[0].comments === 'string'
      ? JSON.parse(check.rows[0].comments)
      : check.rows[0].comments || [];

    if (body.newComment) {
      currentComments.push({
        user_id: req.user!.id,
        user_name: req.user!.full_name,
        comment: body.newComment,
        created_at: new Date().toISOString(),
      });
    }

    await query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        assigned_to_user_id = COALESCE($3, assigned_to_user_id),
        assigned_role = COALESCE($4, assigned_role),
        priority = COALESCE($5, priority),
        status = COALESCE($6, status),
        due_date = COALESCE($7, due_date),
        comments = $8,
        completed_at = CASE WHEN $6 = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE completed_at END,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND organization_id = $10`,
      [
        body.title,
        body.description,
        body.assigned_to_user_id,
        body.assigned_role,
        body.priority,
        body.status,
        body.due_date ? new Date(body.due_date) : null,
        currentComments,
        taskId,
        orgId,
      ]
    );

    const updated = await query(
      `SELECT t.*, u.full_name as assigned_to_name, w.name as workflow_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to_user_id = u.id
       LEFT JOIN workflows w ON t.workflow_id = w.id
       WHERE t.id = $1`,
      [taskId]
    );

    res.json(updated.rows[0]);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Complete Task
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const userId = req.user!.id;
    const taskId = req.params.id as string;
    const { comment } = req.body;

    const result = await ExecutionService.completeTask({
      taskId,
      organizationId: orgId,
      userId,
      comment,
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
