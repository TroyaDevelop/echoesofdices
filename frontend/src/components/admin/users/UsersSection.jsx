export default function UsersSection({
  loading,
  users,
  shouldScroll,
  formatDate,
  onChangeFlags,
  onAskDelete,
  onManageAwards,
}) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Пользователи</h2>
        <div className="text-sm text-gray-600 mt-1">Всего: {users.length}</div>
      </div>

      {loading ? (
        <div className="mt-4 text-gray-600">Загрузка…</div>
      ) : users.length === 0 ? (
        <div className="mt-4 text-gray-600">Пока нет пользователей.</div>
      ) : (
        <div className={`mt-4 overflow-x-auto ${shouldScroll ? 'max-h-[15rem] overflow-y-auto' : ''}`}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Логин</th>
                <th className="py-2 pr-4">Ник</th>
                <th className="py-2 pr-4">Флаги</th>
                <th className="py-2 pr-4">Создан</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {users.map((user) => {
                const toBool = (value) => value === true || value === 1 || String(value || '').toLowerCase() === 'true';
                const flags = {
                  admin: toBool(user?.flag_admin ?? user?.flags?.admin),
                  editor: toBool(user?.flag_editor ?? user?.flags?.editor),
                  master: toBool(user?.flag_master ?? user?.flags?.master),
                };

                const toggleFlag = (name) => {
                  onChangeFlags(user, { ...flags, [name]: !flags[name] });
                };

                return (
                  <tr key={user.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 font-medium">{user.login}</td>
                    <td className="py-2 pr-4">{user.nickname || '—'}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-3 text-xs">
                        <label className="inline-flex items-center gap-1">
                          <input type="checkbox" checked={flags.admin} onChange={() => toggleFlag('admin')} />
                          Админ
                        </label>
                        <label className="inline-flex items-center gap-1">
                          <input type="checkbox" checked={flags.editor} onChange={() => toggleFlag('editor')} />
                          Редактор
                        </label>
                        <label className="inline-flex items-center gap-1">
                          <input type="checkbox" checked={flags.master} onChange={() => toggleFlag('master')} />
                          Мастер
                        </label>
                      </div>
                    </td>
                    <td className="py-2 pr-4">{formatDate(user.created_at)}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onManageAwards(user)}
                          className="px-3 py-1.5 rounded-lg border border-amber-200 text-sm text-amber-700 hover:bg-amber-50"
                        >
                          Награды
                        </button>
                        <button
                          type="button"
                          onClick={() => onAskDelete(user)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-sm text-red-700 hover:bg-red-50"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
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
