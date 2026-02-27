import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const hasToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    return true;
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
