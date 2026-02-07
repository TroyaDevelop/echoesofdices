export default function WondrousItemsListHeader({ query, onQueryChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold">Чудесные предметы</h1>
        <p className="mt-2 text-slate-300">Группировка по алфавиту.</p>
      </div>

      <div className="w-full sm:w-80">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Поиск…"
          className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3"
        />
      </div>
    </div>
  );
}
