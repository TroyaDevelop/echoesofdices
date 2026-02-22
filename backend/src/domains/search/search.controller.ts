import { Request, Response, NextFunction } from 'express';
import { searchService } from './search.service';

export const searchController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = String(req.query.q || '').trim();
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const results = await searchService.searchAll(query);
      res.json(results);
    } catch (error) {
      next(error);
    }
  },
};
