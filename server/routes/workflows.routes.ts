import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { CreateWorkflowSchema, ExecuteWorkflowSchema } from '../../shared/schemas/index.js';
import { ExecutionService } from '../services/execution.service.js';
import { geminiService } from '../services/gemini.service.js';

const router = Router();
router.use(authenticateToken);

// List workflows
router.get('/', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const result = await query(
      `SELECT w.*, u.full_name as creator_name, p.title as problem_title,
              COUNT(s.id) as step_count,
              (SELECT COUNT(*) FROM workflow_executions WHERE workflow_id = w.id) as execution_count
       FROM workflows w
       LEFT JOIN users u ON w.created_by = u.id
       LEFT JOIN problems p ON w.problem_id = p.id
       LEFT JOIN workflow_steps s ON s.workflow_id = w.id
       WHERE w.organization_id = $1
       GROUP BY w.id, u.full_name, p.title
       ORDER BY w.created_at DESC`,
      [orgId]
    );

    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create workflow manually or via builder
router.post('/', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const userId = req.user!.id;
    const body = CreateWorkflowSchema.parse(req.body);

    const workflowId = uuidv4();
    await query(
      `INSERT INTO workflows (
        id, organization_id, created_by, problem_id, name, description, 
        category, trigger_type, priority, approval_required, sla_hours, active, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        workflowId,
        orgId,
        userId,
        body.problem_id || null,
        body.name,
        body.description,
        body.category,
        body.trigger_type,
        body.priority,
        body.approval_required,
        body.sla_hours,
        body.active,
        body.metadata || {},
      ]
    );

    // Insert steps
    for (let i = 0; i < body.steps.length; i++) {
      const step = body.steps[i];
      const stepId = step.id || uuidv4();
      await query(
        `INSERT INTO workflow_steps (
          id, workflow_id, order_index, step_type, name, description, 
          assignee_role, config, next_step_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          stepId,
          workflowId,
          step.order_index,
          step.step_type,
          step.name,
          step.description,
          step.assignee_role || 'Employee',
          step.config || {},
          step.next_step_order || null,
        ]
      );
    }

    // Audit log
    await query(
      `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), orgId, userId, 'workflow_create', 'workflow', workflowId, { name: body.name }]
    );

    const fullWorkflow = await getFullWorkflow(workflowId, orgId);
    res.status(201).json(fullWorkflow);
  } catch (err: any) {
    console.error('[Create Workflow Error]', err);
    res.status(400).json({ error: err.message });
  }
});

// Helper to fetch full workflow + steps
async function getFullWorkflow(id: string, orgId: string) {
  const wfRes = await query(
    `SELECT w.*, u.full_name as creator_name, p.title as problem_title 
     FROM workflows w 
     LEFT JOIN users u ON w.created_by = u.id 
     LEFT JOIN problems p ON w.problem_id = p.id
     WHERE w.id = $1 AND w.organization_id = $2`,
    [id, orgId]
  );

  if (wfRes.rows.length === 0) return null;
  const workflow = wfRes.rows[0];

  const stepsRes = await query(
    `SELECT * FROM workflow_steps WHERE workflow_id = $1 ORDER BY order_index ASC`,
    [id]
  );
  workflow.steps = stepsRes.rows;
  return workflow;
}

// Get workflow by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const workflow = await getFullWorkflow(req.params.id as string, orgId);

    if (!workflow) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }

    res.json(workflow);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update workflow & steps
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const wId = req.params.id as string;
    const body = req.body;

    const check = await query('SELECT id FROM workflows WHERE id = $1 AND organization_id = $2', [wId, orgId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }

    await query(
      `UPDATE workflows SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        trigger_type = COALESCE($4, trigger_type),
        priority = COALESCE($5, priority),
        approval_required = COALESCE($6, approval_required),
        sla_hours = COALESCE($7, sla_hours),
        active = COALESCE($8, active),
        metadata = COALESCE($9, metadata),
        version = version + 1,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND organization_id = $11`,
      [
        body.name,
        body.description,
        body.category,
        body.trigger_type,
        body.priority,
        body.approval_required,
        body.sla_hours,
        body.active,
        body.metadata,
        wId,
        orgId,
      ]
    );

    // If steps array is provided, replace steps
    if (Array.isArray(body.steps)) {
      await query('DELETE FROM workflow_steps WHERE workflow_id = $1', [wId]);
      for (let i = 0; i < body.steps.length; i++) {
        const step = body.steps[i];
        await query(
          `INSERT INTO workflow_steps (
            id, workflow_id, order_index, step_type, name, description, 
            assignee_role, config, next_step_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            step.id || uuidv4(),
            wId,
            step.order_index ?? i + 1,
            step.step_type,
            step.name,
            step.description || '',
            step.assignee_role || 'Employee',
            step.config || {},
            step.next_step_order || null,
          ]
        );
      }
    }

    // Audit log
    await query(
      `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), orgId, req.user!.id, 'workflow_update', 'workflow', wId]
    );

    const updated = await getFullWorkflow(wId, orgId);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete workflow
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const wId = req.params.id as string;

    const del = await query('DELETE FROM workflows WHERE id = $1 AND organization_id = $2 RETURNING id', [wId, orgId]);
    if (del.rows.length === 0) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }

    res.json({ message: 'Workflow deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Activate
router.post('/:id/activate', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    await query('UPDATE workflows SET active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND organization_id = $2', [
      req.params.id as string,
      orgId,
    ]);
    res.json({ message: 'Workflow activated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Deactivate
router.post('/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    await query('UPDATE workflows SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND organization_id = $2', [
      req.params.id as string,
      orgId,
    ]);
    res.json({ message: 'Workflow deactivated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generate Automated Workflow from Problem
router.post('/generate-from-problem/:problemId', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const userId = req.user!.id;
    const pId = req.params.problemId as string;

    const probRes = await query('SELECT * FROM problems WHERE id = $1 AND organization_id = $2', [pId, orgId]);
    if (probRes.rows.length === 0) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const problem = probRes.rows[0];

    // Call Gemini AI Workflow Generator
    const generated = await geminiService.generateWorkflow({
      problemTitle: problem.title,
      department: problem.department,
      description: problem.description + '\n' + problem.current_process,
      requirements: problem.desired_outcome,
    });

    // Create workflow
    const workflowId = uuidv4();
    await query(
      `INSERT INTO workflows (
        id, organization_id, created_by, problem_id, name, description, 
        category, trigger_type, priority, approval_required, sla_hours, active, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        workflowId,
        orgId,
        userId,
        pId,
        generated.workflowName,
        generated.description,
        generated.category || problem.department,
        generated.trigger?.type || 'form_submission',
        'high',
        true,
        24,
        true,
        {
          generatedByAI: true,
          completionCriteria: generated.completionCriteria,
          exceptionHandling: generated.exceptionHandling,
        },
      ]
    );

    // Insert steps
    for (let i = 0; i < generated.steps.length; i++) {
      const step = generated.steps[i];
      await query(
        `INSERT INTO workflow_steps (
          id, workflow_id, order_index, step_type, name, description, 
          assignee_role, config, next_step_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          uuidv4(),
          workflowId,
          step.order || i + 1,
          step.type,
          step.name,
          step.description,
          step.assigneeRole || 'Employee',
          { conditions: step.conditions || [] },
          step.nextStep || (i + 2 <= generated.steps.length ? i + 2 : null),
        ]
      );
    }

    // Mark problem as WORKFLOW_GENERATED
    await query(`UPDATE problems SET status = 'WORKFLOW_GENERATED' WHERE id = $1`, [pId]);

    // Audit log
    await query(
      `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), orgId, userId, 'workflow_ai_generated', 'workflow', workflowId, { problemId: pId, name: generated.workflowName }]
    );

    const full = await getFullWorkflow(workflowId, orgId);
    res.status(201).json(full);
  } catch (err: any) {
    console.error('[Generate Workflow Error]', err);
    res.status(500).json({ error: err.message || 'AI Workflow Generation failed' });
  }
});

// Execute Workflow
router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const userId = req.user!.id;
    const wId = req.params.id as string;
    const body = ExecuteWorkflowSchema.parse(req.body);

    const result = await ExecutionService.startExecution({
      workflowId: wId,
      organizationId: orgId,
      userId,
      inputData: body.input_data || {},
    });

    res.status(201).json(result);
  } catch (err: any) {
    console.error('[Execute Workflow Error]', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
