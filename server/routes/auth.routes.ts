import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/index.js';
import { RegisterSchema, LoginSchema } from '../../shared/schemas/index.js';
import { signToken, authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validated = RegisterSchema.parse(req.body);

    // Check existing email
    const existing = await query('SELECT id FROM users WHERE email = $1', [validated.email.toLowerCase()]);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'A user with this email address already exists.' });
      return;
    }

    // Create organization
    const orgId = uuidv4();
    const slug = validated.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
    await query(
      `INSERT INTO organizations (id, name, slug, plan) VALUES ($1, $2, $3, $4)`,
      [orgId, validated.organizationName, slug, 'enterprise']
    );

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10);
    const userId = uuidv4();

    // Insert user
    await query(
      `INSERT INTO users (id, email, password_hash, full_name, role, organization_id, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, validated.email.toLowerCase(), passwordHash, validated.fullName, validated.role, orgId, 'Operations']
    );

    // Organization member
    await query(
      `INSERT INTO organization_members (id, organization_id, user_id, role) VALUES ($1, $2, $3, $4)`,
      [uuidv4(), orgId, userId, validated.role]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), orgId, userId, 'user_register', 'user', userId, { email: validated.email, role: validated.role }]
    );

    const userObj = {
      id: userId,
      email: validated.email.toLowerCase(),
      full_name: validated.fullName,
      role: validated.role,
      organization_id: orgId,
      department: 'Operations',
    };

    const token = signToken(userObj);
    res.status(201).json({ token, user: userObj });
  } catch (err: any) {
    console.error('[Register Error]', err);
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validated = LoginSchema.parse(req.body);

    const userRes = await query(
      `SELECT u.*, o.name as organization_name 
       FROM users u 
       JOIN organizations o ON u.organization_id = o.id 
       WHERE u.email = $1`,
      [validated.email.toLowerCase()]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const user = userRes.rows[0];
    const passwordMatch = await bcrypt.compare(validated.password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const userObj = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      organization_id: user.organization_id,
      department: user.department,
      avatar_url: user.avatar_url,
      organization_name: user.organization_name,
    };

    const token = signToken(userObj);

    // Audit log
    await query(
      `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), user.organization_id, user.id, 'user_login', 'user', user.id]
    );

    res.json({ token, user: userObj });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Login failed' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  if (req.user) {
    await query(
      `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.user.organization_id, req.user.id, 'user_logout', 'user', req.user.id]
    );
  }
  res.json({ message: 'Logged out successfully' });
});

// Current User Profile
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRes = await query(
      `SELECT u.id, u.email, u.full_name, u.role, u.department, u.avatar_url, u.created_at,
              o.id as organization_id, o.name as organization_name, o.plan as organization_plan
       FROM users u 
       JOIN organizations o ON u.organization_id = o.id 
       WHERE u.id = $1`,
      [req.user!.id]
    );

    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(userRes.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
