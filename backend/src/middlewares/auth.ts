import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { findUserAuthById } from '../domains/auth/auth.repository';
import { extractUserFlags, hasAnyFlag, type UserFlagKey } from '../utils/permissions';

async function resolveAuthUserFromToken(token: string) {
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  const userId = Number(decoded?.userId);
  if (!Number.isFinite(userId) || userId <= 0) return null;

  const user = await findUserAuthById(userId);
  if (!user) return null;

  return {
    userId: Number(user.id),
    login: String(user.login || ''),
    role: 'user',
    flags: extractUserFlags(user),
  };
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Токен доступа не предоставлен' });
    return;
  }

  try {
    const authUser = await resolveAuthUserFromToken(token);
    if (!authUser) {
      res.status(403).json({ error: 'Недействительный токен' });
      return;
    }
    req.user = authUser;
    next();
  } catch {
    res.status(403).json({ error: 'Недействительный токен' });
  }
}

export async function authenticateOptional(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    next();
    return;
  }

  try {
    const authUser = await resolveAuthUserFromToken(token);
    if (!authUser) {
      req.user = null;
      next();
      return;
    }
    req.user = authUser;
  } catch {
    req.user = null;
  } finally {
    next();
  }
}

function requireAnyFlags(flags: UserFlagKey[], message: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!hasAnyFlag(req.user, flags)) {
      res.status(403).json({ error: message });
      return;
    }
    next();
  };
}

export const requireStaff = requireAnyFlags(['admin', 'editor', 'master'], 'Требуются права персонала');
export const requireEditorOrAdmin = requireAnyFlags(['admin', 'editor'], 'Требуются права редактора');
export const requireMasterOrAdmin = requireAnyFlags(['admin', 'master'], 'Требуются права мастера');

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!hasAnyFlag(req.user, ['admin'])) {
    res.status(403).json({ error: 'Требуются права администратора' });
    return;
  }
  next();
}

export function requireAdminOnly(req: Request, res: Response, next: NextFunction): void {
  if (!hasAnyFlag(req.user, ['admin'])) {
    res.status(403).json({ error: 'Требуются права администратора' });
    return;
  }
  next();
}
