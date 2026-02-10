import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Токен доступа не предоставлен' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || !user) {
      res.status(403).json({ error: 'Недействительный токен' });
      return;
    }
    req.user = user as any;
    next();
  });
}

export function authenticateOptional(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    next();
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || !user) {
      req.user = null;
      next();
      return;
    }
    req.user = user as any;
    next();
  });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const role = String(req.user?.role || '').toLowerCase();
  if (role !== 'editor' && role !== 'admin') {
    res.status(403).json({ error: 'Требуются права редактора' });
    return;
  }
  next();
}

export function requireAdminOnly(req: Request, res: Response, next: NextFunction): void {
  const role = String(req.user?.role || '').toLowerCase();
  if (role !== 'admin') {
    res.status(403).json({ error: 'Требуются права администратора' });
    return;
  }
  next();
}

export const requireStaff = requireAdmin;
