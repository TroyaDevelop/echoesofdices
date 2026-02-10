import { Router } from 'express';
import { authenticateOptional, authenticateToken, requireStaff } from '../../middlewares/auth';
import { addWondrousCommentHandler, createWondrousHandler, deleteWondrousCommentHandler, deleteWondrousHandler, getWondrousHandler, getWondrousLikesHandler, likeWondrousHandler, listWondrousAdminHandler, listWondrousCommentsHandler, listWondrousHandler, unlikeWondrousHandler, updateWondrousHandler } from './wondrous.controller';

export const wondrousRouter = Router();

wondrousRouter.get('/', listWondrousHandler);
wondrousRouter.get('/admin', authenticateToken, requireStaff, listWondrousAdminHandler);
wondrousRouter.get('/:id(\\d+)', getWondrousHandler);
wondrousRouter.get('/:id(\\d+)/likes', authenticateOptional, getWondrousLikesHandler);
wondrousRouter.get('/:id(\\d+)/comments', listWondrousCommentsHandler);
wondrousRouter.post('/:id(\\d+)/comments', authenticateToken, addWondrousCommentHandler);
wondrousRouter.delete('/:id(\\d+)/comments/:commentId(\\d+)', authenticateToken, requireStaff, deleteWondrousCommentHandler);
wondrousRouter.post('/:id(\\d+)/like', authenticateToken, likeWondrousHandler);
wondrousRouter.delete('/:id(\\d+)/like', authenticateToken, unlikeWondrousHandler);

wondrousRouter.post('/', authenticateToken, requireStaff, createWondrousHandler);
wondrousRouter.put('/:id(\\d+)', authenticateToken, requireStaff, updateWondrousHandler);
wondrousRouter.delete('/:id(\\d+)', authenticateToken, requireStaff, deleteWondrousHandler);
