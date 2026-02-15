import type { Request, Response } from 'express';
import { loginUser, registerUser } from './auth.service';
import { HttpError } from '../../utils/httpError';

export async function login(req: Request, res: Response) {
  try {
    const data = await loginUser(req.body?.login, req.body?.password);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка сервера' });
  }
}

export function verify(req: Request, res: Response) {
  res.json({
    user: {
      id: req.user?.userId,
      login: req.user?.login,
      role: req.user?.role,
      flags: req.user?.flags,
    },
  });
}

export async function register(req: Request, res: Response) {
  try {
    const data = await registerUser(req.body || {});
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при регистрации' });
  }
}
