import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import ItemCreateForm from '../../components/admin/market/ItemCreateForm.jsx';
import ItemList from '../../components/admin/market/ItemList.jsx';
import MarkupsPanel from '../../components/admin/market/MarkupsPanel.jsx';
import RegionsPanel from '../../components/admin/market/RegionsPanel.jsx';
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

const WEAPON_TYPES = [
  { value: 'simple_melee', label: 'Простое рукопашное' },
  { value: 'simple_ranged', label: 'Простое дальнобойное' },
  { value: 'martial_melee', label: 'Воинское рукопашное' },
  { value: 'martial_ranged', label: 'Воинское дальнобойное' },
];

const weaponTypeLabel = (value) => WEAPON_TYPES.find((t) => t.value === value)?.label || '';

const toNonNegInt = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
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
  const [weaponType, setWeaponType] = useState('');
  const [priceGp, setPriceGp] = useState('');
  const [priceSp, setPriceSp] = useState('');
  const [priceCp, setPriceCp] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('food_plant');
  const [editShortDescription, setEditShortDescription] = useState('');
  const [editDamage, setEditDamage] = useState('');
  const [editArmorClass, setEditArmorClass] = useState('');
  const [editWeaponType, setEditWeaponType] = useState('');
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
  const shouldScrollItems = useMemo(() => filteredSorted.length > 5, [filteredSorted.length]);
  const shouldScrollMarkupCategories = useMemo(() => MARKET_CATEGORIES.length > 4, []);

  const resetCreate = () => {
    setName('');
    setCategory('food_plant');
    setShortDescription('');
    setDamage('');
    setArmorClass('');
    setWeaponType('');
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

  const handleMarkupDraftChange = (categoryValue, value) => {
    setMarkupDraft((prev) => ({ ...prev, [categoryValue]: value }));
  };

  const handleResetMarkups = () => {
    if (!markupRegionId) return;
    applyDraftFromRegion(String(markupRegionId));
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
      payload.weapon_type = d ? (String(weaponType || '').trim() || null) : null;
    } else {
      payload.weapon_type = null;
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
    setEditWeaponType(String(it.weapon_type || ''));
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
    setEditWeaponType('');
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
      payload.weapon_type = d ? (String(editWeaponType || '').trim() || null) : null;
    } else {
      payload.damage = null;
      payload.armor_class = null;
      payload.weapon_type = null;
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
            <RegionsPanel
              regionName={regionName}
              onRegionNameChange={(e) => setRegionName(e.target.value)}
              onCreateRegion={handleCreateRegion}
              regions={regions}
              shouldScroll={shouldScrollRegions}
              editingRegionId={editingRegionId}
              editRegionName={editRegionName}
              onEditRegionNameChange={(e) => setEditRegionName(e.target.value)}
              onStartEditRegion={startEditRegion}
              onCancelEditRegion={cancelEditRegion}
              onSaveEditRegion={saveEditRegion}
              onRemoveRegion={removeRegion}
              inputClass={inputClass}
            />

            <MarkupsPanel
              regions={regions}
              markupRegionId={markupRegionId}
              onSelectMarkupRegion={handleSelectMarkupRegion}
              markupSeason={markupSeason}
              onSeasonChange={setMarkupSeason}
              categories={MARKET_CATEGORIES}
              markupDraft={markupDraft}
              onMarkupDraftChange={handleMarkupDraftChange}
              onReset={handleResetMarkups}
              onSave={saveMarkups}
              inputClass={inputClass}
              shouldScroll={shouldScrollMarkupCategories}
              seasons={MARKET_SEASONS}
            />
          </div>
          <ItemCreateForm
            name={name}
            onNameChange={(e) => setName(e.target.value)}
            category={category}
            onCategoryChange={(e) => setCategory(e.target.value)}
            categories={MARKET_CATEGORIES}
            shortDescription={shortDescription}
            onShortDescriptionChange={(e) => setShortDescription(e.target.value)}
            damage={damage}
            onDamageChange={(e) => setDamage(e.target.value)}
            armorClass={armorClass}
            onArmorClassChange={(e) => setArmorClass(e.target.value)}
            weaponType={weaponType}
            onWeaponTypeChange={(e) => setWeaponType(e.target.value)}
            weaponTypes={WEAPON_TYPES}
            priceGp={priceGp}
            onPriceGpChange={(e) => setPriceGp(e.target.value)}
            priceSp={priceSp}
            onPriceSpChange={(e) => setPriceSp(e.target.value)}
            priceCp={priceCp}
            onPriceCpChange={(e) => setPriceCp(e.target.value)}
            supportsCombatFields={supportsCombatFields}
            inputClass={inputClass}
            onSubmit={handleCreate}
          />
        </div>
        <ItemList
          loading={loading}
          items={filteredSorted}
          filterCategory={filterCategory}
          onFilterCategoryChange={(e) => setFilterCategory(e.target.value)}
          categories={MARKET_CATEGORIES}
          categoryLabel={categoryLabel}
          shouldScroll={shouldScrollItems}
          editingId={editingId}
          onStartEdit={startEdit}
          onRemove={remove}
          onSave={saveEdit}
          onCancel={cancelEdit}
          inputClass={inputClass}
          supportsCombatFields={supportsCombatFields}
          weaponTypes={WEAPON_TYPES}
          editName={editName}
          onEditNameChange={(e) => setEditName(e.target.value)}
          editCategory={editCategory}
          onEditCategoryChange={(e) => setEditCategory(e.target.value)}
          editShortDescription={editShortDescription}
          onEditShortDescriptionChange={(e) => setEditShortDescription(e.target.value)}
          editDamage={editDamage}
          onEditDamageChange={(e) => setEditDamage(e.target.value)}
          editArmorClass={editArmorClass}
          onEditArmorClassChange={(e) => setEditArmorClass(e.target.value)}
          editWeaponType={editWeaponType}
          onEditWeaponTypeChange={(e) => setEditWeaponType(e.target.value)}
          editPriceGp={editPriceGp}
          onEditPriceGpChange={(e) => setEditPriceGp(e.target.value)}
          editPriceSp={editPriceSp}
          onEditPriceSpChange={(e) => setEditPriceSp(e.target.value)}
          editPriceCp={editPriceCp}
          onEditPriceCpChange={(e) => setEditPriceCp(e.target.value)}
        />
      </div>
    </AdminLayout>
  );
}
