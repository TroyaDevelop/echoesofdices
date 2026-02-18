import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import TacticalMapEditor from '../../components/admin/TacticalMapEditor.jsx';
import { bestiaryAPI, screenAPI } from '../../lib/api.js';

const MAP_CANVAS_WIDTH = 960;
const MAP_CANVAS_HEIGHT = 640;
const DEFAULT_MAP_CELL_SIZE = 32;
const MAP_MIN_ZOOM = 1;
const MAP_MAX_ZOOM = 2.5;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const randomTokenId = () => `t_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

const parseHp = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(Math.trunc(n), 0);
};

export default function AdminBattleSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [rebroadcasting, setRebroadcasting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const [encounter, setEncounter] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [monsterQuery, setMonsterQuery] = useState('');
  const [mapTokens, setMapTokens] = useState([]);
  const [mapDragState, setMapDragState] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [tokenSelectedFileNames, setTokenSelectedFileNames] = useState({});
  const [savingMapTokens, setSavingMapTokens] = useState(false);
  const [replacingMap, setReplacingMap] = useState(false);
  const [mapCellSize, setMapCellSize] = useState(DEFAULT_MAP_CELL_SIZE);
  const [mapViewState, setMapViewState] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const [mapPanState, setMapPanState] = useState(null);

  const mapViewportRef = useRef(null);
  const autoSaveTokensTimerRef = useRef(null);
  const lastPersistedTokensJsonRef = useRef('[]');

  const visibleGridCols = Math.max(Math.floor(MAP_CANVAS_WIDTH / mapCellSize), 1);
  const visibleGridRows = Math.max(Math.floor(MAP_CANVAS_HEIGHT / mapCellSize), 1);

  const syncSessionData = (data) => {
    const nextEncounter = data || null;
    const nextParticipants = Array.isArray(data?.monsters) ? data.monsters : [];
    const nextMapTokens = Array.isArray(data?.map_tokens) ? data.map_tokens : [];
    setEncounter(nextEncounter);
    setParticipants(nextParticipants);
    setMapTokens(nextMapTokens);
    setSelectedTokenId(null);
    lastPersistedTokensJsonRef.current = JSON.stringify(nextMapTokens);
  };

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [data, bestiary] = await Promise.all([
        screenAPI.getEncounterById(id),
        bestiaryAPI.listAdmin(),
      ]);
      syncSessionData(data);
      setCatalog(Array.isArray(bestiary) ? bestiary : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки сессии боя');
      setEncounter(null);
      setParticipants([]);
      setMapTokens([]);
      setCatalog([]);
      lastPersistedTokensJsonRef.current = '[]';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    const storageKey = id ? `screen-map-cell-size-${id}` : 'screen-map-cell-size-draft';
    const stored = Number(window.localStorage.getItem(storageKey));
    if (Number.isFinite(stored) && stored >= 16 && stored <= 96) {
      setMapCellSize(stored);
      return;
    }
    setMapCellSize(DEFAULT_MAP_CELL_SIZE);
  }, [id]);

  const initiativeOrder = useMemo(() => {
    const list = Array.isArray(encounter?.initiative_order) ? encounter.initiative_order : [];
    return list;
  }, [encounter]);

  const mapVisible = Boolean(encounter?.map_image_url || mapTokens.length > 0);

  const participantsByInstanceId = useMemo(() => {
    const map = new Map();
    for (const participant of participants || []) {
      const key = String(participant?.monster_instance_id || '').trim();
      if (!key) continue;
      const displayName = String(participant?.name || '').trim();
      map.set(key, displayName || 'Участник');
    }
    return map;
  }, [participants]);

  const initiativeIndexByInstanceId = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < initiativeOrder.length; i += 1) {
      const row = initiativeOrder[i];
      const key = String(row?.monster_instance_id || '').trim();
      if (!key || map.has(key)) continue;
      map.set(key, i + 1);
    }
    return map;
  }, [initiativeOrder]);

  const filteredCatalogMonsters = useMemo(() => {
    const query = String(monsterQuery || '').trim().toLowerCase();
    if (!query) return [];
    return (catalog || [])
      .filter((monster) => {
        const name = String(monster?.name || '').trim().toLowerCase();
        const nameEn = String(monster?.name_en || '').trim().toLowerCase();
        return name.includes(query) || nameEn.includes(query);
      })
      .slice(0, 8);
  }, [catalog, monsterQuery]);

  const getViewportSize = () => {
    const viewport = mapViewportRef.current;
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
    if (!mapViewportRef.current) return null;
    const rect = mapViewportRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    return {
      x: (localX - mapViewState.offsetX) / mapViewState.scale,
      y: (localY - mapViewState.offsetY) / mapViewState.scale,
    };
  };

  useEffect(() => {
    if (!mapDragState) return undefined;

    const handleMouseMove = (event) => {
      const worldPointer = getWorldPointer(event.clientX, event.clientY);
      if (!worldPointer) return;

      if (mapDragState.mode === 'move') {
        const rawX = Math.round((worldPointer.x - mapDragState.offsetPxX) / mapCellSize);
        const rawY = Math.round((worldPointer.y - mapDragState.offsetPxY) / mapCellSize);

        setMapTokens((prev) =>
          prev.map((token) => {
            if (token.token_id !== mapDragState.tokenId) return token;
            const sizeCells = Math.max(Number(token.size_cells || 1), 1);
            const nextX = clamp(rawX, 0, Math.max(visibleGridCols - sizeCells, 0));
            const nextY = clamp(rawY, 0, Math.max(visibleGridRows - sizeCells, 0));
            return { ...token, x: nextX, y: nextY };
          })
        );
      }

      if (mapDragState.mode === 'resize') {
        const deltaPx = Math.max(worldPointer.x - mapDragState.startPointerX, worldPointer.y - mapDragState.startPointerY);
        const deltaCells = Math.round(deltaPx / mapCellSize);

        setMapTokens((prev) =>
          prev.map((token) => {
            if (token.token_id !== mapDragState.tokenId) return token;
            const currentX = Math.max(Number(token.x || 0), 0);
            const currentY = Math.max(Number(token.y || 0), 0);
            const maxSizeByMap = Math.max(Math.min(visibleGridCols - currentX, visibleGridRows - currentY), 1);
            const nextSize = clamp(mapDragState.startSizeCells + deltaCells, 1, Math.min(12, maxSizeByMap));
            return { ...token, size_cells: nextSize };
          })
        );
      }
    };

    const handleMouseUp = () => {
      setMapDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mapDragState, visibleGridCols, visibleGridRows, mapCellSize]);

  useEffect(() => {
    if (!mapPanState) return undefined;

    const handleMouseMove = (event) => {
      const deltaX = event.clientX - mapPanState.startClientX;
      const deltaY = event.clientY - mapPanState.startClientY;
      setMapViewState((prev) => {
        const nextOffsetX = mapPanState.startOffsetX + deltaX;
        const nextOffsetY = mapPanState.startOffsetY + deltaY;
        const clamped = clampMapOffsets(prev.scale, nextOffsetX, nextOffsetY);
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
    if (!mapViewportRef.current) return undefined;
    const element = mapViewportRef.current;

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
    if (autoSaveTokensTimerRef.current) {
      clearTimeout(autoSaveTokensTimerRef.current);
      autoSaveTokensTimerRef.current = null;
    }
    if (!encounter?.id || mapDragState) return;

    const nextJson = JSON.stringify(mapTokens || []);
    if (nextJson === lastPersistedTokensJsonRef.current) return;

    autoSaveTokensTimerRef.current = setTimeout(async () => {
      setSavingMapTokens(true);
      try {
        await screenAPI.updateMapTokens(encounter.id, mapTokens);
        lastPersistedTokensJsonRef.current = nextJson;
      } catch (e) {
        console.error(e);
        setError((prev) => prev || e.message || 'Ошибка автосохранения карты боя');
      } finally {
        setSavingMapTokens(false);
      }
    }, 450);

    return () => {
      if (autoSaveTokensTimerRef.current) {
        clearTimeout(autoSaveTokensTimerRef.current);
        autoSaveTokensTimerRef.current = null;
      }
    };
  }, [encounter?.id, mapTokens, mapDragState]);

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

  const loadImageSafe = (src) =>
    new Promise((resolve) => {
      const url = String(src || '').trim();
      if (!url) {
        resolve(null);
        return;
      }
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = url;
    });

  const buildCurrentMapSnapshotDataUrl = async () => {
    if (!mapViewportRef.current) return null;

    const viewportWidth = mapViewportRef.current.clientWidth || MAP_CANVAS_WIDTH;
    const viewportHeight = mapViewportRef.current.clientHeight || MAP_CANVAS_HEIGHT;
    if (!viewportWidth || !viewportHeight) return null;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(Math.trunc(viewportWidth), 1);
    canvas.height = Math.max(Math.trunc(viewportHeight), 1);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const mapImage = await loadImageSafe(encounter?.map_image_url || '');
    const tokenImageEntries = await Promise.all(
      (mapTokens || []).map(async (token) => {
        const tokenImage = await loadImageSafe(token?.image_url || '');
        return [String(token?.token_id || ''), tokenImage];
      })
    );
    const tokenImages = new Map(tokenImageEntries);

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(mapViewState.offsetX, mapViewState.offsetY);
    ctx.scale(mapViewState.scale, mapViewState.scale);

    if (mapImage) {
      ctx.drawImage(mapImage, 0, 0, MAP_CANVAS_WIDTH, MAP_CANVAS_HEIGHT);
    }

    const gridOpacity = Number(encounter?.map_grid_opacity || 0.35);
    const gridColor = `rgba(255,255,255,${gridOpacity})`;
    ctx.lineWidth = 1;
    ctx.strokeStyle = gridColor;
    if (encounter?.map_grid_dashed) {
      ctx.setLineDash([4, 4]);
    } else {
      ctx.setLineDash([]);
    }

    for (let x = 0; x <= visibleGridCols; x += 1) {
      const px = x * mapCellSize;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, MAP_CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= visibleGridRows; y += 1) {
      const py = y * mapCellSize;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(MAP_CANVAS_WIDTH, py);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    for (const token of mapTokens || []) {
      const sizeCells = Math.max(Number(token.size_cells || 1), 1);
      const left = Math.max(Number(token.x || 0), 0) * mapCellSize;
      const top = Math.max(Number(token.y || 0), 0) * mapCellSize;
      const sizePx = sizeCells * mapCellSize;
      const centerX = left + sizePx / 2;
      const centerY = top + sizePx / 2;
      const radius = sizePx / 2;
      const linkedId = String(token?.linked_monster_instance_id || '').trim();
      const baseName = linkedId ? participantsByInstanceId.get(linkedId) || 'Участник' : 'Токен';
      const turnIndex = linkedId ? initiativeIndexByInstanceId.get(linkedId) : null;
      const displayName = Number.isFinite(turnIndex) ? `${baseName} ${turnIndex}` : baseName;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const tokenImage = tokenImages.get(String(token?.token_id || ''));
      if (tokenImage) {
        ctx.drawImage(tokenImage, left, top, sizePx, sizePx);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(left, top, sizePx, sizePx);
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(Math.round(sizePx * 0.25), 11)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(baseName.slice(0, 2), centerX, centerY);
      }
      ctx.restore();

      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.max(Number(token.font_size || 14), 10)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.strokeStyle = 'rgba(0,0,0,0.75)';
      ctx.lineWidth = 3;
      const labelY = top + sizePx + 2;
      ctx.strokeText(displayName, centerX, labelY);
      ctx.fillText(displayName, centerX, labelY);
    }

    ctx.restore();

    return canvas.toDataURL('image/png');
  };

  const handleRebroadcast = async () => {
    setError('');
    if (!encounter?.id) return;
    setRebroadcasting(true);
    try {
      let mapViewDataUrl = null;
      try {
        mapViewDataUrl = await buildCurrentMapSnapshotDataUrl();
      } catch (snapshotError) {
        console.error('Не удалось сформировать снимок карты для отправки в чат:', snapshotError);
      }
      const data = await screenAPI.rebroadcastOrder(encounter.id, {
        map_view_data_url: mapViewDataUrl,
      });
      syncSessionData(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка переотправки порядка ходов');
    } finally {
      setRebroadcasting(false);
    }
  };

  const handleFinish = async () => {
    setError('');
    if (!encounter?.id) return;
    if (!window.confirm('Завершить бой?')) return;

    setFinishing(true);
    try {
      await screenAPI.finishEncounter(encounter.id);
      navigate('/admin/screen/encounters', { replace: true });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка завершения боя');
    } finally {
      setFinishing(false);
    }
  };

  const setParticipantHpLocal = (monsterInstanceId, value) => {
    setParticipants((prev) =>
      prev.map((participant) => {
        if (participant.monster_instance_id !== monsterInstanceId) return participant;
        if (value === '') return { ...participant, hp_current: '' };
        const parsed = parseHp(value);
        if (parsed === null) return participant;
        return { ...participant, hp_current: parsed };
      })
    );
  };

  const setParticipantInitiativeLocal = (monsterInstanceId, value) => {
    setParticipants((prev) =>
      prev.map((participant) => {
        if (participant.monster_instance_id !== monsterInstanceId) return participant;
        if (value === '') {
          return {
            ...participant,
            initiative_total: '',
            initiative_custom: String(participant?.participant_type || '') === 'player' ? '' : participant.initiative_custom,
          };
        }
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return participant;
        const next = Math.trunc(parsed);
        if (String(participant?.participant_type || '') === 'player') {
          return { ...participant, initiative_total: next, initiative_custom: next };
        }
        return { ...participant, initiative_total: next, initiative_custom: next };
      })
    );
  };

  const handleUpdateHp = async (participant) => {
    setError('');
    if (!encounter?.id) return;

    const hpCurrent = Number(participant?.hp_current);
    if (!Number.isFinite(hpCurrent) || hpCurrent < 0) {
      setError('HP должно быть неотрицательным числом');
      return;
    }

    try {
      const data = await screenAPI.updateMonsterHp(encounter.id, participant.monster_instance_id, Math.trunc(hpCurrent));
      syncSessionData(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка обновления HP');
    }
  };

  const handleUpdateInitiative = async (participant) => {
    setError('');
    if (!encounter?.id) return;
    const initiative = Number(participant?.initiative_total);
    if (!Number.isFinite(initiative)) {
      setError('Инициатива должна быть числом');
      return;
    }
    try {
      const data = await screenAPI.updateParticipantInitiative(
        encounter.id,
        participant.monster_instance_id,
        Math.trunc(initiative)
      );
      syncSessionData(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка обновления инициативы');
    }
  };

  const handleUpdateParticipantStats = async (participant) => {
    setError('');
    if (!encounter?.id) return;

    const hpCurrent = Number(participant?.hp_current);
    const initiative = Number(participant?.initiative_total);

    if (!Number.isFinite(hpCurrent) || hpCurrent < 0) {
      setError('HP должно быть неотрицательным числом');
      return;
    }
    if (!Number.isFinite(initiative)) {
      setError('Инициатива должна быть числом');
      return;
    }

    try {
      await screenAPI.updateMonsterHp(encounter.id, participant.monster_instance_id, Math.trunc(hpCurrent));
      const data = await screenAPI.updateParticipantInitiative(
        encounter.id,
        participant.monster_instance_id,
        Math.trunc(initiative)
      );
      syncSessionData(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка обновления параметров участника');
    }
  };

  const handleAddMonsterToBattle = async (monster) => {
    setError('');
    if (!encounter?.id) return;
    try {
      const data = await screenAPI.addParticipantFromBestiary(encounter.id, Number(monster?.id));
      syncSessionData(data);
      setMonsterQuery('');
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка добавления существа в бой');
    }
  };

  const handleReplaceMap = async (file) => {
    if (!encounter?.id || !file) return;
    setError('');
    setReplacingMap(true);
    try {
      const data = await screenAPI.updateMapConfig(encounter.id, {
        grid_size_ft: Number(encounter?.map_grid_size_ft || 5),
        grid_opacity: Number(encounter?.map_grid_opacity || 0.35),
        grid_dashed: encounter?.map_grid_dashed ? 1 : 0,
      }, file);
      syncSessionData(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка замены карты боя');
    } finally {
      setReplacingMap(false);
    }
  };

  const handleRemoveParticipant = async (participant) => {
    setError('');
    if (!encounter?.id) return;
    if (!participant?.monster_instance_id) return;
    if (!window.confirm(`Удалить участника "${participant.name || 'без имени'}" из боя?`)) return;

    try {
      const data = await screenAPI.removeParticipant(encounter.id, participant.monster_instance_id);
      syncSessionData(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления участника из боя');
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
    if (!encounter?.id || !file) return;
    const linkedMonsterId = String(token?.linked_monster_instance_id || '').trim();
    const sourceParticipant = (participants || []).find((participant) => String(participant?.monster_instance_id || '').trim() === linkedMonsterId);
    const sourceBestiaryId = Number(sourceParticipant?.bestiary_id || 0);
    const sameTypeInstanceIds = new Set(
      (participants || [])
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
        data = await screenAPI.updateTokenImage(encounter.id, target.token_id, file);
      }
      if (data) syncSessionData(data);
      URL.revokeObjectURL(localPreviewUrl);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки изображения токена');
    }
  };

  const removeToken = async (token) => {
    if (!encounter?.id) {
      setMapTokens((prev) => prev.filter((item) => item.token_id !== token.token_id));
      if (selectedTokenId === token.token_id) setSelectedTokenId(null);
      return;
    }
    try {
      const data = await screenAPI.removeToken(encounter.id, token.token_id);
      syncSessionData(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления токена');
    }
  };

  const getTokenDisplayName = (token) => {
    const linkedId = String(token?.linked_monster_instance_id || '').trim();
    const baseName = linkedId ? participantsByInstanceId.get(linkedId) || 'Участник' : 'Токен';
    const turnIndex = linkedId ? initiativeIndexByInstanceId.get(linkedId) : null;
    return Number.isFinite(turnIndex) ? `${baseName} ${turnIndex}` : baseName;
  };

  const startTokenDrag = (event, token) => {
    const worldPointer = getWorldPointer(event.clientX, event.clientY);
    if (!worldPointer) return;
    setSelectedTokenId(token.token_id);
    const leftPx = Math.max(Number(token.x || 0), 0) * mapCellSize;
    const topPx = Math.max(Number(token.y || 0), 0) * mapCellSize;

    setMapDragState({
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
    setMapDragState({
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Столкновение</h1>
        </div>

        {error ? <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {loading ? (
          <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">Загрузка сессии…</div>
        ) : null}

        {!loading && !encounter ? (
          <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">Сессия боя не найдена или уже завершена.</div>
        ) : null}

        {!loading && encounter ? (
          <>
            <section className="rounded-lg border bg-white p-4 space-y-2">
              <div className="text-lg font-semibold text-gray-900">Идет бой. Мастер: {encounter.master_name || '—'}</div>
              <div className="text-sm text-gray-600">Энкаунтер: {encounter.name}</div>
              <div className="text-sm text-gray-600">Статус: {encounter.status}</div>
            </section>

            <section className="rounded-lg border bg-white p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRebroadcast}
                  disabled={rebroadcasting || encounter.status !== 'active'}
                  className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 disabled:opacity-70"
                >
                  {rebroadcasting ? 'Отправка…' : 'Обновить статус боя'}
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={finishing}
                  className="rounded-lg bg-red-600 text-white px-4 py-2 hover:bg-red-700 disabled:opacity-70"
                >
                  {finishing ? 'Завершение…' : 'Завершить бой'}
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">Добавить существо из бестиария</div>
                <div className="relative">
                  <input
                    value={monsterQuery}
                    onChange={(event) => setMonsterQuery(event.target.value)}
                    placeholder="Поиск существа..."
                    className="w-full rounded-lg border px-3 py-2"
                  />
                  {filteredCatalogMonsters.length > 0 ? (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border bg-white shadow-lg overflow-hidden">
                      {filteredCatalogMonsters.map((monster) => (
                        <button
                          key={monster.id}
                          type="button"
                          onClick={() => handleAddMonsterToBattle(monster)}
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

            <section className="rounded-lg border bg-white p-4 space-y-3">
              <div className="text-sm font-semibold text-gray-900">Участники боя</div>
              {participants.length === 0 ? (
                <div className="text-sm text-gray-500">Участники не найдены.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {participants.map((participant) => (
                    <div key={participant.monster_instance_id} className="rounded-lg border border-gray-200 p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            {participant.name} {participant.participant_type === 'player' ? '(игрок)' : ''}
                          </div>
                          <div className="text-xs text-gray-500">
                            {participant.participant_type === 'player'
                              ? 'Игрок'
                              : `CR ${participant.challenge_rating || '—'} · КД ${participant.armor_class || '—'} · HP базовые ${participant.hit_points || '—'}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(participant)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          Удалить из боя
                        </button>
                      </div>

                      {participant.participant_type !== 'player' ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-700">
                          <div className="rounded border px-2 py-1">СИЛ: {participant.strength ?? '—'}</div>
                          <div className="rounded border px-2 py-1">ЛОВ: {participant.dexterity ?? '—'} ({Number(participant.dex_mod || 0) >= 0 ? '+' : ''}{Number(participant.dex_mod || 0)})</div>
                          <div className="rounded border px-2 py-1">ТЕЛ: {participant.constitution ?? '—'}</div>
                          <div className="rounded border px-2 py-1">Скорость: {participant.speed || '—'}</div>
                          <div className="rounded border px-2 py-1">ИНТ: {participant.intelligence ?? '—'}</div>
                          <div className="rounded border px-2 py-1">МДР: {participant.wisdom ?? '—'}</div>
                          <div className="rounded border px-2 py-1">ХАР: {participant.charisma ?? '—'}</div>
                          <div className="rounded border px-2 py-1">Тип: {participant.creature_type || '—'}</div>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={participant.hp_current ?? ''}
                          onChange={(event) => setParticipantHpLocal(participant.monster_instance_id, event.target.value)}
                          className="w-28 rounded-lg border px-3 py-2"
                          placeholder="Текущий HP"
                        />
                        <input
                          type="number"
                          value={participant.initiative_total ?? ''}
                          onChange={(event) => setParticipantInitiativeLocal(participant.monster_instance_id, event.target.value)}
                          className="w-28 rounded-lg border px-3 py-2"
                          placeholder="Инициатива"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateParticipantStats(participant)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          Обновить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-lg border bg-white p-4">
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-3 items-start">
                <div className="space-y-3 min-w-0">
                  {!encounter?.map_image_url && mapTokens.length === 0 ? (
                    <div className="text-sm text-gray-500">Карта в этом бою не настроена.</div>
                  ) : (
                    <TacticalMapEditor
                      participants={participants}
                      mapViewportRef={mapViewportRef}
                      mapPanState={mapPanState}
                      onMapMouseDown={startMapPan}
                      mapWidth={MAP_CANVAS_WIDTH}
                      mapHeight={MAP_CANVAS_HEIGHT}
                      mapViewState={mapViewState}
                      mapImageUrl={encounter?.map_image_url || ''}
                      mapCellSize={mapCellSize}
                      mapGridDashed={Boolean(encounter?.map_grid_dashed)}
                      mapGridOpacity={Number(encounter?.map_grid_opacity || 0.35)}
                      visibleGridCols={visibleGridCols}
                      visibleGridRows={visibleGridRows}
                      mapTokens={mapTokens}
                      selectedTokenId={selectedTokenId}
                      activeDragTokenId={mapDragState?.tokenId || null}
                      getTokenDisplayName={getTokenDisplayName}
                      onTokenMouseDown={startTokenDrag}
                      onTokenResizeMouseDown={startTokenResize}
                      onSelectToken={setSelectedTokenId}
                      onAddTokenFromParticipant={addTokenFromParticipant}
                      onUploadMapFile={handleReplaceMap}
                      mapUploadButtonLabel={replacingMap ? 'Замена карты…' : 'Загрузить карту'}
                      onUpdateTokenField={updateTokenField}
                      onUploadTokenImage={uploadTokenImage}
                      onRemoveToken={removeToken}
                      tokenSelectedFileNames={tokenSelectedFileNames}
                    />
                  )}
                </div>

                <aside className="rounded-lg border border-gray-200 p-2 bg-gray-50">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Текущий порядок ходов</div>
                  {initiativeOrder.length === 0 ? (
                    <div className="text-sm text-gray-500">Порядок ходов пока не сформирован.</div>
                  ) : (
                    <ol className={`space-y-1 ${initiativeOrder.length > 15 ? 'max-h-[36rem] overflow-auto pr-1' : ''}`}>
                      {initiativeOrder.map((row, index) => (
                        <li key={row.monster_instance_id} className="rounded border border-gray-200 bg-white px-2 py-1.5 flex items-center justify-between">
                          <span className="text-sm text-gray-900 truncate pr-2">{index + 1}. {row.name} {row.participant_type === 'player' ? '(игрок)' : ''}</span>
                          <span className="text-xs text-gray-600 whitespace-nowrap">{row.initiative_total} (к20: {Math.max(Number(row.initiative_roll) || 0, 1)} {row.dex_mod >= 0 ? '+' : ''}{row.dex_mod})</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </aside>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
