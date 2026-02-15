import { Link } from 'react-router-dom';

const normalize = (v) => String(v || '').trim();

export default function BestiaryCard({ monster }) {
  const typeLine = [normalize(monster?.size), normalize(monster?.creature_type), normalize(monster?.alignment)]
    .filter(Boolean)
    .join(', ');

  const cr = normalize(monster?.challenge_rating);

  return (
    <Link
      to={`/bestiary/${monster.id}`}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-start justify-between gap-3 hover:bg-white/10 transition-colors"
    >
      <div className="min-w-0">
        <div className="font-medium text-slate-100 truncate">{monster.name}</div>
        {typeLine ? <div className="mt-0.5 text-xs text-slate-400 truncate">{typeLine}</div> : null}
      </div>

      {cr ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-200">CR {cr}</span>
        </div>
      ) : null}
    </Link>
  );
}