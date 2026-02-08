import MarketItemCard from './MarketItemCard.jsx';

export default function MarketCategoryGroup({
  group,
  showTitle,
  regionId,
  markupMap,
  showMarkup,
  categoryLabel,
  supportsCombatFields,
  weaponTypeLabel,
  armorTypeLabel,
  openInfoId,
  setOpenInfoId,
  onTrade,
}) {
  return (
    <div className="space-y-3">
      {showTitle ? (
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-semibold">{group.label}</h3>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(group.items || []).map((item) => {
          const percent = showMarkup ? (markupMap.get(`${String(regionId)}:${String(item?.category || '')}`) ?? 0) : 0;
          return (
            <MarketItemCard
              key={item.id}
              item={item}
              percent={Number(percent || 0)}
              showMarkup={showMarkup}
              categoryLabel={categoryLabel}
              supportsCombatFields={supportsCombatFields}
              weaponTypeLabel={weaponTypeLabel}
              armorTypeLabel={armorTypeLabel}
              openInfoId={openInfoId}
              setOpenInfoId={setOpenInfoId}
              onTrade={onTrade}
            />
          );
        })}
      </div>
    </div>
  );
}
