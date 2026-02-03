import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { API_URL } from '../../lib/config.js';

export default function RegisterEditorPage() {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    nickname: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();

  const onChange = (name) => (e) => setFormData((p) => ({ ...p, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOk(false);
    setLoading(true);

    try {
      const token = (() => {
        try {
          return localStorage.getItem('token');
        } catch {
          return null;
        }
      })();

      if (!token) {
        throw new Error('Нужно войти под админом, чтобы создать редактора');
      }

      const res = await fetch(`${API_URL}/auth/register-editor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          login: String(formData.login || '').trim(),
          password: String(formData.password || ''),
          nickname: String(formData.nickname || '').trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || 'Ошибка регистрации');
      }

      setOk(true);
      setTimeout(() => navigate('/admin/login', { replace: true }), 700);
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 w-full max-w-md border border-purple-500/30">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-white block mb-2">
            <span className="text-purple-400">EOTD20</span> Wiki
          </Link>
          <p className="text-gray-300">Регистрация редактора</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {ok && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-100 px-4 py-3 rounded-lg mb-6">
            Аккаунт создан. Перенаправляю на вход…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login" className="block text-sm font-medium text-gray-300 mb-2">
              Логин
            </label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={onChange('login')}
              required
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="editor"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-2">
              Никнейм
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={onChange('nickname')}
              required
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Мой ник"
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
              onChange={onChange('password')}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <div className="mt-1 text-xs text-gray-400">Минимум 6 символов.</div>
          </div>

          <div className="text-xs text-gray-400">
            Создание редактора доступно только после входа администратором.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            {loading ? 'Создаю…' : 'Создать аккаунт редактора'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/admin/login" className="text-sm text-gray-300 hover:text-white transition-colors">
            Уже есть аккаунт? Войти
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
