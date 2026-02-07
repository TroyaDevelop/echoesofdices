import { useEffect, useMemo, useState } from 'react';
import PublicLayout from '../components/PublicLayout.jsx';
import { wondrousItemsAPI } from '../lib/api.js';
import WondrousItemsListHeader from '../components/wondrous-items/WondrousItemsListHeader.jsx';
import WondrousItemGroupSection from '../components/wondrous-items/WondrousItemGroupSection.jsx';

const normalize = (v) => String(v || '').trim();

const firstGroupLetter = (name) => {
  const n = normalize(name);
  if (!n) return '#';
  return n[0].toLocaleUpperCase('ru-RU');
};

export default function WondrousItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await wondrousItemsAPI.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки предметов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredSorted = useMemo(() => {
    const q = normalize(query).toLowerCase();
    const filtered = (items || []).filter((item) => {
      if (!q) return true;
      return normalize(item.name).toLowerCase().includes(q);
    });

    return filtered.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), 'ru', { sensitivity: 'base' }));
  }, [items, query]);

  const grouped = useMemo(() => {
    const byLetter = new Map();
    for (const item of filteredSorted) {
      const key = firstGroupLetter(item.name);
      const arr = byLetter.get(key);
      if (arr) arr.push(item);
      else byLetter.set(key, [item]);
    }

    const sortedKeys = Array.from(byLetter.keys()).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b, 'ru', { sensitivity: 'base' });
    });

    return sortedKeys.map((key) => {
      const list = (byLetter.get(key) || []).slice().sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), 'ru', { sensitivity: 'base' }));
      return { id: `ltr:${key}`, title: key, items: list };
    });
  }, [filteredSorted]);

  return (
    <PublicLayout>
      <div className="space-y-8">
        <WondrousItemsListHeader query={query} onQueryChange={setQuery} />

        {error && <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div>}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : filteredSorted.length === 0 ? (
          <div className="text-slate-300">Ничего не найдено.</div>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <WondrousItemGroupSection key={group.id} title={group.title} items={group.items} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
