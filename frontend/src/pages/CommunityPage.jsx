import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.jsx';
import { socialAPI } from '../lib/api.js';

const userDisplayName = (user) => user?.display_name || user?.nickname || user?.login || `#${user?.id}`;
const LEADERBOARD_LIMIT = 100;
const SUGGESTIONS_LIMIT = 8;

export default function CommunityPage() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adventurers, setAdventurers] = useState([]);
  const [masters, setMasters] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchBoxRef = useRef(null);
  const searchTerm = search.trim();

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await socialAPI.getCommunityAdventurers('');
        if (!isActive) return;
        const sortedAdventurers = Array.isArray(data?.adventurers) ? data.adventurers : [];
        const sortedMasters = Array.isArray(data?.masters) ? data.masters : [];
        setAdventurers(sortedAdventurers.slice(0, LEADERBOARD_LIMIT));
        setMasters(sortedMasters.slice(0, LEADERBOARD_LIMIT));
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
  }, []);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!searchBoxRef.current?.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    let isActive = true;
    const term = search.trim();

    if (!term) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const data = await socialAPI.getCommunityAdventurers(term);
        if (!isActive) return;

        const adventurersList = Array.isArray(data?.adventurers) ? data.adventurers : [];
        const mastersList = Array.isArray(data?.masters) ? data.masters : [];
        const uniqueMap = new Map();

        [...adventurersList, ...mastersList].forEach((user) => {
          if (!uniqueMap.has(user.id)) {
            uniqueMap.set(user.id, user);
          }
        });

        const needle = term.toLocaleLowerCase('ru');
        const ranked = Array.from(uniqueMap.values())
          .map((user) => {
            const display = userDisplayName(user).toLocaleLowerCase('ru');
            const login = String(user?.login || '').toLocaleLowerCase('ru');
            const startsWith = display.startsWith(needle) || login.startsWith(needle);
            return {
              ...user,
              _score: startsWith ? 0 : 1,
            };
          })
          .sort((a, b) => (a._score - b._score) || (Number(b.rating || 0) - Number(a.rating || 0)) || userDisplayName(a).localeCompare(userDisplayName(b), 'ru'))
          .slice(0, SUGGESTIONS_LIMIT)
          .map(({ _score, ...user }) => user);

        setSuggestions(ranked);
      } catch {
        if (!isActive) return;
        setSuggestions([]);
      } finally {
        if (isActive) setSuggestionsLoading(false);
      }
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  const adventurersTitle = useMemo(() => 'Топ 100 по морали', []);
  const mastersTitle = useMemo(() => 'Мастера', []);
  const cardClass = 'rounded-2xl border border-purple-400/30 ring-1 ring-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 shadow-xl';

  return (
    <PublicLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Странники</h1>
        </div>

        <div className={cardClass} ref={searchBoxRef}>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Поиск по имени пользователя</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Введите логин или ник"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
            />

            {isSearchOpen && searchTerm ? (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-slate-950/95 backdrop-blur p-2 shadow-xl max-h-64 overflow-y-auto">
                {suggestionsLoading ? <div className="px-2 py-2 text-sm text-slate-400">Поиск…</div> : null}

                {!suggestionsLoading && suggestions.length === 0 ? (
                  <div className="px-2 py-2 text-sm text-slate-400">Совпадений не найдено.</div>
                ) : null}

                {!suggestionsLoading && suggestions.length > 0
                  ? suggestions.map((user) => (
                      <Link
                        key={user.id}
                        to={`/profile/${user.id}`}
                        onClick={() => {
                          setSearch(userDisplayName(user));
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-white/10 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-slate-100 truncate">{userDisplayName(user)}</div>
                          <div className="text-xs text-slate-400 truncate">@{user.login}</div>
                        </div>
                        <div className="text-xs text-purple-200 whitespace-nowrap">{Number(user.rating || 0)} морали</div>
                      </Link>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
        </div>

        {error ? <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div> : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <section className={cardClass}>
            <h2 className="text-lg font-semibold text-slate-100">{adventurersTitle}</h2>
            {loading ? (
              <div className="mt-3 text-sm text-slate-400">Загрузка…</div>
            ) : adventurers.length === 0 ? (
              <div className="mt-3 text-sm text-slate-400">Ничего не найдено.</div>
            ) : (
              <ul className="mt-3 space-y-2 max-h-[28rem] overflow-y-auto pr-1">
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

          <section className={cardClass}>
            <h2 className="text-lg font-semibold text-slate-100">{mastersTitle}</h2>
            {loading ? (
              <div className="mt-3 text-sm text-slate-400">Загрузка…</div>
            ) : masters.length === 0 ? (
              <div className="mt-3 text-sm text-slate-400">Ничего не найдено.</div>
            ) : (
              <ul className="mt-3 space-y-2 max-h-[28rem] overflow-y-auto pr-1">
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
      </div>
    </PublicLayout>
  );
}
