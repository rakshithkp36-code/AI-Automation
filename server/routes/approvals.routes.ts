import { Router, Request, Response } from 'express';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { ExecutionService } from '../services/execution.service.js';

const router = Router();
router.use(authenticateToken);

// List approvals
router.get('/', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const { status } = req.query;

    let sql = `
      SELECT a.*, w.name as workflow_name, u.full_name as approver_name,
             e.status as execution_status, e.started_at as execution_started_at
      FROM approvals a
      LEFT JOIN workflows w ON a.workflow_id = w.id
      LEFT JOIN users u ON a.approver_user_id = u.id
      LEFT JOIN workflow_executions e ON a.execution_id = e.id
      WHERE a.organization_id = $1
    `;
    const params: any[] = [orgId];

    if (status) {
      params.push(status);
      sql += ` AND a.status = $${params.length}`;
    }

    sql += ' ORDER BY a.created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approve
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const userId = req.user!.id;
    const approvalId = req.params.id as string;
    const { comments } = req.body;

    const result = await ExecutionService.resolveApproval({
      approvalId,
      organizationId: orgId,
      userId,
      decision: 'APPROVED',
      comments,
    });

    res.json({ message: 'Approval granted successfully', result });
  } catch (err: any) {
    console.error('[Approve Error]', err);
    res.status(400).json({ error: err.message });
  }
});

// Reject
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const userId = req.user!.id;
    const approvalId = req.params.id as string;
    const { comments } = req.body;

    const result = await ExecutionService.resolveApproval({
      approvalId,
      organizationId: orgId,
      userId,
      decision: 'REJECTED',
      comments,
    });

    res.json({ message: 'Approval rejected', result });
  } catch (err: any) {
    console.error('[Reject Error]', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
