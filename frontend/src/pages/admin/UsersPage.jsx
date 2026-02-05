import { useEffect, useMemo, useState } from 'react';

import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { adminAPI } from '../../lib/api.js';

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value || '');
  }
};

export default function AdminUsersPage() {
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [keys, setKeys] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null, busy: false });

  const loadAll = async () => {
    setError('');
    setLoading(true);
    try {
      const [keysData, usersData] = await Promise.all([adminAPI.listRegistrationKeys(), adminAPI.listUsers()]);
      setKeys(Array.isArray(keysData) ? keysData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      const role = parsed ? String(parsed?.role || '').toLowerCase() : '';
      setCurrentUserRole(role);
      const id = parsed?.id;
      setCurrentUserId(Number.isFinite(Number(id)) ? Number(id) : null);
      if (role !== 'editor') {
        setLoading(false);
        return;
      }
    } catch {
      setLoading(false);
      return;
    }

    loadAll();
  }, []);

  const createKey = async () => {
    setError('');
    setCreatingKey(true);
    try {
      await adminAPI.createRegistrationKey();
      await loadAll();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка создания ключа');
    } finally {
      setCreatingKey(false);
    }
  };

  const toggleEditor = async (u) => {
    setError('');
    try {
      const nextRole = String(u.role).toLowerCase() === 'editor' ? 'user' : 'editor';
      await adminAPI.setUserRole(u.id, nextRole);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: nextRole } : x)));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка изменения роли');
    }
  };

  const activeKeys = useMemo(() => keys.filter((k) => Number(k.is_active) === 1 && !k.used_at), [keys]);
  const shouldScrollKeys = useMemo(() => keys.length > 5, [keys.length]);
  const visibleUsers = useMemo(() => {
    const hiddenLogins = new Set(['echoesroot']);
    return (users || []).filter((u) => {
      const id = Number(u?.id);
      const login = String(u?.login || '').trim();
      if (login && hiddenLogins.has(login)) return false;
      if (Number.isFinite(Number(currentUserId)) && Number.isFinite(id) && id === Number(currentUserId)) return false;
      return true;
    });
  }, [users, currentUserId]);
  const shouldScrollUsers = useMemo(() => visibleUsers.length > 5, [visibleUsers.length]);

  const askDelete = (u) => {
    setError('');
    setDeleteModal({ open: true, user: u, busy: false });
  };

  const cancelDelete = () => setDeleteModal({ open: false, user: null, busy: false });

  const confirmDelete = async () => {
    const u = deleteModal.user;
    if (!u) return;
    setError('');
    setDeleteModal((p) => ({ ...p, busy: true }));
    try {
      await adminAPI.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setDeleteModal({ open: false, user: null, busy: false });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления пользователя');
      setDeleteModal((p) => ({ ...p, busy: false }));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Пользователи и ключи</h1>
          <p className="text-gray-600">Ключи нужны для регистрации. Роль editor даёт доступ в админку.</p>
        </div>

        {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">{error}</div>}

        {currentUserRole !== 'editor' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-gray-700">
            Нет доступа. Этот раздел доступен только редактору.
          </div>
        ) : null}

        {currentUserRole === 'editor' ? (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Ключи регистрации</h2>
              <div className="text-sm text-gray-600 mt-1">Активных ключей: {activeKeys.length}</div>
            </div>
            <button
              type="button"
              onClick={createKey}
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
            <div className={`mt-4 overflow-x-auto ${shouldScrollKeys ? 'max-h-[16rem] overflow-y-auto' : ''}`}>
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
                  {keys.map((k) => {
                    const used = Boolean(k.used_at);
                    const active = Number(k.is_active) === 1 && !used;
                    return (
                      <tr key={k.id} className="border-t border-gray-100">
                        <td className="py-2 pr-4 font-mono text-xs break-all">{k.key}</td>
                        <td className="py-2 pr-4">
                          {active ? (
                            <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">активен</span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-gray-50 border border-gray-200 text-gray-600">использован</span>
                          )}
                        </td>
                        <td className="py-2 pr-4">{formatDate(k.created_at)}</td>
                        <td className="py-2 pr-4">{k.used_at ? formatDate(k.used_at) : '—'}</td>
                        <td className="py-2 pr-4">{k.used_by_login || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        ) : null}

        {currentUserRole === 'editor' ? (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Пользователи</h2>
            <div className="text-sm text-gray-600 mt-1">Всего: {visibleUsers.length}</div>
          </div>

          {loading ? (
            <div className="mt-4 text-gray-600">Загрузка…</div>
          ) : visibleUsers.length === 0 ? (
            <div className="mt-4 text-gray-600">Пока нет пользователей.</div>
          ) : (
            <div className={`mt-4 overflow-x-auto ${shouldScrollUsers ? 'max-h-[15rem] overflow-y-auto' : ''}`}>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-4">Логин</th>
                    <th className="py-2 pr-4">Ник</th>
                    <th className="py-2 pr-4">Роль</th>
                    <th className="py-2 pr-4">Создан</th>
                    <th className="py-2 pr-4"></th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {visibleUsers.map((u) => {
                    const role = String(u.role || '').toLowerCase();
                    const isEditor = role === 'editor';

                    return (
                      <tr key={u.id} className="border-t border-gray-100">
                        <td className="py-2 pr-4 font-medium">{u.login}</td>
                        <td className="py-2 pr-4">{u.nickname || '—'}</td>
                        <td className="py-2 pr-4">
                          <span className="px-2 py-1 rounded bg-gray-50 border border-gray-200 text-gray-700">{role || '—'}</span>
                        </td>
                        <td className="py-2 pr-4">{formatDate(u.created_at)}</td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={false}
                              onClick={() => toggleEditor(u)}
                              className={`px-3 py-1.5 rounded-lg border text-sm ${
                                isEditor
                                  ? 'bg-white border-red-200 text-red-700 hover:bg-red-50'
                                  : 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {isEditor ? 'Забрать editor' : 'Выдать editor'}
                            </button>
                            <button
                              type="button"
                              onClick={() => askDelete(u)}
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
        ) : null}

        {deleteModal.open ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={cancelDelete} />
            <div className="relative w-full max-w-sm rounded-xl bg-white shadow-xl border border-gray-200 p-5">
              <div className="text-lg font-semibold text-gray-900">Вы уверены?</div>
              <div className="mt-2 text-sm text-gray-600">
                Удалить пользователя <span className="font-medium text-gray-900">{deleteModal.user?.login}</span>?
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={deleteModal.busy}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Нет
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteModal.busy}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteModal.busy ? 'Удаляю…' : 'Да'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
