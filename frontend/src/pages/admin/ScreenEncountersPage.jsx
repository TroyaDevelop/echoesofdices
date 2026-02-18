import { useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { bestiaryAPI, screenAPI } from '../../lib/api.js';
import TacticalMapEditor from '../../components/admin/TacticalMapEditor.jsx';

const DEFAULT_MAP_CELL_SIZE = 32;
const MAP_CANVAS_WIDTH = 960;
const MAP_CANVAS_HEIGHT = 640;
const MAP_MIN_ZOOM = 1;
const MAP_MAX_ZOOM = 2.5;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

const randomTokenId = () => `t_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

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
  const mapTokens = Array.isArray(encounter?.map_tokens) ? encounter.map_tokens : [];
  return {
    id: Number(encounter?.id || 0),
    name: String(encounter?.name || ''),
    status: String(encounter?.status || 'draft'),
    master_name: String(encounter?.master_name || ''),
    monsters,
    initiative_order: order,
    map_image_url: encounter?.map_image_url || null,
    map_grid_size_ft: Number(encounter?.map_grid_size_ft || 5),
    map_grid_opacity: Number(encounter?.map_grid_opacity || 0.35),
    map_grid_dashed: Boolean(encounter?.map_grid_dashed),
    map_tokens: mapTokens,
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
  const [mapImageUrl, setMapImageUrl] = useState('');
  const [mapImageFile, setMapImageFile] = useState(null);
  const [mapGridOpacity, setMapGridOpacity] = useState(0.35);
  const [mapGridDashed, setMapGridDashed] = useState(true);
  const [mapCellSize, setMapCellSize] = useState(DEFAULT_MAP_CELL_SIZE);
  const [mapTokens, setMapTokens] = useState([]);
  const [savingMap, setSavingMap] = useState(false);
  const [savingTokens, setSavingTokens] = useState(false);
  const [mapImagePreviewUrl, setMapImagePreviewUrl] = useState('');
  const [dragState, setDragState] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [tokenSelectedFileNames, setTokenSelectedFileNames] = useState({});
  const [mapViewState, setMapViewState] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const [mapPanState, setMapPanState] = useState(null);

  const mapCanvasRef = useRef(null);
  const autoSaveTokensTimerRef = useRef(null);
  const lastPersistedTokensJsonRef = useRef('[]');

  const [query, setQuery] = useState('');

  const activeEncounters = useMemo(() => (encounters || []).filter((encounter) => String(encounter?.status || '') === 'active'), [encounters]);
  const visibleGridCols = Math.max(Math.floor(MAP_CANVAS_WIDTH / mapCellSize), 1);
  const visibleGridRows = Math.max(Math.floor(MAP_CANVAS_HEIGHT / mapCellSize), 1);

  const mapVisible = Boolean(encounterId);

  const participantsByInstanceId = useMemo(() => {
    const map = new Map();
    for (const participant of monsters || []) {
      const key = String(participant?.monster_instance_id || '').trim();
      if (!key) continue;
      const displayName = String(participant?.name || '').trim();
      map.set(key, displayName || 'Участник');
    }
    return map;
  }, [monsters]);

  const getTokenDisplayName = (token) => {
    const linkedId = String(token?.linked_monster_instance_id || '').trim();
    if (!linkedId) return 'Токен';
    return participantsByInstanceId.get(linkedId) || 'Участник';
  };

  const getViewportSize = () => {
    const viewport = mapCanvasRef.current;
    if (!viewport) return { width: MAP_CANVAS_WIDTH, height: MAP_CANVAS_HEIGHT };
    const width = viewport.clientWidth || MAP_CANVAS_WIDTH;
    const height = viewport.clientHeight || MAP_CANVAS_HEIGHT;
    return { width, height };
  };

  const clampMapOffsets = (scale, offsetX, offsetY) => {
    const { width: viewportWidth, height: viewportHeight } = getViewportSize();
    const scaledWidth = MAP_CANVAS_WIDTH * scale;
    const scaledHeight = MAP_CANVAS_HEIGHT * scale;
    const minOffsetX = Math.min(viewportWidth - scaledWidth, 0);
    const minOffsetY = Math.min(viewportHeight - scaledHeight, 0);
    return {
      offsetX: clamp(offsetX, minOffsetX, 0),
      offsetY: clamp(offsetY, minOffsetY, 0),
    };
  };

  const getWorldPointer = (clientX, clientY) => {
    if (!mapCanvasRef.current) return null;
    const rect = mapCanvasRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    return {
      x: (localX - mapViewState.offsetX) / mapViewState.scale,
      y: (localY - mapViewState.offsetY) / mapViewState.scale,
    };
  };

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

  useEffect(() => {
    if (!mapImageFile) {
      setMapImagePreviewUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(mapImageFile);
    setMapImagePreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [mapImageFile]);

  useEffect(() => {
    if (!dragState) return undefined;

    const handleMouseMove = (event) => {
      const worldPointer = getWorldPointer(event.clientX, event.clientY);
      if (!worldPointer) return;

      if (dragState.mode === 'move') {
        const rawX = Math.round((worldPointer.x - dragState.offsetPxX) / mapCellSize);
        const rawY = Math.round((worldPointer.y - dragState.offsetPxY) / mapCellSize);

        setMapTokens((prev) =>
          prev.map((token) => {
            if (token.token_id !== dragState.tokenId) return token;
            const sizeCells = Math.max(Number(token.size_cells || 1), 1);
            const nextX = clamp(rawX, 0, Math.max(visibleGridCols - sizeCells, 0));
            const nextY = clamp(rawY, 0, Math.max(visibleGridRows - sizeCells, 0));
            return { ...token, x: nextX, y: nextY };
          })
        );
      }

      if (dragState.mode === 'resize') {
        const deltaPx = Math.max(worldPointer.x - dragState.startPointerX, worldPointer.y - dragState.startPointerY);
        const deltaCells = Math.round(deltaPx / mapCellSize);

        setMapTokens((prev) =>
          prev.map((token) => {
            if (token.token_id !== dragState.tokenId) return token;
            const currentX = Math.max(Number(token.x || 0), 0);
            const currentY = Math.max(Number(token.y || 0), 0);
            const maxSizeByMap = Math.max(Math.min(visibleGridCols - currentX, visibleGridRows - currentY), 1);
            const nextSize = clamp(dragState.startSizeCells + deltaCells, 1, Math.min(12, maxSizeByMap));
            return { ...token, size_cells: nextSize };
          })
        );
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, mapCellSize, visibleGridCols, visibleGridRows]);

  useEffect(() => {
    if (!mapPanState) return undefined;

    const handleMouseMove = (event) => {
      const deltaX = event.clientX - mapPanState.startClientX;
      const deltaY = event.clientY - mapPanState.startClientY;
      setMapViewState((prev) => {
        const rawOffsetX = mapPanState.startOffsetX + deltaX;
        const rawOffsetY = mapPanState.startOffsetY + deltaY;
        const clamped = clampMapOffsets(prev.scale, rawOffsetX, rawOffsetY);
        return { ...prev, ...clamped };
      });
    };

    const handleMouseUp = () => {
      setMapPanState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mapPanState]);

  useEffect(() => {
    if (!mapVisible) return undefined;
    if (!mapCanvasRef.current) return undefined;
    const element = mapCanvasRef.current;

    const nativeWheel = (event) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;

      setMapViewState((prev) => {
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
        const nextScale = clamp(prev.scale * zoomFactor, MAP_MIN_ZOOM, MAP_MAX_ZOOM);
        const worldX = (pointerX - prev.offsetX) / prev.scale;
        const worldY = (pointerY - prev.offsetY) / prev.scale;
        const rawOffsetX = pointerX - worldX * nextScale;
        const rawOffsetY = pointerY - worldY * nextScale;
        const clamped = clampMapOffsets(nextScale, rawOffsetX, rawOffsetY);
        return { scale: nextScale, ...clamped };
      });
    };

    element.addEventListener('wheel', nativeWheel, { passive: false });
    return () => {
      element.removeEventListener('wheel', nativeWheel);
    };
  }, [mapVisible]);

  useEffect(() => {
    const storageKey = encounterId ? `screen-map-cell-size-${encounterId}` : 'screen-map-cell-size-draft';
    const stored = Number(window.localStorage.getItem(storageKey));
    if (Number.isFinite(stored) && stored >= 16 && stored <= 96) {
      setMapCellSize(stored);
      return;
    }
    setMapCellSize(DEFAULT_MAP_CELL_SIZE);
  }, [encounterId]);

  useEffect(() => {
    const storageKey = encounterId ? `screen-map-cell-size-${encounterId}` : 'screen-map-cell-size-draft';
    window.localStorage.setItem(storageKey, String(mapCellSize));
  }, [encounterId, mapCellSize]);

  useEffect(() => {
    if (autoSaveTokensTimerRef.current) {
      clearTimeout(autoSaveTokensTimerRef.current);
      autoSaveTokensTimerRef.current = null;
    }
    if (!encounterId || dragState) return;

    const nextJson = JSON.stringify(mapTokens || []);
    if (nextJson === lastPersistedTokensJsonRef.current) return;

    autoSaveTokensTimerRef.current = setTimeout(async () => {
      setSavingTokens(true);
      try {
        await screenAPI.updateMapTokens(encounterId, mapTokens);
        lastPersistedTokensJsonRef.current = nextJson;
      } catch (e) {
        console.error(e);
        setError((prev) => prev || e.message || 'Ошибка автосохранения токенов');
      } finally {
        setSavingTokens(false);
      }
    }, 450);

    return () => {
      if (autoSaveTokensTimerRef.current) {
        clearTimeout(autoSaveTokensTimerRef.current);
        autoSaveTokensTimerRef.current = null;
      }
    };
  }, [encounterId, mapTokens, dragState]);

  useEffect(() => {
    setMapTokens((prev) =>
      prev.map((token) => {
        const rawSize = Math.max(Number(token.size_cells || 1), 1);
        const safeSize = clamp(rawSize, 1, Math.min(12, Math.max(Math.min(visibleGridCols, visibleGridRows), 1)));
        const safeX = clamp(Math.max(Number(token.x || 0), 0), 0, Math.max(visibleGridCols - safeSize, 0));
        const safeY = clamp(Math.max(Number(token.y || 0), 0), 0, Math.max(visibleGridRows - safeSize, 0));
        if (safeSize === rawSize && safeX === Number(token.x || 0) && safeY === Number(token.y || 0)) {
          return token;
        }
        return { ...token, x: safeX, y: safeY, size_cells: safeSize };
      })
    );
  }, [visibleGridCols, visibleGridRows]);

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

  const syncEncounter = (encounter, options = {}) => {
    const preserveMapDraft = Boolean(options?.preserveMapDraft);
    const next = normalizeEncounter(encounter);
    setEncounterId(next.id || null);
    setEncounterName(next.name || '');
    setEncounterStatus(next.status || 'draft');
    setMonsters(Array.isArray(next.monsters) ? next.monsters : []);
    setMapImageUrl(String(next.map_image_url || ''));
    if (!preserveMapDraft) setMapImageFile(null);
    setMapGridOpacity(Number(next.map_grid_opacity || 0.35));
    setMapGridDashed(Boolean(next.map_grid_dashed));
    const nextTokens = Array.isArray(next.map_tokens) ? next.map_tokens : [];
    setMapTokens(nextTokens);
    lastPersistedTokensJsonRef.current = JSON.stringify(nextTokens);
    setSelectedTokenId(null);
  };

  const handleNewEncounter = () => {
    setEncounterId(null);
    setEncounterName('');
    setEncounterStatus('draft');
    setMonsters([]);
    setMapImageUrl('');
    setMapImageFile(null);
    setMapGridOpacity(0.35);
    setMapGridDashed(true);
    setMapCellSize(DEFAULT_MAP_CELL_SIZE);
    setMapTokens([]);
    lastPersistedTokensJsonRef.current = '[]';
    setSelectedTokenId(null);
    setTokenSelectedFileNames({});
    setError('');
  };

  const saveMapAndTokens = async () => {
    setError('');
    if (!encounterId) {
      setError('Сначала сохраните энкаунтер, затем карту');
      return;
    }

    setSavingMap(true);
    setSavingTokens(true);
    try {
      await screenAPI.updateMapConfig(encounterId, {
        grid_size_ft: 5,
        grid_opacity: mapGridOpacity,
        grid_dashed: mapGridDashed ? 1 : 0,
      }, mapImageFile);
      const data = await screenAPI.updateMapTokens(encounterId, mapTokens);
      syncEncounter(data);
      setTokenSelectedFileNames({});
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка сохранения карты и токенов');
    } finally {
      setSavingMap(false);
      setSavingTokens(false);
    }
  };

  const addTokenFromParticipant = (participant) => {
    const linkedId = String(participant?.monster_instance_id || '').trim();
    if (linkedId && mapTokens.some((token) => String(token?.linked_monster_instance_id || '').trim() === linkedId)) {
      return;
    }
    setMapTokens((prev) => [
      ...prev,
      {
        token_id: randomTokenId(),
        linked_monster_instance_id: linkedId || null,
        image_url: null,
        x: 0,
        y: 0,
        size_cells: 1,
        font_family: 'Inter',
        font_size: 14,
      },
    ]);
  };

  const updateTokenField = (tokenId, key, value) => {
    if (key === 'linked_monster_instance_id' && value) {
      const nextLinkedId = String(value).trim();
      setMapTokens((prev) => prev.map((token) => {
        if (token.token_id === tokenId) return { ...token, [key]: nextLinkedId };
        const linked = String(token?.linked_monster_instance_id || '').trim();
        if (linked && linked === nextLinkedId) {
          return { ...token, linked_monster_instance_id: null };
        }
        return token;
      }));
      return;
    }
    setMapTokens((prev) => prev.map((token) => (token.token_id === tokenId ? { ...token, [key]: value } : token)));
  };

  const uploadTokenImage = async (token, file) => {
    setError('');
    if (!encounterId) {
      setError('Сначала сохраните энкаунтер, затем изображение токена');
      return;
    }
    if (!file) return;
    const linkedMonsterId = String(token?.linked_monster_instance_id || '').trim();
    const sourceParticipant = (monsters || []).find((participant) => String(participant?.monster_instance_id || '').trim() === linkedMonsterId);
    const sourceBestiaryId = Number(sourceParticipant?.bestiary_id || 0);
    const sameTypeInstanceIds = new Set(
      (monsters || [])
        .filter((participant) => Number(participant?.bestiary_id || 0) > 0 && Number(participant?.bestiary_id || 0) === sourceBestiaryId)
        .map((participant) => String(participant?.monster_instance_id || '').trim())
        .filter(Boolean)
    );
    const targetTokens = sourceBestiaryId > 0
      ? (mapTokens || []).filter((item) => sameTypeInstanceIds.has(String(item?.linked_monster_instance_id || '').trim()))
      : [token];
    const effectiveTargets = targetTokens.length > 0 ? targetTokens : [token];
    const targetTokenIds = effectiveTargets.map((item) => String(item.token_id));

    setTokenSelectedFileNames((prev) => {
      const next = { ...prev };
      for (const tokenId of targetTokenIds) next[tokenId] = file.name;
      return next;
    });
    const localPreviewUrl = URL.createObjectURL(file);
    setMapTokens((prev) => prev.map((item) => (targetTokenIds.includes(String(item.token_id)) ? { ...item, image_url: localPreviewUrl } : item)));
    try {
      let data = null;
      for (const target of effectiveTargets) {
        data = await screenAPI.updateTokenImage(encounterId, target.token_id, file);
      }
      if (data) syncEncounter(data, { preserveMapDraft: true });
      URL.revokeObjectURL(localPreviewUrl);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки изображения токена');
    }
  };

  const startTokenDrag = (event, token) => {
    const worldPointer = getWorldPointer(event.clientX, event.clientY);
    if (!worldPointer) return;
    setSelectedTokenId(token.token_id);
    const leftPx = Math.max(Number(token.x || 0), 0) * mapCellSize;
    const topPx = Math.max(Number(token.y || 0), 0) * mapCellSize;

    setDragState({
      mode: 'move',
      tokenId: token.token_id,
      offsetPxX: worldPointer.x - leftPx,
      offsetPxY: worldPointer.y - topPx,
    });
  };

  const startTokenResize = (event, token) => {
    event.preventDefault();
    event.stopPropagation();
    const worldPointer = getWorldPointer(event.clientX, event.clientY);
    if (!worldPointer) return;
    setSelectedTokenId(token.token_id);
    setDragState({
      mode: 'resize',
      tokenId: token.token_id,
      startPointerX: worldPointer.x,
      startPointerY: worldPointer.y,
      startSizeCells: Math.max(Number(token.size_cells || 1), 1),
    });
  };

  const startMapPan = (event) => {
    if (event.button !== 0) return;
    setSelectedTokenId(null);
    setMapPanState({
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffsetX: mapViewState.offsetX,
      startOffsetY: mapViewState.offsetY,
    });
  };

  const removeToken = async (token) => {
    setError('');
    if (!encounterId) {
      setMapTokens((prev) => prev.filter((item) => item.token_id !== token.token_id));
      if (selectedTokenId === token.token_id) setSelectedTokenId(null);
      return;
    }
    try {
      const data = await screenAPI.removeToken(encounterId, token.token_id);
      syncEncounter(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления токена');
    }
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

        {encounterId ? (
        <section className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
          <div className="text-sm font-semibold text-gray-900">Тактическая карта</div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-1 space-y-3">
              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Изображение карты</div>
                <input
                  id="map-image-file-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setMapImageFile(event.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="map-image-file-input"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer truncate"
                >
                  {mapImageFile?.name || 'Нажмите, чтобы выбрать файл карты'}
                </label>
                <div className="text-xs text-gray-500 mt-1">Конвертируется в webp на сервере</div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Прозрачность</div>
                <input
                  type="number"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={mapGridOpacity}
                  onChange={(event) => setMapGridOpacity(Number(event.target.value || 0.35))}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Размер клетки на карте: {mapCellSize}px</div>
                <input
                  type="range"
                  min={16}
                  max={96}
                  step={1}
                  value={mapCellSize}
                  onChange={(event) => setMapCellSize(Number(event.target.value || DEFAULT_MAP_CELL_SIZE))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(mapGridDashed)}
                    onChange={(event) => setMapGridDashed(event.target.checked)}
                  />
                  Сетка пунктирами
                </label>
              </div>

              <div className="pt-2 border-t">
                <button
                  type="button"
                  onClick={saveMapAndTokens}
                  disabled={savingMap || savingTokens}
                  className="w-full rounded-lg bg-purple-600 text-white px-4 py-2 hover:bg-purple-700 disabled:opacity-70"
                >
                  {(savingMap || savingTokens) ? 'Сохранение…' : 'Сохранить'}
                </button>
              </div>
            </div>

            <div className="xl:col-span-2 space-y-3 min-w-0">
              <TacticalMapEditor
                participants={monsters}
                mapViewportRef={mapCanvasRef}
                mapPanState={mapPanState}
                onMapMouseDown={startMapPan}
                mapWidth={MAP_CANVAS_WIDTH}
                mapHeight={MAP_CANVAS_HEIGHT}
                mapViewState={mapViewState}
                mapImageUrl={mapImagePreviewUrl || mapImageUrl}
                mapCellSize={mapCellSize}
                mapGridDashed={mapGridDashed}
                mapGridOpacity={mapGridOpacity}
                visibleGridCols={visibleGridCols}
                visibleGridRows={visibleGridRows}
                mapTokens={mapTokens}
                selectedTokenId={selectedTokenId}
                activeDragTokenId={dragState?.tokenId || null}
                getTokenDisplayName={getTokenDisplayName}
                onTokenMouseDown={startTokenDrag}
                onTokenResizeMouseDown={startTokenResize}
                onSelectToken={setSelectedTokenId}
                onAddTokenFromParticipant={addTokenFromParticipant}
                onUploadMapFile={(file) => setMapImageFile(file)}
                mapUploadButtonLabel={mapImageFile?.name || 'Загрузить карту'}
                onUpdateTokenField={updateTokenField}
                onUploadTokenImage={uploadTokenImage}
                onRemoveToken={removeToken}
                tokenSelectedFileNames={tokenSelectedFileNames}
              />
            </div>
          </div>
        </section>
        ) : null}

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
