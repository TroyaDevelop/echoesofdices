export default function SpellListHeader({
  groupMode,
  onGroupModeChange,
  query,
  onQueryChange,
  classFilter,
  onClassFilterChange,
  classOptions,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold">Заклинания</h1>
        <p className="mt-2 text-slate-300">
          {groupMode === 'level' ? 'Группировка по уровню.' : 'Группировка по алфавиту.'}
        </p>
      </div>

      <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="inline-flex rounded-xl border border-white/10 bg-slate-900/60 p-1">
          <button
            type="button"
            onClick={() => onGroupModeChange('alpha')}
            className={
              groupMode === 'alpha'
                ? 'px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/10 text-slate-100'
                : 'px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-slate-100'
            }
          >
            Алфавит
          </button>
          <button
            type="button"
            onClick={() => onGroupModeChange('level')}
            className={
              groupMode === 'level'
                ? 'px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/10 text-slate-100'
                : 'px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-slate-100'
            }
          >
            Уровень
          </button>
        </div>

        <div className="w-full sm:w-56">
          <select
            value={classFilter}
            onChange={(e) => onClassFilterChange(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3"
          >
            <option value="">Все классы</option>
            {classOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
    </div>
  );
}
