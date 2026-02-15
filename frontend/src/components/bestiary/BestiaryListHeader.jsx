export default function BestiaryListHeader({ query, onQueryChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold">Бестиарий</h1>
        <p className="mt-2 text-slate-300">Монстры и существа D&D 5e (формат MM 2014).</p>
      </div>

      <div className="w-full sm:w-80">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Поиск монстра…"
          className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3"
        />
      </div>
    </div>
  );
}