import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-purple-500/20 text-purple-200' : 'text-slate-200 hover:bg-white/10'
  }`;

export default function PublicLayout({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) {
          setUser(null);
          return;
        }
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    };

    load();
    const onAuthChange = () => load();
    window.addEventListener('auth:logout', onAuthChange);
    window.addEventListener('auth:login', onAuthChange);
    return () => {
      window.removeEventListener('auth:logout', onAuthChange);
      window.removeEventListener('auth:login', onAuthChange);
    };
  }, []);

  const canSeeAdmin = useMemo(() => {
    const role = String(user?.role || '').toLowerCase();
    return role === 'editor';
  }, [user]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
    }
    try {
      window.dispatchEvent(new Event('auth:logout'));
    } catch {
    }
    navigate('/news', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-purple-950 text-slate-100">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/news" className="text-lg sm:text-xl font-bold tracking-wide">
            <span className="text-purple-300">EOTD20</span> Site
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/news" className={navLinkClass}>
              Новости
            </NavLink>
            <NavLink to="/spells" className={navLinkClass}>
              Заклинания
            </NavLink>

            {user ? (
              <div className="flex items-center gap-2 ml-1">
                <span className="text-xs text-slate-300 hidden sm:inline">{user.login}</span>
                {canSeeAdmin ? (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    Админка
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>

      <footer className="border-t border-white/10 bg-black/30">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-400">
          © {new Date().getFullYear()} EOTD20
        </div>
      </footer>
    </div>
  );
}
