import { Router } from 'express';
import { authenticateOptional, authenticateToken, requireStaff } from '../../middlewares/auth';
import { addTraitCommentHandler, createTraitHandler, deleteTraitCommentHandler, deleteTraitHandler, getTraitHandler, getTraitLikesHandler, likeTraitHandler, listTraitCommentsHandler, listTraitsAdminHandler, listTraitsHandler, unlikeTraitHandler, updateTraitHandler } from './traits.controller';

export const traitsRouter = Router();

traitsRouter.get('/', listTraitsHandler);
traitsRouter.get('/admin', authenticateToken, requireStaff, listTraitsAdminHandler);
traitsRouter.get('/:id(\\d+)', getTraitHandler);
traitsRouter.get('/:id(\\d+)/likes', authenticateOptional, getTraitLikesHandler);
traitsRouter.get('/:id(\\d+)/comments', listTraitCommentsHandler);
traitsRouter.post('/:id(\\d+)/comments', authenticateToken, addTraitCommentHandler);
traitsRouter.delete('/:id(\\d+)/comments/:commentId(\\d+)', authenticateToken, requireStaff, deleteTraitCommentHandler);
traitsRouter.post('/:id(\\d+)/like', authenticateToken, likeTraitHandler);
traitsRouter.delete('/:id(\\d+)/like', authenticateToken, unlikeTraitHandler);
traitsRouter.post('/', authenticateToken, requireStaff, createTraitHandler);
traitsRouter.put('/:id(\\d+)', authenticateToken, requireStaff, updateTraitHandler);
traitsRouter.delete('/:id(\\d+)', authenticateToken, requireStaff, deleteTraitHandler);
