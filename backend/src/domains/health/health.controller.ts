import type { Request, Response } from 'express';
import { query } from '../../db/pool';

export async function healthCheck(_req: Request, res: Response) {
  try {
    await query('SELECT 1', []);
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
}
