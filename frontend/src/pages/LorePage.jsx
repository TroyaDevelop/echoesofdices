import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PublicLayout from '../components/PublicLayout.jsx';
import { loreAPI } from '../lib/api.js';
import { isRichHtmlDescription } from '../lib/richText.js';

const stripHtml = (value) => {
  return String(value || '')
    .replaceAll(/<[^>]*>/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
};

const buildPreview = (article) => {
  if (!article) return '';
  const excerpt = String(article.excerpt || '').trim();
  if (excerpt) return excerpt;
  const content = String(article.content || '').trim();
  if (!content) return '';
  const raw = isRichHtmlDescription(content) ? stripHtml(content) : content;
  if (!raw) return '';
  return raw.length > 320 ? `${raw.slice(0, 320).trim()}…` : raw;
};

const toYear = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const parseLocations = (value) => {
  return String(value || '')
    .split(',')
    .map((item) => String(item || '').trim())
    .filter(Boolean);
};

const normalizeKey = (value) => String(value || '').trim().toLowerCase();

export default function LorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [yearIndex, setYearIndex] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationValue, setLocationValue] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [data, locationsData] = await Promise.all([
        loreAPI.list(),
        loreAPI.listLocations().catch(() => []),
      ]);
      setItems(Array.isArray(data) ? data : []);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки лора');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = useMemo(() => {
    return (items || []).map((article) => ({
      ...article,
      preview: buildPreview(article),
      yearValue: toYear(article.year),
      locationsList: parseLocations(article.locations),
      locationsKeyList: parseLocations(article.locations).map(normalizeKey),
    }));
  }, [items]);

  const years = useMemo(() => {
    const values = new Set();
    for (const item of cards) {
      if (item.yearValue !== null) values.add(item.yearValue);
    }
    return Array.from(values).sort((a, b) => a - b);
  }, [cards]);

  const minYear = years.length > 0 ? years[0] : null;
  const maxYear = years.length > 0 ? years[years.length - 1] : null;
  const selectedYear = yearIndex === null ? null : years[yearIndex] ?? null;

  useEffect(() => {
    if (years.length === 0) {
      setYearIndex(null);
      return;
    }
    setYearIndex((prev) => {
      if (prev === null || prev < 0 || prev >= years.length) return years.length - 1;
      return prev;
    });
  }, [years]);

  const locationCounts = useMemo(() => {
    const map = new Map();
    for (const card of cards) {
      for (const loc of card.locationsList) {
        const key = normalizeKey(loc);
        if (!key) continue;
        map.set(key, (map.get(key) || { name: loc, count: 0 }));
        const entry = map.get(key);
        entry.count += 1;
        if (!entry.name && loc) entry.name = loc;
      }
    }
    return map;
  }, [cards]);

  const locationOptions = useMemo(() => {
    const result = [];
    const used = new Set();
    for (const loc of locations) {
      const name = String(loc?.name || '').trim();
      const key = normalizeKey(name);
      if (!name || !locationCounts.has(key)) continue;
      result.push(name);
      used.add(key);
    }
    for (const [key, entry] of locationCounts.entries()) {
      if (!used.has(key) && entry?.name) result.push(entry.name);
    }
    return result.sort((a, b) => a.localeCompare(b, 'ru'));
  }, [locations, locationCounts]);

  const visibleCards = useMemo(() => {
    const yearFiltered = selectedYear === null ? cards : cards.filter((article) => article.yearValue === selectedYear);
    if (!locationValue) return yearFiltered;
    const key = normalizeKey(locationValue);
    return yearFiltered.filter((article) => article.locationsKeyList.includes(key));
  }, [cards, selectedYear, locationValue]);

  return (
    <PublicLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Lore</h1>
          <p className="mt-2 text-slate-300">Хроника событий и ключевые вехи мира.</p>
        </div>

        {years.length > 0 || locationOptions.length > 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 space-y-3">
            {years.length > 0 ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-400">Фильтр по году</div>
                    <div className="text-base font-semibold text-slate-100">{selectedYear}</div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {minYear} — {maxYear}
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, years.length - 1)}
                  step={1}
                  value={yearIndex ?? 0}
                  onChange={(e) => setYearIndex(Number(e.target.value))}
                  className="mt-2 w-full h-1 accent-purple-400"
                />
              </div>
            ) : null}

            {locationOptions.length > 0 ? (
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-[11px] uppercase tracking-wide text-slate-400">Места действия</label>
                <select
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  className="min-w-[12rem] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Все места</option>
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        ) : null}

        {error && <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div>}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : visibleCards.length === 0 ? (
          <div className="text-slate-300">Пока нет записей для выбранного года.</div>
        ) : (
          <div className="space-y-4">
            {visibleCards.map((article) => (
              <article
                key={article.id || article.slug}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold">{article.title}</h2>
                  <div className="flex items-center gap-2">
                    {article.yearValue !== null ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-200">
                        {article.yearValue}
                      </span>
                    ) : null}
                    {article.locationsList.length > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-200">
                        {article.locationsList.join(', ')}
                      </span>
                    ) : null}
                  </div>
                </div>
                {article.preview ? (
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{article.preview}</p>
                ) : null}
                <div className="mt-3">
                  <Link
                    to={`/lore/${article.slug}`}
                    className="text-sm font-semibold text-purple-200 underline hover:text-purple-100"
                  >
                    Читать далее
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
