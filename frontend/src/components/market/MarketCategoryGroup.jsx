import MarketItemCard from './MarketItemCard.jsx';

export default function MarketCategoryGroup({
  group,
  showTitle,
  regionId,
  markupMap,
  categoryLabel,
  supportsCombatFields,
  weaponTypeLabel,
  openInfoId,
  setOpenInfoId,
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
          const percent = markupMap.get(`${String(regionId)}:${String(item?.category || '')}`) ?? 0;
          return (
            <MarketItemCard
              key={item.id}
              item={item}
              percent={Number(percent || 0)}
              categoryLabel={categoryLabel}
              supportsCombatFields={supportsCombatFields}
              weaponTypeLabel={weaponTypeLabel}
              openInfoId={openInfoId}
              setOpenInfoId={setOpenInfoId}
            />
          );
        })}
      </div>
    </div>
  );
}
