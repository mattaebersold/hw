import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { serverUrl } from '../services/api';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function Onboarding() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', bio: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!USERNAME_RE.test(form.username)) {
      return setError('Username must be 3–20 characters (letters, numbers, underscores only)');
    }
    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/auth/onboard`, form, { withCredentials: true });
      setUser(res.data.user);
      navigate(`/profile/${res.data.user._id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Choose your username</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          This is how you'll appear to other collectors.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">@</span>
              <input
                required
                autoFocus
                placeholder="username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                maxLength={20}
                className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl pl-7 pr-3 py-2.5 focus:outline-none focus:border-gray-500 placeholder-gray-500"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 px-1">3–20 characters · letters, numbers, underscores</p>
          </div>

          <textarea
            rows={3}
            placeholder="Bio (optional) — tell collectors about yourself…"
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-gray-500 placeholder-gray-500 resize-none"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || form.username.length < 3}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
