import { Router } from 'express';
import { authenticateOptional, authenticateToken, requireStaff } from '../../middlewares/auth';
import {
  createBestiaryEntryHandler,
  deleteBestiaryEntryHandler,
  getBestiaryEntryHandler,
  listBestiaryAdminHandler,
  listBestiaryHandler,
  updateBestiaryEntryHandler,
} from './bestiary.controller';

export const bestiaryRouter = Router();

bestiaryRouter.get('/', authenticateOptional, listBestiaryHandler);
bestiaryRouter.get('/admin', authenticateToken, requireStaff, listBestiaryAdminHandler);
bestiaryRouter.get('/:id(\\d+)', authenticateOptional, getBestiaryEntryHandler);

bestiaryRouter.post('/', authenticateToken, requireStaff, createBestiaryEntryHandler);
bestiaryRouter.put('/:id(\\d+)', authenticateToken, requireStaff, updateBestiaryEntryHandler);
bestiaryRouter.delete('/:id(\\d+)', authenticateToken, requireStaff, deleteBestiaryEntryHandler);