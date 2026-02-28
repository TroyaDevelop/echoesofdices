import { HttpError } from '../../utils/httpError';
import * as repo from './social.repository';

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

function isOnlineByLastSeen(lastSeenAt?: string | Date | null) {
  if (!lastSeenAt) return false;
  const ts = new Date(lastSeenAt).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= ONLINE_WINDOW_MS;
}

export async function sendFriendRequest(requesterId: number, inviteCode: string) {
  const addressee = await repo.findUserByInviteCode(inviteCode);
  if (!addressee) throw new HttpError(404, 'Пользователь с таким кодом не найден');
  if (addressee.id === requesterId) throw new HttpError(400, 'Нельзя добавить самого себя');

  const existing = await repo.getFriendship(requesterId, addressee.id);
  if (existing) throw new HttpError(400, 'Заявка уже отправлена или вы уже соратники');

  await repo.createFriendRequest(requesterId, addressee.id);
  
  const requester = await repo.findUserById(requesterId);
  await repo.createNotification(addressee.id, 'friend_request', {
    requesterId: requester.id,
    requesterName: requester.nickname || requester.login,
  });

  return { message: 'Заявка отправлена' };
}

export async function sendFriendRequestByUserId(requesterId: number, targetUserId: number) {
  if (!Number.isFinite(targetUserId)) throw new HttpError(400, 'Некорректный id пользователя');
  const addressee = await repo.findBasicUserById(targetUserId);
  if (!addressee) throw new HttpError(404, 'Пользователь не найден');
  if (addressee.id === requesterId) throw new HttpError(400, 'Нельзя добавить самого себя');

  const existing = await repo.getFriendship(requesterId, addressee.id);
  if (existing) throw new HttpError(400, 'Заявка уже отправлена или вы уже соратники');

  await repo.createFriendRequest(requesterId, addressee.id);

  const requester = await repo.findUserById(requesterId);
  await repo.createNotification(addressee.id, 'friend_request', {
    requesterId: requester.id,
    requesterName: requester.nickname || requester.login,
  });

  return { message: 'Заявка отправлена' };
}

export async function respondToFriendRequest(userId: number, friendshipId: number, action: 'accept' | 'reject') {
  const friends = await repo.getFriends(userId);
  const friendship = friends.find(f => f.friendship_id === friendshipId);
  
  if (!friendship) throw new HttpError(404, 'Заявка не найдена');
  if (friendship.requester_id === userId) throw new HttpError(400, 'Вы не можете принять свою же заявку');
  if (friendship.status !== 'pending') throw new HttpError(400, 'Заявка уже обработана');

  await repo.updateFriendshipStatus(friendshipId, action === 'accept' ? 'accepted' : 'rejected');
  
  if (action === 'accept') {
    const user = await repo.findUserById(userId);
    await repo.createNotification(friendship.id, 'friend_accepted', {
      friendId: user.id,
      friendName: user.nickname || user.login,
    });
  }

  return { message: action === 'accept' ? 'Заявка принята' : 'Заявка отклонена' };
}

export async function getFriendsList(userId: number) {
  const friends = await repo.getFriends(userId);
  return friends.map(f => ({
    id: f.id,
    login: f.login,
    nickname: f.nickname,
    inviteCode: f.invite_code,
    lastSeenAt: f.last_seen_at,
    isOnline: isOnlineByLastSeen(f.last_seen_at),
    profileStatus: f.profile_status,
    status: f.status,
    friendshipId: f.friendship_id,
    isRequester: f.requester_id === userId
  }));
}

export async function removeFriend(userId: number, friendshipId: number) {
  const friends = await repo.getFriends(userId);
  const friendship = friends.find(f => f.friendship_id === friendshipId);
  if (!friendship) throw new HttpError(404, 'Друг не найден');

  await repo.removeFriendship(friendshipId);
  return { message: 'Друг удален' };
}

export async function getUserNotifications(userId: number) {
  const notifs = await repo.getNotifications(userId);
  return notifs.map(n => ({
    ...n,
    data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data
  }));
}

export async function readNotification(userId: number, notificationId: number) {
  await repo.markNotificationAsRead(notificationId, userId);
  return { message: 'Уведомление прочитано' };
}

