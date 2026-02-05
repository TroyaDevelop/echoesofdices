import { useEffect, useMemo, useState } from 'react';
import PublicLayout from '../components/PublicLayout.jsx';
import { marketAPI } from '../lib/api.js';

const MARKET_CATEGORIES = [
  { value: 'nonmetal_weapon_armor', label: 'Неметаллическое оружие и броня' },
  { value: 'food_plant', label: 'Еда растительная' },
  { value: 'food_meat', label: 'Еда мясная' },
  { value: 'metal_weapon_armor', label: 'Металлическое оружие и броня' },
  { value: 'vehicles', label: 'Транспортные средства' },
  { value: 'draft_animals', label: 'Тягловые животные' },
  { value: 'riding_animals', label: 'Верховые животные' },
  { value: 'nonmetal_goods', label: 'Неметаллические изделия' },
  { value: 'metal_goods', label: 'Металлические изделия' },
  { value: 'textile_goods', label: 'Текстильные изделия' },
  { value: 'tools', label: 'Инструменты' },
  { value: 'complex_goods', label: 'Сложные изделия' },
  { value: 'magic_goods', label: 'Магические изделия' },
  { value: 'jewelry_goods', label: 'Ювелирные изделия' },
  { value: 'alchemy_goods_ingredients', label: 'Алхимические изделия и ингредиенты' },
];

const MARKET_SEASONS = [
  { value: 'spring_summer', label: 'Весна-лето' },
  { value: 'autumn_winter', label: 'Осень-зима' },
];

const darkSelectOptionStyle = { backgroundColor: '#0b1220', color: '#e2e8f0' };

const categoryLabel = (value) => MARKET_CATEGORIES.find((c) => c.value === value)?.label || '';

const formatPrice = (item) => {
  const gp = Number(item?.price_gp || 0);
  const sp = Number(item?.price_sp || 0);
  const cp = Number(item?.price_cp || 0);
  return { gp, sp, cp };
};

const toCopper = ({ gp, sp, cp }) => {
  const g = Number(gp || 0);
  const s = Number(sp || 0);
  const c = Number(cp || 0);
  return g * 100 + s * 10 + c;
};

const fromCopper = (totalCp) => {
  const t = Math.max(0, Math.trunc(Number(totalCp || 0)));
  const gp = Math.floor(t / 100);
  const sp = Math.floor((t % 100) / 10);
  const cp = t % 10;
  return { gp, sp, cp };
};

const applyMarkupPercent = (baseCp, percent) => {
  const b = Math.max(0, Math.trunc(Number(baseCp || 0)));
  const p = Number(percent || 0);
  if (!Number.isFinite(p) || p === 0) return b;
  return Math.round((b * (100 + p)) / 100);
};

