import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.jsx';
import { spellsAPI } from '../lib/api.js';

const normalize = (v) => String(v || '').trim();

const firstGroupLetter = (name) => {
  const n = normalize(name);
  if (!n) return '#';
  return n[0].toLocaleUpperCase('ru-RU');
};

const levelBadge = (level) => {
  const lvl = Number(level);
  if (!Number.isFinite(lvl)) return 'Ур. ?';
  if (lvl === 0) return 'Заговор';
  return `Ур. ${lvl}`;
};

export default function SpellsPage() {
  const [spells, setSpells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');

  const [groupMode, setGroupMode] = useState('alpha');


  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await spellsAPI.list();
      setSpells(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки заклинаний');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredSorted = useMemo(() => {
    const q = normalize(query).toLowerCase();

    const filtered = (spells || []).filter((s) => {
      if (!q) return true;
      return normalize(s.name).toLowerCase().includes(q);
    });

    return filtered.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), 'ru', { sensitivity: 'base' }));
  }, [spells, query]);

  const grouped = useMemo(() => {
    if (groupMode === 'level') {
      const byLevel = new Map();
      for (const s of filteredSorted) {
        const lvl = Number(s.level);
        const key = Number.isFinite(lvl) ? String(lvl) : '?';
        const arr = byLevel.get(key);
        if (arr) arr.push(s);
        else byLevel.set(key, [s]);
      }

      const sortedKeys = Array.from(byLevel.keys()).sort((a, b) => {
        if (a === '?') return 1;
        if (b === '?') return -1;
        return Number(a) - Number(b);
      });

      return sortedKeys.map((key) => {
        const lvl = key === '?' ? NaN : Number(key);
        const title = Number.isFinite(lvl) ? (lvl === 0 ? 'Заговоры' : `Уровень ${lvl}`) : 'Уровень ?';
        const items = (byLevel.get(key) || []).slice().sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), 'ru', { sensitivity: 'base' }));
        return { id: `lvl:${key}`, title, items };
      });
    }

    const byLetter = new Map();
    for (const s of filteredSorted) {
      const key = firstGroupLetter(s.name);
      const arr = byLetter.get(key);
      if (arr) arr.push(s);
      else byLetter.set(key, [s]);
    }

    const sortedKeys = Array.from(byLetter.keys()).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b, 'ru', { sensitivity: 'base' });
    });

    return sortedKeys.map((key) => {
      const items = (byLetter.get(key) || []).slice().sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), 'ru', { sensitivity: 'base' }));
      return { id: `ltr:${key}`, title: key, items };
    });
  }, [filteredSorted, groupMode]);

  return (
    <PublicLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Заклинания</h1>
            <p className="mt-2 text-slate-300">
              {groupMode === 'level' ? 'Группировка по уровню.' : 'Группировка по алфавиту.'}
            </p>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="inline-flex rounded-xl border border-white/10 bg-slate-900/60 p-1">
              <button
                type="button"
                onClick={() => setGroupMode('alpha')}
                className={
                  groupMode === 'alpha'
                    ? 'px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/10 text-slate-100'
                    : 'px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-slate-100'
                }
              >
                Алфавит
              </button>
              <button
                type="button"
                onClick={() => setGroupMode('level')}
                className={
                  groupMode === 'level'
                    ? 'px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/10 text-slate-100'
                    : 'px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-slate-100'
                }
              >
                Уровень
              </button>
            </div>

            <div className="w-full sm:w-80">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск…"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
          </div>
        </div>

        {error && <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div>}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : filteredSorted.length === 0 ? (
          <div className="text-slate-300">Ничего не найдено.</div>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <section key={group.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-200">{group.title}</h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((s) => (
                    <Link
                      key={s.id}
                      to={`/spells/${s.id}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-start justify-between gap-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-slate-100 truncate">{s.name}</div>
                        {(s.school || s.components) && (
                          <div className="mt-0.5 text-xs text-slate-400 truncate">
                            {[s.school, s.components].filter(Boolean).join(' • ')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-200">
                          {levelBadge(s.level)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
