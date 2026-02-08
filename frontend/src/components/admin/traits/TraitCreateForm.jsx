import SpellDescriptionEditor from '../SpellDescriptionEditor.jsx';
import TokenHint from '../TokenHint.jsx';

export default function TraitCreateForm({
  name,
  onNameChange,
  nameEn,
  onNameEnChange,
  requirements,
  onRequirementsChange,
  source,
  onSourceChange,
  sourceListId,
  sourceOptions,
  description,
  onDescriptionChange,
  hasEotVariant,
  onHasEotVariantChange,
  descriptionEot,
  onDescriptionEotChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="text-lg font-semibold text-gray-900">Добавить черту</div>

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
          value={requirements}
          onChange={(e) => onRequirementsChange(e.target.value)}
          placeholder="Требования (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          placeholder="Источник (опционально)"
          list={sourceListId}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="md:col-span-2">
          <TokenHint value={source} options={sourceOptions} />
        </div>

      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm font-semibold text-gray-900">Описание</div>
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => onHasEotVariantChange(false)}
            className={
              hasEotVariant
                ? 'px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-white'
                : 'px-3 py-1.5 rounded-md text-sm font-semibold bg-white text-gray-900 shadow-sm'
            }
          >
            Оригинал
          </button>
          <button
            type="button"
            onClick={() => onHasEotVariantChange(true)}
            className={
              hasEotVariant
                ? 'px-3 py-1.5 rounded-md text-sm font-semibold bg-white text-gray-900 shadow-sm'
                : 'px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-white'
            }
          >
            EoT
          </button>
        </div>
      </div>
      <SpellDescriptionEditor value={description} onChange={onDescriptionChange} />

      {hasEotVariant ? (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900">Описание (EoT) (опционально)</div>
          <SpellDescriptionEditor value={descriptionEot} onChange={onDescriptionEotChange} />
        </div>
      ) : null}

      <div>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
          Добавить
        </button>
      </div>
    </form>
  );
}
