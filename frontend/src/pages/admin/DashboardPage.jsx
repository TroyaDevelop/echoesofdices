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

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Подсказка</h2>
          <p className="text-gray-600">Создано под тиранией Миюки.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
