import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { bestiaryAPI } from '../lib/api.js';
import SpellHeader from '../components/spells/SpellHeader.jsx';
import SpellDescription from '../components/spells/SpellDescription.jsx';
import { isRichHtmlDescription, plainTextToHtml } from '../lib/richText.js';

const normalize = (v) => String(v || '').trim();

const abilityMod = (score) => {
  const num = Number(score);
  if (!Number.isFinite(num)) return null;
  return Math.floor((num - 10) / 2);
};

const abilityString = (score) => {
  const num = Number(score);
  if (!Number.isFinite(num)) return '—';
  const mod = abilityMod(num);
  const sign = mod >= 0 ? '+' : '';
  return `${num} (${sign}${mod})`;
};

function MetaLine({ label, value }) {
  const text = normalize(value);
  if (!text) return null;
  return (
    <div className="leading-snug">
      <span className="font-semibold">{label}</span> {text}
    </div>
  );
}

function Section({ title, content }) {
  const text = normalize(content);
  if (!text) return null;
  const renderedContent = isRichHtmlDescription(text) ? text : plainTextToHtml(text);

  return (
    <div className="mt-2">
      <div className="text-xl font-semibold uppercase text-red-900/90">— {title} —</div>
      <div className="mt-1 bestiary-section-content">
        <SpellDescription description={renderedContent} />
      </div>
    </div>
  );
}

export default function BestiaryDetailPage() {
  const { id } = useParams();
  const [monster, setMonster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await bestiaryAPI.getById(id);
        if (!isActive) return;
        setMonster(data || null);
      } catch (e) {
        if (!isActive) return;
        console.error(e);
        setError(e.message || 'Ошибка загрузки монстра');
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
    const base = normalize(monster?.name);
    const en = normalize(monster?.name_en);
    if (!base) return '';
    return en ? `${base} [${en}]` : base;
  }, [monster]);

  const subtitle = useMemo(() => {
    return [normalize(monster?.size), normalize(monster?.creature_type), normalize(monster?.alignment)]
      .filter(Boolean)
      .join(', ');
  }, [monster]);

  return (
    <div className="min-h-screen spell-page spell-page--none px-3 py-3 sm:px-6 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link to="/bestiary" className="text-sm text-slate-300 hover:text-white transition-colors">
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

        {error && <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">{error}</div>}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : !monster ? (
          <div className="text-slate-300">Монстр не найден.</div>
        ) : (
          <div className="parchment-card rounded-lg border border-black/20 text-slate-900 shadow-2xl overflow-hidden">
            <SpellHeader
              title={title}
              subtitle={subtitle}
              sourceText={monster?.source}
              sourcePages={monster?.source_pages}
              hasEotDescription={false}
              showEot={false}
            />

            <div className="px-4 sm:px-6 py-4 space-y-2">
              <MetaLine label="Класс доспеха" value={monster?.armor_class} />
              <MetaLine label="Хиты" value={monster?.hit_points} />
              <MetaLine label="Скорость" value={monster?.speed} />

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2">
                {[
                  ['Сил', abilityString(monster?.strength)],
                  ['Лов', abilityString(monster?.dexterity)],
                  ['Тел', abilityString(monster?.constitution)],
                  ['Инт', abilityString(monster?.intelligence)],
                  ['Мдр', abilityString(monster?.wisdom)],
                  ['Хар', abilityString(monster?.charisma)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-black/10 bg-black/5 px-2 py-1 text-center">
                    <div className="font-semibold text-sm">{label}</div>
                    <div className="text-sm">{value}</div>
                  </div>
                ))}
              </div>

              <MetaLine label="Спасброски" value={monster?.saving_throws} />
              <MetaLine label="Навыки" value={monster?.skills} />
              <MetaLine label="Уязвимости к урону" value={monster?.damage_vulnerabilities} />
              <MetaLine label="Сопротивления урону" value={monster?.damage_resistances} />
              <MetaLine label="Иммунитеты к урону" value={monster?.damage_immunities} />
              <MetaLine label="Иммунитеты к состояниям" value={monster?.condition_immunities} />
              <MetaLine label="Чувства" value={monster?.senses} />
              <MetaLine label="Языки" value={monster?.languages} />
              <MetaLine label="Среда обитания" value={monster?.habitat} />
              <MetaLine label="Опасность" value={monster?.challenge_rating} />
              <MetaLine label="Бонус мастерства" value={monster?.proficiency_bonus} />

              <Section title="Особенности" content={monster?.traits_text} />
              <Section title="Действия" content={monster?.actions_text} />
              <Section title="Реакции" content={monster?.reactions_text} />
              <Section title="Легендарные действия" content={monster?.legendary_actions_text} />
              <Section title="Использование заклинаний" content={monster?.spellcasting_text} />
              <Section title="Злодейские действия" content={monster?.villain_actions_text} />
              <Section title="Описание" content={monster?.description} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}