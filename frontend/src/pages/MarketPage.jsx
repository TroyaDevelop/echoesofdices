import { useEffect, useMemo, useState } from 'react';
import PublicLayout from '../components/PublicLayout.jsx';
import { marketAPI } from '../lib/api.js';
import MarketFilters from '../components/market/MarketFilters.jsx';
import MarketCategoryGroup from '../components/market/MarketCategoryGroup.jsx';

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

const categoryLabel = (value) => MARKET_CATEGORIES.find((c) => c.value === value)?.label || '';

const supportsCombatFields = (category) => {
  return category === 'nonmetal_weapon_armor' || category === 'metal_weapon_armor';
};

const WEAPON_TYPES = [
  { value: 'simple_melee', label: 'Простое рукопашное' },
  { value: 'simple_ranged', label: 'Простое дальнобойное' },
  { value: 'martial_melee', label: 'Воинское рукопашное' },
  { value: 'martial_ranged', label: 'Воинское дальнобойное' },
];

const ARMOR_TYPES = [
  { value: 'light', label: 'Легкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'heavy', label: 'Тяжелый' },
];

const weaponTypeLabel = (value) => WEAPON_TYPES.find((t) => t.value === value)?.label || '';
const armorTypeLabel = (value) => ARMOR_TYPES.find((t) => t.value === value)?.label || '';


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
  const [showMarkup, setShowMarkup] = useState(true);

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
    if (!showMarkup) return;
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
  }, [season, showMarkup]);

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
    if (!showMarkup) return;
    if (regionId) return;
    if (!sortedRegions.length) return;
    setRegionId(String(sortedRegions[0].id));
  }, [sortedRegions, regionId, showMarkup]);

  const selectedRegion = useMemo(() => {
    if (!showMarkup) return null;
    const rid = String(regionId || '');
    if (!rid) return null;
    return sortedRegions.find((r) => String(r?.id) === rid) || null;
  }, [sortedRegions, regionId, showMarkup]);

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
            <MarketFilters
              regions={sortedRegions}
              regionId={regionId}
              onRegionChange={setRegionId}
              season={season}
              onSeasonChange={setSeason}
              showMarkup={showMarkup}
              onShowMarkupChange={setShowMarkup}
              filterCategory={filterCategory}
              onCategoryChange={setFilterCategory}
              categories={MARKET_CATEGORIES}
              seasons={MARKET_SEASONS}
            />
          </div>
        </div>

        {error ? <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div> : null}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : showMarkup && sortedRegions.length === 0 ? (
          <div className="text-slate-300">Регионы пока не настроены.</div>
        ) : showMarkup && !selectedRegion ? (
          <div className="text-slate-300">Выберите регион.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              {showMarkup && selectedRegion ? (
                <h2 className="text-2xl font-semibold">{selectedRegion.name}</h2>
              ) : null}
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-slate-300">Пока нет предметов.</div>
            ) : (
              <>
                {(String(filterCategory || '').trim()
                  ? [{ value: String(filterCategory), label: categoryLabel(filterCategory), items: filteredItems }]
                  : groupedByCategory
                ).map((group) => (
                  <MarketCategoryGroup
                    key={group.value}
                    group={group}
                    showTitle={!String(filterCategory || '').trim()}
                    regionId={selectedRegion?.id}
                    markupMap={markupMap}
                    categoryLabel={categoryLabel}
                    supportsCombatFields={supportsCombatFields}
                    weaponTypeLabel={weaponTypeLabel}
                    armorTypeLabel={armorTypeLabel}
                    showMarkup={showMarkup}
                    openInfoId={openInfoId}
                    setOpenInfoId={setOpenInfoId}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
