import SpellDescriptionEditor from '../SpellDescriptionEditor.jsx';
import TokenHint from '../TokenHint.jsx';

export default function BackgroundCreateForm({
  name,
  onNameChange,
  nameEn,
  onNameEnChange,
  source,
  onSourceChange,
  sourceListId,
  sourceOptions,
  description,
  onDescriptionChange,
  skillProficiencies,
  onSkillProficienciesChange,
  toolProficiencies,
  onToolProficienciesChange,
  equipment,
  onEquipmentChange,
  featureTitle,
  onFeatureTitleChange,
  featureDescription,
  onFeatureDescriptionChange,
  personalization,
  onPersonalizationChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="text-lg font-semibold text-gray-900">Добавить предысторию</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Название"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={nameEn}
          onChange={(e) => onNameEnChange(e.target.value)}
          placeholder="Название (EN) (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          placeholder="Источник (опционально)"
          list={sourceListId}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={skillProficiencies}
          onChange={(e) => onSkillProficienciesChange(e.target.value)}
          placeholder="Владение навыками"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={toolProficiencies}
          onChange={(e) => onToolProficienciesChange(e.target.value)}
          placeholder="Владение инструментами"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={equipment}
          onChange={(e) => onEquipmentChange(e.target.value)}
          placeholder="Снаряжение"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="md:col-span-2">
          <TokenHint value={source} options={sourceOptions} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-900">Описание</div>
        <SpellDescriptionEditor value={description} onChange={onDescriptionChange} />
      </div>

      <input
        value={featureTitle}
        onChange={(e) => onFeatureTitleChange(e.target.value)}
        placeholder="Заголовок умения"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <textarea
        value={featureDescription}
        onChange={(e) => onFeatureDescriptionChange(e.target.value)}
        rows={5}
        placeholder="Описание умения"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <textarea
        value={personalization}
        onChange={(e) => onPersonalizationChange(e.target.value)}
        rows={5}
        placeholder="Персонализация"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <div>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
          Добавить
        </button>
      </div>
    </form>
  );
}
