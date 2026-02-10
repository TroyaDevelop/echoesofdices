import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginCard from '../../components/admin/login/LoginCard.jsx';
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
      try {
        window.dispatchEvent(new Event('auth:login'));
      } catch {
      }
      const role = String(data?.user?.role || '').toLowerCase();
      if (role === 'editor' || role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/news', { replace: true });
      }
    } catch (e) {
      console.error('Login error:', e);
      setError(e.message || 'Ошибка входа');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <LoginCard
        login={formData.login}
        password={formData.password}
        loading={loading}
        error={error}
        onLoginChange={(e) => setFormData((p) => ({ ...p, login: e.target.value }))}
        onPasswordChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
