import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { authAPI } from '../lib/api.js';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    login: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    key: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const onChange = (name) => (e) => setFormData((p) => ({ ...p, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOk(false);
    setLoading(true);

    if (String(formData.password || '') !== String(formData.confirmPassword || '')) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      await authAPI.register({
        login: String(formData.login || '').trim(),
        nickname: String(formData.nickname || '').trim(),
        password: String(formData.password || ''),
        key: String(formData.key || '').trim(),
      });

      setOk(true);
      setTimeout(() => navigate('/login', { replace: true }), 800);
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
          <Link to="/news" className="text-3xl font-bold text-white block mb-2">
            <span className="text-purple-400">Echoes</span> of Dices
          </Link>
          <p className="text-gray-300">Регистрация</p>
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
              placeholder="user"
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={onChange('password')}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-400">Минимум 6 символов.</div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Подтвердите пароль
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={onChange('confirmPassword')}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="key" className="block text-sm font-medium text-gray-300 mb-2">
              Ключ регистрации
            </label>
            <input
              type="text"
              id="key"
              name="key"
              value={formData.key}
              onChange={onChange('key')}
              required
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="введите ключ"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            {loading ? 'Создаю…' : 'Создать аккаунт'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
            Уже есть аккаунт? Войти
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/news" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Вернуться на сайт
          </Link>
        </div>
      </div>
    </div>
  );
}
