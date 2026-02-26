import { Link } from 'react-router-dom';

const sourceBadgesOf = (background) =>
  String(background?.source || '')
    .split(/[,;/]+/)
    .map((value) => String(value || '').trim())
    .filter(Boolean);

export default function BackgroundCard({ background }) {
  const sourceBadges = sourceBadgesOf(background);

  return (
    <Link
      to={`/backgrounds/${background.id}`}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-start justify-between gap-3 hover:bg-white/10 transition-colors"
    >
      <div className="min-w-0">
        <div className="font-medium text-slate-100 truncate">{background.name}</div>
      </div>

      {sourceBadges.length > 0 ? (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {sourceBadges.map((badge) => (
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
