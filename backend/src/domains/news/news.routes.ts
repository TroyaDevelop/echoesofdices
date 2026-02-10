import { Router } from 'express';
import { authenticateToken, requireStaff } from '../../middlewares/auth';
import { createNewsHandler, deleteNewsHandler, listNewsAdminHandler, listNewsHandler, updateNewsHandler } from './news.controller';

export const newsRouter = Router();

newsRouter.get('/', listNewsHandler);
newsRouter.get('/admin', authenticateToken, requireStaff, listNewsAdminHandler);
newsRouter.post('/', authenticateToken, requireStaff, createNewsHandler);
newsRouter.put('/:id(\\d+)', authenticateToken, requireStaff, updateNewsHandler);
newsRouter.delete('/:id(\\d+)', authenticateToken, requireStaff, deleteNewsHandler);
