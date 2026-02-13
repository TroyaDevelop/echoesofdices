import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { spellsAPI, userProfileAPI } from '../../lib/api.js';
import { API_URL } from '../../lib/config.js';


const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.trunc(v)));
const abilityMod = (score) => {
  const n = Number(score);
  if (!Number.isFinite(n)) return 0;
  return Math.floor((n - 10) / 2);
};
const fmtBonus = (v) => (v >= 0 ? `+${v}` : String(v));
const profBonusForLevel = (lvl) => {
  if (lvl >= 17) return 6;
  if (lvl >= 13) return 5;
  if (lvl >= 9) return 4;
  if (lvl >= 5) return 3;
  return 2;
};
const nextProf = (v) => ((Number(v) || 0) + 1) % 3;
const MAX_HIT_DICE_ROWS = 3;
const normalizeCharacterImageUrl = (value) => {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || /^data:/i.test(url) || /^blob:/i.test(url)) return url;
  if (url.startsWith('/')) return url;
  return `/${url}`;
};
const resolveCharacterImageSrc = (value) => {
  const normalized = normalizeCharacterImageUrl(value);
  if (!normalized) return '';
  if (/^(https?:)?\/\//i.test(normalized) || /^data:/i.test(normalized) || /^blob:/i.test(normalized)) return normalized;
  if (!normalized.startsWith('/uploads/')) return normalized;
  try {
    const apiUrl = new URL(API_URL, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return `${apiUrl.origin}${normalized}`;
  } catch {
    return normalized;
  }
};
const profDot = (v) =>
  v === 2
    ? 'border-emerald-200 bg-emerald-400 ring-2 ring-emerald-200/70'
    : v === 1
      ? 'border-emerald-300/70 bg-emerald-400'
      : 'border-white/40';

const ABILITIES = [
  { key: 'strength', label: 'Сила', short: 'СИЛ' },
  { key: 'dexterity', label: 'Ловкость', short: 'ЛОВ' },
  { key: 'constitution', label: 'Телосложение', short: 'ТЕЛ' },
  { key: 'intelligence', label: 'Интеллект', short: 'ИНТ' },
  { key: 'wisdom', label: 'Мудрость', short: 'МДР' },
  { key: 'charisma', label: 'Харизма', short: 'ХАР' },
];

const ABILITY_BY_KEY = Object.fromEntries(ABILITIES.map((a) => [a.key, a]));
const ABILITIES_LEFT = ['strength', 'constitution', 'wisdom'];
const ABILITIES_RIGHT = ['dexterity', 'intelligence', 'charisma'];

const SAVES = ABILITIES.map((a) => ({ key: `save_${a.key}`, ability: a.key, label: a.label }));

const SKILLS = [
  { key: 'skill_acrobatics', label: 'Акробатика', ability: 'dexterity' },
  { key: 'skill_investigation', label: 'Анализ', ability: 'intelligence' },
  { key: 'skill_athletics', label: 'Атлетика', ability: 'strength' },
  { key: 'skill_perception', label: 'Восприятие', ability: 'wisdom' },
  { key: 'skill_survival', label: 'Выживание', ability: 'wisdom' },
  { key: 'skill_performance', label: 'Выступление', ability: 'charisma' },
  { key: 'skill_intimidation', label: 'Запугивание', ability: 'charisma' },
  { key: 'skill_history', label: 'История', ability: 'intelligence' },
  { key: 'skill_sleight_of_hand', label: 'Ловкость рук', ability: 'dexterity' },
  { key: 'skill_arcana', label: 'Магия', ability: 'intelligence' },
  { key: 'skill_medicine', label: 'Медицина', ability: 'wisdom' },
  { key: 'skill_deception', label: 'Обман', ability: 'charisma' },
  { key: 'skill_nature', label: 'Природа', ability: 'intelligence' },
  { key: 'skill_insight', label: 'Проницательность', ability: 'wisdom' },
  { key: 'skill_religion', label: 'Религия', ability: 'intelligence' },
  { key: 'skill_stealth', label: 'Скрытность', ability: 'dexterity' },
  { key: 'skill_persuasion', label: 'Убеждение', ability: 'charisma' },
  { key: 'skill_animal_handling', label: 'Уход за животными', ability: 'wisdom' },
];


export default function CharacterSheet({ character, owner, onSaved }) {
  
  const init = useCallback(
    (key, fallback = '') => {
      const v = character?.[key];
      return v === null || v === undefined ? fallback : String(v);
    },
    [character],
  );
  const initNum = useCallback(
    (key, fallback = '') => {
      const v = character?.[key];
      return v === null || v === undefined ? fallback : String(v);
    },
    [character],
  );
  const initInt = useCallback(
    (key, fallback = 0) => {
      const v = Number(character?.[key]);
      return Number.isFinite(v) ? v : fallback;
    },
    [character],
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  
  const [charName, setCharName] = useState('');
  const [race, setRace] = useState('');
  const [className, setClassName] = useState('');
  const [subclassName, setSubclassName] = useState('');
  const [background, setBackground] = useState('');
  const [alignment, setAlignment] = useState('');
  const [level, setLevel] = useState('1');
  const [xpCurrent, setXpCurrent] = useState('');
  const [xpMax, setXpMax] = useState('');

  
  const [str, setStr] = useState('');
  const [dex, setDex] = useState('');
  const [con, setCon] = useState('');
  const [int_, setInt] = useState('');
  const [wis, setWis] = useState('');
  const [cha, setCha] = useState('');

  const abilityState = useMemo(
    () => ({ strength: str, dexterity: dex, constitution: con, intelligence: int_, wisdom: wis, charisma: cha }),
    [str, dex, con, int_, wis, cha],
  );
  const abilitySetters = useMemo(
    () => ({ strength: setStr, dexterity: setDex, constitution: setCon, intelligence: setInt, wisdom: setWis, charisma: setCha }),
    [],
  );

  
  const [saves, setSaves] = useState({});
  const toggleSave = (key) => setSaves((p) => ({ ...p, [key]: nextProf(p[key]) }));

  
  const [skills, setSkills] = useState({});
  const toggleSkill = (key) => setSkills((p) => ({ ...p, [key]: nextProf(p[key]) }));

  
  const [ac, setAc] = useState('');
  const [hpMax, setHpMax] = useState('');
  const [hpCur, setHpCur] = useState('');
  const [tempHp, setTempHp] = useState('');
  const [hitDiceList, setHitDiceList] = useState([{ type: '', count: '' }]);
  const [speed, setSpeed] = useState('');
  const [initBonus, setInitBonus] = useState('');
  const [inspiration, setInspiration] = useState(false);

  
  const [goldCp, setGoldCp] = useState('');
  const [goldSp, setGoldSp] = useState('');
  const [goldGp, setGoldGp] = useState('');
  const [goldPp, setGoldPp] = useState('');

  
  const [spellAbility, setSpellAbility] = useState('');
  const [spellsQuery, setSpellsQuery] = useState('');
  const [spellsCatalog, setSpellsCatalog] = useState([]);
  const [spellsLoaded, setSpellsLoaded] = useState(false);
  const [spellsLoading, setSpellsLoading] = useState(false);
  const [spellsError, setSpellsError] = useState('');
  const [knownSpells, setKnownSpells] = useState([]);
  const [characterImageUrl, setCharacterImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [conditions, setConditions] = useState('');
  const [personality, setPersonality] = useState('');
  const [ideals, setIdeals] = useState('');
  const [bonds, setBonds] = useState('');
  const [flaws, setFlaws] = useState('');
  const [otherProf, setOtherProf] = useState('');
  const [features, setFeatures] = useState('');
  const [notes, setNotes] = useState('');
  const [equipment, setEquipment] = useState('');

  
  const [attacks, setAttacks] = useState([]);

  const [deathSaveSuccess, setDeathSaveSuccess] = useState(0);
  const [deathSaveFailure, setDeathSaveFailure] = useState(0);

  const [panel, setPanel] = useState('attacks');
  const [textareaHeights, setTextareaHeights] = useState({});

  const hydratingRef = useRef(false);
  const autoSaveReadyRef = useRef(false);
  const lastSavedPayloadRef = useRef('');
  const autoSaveKeyRef = useRef('');
  const savingRef = useRef(false);
  const imageInputRef = useRef(null);

  const textareaHeightsStorageKey = useMemo(() => {
    const id = character?.id;
    if (!id) return '';
    return `character_sheet_textarea_heights:${id}`;
  }, [character?.id]);

  useEffect(() => {
    if (!textareaHeightsStorageKey || typeof window === 'undefined') {
      setTextareaHeights({});
      return;
    }
    try {
      const raw = window.localStorage.getItem(textareaHeightsStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      setTextareaHeights(parsed && typeof parsed === 'object' ? parsed : {});
    } catch {
      setTextareaHeights({});
    }
  }, [textareaHeightsStorageKey]);

  useEffect(() => {
    if (!textareaHeightsStorageKey || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(textareaHeightsStorageKey, JSON.stringify(textareaHeights));
    } catch {}
  }, [textareaHeightsStorageKey, textareaHeights]);

  useEffect(() => {
    if (panel === 'features' || panel === 'goals') {
      setPanel('attacks');
    }
  }, [panel]);

  const saveTextareaHeight = useCallback((key, target) => {
    const height = target?.style?.height;
    if (!height) return;
    setTextareaHeights((prev) => (prev[key] === height ? prev : { ...prev, [key]: height }));
  }, []);

  const bindTextareaSize = useCallback(
    (key) => ({
      style: textareaHeights[key] ? { height: textareaHeights[key] } : undefined,
      onMouseUp: (e) => saveTextareaHeight(key, e.currentTarget),
      onTouchEnd: (e) => saveTextareaHeight(key, e.currentTarget),
      onBlur: (e) => saveTextareaHeight(key, e.currentTarget),
    }),
    [saveTextareaHeight, textareaHeights],
  );

  
  useEffect(() => {
    if (!character) return;
    hydratingRef.current = true;
    autoSaveReadyRef.current = false;
    setCharName(init('character_name'));
    setRace(init('race'));
    setClassName(init('class_name'));
    setSubclassName(init('subclass_name'));
    setBackground(init('background'));
    setAlignment(init('alignment'));
    setLevel(initNum('character_level', '1'));
    setXpCurrent(initNum('xp_current'));
    setXpMax(initNum('xp_max'));
    setStr(initNum('strength'));
    setDex(initNum('dexterity'));
    setCon(initNum('constitution'));
    setInt(initNum('intelligence'));
    setWis(initNum('wisdom'));
    setCha(initNum('charisma'));

    const sv = {};
    SAVES.forEach((s) => { sv[s.key] = initInt(s.key, 0); });
    setSaves(sv);

    const sk = {};
    SKILLS.forEach((s) => { sk[s.key] = initInt(s.key, 0); });
    setSkills(sk);

    setAc(initNum('armor_class'));
    setHpMax(initNum('hp_max'));
    setHpCur(initNum('hp_current'));
    setTempHp(initNum('temp_hp'));
    try {
      const raw = character.hit_dice_json;
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const normalized = list
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const type = String(item.type || '').trim();
          const count = item.count === '' || item.count === null || item.count === undefined ? '' : String(item.count);
          return type || count !== '' ? { type, count } : null;
        })
        .filter(Boolean)
        .slice(0, MAX_HIT_DICE_ROWS);
      if (normalized.length > 0) {
        setHitDiceList(normalized);
      } else {
        const fallbackType = init('hit_dice_type');
        const fallbackCount = initNum('hit_dice_count');
        setHitDiceList(fallbackType || fallbackCount ? [{ type: fallbackType, count: fallbackCount }] : [{ type: '', count: '' }]);
      }
    } catch {
      const fallbackType = init('hit_dice_type');
      const fallbackCount = initNum('hit_dice_count');
      setHitDiceList(fallbackType || fallbackCount ? [{ type: fallbackType, count: fallbackCount }] : [{ type: '', count: '' }]);
    }
    setSpeed(initNum('speed'));
    setInitBonus(initNum('initiative_bonus'));
    setInspiration(Boolean(Number(character.inspiration)));
    setGoldCp(initNum('gold_cp'));
    setGoldSp(initNum('gold_sp'));
    setGoldGp(initNum('gold_gp'));
    setGoldPp(initNum('gold_pp'));
    setSpellAbility(init('spellcasting_ability'));
    setSpellsQuery('');
    setSpellsError('');

    try {
      const raw = character.character_images_json;
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const normalized = list
        .map((url) => normalizeCharacterImageUrl(url))
        .filter(Boolean);
      if (normalized.length > 0) {
        setCharacterImageUrl(normalized[0]);
      } else {
        const single = normalizeCharacterImageUrl(init('character_image_url'));
        setCharacterImageUrl(single || '');
      }
    } catch {
      const single = normalizeCharacterImageUrl(init('character_image_url'));
      setCharacterImageUrl(single || '');
    }
    try {
      const raw = character.spells_json;
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const normalized = list
        .map((item) => {
          if (typeof item === 'number' || typeof item === 'string') {
            const id = Number(item);
            return Number.isFinite(id) ? { id, name: '' } : null;
          }
          if (item && typeof item === 'object') {
            const id = Number(item.id ?? item.spell_id ?? item.spellId);
            if (!Number.isFinite(id)) return null;
            const name = item.name || item.title || '';
            return { id, name: String(name) };
          }
          return null;
        })
        .filter(Boolean);
      setKnownSpells(normalized);
    } catch {
      setKnownSpells([]);
    }
    setConditions(init('conditions'));
    setPersonality(init('personality'));
    setIdeals(init('ideals'));
    setBonds(init('bonds'));
    setFlaws(init('flaws'));
    setOtherProf(init('other_proficiencies'));
    setFeatures(init('features_traits'));
    setNotes(init('notes'));
    setEquipment(init('equipment'));
    setDeathSaveSuccess(initInt('death_save_success', 0));
    setDeathSaveFailure(initInt('death_save_failure', 0));

    try {
      const raw = character.attacks_json;
      const parsed = raw ? JSON.parse(raw) : [];
      setAttacks(Array.isArray(parsed) ? parsed : []);
    } catch {
      setAttacks([]);
    }

    queueMicrotask(() => {
      hydratingRef.current = false;
    });
  }, [character, init, initNum, initInt]);

  
  const levelNum = useMemo(() => clamp(Number(level) || 1, 1, 20), [level]);
  const profBonus = useMemo(() => profBonusForLevel(levelNum), [levelNum]);

  const passivePerception = useMemo(() => {
    const prof = skills.skill_perception || 0;
    return 10 + abilityMod(wis) + profBonus * (prof === 2 ? 2 : prof);
  }, [wis, skills.skill_perception, profBonus]);
  const passiveInvestigation = useMemo(() => {
    const prof = skills.skill_investigation || 0;
    return 10 + abilityMod(int_) + profBonus * (prof === 2 ? 2 : prof);
  }, [int_, skills.skill_investigation, profBonus]);
  const passiveInsight = useMemo(() => {
    const prof = skills.skill_insight || 0;
    return 10 + abilityMod(wis) + profBonus * (prof === 2 ? 2 : prof);
  }, [wis, skills.skill_insight, profBonus]);

  const xpPercent = useMemo(() => {
    const cur = Number(xpCurrent);
    const max = Number(xpMax);
    if (!Number.isFinite(cur) || !Number.isFinite(max) || max <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((cur / max) * 100)));
  }, [xpCurrent, xpMax]);

  const hpPercent = useMemo(() => {
    const cur = Number(hpCur);
    const max = Number(hpMax);
    if (!Number.isFinite(cur) || !Number.isFinite(max) || max <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((Math.min(cur, max) / max) * 100)));
  }, [hpCur, hpMax]);

  const hpMaxNum = useMemo(() => {
    const n = Number(hpMax);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [hpMax]);

  const handleHpCurChange = (value) => {
    if (value === '') {
      setHpCur('');
      return;
    }
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    if (hpMaxNum !== null) {
      setHpCur(String(Math.min(Math.trunc(n), hpMaxNum)));
      return;
    }
    setHpCur(String(Math.trunc(n)));
  };

  const handleHpMaxChange = (value) => {
    if (value === '') {
      setHpMax('');
      return;
    }
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    const next = Math.trunc(n);
    setHpMax(String(next));
    if (hpCur !== '' && Number.isFinite(Number(hpCur))) {
      const cur = Math.trunc(Number(hpCur));
      if (cur > next) setHpCur(String(next));
    }
  };

  const skillsByAbility = useMemo(() => {
    return SKILLS.reduce((acc, skill) => {
      acc[skill.ability] = acc[skill.ability] || [];
      acc[skill.ability].push(skill);
      return acc;
    }, {});
  }, []);

  useEffect(() => {
    if (panel !== 'spells' || spellsLoaded) return;
    let isActive = true;
    setSpellsLoading(true);
    setSpellsError('');
    spellsAPI.list()
      .then((data) => {
        if (!isActive) return;
        setSpellsCatalog(Array.isArray(data) ? data : []);
        setSpellsLoaded(true);
      })
      .catch((e) => {
        if (!isActive) return;
        setSpellsError(e.message || 'Ошибка загрузки заклинаний');
      })
      .finally(() => {
        if (isActive) setSpellsLoading(false);
      });
    return () => { isActive = false; };
  }, [panel, spellsLoaded]);

  useEffect(() => {
    if (!spellsCatalog.length || !knownSpells.length) return;
    const map = new Map(spellsCatalog.map((s) => [Number(s.id), s.name || s.title || '']));
    setKnownSpells((prev) => prev.map((s) => (s.name ? s : { ...s, name: map.get(s.id) || '' })));
  }, [spellsCatalog]);

  
  const addAttack = () => setAttacks((p) => [...p, { name: '', bonus: '', damage: '' }]);
  const removeAttack = (i) => setAttacks((p) => p.filter((_, idx) => idx !== i));
  const updateAttack = (i, field, value) =>
    setAttacks((p) => p.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));

  const toggleDeathSave = (type, index) => {
    if (type === 'success') {
      setDeathSaveSuccess((prev) => (prev === index + 1 ? index : index + 1));
      return;
    }
    setDeathSaveFailure((prev) => (prev === index + 1 ? index : index + 1));
  };

  const addHitDie = () => {
    setHitDiceList((prev) => {
      if (prev.length >= MAX_HIT_DICE_ROWS) return prev;
      return [...prev, { type: '', count: '' }];
    });
  };

  const updateHitDieType = (index, value) => {
    setHitDiceList((prev) => prev.map((row, i) => (i === index ? { ...row, type: value } : row)));
  };

  const updateHitDieCount = (index, value) => {
    setHitDiceList((prev) => prev.map((row, i) => (i === index ? { ...row, count: value } : row)));
  };

  const removeHitDie = (index) => {
    setHitDiceList((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [{ type: '', count: '' }];
    });
  };

  const uploadCharacterImageFile = async (file) => {
    if (!file || !character?.id) return;
    setImageUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const result = await userProfileAPI.uploadCharacterImage(formData);
      const imageUrl = normalizeCharacterImageUrl(result?.image_url);
      if (imageUrl) {
        setCharacterImageUrl(imageUrl);
      }
    } catch (e) {
      setError(e.message || 'Ошибка загрузки изображения');
    } finally {
      setImageUploading(false);
    }
  };

  const openCharacterImagePicker = () => {
    if (imageUploading) return;
    imageInputRef.current?.click();
  };

  const buildPayload = useCallback(() => {
    const numOrNull = (v) => {
      if (v === '' || v === null || v === undefined) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    return {
      character_name: charName || null,
      race: race || null,
      class_name: className || null,
      subclass_name: subclassName || null,
      background: background || null,
      alignment: alignment || null,
      character_level: numOrNull(level) ?? 1,
      xp_current: numOrNull(xpCurrent),
      xp_max: numOrNull(xpMax),
      strength: numOrNull(str),
      dexterity: numOrNull(dex),
      constitution: numOrNull(con),
      intelligence: numOrNull(int_),
      wisdom: numOrNull(wis),
      charisma: numOrNull(cha),
      ...Object.fromEntries(SAVES.map((s) => [s.key, saves[s.key] ?? 0])),
      ...Object.fromEntries(SKILLS.map((s) => [s.key, skills[s.key] ?? 0])),
      armor_class: numOrNull(ac),
      hp_max: numOrNull(hpMax),
      hp_current: numOrNull(hpCur),
      temp_hp: numOrNull(tempHp),
      hit_dice_type: hitDiceList[0]?.type || null,
      hit_dice_count: numOrNull(hitDiceList[0]?.count),
      hit_dice_json: JSON.stringify(
        hitDiceList
          .map((row) => ({ type: String(row.type || '').trim(), count: numOrNull(row.count) }))
          .filter((row) => row.type || row.count !== null),
      ),
      speed: numOrNull(speed),
      initiative_bonus: numOrNull(initBonus),
      inspiration: inspiration ? 1 : 0,
      gold_cp: numOrNull(goldCp),
      gold_sp: numOrNull(goldSp),
      gold_gp: numOrNull(goldGp),
      gold_pp: numOrNull(goldPp),
      spellcasting_ability: spellAbility || null,
      spells_json: JSON.stringify(knownSpells.map((s) => s.id)),
      character_image_url: normalizeCharacterImageUrl(characterImageUrl) || null,
      character_images_json: null,
      conditions: conditions || null,
      personality: personality || null,
      ideals: ideals || null,
      bonds: bonds || null,
      flaws: flaws || null,
      other_proficiencies: otherProf || null,
      features_traits: features || null,
      notes: notes || null,
      equipment: equipment || null,
      death_save_success: deathSaveSuccess,
      death_save_failure: deathSaveFailure,
      attacks_json: JSON.stringify(attacks.filter((a) => a.name || a.bonus || a.damage)),
    };
  }, [
    ac,
    alignment,
    attacks,
    bonds,
    cha,
    charName,
    characterImageUrl,
    className,
    con,
    conditions,
    deathSaveFailure,
    deathSaveSuccess,
    dex,
    equipment,
    features,
    flaws,
    goldCp,
    goldGp,
    goldPp,
    goldSp,
    hitDiceList,
    hpCur,
    hpMax,
    ideals,
    initBonus,
    inspiration,
    int_,
    knownSpells,
    level,
    notes,
    otherProf,
    personality,
    race,
    subclassName,
    saves,
    speed,
    spellAbility,
    skills,
    str,
    tempHp,
    wis,
    xpCurrent,
    xpMax,
    background,
  ]);

  const saveCharacter = useCallback(async ({ notifyParent = false } = {}) => {
    if (!character?.id) throw new Error('Лист персонажа не выбран');
    const payload = buildPayload();
    const payloadKey = JSON.stringify(payload);
    setSaving(true);
    savingRef.current = true;
    setError('');
    try {
      const next = await userProfileAPI.updateCharacter(character.id, payload);
      lastSavedPayloadRef.current = payloadKey;
      if (notifyParent && onSaved) onSaved(next);
      return next;
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  }, [buildPayload, character?.id, onSaved]);

  const handleManualSave = useCallback(async () => {
    try {
      await saveCharacter({ notifyParent: true });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка сохранения');
    }
  }, [saveCharacter]);

  const addKnownSpell = (spell) => {
    if (!spell?.id) return;
    const id = Number(spell.id);
    if (!Number.isFinite(id)) return;
    setKnownSpells((prev) => (prev.some((s) => s.id === id) ? prev : [...prev, { id, name: spell.name || '' }]));
    setSpellsQuery('');
  };

  const removeKnownSpell = (id) => {
    setKnownSpells((prev) => prev.filter((s) => s.id !== id));
  };

  
  const autoSaveKey = useMemo(() => JSON.stringify(buildPayload()), [buildPayload]);

  useEffect(() => {
    autoSaveKeyRef.current = autoSaveKey;
  }, [autoSaveKey]);

  useEffect(() => {
    if (!character?.id || hydratingRef.current) return;
    if (!autoSaveReadyRef.current) {
      autoSaveReadyRef.current = true;
      lastSavedPayloadRef.current = autoSaveKey;
      autoSaveKeyRef.current = autoSaveKey;
    }

    const interval = setInterval(async () => {
      if (hydratingRef.current) return;
      if (savingRef.current) return;

      const currentKey = autoSaveKeyRef.current;
      if (!currentKey || currentKey === lastSavedPayloadRef.current) return;

      try {
        await saveCharacter({ notifyParent: false });
      } catch (e) {
        console.error(e);
        setError(e.message || 'Ошибка автосохранения');
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [autoSaveKey, character?.id, saveCharacter]);

  
  const spellDC = spellAbility ? 8 + profBonus + abilityMod(abilityState[spellAbility]) : null;
  const spellAtk = spellAbility ? profBonus + abilityMod(abilityState[spellAbility]) : null;

  const filteredSpells = useMemo(() => {
    const q = spellsQuery.trim().toLowerCase();
    if (!q) return [];
    const used = new Set(knownSpells.map((s) => s.id));
    return (spellsCatalog || [])
      .filter((s) => !used.has(Number(s.id)))
      .filter((s) => {
        const name = String(s.name || '').toLowerCase();
        const nameEn = String(s.name_en || '').toLowerCase();
        return name.includes(q) || nameEn.includes(q);
      })
      .slice(0, 8);
  }, [spellsQuery, spellsCatalog, knownSpells]);

  const knownSpellDetails = useMemo(() => {
    const map = new Map(spellsCatalog.map((s) => [Number(s.id), s]));
    return knownSpells.map((s) => {
      const id = Number(s.id);
      const catalog = map.get(id);
      const name = s.name || catalog?.name || catalog?.title || `#${id}`;
      const lvl = Number(catalog?.level);
      return { id, name, level: Number.isFinite(lvl) ? lvl : null };
    });
  }, [knownSpells, spellsCatalog]);

  const groupedKnownSpells = useMemo(() => {
    const groups = new Map();
    for (const spell of knownSpellDetails) {
      const key = spell.level === null ? 'unknown' : String(spell.level);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(spell);
    }
    const keys = Array.from(groups.keys()).sort((a, b) => {
      if (a === 'unknown') return 1;
      if (b === 'unknown') return -1;
      return Number(a) - Number(b);
    });
    return keys.map((key) => {
      const lvl = key === 'unknown' ? null : Number(key);
      const title = lvl === null ? 'Уровень ?' : (lvl === 0 ? 'Заговоры' : `Уровень ${lvl}`);
      const items = groups.get(key) || [];
      items.sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }));
      return { key, title, items };
    });
  }, [knownSpellDetails]);

  const renderAbility = (a) => {
    const val = abilityState[a.key];
    const mod = abilityMod(val);
    const saveKey = `save_${a.key}`;
    const saveProf = saves[saveKey] || 0;
    const saveBonus = mod + profBonus * (saveProf === 2 ? 2 : saveProf);
    const mySkills = skillsByAbility[a.key] || [];
    return (
      <div key={a.key} className="cs-ability">
        <div className="cs-ab-header">
          <span className="cs-ab-name">{a.label.toUpperCase()}</span>
          <input type="number" min={1} max={30} value={val} onChange={(e) => abilitySetters[a.key](e.target.value)} className="cs-ab-score" />
        </div>
        <div className="cs-ab-mods">
          <span className="cs-ab-mod">ПРОВЕРКА<b>{fmtBonus(mod)}</b></span>
          <button type="button" onClick={() => toggleSave(saveKey)} className={`cs-ab-mod ${saveProf ? 'is-prof' : ''}`} title="Переключить владение">СПАСБРОСОК<b>{fmtBonus(saveBonus)}</b></button>
        </div>
        {mySkills.length > 0 && (
          <div className="cs-skills">
            {mySkills.map((s) => {
              const p = skills[s.key] || 0;
              const b = mod + profBonus * (p === 2 ? 2 : p);
              return (
                <button type="button" key={s.key} onClick={() => toggleSkill(s.key)} className={`cs-skill ${p ? 'is-prof' : ''}`}>
                  <span className={`cs-skill-dot ${p === 2 ? 'is-exp' : p === 1 ? 'is-half' : ''}`} />
                  <span className="cs-skill-name">{s.label}</span>
                  <span className="cs-skill-val">{fmtBonus(b)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="cs">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadCharacterImageFile(file);
          e.target.value = '';
        }}
        className="cs-hidden-file"
      />
      {error ? <div className="cs-toast cs-toast--err">{error}</div> : null}

      <div className="cs-header">
        <div className="cs-id">
          <button type="button" onClick={openCharacterImagePicker} className="cs-char-image-wrap cs-char-image-trigger" title="Нажмите, чтобы загрузить изображение" disabled={imageUploading}>
            {characterImageUrl ? (
              <img src={resolveCharacterImageSrc(characterImageUrl)} alt="Персонаж" className="cs-char-image" />
            ) : (
              <div className="cs-char-image cs-char-image--empty">Нет фото</div>
            )}
          </button>
          <div className="cs-id-block">
            <input value={charName} onChange={(e) => setCharName(e.target.value)} className="cs-name" placeholder="Имя персонажа" />
            <div className="cs-subtitle">
              <input value={race} onChange={(e) => setRace(e.target.value)} className="cs-sub-input" placeholder="Раса" />
              <input value={className} onChange={(e) => setClassName(e.target.value)} className="cs-sub-input" placeholder="Класс" />
              <input value={subclassName} onChange={(e) => setSubclassName(e.target.value)} className="cs-sub-input cs-sub-input--dim" placeholder="Подкласс" />
            </div>
            <div className="cs-subtitle cs-subtitle--single">
              <input value={background} onChange={(e) => setBackground(e.target.value)} className="cs-sub-input" placeholder="Предыстория" />
            </div>
            <div className="cs-subtitle cs-subtitle--single">
              <input value={alignment} onChange={(e) => setAlignment(e.target.value)} className="cs-sub-input" placeholder="Мировоззрение" />
            </div>
            <div className="cs-hp">
              <div className="cs-hp-top">
                <span className="cs-hp-lbl">хиты</span>
                <div className="cs-hp-bar"><span style={{ width: `${hpPercent}%` }} /></div>
              </div>
              <div className="cs-hp-nums">
                <input
                  type="number"
                  min={0}
                  max={hpMaxNum ?? undefined}
                  value={hpCur}
                  onChange={(e) => handleHpCurChange(e.target.value)}
                  className="cs-hp-input"
                  placeholder="0"
                />
                <span>/</span>
                <input
                  type="number"
                  min={0}
                  value={hpMax}
                  onChange={(e) => handleHpMaxChange(e.target.value)}
                  className="cs-hp-input"
                  placeholder="38"
                />
              </div>
              <div className="cs-hp-temp">
                <span>временные хиты</span>
                <input type="number" min={0} value={tempHp} onChange={(e) => setTempHp(e.target.value)} className="cs-hp-input cs-hp-input--temp" placeholder="0" />
              </div>
            </div>
          </div>
        </div>

        <div className="cs-stats-col">
          <div className="cs-stat">
            <div className="cs-stat-val cs-stat-val--ro">{fmtBonus(profBonus)}</div>
            <div className="cs-stat-lbl">БОНУС МАСТЕРСТВА</div>
          </div>
          <div className="cs-stat cs-stat--shield">
            <input type="number" min={0} value={ac} onChange={(e) => setAc(e.target.value)} className="cs-stat-val" placeholder="10" />
            <div className="cs-stat-lbl">КД</div>
          </div>
          <div className="cs-stat">
            <input type="number" min={0} value={speed} onChange={(e) => setSpeed(e.target.value)} className="cs-stat-val" placeholder="30" />
            <div className="cs-stat-lbl">СКОРОСТЬ</div>
          </div>
          <div className="cs-stat">
            <input type="number" min={0} value={initBonus} onChange={(e) => setInitBonus(e.target.value)} className="cs-stat-val" placeholder="0" />
            <div className="cs-stat-lbl">ИНИЦИАТИВА</div>
          </div>
          <button type="button" className={`cs-stat cs-stat--toggle ${inspiration ? 'is-on' : ''}`} onClick={() => setInspiration((v) => !v)}>
            <div className="cs-stat-val">{inspiration ? 'ДА' : 'НЕТ'}</div>
            <div className="cs-stat-lbl">ВДОХНОВЕНИЕ</div>
          </button>
        </div>

        <div className="cs-meta-col">
          <div className="cs-stat cs-stat--lvl">
            <div className="cs-lvl-row">
              <span className="cs-lvl-badge">
                <input type="number" min={1} max={20} value={level} onChange={(e) => setLevel(e.target.value)} className="cs-lvl-input" />
                <span>уровень</span>
              </span>
              <div className="cs-xp-row">
                <input type="number" min={0} value={xpCurrent} onChange={(e) => setXpCurrent(e.target.value)} className="cs-xp-num" placeholder="0" />
                <span>/</span>
                <input type="number" min={0} value={xpMax} onChange={(e) => setXpMax(e.target.value)} className="cs-xp-num" placeholder="23000" />
              </div>
            </div>
            <div className="cs-xp-bar"><span style={{ width: `${xpPercent}%` }} /></div>
          </div>

          <div className="cs-stat cs-stat--wide">
            <div className="cs-death">
              <div className="cs-death-label">Спасброски от смерти</div>
              <div className="cs-death-row">
                <span>успехи</span>
                {[0, 1, 2].map((i) => (
                  <button
                    key={`s${i}`}
                    type="button"
                    onClick={() => toggleDeathSave('success', i)}
                    className={`cs-death-dot ${deathSaveSuccess > i ? 'is-on' : ''}`}
                    aria-label={`Успех ${i + 1}`}
                  />
                ))}
              </div>
              <div className="cs-death-row">
                <span>провалы</span>
                {[0, 1, 2].map((i) => (
                  <button
                    key={`f${i}`}
                    type="button"
                    onClick={() => toggleDeathSave('failure', i)}
                    className={`cs-death-dot ${deathSaveFailure > i ? 'is-on is-fail' : ''}`}
                    aria-label={`Провал ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="cs-stat cs-stat--hitdice cs-stat--hitdice-col">
            <div className="cs-hitdice-list">
              {hitDiceList.map((row, i) => (
                <div key={`hd${i}`} className="cs-hitdice-row">
                  <select value={row.type} onChange={(e) => updateHitDieType(i, e.target.value)} className="cs-hitdice-select">
                    <option value="">—</option>
                    <option value="k6">к6</option>
                    <option value="k8">к8</option>
                    <option value="k10">к10</option>
                    <option value="k12">к12</option>
                  </select>
                  <input type="number" min={0} max={20} value={row.count} onChange={(e) => updateHitDieCount(i, e.target.value)} className="cs-hitdice-input" placeholder="0" />
                  {hitDiceList.length > 1 ? (
                    <button type="button" onClick={() => removeHitDie(i)} className="cs-hitdice-remove">×</button>
                  ) : null}
                </div>
              ))}
              {hitDiceList.length < MAX_HIT_DICE_ROWS ? (
                <button type="button" onClick={addHitDie} className="cs-hitdice-add">+ еще</button>
              ) : (
                <span className="cs-hitdice-limit">макс 3</span>
              )}
            </div>
            <div className="cs-stat-lbl">кости хитов</div>
          </div>
        </div>
      </div>

      <div className="cs-body">
        <div className="cs-col-left">
          <div className="cs-abilities-grid">
            <div className="cs-abilities-col">
              {ABILITIES_LEFT.map((key) => renderAbility(ABILITY_BY_KEY[key]))}
              <div className="cs-passives cs-passives--compact">
                <div className="cs-section-head">ПАССИВНАЯ ВНИМАТЕЛЬНОСТЬ</div>
                <div className="cs-passive"><span className="cs-passive-v">{passivePerception}</span><span>Мудрость (Восприятие)</span></div>
              </div>
            </div>
            <div className="cs-abilities-col">
              {ABILITIES_RIGHT.map((key) => renderAbility(ABILITY_BY_KEY[key]))}
            </div>
          </div>

          <div className="cs-block">
            <div className="cs-section-head">ПРОЧИЕ ВЛАДЕНИЯ И ЯЗЫКИ</div>
            <textarea {...bindTextareaSize('otherProf')} rows={3} value={otherProf} onChange={(e) => setOtherProf(e.target.value)} className="cs-ta" placeholder="Языки, инструменты, оружие…" />
          </div>
        </div>

        <div className="cs-col-right">
          <div className="cs-tabs">
            {[
              { key: 'attacks', label: 'АТАКИ' },
              { key: 'equipment', label: 'СНАРЯЖЕНИЕ' },
              { key: 'personality', label: 'ЛИЧНОСТЬ' },
              { key: 'notes', label: 'ЗАМЕТКИ' },
              { key: 'spells', label: 'ЗАКЛИНАНИЯ' },
            ].map((t) => (
              <button key={t.key} type="button" onClick={() => setPanel(t.key)} className={`cs-tab ${panel === t.key ? 'is-on' : ''}`}>{t.label}</button>
            ))}
          </div>

          <div className="cs-panel">
            {panel === 'attacks' && (
              <>
                <div className="cs-atk-head">
                  <span>НАЗВАНИЕ</span><span>БОНУС</span><span>УРОН / ВИД</span>
                </div>
                {attacks.map((atk, i) => (
                  <div key={i} className="cs-atk-row">
                    <input value={atk.name} onChange={(e) => updateAttack(i, 'name', e.target.value)} placeholder="Кинжал" className="cs-atk-in" />
                    <input value={atk.bonus} onChange={(e) => updateAttack(i, 'bonus', e.target.value)} placeholder="+6" className="cs-atk-in cs-atk-in--c" />
                    <div className="cs-atk-dmg">
                      <input value={atk.damage} onChange={(e) => updateAttack(i, 'damage', e.target.value)} placeholder="1к4+3/колющий" className="cs-atk-in" />
                      <button type="button" onClick={() => removeAttack(i)} className="cs-atk-rm" title="Удалить">−</button>
                    </div>
                  </div>
                ))}
                <div className="cs-atk-add-row">
                  <button type="button" onClick={addAttack} className="cs-atk-add">+ Добавить атаку</button>
                </div>
              </>
            )}
            {panel === 'equipment' && (
              <div className="cs-stack">
                <div className="cs-money-market">
                  <label className="cs-money-item">
                    <span className="cs-coin cs-coin--gold">З</span>
                    <input type="number" min={0} value={goldGp} onChange={(e) => setGoldGp(e.target.value)} className="cs-money-input cs-money-input--gold" placeholder="0" />
                  </label>
                  <label className="cs-money-item">
                    <span className="cs-coin cs-coin--silver">С</span>
                    <input type="number" min={0} value={goldSp} onChange={(e) => setGoldSp(e.target.value)} className="cs-money-input cs-money-input--silver" placeholder="0" />
                  </label>
                  <label className="cs-money-item">
                    <span className="cs-coin cs-coin--copper">М</span>
                    <input type="number" min={0} value={goldCp} onChange={(e) => setGoldCp(e.target.value)} className="cs-money-input cs-money-input--copper" placeholder="0" />
                  </label>
                </div>
                <textarea {...bindTextareaSize('equipment')} rows={12} value={equipment} onChange={(e) => setEquipment(e.target.value)} className="cs-ta" placeholder="Снаряжение" />
              </div>
            )}
            {panel === 'personality' && (
              <div className="cs-stack">
                <textarea {...bindTextareaSize('personality')} rows={5} value={personality} onChange={(e) => setPersonality(e.target.value)} className="cs-ta" placeholder="Черты характера" />
                <textarea {...bindTextareaSize('ideals')} rows={3} value={ideals} onChange={(e) => setIdeals(e.target.value)} className="cs-ta" placeholder="Идеалы" />
                <textarea {...bindTextareaSize('bonds')} rows={3} value={bonds} onChange={(e) => setBonds(e.target.value)} className="cs-ta" placeholder="Привязанности" />
                <textarea {...bindTextareaSize('flaws')} rows={3} value={flaws} onChange={(e) => setFlaws(e.target.value)} className="cs-ta" placeholder="Слабости" />
              </div>
            )}
            {panel === 'notes' && <textarea {...bindTextareaSize('notes')} rows={12} value={notes} onChange={(e) => setNotes(e.target.value)} className="cs-ta" placeholder="Заметки" />}
            {panel === 'spells' && (
              <div className="cs-stack">
                <select value={spellAbility} onChange={(e) => setSpellAbility(e.target.value)} className="cs-select">
                  <option value="">— Базовая характеристика —</option>
                  {ABILITIES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                </select>
                {spellAbility && (
                  <div className="cs-spell-row">
                    <div className="cs-spell-box"><div className="cs-spell-v">{spellDC}</div><div className="cs-spell-l">Сложность</div></div>
                    <div className="cs-spell-box"><div className="cs-spell-v">{fmtBonus(spellAtk)}</div><div className="cs-spell-l">Атака</div></div>
                    <div className="cs-spell-box"><div className="cs-spell-v">{fmtBonus(abilityMod(abilityState[spellAbility]))}</div><div className="cs-spell-l">Мод.</div></div>
                  </div>
                )}

                <div className="cs-spell-search">
                  <input
                    value={spellsQuery}
                    onChange={(e) => setSpellsQuery(e.target.value)}
                    className="cs-spell-input"
                    placeholder="Поиск заклинания..."
                  />
                  {spellsLoading && spellsQuery.trim() ? <div className="cs-spell-hint">Загрузка…</div> : null}
                  {spellsError ? <div className="cs-spell-error">{spellsError}</div> : null}
                  {filteredSpells.length > 0 && (
                    <div className="cs-spell-results">
                      {filteredSpells.map((s) => (
                        <button key={s.id} type="button" onClick={() => addKnownSpell(s)} className="cs-spell-result">
                          <span>{s.name}</span>
                          <span className="cs-spell-add">+</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="cs-spell-list">
                  <div className="cs-section-head">ВАШИ ЗАКЛИНАНИЯ</div>
                  {knownSpells.length === 0 ? (
                    <div className="cs-spell-empty">Пока нет добавленных заклинаний.</div>
                  ) : (
                    <div className="cs-spell-groups">
                      {groupedKnownSpells.map((group) => (
                        <div key={group.key} className="cs-spell-group">
                          <div className="cs-spell-group-title">{group.title}</div>
                          <div className="cs-spell-items">
                            {group.items.map((s) => (
                              <div key={s.id} className="cs-spell-item">
                                <span>{s.name}</span>
                                <button type="button" onClick={() => removeKnownSpell(s.id)} className="cs-spell-remove">Удалить</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="cs-block">
            <div className="cs-section-head">УМЕНИЯ И СПОСОБНОСТИ <span className="cs-collapse">∧</span></div>
            <textarea {...bindTextareaSize('featuresBottom')} rows={5} value={features} onChange={(e) => setFeatures(e.target.value)} className="cs-ta" placeholder="Расовые, классовые умения…" />
          </div>
        </div>
      </div>

      <div className="cs-save-actions">
        <button type="button" onClick={handleManualSave} disabled={saving} className="cs-save-btn">
          {saving ? 'Сохранение…' : 'Сохранить лист'}
        </button>
      </div>

    </form>
  );
}
