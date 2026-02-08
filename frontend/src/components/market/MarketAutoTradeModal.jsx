import { useEffect, useMemo, useState } from 'react';

const formatPrice = (item) => {
  const gp = Number(item?.price_gp || 0);
  const sp = Number(item?.price_sp || 0);
  const cp = Number(item?.price_cp || 0);
  return { gp, sp, cp };
};

const toCopper = ({ gp, sp, cp }) => {
  const g = Number(gp || 0);
  const s = Number(sp || 0);
  const c = Number(cp || 0);
  return g * 100 + s * 10 + c;
};

const fromCopper = (totalCp) => {
  const t = Math.max(0, Math.trunc(Number(totalCp || 0)));
  const gp = Math.floor(t / 100);
  const sp = Math.floor((t % 100) / 10);
  const cp = t % 10;
  return { gp, sp, cp };
};

const applyMarkupPercent = (baseCp, percent) => {
  const b = Math.max(0, Math.trunc(Number(baseCp || 0)));
  const p = Number(percent || 0);
  if (!Number.isFinite(p) || p === 0) return b;
  return Math.round((b * (100 + p)) / 100);
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const pricePercentForRoll = (roll) => {
  const r = clamp(Math.trunc(Number(roll || 0)), 1, 20);
  if (r <= 10) {
    return 0.10 + ((r - 1) * 0.23) / 9;
  }
  return 0.33 + ((r - 10) * 0.67) / 10;
};

const percentForSell = (result, isCritical) => {
  if (isCritical) return 1;
  const numeric = Math.trunc(Number(result || 0));
  const capped = clamp(numeric, 1, 19);
  return pricePercentForRoll(capped);
};

const percentForBuy = (result, roll) => {
  if (roll === 20) return 1 / 3;
  const numeric = Math.trunc(Number(result || 0));
  const capped = clamp(numeric, 1, 19);
  if (capped <= 10) {
    return 1 + ((10 - capped) * 0.9) / 9;
  }
  return 1 - ((capped - 10) * 0.6) / 9;
};

const Coin = ({ label, value, className }) => {
  if (!value) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${className}`}>
      <span>{value}</span>
      <span className="opacity-90">{label}</span>
    </span>
  );
};

const CoinRow = ({ value, emptyLabel, className }) => {
  const hasAny = value.gp || value.sp || value.cp;
  if (!hasAny) {
    return <span className="text-xs text-slate-400">{emptyLabel}</span>;
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className || ''}`.trim()}>
      <Coin label="З" value={value.gp} className="bg-amber-500/25 text-amber-200 border border-amber-500/30" />
      <Coin label="С" value={value.sp} className="bg-slate-400/20 text-slate-100 border border-white/15" />
      <Coin label="М" value={value.cp} className="bg-orange-500/20 text-orange-200 border border-orange-500/30" />
    </div>
  );
};

export default function MarketAutoTradeModal({
  item,
  percent,
  isOpen,
  onClose,
  onTradeComplete,
  skillOptions,
  tradeContext,
}) {
  const [skillId, setSkillId] = useState('');
  const [lastTrade, setLastTrade] = useState(null);
  const [tradeType, setTradeType] = useState('sell');

  const baseCp = useMemo(() => toCopper(formatPrice(item)), [item]);
  const buyCp = useMemo(() => applyMarkupPercent(baseCp, percent), [baseCp, percent]);
  const buyPrice = useMemo(() => fromCopper(buyCp), [buyCp]);
  const sellBaseCp = useMemo(() => Math.floor(buyCp / 3), [buyCp]);
  const sellBase = useMemo(() => fromCopper(sellBaseCp), [sellBaseCp]);

  useEffect(() => {
    setLastTrade(null);
    setTradeType('sell');
  }, [item?.id]);

  useEffect(() => {
    const next = Array.isArray(skillOptions) && skillOptions.length ? skillOptions[0].id : '';
    setSkillId(next);
  }, [skillOptions, item?.id]);

  const selectedSkill = useMemo(() => {
    return (Array.isArray(skillOptions) ? skillOptions : []).find((opt) => opt.id === skillId) || null;
  }, [skillOptions, skillId]);

  const selectedBonus = selectedSkill?.bonus ?? 0;

  const handleTrade = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const bonus = Math.trunc(Number(selectedBonus || 0)) || 0;
    const result = Math.trunc(roll + bonus);
    const percentValue = tradeType === 'buy' ? percentForBuy(result, roll) : percentForSell(result, roll === 20);
    const finalCp = Math.max(1, Math.round(buyCp * percentValue));
    const finalPrice = fromCopper(finalCp);

    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date(),
      tradeType,
      tradeLabel: tradeType === 'buy' ? 'Покупка' : 'Продажа',
      itemName: String(item?.name || '—'),
      itemId: item?.id ?? null,
      roll,
      bonus,
      result,
      percentValue,
      baseCp: buyCp,
      sellBaseCp,
      finalCp,
      finalPrice,
      skillId: selectedSkill?.id ?? null,
      skillLabel: selectedSkill?.label ?? null,
      season: tradeContext?.season || 'spring_summer',
      regionId: tradeContext?.regionId ?? null,
      category: tradeContext?.category || String(item?.category || ''),
      markupPercent: tradeContext?.markupPercent ?? 0,
    };

    setLastTrade({
      ...entry,
      basePrice: buyPrice,
      sellBase: sellBase,
    });

    onTradeComplete?.(entry);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-slate-950/95 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400">Торговля</div>
            <div className="mt-1 text-2xl font-semibold text-slate-100">{item?.name || 'Предмет'}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Цена покупки</div>
              <div className="mt-2">
                <CoinRow value={buyPrice} emptyLabel="—" />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Цена продажи</div>
              <div className="mt-2">
                <CoinRow value={sellBase} emptyLabel="—" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Бросок и модификаторы</div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTradeType('sell')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    tradeType === 'sell'
                      ? 'bg-white/15 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Продажа
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType('buy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    tradeType === 'buy'
                      ? 'bg-white/15 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Покупка
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-slate-200">
                Навык
                <select
                  value={skillId}
                  onChange={(e) => setSkillId(e.target.value)}
                  className="ml-2 px-2 py-1 rounded-md border border-white/10 bg-black/30 text-slate-100"
                >
                  {(skillOptions || []).map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
                <div className="text-sm text-slate-200">Бонус: {selectedBonus >= 0 ? `+${selectedBonus}` : selectedBonus}</div>
                <button
                  type="button"
                  onClick={handleTrade}
                  className="px-4 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 font-semibold"
                >
                  Торговать
                </button>
              </div>
            </div>

            {lastTrade ? (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3">
                <div className="text-sm text-emerald-200">
                  Бросок: <span className="font-semibold">{lastTrade.roll}</span> + {lastTrade.bonus} ={' '}
                  <span className="font-semibold">{lastTrade.result}</span>
                </div>
                <div className="mt-2 text-sm text-emerald-200">
                  Финальная {lastTrade.tradeType === 'buy' ? 'покупка' : 'продажа'}:
                </div>
                <div className="mt-1">
                  <CoinRow value={lastTrade.finalPrice} emptyLabel="—" />
                </div>
                <div className="mt-2 text-xs text-emerald-300/80">Сделка записана в журнал.</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
