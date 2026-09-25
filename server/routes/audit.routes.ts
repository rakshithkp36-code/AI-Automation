import { Router, Request, Response } from 'express';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticateToken);

// List audit logs
router.get('/', async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organization_id;
    const { action, entity_type } = req.query;

    let sql = `
      SELECT a.*, u.full_name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.organization_id = $1
    `;
    const params: any[] = [orgId];

    if (action) {
      params.push(action);
      sql += ` AND a.action = $${params.length}`;
    }

    if (entity_type) {
      params.push(entity_type);
      sql += ` AND a.entity_type = $${params.length}`;
    }

    sql += ' ORDER BY a.created_at DESC LIMIT 100';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
