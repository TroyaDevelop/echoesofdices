import { Router } from 'express';
import { authenticateToken, requireMasterOrAdmin } from '../../middlewares/auth';
import { createArticleHandler, deleteArticleHandler, getArticleHandler, listArticlesAdminHandler, listArticlesHandler, updateArticleHandler } from './articles.controller';

export const articlesRouter = Router();

articlesRouter.get('/', listArticlesHandler);
articlesRouter.get('/admin', authenticateToken, requireMasterOrAdmin, listArticlesAdminHandler);
articlesRouter.get('/:slug', getArticleHandler);
articlesRouter.post('/', authenticateToken, requireMasterOrAdmin, createArticleHandler);
articlesRouter.put('/:id(\\d+)', authenticateToken, requireMasterOrAdmin, updateArticleHandler);
articlesRouter.delete('/:id(\\d+)', authenticateToken, requireMasterOrAdmin, deleteArticleHandler);
