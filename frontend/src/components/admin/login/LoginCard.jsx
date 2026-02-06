import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginCard({
  login,
  password,
  loading,
  error,
  onLoginChange,
  onPasswordChange,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 w-full max-w-md border border-purple-500/30">
      <div className="text-center mb-8">
        <Link to="/" className="text-3xl font-bold text-white block mb-2">
          <span className="text-purple-400">Echoes</span> of Dices
        </Link>
        <p className="text-gray-300">Вход</p>
      </div>

      {error ? (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="login" className="block text-sm font-medium text-gray-300 mb-2">
            Логин
          </label>
          <input
            type="text"
            id="login"
            name="login"
            value={login}
            onChange={onLoginChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="логин"
            autoComplete="username"
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
              value={password}
              onChange={onPasswordChange}
              required
              className="w-full px-4 py-3 pr-12 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              autoComplete="current-password"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link to="/register" className="text-sm text-gray-300 hover:text-white transition-colors">
          Регистрация (нужен ключ)
        </Link>
      </div>

      <div className="mt-6 text-center">
        <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
