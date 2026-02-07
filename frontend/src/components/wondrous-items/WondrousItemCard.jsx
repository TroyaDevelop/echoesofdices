import { Link } from 'react-router-dom';

const sourceBadge = (item) => {
  const source = String(item?.source || '').trim();
  const pages = String(item?.source_pages || '').trim();
  if (!source && !pages) return '';
  return [source, pages].filter(Boolean).join(' ');
};

export default function WondrousItemCard({ item }) {
  const badge = sourceBadge(item);

  return (
    <Link
      to={`/wondrous-items/${item.id}`}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-start justify-between gap-3 hover:bg-white/10 transition-colors"
    >
      <div className="min-w-0">
        <div className="font-medium text-slate-100 truncate">{item.name}</div>
      </div>

      {badge ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-200">
            {badge}
          </span>
        </div>
      ) : null}
    </Link>
  );
}
