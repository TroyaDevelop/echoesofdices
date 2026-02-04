import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Админ-панель</h1>
          <p className="text-gray-600">Управляйте контентом.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/news" className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white hover:opacity-95 transition-opacity">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4h4m-4 4h4M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                  ></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Новости</h3>
                <p className="text-purple-100">Публикации и черновики</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/spells" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white hover:opacity-95 transition-opacity">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 2l1.09 3.09L16 6l-2.91 1.09L12 10l-1.09-2.91L8 6l2.91-.91L12 2zm7 9l.73 2.07L22 14l-2.27.93L19 17l-.73-2.07L16 14l2.27-.93L19 11zM4 13l.73 2.07L7 16l-2.27.93L4 19l-.73-2.07L1 16l2.27-.93L4 13z"
                  ></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Заклинания</h3>
                <p className="text-blue-100">Справочник и сортировка</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/users" className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white hover:opacity-95 transition-opacity md:col-span-2">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a4 4 0 00-4-4h-1m-4 6H2v-2a4 4 0 014-4h7m4-4a4 4 0 11-8 0 4 4 0 018 0z"
                  ></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Пользователи и ключи</h3>
                <p className="text-emerald-100">Ключи регистрации и выдача editor</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Подсказка</h2>
          <p className="text-gray-600">Создано под тиранией Миюки.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
