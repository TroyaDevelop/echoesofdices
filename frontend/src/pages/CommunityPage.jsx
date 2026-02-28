import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.jsx';
import { socialAPI } from '../lib/api.js';

const TABS = [{ key: 'adventurers', label: 'Приключенцы' }];

const userDisplayName = (user) => user?.display_name || user?.nickname || user?.login || `#${user?.id}`;

export default function CommunityPage() {
  const [tab, setTab] = useState('adventurers');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adventurers, setAdventurers] = useState([]);
  const [masters, setMasters] = useState([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setQuery(search.trim()), 250);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await socialAPI.getCommunityAdventurers(query);
        if (!isActive) return;
        setAdventurers(Array.isArray(data?.adventurers) ? data.adventurers : []);
        setMasters(Array.isArray(data?.masters) ? data.masters : []);
      } catch (err) {
        if (!isActive) return;
        setError(err.message || 'Ошибка загрузки сообщества');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [query]);

  const adventurersTitle = useMemo(() => `Пользователи по морали (${adventurers.length})`, [adventurers.length]);
  const mastersTitle = useMemo(() => `Мастера (${masters.length})`, [masters.length]);

  return (
    <PublicLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Сообщество</h1>
          <p className="mt-2 text-slate-300">Общий рейтинг и профили игроков мира.</p>
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

        {tab === 'adventurers' ? (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Поиск по имени пользователя</label>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Введите логин или ник"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            {error ? <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div> : null}

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-lg font-semibold text-slate-100">{adventurersTitle}</h2>
                {loading ? (
                  <div className="mt-3 text-sm text-slate-400">Загрузка…</div>
                ) : adventurers.length === 0 ? (
                  <div className="mt-3 text-sm text-slate-400">Ничего не найдено.</div>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {adventurers.map((user, index) => (
                      <li key={user.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                        <div className="min-w-0">
                          <div className="text-xs text-slate-400">#{index + 1}</div>
                          <Link to={`/profile/${user.id}`} className="text-sm font-medium text-purple-300 hover:text-purple-200 truncate block">
                            {userDisplayName(user)}
                          </Link>
                        </div>
                        <div className="text-sm font-semibold text-purple-200">{Number(user.rating || 0)} морали</div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-lg font-semibold text-slate-100">{mastersTitle}</h2>
                {loading ? (
                  <div className="mt-3 text-sm text-slate-400">Загрузка…</div>
                ) : masters.length === 0 ? (
                  <div className="mt-3 text-sm text-slate-400">Ничего не найдено.</div>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {masters.map((user, index) => (
                      <li key={user.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                        <div className="min-w-0">
                          <div className="text-xs text-slate-400">#{index + 1}</div>
                          <Link to={`/profile/${user.id}`} className="text-sm font-medium text-purple-300 hover:text-purple-200 truncate block">
                            {userDisplayName(user)}
                          </Link>
                          <div className="text-[11px] text-slate-500">Мастер</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-purple-200">{Number(user.master_honor_count || 0)} чести</div>
                          <div className="text-xs text-slate-400">{Number(user.rating || 0)} морали</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        ) : null}
      </div>
    </PublicLayout>
  );
}
