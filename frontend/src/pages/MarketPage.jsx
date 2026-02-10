import { useEffect, useMemo, useState } from 'react';
import PublicLayout from '../components/PublicLayout.jsx';
import { marketAPI, userProfileAPI } from '../lib/api.js';
import MarketFilters from '../components/market/MarketFilters.jsx';
import MarketCategoryGroup from '../components/market/MarketCategoryGroup.jsx';
import MarketAutoTradeModal from '../components/market/MarketAutoTradeModal.jsx';

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

const toSkillValue = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const v = Math.trunc(n);
  if (v < 0 || v > 2) return 0;
  return v;
};

const abilityMod = (score) => {
  const n = Number(score);
  if (!Number.isFinite(n)) return 0;
  return Math.floor((n - 10) / 2);
};

const proficiencyBonusForLevel = (level) => {
  const n = Number(level);
  if (!Number.isFinite(n)) return 2;
  if (n >= 17) return 6;
  if (n >= 13) return 5;
  if (n >= 9) return 4;
  if (n >= 5) return 3;
  return 2;
};


const toCoins = (totalCp) => {
  const t = Math.max(0, Math.trunc(Number(totalCp || 0)));
  const gp = Math.floor(t / 100);
  const sp = Math.floor((t % 100) / 10);
  const cp = t % 10;
  return { gp, sp, cp };
};

const formatCoinsShort = (totalCp) => {
  const { gp, sp, cp } = toCoins(totalCp);
  const parts = [];
  if (gp) parts.push(`${gp}з`);
  if (sp) parts.push(`${sp}с`);
  if (cp || parts.length === 0) parts.push(`${cp}м`);
  return parts.join(' ');
};

const formatLogTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const parseExtraDice = (value) => {
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const rollModeLabel = (value) => {
  if (value === 'adv') return 'преим.';
  if (value === 'dis') return 'помех.';
  return '';
};

export default function MarketPage() {
  const [items, setItems] = useState([]);
  const [regions, setRegions] = useState([]);
  const [markups, setMarkups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('market');
  const [filterCategory, setFilterCategory] = useState('');
  const [regionId, setRegionId] = useState('');
  const [season, setSeason] = useState('spring_summer');
  const [openInfoId, setOpenInfoId] = useState(null);
  const [showMarkup, setShowMarkup] = useState(true);
  const [tradeContext, setTradeContext] = useState(null);
  const [tradeLogs, setTradeLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return Boolean(localStorage.getItem('token'));
    } catch {
      return false;
    }
  });
  const [userRole, setUserRole] = useState('');

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
    const loadUser = () => {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) {
          setUserRole('');
          return;
        }
        const parsed = JSON.parse(raw);
        setUserRole(String(parsed?.role || '').toLowerCase());
      } catch {
        setUserRole('');
      }
    };

    loadUser();
    const onAuthChange = () => loadUser();
    window.addEventListener('auth:login', onAuthChange);
    window.addEventListener('auth:logout', onAuthChange);
    return () => {
      window.removeEventListener('auth:login', onAuthChange);
      window.removeEventListener('auth:logout', onAuthChange);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const token = localStorage.getItem('token');
    if (!token) {
      setProfile(null);
      setIsAuthenticated(false);
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        const data = await userProfileAPI.get();
        if (!active) return;
        setProfile(data || null);
        setIsAuthenticated(true);
      } catch (e) {
        if (!active) return;
        setProfile(null);
        setIsAuthenticated(false);
      }
    })();

    return () => {
      active = false;
    };
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

  const isAdmin = useMemo(() => userRole === 'editor' || userRole === 'admin', [userRole]);

  useEffect(() => {
    if (!isAdmin && viewTab === 'logs') {
      setViewTab('market');
    }
  }, [isAdmin, viewTab]);

  const skillOptions = useMemo(() => {
    const level = profile?.character_level ?? 1;
    const bonus = proficiencyBonusForLevel(level);
    const chaMod = abilityMod(profile?.charisma ?? 10);
    const makeOption = (id, label, value) => {
      const prof = toSkillValue(value);
      const skillBonus = chaMod + bonus * (prof === 2 ? 2 : prof);
      return {
        id,
        label,
        bonus: skillBonus,
      };
    };

    if (!profile) {
      return [{ id: 'none', label: 'Без навыка', bonus: 0 }];
    }

    return [
      makeOption('persuasion', 'Убеждение', profile?.skill_persuasion),
      makeOption('performance', 'Выступление', profile?.skill_performance),
      makeOption('intimidation', 'Запугивание', profile?.skill_intimidation),
      makeOption('deception', 'Обман', profile?.skill_deception),
    ];
  }, [profile]);

  const handleOpenTrade = (item, percent) => {
    if (!showMarkup) return;
    setTradeContext({
      item,
      percent: Number(percent || 0),
      markupPercent: Number(percent || 0),
      season,
      regionId: selectedRegion?.id ?? null,
      category: String(item?.category || ''),
    });
  };

  const handleTradeComplete = async (entry) => {
    if (!entry) return;
    try {
      const saved = await marketAPI.logTrade({
        item_id: entry.itemId,
        item_name: entry.itemName,
        trade_type: entry.tradeType,
        roll_mode: entry.rollMode,
        roll_alt: entry.rollAlt,
        season: entry.season,
        region_id: entry.regionId,
        category: entry.category,
        markup_percent: entry.markupPercent,
        base_cp: entry.baseCp,
        roll: entry.roll,
        bonus: entry.bonus,
        extra_bonus: entry.extraBonus,
        extra_dice: entry.extraDice ? JSON.stringify(entry.extraDice) : null,
        result: entry.result,
        percent_value: entry.percentValue,
        final_cp: entry.finalCp,
        skill_id: entry.skillId,
        skill_label: entry.skillLabel,
      });
      if (isAdmin) {
        setTradeLogs((prev) => [saved, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || viewTab !== 'logs') return;
    let active = true;

    (async () => {
      setLogsLoading(true);
      setLogsError('');
      try {
        const data = await marketAPI.listTradeLogs(300);
        if (!active) return;
        setTradeLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!active) return;
        console.error(e);
        setLogsError(e.message || 'Ошибка загрузки логов');
      } finally {
        if (!active) return;
        setLogsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthenticated, isAdmin, viewTab]);

  return (
    <PublicLayout>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Рынок</h1>
          </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewTab('market')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  viewTab === 'market'
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Рынок
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setViewTab('logs')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    viewTab === 'logs' ? 'bg-white/15 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Журнал сделок
                </button>
              ) : null}
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
        ) : viewTab === 'logs' ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-300">Журнал сделок</div>
              {logsError ? <div className="mt-3 text-red-200">{logsError}</div> : null}
              {logsLoading ? (
                <div className="mt-3 text-slate-400 text-sm">Загрузка…</div>
              ) : tradeLogs.length === 0 ? (
                <div className="mt-3 text-slate-400 text-sm">Сделок пока нет.</div>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm text-slate-200">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-white/10">
                        <th className="py-2 pr-4">Время</th>
                        <th className="py-2 pr-4">Тип</th>
                        <th className="py-2 pr-4">Предмет</th>
                        <th className="py-2 pr-4">Пользователь</th>
                        <th className="py-2 pr-4">База</th>
                        <th className="py-2 pr-4">Бросок</th>
                        <th className="py-2 pr-4">Итог</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradeLogs.map((log) => (
                        <tr key={log.id} className="border-b border-white/5">
                          <td className="py-2 pr-4 text-slate-300 whitespace-nowrap">
                            {formatLogTime(log.created_at || log.createdAt)}
                          </td>
                          <td className="py-2 pr-4 whitespace-nowrap">
                            {log.trade_type === 'buy' ? 'Покупка' : 'Продажа'}
                          </td>
                          <td className="py-2 pr-4">{log.item_name || log.itemName}</td>
                          <td className="py-2 pr-4 whitespace-nowrap">
                            {(log.user_nickname || log.user_login || '').trim() || '—'}
                          </td>
                          <td className="py-2 pr-4 whitespace-nowrap">{formatCoinsShort(log.base_cp ?? log.baseCp)}</td>
                             <td className="py-2 pr-4 whitespace-nowrap">
                               {log.roll}
                               {log.roll_alt ? ` / ${log.roll_alt}` : ''}
                               {rollModeLabel(log.roll_mode) ? ` (${rollModeLabel(log.roll_mode)})` : ''}
                               {' + '}
                               {log.bonus}
                               {log.extra_bonus ? ` + ${log.extra_bonus}` : ''} = {log.result}
                              {parseExtraDice(log.extra_dice).length ? (
                                <span className="ml-2 text-[11px] text-slate-400">
                                  {parseExtraDice(log.extra_dice)
                                    .map((die) => `${die.source || 'Доп. куб'}: к${die.sides} (${die.value})`)
                                    .join(' · ')}
                                </span>
                              ) : null}
                          </td>
                          <td className="py-2 pr-4 whitespace-nowrap">{formatCoinsShort(log.final_cp ?? log.finalCp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
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
                    onTrade={isAuthenticated ? handleOpenTrade : undefined}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <MarketAutoTradeModal
        item={tradeContext?.item}
        percent={tradeContext?.percent}
        isOpen={Boolean(tradeContext)}
        onClose={() => setTradeContext(null)}
        onTradeComplete={handleTradeComplete}
        skillOptions={skillOptions}
        tradeContext={tradeContext}
      />
    </PublicLayout>
  );
}
