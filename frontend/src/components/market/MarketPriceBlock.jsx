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

export default function MarketPriceBlock({ item, percent, showMarkup }) {
  const base = formatPrice(item);
  const baseCp = toCopper(base);
  let content = null;

  if (!baseCp) {
    content = <span className="text-xs text-slate-400">Цена: —</span>;
  } else if (!showMarkup) {
    content = (
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-400">Цена</div>
        <CoinRow value={base} emptyLabel="—" className="justify-end" />
      </div>
    );
  } else {
    const buyCp = applyMarkupPercent(baseCp, percent);
    const buy = fromCopper(buyCp);
    const sellCp = Math.floor(buyCp / 3);
    const sell = fromCopper(sellCp);
    const p = Number(percent || 0);
    const showPercent = Number.isFinite(p) && p !== 0;
    content = (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">Покупка</div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Coin label="З" value={buy.gp} className="bg-amber-500/25 text-amber-200 border border-amber-500/30" />
            <Coin label="С" value={buy.sp} className="bg-slate-400/20 text-slate-100 border border-white/15" />
            <Coin label="М" value={buy.cp} className="bg-orange-500/20 text-orange-200 border border-orange-500/30" />
            {showPercent ? <span className="text-xs font-semibold text-emerald-300 whitespace-nowrap">+{Math.trunc(p)}%</span> : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">Продажа</div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Coin label="З" value={sell.gp} className="bg-amber-500/25 text-amber-200 border border-amber-500/30" />
            <Coin label="С" value={sell.sp} className="bg-slate-400/20 text-slate-100 border border-white/15" />
            <Coin label="М" value={sell.cp} className="bg-orange-500/20 text-orange-200 border border-orange-500/30" />
          </div>
        </div>
      </div>
    );
  }

  return <div className="min-h-[70px] flex flex-col justify-center">{content}</div>;
}
