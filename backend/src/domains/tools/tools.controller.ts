import type { Request, Response, NextFunction } from 'express';
import { toolsService } from './tools.service';

export const toolsController = {
  async spellcheck(req: Request, res: Response, next: NextFunction) {
    try {
      const text = String(req.body?.text ?? '').trim();
      if (!text) {
        return res.json({ errors: [] });
      }
      const result = await toolsService.spellcheck(text);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
