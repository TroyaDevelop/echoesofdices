import MarketPriceBlock from './MarketPriceBlock.jsx';

export default function MarketItemCard({
  item,
  percent,
  categoryLabel,
  supportsCombatFields,
  weaponTypeLabel,
  openInfoId,
  setOpenInfoId,
}) {
  const hasInfo = Boolean(String(item?.short_description || '').trim());
  const isOpen = String(openInfoId || '') === String(item.id);

  const combat = supportsCombatFields(String(item?.category || ''));
  const damage = String(item?.damage || '').trim();
  const armorClass = String(item?.armor_class || '').trim();
  const weaponType = String(item?.weapon_type || '').trim();
  const weaponTypeText = weaponTypeLabel(weaponType);
  const showCombat = combat && (damage || armorClass);
  const showWeaponType = Boolean(damage && weaponTypeText);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between min-h-[150px] relative"
      tabIndex={hasInfo ? 0 : undefined}
      role={hasInfo ? 'button' : undefined}
      onMouseEnter={hasInfo ? () => setOpenInfoId(item.id) : undefined}
      onMouseLeave={hasInfo ? () => setOpenInfoId(null) : undefined}
      onClick={hasInfo ? () => setOpenInfoId((prev) => (String(prev) === String(item.id) ? null : item.id)) : undefined}
      onKeyDown={
        hasInfo
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpenInfoId((prev) => (String(prev) === String(item.id) ? null : item.id));
              }
            }
          : undefined
      }
    >
      <div className="min-w-0">
        <div className="text-base font-semibold leading-snug break-words">{item.name}</div>
        {item.category ? <div className="mt-1 text-xs text-slate-400 break-words">{categoryLabel(item.category)}</div> : null}

        {showCombat ? (
          <div className="mt-2 space-y-1">
            {damage ? (
              <div className="text-xs text-slate-200">
                Урон: <span className="text-slate-100 font-semibold">{damage}</span>
              </div>
            ) : null}
            {armorClass ? (
              <div className="text-xs text-slate-200">
                КД: <span className="text-slate-100 font-semibold">{armorClass}</span>
              </div>
            ) : null}
            {showWeaponType ? (
              <div className="text-xs text-slate-200">
                Тип: <span className="text-slate-100 font-semibold">{weaponTypeText}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {hasInfo ? (
          <div
            aria-hidden={!isOpen}
            className={
              `absolute z-30 left-3 right-3 bottom-full mb-2 ` +
              `sm:left-auto sm:right-full sm:mr-3 sm:top-3 sm:bottom-auto sm:mb-0 sm:w-80 sm:max-w-[30rem] ` +
              `rounded-xl border border-white/15 bg-slate-950/95 backdrop-blur px-3 py-2 shadow-xl ` +
              `transition-all duration-200 ease-out will-change-transform ` +
              (isOpen
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                : 'opacity-0 translate-y-1 scale-[0.98] pointer-events-none')
            }
          >
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Описание</div>
            <div className="mt-1 text-sm text-slate-100 whitespace-pre-wrap break-words">
              {String(item.short_description || '').trim()}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <MarketPriceBlock item={item} percent={Number(percent || 0)} />
      </div>
    </div>
  );
}
