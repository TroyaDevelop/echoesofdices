import { query } from '../../db/pool';

export async function findUserByInviteCode(inviteCode: string) {
  const rows = await query<any[]>('SELECT id, login, nickname, invite_code FROM users WHERE invite_code = ? LIMIT 1', [inviteCode]);
  return rows && rows[0];
}

export async function findBasicUserById(id: number) {
  const rows = await query<any[]>('SELECT id, login, nickname, invite_code FROM users WHERE id = ? LIMIT 1', [id]);
  return rows && rows[0];
}

export async function findUserById(id: number) {
  const rows = await query<any[]>(
    `SELECT id, login, nickname, invite_code, created_at, updated_at,
            character_name, race, class_name, character_level,
          last_seen_at, profile_status, hide_character_sheets, hide_favorite_spells, hide_friends, flag_master
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

export async function countUserRating(userId: number) {
  const rows = await query<any[]>('SELECT COUNT(*) AS c FROM user_daily_likes WHERE to_user_id = ?', [userId]);
  return Number(rows?.[0]?.c || 0);
}

export async function getTodayLikeByUser(fromUserId: number) {
  const rows = await query<any[]>(
    'SELECT to_user_id FROM user_daily_likes WHERE from_user_id = ? AND like_day = CURDATE() LIMIT 1',
    [fromUserId]
  );
  return rows?.[0] || null;
}

export async function insertDailyLike(fromUserId: number, toUserId: number) {
  return query<any>(
    'INSERT INTO user_daily_likes (from_user_id, to_user_id, like_day) VALUES (?, ?, CURDATE())',
    [fromUserId, toUserId]
  );
}

export async function countMasterHonorReceived(masterUserId: number) {
  const rows = await query<any[]>('SELECT COUNT(*) AS c FROM user_master_honors WHERE master_user_id = ?', [masterUserId]);
  return Number(rows?.[0]?.c || 0);
}

export async function countUserHonorSlotsUsed(userId: number) {
  const rows = await query<any[]>('SELECT COUNT(*) AS c FROM user_master_honors WHERE user_id = ?', [userId]);
  return Number(rows?.[0]?.c || 0);
}

export async function hasHonorForMaster(userId: number, masterUserId: number) {
  const rows = await query<any[]>('SELECT id FROM user_master_honors WHERE user_id = ? AND master_user_id = ? LIMIT 1', [userId, masterUserId]);
  return Boolean(rows?.[0]);
}

export async function grantHonorToMaster(userId: number, masterUserId: number) {
  return query<any>('INSERT INTO user_master_honors (user_id, master_user_id) VALUES (?, ?)', [userId, masterUserId]);
}

export async function revokeHonorFromMaster(userId: number, masterUserId: number) {
  return query<any>('DELETE FROM user_master_honors WHERE user_id = ? AND master_user_id = ?', [userId, masterUserId]);
}

export async function listCommunityUsers(userId: number, searchTerm: string) {
  const like = `%${String(searchTerm || '').trim()}%`;
  return query<any[]>(
    `SELECT u.id, u.login, u.nickname, u.profile_status, u.last_seen_at, u.flag_master,
            COALESCE(r.rating, 0) AS rating,
            COALESCE(h.master_honor_count, 0) AS master_honor_count
     FROM users u
     LEFT JOIN (
       SELECT to_user_id, COUNT(*) AS rating
       FROM user_daily_likes
       GROUP BY to_user_id
     ) r ON r.to_user_id = u.id
     LEFT JOIN (
       SELECT master_user_id, COUNT(*) AS master_honor_count
       FROM user_master_honors
       GROUP BY master_user_id
     ) h ON h.master_user_id = u.id
     WHERE u.id <> ?
       AND (? = '%%' OR u.login LIKE ? OR IFNULL(u.nickname, '') LIKE ?)
     ORDER BY COALESCE(r.rating, 0) DESC, COALESCE(u.nickname, u.login) ASC
     LIMIT 500`,
    [userId, like, like, like]
  );
}

export async function listMasterReviews(masterUserId: number) {
  return query<any[]>(
    `SELECT CAST(mr.id AS UNSIGNED) AS id,
            mr.master_user_id, mr.reviewer_user_id, mr.content, mr.created_at,
            u.login AS reviewer_login, u.nickname AS reviewer_nickname
     FROM master_reviews mr
     JOIN users u ON u.id = mr.reviewer_user_id
     WHERE mr.master_user_id = ?
     ORDER BY mr.created_at DESC`,
    [masterUserId]
  );
}

export async function insertMasterReview(masterUserId: number, reviewerUserId: number, content: string) {
  return query<any>(
    'INSERT INTO master_reviews (master_user_id, reviewer_user_id, content) VALUES (?, ?, ?)',
    [masterUserId, reviewerUserId, content]
  );
}

export async function listGiftCatalog() {
  return query<any[]>(
    'SELECT id, name, description, image_url, price_free_morale, is_active FROM gifts_catalog WHERE is_active = 1 ORDER BY price_free_morale ASC, id ASC',
    []
  );
}

export async function findGiftById(giftId: number) {
  const rows = await query<any[]>(
    'SELECT id, name, description, image_url, price_free_morale, is_active FROM gifts_catalog WHERE id = ? LIMIT 1',
    [giftId]
  );
  return rows?.[0] || null;
}

export async function countSpentFreeMorale(userId: number) {
  const rows = await query<any[]>(
    'SELECT COALESCE(SUM(cost_free_morale), 0) AS c FROM user_gifts WHERE from_user_id = ?',
    [userId]
  );
  return Number(rows?.[0]?.c || 0);
}

export async function insertUserGift(ownerUserId: number, giftId: number, fromUserId: number, costFreeMorale: number) {
  const result = await query<any>(
    'INSERT INTO user_gifts (owner_user_id, gift_id, from_user_id, cost_free_morale) VALUES (?, ?, ?, ?)',
    [ownerUserId, giftId, fromUserId, costFreeMorale]
  );
  const insertedIdRaw = result?.insertId;
  const insertedId = typeof insertedIdRaw === 'bigint' ? Number(insertedIdRaw) : Number(insertedIdRaw);
  if (!Number.isFinite(insertedId) || insertedId <= 0) return null;

  const rows = await query<any[]>(
    `SELECT ug.id, ug.owner_user_id, ug.from_user_id, ug.cost_free_morale, ug.created_at,
            g.id AS gift_id, g.name, g.description, g.image_url, g.price_free_morale
     FROM user_gifts ug
     JOIN gifts_catalog g ON g.id = ug.gift_id
     WHERE ug.id = ?
     LIMIT 1`,
    [insertedId]
  );
  return rows?.[0] || null;
}

export async function listUserGiftInventory(userId: number) {
  return query<any[]>(
    `SELECT ug.id AS user_gift_id, ug.created_at,
            ug.from_user_id, ug.cost_free_morale,
            g.id AS gift_id, g.name, g.description, g.image_url, g.price_free_morale
     FROM user_gifts ug
     JOIN gifts_catalog g ON g.id = ug.gift_id
     WHERE ug.owner_user_id = ?
     ORDER BY ug.created_at DESC, ug.id DESC`,
    [userId]
  );
}

export async function ensureShowcaseSlots(userId: number) {
  for (let slot = 1; slot <= 4; slot += 1) {
    await query<any>(
      'INSERT INTO user_gift_showcase_slots (user_id, slot_index, user_gift_id) VALUES (?, ?, NULL) ON DUPLICATE KEY UPDATE user_id = user_id',
      [userId, slot]
    );
  }
}

export async function listUserShowcaseSlots(userId: number) {
  return query<any[]>(
    `SELECT s.slot_index, s.user_gift_id,
            ug.created_at AS gifted_at, ug.from_user_id,
            g.id AS gift_id, g.name, g.description, g.image_url, g.price_free_morale
     FROM user_gift_showcase_slots s
     LEFT JOIN user_gifts ug ON ug.id = s.user_gift_id
     LEFT JOIN gifts_catalog g ON g.id = ug.gift_id
     WHERE s.user_id = ?
     ORDER BY s.slot_index ASC`,
    [userId]
  );
}

export async function findUserGiftOwned(userId: number, userGiftId: number) {
  const rows = await query<any[]>(
    'SELECT id, owner_user_id FROM user_gifts WHERE id = ? AND owner_user_id = ? LIMIT 1',
    [userGiftId, userId]
  );
  return rows?.[0] || null;
}

export async function upsertShowcaseSlot(userId: number, slotIndex: number, userGiftId: number | null) {
  return query<any>(
    'INSERT INTO user_gift_showcase_slots (user_id, slot_index, user_gift_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE user_gift_id = VALUES(user_gift_id)',
    [userId, slotIndex, userGiftId]
  );
}
