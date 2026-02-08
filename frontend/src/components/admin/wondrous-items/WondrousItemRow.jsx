import WondrousItemEditForm from './WondrousItemEditForm.jsx';

const typeLabel = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'weapon') return 'Оружие';
  if (v === 'armor') return 'Доспех';
  return 'Чудесный предмет';
};

const rarityLabel = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'common') return 'Обычный';
  if (v === 'uncommon') return 'Необычный';
  if (v === 'rare') return 'Редкий';
  if (v === 'very_rare') return 'Очень редкий';
  if (v === 'legendary') return 'Легендарный';
  if (v === 'artifact') return 'Артефакт';
  return '';
};

export default function WondrousItemRow({
  item,
  isEditing,
  onStartEdit,
  onDelete,
  editState,
  sourceListId,
  sourceOptions,
  onSaveEdit,
  onCancelEdit,
}) {
  const sourceBadge = String(item.source || '')
    .split(/[,;/]+/)
    .map((value) => String(value || '').trim())
    .filter(Boolean)[0] || '';
  const typeBadge = typeLabel(item.item_type);
  const rarityBadge = rarityLabel(item.rarity);

  return (
    <div className="p-4 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="font-semibold text-gray-900 truncate">{item.name}</div>
          {typeBadge ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              {typeBadge}
            </span>
          ) : null}
          {rarityBadge ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              {rarityBadge}
            </span>
          ) : null}
          {sourceBadge ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {sourceBadge}
            </span>
          ) : null}
        </div>

        {isEditing ? (
          <WondrousItemEditForm
            editingKey={editState.editingKey}
            editName={editState.editName}
            onEditNameChange={editState.setEditName}
            editNameEn={editState.editNameEn}
            onEditNameEnChange={editState.setEditNameEn}
            editItemType={editState.editItemType}
            onEditItemTypeChange={editState.setEditItemType}
            editRarity={editState.editRarity}
            onEditRarityChange={editState.setEditRarity}
            editRecommendedCost={editState.editRecommendedCost}
            onEditRecommendedCostChange={editState.setEditRecommendedCost}
            editRarityEot={editState.editRarityEot}
            onEditRarityEotChange={editState.setEditRarityEot}
            editRecommendedCostEot={editState.editRecommendedCostEot}
            onEditRecommendedCostEotChange={editState.setEditRecommendedCostEot}
            editAttunementRequired={editState.editAttunementRequired}
            onEditAttunementRequiredChange={editState.setEditAttunementRequired}
            editAttunementBy={editState.editAttunementBy}
            onEditAttunementByChange={editState.setEditAttunementBy}
            editSource={editState.editSource}
            onEditSourceChange={editState.setEditSource}
            sourceListId={sourceListId}
            sourceOptions={sourceOptions}
            editDescription={editState.editDescription}
            onEditDescriptionChange={editState.setEditDescription}
            editHasEotVariant={editState.editHasEotVariant}
            onEditHasEotVariantChange={editState.setEditHasEotVariant}
            editDescriptionEot={editState.editDescriptionEot}
            onEditDescriptionEotChange={editState.setEditDescriptionEot}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        ) : null}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {isEditing ? null : (
          <button onClick={onStartEdit} className="text-gray-700 hover:text-gray-900 font-medium text-sm">
            Редактировать
          </button>
        )}
        <button onClick={onDelete} className="text-red-600 hover:text-red-900 font-medium text-sm">
          Удалить
        </button>
      </div>
    </div>
  );
}
