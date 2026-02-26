import BackgroundEditForm from './BackgroundEditForm.jsx';

export default function BackgroundRow({
  background,
  isEditing,
  onStartEdit,
  onDelete,
  editState,
  sourceListId,
  sourceOptions,
  onSaveEdit,
  onCancelEdit,
}) {
  const sourceBadge = String(background.source || '')
    .split(/[,;/]+/)
    .map((item) => String(item || '').trim())
    .filter(Boolean)[0] || '';

  return (
    <div className="p-4 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="font-semibold text-gray-900 truncate">{background.name}</div>
          {sourceBadge ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {sourceBadge}
            </span>
          ) : null}
        </div>

        {isEditing ? (
          <BackgroundEditForm
            editingKey={editState.editingKey}
            editName={editState.editName}
            onEditNameChange={editState.setEditName}
            editNameEn={editState.editNameEn}
            onEditNameEnChange={editState.setEditNameEn}
            editSource={editState.editSource}
            onEditSourceChange={editState.setEditSource}
            sourceListId={sourceListId}
            sourceOptions={sourceOptions}
            editDescription={editState.editDescription}
            onEditDescriptionChange={editState.setEditDescription}
            editSkillProficiencies={editState.editSkillProficiencies}
            onEditSkillProficienciesChange={editState.setEditSkillProficiencies}
            editToolProficiencies={editState.editToolProficiencies}
            onEditToolProficienciesChange={editState.setEditToolProficiencies}
            editEquipment={editState.editEquipment}
            onEditEquipmentChange={editState.setEditEquipment}
            editSpecialtyTitle={editState.editSpecialtyTitle}
            onEditSpecialtyTitleChange={editState.setEditSpecialtyTitle}
            editSpecialtyDice={editState.editSpecialtyDice}
            onEditSpecialtyDiceChange={editState.setEditSpecialtyDice}
            editSpecialtyTable={editState.editSpecialtyTable}
            onEditSpecialtyTableChange={editState.setEditSpecialtyTable}
            editFeatureTitle={editState.editFeatureTitle}
            onEditFeatureTitleChange={editState.setEditFeatureTitle}
            editFeatureDescription={editState.editFeatureDescription}
            onEditFeatureDescriptionChange={editState.setEditFeatureDescription}
            editPersonalization={editState.editPersonalization}
            onEditPersonalizationChange={editState.setEditPersonalization}
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
