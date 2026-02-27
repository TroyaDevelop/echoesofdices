import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const hasToken = () => {
  try {
    return Boolean(localStorage.getItem('token'));
  } catch {
    return false;
  }
};

export default function RequireAuth({ children, redirectTo = '/login' }) {
  const [authorized, setAuthorized] = useState(() => hasToken());

  useEffect(() => {
    const sync = () => setAuthorized(hasToken());
    window.addEventListener('auth:login', sync);
    window.addEventListener('auth:logout', sync);
    return () => {
      window.removeEventListener('auth:login', sync);
      window.removeEventListener('auth:logout', sync);
    };
  }, []);

  if (!authorized) return <Navigate to={redirectTo} replace />;
  return children;
}
