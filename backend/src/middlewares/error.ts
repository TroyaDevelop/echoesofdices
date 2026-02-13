import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const multerCode = typeof err === 'object' && err && 'code' in err ? (err as { code?: string }).code : undefined;
  if (multerCode === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ error: 'Файл слишком большой. Максимальный размер: 15 МБ.' });
    return;
  }

  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof Error ? err.message : 'Что-то пошло не так!';
  res.status(status).json({ error: message });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Маршрут не найден' });
}
