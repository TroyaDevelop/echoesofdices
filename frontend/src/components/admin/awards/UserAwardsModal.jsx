import { useEffect, useState } from 'react';
import { adminAPI, userProfileAPI } from '../../../lib/api.js';
import { API_URL } from '../../../lib/config.js';

export default function UserAwardsModal({ user, onClose }) {
  const [allAwards, setAllAwards] = useState([]);
  const [userAwards, setUserAwards] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [all, ua] = await Promise.all([
          adminAPI.listAwards(),
          userProfileAPI.getUserAwards(user.id),
        ]);
        setAllAwards(Array.isArray(all) ? all : []);
        setUserAwards(Array.isArray(ua) ? ua : []);
      } catch (e) {
        setError(e.message || 'Ошибка');
      }
    })();
  }, [user]);

  if (!user) return null;

  const userAwardIds = new Set(userAwards.map((ua) => ua.award_id ?? ua.id));

  const grant = async (awardId) => {
    setError('');
    setBusy(true);
    try {
      await adminAPI.grantAward(user.id, awardId);
      const ua = await userProfileAPI.getUserAwards(user.id);
      setUserAwards(Array.isArray(ua) ? ua : []);
    } catch (e) {
      setError(e.message || 'Ошибка');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (awardId) => {
    setError('');
    setBusy(true);
    try {
      await adminAPI.revokeAward(user.id, awardId);
      const ua = await userProfileAPI.getUserAwards(user.id);
      setUserAwards(Array.isArray(ua) ? ua : []);
    } catch (e) {
      setError(e.message || 'Ошибка');
    } finally {
      setBusy(false);
    }
  };

  const baseUrl = API_URL.replace('/api', '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Награды — {user.nickname || user.login}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        {allAwards.length === 0 ? (
          <div className="text-sm text-gray-500">Нет наград. Сначала создайте награды в разделе «Утилиты».</div>
        ) : (
          <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto rounded-lg border border-gray-200">
            {allAwards.map((award) => {
              const granted = userAwardIds.has(award.id);
              return (
                <li key={award.id} className="flex items-center gap-3 px-3 py-2">
                  {award.image_url ? (
                    <img
                      src={`${baseUrl}${award.image_url}`}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-lg flex-shrink-0">🏅</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm truncate">{award.name}</div>
                    {award.description ? <div className="text-xs text-gray-500 truncate">{award.description}</div> : null}
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => (granted ? revoke(award.id) : grant(award.id))}
                    className={`text-xs px-3 py-1 rounded-lg font-medium flex-shrink-0 disabled:opacity-60 ${
                      granted
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {granted ? 'Отозвать' : 'Выдать'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
