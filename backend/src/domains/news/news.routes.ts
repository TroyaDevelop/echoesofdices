import { Router } from 'express';
import { authenticateToken, requireEditorOrAdmin } from '../../middlewares/auth';
import { createNewsHandler, deleteNewsHandler, listNewsAdminHandler, listNewsHandler, updateNewsHandler } from './news.controller';

export const newsRouter = Router();

newsRouter.get('/', listNewsHandler);
newsRouter.get('/admin', authenticateToken, requireEditorOrAdmin, listNewsAdminHandler);
newsRouter.post('/', authenticateToken, requireEditorOrAdmin, createNewsHandler);
newsRouter.put('/:id(\\d+)', authenticateToken, requireEditorOrAdmin, updateNewsHandler);
newsRouter.delete('/:id(\\d+)', authenticateToken, requireEditorOrAdmin, deleteNewsHandler);