export async function getFriendProfile(userId: number, friendId: number) {
  if (!Number.isFinite(friendId)) throw new HttpError(400, 'Некорректный id пользователя');
  const friend = await repo.findUserById(friendId);
  if (!friend) throw new HttpError(404, 'Пользователь не найден');
  const friendship = userId === friendId ? null : await repo.getFriendship(userId, friendId);
  const friendshipStatus = friendship ? String(friendship.status) : 'none';
  const isFriend = friendshipStatus === 'accepted';
  const isRequester = friendship ? Number(friendship.user_id_1) === userId : false;
  const isSelf = userId === friendId;
  const rating = await repo.countUserRating(friendId);
  const todayLike = await repo.getTodayLikeByUser(userId);
  const todayLikeTargetId = todayLike ? Number(todayLike.to_user_id) : null;
  const isMaster = Number(friend.flag_master || 0) === 1;
  const masterHonorCount = isMaster ? await repo.countMasterHonorReceived(friendId) : 0;
  const hasHonorFromMe = isMaster && !isSelf ? await repo.hasHonorForMaster(userId, friendId) : false;
  const honorSlotsUsed = await repo.countUserHonorSlotsUsed(userId);
  
  return {
    id: friend.id,
    login: friend.login,
    nickname: friend.nickname,
    created_at: friend.created_at,
    updated_at: friend.updated_at,
    last_seen_at: friend.last_seen_at,
    is_online: isOnlineByLastSeen(friend.last_seen_at),
    profile_status: friend.profile_status,
    is_master: isMaster,
    is_self: isSelf,
    friendship_status: friendshipStatus,
    can_send_friend_request: !isSelf && !friendship,
    friend_request_direction: friendshipStatus === 'pending' ? (isRequester ? 'outgoing' : 'incoming') : null,
    master_honor_count: masterHonorCount,
    has_honor_from_me: hasHonorFromMe,
    honor_slots_used: honorSlotsUsed,
    honor_slots_max: 3,
    can_grant_honor: !isSelf && isMaster && (hasHonorFromMe || honorSlotsUsed < 3),
    character_name: friend.character_name,
    race: friend.race,
    class_name: friend.class_name,
    character_level: friend.character_level,
    rating,
    can_like_today: !isSelf && todayLikeTargetId === null,
    today_like_target_id: todayLikeTargetId,
    can_view_characters: isFriend && !Boolean(friend.hide_character_sheets),
    can_view_favorites: isFriend && !Boolean(friend.hide_favorite_spells),
  };
}

export async function getCommunityAdventurers(userId: number, search?: string) {
  const rows = await repo.listCommunityUsers(userId, String(search || ''));
  const list = Array.isArray(rows) ? rows : [];

  const mapped = list.map((row) => ({
    id: Number(row.id),
    login: row.login,
    nickname: row.nickname,
    display_name: row.nickname || row.login,
    profile_status: row.profile_status || null,
    last_seen_at: row.last_seen_at || null,
    is_online: isOnlineByLastSeen(row.last_seen_at),
    is_master: Number(row.flag_master || 0) === 1,
    rating: Number(row.rating || 0),
    master_honor_count: Number(row.master_honor_count || 0),
  }));

  const adventurers = mapped
    .filter((u) => !u.is_master)
    .sort((a, b) => (b.rating - a.rating) || a.display_name.localeCompare(b.display_name, 'ru'));

  const masters = mapped
    .filter((u) => u.is_master)
    .sort((a, b) => (b.master_honor_count - a.master_honor_count) || (b.rating - a.rating) || a.display_name.localeCompare(b.display_name, 'ru'));

  return { adventurers, masters };
}

export async function getMasterReviews(friendId: number) {
  if (!Number.isFinite(friendId)) throw new HttpError(400, 'Некорректный id пользователя');
  const user = await repo.findUserById(friendId);
  if (!user) throw new HttpError(404, 'Пользователь не найден');
  const rows = await repo.listMasterReviews(friendId);
  const list = Array.isArray(rows) ? rows : [];
  return list.map((row) => ({
    id: Number(row.id),
    master_user_id: Number(row.master_user_id),
    reviewer_user_id: Number(row.reviewer_user_id),
    content: row.content,
    created_at: row.created_at,
    reviewer_login: row.reviewer_login,
    reviewer_nickname: row.reviewer_nickname,
  }));
}

export async function addMasterReview(userId: number, friendId: number, content: string) {
  if (!Number.isFinite(friendId)) throw new HttpError(400, 'Некорректный id пользователя');
  if (userId === friendId) throw new HttpError(400, 'Нельзя оставить отзыв самому себе');

  const target = await repo.findUserById(friendId);
  if (!target) throw new HttpError(404, 'Пользователь не найден');
  if (Number(target.flag_master || 0) !== 1) {
    throw new HttpError(400, 'Оставлять отзывы можно только мастерам');
  }

  const text = String(content || '').trim();
  if (!text) throw new HttpError(400, 'Текст отзыва не может быть пустым');
  if (text.length > 2000) throw new HttpError(400, 'Отзыв слишком длинный (макс. 2000 символов)');

  await repo.insertMasterReview(friendId, userId, text);
  return getMasterReviews(friendId);
}

