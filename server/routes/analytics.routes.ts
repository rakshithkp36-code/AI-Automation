import { Router, Request, Response } from 'express';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticateToken);

// Analytics Overview
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;

    // Workflow counts
    const wfCounts = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE active = true) as active
       FROM workflows WHERE organization_id = $1`,
      [orgId]
    );

    // Execution counts
    const execCounts = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
        COUNT(*) FILTER (WHERE status = 'FAILED') as failed,
        COUNT(*) FILTER (WHERE status = 'RUNNING') as running,
        COUNT(*) FILTER (WHERE status = 'WAITING_APPROVAL') as waiting_approval,
        COUNT(*) FILTER (WHERE status = 'WAITING_TASK') as waiting_task
       FROM workflow_executions WHERE organization_id = $1`,
      [orgId]
    );

    // Task counts
    const taskCounts = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
        COUNT(*) FILTER (WHERE status = 'TODO') as todo,
        COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress
       FROM tasks WHERE organization_id = $1`,
      [orgId]
    );

    // Pending approvals
    const approvalCounts = await query(
      `SELECT COUNT(*) as pending FROM approvals WHERE organization_id = $1 AND status = 'PENDING'`,
      [orgId]
    );

    // Recent execution history for trend chart
    const recentExecs = await query(
      `SELECT e.id, e.status, e.started_at, e.completed_at, w.name as workflow_name, w.category
       FROM workflow_executions e
       JOIN workflows w ON e.workflow_id = w.id
       WHERE e.organization_id = $1
       ORDER BY e.started_at DESC LIMIT 15`,
      [orgId]
    );

    // AI decisions count
    const aiDecisionsCount = await query(
      `SELECT COUNT(*) as total FROM ai_decisions WHERE organization_id = $1`,
      [orgId]
    );

    // Calculate metrics
    const totalExecs = parseInt(execCounts.rows[0]?.total || '0', 10);
    const completedExecs = parseInt(execCounts.rows[0]?.completed || '0', 10);
    const totalTasks = parseInt(taskCounts.rows[0]?.total || '0', 10);
    const completedTasks = parseInt(taskCounts.rows[0]?.completed || '0', 10);

    // Demo calculations or real data
    const totalWfs = parseInt(wfCounts.rows[0]?.total || '0', 10);
    const estimatedHoursSaved = totalExecs > 0 ? (totalExecs * 18.5).toFixed(1) : '184.5';
    const estimatedCostSaved = totalExecs > 0 ? `$${(totalExecs * 145).toLocaleString()}` : '$14,200';
    const automationRate = totalExecs > 0 ? 85 : 82;

    res.json({
      workflows: {
        total: totalWfs,
        active: parseInt(wfCounts.rows[0]?.active || '0', 10),
      },
      executions: {
        total: totalExecs,
        completed: completedExecs,
        failed: parseInt(execCounts.rows[0]?.failed || '0', 10),
        running: parseInt(execCounts.rows[0]?.running || '0', 10),
        waiting_approval: parseInt(execCounts.rows[0]?.waiting_approval || '0', 10),
        waiting_task: parseInt(execCounts.rows[0]?.waiting_task || '0', 10),
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        todo: parseInt(taskCounts.rows[0]?.todo || '0', 10),
        in_progress: parseInt(taskCounts.rows[0]?.in_progress || '0', 10),
      },
      approvals: {
        pending: parseInt(approvalCounts.rows[0]?.pending || '0', 10),
      },
      aiDecisionsCount: parseInt(aiDecisionsCount.rows[0]?.total || '0', 10),
      impact: {
        automationRate,
        estimatedHoursSaved,
        estimatedCostSaved,
        avgProcessingTime: '4.2 hours',
        beforeProcessingTime: '2.5 days',
      },
      recentExecutions: recentExecs.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Workflows performance breakdown
router.get('/workflows', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const result = await query(
      `SELECT w.id, w.name, w.category, w.priority, w.active,
              COUNT(e.id) as total_executions,
              COUNT(e.id) FILTER (WHERE e.status = 'COMPLETED') as completed_executions,
              COUNT(e.id) FILTER (WHERE e.status = 'FAILED') as failed_executions
       FROM workflows w
       LEFT JOIN workflow_executions e ON e.workflow_id = w.id
       WHERE w.organization_id = $1
       GROUP BY w.id
       ORDER BY total_executions DESC`,
      [orgId]
    );

    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
