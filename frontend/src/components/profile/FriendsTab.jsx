import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { socialAPI } from '../../lib/api';

const formatLastSeen = (value) => {
  if (!value) return 'не был в сети';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'не был в сети';
  return `был в сети ${date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export default function FriendsTab({ profile }) {
  const [friends, setFriends] = useState([]);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const friendsData = await socialAPI.getFriends();
      setFriends(friendsData);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!inviteCodeInput.trim()) return;
    try {
      await socialAPI.sendRequest(inviteCodeInput.trim());
      setSuccess('Заявка отправлена');
      setInviteCodeInput('');
      loadData();
    } catch (err) {
      setError(err.message || 'Ошибка отправки заявки');
    }
  };

  const handleRespond = async (friendshipId, action) => {
    setError('');
    setSuccess('');
    try {
      await socialAPI.respondRequest(friendshipId, action);
      setSuccess(action === 'accept' ? 'Заявка принята' : 'Заявка отклонена');
      loadData();
    } catch (err) {
      setError(err.message || 'Ошибка обработки заявки');
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    if (!window.confirm('Вы уверены, что хотите удалить друга?')) return;
    setError('');
    setSuccess('');
    try {
      await socialAPI.removeFriend(friendshipId);
      setSuccess('Друг удален');
      loadData();
    } catch (err) {
      setError(err.message || 'Ошибка удаления друга');
    }
  };

  if (loading) return <div className="text-slate-400 text-sm">Загрузка…</div>;

  const pendingRequests = friends.filter(f => f.status === 'pending' && !f.isRequester);
  const sentRequests = friends.filter(f => f.status === 'pending' && f.isRequester);
  const acceptedFriends = friends.filter(f => f.status === 'accepted');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-100">Соратники</h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Код приглашения:</span>
          <code className="rounded bg-black/30 border border-white/10 px-2 py-1 text-slate-200 select-all">
            {profile?.invite_code || '—'}
          </code>
        </div>
      </div>

      {error && <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm">{error}</div>}
      {success && <div className="text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm">{success}</div>}

      <form onSubmit={handleSendRequest} className="flex gap-2">
          <input
            type="text"
            value={inviteCodeInput}
            onChange={(e) => setInviteCodeInput(e.target.value)}
            placeholder="Введите код приглашения"
            className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
          />
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-500 transition-colors">
            Добавить
          </button>
      </form>

      {pendingRequests.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Входящие заявки</div>
          <ul className="space-y-2 text-sm">
            {pendingRequests.map(f => (
              <li key={f.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
                <span className="text-slate-200 font-medium">{f.nickname || f.login}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleRespond(f.friendshipId, 'accept')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-xs">Принять</button>
                  <button onClick={() => handleRespond(f.friendshipId, 'reject')} className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded text-xs">Отклонить</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sentRequests.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Отправленные заявки</div>
          <ul className="space-y-2 text-sm">
            {sentRequests.map(f => (
              <li key={f.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
                <span className="text-slate-200 font-medium">{f.nickname || f.login}</span>
                <span className="text-slate-500 text-xs">Ожидает подтверждения</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Мои соратники</div>
        {acceptedFriends.length === 0 ? (
          <p className="text-slate-400 text-sm">У вас пока нет соратников.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {acceptedFriends.map(f => (
              <li key={f.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="min-w-0">
                  <Link to={`/profile/${f.id}`} className="text-purple-300 hover:text-purple-200 font-medium block truncate">
                    {f.nickname || f.login}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                    <span className={`inline-block w-2 h-2 rounded-full ${f.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <span>{f.isOnline ? 'в сети' : formatLastSeen(f.lastSeenAt)}</span>
                  </div>
                </div>
                <button onClick={() => handleRemoveFriend(f.friendshipId)} className="text-rose-300 hover:text-rose-200 text-xs">
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
