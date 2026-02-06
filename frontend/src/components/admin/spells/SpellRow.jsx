import SpellEditForm from './SpellEditForm.jsx';

const levelBadge = (level) => {
  if (!Number.isFinite(Number(level))) return 'Ур. ?';
  return Number(level) === 0 ? 'Заговор' : `Ур. ${level}`;
};

export default function SpellRow({
  spell,
  isEditing,
  onStartEdit,
  onDelete,
  editState,
  themeOptions,
  onSaveEdit,
  onCancelEdit,
}) {
  return (
    <div className="p-4 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="font-semibold text-gray-900 truncate">{spell.name}</div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {levelBadge(spell.level)}
          </span>
        </div>
        {(spell.school || spell.components) && (
          <div className="text-sm text-gray-600 mt-1">{[spell.school, spell.components].filter(Boolean).join(' • ')}</div>
        )}

        {isEditing ? (
          <SpellEditForm
            editingKey={editState.editingKey}
            editName={editState.editName}
            onEditNameChange={editState.setEditName}
            editNameEn={editState.editNameEn}
            onEditNameEnChange={editState.setEditNameEn}
            editLevel={editState.editLevel}
            onEditLevelChange={editState.setEditLevel}
            editSchool={editState.editSchool}
            onEditSchoolChange={editState.setEditSchool}
            editTheme={editState.editTheme}
            onEditThemeChange={editState.setEditTheme}
            editCastingTime={editState.editCastingTime}
            onEditCastingTimeChange={editState.setEditCastingTime}
            editRangeText={editState.editRangeText}
            onEditRangeTextChange={editState.setEditRangeText}
            editComponents={editState.editComponents}
            onEditComponentsChange={editState.setEditComponents}
            editDuration={editState.editDuration}
            onEditDurationChange={editState.setEditDuration}
            editClasses={editState.editClasses}
            onEditClassesChange={editState.setEditClasses}
            editSubclasses={editState.editSubclasses}
            onEditSubclassesChange={editState.setEditSubclasses}
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
            themeOptions={themeOptions}
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
