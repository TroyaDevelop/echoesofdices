import { Link } from 'react-router-dom';

const sourceBadges = (item) =>
  String(item?.source || '')
    .split(/[,;/]+/)
    .map((value) => String(value || '').trim())
    .filter(Boolean);

export default function WondrousItemCard({ item }) {
  const badges = sourceBadges(item);

  return (
    <Link
      to={`/wondrous-items/${item.id}`}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-start justify-between gap-3 hover:bg-white/10 transition-colors"
    >
      <div className="min-w-0">
        <div className="font-medium text-slate-100 truncate">{item.name}</div>
      </div>

      {badges.length > 0 ? (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {badges.map((badge) => (
            <span
              key={badge}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-200"
            >
              {badge}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
