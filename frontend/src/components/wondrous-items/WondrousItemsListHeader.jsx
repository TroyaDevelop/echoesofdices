export default function WondrousItemsListHeader({ query, onQueryChange, sourceOptions, selectedSources, onToggleSource, onClearSources }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold">Чудесные предметы</h1>
        <p className="mt-2 text-slate-300">Группировка по алфавиту.</p>
      </div>

      {sourceOptions?.length ? (
        <details className="w-full sm:w-56 relative group">
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
      ) : null}

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
