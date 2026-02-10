import { useCallback, useEffect, useMemo, useState } from 'react';
import { userProfileAPI } from '../../lib/api.js';


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
  const [saved, setSaved] = useState(false);

  
  const [charName, setCharName] = useState('');
  const [race, setRace] = useState('');
  const [className, setClassName] = useState('');
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
  const [hitDiceType, setHitDiceType] = useState('');
  const [hitDiceCount, setHitDiceCount] = useState('');
  const [speed, setSpeed] = useState('');
  const [initBonus, setInitBonus] = useState('');
  const [inspiration, setInspiration] = useState(false);

  
  const [goldCp, setGoldCp] = useState('');
  const [goldSp, setGoldSp] = useState('');
  const [goldGp, setGoldGp] = useState('');
  const [goldPp, setGoldPp] = useState('');

  
  const [spellAbility, setSpellAbility] = useState('');
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

  
  useEffect(() => {
    if (!character) return;
    setCharName(init('character_name'));
    setRace(init('race'));
    setClassName(init('class_name'));
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
    setHitDiceType(init('hit_dice_type'));
    setHitDiceCount(initNum('hit_dice_count'));
    setSpeed(initNum('speed'));
    setInitBonus(initNum('initiative_bonus'));
    setInspiration(Boolean(Number(character.inspiration)));
    setGoldCp(initNum('gold_cp'));
    setGoldSp(initNum('gold_sp'));
    setGoldGp(initNum('gold_gp'));
    setGoldPp(initNum('gold_pp'));
    setSpellAbility(init('spellcasting_ability'));
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

  
  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const numOrNull = (v) => {
        if (v === '' || v === null || v === undefined) return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };
      const payload = {
        character_name: charName || null,
        race: race || null,
        class_name: className || null,
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
        hit_dice_type: hitDiceType || null,
        hit_dice_count: numOrNull(hitDiceCount),
        speed: numOrNull(speed),
        initiative_bonus: numOrNull(initBonus),
        inspiration: inspiration ? 1 : 0,
        gold_cp: numOrNull(goldCp),
        gold_sp: numOrNull(goldSp),
        gold_gp: numOrNull(goldGp),
        gold_pp: numOrNull(goldPp),
        spellcasting_ability: spellAbility || null,
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
      if (!character?.id) throw new Error('Лист персонажа не выбран');
      const next = await userProfileAPI.updateCharacter(character.id, payload);
      setSaved(true);
      if (onSaved) onSaved(next);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  
  const spellDC = spellAbility ? 8 + profBonus + abilityMod(abilityState[spellAbility]) : null;
  const spellAtk = spellAbility ? profBonus + abilityMod(abilityState[spellAbility]) : null;

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
    <form onSubmit={handleSave} className="cs">
      {error ? <div className="cs-toast cs-toast--err">{error}</div> : null}
      {saved ? <div className="cs-toast cs-toast--ok">Сохранено!</div> : null}

      <div className="cs-header">
        <div className="cs-id">
          <div className="cs-id-block">
            <input value={charName} onChange={(e) => setCharName(e.target.value)} className="cs-name" placeholder="Имя персонажа" />
            <div className="cs-subtitle">
              <input value={race} onChange={(e) => setRace(e.target.value)} className="cs-sub-input" placeholder="Раса" />
              <span className="cs-sep">—</span>
              <input value={className} onChange={(e) => setClassName(e.target.value)} className="cs-sub-input" placeholder="Класс" />
              <input value={background} onChange={(e) => setBackground(e.target.value)} className="cs-sub-input cs-sub-input--dim" placeholder="Подкласс" />
            </div>
            <div className="cs-subtitle cs-subtitle--single">
              <input value={alignment} onChange={(e) => setAlignment(e.target.value)} className="cs-sub-input" placeholder="Мировоззрение" />
            </div>
          </div>
        </div>

        <div className="cs-stats-row">
          <div className="cs-stat cs-stat--shield">
            <input type="number" min={0} value={ac} onChange={(e) => setAc(e.target.value)} className="cs-stat-val" placeholder="13" />
            <div className="cs-stat-lbl">КД</div>
          </div>
          <div className="cs-stat">
            <input type="number" min={0} value={speed} onChange={(e) => setSpeed(e.target.value)} className="cs-stat-val" placeholder="30" />
            <div className="cs-stat-lbl">скорость</div>
          </div>
          <button type="button" className={`cs-stat cs-stat--toggle ${inspiration ? 'is-on' : ''}`} onClick={() => setInspiration((v) => !v)}>
            <div className="cs-stat-val">{inspiration ? 'ДА' : 'НЕТ'}</div>
            <div className="cs-stat-lbl">вдохновение</div>
          </button>
          <div className="cs-stat">
            <div className="cs-stat-val cs-stat-val--ro">{fmtBonus(profBonus)}</div>
            <div className="cs-stat-lbl">бонус мастерства</div>
          </div>
          <div className="cs-stat">
            <input type="number" min={0} value={initBonus} onChange={(e) => setInitBonus(e.target.value)} className="cs-stat-val" placeholder="0" />
            <div className="cs-stat-lbl">инициатива</div>
          </div>
          <div className="cs-stat cs-stat--hitdice">
            <div className="cs-hitdice-row">
              <select value={hitDiceType} onChange={(e) => setHitDiceType(e.target.value)} className="cs-hitdice-select">
                <option value="">—</option>
                <option value="k6">к6</option>
                <option value="k8">к8</option>
                <option value="k10">к10</option>
                <option value="k12">к12</option>
              </select>
              <input type="number" min={0} max={20} value={hitDiceCount} onChange={(e) => setHitDiceCount(e.target.value)} className="cs-hitdice-input" placeholder="0" />
            </div>
            <div className="cs-stat-lbl">кости хитов</div>
          </div>
          <div className="cs-stat-row2">
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
          </div>
        </div>

        <div className="cs-hp-col">
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
            <textarea rows={3} value={otherProf} onChange={(e) => setOtherProf(e.target.value)} className="cs-ta" placeholder="Языки, инструменты, оружие…" />
          </div>
        </div>

        <div className="cs-col-right">
          <div className="cs-tabs">
            {[
              { key: 'attacks', label: 'АТАКИ' },
              { key: 'features', label: 'СПОСОБНОСТИ' },
              { key: 'equipment', label: 'СНАРЯЖЕНИЕ' },
              { key: 'personality', label: 'ЛИЧНОСТЬ' },
              { key: 'goals', label: 'ЦЕЛИ' },
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
            {panel === 'features' && <textarea rows={12} value={features} onChange={(e) => setFeatures(e.target.value)} className="cs-ta" placeholder="Умения и способности" />}
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
                <textarea rows={12} value={equipment} onChange={(e) => setEquipment(e.target.value)} className="cs-ta" placeholder="Снаряжение" />
              </div>
            )}
            {panel === 'personality' && (
              <div className="cs-stack">
                <textarea rows={5} value={personality} onChange={(e) => setPersonality(e.target.value)} className="cs-ta" placeholder="Черты характера" />
                <textarea rows={3} value={ideals} onChange={(e) => setIdeals(e.target.value)} className="cs-ta" placeholder="Идеалы" />
                <textarea rows={3} value={bonds} onChange={(e) => setBonds(e.target.value)} className="cs-ta" placeholder="Привязанности" />
                <textarea rows={3} value={flaws} onChange={(e) => setFlaws(e.target.value)} className="cs-ta" placeholder="Слабости" />
              </div>
            )}
            {panel === 'goals' && <textarea rows={12} value={ideals} onChange={(e) => setIdeals(e.target.value)} className="cs-ta" placeholder="Цели и задачи" />}
            {panel === 'notes' && <textarea rows={12} value={notes} onChange={(e) => setNotes(e.target.value)} className="cs-ta" placeholder="Заметки" />}
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
              </div>
            )}
          </div>

          <div className="cs-block">
            <div className="cs-section-head">УМЕНИЯ И СПОСОБНОСТИ <span className="cs-collapse">∧</span></div>
            <textarea rows={5} value={features} onChange={(e) => setFeatures(e.target.value)} className="cs-ta" placeholder="Расовые, классовые умения…" />
          </div>
        </div>
      </div>

      <div className="cs-footer">
        <button type="submit" disabled={saving} className="cs-save">{saving ? 'Сохранение…' : 'Сохранить лист'}</button>
        {saved && <span className="cs-saved-mark">✓ Сохранено</span>}
      </div>
    </form>
  );
}
