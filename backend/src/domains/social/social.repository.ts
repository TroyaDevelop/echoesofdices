import { query } from '../../db/pool';

export async function findUserByInviteCode(inviteCode: string) {
  const rows = await query<any[]>('SELECT id, login, nickname, invite_code FROM users WHERE invite_code = ? LIMIT 1', [inviteCode]);
  return rows && rows[0];
}

export async function findUserById(id: number) {
  const rows = await query<any[]>(
    `SELECT id, login, nickname, invite_code, created_at, updated_at,
            character_name, race, class_name, character_level,
            last_seen_at, profile_status, hide_character_sheets, hide_favorite_spells
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows && rows[0];
}

export async function getFriendship(userId1: number, userId2: number) {
  const rows = await query<any[]>(
    'SELECT * FROM friendships WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?) LIMIT 1',
    [userId1, userId2, userId2, userId1]
  );
  return rows && rows[0];
}

export async function createFriendRequest(requesterId: number, addresseeId: number) {
  return query<any>(
    'INSERT INTO friendships (user_id_1, user_id_2, status) VALUES (?, ?, "pending")',
    [requesterId, addresseeId]
  );
}

export async function updateFriendshipStatus(id: number, status: 'accepted' | 'rejected') {
  if (status === 'rejected') {
    return query<any>('DELETE FROM friendships WHERE id = ?', [id]);
  }
  return query<any>('UPDATE friendships SET status = ? WHERE id = ?', [status, id]);
}

export async function getFriends(userId: number) {
  return query<any[]>(
    `SELECT u.id, u.login, u.nickname, u.invite_code, u.last_seen_at, u.profile_status,
            f.status, f.id as friendship_id, f.user_id_1 as requester_id
     FROM friendships f
     JOIN users u ON (u.id = f.user_id_1 OR u.id = f.user_id_2) AND u.id != ?
     WHERE (f.user_id_1 = ? OR f.user_id_2 = ?)`,
    [userId, userId, userId]
  );
}

export async function removeFriendship(id: number) {
  return query<any>('DELETE FROM friendships WHERE id = ?', [id]);
}

export async function createNotification(userId: number, type: string, data: any) {
  return query<any>(
    'INSERT INTO notifications (user_id, type, data) VALUES (?, ?, ?)',
    [userId, type, JSON.stringify(data)]
  );
}

export async function getNotifications(userId: number) {
  return query<any[]>(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
}

export async function markNotificationAsRead(id: number, userId: number) {
  return query<any>('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
}

export async function getFriendCharacters(friendId: number) {
  return query<any[]>('SELECT * FROM user_character_sheets WHERE user_id = ? ORDER BY id ASC', [friendId]);
}

export async function getFriendFavoriteSpells(friendId: number) {
  return query<any[]>(
    `SELECT s.id, s.name, s.name_en, s.level, s.school, s.classes, s.description,
            sf.created_at AS favorited_at
     FROM spell_favorites sf
     JOIN spells s ON s.id = sf.spell_id
     WHERE sf.user_id = ?
     ORDER BY sf.created_at DESC`,
    [friendId]
  );
}
