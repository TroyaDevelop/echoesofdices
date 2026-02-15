import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { bestiaryAPI, screenAPI } from '../../lib/api.js';

const normalize = (value) => String(value || '').trim();

const abilityMod = (scoreRaw) => {
  const score = Number(scoreRaw);
  if (!Number.isFinite(score)) return 0;
  return Math.floor((score - 10) / 2);
};

const parseHp = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(Math.trunc(n), 0);
};

const toEntriesPayload = (monsters) => {
  const map = new Map();
  for (const monster of monsters || []) {
    const id = Number(monster?.bestiary_id);
    if (!Number.isFinite(id) || id <= 0) continue;
    map.set(id, (map.get(id) || 0) + 1);
  }
  return Array.from(map.entries()).map(([bestiary_id, count]) => ({ bestiary_id, count }));
};

const normalizeEncounter = (encounter) => {
  const monsters = Array.isArray(encounter?.monsters) ? encounter.monsters : [];
  const order = Array.isArray(encounter?.initiative_order) ? encounter.initiative_order : [];
  return {
    id: Number(encounter?.id || 0),
    name: String(encounter?.name || ''),
    status: String(encounter?.status || 'draft'),
    master_name: String(encounter?.master_name || ''),
    monsters,
    initiative_order: order,
    updated_at: encounter?.updated_at,
  };
};

const isPlayer = (participant) => String(participant?.participant_type || '') === 'player';

