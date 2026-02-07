const field = (value) => {
  const s = String(value ?? '').trim();
  return s ? s : '—';
};

const formatCost = (value) => {
  const s = String(value ?? '').trim();
  if (!s) return '—';
  return /\s?зм$/i.test(s) ? s : `${s} зм`;
};

export default function WondrousItemMetaGrid({ recommendedCost }) {
  return (
    <div className="px-4 sm:px-6 py-3 space-y-1 text-[15px]">
      <div>
        <span className="font-semibold">Рекоменд. стоимость:</span> {formatCost(recommendedCost)}
      </div>
    </div>
  );
}
