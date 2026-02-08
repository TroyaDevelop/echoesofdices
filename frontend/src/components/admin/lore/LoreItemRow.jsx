import SpellDescriptionEditor from '../SpellDescriptionEditor.jsx';
import TokenHint from '../TokenHint.jsx';

export default function LoreItemRow({
  post,
  isEditing,
  formatDate,
  onStartEdit,
  onDelete,
  editTitle,
  onEditTitleChange,
  editYear,
  onEditYearChange,
  editLocations,
  onEditLocationsChange,
  locationDatalistId,
  locationOptions,
  editExcerpt,
  onEditExcerptChange,
  editContent,
  onEditContentChange,
  editStatus,
  onEditStatusChange,
  onSave,
  onCancel,
}) {
  return (
    <div className="p-4 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="font-semibold text-gray-900 truncate">{post.title}</div>
          {Number.isFinite(Number(post.year)) ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {Math.trunc(Number(post.year))}
            </span>
          ) : null}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {post.status === 'published' ? 'Опубликовано' : 'Черновик'}
          </span>
          <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
        </div>

        {post.excerpt && <div className="text-sm text-gray-600 mt-1">{post.excerpt}</div>}
        {post.locations ? (
          <div className="text-xs text-gray-500 mt-1">Места действия: {post.locations}</div>
        ) : null}

        {isEditing ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm font-semibold text-gray-900">Редактирование</div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Статус</label>
                <select
                  value={editStatus}
                  onChange={onEditStatusChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="published">Опубликовано</option>
                  <option value="draft">Черновик</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3">
              <input
                value={editTitle}
                onChange={onEditTitleChange}
                placeholder="Заголовок"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                value={editYear}
                onChange={onEditYearChange}
                placeholder="Год события"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                inputMode="numeric"
              />
            </div>

            <input
              value={editLocations}
              onChange={onEditLocationsChange}
              placeholder="Места действия (через запятую)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              list={locationDatalistId}
            />

            <TokenHint value={editLocations} options={locationOptions} />

            <input
              value={editExcerpt}
              onChange={onEditExcerptChange}
              placeholder="Короткое описание (опционально)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <SpellDescriptionEditor value={editContent} onChange={onEditContentChange} placeholder="Текст" />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSave(post.id)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {isEditing ? null : (
          <button onClick={() => onStartEdit(post)} className="text-gray-700 hover:text-gray-900 font-medium text-sm">
            Редактировать
          </button>
        )}
        <button onClick={() => onDelete(post.id)} className="text-red-600 hover:text-red-900 font-medium text-sm">
          Удалить
        </button>
      </div>
    </div>
  );
}
