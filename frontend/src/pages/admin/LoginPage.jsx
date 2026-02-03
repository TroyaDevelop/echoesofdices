import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../lib/api.js';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authAPI.login(formData.login, formData.password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/admin', { replace: true });
    } catch (e) {
      console.error('Login error:', e);
      setError(e.message || 'Ошибка входа');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 w-full max-w-md border border-purple-500/30">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-white block mb-2">
            <span className="text-purple-400">EOTD20</span> Wiki
          </Link>
          <p className="text-gray-300">Вход в админ-панель</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="login" className="block text-sm font-medium text-gray-300 mb-2">
              Логин
            </label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={(e) => setFormData((p) => ({ ...p, login: e.target.value }))}
              required
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              required
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-purple-500/30">
          <p className="text-xs text-gray-500 text-center">Дефолтный админ: admin / admin123</p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/admin/register" className="text-sm text-gray-300 hover:text-white transition-colors">
            Регистрация редактора
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
