export default function ConfirmModal({
  open,
  title,
  message,
  cancelLabel = 'Нет',
  confirmLabel = 'Да',
  busy,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-xl bg-white shadow-xl border border-gray-200 p-5">
        <div className="text-lg font-semibold text-gray-900">{title}</div>
        {message ? <div className="mt-2 text-sm text-gray-600">{message}</div> : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? 'Удаляю…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
