import { Router } from 'express';
import { authenticateToken, requireEditorOrAdmin } from '../../middlewares/auth';
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
marketRouter.get('/admin', authenticateToken, requireEditorOrAdmin, listMarketItemsHandler);

marketRouter.get('/regions', listMarketRegionsHandler);
marketRouter.get('/regions/admin', authenticateToken, requireEditorOrAdmin, listMarketRegionsHandler);
marketRouter.post('/regions', authenticateToken, requireEditorOrAdmin, createMarketRegionHandler);
marketRouter.put('/regions/:id(\\d+)', authenticateToken, requireEditorOrAdmin, updateMarketRegionHandler);
marketRouter.delete('/regions/:id(\\d+)', authenticateToken, requireEditorOrAdmin, deleteMarketRegionHandler);

marketRouter.get('/markups', listMarketMarkupsHandler);
marketRouter.get('/markups/admin', authenticateToken, requireEditorOrAdmin, listMarketMarkupsHandler);
marketRouter.put('/markups', authenticateToken, requireEditorOrAdmin, upsertMarketMarkupHandler);

marketRouter.get('/trades', authenticateToken, requireEditorOrAdmin, listMarketTradesHandler);
marketRouter.post('/trades', authenticateToken, createMarketTradeHandler);

marketRouter.post('/', authenticateToken, requireEditorOrAdmin, createMarketItemHandler);
marketRouter.put('/:id(\\d+)', authenticateToken, requireEditorOrAdmin, updateMarketItemHandler);
marketRouter.delete('/:id(\\d+)', authenticateToken, requireEditorOrAdmin, deleteMarketItemHandler);
