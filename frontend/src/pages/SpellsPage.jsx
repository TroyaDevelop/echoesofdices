import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.jsx';
import { spellsAPI } from '../lib/api.js';

const normalize = (v) => String(v || '').trim();

export default function SpellsPage() {
  const [spells, setSpells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');


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
    const map = new Map();
    for (const s of filteredSorted) {
      const letter = normalize(s.name).charAt(0).toUpperCase() || '#';
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter).push(s);
    }
    return Array.from(map.entries());
  }, [filteredSorted]);

  return (
    <PublicLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Заклинания</h1>
            <p className="mt-2 text-slate-300">Список по алфавиту.</p>
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

        {error && <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div>}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : grouped.length === 0 ? (
          <div className="text-slate-300">Ничего не найдено.</div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([letter, list]) => (
              <section key={letter} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-purple-200">
                    {letter}
                  </div>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  {list.map((s) => (
                    <Link
                      key={s.id}
                      to={`/spells/${s.id}`}
                      className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4 border-b border-white/10 last:border-b-0"
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
                          {Number.isFinite(Number(s.level)) ? `Ур. ${s.level}` : 'Ур. ?'}
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
