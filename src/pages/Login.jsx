import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serverUrl } from '../services/api';
import axios from 'axios';

export default function Login() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && form.password !== form.confirm) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      await axios.post(`${serverUrl}${endpoint}`, {
        name: form.name,
        email: form.email,
        password: form.password,
      }, { withCredentials: true });
      await refreshUser();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h1>

        {/* Google */}
        <a
          href={`${serverUrl}/auth/google`}
          className="flex items-center justify-center gap-2 w-full bg-white text-gray-900 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-600 text-xs">or</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input
              required
              placeholder="Your name"
              {...field('name')}
              className={inputCls}
            />
          )}
          <input
            required
            type="email"
            placeholder="Email address"
            {...field('email')}
            className={inputCls}
          />
          <input
            required
            type="password"
            placeholder="Password"
            minLength={8}
            {...field('password')}
            className={inputCls}
          />
          {mode === 'register' && (
            <input
              required
              type="password"
              placeholder="Confirm password"
              {...field('confirm')}
              className={inputCls}
            />
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            {loading ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'login' ? (
            <>No account? <button onClick={() => { setMode('register'); setError(''); }} className="text-red-400 hover:text-red-300 transition-colors">Create one</button></>
          ) : (
            <>Already have one? <button onClick={() => { setMode('login'); setError(''); }} className="text-red-400 hover:text-red-300 transition-colors">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-gray-500 placeholder-gray-500';
