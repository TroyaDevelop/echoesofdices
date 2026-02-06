import { Link } from 'react-router-dom';

const traitSourceBadge = (trait) => {
  const source = String(trait?.source || '').trim();
  const pages = String(trait?.source_pages || '').trim();
  if (!source && !pages) return '';
  return [source, pages].filter(Boolean).join(' ');
};

export default function TraitCard({ trait }) {
  const sourceBadge = traitSourceBadge(trait);

  return (
    <Link
      to={`/traits/${trait.id}`}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-start justify-between gap-3 hover:bg-white/10 transition-colors"
    >
      <div className="min-w-0">
        <div className="font-medium text-slate-100 truncate">{trait.name}</div>
        {sourceBadge ? (
          <div className="mt-0.5 text-xs text-slate-400 truncate">Источник: {sourceBadge}</div>
        ) : null}
      </div>

      {sourceBadge ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-200">
            {sourceBadge}
          </span>
        </div>
      ) : null}
    </Link>
  );
}
