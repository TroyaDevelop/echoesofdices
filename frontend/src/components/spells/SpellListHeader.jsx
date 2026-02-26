export default function SpellListHeader({
  groupMode,
  onGroupModeChange,
  query,
  onQueryChange,
  classFilter,
  onClassFilterChange,
  classOptions,
  schoolFilter,
  onSchoolFilterChange,
  schoolOptions,
  sourceOptions,
  selectedSources,
  onToggleSource,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold">Заклинания</h1>
        <p className="mt-2 text-slate-300">
          {groupMode === 'level' ? 'Группировка по уровню.' : 'Группировка по алфавиту.'}
        </p>
      </div>

      <div className="w-full lg:max-w-4xl flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

          <div className="w-full">
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

          <div className="w-full">
            <select
              value={schoolFilter}
              onChange={(e) => onSchoolFilterChange(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3"
            >
              <option value="">Все школы</option>
              {(schoolOptions || []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sourceOptions?.length ? (
            <details className="w-full relative group">
              <summary className="list-none cursor-pointer w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 flex items-center justify-between">
                <span>Источники{selectedSources?.length ? ` (${selectedSources.length})` : ''}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="absolute z-20 mt-2 w-full min-w-[16rem] rounded-xl border border-white/10 bg-slate-950/95 backdrop-blur shadow-xl overflow-hidden">
                <div className="max-h-56 overflow-y-auto py-1">
                  {sourceOptions.map((src) => {
                    const selected = (selectedSources || []).includes(src.value);
                    return (
                      <button
                        key={src.value}
                        type="button"
                        onClick={() => onToggleSource(src.value)}
                        className={selected
                          ? 'w-full px-3 py-2 text-left text-sm bg-purple-500/20 text-purple-100 hover:bg-purple-500/30 flex items-center justify-between'
                          : 'w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10 flex items-center justify-between'}
                      >
                        <span className="truncate pr-2">{src.label}</span>
                        {selected ? <span className="text-purple-200">✓</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </details>
          ) : (
            <div />
          )}

          <div className="w-full lg:col-span-2">
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Поиск…"
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
