import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { geminiService } from '../services/gemini.service.js';

const router = Router();
router.use(authenticateToken);

// Get Organization
router.get('/', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const orgRes = await query('SELECT * FROM organizations WHERE id = $1', [orgId]);

    if (orgRes.rows.length === 0) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    const membersCount = await query('SELECT COUNT(*) as count FROM users WHERE organization_id = $1', [orgId]);
    const workflowsCount = await query('SELECT COUNT(*) as count FROM workflows WHERE organization_id = $1', [orgId]);

    res.json({
      ...orgRes.rows[0],
      memberCount: parseInt(membersCount.rows[0]?.count || '0', 10),
      workflowCount: parseInt(workflowsCount.rows[0]?.count || '0', 10),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List Members
router.get('/members', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const membersRes = await query(
      `SELECT id, email, full_name, role, department, avatar_url, created_at 
       FROM users 
       WHERE organization_id = $1 
       ORDER BY created_at ASC`,
      [orgId]
    );

    res.json(membersRes.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add member
router.post('/members', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const { email, fullName, role, department } = req.body;

    if (!email || !fullName) {
      res.status(400).json({ error: 'Email and full name are required' });
      return;
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'A user with this email already exists' });
      return;
    }

    const userId = uuidv4();
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    await query(
      `INSERT INTO users (id, email, password_hash, full_name, role, organization_id, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, email.toLowerCase(), defaultPasswordHash, fullName, role || 'Employee', orgId, department || 'Operations']
    );

    await query(
      `INSERT INTO organization_members (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), orgId, userId, role || 'Employee']
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), orgId, req.user!.id, 'member_added', 'user', userId, { email, role }]
    );

    res.status(201).json({
      id: userId,
      email,
      full_name: fullName,
      role: role || 'Employee',
      department: department || 'Operations',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update Settings (e.g. Gemini API Key)
router.post('/settings', async (req: Request, res: Response) => {
  try {
    const { geminiApiKey } = req.body;

    if (geminiApiKey && typeof geminiApiKey === 'string') {
      process.env.GEMINI_API_KEY = geminiApiKey.trim();
      geminiService.refreshKey();
      console.log('[Settings] Updated GEMINI_API_KEY dynamically from settings.');
    }

    res.json({
      message: 'Settings updated successfully',
      hasApiKey: geminiService.hasApiKey(),
      mode: geminiService.hasApiKey() ? 'live_google_genai' : 'intelligent_heuristic_engine',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
