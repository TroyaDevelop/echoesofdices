import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

const navLinkClass = ({ isActive }) =>
  `block w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-purple-500/20 text-purple-200' : 'text-slate-200 hover:bg-white/10'
  }`;

const brandNode = (
  <>
    <span className="text-purple-300">Echoes</span> of Dices
  </>
);

export default function PublicLayout({ children }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

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

  const NavItems = ({ onNavigate }) => (
    <>
      <NavLink to="/news" className={navLinkClass} onClick={onNavigate}>
        Новости
      </NavLink>
      <NavLink to="/spells" className={navLinkClass} onClick={onNavigate}>
        Заклинания
      </NavLink>
      <NavLink to="/market" className={navLinkClass} onClick={onNavigate}>
        Рынок
      </NavLink>
    </>
  );

  const AuthItems = ({ onNavigate }) =>
    user ? (
      <div className="space-y-2">
        <div className="text-xs text-slate-300">{user.login}</div>
        {canSeeAdmin ? (
          <Link
            to="/admin"
            onClick={onNavigate}
            className="block w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
          >
            Админка
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => {
            handleLogout();
            onNavigate?.();
          }}
          className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
        >
          Выйти
        </button>
      </div>
    ) : (
      <div className="space-y-2">
        <Link
          to="/login"
          onClick={onNavigate}
          className="block w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
        >
          Войти
        </Link>
        <Link
          to="/register"
          onClick={onNavigate}
          className="block w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
        >
          Регистрация
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-950 to-purple-950 text-slate-100">
      {/* Mobile top bar */}
      <div className="md:hidden border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 transition-colors"
            aria-label="Открыть меню"
            title="Меню"
          >
            <span className="block text-lg leading-none">☰</span>
          </button>

          <Link to="/news" className="text-lg font-bold tracking-wide">
            {brandNode}
          </Link>

          {user ? <div className="ml-auto text-xs text-slate-300 truncate max-w-[40%]">{user.login}</div> : <div className="ml-auto" />}
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition ${mobileMenuOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-72 border-r border-white/10 bg-slate-950/95 backdrop-blur p-4 transition-transform flex flex-col min-h-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <Link to="/news" className="text-lg font-bold tracking-wide" onClick={() => setMobileMenuOpen(false)}>
              {brandNode}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 transition-colors"
              aria-label="Закрыть меню"
              title="Закрыть"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 space-y-1 flex-1 overflow-y-auto">
            <NavItems onNavigate={() => setMobileMenuOpen(false)} />
          </div>

          <div className="mt-auto pt-4 border-t border-white/10">
            <AuthItems onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </aside>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:flex-col w-64 border-r border-white/10 bg-black/20 backdrop-blur min-h-screen sticky top-0">
          <div className="px-4 py-5">
            <Link to="/news" className="text-xl font-bold tracking-wide">
              {brandNode}
            </Link>
          </div>

          <nav className="px-3 space-y-1">
            <NavItems />
          </nav>

          <div className="mt-auto px-3 py-4 border-t border-white/10">
            <AuthItems />
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">{children}</main>

          <footer className="border-t border-white/10 bg-black/30">
            <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-400">
              © {new Date().getFullYear()} Echoes of Dices
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
