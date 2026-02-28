import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth';
import * as controller from './social.controller';

const router = Router();

router.use(authenticateToken);

router.post('/friends/request', controller.sendFriendRequest);
router.post('/friends/request-by-id', controller.sendFriendRequestByUserId);
router.post('/friends/respond', controller.respondToFriendRequest);
router.get('/friends', controller.getFriendsList);
router.delete('/friends/:friendshipId', controller.removeFriend);

router.get('/community/adventurers', controller.getCommunityAdventurers);

router.get('/notifications', controller.getUserNotifications);
router.post('/notifications/:notificationId/read', controller.readNotification);

router.get('/profile/:friendId', controller.getFriendProfile);
router.get('/profile/:friendId/reviews', controller.getMasterReviews);
router.post('/profile/:friendId/reviews', controller.addMasterReview);
router.post('/profile/:friendId/like', controller.likeFriendProfile);
router.post('/profile/:friendId/honor', controller.grantHonorToMaster);
router.delete('/profile/:friendId/honor', controller.revokeHonorFromMaster);
router.get('/profile/:friendId/characters', controller.getFriendCharacters);
router.get('/profile/:friendId/favorites', controller.getFriendFavoriteSpells);

export default router;
