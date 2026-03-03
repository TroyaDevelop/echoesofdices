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

router.get('/gifts/shop', controller.getGiftShop);
router.get('/me/showcase', controller.getMyShowcase);
router.put('/me/showcase', controller.updateMyShowcase);

router.get('/profile/:friendId', controller.getFriendProfile);
router.get('/profile/:friendId/friends', controller.getFriendFriends);
router.get('/profile/:friendId/showcase', controller.getFriendShowcase);
router.get('/profile/:friendId/reviews', controller.getMasterReviews);
router.post('/profile/:friendId/reviews', controller.addMasterReview);
router.post('/profile/:friendId/like', controller.likeFriendProfile);
router.post('/profile/:friendId/honor', controller.grantHonorToMaster);
router.delete('/profile/:friendId/honor', controller.revokeHonorFromMaster);
router.post('/profile/:friendId/gifts', controller.giftToUser);
router.get('/profile/:friendId/characters', controller.getFriendCharacters);
router.get('/profile/:friendId/favorites', controller.getFriendFavoriteSpells);

export default router;
