export default function RegistrationKeysSection({
  activeKeysCount,
  creatingKey,
  onCreateKey,
  loading,
  keys,
  shouldScroll,
  formatDate,
}) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Ключи регистрации</h2>
          <div className="text-sm text-gray-600 mt-1">Активных ключей: {activeKeysCount}</div>
        </div>
        <button
          type="button"
          onClick={onCreateKey}
          disabled={creatingKey}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300"
        >
          {creatingKey ? 'Создаю…' : 'Создать ключ'}
        </button>
      </div>

      {loading ? (
        <div className="mt-4 text-gray-600">Загрузка…</div>
      ) : keys.length === 0 ? (
        <div className="mt-4 text-gray-600">Пока нет ключей.</div>
      ) : (
        <div className={`mt-4 overflow-x-auto ${shouldScroll ? 'max-h-[16rem] overflow-y-auto' : ''}`}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Ключ</th>
                <th className="py-2 pr-4">Статус</th>
                <th className="py-2 pr-4">Создан</th>
                <th className="py-2 pr-4">Использован</th>
                <th className="py-2 pr-4">Кем</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {keys.map((keyItem) => {
                const used = Boolean(keyItem.used_at);
                const active = Number(keyItem.is_active) === 1 && !used;
                return (
                  <tr key={keyItem.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs break-all">{keyItem.key}</td>
                    <td className="py-2 pr-4">
                      {active ? (
                        <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">активен</span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-gray-50 border border-gray-200 text-gray-600">использован</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">{formatDate(keyItem.created_at)}</td>
                    <td className="py-2 pr-4">{keyItem.used_at ? formatDate(keyItem.used_at) : '—'}</td>
                    <td className="py-2 pr-4">{keyItem.used_by_login || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
