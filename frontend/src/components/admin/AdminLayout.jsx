import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { authAPI } from '../../lib/api.js';

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const logoutAndRedirect = (target = '/login') => {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {
      }
      navigate(target, { replace: true });
    };

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      logoutAndRedirect();
      return () => {};
    }

    try {
      const parsedUser = JSON.parse(userData);
      const role = String(parsedUser?.role || '').toLowerCase();
      if (role !== 'editor') {
        logoutAndRedirect('/news');
        return () => {};
      }
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      logoutAndRedirect();
      return () => {};
    }

    let isActive = true;
    authAPI.verify().catch((e) => {
      if (!isActive) return;
      console.error(e);
      logoutAndRedirect();
    });

    const onAuthLogout = () => logoutAndRedirect();
    window.addEventListener('auth:logout', onAuthLogout);

    return () => {
      isActive = false;
      window.removeEventListener('auth:logout', onAuthLogout);
    };
  }, [navigate]);

  const navigation = useMemo(() => {
    return [
      {
        label: 'Основное',
        items: [
          {
            name: 'Панель управления',
            href: '/admin',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                ></path>
              </svg>
            ),
          },
        ],
      },
      {
        label: 'Компендиум',
        items: [
          {
            name: 'Заклинания',
            href: '/admin/spells',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 2l1.09 3.09L16 6l-2.91 1.09L12 10l-1.09-2.91L8 6l2.91-.91L12 2zm7 9l.73 2.07L22 14l-2.27.93L19 17l-.73-2.07L16 14l2.27-.93L19 11zM4 13l.73 2.07L7 16l-2.27.93L4 19l-.73-2.07L1 16l2.27-.93L4 13z"
                ></path>
              </svg>
            ),
          },
          {
            name: 'Чудесные предметы',
            href: '/admin/wondrous-items',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 7l-8-4-8 4v10l8 4 8-4V7z"
                ></path>
              </svg>
            ),
          },
          {
            name: 'Черты',
            href: '/admin/traits',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 2l3 7h7l-5.5 4 2.5 7-7-4.5L5 20l2.5-7L2 9h7l3-7z"
                ></path>
              </svg>
            ),
          },
          {
            name: 'Рынок',
            href: '/admin/market',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7H19M7 13h0m10 0h0M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
                ></path>
              </svg>
            ),
          },
        ],
      },
      {
        label: 'Архив',
        items: [
          {
            name: 'Статьи',
            href: '/admin/articles',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14-4H5m14 8H5m2 4h10"
                ></path>
              </svg>
            ),
          },
          {
            name: 'Лор',
            href: '/admin/lore',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                ></path>
              </svg>
            ),
          },
        ],
      },
      {
        label: 'Управление',
        items: [
          {
            name: 'Новости',
            href: '/admin/news',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4h4m-4 4h4M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                ></path>
              </svg>
            ),
          },
          {
            name: 'Утилиты',
            href: '/admin/utilities',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.75 3a6.75 6.75 0 014.243 12.01l-1.596 1.596a.75.75 0 01-1.06 0l-.22-.22a.75.75 0 00-1.06 0l-.22.22a.75.75 0 01-1.06 0l-.22-.22a.75.75 0 00-1.06 0l-.22.22a.75.75 0 01-1.06 0L4.5 15.01A6.75 6.75 0 019.75 3z"
                ></path>
              </svg>
            ),
          },
          {
            name: 'Пользователи',
            href: '/admin/users',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a4 4 0 00-4-4h-1m-4 6H2v-2a4 4 0 014-4h7m4-4a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            ),
          },
        ],
      },
    ];
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login', { replace: true });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  const pathname = location.pathname;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Link to="/" className="text-xl font-bold text-gray-900">
                <span className="text-purple-600">Echoes</span> of Dices
              </Link>
            </div>
            <nav className="mt-5 px-2 space-y-4">
              {navigation.map((section) => (
                <div key={section.label} className="space-y-1">
                  <div className="px-2 text-[11px] uppercase tracking-wider text-gray-400">{section.label}</div>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          isActive
                            ? 'bg-purple-100 text-purple-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      >
                        <span
                          className={`${isActive ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'} mr-3 flex-shrink-0`}
                        >
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link to="/" className="text-xl font-bold text-gray-900">
                <span className="text-purple-600">Echoes</span> of Dices
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-4">
              {navigation.map((section) => (
                <div key={section.label} className="space-y-1">
                  <div className="px-2 text-[11px] uppercase tracking-wider text-gray-400">{section.label}</div>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          isActive
                            ? 'bg-purple-100 text-purple-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      >
                        <span
                          className={`${isActive ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'} mr-3 flex-shrink-0`}
                        >
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{String(user.login || '?').charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{user.login}</p>
                  <p className="text-xs text-gray-500">роль: {String(user.role || '—')}</p>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-medium text-gray-500 group-hover:text-gray-700"
                  >
                    Выйти
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
