import { useEffect, useMemo, useState } from 'react';
import PublicLayout from '../components/PublicLayout.jsx';
import { bestiaryAPI, sourcesAPI } from '../lib/api.js';
import BestiaryListHeader from '../components/bestiary/BestiaryListHeader.jsx';
import BestiaryGroupSection from '../components/bestiary/BestiaryGroupSection.jsx';

const normalize = (v) => String(v || '').trim();
const normalizeSource = (v) => normalize(v).toLowerCase();

const firstGroupLetter = (name) => {
  const n = normalize(name);
  if (!n) return '#';
  return n[0].toLocaleUpperCase('ru-RU');
};

export default function BestiaryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sourceOptions, setSourceOptions] = useState([]);
  const [sourceFilters, setSourceFilters] = useState([]);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [data, sourceData] = await Promise.all([bestiaryAPI.list(), sourcesAPI.list()]);
      setItems(Array.isArray(data) ? data : []);
      const fromApi = (Array.isArray(sourceData) ? sourceData : [])
        .map((item) => ({ value: normalizeSource(item?.name ?? item), label: normalize(item?.name ?? item) }))
        .filter((item) => item.value && item.label);
      const fromItems = (Array.isArray(data) ? data : [])
        .map((item) => ({ value: normalizeSource(item?.source), label: normalize(item?.source) }))
        .filter((item) => item.value && item.label);
      const merged = new Map();
      [...fromApi, ...fromItems].forEach((item) => {
        if (!merged.has(item.value)) merged.set(item.value, item.label);
      });
      setSourceOptions(
        Array.from(merged.entries())
          .map(([value, label]) => ({ value, label }))
          .sort((a, b) => a.label.localeCompare(b.label, 'ru', { sensitivity: 'base' }))
      );
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки бестиария');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredSorted = useMemo(() => {
    const q = normalize(query).toLowerCase();
    const sf = new Set((sourceFilters || []).map(normalizeSource).filter(Boolean));
    const filtered = (items || []).filter((item) => {
      if (q && !normalize(item.name).toLowerCase().includes(q)) return false;
      if (sf.size > 0) {
        const src = normalizeSource(item?.source);
        if (!sf.has(src)) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), 'ru', { sensitivity: 'base' }));
  }, [items, query, sourceFilters]);

  const toggleSourceFilter = (value) => {
    const key = normalizeSource(value);
    if (!key) return;
    setSourceFilters((prev) => {
      const exists = prev.includes(key);
      if (exists) return prev.filter((x) => x !== key);
      return [...prev, key];
    });
  };

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
      const list = (byLetter.get(key) || [])
        .slice()
        .sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), 'ru', { sensitivity: 'base' }));
      return { id: `ltr:${key}`, title: key, items: list };
    });
  }, [filteredSorted]);

  return (
    <PublicLayout>
      <div className="space-y-8">
        <BestiaryListHeader
          query={query}
          onQueryChange={setQuery}
          sourceOptions={sourceOptions}
          selectedSources={sourceFilters}
          onToggleSource={toggleSourceFilter}
          onClearSources={() => setSourceFilters([])}
        />

        {error && <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div>}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : filteredSorted.length === 0 ? (
          <div className="text-slate-300">Ничего не найдено.</div>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <BestiaryGroupSection key={group.id} title={group.title} items={group.items} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}