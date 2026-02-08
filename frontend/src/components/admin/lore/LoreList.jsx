import LoreItemRow from './LoreItemRow.jsx';

export default function LoreList({
  loading,
  items,
  shouldScroll,
  editingId,
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
    <div className="bg-white rounded-lg shadow-sm border">
      {loading ? (
        <div className="p-6 text-gray-700">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-gray-700">Записей пока нет.</div>
      ) : (
        <div className={`divide-y divide-gray-200 ${shouldScroll ? 'max-h-[36rem] overflow-y-auto' : ''}`}>
          {items.map((post) => (
            <LoreItemRow
              key={post.id}
              post={post}
              isEditing={editingId === post.id}
              formatDate={formatDate}
              onStartEdit={onStartEdit}
              onDelete={onDelete}
              editTitle={editTitle}
              onEditTitleChange={onEditTitleChange}
              editYear={editYear}
              onEditYearChange={onEditYearChange}
              editLocations={editLocations}
              onEditLocationsChange={onEditLocationsChange}
              locationDatalistId={locationDatalistId}
              locationOptions={locationOptions}
              editExcerpt={editExcerpt}
              onEditExcerptChange={onEditExcerptChange}
              editContent={editContent}
              onEditContentChange={onEditContentChange}
              editStatus={editStatus}
              onEditStatusChange={onEditStatusChange}
              onSave={onSave}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