export default function AdminScreenEncountersPage() {
  const [catalog, setCatalog] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const [encounterId, setEncounterId] = useState(null);
  const [encounterName, setEncounterName] = useState('');
  const [encounterStatus, setEncounterStatus] = useState('draft');
  const [monsters, setMonsters] = useState([]);

  const [query, setQuery] = useState('');

  const activeEncounters = useMemo(() => (encounters || []).filter((encounter) => String(encounter?.status || '') === 'active'), [encounters]);

  const loadAll = async () => {
    setError('');
    setLoading(true);
    try {
      const [bestiaryData, encountersData] = await Promise.all([bestiaryAPI.listAdmin(), screenAPI.listEncounters(120)]);
      setCatalog(Array.isArray(bestiaryData) ? bestiaryData : []);
      const normalized = (Array.isArray(encountersData) ? encountersData : []).map(normalizeEncounter);
      setEncounters(normalized);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки конструктора боёв');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredMonsters = useMemo(() => {
    const q = normalize(query).toLowerCase();
    if (!q) return [];

    return (catalog || [])
      .filter((monster) => {
        const name = normalize(monster?.name).toLowerCase();
        const nameEn = normalize(monster?.name_en).toLowerCase();
        return name.includes(q) || nameEn.includes(q);
      })
      .slice(0, 8);
  }, [catalog, query]);

  const addMonster = (monster) => {
    const dexMod = abilityMod(monster?.dexterity);
    const hpText = normalize(monster?.hit_points);
    const hpMatch = hpText.match(/\d+/);
    const hpCurrent = hpMatch ? Number(hpMatch[0]) : null;

    setMonsters((prev) => [
      ...prev,
      {
        monster_instance_id: `tmp_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        participant_type: 'monster',
        bestiary_id: Number(monster.id),
        name: String(monster.name || ''),
        name_en: monster.name_en || null,
        size: monster.size || null,
        creature_type: monster.creature_type || null,
        alignment: monster.alignment || null,
        armor_class: monster.armor_class || null,
        hit_points: monster.hit_points || null,
        hp_current: Number.isFinite(hpCurrent) ? Math.max(Math.trunc(hpCurrent), 0) : null,
        speed: monster.speed || null,
        strength: monster.strength ?? null,
        dexterity: monster.dexterity ?? null,
        constitution: monster.constitution ?? null,
        intelligence: monster.intelligence ?? null,
        wisdom: monster.wisdom ?? null,
        charisma: monster.charisma ?? null,
        saving_throws: monster.saving_throws || null,
        skills: monster.skills || null,
        damage_vulnerabilities: monster.damage_vulnerabilities || null,
        damage_resistances: monster.damage_resistances || null,
        damage_immunities: monster.damage_immunities || null,
        condition_immunities: monster.condition_immunities || null,
        senses: monster.senses || null,
        languages: monster.languages || null,
        challenge_rating: monster.challenge_rating || null,
        proficiency_bonus: monster.proficiency_bonus || null,
        source: monster.source || null,
        source_pages: monster.source_pages || null,
        traits_text: monster.traits_text || null,
        actions_text: monster.actions_text || null,
        reactions_text: monster.reactions_text || null,
        legendary_actions_text: monster.legendary_actions_text || null,
        spellcasting_text: monster.spellcasting_text || null,
        villain_actions_text: monster.villain_actions_text || null,
        description: monster.description || null,
        initiative_custom: null,
        initiative_roll: null,
        initiative_total: null,
        dex_mod: dexMod,
      },
    ]);
    setQuery('');
  };

  const addPlayer = () => {
    setMonsters((prev) => [
      ...prev,
      {
        monster_instance_id: `tmp_player_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        participant_type: 'player',
        bestiary_id: 0,
        name: '',
        armor_class: '',
        hp_current: '',
        initiative_custom: 10,
        initiative_roll: null,
        initiative_total: 10,
        dex_mod: 0,
      },
    ]);
  };

  const removeMonster = (monsterInstanceId) => {
    setMonsters((prev) => prev.filter((monster) => monster.monster_instance_id !== monsterInstanceId));
  };

  const setMonsterHpLocal = (monsterInstanceId, value) => {
    setMonsters((prev) =>
      prev.map((monster) => {
        if (monster.monster_instance_id !== monsterInstanceId) return monster;
        if (value === '') return { ...monster, hp_current: '' };
        const parsed = parseHp(value);
        if (parsed === null) return monster;
        return { ...monster, hp_current: parsed };
      })
    );
  };

  const setPlayerFieldLocal = (monsterInstanceId, field, value) => {
    setMonsters((prev) =>
      prev.map((monster) => {
        if (monster.monster_instance_id !== monsterInstanceId) return monster;
        return { ...monster, [field]: value };
      })
    );
  };

  const syncEncounter = (encounter) => {
    const next = normalizeEncounter(encounter);
    setEncounterId(next.id || null);
    setEncounterName(next.name || '');
    setEncounterStatus(next.status || 'draft');
    setMonsters(Array.isArray(next.monsters) ? next.monsters : []);
  };

  const handleNewEncounter = () => {
    setEncounterId(null);
    setEncounterName('');
    setEncounterStatus('draft');
    setMonsters([]);
    setError('');
  };

  const loadEncounter = async (id) => {
    setError('');
    try {
      const data = await screenAPI.getEncounterById(id);
      syncEncounter(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки энкаунтера');
    }
  };

  const saveEncounter = async () => {
    setError('');

    const name = normalize(encounterName);
    if (!name) {
      setError('Введите название энкаунтера');
      return;
    }

    const entries = toEntriesPayload(monsters);
    const rawPlayers = (monsters || []).filter((participant) => isPlayer(participant));

    const invalidPlayerName = rawPlayers.find((participant) => !normalize(participant?.name));
    if (invalidPlayerName) {
      setError('У каждого добавленного игрока должно быть имя');
      return;
    }

    const invalidPlayerInitiative = rawPlayers.find((participant) => {
      const rawValue = participant?.initiative_custom;
      if (rawValue === '' || rawValue === null || rawValue === undefined) return true;
      return !Number.isFinite(Number(rawValue));
    });
    if (invalidPlayerInitiative) {
      setError(`У игрока "${normalize(invalidPlayerInitiative.name)}" инициатива должна быть числом`);
      return;
    }

    const players = rawPlayers.map((participant) => ({
      name: normalize(participant?.name),
      initiative: Number(participant?.initiative_custom),
      hp_current: participant?.hp_current === '' || participant?.hp_current === null || participant?.hp_current === undefined
        ? null
        : Number(participant?.hp_current),
      armor_class: normalize(participant?.armor_class) || null,
    }));

    const hasMonster = entries.length > 0;
    const hasPlayer = players.length > 0;
    if (!hasMonster && !hasPlayer) {
      setError('Добавьте хотя бы одного участника (существо или игрока)');
      return;
    }

    setSaving(true);
    try {
      const data = encounterId
        ? await screenAPI.updateEncounter(encounterId, { name, entries, players })
        : await screenAPI.createEncounter({ name, entries, players });
      syncEncounter(data);
      const nextList = await screenAPI.listEncounters(120);
      setEncounters((Array.isArray(nextList) ? nextList : []).map(normalizeEncounter));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка сохранения энкаунтера');
    } finally {
      setSaving(false);
    }
  };

  const startEncounter = async () => {
    setError('');

    if (!encounterId) {
      setError('Сначала сохраните энкаунтер');
      return;
    }

    setStarting(true);
    try {
      await screenAPI.startEncounter(encounterId);

      setEncounterId(null);
      setEncounterName('');
      setEncounterStatus('draft');
      setMonsters([]);

      const nextList = await screenAPI.listEncounters(120);
      setEncounters((Array.isArray(nextList) ? nextList : []).map(normalizeEncounter));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка запуска боя');
    } finally {
      setStarting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ширма · Конструктор боёв</h1>
        </div>

        {error ? <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <section className="bg-white rounded-lg border shadow-sm p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-900">Сохранённые энкаунтеры</div>
            <button
              type="button"
              onClick={handleNewEncounter}
              className="w-full rounded-lg border border-purple-200 text-purple-700 px-3 py-2 hover:bg-purple-50 transition-colors"
            >
              + Новый энкаунтер
            </button>
            <div className="max-h-80 overflow-auto space-y-2">
              {loading ? <div className="text-sm text-gray-500">Загрузка…</div> : null}
              {!loading && encounters.length === 0 ? <div className="text-sm text-gray-500">Пока нет сохранённых энкаунтеров.</div> : null}
              {encounters.map((encounter) => {
                const active = encounterId === encounter.id;
                return (
                  <button
                    key={encounter.id}
                    type="button"
                    onClick={() => loadEncounter(encounter.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                      active ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{encounter.name}</div>
                    <div className="text-xs text-gray-500">{encounter.status} · существ: {encounter.monster_count || encounter.monsters.length || 0}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="xl:col-span-2 bg-white rounded-lg border shadow-sm p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                value={encounterName}
                onChange={(event) => setEncounterName(event.target.value)}
                placeholder="Название энкаунтера"
                className="md:col-span-2 rounded-lg border px-3 py-2"
              />
              <div className="rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-700">Статус: {encounterStatus}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveEncounter}
                disabled={saving}
                className="rounded-lg bg-purple-600 text-white px-4 py-2 hover:bg-purple-700 disabled:opacity-70"
              >
                {saving ? 'Сохранение…' : 'Сохранить энкаунтер'}
              </button>
              <button
                type="button"
                onClick={startEncounter}
                disabled={starting || !encounterId}
                className="rounded-lg bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:opacity-70"
              >
                {starting ? 'Старт…' : 'Начать бой'}
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-900">Поиск</div>
              <div className="relative">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Поиск по названию существа..."
                  className="w-full rounded-lg border px-3 py-2"
                />
                {filteredMonsters.length > 0 ? (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border bg-white shadow-lg overflow-hidden">
                    {filteredMonsters.map((monster) => (
                      <button
                        key={monster.id}
                        type="button"
                        onClick={() => addMonster(monster)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{monster.name}</div>
                        <div className="text-xs text-gray-500">CR {monster.challenge_rating || '—'} · КД {monster.armor_class || '—'} · HP {monster.hit_points || '—'}</div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>

        <section className="bg-white rounded-lg border shadow-sm p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900">Панель мастера · Существа энкаунтера</div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={addPlayer}
              className="rounded-lg border border-indigo-200 text-indigo-700 px-3 py-1.5 text-sm hover:bg-indigo-50"
            >
              + Игрок
            </button>
          </div>
          {monsters.length === 0 ? <div className="text-sm text-gray-500">Добавьте существ из поиска выше.</div> : null}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {monsters.map((monster) => (
              <div key={monster.monster_instance_id} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-gray-900">{monster.name || (isPlayer(monster) ? 'Игрок без имени' : 'Существо')}</div>
                    <div className="text-xs text-gray-500">
                      {isPlayer(monster)
                        ? 'Игрок · ручные параметры'
                        : `CR ${monster.challenge_rating || '—'} · КД ${monster.armor_class || '—'} · HP базовые ${monster.hit_points || '—'}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMonster(monster.monster_instance_id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Удалить
                  </button>
                </div>

                {!isPlayer(monster) ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-700">
                    <div className="rounded border px-2 py-1">СИЛ: {monster.strength ?? '—'}</div>
                    <div className="rounded border px-2 py-1">ЛОВ: {monster.dexterity ?? '—'} ({abilityMod(monster.dexterity) >= 0 ? '+' : ''}{abilityMod(monster.dexterity)})</div>
                    <div className="rounded border px-2 py-1">ТЕЛ: {monster.constitution ?? '—'}</div>
                    <div className="rounded border px-2 py-1">Скорость: {monster.speed || '—'}</div>
                  </div>
                ) : null}

                {isPlayer(monster) ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      value={monster.name || ''}
                      onChange={(event) => setPlayerFieldLocal(monster.monster_instance_id, 'name', event.target.value)}
                      className="rounded-lg border px-3 py-2 md:col-span-2"
                      placeholder="Имя игрока"
                    />
                    <input
                      type="number"
                      value={monster.initiative_custom ?? ''}
                      onChange={(event) => setPlayerFieldLocal(monster.monster_instance_id, 'initiative_custom', event.target.value)}
                      className="rounded-lg border px-3 py-2"
                      placeholder="Инициатива"
                    />
                    <input
                      value={monster.armor_class ?? ''}
                      onChange={(event) => setPlayerFieldLocal(monster.monster_instance_id, 'armor_class', event.target.value)}
                      className="rounded-lg border px-3 py-2"
                      placeholder="КД"
                    />
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={monster.hp_current ?? ''}
                    onChange={(event) => setMonsterHpLocal(monster.monster_instance_id, event.target.value)}
                    className="w-32 rounded-lg border px-3 py-2"
                    placeholder="Текущий HP"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg border shadow-sm p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900">Активные бои</div>
          {activeEncounters.length === 0 ? (
            <div className="text-sm text-gray-500">Сейчас нет активных боёв.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeEncounters.map((encounter) => (
                <a
                  key={encounter.id}
                  href={`/admin/screen/sessions/${encounter.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-32 rounded-xl border border-emerald-300 bg-emerald-50 p-3 hover:bg-emerald-100 transition-colors flex flex-col justify-between"
                >
                  <div className="text-sm font-semibold text-emerald-900">Идет бой</div>
                  <div>
                    <div className="text-base font-semibold text-gray-900">{encounter.name}</div>
                    <div className="text-xs text-gray-600 mt-1">Мастер: {encounter.master_name || '—'}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
