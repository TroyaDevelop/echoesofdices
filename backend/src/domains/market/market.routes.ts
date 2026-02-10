import { Router } from 'express';
import { authenticateToken, requireStaff } from '../../middlewares/auth';
import {
  createMarketItemHandler,
  createMarketRegionHandler,
  createMarketTradeHandler,
  deleteMarketItemHandler,
  deleteMarketRegionHandler,
  listMarketItemsHandler,
  listMarketMarkupsHandler,
  listMarketRegionsHandler,
  listMarketTradesHandler,
  updateMarketItemHandler,
  updateMarketRegionHandler,
  upsertMarketMarkupHandler,
} from './market.controller';

export const marketRouter = Router();

marketRouter.get('/', listMarketItemsHandler);
marketRouter.get('/admin', authenticateToken, requireStaff, listMarketItemsHandler);

marketRouter.get('/regions', listMarketRegionsHandler);
marketRouter.get('/regions/admin', authenticateToken, requireStaff, listMarketRegionsHandler);
marketRouter.post('/regions', authenticateToken, requireStaff, createMarketRegionHandler);
marketRouter.put('/regions/:id(\\d+)', authenticateToken, requireStaff, updateMarketRegionHandler);
marketRouter.delete('/regions/:id(\\d+)', authenticateToken, requireStaff, deleteMarketRegionHandler);

marketRouter.get('/markups', listMarketMarkupsHandler);
marketRouter.get('/markups/admin', authenticateToken, requireStaff, listMarketMarkupsHandler);
marketRouter.put('/markups', authenticateToken, requireStaff, upsertMarketMarkupHandler);

marketRouter.get('/trades', authenticateToken, requireStaff, listMarketTradesHandler);
marketRouter.post('/trades', authenticateToken, createMarketTradeHandler);

marketRouter.post('/', authenticateToken, requireStaff, createMarketItemHandler);
marketRouter.put('/:id(\\d+)', authenticateToken, requireStaff, updateMarketItemHandler);
marketRouter.delete('/:id(\\d+)', authenticateToken, requireStaff, deleteMarketItemHandler);
