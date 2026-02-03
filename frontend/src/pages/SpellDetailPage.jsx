import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { spellsAPI } from '../lib/api.js';

const field = (v) => {
  const s = String(v ?? '').trim();
  return s ? s : '—';
};

const levelLine = (level, school) => {
  const lvl = Number(level);
  const parts = [];
  if (Number.isFinite(lvl)) parts.push(`${lvl} уровень`);
  if (school) parts.push(String(school));
  return parts.join(', ');
};

export default function SpellDetailPage() {
  const { id } = useParams();

  const [spell, setSpell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await spellsAPI.getById(id);
        if (!isActive) return;
        setSpell(data);
      } catch (e) {
        if (!isActive) return;
        console.error(e);
        setError(e.message || 'Ошибка загрузки заклинания');
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [id]);

  const title = useMemo(() => {
    if (!spell) return '';
    const base = String(spell.name || '').trim();
    const en = String(spell.name_en || '').trim();
    return en ? `${base} [${en}]` : base;
  }, [spell]);

  const theme = useMemo(() => {
    const raw = String(spell?.theme || 'none').trim().toLowerCase();
    const allowed = new Set([
      'none',
      'fire',
      'cold',
      'lightning',
      'acid',
      'poison',
      'necrotic',
      'radiant',
      'psychic',
      'force',
      'thunder',
    ]);
    return allowed.has(raw) ? raw : 'none';
  }, [spell]);

  return (
    <div className={`min-h-screen spell-page spell-page--${theme} px-3 py-3 sm:px-6 sm:py-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link to="/spells" className="text-sm text-slate-300 hover:text-white transition-colors">
            ← К списку
          </Link>

          <button
            type="button"
            className="w-9 h-9 rounded-md bg-emerald-200/20 border border-emerald-200/30 text-emerald-100 hover:bg-emerald-200/30 transition-colors"
            aria-label="Меню"
            title="Меню"
          >
            ⋮
          </button>
        </div>

        {error && (
          <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : !spell ? (
          <div className="text-slate-300">Заклинание не найдено.</div>
        ) : (
          <div className="parchment-card rounded-lg border border-black/20 text-slate-900 shadow-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-3 border-b border-black/10">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-semibold leading-tight break-words">
                    {title || 'Без названия'}
                  </h1>
                  <div className="mt-1 text-sm text-slate-700 italic">
                    {levelLine(spell.level, spell.school) || '—'}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {spell.source_pages ? (
                    <span className="text-xs text-slate-700 italic">{String(spell.source_pages)}</span>
                  ) : null}
                  {spell.source ? (
                    <span className="text-xs text-slate-700 italic">{String(spell.source)}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-3 space-y-1 text-[15px]">
              <div>
                <span className="font-semibold">Время накладывания:</span> {field(spell.casting_time)}
              </div>
              <div>
                <span className="font-semibold">Дистанция:</span> {field(spell.range_text)}
              </div>
              <div>
                <span className="font-semibold">Компоненты:</span> {field(spell.components)}
              </div>
              <div>
                <span className="font-semibold">Длительность:</span> {field(spell.duration)}
              </div>
              <div>
                <span className="font-semibold">Классы:</span> {field(spell.classes)}
              </div>
              <div>
                <span className="font-semibold">Подклассы:</span> {field(spell.subclasses)}
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4">
              <div className="h-px bg-black/10 mb-3" />
              <div className="whitespace-pre-wrap leading-relaxed">
                {spell.description ? String(spell.description) : '—'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
