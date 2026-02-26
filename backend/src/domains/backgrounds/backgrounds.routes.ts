import { Router } from 'express';
import { authenticateOptional, authenticateToken, requireStaff } from '../../middlewares/auth';
import {
  addBackgroundCommentHandler,
  createBackgroundHandler,
  deleteBackgroundCommentHandler,
  deleteBackgroundHandler,
  getBackgroundHandler,
  getBackgroundLikesHandler,
  likeBackgroundHandler,
  listBackgroundCommentsHandler,
  listBackgroundsAdminHandler,
  listBackgroundsHandler,
  unlikeBackgroundHandler,
  updateBackgroundHandler,
} from './backgrounds.controller';

export const backgroundsRouter = Router();

backgroundsRouter.get('/', listBackgroundsHandler);
backgroundsRouter.get('/admin', authenticateToken, requireStaff, listBackgroundsAdminHandler);
backgroundsRouter.get('/:id(\\d+)', getBackgroundHandler);
backgroundsRouter.get('/:id(\\d+)/likes', authenticateOptional, getBackgroundLikesHandler);
backgroundsRouter.get('/:id(\\d+)/comments', listBackgroundCommentsHandler);
backgroundsRouter.post('/:id(\\d+)/comments', authenticateToken, addBackgroundCommentHandler);
backgroundsRouter.delete('/:id(\\d+)/comments/:commentId(\\d+)', authenticateToken, requireStaff, deleteBackgroundCommentHandler);
backgroundsRouter.post('/:id(\\d+)/like', authenticateToken, likeBackgroundHandler);
backgroundsRouter.delete('/:id(\\d+)/like', authenticateToken, unlikeBackgroundHandler);
backgroundsRouter.post('/', authenticateToken, requireStaff, createBackgroundHandler);
backgroundsRouter.put('/:id(\\d+)', authenticateToken, requireStaff, updateBackgroundHandler);
backgroundsRouter.delete('/:id(\\d+)', authenticateToken, requireStaff, deleteBackgroundHandler);
