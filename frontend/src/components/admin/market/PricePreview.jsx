export default function PricePreview({ gp, sp, cp }) {
  const g = Number(gp || 0);
  const s = Number(sp || 0);
  const c = Number(cp || 0);
  const hasAny = g || s || c;

  if (!hasAny) {
    return <span className="text-xs text-gray-500">Цена: —</span>;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs">
      {g ? (
        <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200">{g} З</span>
      ) : null}
      {s ? (
        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 border border-gray-200">{s} С</span>
      ) : null}
      {c ? (
        <span className="px-2 py-1 rounded-md bg-orange-100 text-orange-800 border border-orange-200">{c} М</span>
      ) : null}
    </div>
  );
}
