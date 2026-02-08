import { useEffect, useRef, useState } from 'react';

export default function SpellHeader({
  title,
  subtitle,
  sourceText,
  sourcePages,
  hasEotDescription,
  showEot,
  onToggleEot,
}) {
  const pagesLabel = sourcePages ? `стр. ${sourcePages}` : '';
  const sourceTokens = String(sourceText || '')
    .split(/[,;/]+/)
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  const sourceBadges = sourceTokens.length > 0 ? sourceTokens : sourcePages ? [''] : [];
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [pagesTipHover, setPagesTipHover] = useState(false);
  const [pagesTipPinned, setPagesTipPinned] = useState(false);
  const pagesTipRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    const update = () => setIsTouchDevice(Boolean(mq.matches));
    update();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    if (typeof mq.addListener === 'function') {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  useEffect(() => {
    if (!pagesTipPinned) return;
    const onPointerDown = (e) => {
      const root = pagesTipRef.current;
      if (!root) return;
      if (!root.contains(e.target)) setPagesTipPinned(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [pagesTipPinned]);

  const showPagesTip = Boolean(sourcePages) && (pagesTipPinned || pagesTipHover);

  return (
    <div className="px-4 sm:px-6 py-3 border-b border-black/10">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight break-words">
              {title || 'Без названия'}
            </h1>
            {sourceBadges.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {sourceBadges.map((badge, index) => {
                  const withPages = index === 0 && Boolean(sourcePages);
                  return (
                    <span
                      key={`${badge || 'pages'}-${index}`}
                      ref={index === 0 ? pagesTipRef : undefined}
                      className="relative inline-flex items-center rounded-md border border-black/20 bg-white/50 px-2 py-0.5 text-xs font-semibold text-slate-800"
                      onMouseEnter={() => {
                        if (isTouchDevice || !withPages) return;
                        setPagesTipHover(true);
                      }}
                      onMouseLeave={() => {
                        if (isTouchDevice || !withPages) return;
                        setPagesTipHover(false);
                      }}
                      onClick={() => {
                        if (!isTouchDevice) return;
                        if (!withPages) return;
                        setPagesTipPinned((v) => !v);
                      }}
                      role={isTouchDevice && withPages ? 'button' : undefined}
                      tabIndex={isTouchDevice && withPages ? 0 : undefined}
                      aria-label={withPages ? pagesLabel || undefined : undefined}
                    >
                      {badge || 'стр.'}

                      {withPages ? (
                        <span
                          className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 z-20 whitespace-nowrap rounded-md border border-black/20 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-lg transition-all duration-150 ease-out ${
                            showPagesTip ? 'opacity-100 translate-x-0 pointer-events-none' : 'opacity-0 translate-x-1 pointer-events-none'
                          }`}
                        >
                          {pagesLabel}
                        </span>
                      ) : null}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className="mt-1 text-sm text-slate-700 italic">{subtitle || '—'}</div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {hasEotDescription ? (
            <div className="inline-flex rounded-md border border-black/15 bg-white/40 p-0.5">
              <button
                type="button"
                onClick={() => onToggleEot?.(false)}
                className={
                  showEot
                    ? 'px-2 py-1 rounded text-xs text-slate-800 hover:bg-white/60'
                    : 'px-2 py-1 rounded text-xs font-semibold bg-white/70 text-slate-900'
                }
                title="Показать только оригинал"
              >
                Оригинал
              </button>
              <button
                type="button"
                onClick={() => onToggleEot?.(true)}
                className={
                  showEot
                    ? 'px-2 py-1 rounded text-xs font-semibold bg-white/70 text-slate-900'
                    : 'px-2 py-1 rounded text-xs text-slate-800 hover:bg-white/60'
                }
                title="Показать версию Echoes of Times"
              >
                EoT
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
