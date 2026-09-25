import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { CreateProblemSchema } from '../../shared/schemas/index.js';
import { geminiService } from '../services/gemini.service.js';

const router = Router();
router.use(authenticateToken);

// List problems
router.get('/', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const result = await query(
      `SELECT p.*, u.full_name as creator_name 
       FROM problems p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.organization_id = $1 
       ORDER BY p.created_at DESC`,
      [orgId]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create problem
router.post('/', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const userId = req.user!.id;
    const body = CreateProblemSchema.parse(req.body);

    const problemId = uuidv4();
    await query(
      `INSERT INTO problems (
        id, organization_id, created_by, title, description, department, 
        current_process, frequency, average_processing_time, people_involved, 
        current_tools, pain_points, estimated_cost, desired_outcome, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        problemId,
        orgId,
        userId,
        body.title,
        body.description,
        body.department,
        body.currentProcess,
        body.frequency,
        body.averageProcessingTime,
        body.peopleInvolved,
        body.currentTools,
        body.painPoints,
        body.estimatedCost,
        body.desiredOutcome,
        'DRAFT',
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), orgId, userId, 'problem_create', 'problem', problemId, { title: body.title, department: body.department }]
    );

    const created = await query('SELECT * FROM problems WHERE id = $1', [problemId]);
    res.status(201).json(created.rows[0]);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get problem by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const result = await query(
      `SELECT p.*, u.full_name as creator_name 
       FROM problems p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.id = $1 AND p.organization_id = $2`,
      [req.params.id as string, orgId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update problem
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const pId = req.params.id as string;
    const body = req.body;

    const check = await query('SELECT id FROM problems WHERE id = $1 AND organization_id = $2', [pId, orgId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    await query(
      `UPDATE problems SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        department = COALESCE($3, department),
        current_process = COALESCE($4, current_process),
        frequency = COALESCE($5, frequency),
        average_processing_time = COALESCE($6, average_processing_time),
        people_involved = COALESCE($7, people_involved),
        current_tools = COALESCE($8, current_tools),
        pain_points = COALESCE($9, pain_points),
        estimated_cost = COALESCE($10, estimated_cost),
        desired_outcome = COALESCE($11, desired_outcome),
        status = COALESCE($12, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $13 AND organization_id = $14`,
      [
        body.title,
        body.description,
        body.department,
        body.currentProcess,
        body.frequency,
        body.averageProcessingTime,
        body.peopleInvolved,
        body.currentTools,
        body.painPoints,
        body.estimatedCost,
        body.desiredOutcome,
        body.status,
        pId,
        orgId,
      ]
    );

    const updated = await query('SELECT * FROM problems WHERE id = $1', [pId]);
    res.json(updated.rows[0]);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete problem
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const pId = req.params.id as string;

    const del = await query('DELETE FROM problems WHERE id = $1 AND organization_id = $2 RETURNING id', [pId, orgId]);
    if (del.rows.length === 0) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    res.json({ message: 'Problem deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger AI Process Analysis for a Problem
router.post('/:id/analyze', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const pId = req.params.id as string;

    const probRes = await query(
      'SELECT * FROM problems WHERE id = $1 AND organization_id = $2',
      [pId, orgId]
    );

    if (probRes.rows.length === 0) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const p = probRes.rows[0];

    // Call Gemini AI Process Analyzer
    const analysis = await geminiService.analyzeProblem({
      title: p.title,
      description: p.description,
      department: p.department,
      currentProcess: p.current_process,
      peopleInvolved: p.people_involved,
      frequency: p.frequency,
      averageProcessingTime: p.average_processing_time,
      painPoints: p.pain_points,
      desiredOutcome: p.desired_outcome,
    });

    // Save AI analysis & update status
    await query(
      `UPDATE problems 
       SET ai_analysis = $1, status = 'ANALYZED', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND organization_id = $3`,
      [analysis, pId, orgId]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), orgId, req.user!.id, 'problem_ai_analyzed', 'problem', pId, { title: p.title }]
    );

    res.json({
      problemId: pId,
      status: 'ANALYZED',
      analysis,
    });
  } catch (err: any) {
    console.error('[Problem Analyze Error]', err);
    res.status(500).json({ error: err.message || 'AI Process Analysis failed' });
  }
});

export default router;
