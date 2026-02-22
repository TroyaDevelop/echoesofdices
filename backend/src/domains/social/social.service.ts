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
  const friends = await repo.getFriends(userId);
  const isFriend = friends.some(f => f.id === friendId && f.status === 'accepted');
  
  if (!isFriend) throw new HttpError(403, 'Профиль доступен только соратникам');
  
  const friend = await repo.findUserById(friendId);
  if (!friend) throw new HttpError(404, 'Пользователь не найден');
  
  return {
    id: friend.id,
    login: friend.login,
    nickname: friend.nickname,
    created_at: friend.created_at,
    updated_at: friend.updated_at,
    last_seen_at: friend.last_seen_at,
    is_online: isOnlineByLastSeen(friend.last_seen_at),
    profile_status: friend.profile_status,
    character_name: friend.character_name,
    race: friend.race,
    class_name: friend.class_name,
    character_level: friend.character_level,
    can_view_characters: !Boolean(friend.hide_character_sheets),
    can_view_favorites: !Boolean(friend.hide_favorite_spells),
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
