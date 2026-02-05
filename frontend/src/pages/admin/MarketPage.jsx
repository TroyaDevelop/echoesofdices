import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { marketAPI } from '../../lib/api.js';

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

const categoryLabel = (value) => MARKET_CATEGORIES.find((c) => c.value === value)?.label || '—';

const MARKET_SEASONS = [
  { value: 'spring_summer', label: 'Весна-лето' },
  { value: 'autumn_winter', label: 'Осень-зима' },
];

const toNonNegInt = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
};

const PricePreview = ({ gp, sp, cp }) => {
  const g = Number(gp || 0);
  const s = Number(sp || 0);
  const c = Number(cp || 0);
  const hasAny = g || s || c;
  if (!hasAny) return <span className="text-xs text-gray-500">Цена: —</span>;

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs">
      {g ? <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200">{g} З</span> : null}
      {s ? <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 border border-gray-200">{s} С</span> : null}
      {c ? <span className="px-2 py-1 rounded-md bg-orange-100 text-orange-800 border border-orange-200">{c} М</span> : null}
    </div>
  );
};

const supportsCombatFields = (category) => {
  return category === 'nonmetal_weapon_armor' || category === 'metal_weapon_armor';
};

export default function AdminMarketPage() {
  const [items, setItems] = useState([]);
  const [regions, setRegions] = useState([]);
  const [markups, setMarkups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterCategory, setFilterCategory] = useState('');

  const [regionName, setRegionName] = useState('');
  const [editingRegionId, setEditingRegionId] = useState(null);
  const [editRegionName, setEditRegionName] = useState('');

  const [markupRegionId, setMarkupRegionId] = useState('');
  const [markupSeason, setMarkupSeason] = useState('spring_summer');
  const [markupDraft, setMarkupDraft] = useState(() => Object.fromEntries(MARKET_CATEGORIES.map((c) => [c.value, '0'])));

  const [name, setName] = useState('');
  const [category, setCategory] = useState('food_plant');
  const [shortDescription, setShortDescription] = useState('');
  const [damage, setDamage] = useState('');
  const [armorClass, setArmorClass] = useState('');
  const [priceGp, setPriceGp] = useState('');
  const [priceSp, setPriceSp] = useState('');
  const [priceCp, setPriceCp] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('food_plant');
  const [editShortDescription, setEditShortDescription] = useState('');
  const [editDamage, setEditDamage] = useState('');
  const [editArmorClass, setEditArmorClass] = useState('');
  const [editPriceGp, setEditPriceGp] = useState('');
  const [editPriceSp, setEditPriceSp] = useState('');
  const [editPriceCp, setEditPriceCp] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [itemsData, regionsData, markupsData] = await Promise.all([
        marketAPI.listAdmin(),
        marketAPI.listRegionsAdmin(),
        marketAPI.listMarkupsAdmin(markupSeason),
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

  const loadMarkupsForSeason = async (season) => {
    setError('');
    try {
      const data = await marketAPI.listMarkupsAdmin(season);
      const next = Array.isArray(data) ? data : [];
      setMarkups(next);
      return next;
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки наценок');
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await loadMarkupsForSeason(markupSeason);
      if (cancelled) return;

      const rid = String(markupRegionId || '').trim();
      if (!rid || !Array.isArray(data)) return;

      const map = new Map();
      for (const m of data) {
        const mrid = String(m?.region_id || '');
        const cat = String(m?.category || '');
        if (!mrid || !cat) continue;
        map.set(`${mrid}:${cat}`, Number(m?.markup_percent || 0));
      }

      const nextDraft = {};
      for (const c of MARKET_CATEGORIES) {
        const v = map.get(`${rid}:${c.value}`);
        nextDraft[c.value] = String(Number.isFinite(v) ? v : 0);
      }
      setMarkupDraft(nextDraft);
    })();

    return () => {
      cancelled = true;
    };
  }, [markupSeason]);

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

  const filteredSorted = useMemo(() => {
    const c = String(filterCategory || '');
    const list = items.filter((it) => {
      if (c && String(it?.category || '') !== c) return false;
      return true;
    });

    return list.sort((a, b) => {
      return String(a?.name || '').localeCompare(String(b?.name || ''), 'ru');
    });
  }, [items, filterCategory]);

  const shouldScrollRegions = useMemo(() => regions.length > 4, [regions.length]);
  const shouldScrollItems = useMemo(() => filteredSorted.length > 8, [filteredSorted.length]);
  const shouldScrollMarkupCategories = useMemo(() => MARKET_CATEGORIES.length > 4, []);

  const resetCreate = () => {
    setName('');
    setCategory('food_plant');
    setShortDescription('');
    setDamage('');
    setArmorClass('');
    setPriceGp('');
    setPriceSp('');
    setPriceCp('');
  };

  const handleCreateRegion = async (e) => {
    e.preventDefault();
    setError('');
    const n = String(regionName || '').trim();
    if (!n) {
      setError('Заполните название региона');
      return;
    }

    try {
      await marketAPI.createRegion({ name: n });
      setRegionName('');
      await load();
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка добавления региона');
    }
  };

  const startEditRegion = (r) => {
    setEditingRegionId(r.id);
    setEditRegionName(String(r.name || ''));
  };

  const cancelEditRegion = () => {
    setEditingRegionId(null);
    setEditRegionName('');
  };

  const saveEditRegion = async (id) => {
    setError('');
    const n = String(editRegionName || '').trim();
    if (!n) {
      setError('Заполните название региона');
      return;
    }

    try {
      await marketAPI.updateRegion(id, { name: n });
      cancelEditRegion();
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка сохранения региона');
    }
  };

  const removeRegion = async (id) => {
    if (!confirm('Удалить регион?')) return;
    setError('');
    try {
      await marketAPI.removeRegion(id);
      if (String(markupRegionId) === String(id)) {
        setMarkupRegionId('');
        setMarkupDraft(Object.fromEntries(MARKET_CATEGORIES.map((c) => [c.value, '0'])));
      }
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления региона');
    }
  };

  const applyDraftFromRegion = (rid) => {
    const next = {};
    for (const c of MARKET_CATEGORIES) {
      const v = markupMap.get(`${rid}:${c.value}`);
      next[c.value] = String(Number.isFinite(v) ? v : 0);
    }
    setMarkupDraft(next);
  };

  const handleSelectMarkupRegion = (rid) => {
    setMarkupRegionId(rid);
    if (!rid) {
      setMarkupDraft(Object.fromEntries(MARKET_CATEGORIES.map((c) => [c.value, '0'])));
      return;
    }
    applyDraftFromRegion(rid);
  };

  const saveMarkups = async () => {
    setError('');
    const rid = String(markupRegionId || '').trim();
    if (!rid) {
      setError('Выберите регион для настройки наценок');
      return;
    }

    const payloads = [];
    for (const c of MARKET_CATEGORIES) {
      const raw = markupDraft?.[c.value];
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0 || n > 1000) {
        setError('Наценка должна быть числом от 0 до 1000');
        return;
      }
      payloads.push({ region_id: Number(rid), category: c.value, markup_percent: Math.trunc(n), season: markupSeason });
    }

    try {
      await Promise.all(payloads.map((p) => marketAPI.upsertMarkup(p)));
      const data = await loadMarkupsForSeason(markupSeason);
      if (Array.isArray(data)) {
        const map = new Map();
        for (const m of data) {
          const mrid = String(m?.region_id || '');
          const cat = String(m?.category || '');
          if (!mrid || !cat) continue;
          map.set(`${mrid}:${cat}`, Number(m?.markup_percent || 0));
        }

        const nextDraft = {};
        for (const c of MARKET_CATEGORIES) {
          const v = map.get(`${rid}:${c.value}`);
          nextDraft[c.value] = String(Number.isFinite(v) ? v : 0);
        }
        setMarkupDraft(nextDraft);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка сохранения наценок');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const n = String(name || '').trim();

    const gp = toNonNegInt(priceGp);
    const sp = toNonNegInt(priceSp);
    const cp = toNonNegInt(priceCp);

    if (!n) {
      setError('Заполните название');
      return;
    }
    if (gp === null || sp === null || cp === null) {
      setError('Цена должна быть неотрицательным числом');
      return;
    }

    const sd = String(shortDescription || '').trim();
    const d = String(damage || '').trim();
    const ac = String(armorClass || '').trim();

    const payload = {
      name: n,
      category,
      price_gp: gp,
      price_sp: sp,
      price_cp: cp,
      short_description: sd || null,
    };

    if (supportsCombatFields(category)) {
      payload.damage = d || null;
      payload.armor_class = ac || null;
    }

    try {
      await marketAPI.create(payload);
      resetCreate();
      await load();
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка добавления предмета');
    }
  };

  const startEdit = (it) => {
    setEditingId(it.id);
    setEditName(String(it.name || ''));
    setEditCategory(String(it.category || 'food_plant'));
    setEditShortDescription(String(it.short_description || ''));
    setEditDamage(String(it.damage || ''));
    setEditArmorClass(String(it.armor_class || ''));
    setEditPriceGp(String(it.price_gp ?? 0));
    setEditPriceSp(String(it.price_sp ?? 0));
    setEditPriceCp(String(it.price_cp ?? 0));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditCategory('food_plant');
    setEditShortDescription('');
    setEditDamage('');
    setEditArmorClass('');
    setEditPriceGp('');
    setEditPriceSp('');
    setEditPriceCp('');
  };

  const saveEdit = async (id) => {
    setError('');

    const n = String(editName || '').trim();

    const gp = toNonNegInt(editPriceGp);
    const sp = toNonNegInt(editPriceSp);
    const cp = toNonNegInt(editPriceCp);

    if (!n) {
      setError('Заполните название');
      return;
    }
    if (gp === null || sp === null || cp === null) {
      setError('Цена должна быть неотрицательным числом');
      return;
    }

    const sd = String(editShortDescription || '').trim();
    const d = String(editDamage || '').trim();
    const ac = String(editArmorClass || '').trim();

    const payload = {
      name: n,
      category: editCategory,
      price_gp: gp,
      price_sp: sp,
      price_cp: cp,
      short_description: sd || null,
    };

    if (supportsCombatFields(editCategory)) {
      payload.damage = d || null;
      payload.armor_class = ac || null;
    } else {
      payload.damage = null;
      payload.armor_class = null;
    }

    try {
      await marketAPI.update(id, payload);
      cancelEdit();
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка сохранения');
    }
  };

  const remove = async (id) => {
    if (!confirm('Удалить предмет?')) return;
    setError('');
    try {
      await marketAPI.remove(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления');
    }
  };

  const inputClass =
    'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Рынок</h1>
        </div>

        {error ? <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div> : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
              <div className="text-lg font-semibold text-gray-900">Регионы</div>

              <form onSubmit={handleCreateRegion} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={regionName} onChange={(e) => setRegionName(e.target.value)} placeholder="Регион" className={inputClass} />
                  <div className="flex items-center justify-end">
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium">
                      Добавить регион
                    </button>
                  </div>
                </div>
              </form>

              {regions.length === 0 ? (
                <div className="text-sm text-gray-600">Регионов пока нет.</div>
              ) : (
                <div className={shouldScrollRegions ? 'max-h-[15rem] overflow-y-auto pr-2' : ''}>
                  <div className="divide-y divide-gray-200">
                    {regions.map((r) => (
                      <div key={r.id} className="py-3 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{r.name}</div>

                          {editingRegionId === r.id ? (
                            <div className="mt-2 space-y-2">
                              <input value={editRegionName} onChange={(e) => setEditRegionName(e.target.value)} placeholder="Регион" className={inputClass} />
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => saveEditRegion(r.id)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-medium">
                                  Сохранить
                                </button>
                                <button type="button" onClick={cancelEditRegion} className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100">
                                  Отмена
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {editingRegionId === r.id ? null : (
                            <button onClick={() => startEditRegion(r)} className="text-gray-700 hover:text-gray-900 font-medium text-sm">
                              Редактировать
                            </button>
                          )}
                          <button onClick={() => removeRegion(r.id)} className="text-red-600 hover:text-red-900 font-medium text-sm">
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
              <div className="text-lg font-semibold text-gray-900">Наценки по категориям (регион × категория)</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div className="min-w-0">
                  <div className="text-xs text-gray-600 mb-1">Регион</div>
                  <select value={markupRegionId} onChange={(e) => handleSelectMarkupRegion(e.target.value)} className={inputClass}>
                    <option value="">Выберите регион…</option>
                    {regions.map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-600 mb-1">Сезон</div>
                  <select value={markupSeason} onChange={(e) => setMarkupSeason(e.target.value)} className={inputClass}>
                    {MARKET_SEASONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => (markupRegionId ? applyDraftFromRegion(String(markupRegionId)) : null)}
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                >
                  Сбросить
                </button>
                <button
                  type="button"
                  onClick={saveMarkups}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                >
                  Сохранить
                </button>
              </div>

              <div className={shouldScrollMarkupCategories ? 'max-h-[15rem] overflow-y-auto pr-2' : ''}>
                <div className="space-y-3">
                  {MARKET_CATEGORIES.map((c) => (
                    <div key={c.value} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                      <div className="text-sm text-gray-900">{c.label}</div>
                      <div className="flex items-center gap-2">
                        <input
                          value={markupDraft?.[c.value] ?? '0'}
                          onChange={(e) => setMarkupDraft((prev) => ({ ...prev, [c.value]: e.target.value }))}
                          inputMode="numeric"
                          placeholder="0"
                          className={inputClass}
                          disabled={!markupRegionId}
                        />
                        <div className="text-sm text-gray-600 whitespace-nowrap">%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!markupRegionId ? <div className="text-xs text-gray-500">Выберите регион, чтобы настроить наценки.</div> : null}
            </div>
          </div>

          <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-sm border p-4 space-y-4 self-start h-fit">
            <div className="text-lg font-semibold text-gray-900">Добавить предмет</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" className={inputClass} />

              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {MARKET_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Краткое описание (показывается подсказкой на рынке)</div>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Например: лёгкий, складной, выдаёт преимущество в…"
                className={`${inputClass} min-h-[84px]`}
              />
            </div>

            {supportsCombatFields(category) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Урон (опционально)</div>
                  <input value={damage} onChange={(e) => setDamage(e.target.value)} placeholder="например 1к8 рубящее" className={inputClass} />
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Класс доспеха (опционально)</div>
                  <input value={armorClass} onChange={(e) => setArmorClass(e.target.value)} placeholder="например 14 + ЛВК (макс 2)" className={inputClass} />
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end">
              <PricePreview gp={priceGp} sp={priceSp} cp={priceCp} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <input value={priceGp} onChange={(e) => setPriceGp(e.target.value)} inputMode="numeric" placeholder="З" className={inputClass} />
              <input value={priceSp} onChange={(e) => setPriceSp(e.target.value)} inputMode="numeric" placeholder="С" className={inputClass} />
              <input value={priceCp} onChange={(e) => setPriceCp(e.target.value)} inputMode="numeric" placeholder="М" className={inputClass} />
            </div>

            <div>
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
                Создать
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-lg font-semibold text-gray-900">Список предметов</div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Все категории</option>
                {MARKET_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="p-6 text-gray-700">Загрузка…</div>
          ) : filteredSorted.length === 0 ? (
            <div className="p-6 text-gray-700">Предметов пока нет.</div>
          ) : (
            <div className={shouldScrollItems ? 'max-h-[34rem] overflow-y-auto' : ''}>
              <div className="divide-y divide-gray-200">
                {filteredSorted.map((it) => (
                  <div key={it.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="font-semibold text-gray-900 truncate">{it.name}</div>
                        <div className="text-xs text-gray-500">Категория: {categoryLabel(it.category)}</div>
                        <PricePreview gp={it.price_gp} sp={it.price_sp} cp={it.price_cp} />
                      </div>

                      {editingId === it.id ? (
                        <div className="mt-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Название" className={inputClass} />

                            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputClass}>
                              {MARKET_CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <div className="text-xs text-gray-600 mb-1">Краткое описание</div>
                            <textarea
                              value={editShortDescription}
                              onChange={(e) => setEditShortDescription(e.target.value)}
                              placeholder="Краткая подсказка для рынка"
                              className={`${inputClass} min-h-[84px]`}
                            />
                          </div>

                          {supportsCombatFields(editCategory) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Урон (опционально)</div>
                                <input value={editDamage} onChange={(e) => setEditDamage(e.target.value)} placeholder="например 1к8 рубящее" className={inputClass} />
                              </div>
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Класс доспеха (опционально)</div>
                                <input value={editArmorClass} onChange={(e) => setEditArmorClass(e.target.value)} placeholder="например 14 + ЛВК (макс 2)" className={inputClass} />
                              </div>
                            </div>
                          ) : null}

                          <div className="flex items-center justify-end">
                            <PricePreview gp={editPriceGp} sp={editPriceSp} cp={editPriceCp} />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <input value={editPriceGp} onChange={(e) => setEditPriceGp(e.target.value)} inputMode="numeric" placeholder="З" className={inputClass} />
                            <input value={editPriceSp} onChange={(e) => setEditPriceSp(e.target.value)} inputMode="numeric" placeholder="С" className={inputClass} />
                            <input value={editPriceCp} onChange={(e) => setEditPriceCp(e.target.value)} inputMode="numeric" placeholder="М" className={inputClass} />
                          </div>

                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => saveEdit(it.id)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
                              Сохранить
                            </button>
                            <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100">
                              Отмена
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {editingId === it.id ? null : (
                        <button onClick={() => startEdit(it)} className="text-gray-700 hover:text-gray-900 font-medium text-sm">
                          Редактировать
                        </button>
                      )}
                      <button onClick={() => remove(it.id)} className="text-red-600 hover:text-red-900 font-medium text-sm">
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
