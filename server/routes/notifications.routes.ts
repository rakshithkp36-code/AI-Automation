import { Router, Request, Response } from 'express';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticateToken);

// List notifications for current user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );

    const unreadCount = result.rows.filter((n: any) => !n.read).length;
    res.json({ notifications: result.rows, unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark single notification as read
router.post('/:id/read', async (req: Request, res: Response) => {
  try {
    await query('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2', [
      req.params.id as string,
      req.user!.id,
    ]);
    res.json({ message: 'Marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.post('/mark-all-read', async (req: Request, res: Response) => {
  try {
    await query('UPDATE notifications SET read = true WHERE user_id = $1', [req.user!.id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
