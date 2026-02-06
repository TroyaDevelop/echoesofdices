import SpellCard from './SpellCard.jsx';

export default function SpellGroupSection({ title, items }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(items || []).map((spell) => (
          <SpellCard key={spell.id} spell={spell} />
        ))}
      </div>
    </section>
  );
}
