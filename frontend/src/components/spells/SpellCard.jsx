import { Link } from 'react-router-dom';

const levelBadge = (level) => {
  const lvl = Number(level);
  if (!Number.isFinite(lvl)) return 'Ур. ?';
  if (lvl === 0) return 'Заговор';
  return `Ур. ${lvl}`;
};

export default function SpellCard({ spell }) {
  return (
    <Link
      to={`/spells/${spell.id}`}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-start justify-between gap-3 hover:bg-white/10 transition-colors"
    >
      <div className="min-w-0">
        <div className="font-medium text-slate-100 truncate">{spell.name}</div>
        {(spell.school || spell.components) && (
          <div className="mt-0.5 text-xs text-slate-400 truncate">
            {[spell.school, spell.components].filter(Boolean).join(' • ')}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-200">
          {levelBadge(spell.level)}
        </span>
      </div>
    </Link>
  );
}
