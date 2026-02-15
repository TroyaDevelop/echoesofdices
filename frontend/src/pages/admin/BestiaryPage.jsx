import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import SpellDescriptionEditor from '../../components/admin/SpellDescriptionEditor.jsx';
import TokenHint from '../../components/admin/TokenHint.jsx';
import { bestiaryAPI, sourcesAPI } from '../../lib/api.js';
import { normalizeSpellDescriptionForSave } from '../../lib/richText.js';

const normalize = (v) => String(v || '').trim();
const normalizeSourceKey = (v) => String(v || '').trim().toLowerCase();
const splitSourceTokens = (value) =>
  String(value || '')
    .split(/[,;/]+/)
    .map((item) => String(item || '').trim())
    .filter(Boolean);

const createSectionState = (initial = {}) => ({
  hasTraits: initial.hasTraits ?? true,
  hasBonusActions: initial.hasBonusActions ?? false,
  hasReactions: initial.hasReactions ?? true,
  hasLegendary: initial.hasLegendary ?? false,
  hasSpellcasting: initial.hasSpellcasting ?? false,
  hasVillainActions: initial.hasVillainActions ?? false,
});

const emptyMonster = {
  name: '',
  name_en: '',
  size: '',
  creature_type: '',
  alignment: '',
  habitat: '',
  is_hidden: false,
  armor_class: '',
  hit_points: '',
  speed: '',
  strength: '',
  dexterity: '',
  constitution: '',
  intelligence: '',
  wisdom: '',
  charisma: '',
  saving_throws: '',
  skills: '',
  damage_vulnerabilities: '',
  damage_resistances: '',
  damage_immunities: '',
  condition_immunities: '',
  senses: '',
  languages: '',
  challenge_rating: '',
  proficiency_bonus: '',
  source: '',
  source_pages: '',
  traits_text: '',
  actions_text: '',
  bonus_actions_text: '',
  reactions_text: '',
  legendary_actions_text: '',
  spellcasting_text: '',
  villain_actions_text: '',
  description: '',
};

const normalizeMonsterPayload = (state, sectionState) => ({
  name: normalize(state.name),
  name_en: normalize(state.name_en) || null,
  size: normalize(state.size) || null,
  creature_type: normalize(state.creature_type) || null,
  alignment: normalize(state.alignment) || null,
  habitat: normalize(state.habitat) || null,
  is_hidden: Boolean(state.is_hidden),
  armor_class: normalize(state.armor_class) || null,
  hit_points: normalize(state.hit_points) || null,
  speed: normalize(state.speed) || null,
  strength: normalize(state.strength) || null,
  dexterity: normalize(state.dexterity) || null,
  constitution: normalize(state.constitution) || null,
  intelligence: normalize(state.intelligence) || null,
  wisdom: normalize(state.wisdom) || null,
  charisma: normalize(state.charisma) || null,
  saving_throws: normalize(state.saving_throws) || null,
  skills: normalize(state.skills) || null,
  damage_vulnerabilities: normalize(state.damage_vulnerabilities) || null,
  damage_resistances: normalize(state.damage_resistances) || null,
  damage_immunities: normalize(state.damage_immunities) || null,
  condition_immunities: normalize(state.condition_immunities) || null,
  senses: normalize(state.senses) || null,
  languages: normalize(state.languages) || null,
  challenge_rating: normalize(state.challenge_rating) || null,
  proficiency_bonus: normalize(state.proficiency_bonus) || null,
  source: normalize(state.source) || null,
  source_pages: normalize(state.source_pages) || null,
  traits_text: sectionState.hasTraits ? normalizeSpellDescriptionForSave(state.traits_text) : null,
  actions_text: normalizeSpellDescriptionForSave(state.actions_text),
  bonus_actions_text: sectionState.hasBonusActions ? normalizeSpellDescriptionForSave(state.bonus_actions_text) : null,
  reactions_text: sectionState.hasReactions ? normalizeSpellDescriptionForSave(state.reactions_text) : null,
  legendary_actions_text: sectionState.hasLegendary ? normalizeSpellDescriptionForSave(state.legendary_actions_text) : null,
  spellcasting_text: sectionState.hasSpellcasting ? normalizeSpellDescriptionForSave(state.spellcasting_text) : null,
  villain_actions_text: sectionState.hasVillainActions ? normalizeSpellDescriptionForSave(state.villain_actions_text) : null,
  description: normalizeSpellDescriptionForSave(state.description),
});