const Coin = ({ label, value, className }) => {
  if (!value) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${className}`}>
      <span>{value}</span>
      <span className="opacity-90">{label}</span>
    </span>
  );
};

const supportsCombatFields = (category) => {
  return category === 'nonmetal_weapon_armor' || category === 'metal_weapon_armor';
};

const WEAPON_TYPES = [
  { value: 'simple_melee', label: 'Простое рукопашное' },
  { value: 'simple_ranged', label: 'Простое дальнобойное' },
  { value: 'martial_melee', label: 'Воинское рукопашное' },
  { value: 'martial_ranged', label: 'Воинское дальнобойное' },
];

const weaponTypeLabel = (value) => WEAPON_TYPES.find((t) => t.value === value)?.label || '';

const FinalPriceLine = ({ item, percent }) => {
  const base = formatPrice(item);
  const baseCp = toCopper(base);
  if (!baseCp) return <span className="text-xs text-slate-400">Цена: —</span>;

  const totalCp = applyMarkupPercent(baseCp, percent);
  const total = fromCopper(totalCp);
  const p = Number(percent || 0);
  const showPercent = Number.isFinite(p) && p !== 0;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-[11px] text-slate-400">Цена</div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <Coin label="З" value={total.gp} className="bg-amber-500/25 text-amber-200 border border-amber-500/30" />
        <Coin label="С" value={total.sp} className="bg-slate-400/20 text-slate-100 border border-white/15" />
        <Coin label="М" value={total.cp} className="bg-orange-500/20 text-orange-200 border border-orange-500/30" />
        {showPercent ? <span className="text-xs font-semibold text-emerald-300 whitespace-nowrap">+{Math.trunc(p)}%</span> : null}
      </div>
    </div>
  );
};

export default function MarketPage() {
  const [items, setItems] = useState([]);
  const [regions, setRegions] = useState([]);
  const [markups, setMarkups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [regionId, setRegionId] = useState('');
  const [season, setSeason] = useState('spring_summer');
  const [openInfoId, setOpenInfoId] = useState(null);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [itemsData, regionsData, markupsData] = await Promise.all([
        marketAPI.list(),
        marketAPI.listRegions(),
        marketAPI.listMarkups(season),
      ]);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setRegions(Array.isArray(regionsData) ? regionsData : []);
      setMarkups(Array.isArray(markupsData) ? markupsData : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки рынка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await marketAPI.listMarkups(season);
        if (cancelled) return;
        setMarkups(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (cancelled) return;
        setError(e.message || 'Ошибка загрузки наценок');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [season]);

  const filteredItems = useMemo(() => {
    const fc = String(filterCategory || '').trim();

    return items.filter((it) => {
      const itCat = String(it?.category || '');
      if (fc && itCat !== fc) return false;

      return true;
    });
  }, [items, filterCategory]);

  const groupedByCategory = useMemo(() => {
    const fc = String(filterCategory || '').trim();
    if (fc) return [];

    const groups = new Map(MARKET_CATEGORIES.map((c) => [c.value, []]));
    for (const it of filteredItems) {
      const cat = String(it?.category || '');
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(it);
    }

    const sortByName = (a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'ru');

    return MARKET_CATEGORIES.map((c) => {
      const list = (groups.get(c.value) || []).slice().sort(sortByName);
      return { ...c, items: list };
    }).filter((g) => g.items.length > 0);
  }, [filteredItems, filterCategory]);

  const sortedRegions = useMemo(() => {
    return [...regions].slice().sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'ru'));
  }, [regions]);

  useEffect(() => {
    if (regionId) return;
    if (!sortedRegions.length) return;
    setRegionId(String(sortedRegions[0].id));
  }, [sortedRegions, regionId]);

  const selectedRegion = useMemo(() => {
    const rid = String(regionId || '');
    if (!rid) return null;
    return sortedRegions.find((r) => String(r?.id) === rid) || null;
  }, [sortedRegions, regionId]);

  const markupMap = useMemo(() => {
    const map = new Map();
    for (const m of markups) {
      const rid = String(m?.region_id || '');
      const cat = String(m?.category || '');
      if (!rid || !cat) continue;
      map.set(`${rid}:${cat}`, Number(m?.markup_percent || 0));
    }
    return map;
  }, [markups]);

  return (
    <PublicLayout>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Рынок</h1>
          </div>

          <div className="w-full sm:w-[34rem] flex flex-col sm:flex-row gap-3">
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full sm:w-72 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {sortedRegions.length === 0 ? (
                <option value="" style={darkSelectOptionStyle}>
                  Регионы не настроены
                </option>
              ) : null}
              {sortedRegions.map((r) => (
                <option key={r.id} value={String(r.id)} style={darkSelectOptionStyle}>
                  {r.name}
                </option>
              ))}
            </select>

            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full sm:w-56 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {MARKET_SEASONS.map((s) => (
                <option key={s.value} value={s.value} style={darkSelectOptionStyle}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full sm:w-72 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" style={darkSelectOptionStyle}>
                Все категории
              </option>
              {MARKET_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} style={darkSelectOptionStyle}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* поиск убран: фильтров достаточно */}
          </div>
        </div>

        {error ? <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div> : null}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : sortedRegions.length === 0 ? (
          <div className="text-slate-300">Регионы пока не настроены.</div>
        ) : !selectedRegion ? (
          <div className="text-slate-300">Выберите регион.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h2 className="text-2xl font-semibold">{selectedRegion.name}</h2>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-slate-300">Пока нет предметов.</div>
            ) : (
              <>
                {(String(filterCategory || '').trim() ? [{ value: String(filterCategory), label: categoryLabel(filterCategory), items: filteredItems }] : groupedByCategory).map(
                  (group) => (
                    <div key={group.value} className="space-y-3">
                      {String(filterCategory || '').trim() ? null : (
                        <div className="flex items-baseline justify-between gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold">{group.label}</h3>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {group.items.map((it) => {
                  const percent = markupMap.get(`${String(selectedRegion.id)}:${String(it?.category || '')}`) ?? 0;
                  const hasInfo = Boolean(String(it?.short_description || '').trim());
                  const isOpen = String(openInfoId || '') === String(it.id);

                  const combat = supportsCombatFields(String(it?.category || ''));
                  const damage = String(it?.damage || '').trim();
                  const armorClass = String(it?.armor_class || '').trim();
                  const weaponType = String(it?.weapon_type || '').trim();
                  const weaponTypeText = weaponTypeLabel(weaponType);
                  const showCombat = combat && (damage || armorClass);
                  const showWeaponType = Boolean(damage && weaponTypeText);

                  return (
                    <div
                      key={it.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between min-h-[150px] relative"
                      tabIndex={hasInfo ? 0 : undefined}
                      role={hasInfo ? 'button' : undefined}
                      onMouseEnter={hasInfo ? () => setOpenInfoId(it.id) : undefined}
                      onMouseLeave={hasInfo ? () => setOpenInfoId(null) : undefined}
                      onClick={hasInfo ? () => setOpenInfoId((prev) => (String(prev) === String(it.id) ? null : it.id)) : undefined}
                      onKeyDown={
                        hasInfo
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setOpenInfoId((prev) => (String(prev) === String(it.id) ? null : it.id));
                              }
                            }
                          : undefined
                      }
                    >
                      <div className="min-w-0">
                        <div className="text-base font-semibold leading-snug break-words">{it.name}</div>
                        {it.category ? <div className="mt-1 text-xs text-slate-400 break-words">{categoryLabel(it.category)}</div> : null}

                        {showCombat ? (
                          <div className="mt-2 space-y-1">
                            {damage ? <div className="text-xs text-slate-200">Урон: <span className="text-slate-100 font-semibold">{damage}</span></div> : null}
                            {armorClass ? (
                              <div className="text-xs text-slate-200">КД: <span className="text-slate-100 font-semibold">{armorClass}</span></div>
                            ) : null}
                            {showWeaponType ? (
                              <div className="text-xs text-slate-200">Тип: <span className="text-slate-100 font-semibold">{weaponTypeText}</span></div>
                            ) : null}
                          </div>
                        ) : null}

                        {hasInfo ? (
                          <div
                            aria-hidden={!isOpen}
                            className={
                              `absolute z-30 left-3 right-3 bottom-full mb-2 ` +
                              `sm:left-auto sm:right-full sm:mr-3 sm:top-3 sm:bottom-auto sm:mb-0 sm:w-80 sm:max-w-[30rem] ` +
                              `rounded-xl border border-white/15 bg-slate-950/95 backdrop-blur px-3 py-2 shadow-xl ` +
                              `transition-all duration-200 ease-out will-change-transform ` +
                              (isOpen
                                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                                : 'opacity-0 translate-y-1 scale-[0.98] pointer-events-none')
                            }
                          >
                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Описание</div>
                            <div className="mt-1 text-sm text-slate-100 whitespace-pre-wrap break-words">
                              {String(it.short_description || '').trim()}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-4">
                        <FinalPriceLine item={it} percent={Number(percent || 0)} />
                      </div>
                    </div>
                  );
                        })}
                      </div>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
