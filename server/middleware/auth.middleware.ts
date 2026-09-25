import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
  department?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_SECRET = process.env.SESSION_SECRET || 'flowpilot-ai-super-secret-jwt-key-2026';

export function signToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      organization_id: user.organization_id,
      department: user.department,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

    // Verify user still exists in database
    const userRes = await query(
      'SELECT id, email, full_name, role, organization_id, department FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({ error: 'User account not found.' });
      return;
    }

    req.user = userRes.rows[0];
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}
