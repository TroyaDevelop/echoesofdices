import { useEffect, useMemo, useState } from 'react';
import PublicLayout from '../components/PublicLayout.jsx';
import { spellsAPI } from '../lib/api.js';
import SpellListHeader from '../components/spells/SpellListHeader.jsx';
import SpellGroupSection from '../components/spells/SpellGroupSection.jsx';

const normalize = (v) => String(v || '').trim();

const firstGroupLetter = (name) => {
  const n = normalize(name);
  if (!n) return '#';
  return n[0].toLocaleUpperCase('ru-RU');
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
        <SpellListHeader
          groupMode={groupMode}
          onGroupModeChange={setGroupMode}
          query={query}
          onQueryChange={setQuery}
        />

        {error && <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div>}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : filteredSorted.length === 0 ? (
          <div className="text-slate-300">Ничего не найдено.</div>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <SpellGroupSection key={group.id} title={group.title} items={group.items} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
