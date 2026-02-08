import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.jsx';
import { userProfileAPI } from '../lib/api.js';

const toSkillValue = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const v = Math.trunc(n);
  if (v < 0 || v > 2) return 0;
  return v;
};

const toLevelValue = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  const v = Math.trunc(n);
  if (v < 1) return 1;
  if (v > 20) return 20;
  return v;
};

const proficiencyBonusForLevel = (level) => {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
};

const formatBonus = (value) => (value >= 0 ? `+${value}` : String(value));

const abilityMod = (score) => {
  const n = Number(score);
  if (!Number.isFinite(n)) return 0;
  return Math.floor((n - 10) / 2);
};

const formatJoinDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState(null);
  const [level, setLevel] = useState('1');
  const [strength, setStrength] = useState('');
  const [dexterity, setDexterity] = useState('');
  const [constitution, setConstitution] = useState('');
  const [intelligence, setIntelligence] = useState('');
  const [wisdom, setWisdom] = useState('');
  const [charisma, setCharisma] = useState('');
  const [acrobatics, setAcrobatics] = useState(0);
  const [investigation, setInvestigation] = useState(0);
  const [athletics, setAthletics] = useState(0);
  const [perception, setPerception] = useState(0);
  const [survival, setSurvival] = useState(0);
  const [persuasion, setPersuasion] = useState(0);
  const [performance, setPerformance] = useState(0);
  const [intimidation, setIntimidation] = useState(0);
  const [deception, setDeception] = useState(0);
  const [history, setHistory] = useState(0);
  const [sleightOfHand, setSleightOfHand] = useState(0);
  const [arcana, setArcana] = useState(0);
  const [medicine, setMedicine] = useState(0);
  const [nature, setNature] = useState(0);
  const [insight, setInsight] = useState(0);
  const [religion, setReligion] = useState(0);
  const [stealth, setStealth] = useState(0);
  const [animalHandling, setAnimalHandling] = useState(0);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError('');
      setSaved(false);
      try {
        const data = await userProfileAPI.get();
        if (!isActive) return;
        setProfile(data);
        setLevel(data?.character_level ? String(data.character_level) : '1');
        setStrength(data?.strength === null || data?.strength === undefined ? '' : String(data.strength));
        setDexterity(data?.dexterity === null || data?.dexterity === undefined ? '' : String(data.dexterity));
        setConstitution(data?.constitution === null || data?.constitution === undefined ? '' : String(data.constitution));
        setIntelligence(data?.intelligence === null || data?.intelligence === undefined ? '' : String(data.intelligence));
        setWisdom(data?.wisdom === null || data?.wisdom === undefined ? '' : String(data.wisdom));
        setCharisma(data?.charisma === null || data?.charisma === undefined ? '' : String(data.charisma));
        setAcrobatics(toSkillValue(data?.skill_acrobatics));
        setInvestigation(toSkillValue(data?.skill_investigation));
        setAthletics(toSkillValue(data?.skill_athletics));
        setPerception(toSkillValue(data?.skill_perception));
        setSurvival(toSkillValue(data?.skill_survival));
        setPersuasion(toSkillValue(data?.skill_persuasion));
        setPerformance(toSkillValue(data?.skill_performance));
        setIntimidation(toSkillValue(data?.skill_intimidation));
        setDeception(toSkillValue(data?.skill_deception));
        setHistory(toSkillValue(data?.skill_history));
        setSleightOfHand(toSkillValue(data?.skill_sleight_of_hand));
        setArcana(toSkillValue(data?.skill_arcana));
        setMedicine(toSkillValue(data?.skill_medicine));
        setNature(toSkillValue(data?.skill_nature));
        setInsight(toSkillValue(data?.skill_insight));
        setReligion(toSkillValue(data?.skill_religion));
        setStealth(toSkillValue(data?.skill_stealth));
        setAnimalHandling(toSkillValue(data?.skill_animal_handling));
      } catch (e) {
        if (!isActive) return;
        console.error(e);
        setError(e.message || 'Ошибка загрузки профиля');
        try {
          const token = localStorage.getItem('token');
          if (!token) navigate('/login', { replace: true });
        } catch {
          navigate('/login', { replace: true });
        }
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const displayName = useMemo(() => {
    if (!profile) return '';
    return profile.nickname || profile.login || 'Без имени';
  }, [profile]);

  const joinedDate = useMemo(() => formatJoinDate(profile?.created_at), [profile]);

  const levelValue = useMemo(() => toLevelValue(level), [level]);
  const proficiencyBonus = useMemo(() => proficiencyBonusForLevel(levelValue), [levelValue]);
  const abilityScores = useMemo(
    () => ({
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
    }),
    [strength, dexterity, constitution, intelligence, wisdom, charisma]
  );

  const abilities = useMemo(
    () => [
      { id: 'strength', label: 'Сила', value: strength, onChange: setStrength },
      { id: 'dexterity', label: 'Ловкость', value: dexterity, onChange: setDexterity },
      { id: 'constitution', label: 'Телосложение', value: constitution, onChange: setConstitution },
      { id: 'intelligence', label: 'Интеллект', value: intelligence, onChange: setIntelligence },
      { id: 'wisdom', label: 'Мудрость', value: wisdom, onChange: setWisdom },
      { id: 'charisma', label: 'Харизма', value: charisma, onChange: setCharisma },
    ],
    [strength, dexterity, constitution, intelligence, wisdom, charisma]
  );

  const skills = useMemo(
    () => [
      { id: 'acrobatics', label: 'Акробатика', ability: 'dexterity', value: acrobatics, onChange: setAcrobatics },
      { id: 'investigation', label: 'Анализ', ability: 'intelligence', value: investigation, onChange: setInvestigation },
      { id: 'athletics', label: 'Атлетика', ability: 'strength', value: athletics, onChange: setAthletics },
      { id: 'perception', label: 'Восприятие', ability: 'wisdom', value: perception, onChange: setPerception },
      { id: 'survival', label: 'Выживание', ability: 'wisdom', value: survival, onChange: setSurvival },
      { id: 'performance', label: 'Выступление', ability: 'charisma', value: performance, onChange: setPerformance },
      { id: 'intimidation', label: 'Запугивание', ability: 'charisma', value: intimidation, onChange: setIntimidation },
      { id: 'history', label: 'История', ability: 'intelligence', value: history, onChange: setHistory },
      { id: 'sleight_of_hand', label: 'Ловкость рук', ability: 'dexterity', value: sleightOfHand, onChange: setSleightOfHand },
      { id: 'arcana', label: 'Магия', ability: 'intelligence', value: arcana, onChange: setArcana },
      { id: 'medicine', label: 'Медицина', ability: 'wisdom', value: medicine, onChange: setMedicine },
      { id: 'deception', label: 'Обман', ability: 'charisma', value: deception, onChange: setDeception },
      { id: 'nature', label: 'Природа', ability: 'intelligence', value: nature, onChange: setNature },
      { id: 'insight', label: 'Проницательность', ability: 'wisdom', value: insight, onChange: setInsight },
      { id: 'religion', label: 'Религия', ability: 'intelligence', value: religion, onChange: setReligion },
      { id: 'stealth', label: 'Скрытность', ability: 'dexterity', value: stealth, onChange: setStealth },
      { id: 'persuasion', label: 'Убеждение', ability: 'charisma', value: persuasion, onChange: setPersuasion },
      { id: 'animal_handling', label: 'Уход за животными', ability: 'wisdom', value: animalHandling, onChange: setAnimalHandling },
    ],
    [
      acrobatics,
      investigation,
      athletics,
      perception,
      survival,
      performance,
      intimidation,
      history,
      sleightOfHand,
      arcana,
      medicine,
      deception,
      nature,
      insight,
      religion,
      stealth,
      persuasion,
      animalHandling,
    ]
  );

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const payload = {
        character_level: level === '' ? 1 : Number(level),
        strength: strength === '' ? null : Number(strength),
        dexterity: dexterity === '' ? null : Number(dexterity),
        constitution: constitution === '' ? null : Number(constitution),
        intelligence: intelligence === '' ? null : Number(intelligence),
        wisdom: wisdom === '' ? null : Number(wisdom),
        charisma: charisma === '' ? null : Number(charisma),
        skill_acrobatics: Number(acrobatics),
        skill_investigation: Number(investigation),
        skill_athletics: Number(athletics),
        skill_perception: Number(perception),
        skill_survival: Number(survival),
        skill_persuasion: Number(persuasion),
        skill_performance: Number(performance),
        skill_intimidation: Number(intimidation),
        skill_deception: Number(deception),
        skill_history: Number(history),
        skill_sleight_of_hand: Number(sleightOfHand),
        skill_arcana: Number(arcana),
        skill_medicine: Number(medicine),
        skill_nature: Number(nature),
        skill_insight: Number(insight),
        skill_religion: Number(religion),
        skill_stealth: Number(stealth),
        skill_animal_handling: Number(animalHandling),
      };
      const next = await userProfileAPI.update(payload);
      setProfile(next);
      setSaved(true);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка сохранения профиля');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PublicLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Профиль</h1>
        </div>

        {error && <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div>}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 self-start">
              <div className="text-2xl font-semibold text-slate-100">{displayName}</div>
              {joinedDate ? (
                <div className="mt-1 text-xs text-slate-400">Присоединился к Echoes ({joinedDate})</div>
              ) : null}
            </div>

            <form
              onSubmit={handleSave}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-wider text-amber-300">БЕТА</div>
                </div>
                {saved ? <div className="text-sm text-emerald-200">Сохранено</div> : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3">
                <label className="text-sm text-slate-300" htmlFor="profile-level">
                  Уровень
                </label>
                <input
                  id="profile-level"
                  type="number"
                  min={1}
                  max={20}
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="Например 3"
                  className="px-4 py-2 border border-white/10 bg-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3">
                <div className="text-sm text-slate-300">Бонус мастерства</div>
                <div className="px-4 py-2 border border-white/10 bg-black/20 rounded-lg text-slate-100">
                  {formatBonus(proficiencyBonus)}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20">
                <div className="px-4 py-2 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                  Характеристики
                </div>
                <ul className="divide-y divide-white/10">
                  {abilities.map((ability) => (
                    <li key={ability.id} className="grid grid-cols-[1fr_6rem_3rem] items-center gap-3 px-4 py-2">
                      <span className="text-sm text-slate-100">{ability.label}</span>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={ability.value}
                        onChange={(e) => ability.onChange(e.target.value)}
                        className="px-3 py-1.5 border border-white/10 bg-black/10 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm text-slate-300 tabular-nums text-right">
                        {formatBonus(abilityMod(ability.value))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20">
                <div className="px-4 py-2 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                  Навыки
                </div>
                <ul className="divide-y divide-white/10">
                  {skills.map((skill) => {
                    const profLevel = toSkillValue(skill.value);
                    const abilityScore = abilityScores[skill.ability];
                    const bonus = abilityMod(abilityScore) + proficiencyBonus * (profLevel === 2 ? 2 : profLevel);
                    const nextLevel = (profLevel + 1) % 3;
                    const circleClass =
                      profLevel === 0
                        ? 'border-white/40'
                        : profLevel === 1
                          ? 'border-emerald-300/70 bg-emerald-400'
                          : 'border-emerald-200 bg-emerald-400 ring-2 ring-emerald-200/70';
                    return (
                      <li key={skill.id} className="flex items-center justify-between gap-3 px-4 py-2">
                        <button
                          type="button"
                          onClick={() => skill.onChange(nextLevel)}
                          className="flex items-center gap-3 text-left"
                          title="Переключить владение"
                        >
                          <span
                            className={`h-4 w-4 rounded-full border ${circleClass} transition-colors`}
                            aria-hidden="true"
                          />
                          <span className="text-sm text-slate-100">{skill.label}</span>
                        </button>
                        <span className="text-sm text-slate-200 tabular-nums">{formatBonus(bonus)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-60"
                >
                  {saving ? 'Сохранение…' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
