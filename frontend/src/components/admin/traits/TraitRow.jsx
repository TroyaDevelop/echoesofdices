import TraitEditForm from './TraitEditForm.jsx';

export default function TraitRow({
  trait,
  isEditing,
  onStartEdit,
  onDelete,
  editState,
  onSaveEdit,
  onCancelEdit,
}) {
  const sourceBadge = [trait.source, trait.source_pages].filter(Boolean).join(' ');

  return (
    <div className="p-4 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="font-semibold text-gray-900 truncate">{trait.name}</div>
          {sourceBadge ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {sourceBadge}
            </span>
          ) : null}
        </div>

        {isEditing ? (
          <TraitEditForm
            editingKey={editState.editingKey}
            editName={editState.editName}
            onEditNameChange={editState.setEditName}
            editNameEn={editState.editNameEn}
            onEditNameEnChange={editState.setEditNameEn}
            editSource={editState.editSource}
            onEditSourceChange={editState.setEditSource}
            editSourcePages={editState.editSourcePages}
            onEditSourcePagesChange={editState.setEditSourcePages}
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
