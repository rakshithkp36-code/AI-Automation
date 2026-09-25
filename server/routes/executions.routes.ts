import { Router, Request, Response } from 'express';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { ExecutionService } from '../services/execution.service.js';

const router = Router();
router.use(authenticateToken);

// List executions
router.get('/', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const result = await query(
      `SELECT e.*, w.name as workflow_name, w.category as workflow_category,
              u.full_name as triggerer_name,
              (SELECT COUNT(*) FROM workflow_steps WHERE workflow_id = e.workflow_id) as total_steps
       FROM workflow_executions e
       JOIN workflows w ON e.workflow_id = w.id
       LEFT JOIN users u ON e.triggered_by = u.id
       WHERE e.organization_id = $1
       ORDER BY e.started_at DESC`,
      [orgId]
    );

    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get execution details with step executions, tasks, approvals, AI decisions
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const execId = req.params.id;

    const execRes = await query(
      `SELECT e.*, w.name as workflow_name, w.category as workflow_category,
              u.full_name as triggerer_name
       FROM workflow_executions e
       JOIN workflows w ON e.workflow_id = w.id
       LEFT JOIN users u ON e.triggered_by = u.id
       WHERE e.id = $1 AND e.organization_id = $2`,
      [execId, orgId]
    );

    if (execRes.rows.length === 0) {
      res.status(404).json({ error: 'Execution not found' });
      return;
    }

    const execution = execRes.rows[0];

    // Step executions
    const stepsRes = await query(
      `SELECT * FROM workflow_step_executions WHERE execution_id = $1 ORDER BY step_order ASC`,
      [execId]
    );
    execution.step_executions = stepsRes.rows;

    // Approvals
    const approvalsRes = await query(
      `SELECT a.*, u.full_name as approver_name 
       FROM approvals a 
       LEFT JOIN users u ON a.approver_user_id = u.id 
       WHERE a.execution_id = $1`,
      [execId]
    );
    execution.approvals = approvalsRes.rows;

    // Tasks
    const tasksRes = await query(
      `SELECT t.*, u.full_name as assignee_name 
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to_user_id = u.id 
       WHERE t.execution_id = $1`,
      [execId]
    );
    execution.tasks = tasksRes.rows;

    // AI decisions
    const aiDecisionsRes = await query(
      `SELECT * FROM ai_decisions WHERE execution_id = $1 ORDER BY created_at DESC`,
      [execId]
    );
    execution.ai_decisions = aiDecisionsRes.rows;

    res.json(execution);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Retry execution
router.post('/:id/retry', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const execId = req.params.id as string;

    const execRes = await query(
      'SELECT id, status FROM workflow_executions WHERE id = $1 AND organization_id = $2',
      [execId, orgId]
    );

    if (execRes.rows.length === 0) {
      res.status(404).json({ error: 'Execution not found' });
      return;
    }

    await query(
      `UPDATE workflow_executions 
       SET status = 'RUNNING', error_details = NULL, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [execId]
    );

    const result = await ExecutionService.advanceExecution(execId, orgId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Cancel execution
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const execId = req.params.id as string;

    const execRes = await query(
      'SELECT id, status FROM workflow_executions WHERE id = $1 AND organization_id = $2',
      [execId, orgId]
    );

    if (execRes.rows.length === 0) {
      res.status(404).json({ error: 'Execution not found' });
      return;
    }

    await query(
      `UPDATE workflow_executions 
       SET status = 'CANCELLED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [execId]
    );

    res.json({ message: 'Execution cancelled successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