export async function grantHonorToMaster(userId: number, friendId: number) {
  if (!Number.isFinite(friendId)) throw new HttpError(400, 'Некорректный id пользователя');
  if (userId === friendId) throw new HttpError(400, 'Нельзя отдать честь самому себе');

  const friend = await repo.findUserById(friendId);
  if (!friend) throw new HttpError(404, 'Пользователь не найден');
  if (Number(friend.flag_master || 0) !== 1) throw new HttpError(400, 'Отдать честь можно только мастеру');

  const alreadyHonored = await repo.hasHonorForMaster(userId, friendId);
  if (!alreadyHonored) {
    const usedSlots = await repo.countUserHonorSlotsUsed(userId);
    if (usedSlots >= 3) {
      throw new HttpError(409, 'У вас уже занята честь у трех мастеров');
    }

    try {
      await repo.grantHonorToMaster(userId, friendId);
    } catch (error: any) {
      if (Number(error?.errno) === 1062 || String(error?.code || '').toUpperCase() === 'ER_DUP_ENTRY') {
        // already honored, treat as success idempotently
      } else {
        throw error;
      }
    }
  }

  const masterHonorCount = await repo.countMasterHonorReceived(friendId);
  const honorSlotsUsed = await repo.countUserHonorSlotsUsed(userId);
  return {
    ok: true,
    has_honor_from_me: true,
    master_honor_count: masterHonorCount,
    honor_slots_used: honorSlotsUsed,
    honor_slots_max: 3,
    can_grant_honor: true,
  };
}

export async function revokeHonorFromMaster(userId: number, friendId: number) {
  if (!Number.isFinite(friendId)) throw new HttpError(400, 'Некорректный id пользователя');
  if (userId === friendId) throw new HttpError(400, 'Нельзя управлять честью самого себя');

  const friend = await repo.findUserById(friendId);
  if (!friend) throw new HttpError(404, 'Пользователь не найден');
  if (Number(friend.flag_master || 0) !== 1) throw new HttpError(400, 'Этот пользователь не мастер');

  await repo.revokeHonorFromMaster(userId, friendId);

  const masterHonorCount = await repo.countMasterHonorReceived(friendId);
  const honorSlotsUsed = await repo.countUserHonorSlotsUsed(userId);
  return {
    ok: true,
    has_honor_from_me: false,
    master_honor_count: masterHonorCount,
    honor_slots_used: honorSlotsUsed,
    honor_slots_max: 3,
    can_grant_honor: honorSlotsUsed < 3,
  };
}

export async function likeFriendProfile(userId: number, friendId: number) {
  if (!Number.isFinite(friendId)) throw new HttpError(400, 'Некорректный id пользователя');
  if (userId === friendId) throw new HttpError(400, 'Нельзя похвалить самого себя');

  const friend = await repo.findUserById(friendId);
  if (!friend) throw new HttpError(404, 'Пользователь не найден');

  const todayLike = await repo.getTodayLikeByUser(userId);
  if (todayLike) {
    throw new HttpError(409, 'Вы уже потратили похвалу на сегодня');
  }

  try {
    await repo.insertDailyLike(userId, friendId);
  } catch (error: any) {
    if (Number(error?.errno) === 1062 || String(error?.code || '').toUpperCase() === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'Вы уже потратили похвалу на сегодня');
    }
    throw error;
  }

  const rating = await repo.countUserRating(friendId);
  return {
    ok: true,
    rating,
    can_like_today: false,
    today_like_target_id: friendId,
  };
}

export async function getFriendCharacters(userId: number, friendId: number) {
  const friends = await repo.getFriends(userId);
  const isFriend = friends.some(f => f.id === friendId && f.status === 'accepted');
  
  if (!isFriend) throw new HttpError(403, 'Листы персонажей доступны только соратникам');

  const friend = await repo.findUserById(friendId);
  if (!friend) throw new HttpError(404, 'Пользователь не найден');
  if (Boolean(friend.hide_character_sheets)) return [];
  
  return repo.getFriendCharacters(friendId);
}

export async function getFriendFavoriteSpells(userId: number, friendId: number) {
  const friends = await repo.getFriends(userId);
  const isFriend = friends.some(f => f.id === friendId && f.status === 'accepted');

  if (!isFriend) throw new HttpError(403, 'Избранные заклинания доступны только соратникам');

  const friend = await repo.findUserById(friendId);
  if (!friend) throw new HttpError(404, 'Пользователь не найден');
  if (Boolean(friend.hide_favorite_spells)) return [];

  return repo.getFriendFavoriteSpells(friendId);
}
