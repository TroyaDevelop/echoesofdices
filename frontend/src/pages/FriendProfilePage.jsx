import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.jsx';
import CharacterSheet from '../components/profile/CharacterSheet.jsx';
import { socialAPI } from '../lib/api.js';

const formatJoinDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatLastSeen = (value) => {
  if (!value) return 'Не в сети';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Не в сети';
  return `Был(а) в сети ${date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const TABS = [
  { key: 'profile', label: 'Профиль' },
  { key: 'sheet', label: 'Лист персонажа' },
  { key: 'favorites', label: 'Избранные заклинания' },
];

export default function FriendProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('profile');
  const [characters, setCharacters] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeCharacterId, setActiveCharacterId] = useState(null);
  const [likeBusy, setLikeBusy] = useState(false);
  const [likeError, setLikeError] = useState('');
  const [likeSuccess, setLikeSuccess] = useState('');
  const [honorBusy, setHonorBusy] = useState(false);
  const [honorError, setHonorError] = useState('');
  const [honorSuccess, setHonorSuccess] = useState('');
  const [friendRequestBusy, setFriendRequestBusy] = useState(false);
  const [friendRequestError, setFriendRequestError] = useState('');
  const [friendRequestSuccess, setFriendRequestSuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewInput, setReviewInput] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await socialAPI.getFriendProfile(id);
        setProfile(data);

        const [chars, favs] = await Promise.all([
          data?.can_view_characters ? socialAPI.getFriendCharacters(id) : Promise.resolve([]),
          data?.can_view_favorites ? socialAPI.getFriendFavorites(id) : Promise.resolve([]),
        ]);
        setCharacters(Array.isArray(chars) ? chars : []);
        setFavorites(Array.isArray(favs) ? favs : []);
        if (Array.isArray(chars) && chars.length > 0) {
          setActiveCharacterId(chars[0].id);
        }
      } catch (err) {
        setError(err.message || 'Ошибка загрузки профиля друга');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    let isActive = true;
    const loadReviews = async () => {
      if (!profile?.id) return;
      setReviewsLoading(true);
      try {
        const rows = await socialAPI.getMasterReviews(profile.id);
        if (!isActive) return;
        setReviews(Array.isArray(rows) ? rows : []);
      } catch {
        if (!isActive) return;
        setReviews([]);
      } finally {
        if (isActive) setReviewsLoading(false);
      }
    };

    loadReviews();
    return () => {
      isActive = false;
    };
  }, [profile?.id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto p-4 text-slate-400">Загрузка...</div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-red-900/50 text-red-200 p-4 rounded border border-red-700">{error}</div>
          <button onClick={() => navigate('/profile')} className="mt-4 text-slate-300 hover:text-white">Вернуться в профиль</button>
        </div>
      </PublicLayout>
    );
  }

  const activeCharacter = characters.find(c => c.id === activeCharacterId) || null;
  const joinedDate = formatJoinDate(profile?.created_at);
  const canLikeToday = Boolean(profile?.can_like_today);
  const todayLikeTargetId = Number(profile?.today_like_target_id || 0);
  const likedCurrentProfileToday = todayLikeTargetId > 0 && todayLikeTargetId === Number(profile?.id);
  const isMasterProfile = Boolean(profile?.is_master);
  const hasHonorFromMe = Boolean(profile?.has_honor_from_me);
  const canGrantHonor = Boolean(profile?.can_grant_honor);
  const isSelfProfile = Boolean(profile?.is_self);
  const friendshipStatus = String(profile?.friendship_status || 'none');
  const isFriend = friendshipStatus === 'accepted';
  const canSendFriendRequest = Boolean(profile?.can_send_friend_request);
  const friendRequestDirection = String(profile?.friend_request_direction || '');
  const canWriteReview = isMasterProfile && !isSelfProfile;
  const shouldShowReviews = isMasterProfile || reviews.length > 0;

  const handleLike = async () => {
    if (likeBusy || !profile?.id || !canLikeToday) return;
    setLikeBusy(true);
    setLikeError('');
    setLikeSuccess('');
    try {
      const data = await socialAPI.likeFriendProfile(profile.id);
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          rating: Number(data?.rating || prev.rating || 0),
          can_like_today: false,
          today_like_target_id: Number(data?.today_like_target_id || prev.id),
        };
      });
      setLikeSuccess('Похвала отправлена. Сегодня у вас больше нет похвал.');
    } catch (err) {
      setLikeError(err.message || 'Не удалось отправить похвалу');
    } finally {
      setLikeBusy(false);
    }
  };

  const handleGrantHonor = async () => {
    if (honorBusy || !profile?.id || !isMasterProfile || !canGrantHonor || hasHonorFromMe) return;
    setHonorBusy(true);
    setHonorError('');
    setHonorSuccess('');
    try {
      const data = await socialAPI.grantHonorToMaster(profile.id);
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          has_honor_from_me: true,
          master_honor_count: Number(data?.master_honor_count || prev.master_honor_count || 0),
          honor_slots_used: Number(data?.honor_slots_used || prev.honor_slots_used || 0),
          honor_slots_max: Number(data?.honor_slots_max || prev.honor_slots_max || 3),
          can_grant_honor: Boolean(data?.can_grant_honor),
        };
      });
      setHonorSuccess('Честь отдана мастеру.');
    } catch (err) {
      setHonorError(err.message || 'Не удалось отдать честь');
    } finally {
      setHonorBusy(false);
    }
  };

  const handleRevokeHonor = async () => {
    if (honorBusy || !profile?.id || !isMasterProfile || !hasHonorFromMe) return;
    setHonorBusy(true);
    setHonorError('');
    setHonorSuccess('');
    try {
      const data = await socialAPI.revokeHonorFromMaster(profile.id);
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          has_honor_from_me: false,
          master_honor_count: Number(data?.master_honor_count || prev.master_honor_count || 0),
          honor_slots_used: Number(data?.honor_slots_used || prev.honor_slots_used || 0),
          honor_slots_max: Number(data?.honor_slots_max || prev.honor_slots_max || 3),
          can_grant_honor: Boolean(data?.can_grant_honor),
        };
      });
      setHonorSuccess('Честь забрана обратно.');
    } catch (err) {
      setHonorError(err.message || 'Не удалось забрать честь');
    } finally {
      setHonorBusy(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (friendRequestBusy || !profile?.id || !canSendFriendRequest) return;
    setFriendRequestBusy(true);
    setFriendRequestError('');
    setFriendRequestSuccess('');
    try {
      const data = await socialAPI.sendRequestByUserId(profile.id);
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          can_send_friend_request: false,
          friendship_status: 'pending',
          friend_request_direction: 'outgoing',
        };
      });
      setFriendRequestSuccess(data?.message || 'Заявка отправлена');
    } catch (err) {
      setFriendRequestError(err.message || 'Не удалось отправить заявку');
    } finally {
      setFriendRequestBusy(false);
    }
  };

  const handleAddReview = async () => {
    if (reviewBusy || !profile?.id || !canWriteReview) return;
    const content = String(reviewInput || '').trim();
    if (!content) {
      setReviewError('Введите текст отзыва');
      return;
    }
    setReviewBusy(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      const rows = await socialAPI.addMasterReview(profile.id, content);
      setReviews(Array.isArray(rows) ? rows : []);
      setReviewInput('');
      setReviewSuccess('Отзыв оставлен.');
    } catch (err) {
      setReviewError(err.message || 'Не удалось оставить отзыв');
    } finally {
      setReviewBusy(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-100">Профиль: {profile.nickname || profile.login}</h1>
          <button onClick={() => navigate('/profile')} className="text-slate-400 hover:text-white">Назад</button>
        </div>

        <div className="flex gap-1 border-b border-white/10 pb-px overflow-x-auto">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                tab === item.key
                  ? 'bg-white/10 text-white border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'profile' ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="text-2xl font-semibold text-slate-100">{profile.nickname || profile.login}</div>
              {Boolean(profile?.is_master) ? (
                <div className="mt-1 text-sm font-semibold master-badge">Мастер</div>
              ) : null}
              {joinedDate ? <div className="mt-1 text-xs text-slate-400">Участник с {joinedDate}</div> : null}
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className={`inline-block w-2 h-2 rounded-full ${profile?.is_online ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <span className={profile?.is_online ? 'text-emerald-300' : 'text-slate-400'}>
                  {profile?.is_online ? 'Сейчас в сети' : formatLastSeen(profile?.last_seen_at)}
                </span>
              </div>
              <div className="mt-2 text-sm text-purple-300">Мораль: {Number(profile?.rating || 0)} ❤</div>
              {isMasterProfile ? (
                <div className="mt-1 text-sm text-purple-200">Честь мастера: {Number(profile?.master_honor_count || 0)}</div>
              ) : null}
              {profile?.profile_status ? <div className="mt-2 text-sm text-slate-300">Статус: {profile.profile_status}</div> : null}
              {(profile.character_name || profile.race || profile.class_name || profile.character_level) ? (
                <div className="mt-3 text-sm text-slate-300">
                  {profile.character_name ? (
                    <div>
                      <span className="text-slate-500">Персонаж:</span>{' '}
                      <span className="font-medium text-slate-100">{profile.character_name}</span>
                    </div>
                  ) : null}
                  {(profile.race || profile.class_name) ? (
                    <div>
                      <span className="text-slate-500">Класс/раса:</span>{' '}
                      {[profile.race, profile.class_name].filter(Boolean).join(', ')}
                    </div>
                  ) : null}
                  {profile.character_level ? (
                    <div>
                      <span className="text-slate-500">Уровень:</span> {profile.character_level}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="w-full md:w-auto md:min-w-[320px] space-y-3">
              {!isSelfProfile ? (
                <div className="space-y-2">
                  {canSendFriendRequest ? (
                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                      <button
                        type="button"
                        onClick={handleSendFriendRequest}
                        disabled={friendRequestBusy}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          friendRequestBusy
                            ? 'bg-slate-700/60 text-slate-300 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {friendRequestBusy ? 'Отправка…' : 'Добавить в соратники'}
                      </button>
                    </div>
                  ) : friendshipStatus === 'accepted' ? (
                    <div className="text-xs text-emerald-300 md:text-right">Соратник.</div>
                  ) : friendshipStatus === 'pending' ? (
                    <div className="text-xs text-slate-400 md:text-right">
                      {friendRequestDirection === 'incoming'
                        ? 'Этот пользователь уже отправил вам заявку в соратники.'
                        : 'Заявка в соратники уже отправлена.'}
                    </div>
                  ) : null}
                  {friendRequestError ? <div className="text-xs text-red-300 md:text-right">{friendRequestError}</div> : null}
                  {friendRequestSuccess ? <div className="text-xs text-emerald-300 md:text-right">{friendRequestSuccess}</div> : null}
                </div>
              ) : null}

              {!isSelfProfile ? (
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={likeBusy || !canLikeToday}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    likeBusy || !canLikeToday
                      ? 'bg-slate-700/60 text-slate-300 cursor-not-allowed'
                      : 'bg-pink-600 hover:bg-pink-500 text-white'
                  }`}
                >
                  {likeBusy ? 'Отправка…' : '❤ Похвалить'}
                </button>
                {!canLikeToday ? (
                  <span className="text-xs text-slate-400 md:text-right">
                    {likedCurrentProfileToday
                      ? 'Вы уже похвалили этот профиль сегодня.'
                      : 'Вы уже потратили похвалу сегодня на другого пользователя.'}
                  </span>
                ) : null}
              </div>
              ) : null}
              {likeError ? <div className="text-xs text-red-300 md:text-right">{likeError}</div> : null}
              {likeSuccess ? <div className="text-xs text-emerald-300 md:text-right">{likeSuccess}</div> : null}

              {isMasterProfile && !isSelfProfile ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <button
                      type="button"
                      onClick={hasHonorFromMe ? handleRevokeHonor : handleGrantHonor}
                      disabled={honorBusy || (!hasHonorFromMe && !canGrantHonor)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        honorBusy || (!hasHonorFromMe && !canGrantHonor)
                          ? 'bg-slate-700/60 text-slate-300 cursor-not-allowed'
                          : hasHonorFromMe
                            ? 'bg-slate-600 hover:bg-slate-500 text-white'
                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {honorBusy ? 'Обработка…' : hasHonorFromMe ? 'Забрать честь' : 'Отдать честь'}
                    </button>
                  </div>
                  {!hasHonorFromMe && !canGrantHonor ? (
                    <div className="text-xs text-slate-400 md:text-right">У вас уже занята честь у трёх мастеров. Сначала заберите у одного из них.</div>
                  ) : null}
                  {honorError ? <div className="text-xs text-red-300 md:text-right">{honorError}</div> : null}
                  {honorSuccess ? <div className="text-xs text-emerald-300 md:text-right">{honorSuccess}</div> : null}
                </div>
              ) : null}
            </div>
          </div>

        </div>
        ) : null}

        {tab === 'profile' && shouldShowReviews ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">Отзывы</h2>

            {canWriteReview ? (
              <div className="space-y-2">
                <textarea
                  value={reviewInput}
                  onChange={(event) => setReviewInput(event.target.value)}
                  placeholder="Оставьте отзыв о мастере"
                  className="w-full min-h-[96px] rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddReview}
                    disabled={reviewBusy}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      reviewBusy
                        ? 'bg-slate-700/60 text-slate-300 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {reviewBusy ? 'Отправка…' : 'Оставить отзыв'}
                  </button>
                </div>
                {reviewError ? <div className="text-xs text-red-300">{reviewError}</div> : null}
                {reviewSuccess ? <div className="text-xs text-emerald-300">{reviewSuccess}</div> : null}
              </div>
            ) : (
              <div className="text-xs text-slate-400">Новые отзывы сейчас оставить нельзя.</div>
            )}

            {reviewsLoading ? (
              <div className="text-sm text-slate-400">Загрузка отзывов…</div>
            ) : reviews.length === 0 ? (
              <div className="text-sm text-slate-400">Отзывов пока нет.</div>
            ) : (
              <ul className="space-y-2">
                {reviews.map((review) => (
                  <li key={review.id} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <div className="text-xs text-slate-400">
                      {(review.reviewer_nickname || review.reviewer_login || `#${review.reviewer_user_id}`)} · {new Date(review.created_at).toLocaleString('ru-RU')}
                    </div>
                    <div className="mt-1 text-sm text-slate-200 whitespace-pre-wrap break-words">{review.content}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {tab === 'sheet' ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">Листы персонажей</h2>
          {!profile?.can_view_characters ? (
            <p className="text-slate-400">Пользователь скрыл информацию о листах персонажа.</p>
          ) : characters.length === 0 ? (
            <p className="text-slate-400">У пользователя нет листов персонажей.</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {characters.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCharacterId(c.id)}
                  className={`px-4 py-2 rounded whitespace-nowrap transition-colors ${
                    activeCharacterId === c.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-black/30 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {c.character_name || c.name || 'Безымянный'}
                </button>
              ))}
            </div>
          )}
        </div>
        ) : null}

        {tab === 'sheet' && profile?.can_view_characters && activeCharacter && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <CharacterSheet character={activeCharacter} owner={profile} onSaved={() => {}} readOnly />
          </div>
        )}

        {tab === 'favorites' ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">Избранные заклинания</h2>
          {!profile?.can_view_favorites ? (
            <p className="text-slate-400">Пользователь скрыл избранные заклинания.</p>
          ) : favorites.length === 0 ? (
            <p className="text-slate-400">У пользователя нет избранных заклинаний.</p>
          ) : (
            <ul className="space-y-2">
              {favorites.map((fav) => {
                const spellId = fav.spell_id || fav.id;
                return (
                  <li key={spellId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/20 border border-white/5">
                    <Link
                      to={`/spells/${spellId}`}
                      className="flex-1 text-sm font-medium text-purple-300 hover:text-purple-200 truncate"
                    >
                      {fav.name || fav.spell_name || `Заклинание #${spellId}`}
                    </Link>
                    {fav.level !== undefined ? (
                      <span className="text-xs text-slate-500">{Number(fav.level) === 0 ? 'Заговор' : `${fav.level} ур.`}</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        ) : null}
      </div>
    </PublicLayout>
  );
}