function MonsterForm({
  title,
  formState,
  sectionState,
  onFieldChange,
  onSectionChange,
  sourceListId,
  sourceOptions,
  onSubmit,
  submitLabel,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input value={formState.name} onChange={(event) => onFieldChange('name', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Название*" />
        <input value={formState.name_en} onChange={(event) => onFieldChange('name_en', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Название (EN)" />
        <input value={formState.challenge_rating} onChange={(event) => onFieldChange('challenge_rating', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Опасность (CR)" />
        <input value={formState.size} onChange={(event) => onFieldChange('size', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Размер" />
        <input value={formState.creature_type} onChange={(event) => onFieldChange('creature_type', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Тип" />
        <input value={formState.alignment} onChange={(event) => onFieldChange('alignment', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Мировоззрение" />
        <label className="md:col-span-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-700">
          <input type="checkbox" checked={Boolean(formState.is_hidden)} onChange={(event) => onFieldChange('is_hidden', event.target.checked)} />
          Скрыть существо из публичного бестиария (доступно только мастеру/администратору)
        </label>
        <input
          value={formState.habitat}
          onChange={(event) => onFieldChange('habitat', event.target.value)}
          className="rounded-lg border px-3 py-2 md:col-span-3"
          placeholder="Среда обитания"
        />
        <input value={formState.armor_class} onChange={(event) => onFieldChange('armor_class', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Класс доспеха" />
        <input value={formState.hit_points} onChange={(event) => onFieldChange('hit_points', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Хиты" />
        <input value={formState.speed} onChange={(event) => onFieldChange('speed', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Скорость" />
        <input value={formState.strength} onChange={(event) => onFieldChange('strength', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="СИЛ" />
        <input value={formState.dexterity} onChange={(event) => onFieldChange('dexterity', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="ЛОВ" />
        <input value={formState.constitution} onChange={(event) => onFieldChange('constitution', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="ТЕЛ" />
        <input value={formState.intelligence} onChange={(event) => onFieldChange('intelligence', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="ИНТ" />
        <input value={formState.wisdom} onChange={(event) => onFieldChange('wisdom', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="МДР" />
        <input value={formState.charisma} onChange={(event) => onFieldChange('charisma', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="ХАР" />
        <input value={formState.proficiency_bonus} onChange={(event) => onFieldChange('proficiency_bonus', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Бонус мастерства" />
        <input value={formState.saving_throws} onChange={(event) => onFieldChange('saving_throws', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Спасброски" />
        <input value={formState.skills} onChange={(event) => onFieldChange('skills', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Навыки" />
        <input value={formState.senses} onChange={(event) => onFieldChange('senses', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Чувства" />
        <input value={formState.languages} onChange={(event) => onFieldChange('languages', event.target.value)} className="rounded-lg border px-3 py-2" placeholder="Языки" />
        <input
          value={formState.source}
          onChange={(event) => onFieldChange('source', event.target.value)}
          list={sourceListId}
          className="rounded-lg border px-3 py-2"
          placeholder="Источник"
        />
        <input
          value={formState.source_pages}
          onChange={(event) => onFieldChange('source_pages', event.target.value)}
          className="rounded-lg border px-3 py-2"
          placeholder="Страницы (например MM 145)"
        />
        <div className="md:col-span-3">
          <TokenHint value={formState.source} options={sourceOptions} />
        </div>
        <input value={formState.damage_vulnerabilities} onChange={(event) => onFieldChange('damage_vulnerabilities', event.target.value)} className="rounded-lg border px-3 py-2 md:col-span-3" placeholder="Уязвимости к урону" />
        <input value={formState.damage_resistances} onChange={(event) => onFieldChange('damage_resistances', event.target.value)} className="rounded-lg border px-3 py-2 md:col-span-3" placeholder="Сопротивления к урону" />
        <input value={formState.damage_immunities} onChange={(event) => onFieldChange('damage_immunities', event.target.value)} className="rounded-lg border px-3 py-2 md:col-span-3" placeholder="Иммунитеты к урону" />
        <input value={formState.condition_immunities} onChange={(event) => onFieldChange('condition_immunities', event.target.value)} className="rounded-lg border px-3 py-2 md:col-span-3" placeholder="Иммунитеты к состояниям" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <input type="checkbox" checked={sectionState.hasTraits} onChange={(event) => onSectionChange('hasTraits', event.target.checked)} />
            Особенности
          </label>
          {sectionState.hasTraits ? (
            <SpellDescriptionEditor value={formState.traits_text} onChange={(value) => onFieldChange('traits_text', value)} placeholder="Особенности" />
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-800">Действия</div>
          <SpellDescriptionEditor value={formState.actions_text} onChange={(value) => onFieldChange('actions_text', value)} placeholder="Действия" />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <input type="checkbox" checked={sectionState.hasBonusActions} onChange={(event) => onSectionChange('hasBonusActions', event.target.checked)} />
            Бонусные действия
          </label>
          {sectionState.hasBonusActions ? (
            <SpellDescriptionEditor value={formState.bonus_actions_text} onChange={(value) => onFieldChange('bonus_actions_text', value)} placeholder="Бонусные действия" />
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <input type="checkbox" checked={sectionState.hasReactions} onChange={(event) => onSectionChange('hasReactions', event.target.checked)} />
            Реакции
          </label>
          {sectionState.hasReactions ? (
            <SpellDescriptionEditor value={formState.reactions_text} onChange={(value) => onFieldChange('reactions_text', value)} placeholder="Реакции" />
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <input type="checkbox" checked={sectionState.hasLegendary} onChange={(event) => onSectionChange('hasLegendary', event.target.checked)} />
            Легендарные действия
          </label>
          {sectionState.hasLegendary ? (
            <SpellDescriptionEditor
              value={formState.legendary_actions_text}
              onChange={(value) => onFieldChange('legendary_actions_text', value)}
              placeholder="Легендарные действия"
            />
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <input type="checkbox" checked={sectionState.hasSpellcasting} onChange={(event) => onSectionChange('hasSpellcasting', event.target.checked)} />
            Использование заклинаний
          </label>
          {sectionState.hasSpellcasting ? (
            <SpellDescriptionEditor
              value={formState.spellcasting_text}
              onChange={(value) => onFieldChange('spellcasting_text', value)}
              placeholder="Использование заклинаний"
            />
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <input type="checkbox" checked={sectionState.hasVillainActions} onChange={(event) => onSectionChange('hasVillainActions', event.target.checked)} />
            Злодейские действия
          </label>
          {sectionState.hasVillainActions ? (
            <SpellDescriptionEditor
              value={formState.villain_actions_text}
              onChange={(value) => onFieldChange('villain_actions_text', value)}
              placeholder="Злодейские действия"
            />
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="text-sm font-medium text-gray-800">Описание</div>
          <SpellDescriptionEditor value={formState.description} onChange={(value) => onFieldChange('description', value)} placeholder="Описание" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" className="inline-flex items-center rounded-lg bg-purple-600 text-white px-4 py-2 hover:bg-purple-700 transition-colors">
          {submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="inline-flex items-center rounded-lg border border-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-50 transition-colors">
            Отмена
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default function AdminBestiaryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sourceItems, setSourceItems] = useState([]);

  const [monsterForm, setMonsterForm] = useState(emptyMonster);
  const [createSections, setCreateSections] = useState(createSectionState());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyMonster);
  const [editSections, setEditSections] = useState(createSectionState());

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [monsterData, sourcesData] = await Promise.all([bestiaryAPI.listAdmin(), sourcesAPI.listAdmin()]);
      setItems(Array.isArray(monsterData) ? monsterData : []);
      setSourceItems(Array.isArray(sourcesData) ? sourcesData : []);
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
    const filtered = (items || []).filter((item) => {
      if (!q) return true;
      return normalize(item.name).toLowerCase().includes(q);
    });
    return filtered.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), 'ru', { sensitivity: 'base' }));
  }, [items, query]);

  const updateMonsterField = (key, value) => {
    setMonsterForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateCreateSection = (key, value) => {
    setCreateSections((prev) => ({ ...prev, [key]: value }));
  };

  const updateEditField = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateEditSection = (key, value) => {
    setEditSections((prev) => ({ ...prev, [key]: value }));
  };

  const sourceSet = useMemo(() => new Set(sourceItems.map((item) => normalizeSourceKey(item.name))), [sourceItems]);

  const invalidSourcesFor = (value) => {
    const tokens = splitSourceTokens(value);
    if (tokens.length === 0) return [];
    return tokens.filter((token) => !sourceSet.has(normalizeSourceKey(token)));
  };

  const sourceListId = 'admin-bestiary-sources';

  const handleCreateMonster = async (e) => {
    e.preventDefault();
    setError('');

    const invalidSources = invalidSourcesFor(monsterForm.source);
    if (invalidSources.length > 0) {
      setError(`Неизвестные источники: ${invalidSources.join(', ')}`);
      return;
    }

    const payload = normalizeMonsterPayload(monsterForm, createSections);
    if (!payload.name) {
      setError('Название существа обязательно');
      return;
    }

    try {
      await bestiaryAPI.create(payload);
      setMonsterForm(emptyMonster);
      setCreateSections(createSectionState());
      await load();
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка добавления существа');
    }
  };

  const startEditMonster = (item) => {
    setEditingId(item.id);
    setEditForm({
      name: String(item.name || ''),
      name_en: String(item.name_en || ''),
      size: String(item.size || ''),
      creature_type: String(item.creature_type || ''),
      alignment: String(item.alignment || ''),
      habitat: String(item.habitat || ''),
      is_hidden: Boolean(item.is_hidden),
      armor_class: String(item.armor_class || ''),
      hit_points: String(item.hit_points || ''),
      speed: String(item.speed || ''),
      strength: String(item.strength || ''),
      dexterity: String(item.dexterity || ''),
      constitution: String(item.constitution || ''),
      intelligence: String(item.intelligence || ''),
      wisdom: String(item.wisdom || ''),
      charisma: String(item.charisma || ''),
      saving_throws: String(item.saving_throws || ''),
      skills: String(item.skills || ''),
      damage_vulnerabilities: String(item.damage_vulnerabilities || ''),
      damage_resistances: String(item.damage_resistances || ''),
      damage_immunities: String(item.damage_immunities || ''),
      condition_immunities: String(item.condition_immunities || ''),
      senses: String(item.senses || ''),
      languages: String(item.languages || ''),
      challenge_rating: String(item.challenge_rating || ''),
      proficiency_bonus: String(item.proficiency_bonus || ''),
      source: String(item.source || ''),
      source_pages: String(item.source_pages || ''),
      traits_text: String(item.traits_text || ''),
      actions_text: String(item.actions_text || ''),
      bonus_actions_text: String(item.bonus_actions_text || ''),
      reactions_text: String(item.reactions_text || ''),
      legendary_actions_text: String(item.legendary_actions_text || ''),
      spellcasting_text: String(item.spellcasting_text || ''),
      villain_actions_text: String(item.villain_actions_text || ''),
      description: String(item.description || ''),
    });
    setEditSections(
      createSectionState({
        hasTraits: Boolean(normalize(item.traits_text)),
        hasBonusActions: Boolean(normalize(item.bonus_actions_text)),
        hasReactions: Boolean(normalize(item.reactions_text)),
        hasLegendary: Boolean(normalize(item.legendary_actions_text)),
        hasSpellcasting: Boolean(normalize(item.spellcasting_text)),
        hasVillainActions: Boolean(normalize(item.villain_actions_text)),
      })
    );
  };

  const cancelEditMonster = () => {
    setEditingId(null);
    setEditForm(emptyMonster);
    setEditSections(createSectionState());
  };

  const saveEditMonster = async (id) => {
    setError('');

    const invalidSources = invalidSourcesFor(editForm.source);
    if (invalidSources.length > 0) {
      setError(`Неизвестные источники: ${invalidSources.join(', ')}`);
      return;
    }

    const payload = normalizeMonsterPayload(editForm, editSections);
    if (!payload.name) {
      setError('Название существа обязательно');
      return;
    }

    try {
      await bestiaryAPI.update(id, payload);
      cancelEditMonster();
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка обновления существа');
    }
  };

  const handleDeleteMonster = async (id) => {
    if (!confirm('Удалить существо?')) return;
    setError('');
    try {
      await bestiaryAPI.remove(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления существа');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Бестиарий</h1>
            <p className="text-gray-600 mt-1">Существа</p>
          </div>
          <div className="w-full md:w-80">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск существа…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {error ? <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div> : null}

        <MonsterForm
          title="Добавить существо"
          formState={monsterForm}
          sectionState={createSections}
          onFieldChange={updateMonsterField}
          onSectionChange={updateCreateSection}
          sourceListId={sourceListId}
          sourceOptions={sourceItems}
          onSubmit={handleCreateMonster}
          submitLabel="Добавить существо"
        />

        <datalist id={sourceListId}>
          {sourceItems.map((item) => (
            <option key={item.id} value={item.name} />
          ))}
        </datalist>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-4 py-3 border-b font-semibold text-gray-900">Существа ({filteredSorted.length})</div>
          {loading ? (
            <div className="p-4 text-gray-700">Загрузка…</div>
          ) : filteredSorted.length === 0 ? (
            <div className="p-4 text-gray-700">Существ пока нет.</div>
          ) : (
            <div className="divide-y max-h-[30rem] overflow-y-auto">
              {filteredSorted.map((item) => (
                <div key={item.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{item.name}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {[
                          normalize(item.size),
                          normalize(item.creature_type),
                          normalize(item.challenge_rating) ? `CR ${normalize(item.challenge_rating)}` : '',
                          item.is_hidden ? 'Скрыто' : '',
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingId === item.id ? null : (
                        <button
                          type="button"
                          onClick={() => startEditMonster(item)}
                          className="rounded-md border border-gray-300 text-gray-700 px-3 py-1.5 hover:bg-gray-50"
                        >
                          Редактировать
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMonster(item.id)}
                        className="rounded-md border border-red-200 text-red-700 px-3 py-1.5 hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>

                  {editingId === item.id ? (
                    <div className="mt-4">
                      <MonsterForm
                        title={`Редактирование: ${item.name}`}
                        formState={editForm}
                        sectionState={editSections}
                        onFieldChange={updateEditField}
                        onSectionChange={updateEditSection}
                        sourceListId={sourceListId}
                        sourceOptions={sourceItems}
                        onSubmit={(event) => {
                          event.preventDefault();
                          saveEditMonster(item.id);
                        }}
                        submitLabel="Сохранить"
                        onCancel={cancelEditMonster}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
