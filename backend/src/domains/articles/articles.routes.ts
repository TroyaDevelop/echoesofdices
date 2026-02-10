import { Router } from 'express';
import { authenticateToken, requireStaff } from '../../middlewares/auth';
import { createArticleHandler, deleteArticleHandler, getArticleHandler, listArticlesAdminHandler, listArticlesHandler, updateArticleHandler } from './articles.controller';

export const articlesRouter = Router();

articlesRouter.get('/', listArticlesHandler);
articlesRouter.get('/admin', authenticateToken, requireStaff, listArticlesAdminHandler);
articlesRouter.get('/:slug', getArticleHandler);
articlesRouter.post('/', authenticateToken, requireStaff, createArticleHandler);
articlesRouter.put('/:id(\\d+)', authenticateToken, requireStaff, updateArticleHandler);
articlesRouter.delete('/:id(\\d+)', authenticateToken, requireStaff, deleteArticleHandler);
